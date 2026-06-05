import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Download,
  FileAudio,
  Loader2,
  Music4,
  Pause,
  Play,
  Settings2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { audioToMidiNotes, type AudioToMidiProgress } from "@/lib/audioToMidi/basicPitch";
import {
  estimateProfile,
  PROFILE_PRESETS,
  type AudioProfile,
  type ProfileThresholds,
} from "@/lib/audioToMidi/profile";
import { runPostProcessPipeline } from "@/lib/audioToMidi/postProcess";
import { analyzeAudioFile, type KeyResult, type BpmResult } from "@/lib/audioAnalysis";
import { notesToMidiBlob, downloadBlob, type NoteEvent } from "@/lib/musicTheory/midiExport";
import { playNoteHandle, getAudioContext, type NoteHandle } from "@/lib/musicTheory/audio";
import { AUDIO_ACCEPT, isLikelyAudioFile } from "@/lib/audioFileInput";



interface AudioToMidiProps {
  uploadTitle?: string;
  uploadAnalyzingTitle?: string;
  uploadDescription?: string;
}

const AudioToMidi = ({
  uploadTitle,
  uploadAnalyzingTitle,
  uploadDescription,
}: AudioToMidiProps) => {
  const { t } = useTranslation();
  const STAGE_LABEL: Record<AudioToMidiProgress["stage"], string> = {
    decoding: t("audio2midi.stages.decoding"),
    "loading-model": t("audio2midi.stages.loading-model"),
    running: t("audio2midi.stages.running"),
    post: t("audio2midi.stages.post"),
    done: t("audio2midi.stages.done"),
  };
  const _uploadTitle = uploadTitle ?? t("audio2midi.upload.title");
  const _uploadAnalyzing = uploadAnalyzingTitle ?? t("audio2midi.upload.analyzing");
  const _uploadDescription = uploadDescription ?? t("audio2midi.upload.description");
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<AudioToMidiProgress>({ stage: "decoding", percent: 0 });
  const [displayPercent, setDisplayPercent] = useState(0);
  // `notes` is derived (useMemo) from rawNotesCache + pp toggles. See below.
  const [durationSec, setDurationSec] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [playheadSec, setPlayheadSec] = useState(0);
  const playheadRef = useRef(0);
  const hoverRef = useRef<number | null>(null);
  const transportRef = useRef<{
    startedAtCtx: number;
    startedAtSec: number;
    sources: { stop: () => void }[];
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Default thresholds (overridden once profile is detected)
  const [thresholds, setThresholds] = useState<ProfileThresholds>(PROFILE_PRESETS["piano-clean"]);
  const [profile, setProfile] = useState<AudioProfile>("piano-clean");
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [bpmResult, setBpmResult] = useState<BpmResult | null>(null);
  const [rawNotesCache, setRawNotesCache] = useState<NoteEvent[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [pp, setPp] = useState({
    octaveGhost: true,
    hardenedMerge: true,
    snapToGrid: true,
    tonalFilter: true,
  });
  const includeBends = false;

  // Single source of truth: notes derive from raw + toggles + key/bpm.
  // Toggling a pass off then on is mathematically guaranteed to restore the previous result.
  const { notes, trace } = useMemo(
    () =>
      runPostProcessPipeline(rawNotesCache, {
        octaveGhost: pp.octaveGhost,
        hardenedMerge: pp.hardenedMerge,
        snapToGrid: pp.snapToGrid,
        tonalFilter: pp.tonalFilter,
        bpm: bpmResult?.bpm ?? null,
        bpmConfidence: bpmResult?.confidence ?? 0,
        tonic: keyResult?.tonic ?? null,
        mode: keyResult?.mode ?? null,
        keyConfidence: keyResult?.confidence ?? 0,
      }),
    [rawNotesCache, pp, keyResult, bpmResult],
  );


  const handleFile = useCallback(
    (f?: File) => {
      if (!f) return;
      if (!isLikelyAudioFile(f)) {
        toast({
          title: t("audio2midi.toasts.invalidTitle"),
          description: t("audio2midi.toasts.invalidDesc"),
          variant: "destructive",
        });
        return;
      }
      setFile(f);
      setRawNotesCache([]);
    },
    [toast, t],
  );

  // ---- Piano roll drawing ----
  const noteRange = useMemo(() => {
    if (notes.length === 0) return { min: 48, max: 72 };
    const min = Math.max(21, Math.min(...notes.map((n) => n.midi)) - 2);
    const max = Math.min(108, Math.max(...notes.map((n) => n.midi)) + 2);
    return { min, max: Math.max(max, min + 12) };
  }, [notes]);

  const drawPianoRoll = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = cv.clientWidth;
    const cssH = cv.clientHeight;
    cv.width = cssW * dpr;
    cv.height = cssH * dpr;
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const labelW = 44;
    const w = cssW - labelW;
    const h = cssH;
    const { min: minMidi, max: maxMidi } = noteRange;
    const range = maxMidi - minMidi + 1;
    const noteH = h / range;
    const total = Math.max(1, durationSec);

    // bg lanes (highlight C rows + black-key rows)
    for (let m = minMidi; m <= maxMidi; m++) {
      const y = h - (m - minMidi + 1) * noteH;
      const pc = ((m % 12) + 12) % 12;
      const isC = pc === 0;
      const isBlack = [1, 3, 6, 8, 10].includes(pc);
      if (isC) ctx.fillStyle = "hsla(20, 95%, 55%, 0.10)";
      else if (isBlack) ctx.fillStyle = "hsla(0, 0%, 100%, 0.025)";
      else ctx.fillStyle = "hsla(0, 0%, 100%, 0.01)";
      ctx.fillRect(labelW, y, w, noteH);
    }

    // horizontal lines on each octave (C)
    ctx.strokeStyle = "hsla(0, 0%, 100%, 0.08)";
    ctx.lineWidth = 1;
    for (let m = minMidi; m <= maxMidi; m++) {
      if (m % 12 === 0) {
        const y = h - (m - minMidi + 1) * noteH;
        ctx.beginPath();
        ctx.moveTo(labelW, y);
        ctx.lineTo(cssW, y);
        ctx.stroke();
      }
    }

    // labels — every C (left gutter)
    ctx.fillStyle = "hsla(0, 0%, 100%, 0.55)";
    ctx.font = "10px ui-sans-serif, system-ui";
    ctx.textBaseline = "middle";
    for (let m = minMidi; m <= maxMidi; m++) {
      if (m % 12 === 0) {
        const y = h - (m - minMidi + 0.5) * noteH;
        const oct = Math.floor(m / 12) - 1;
        ctx.fillText(`C${oct}`, 6, y);
      }
    }
    // separator
    ctx.strokeStyle = "hsla(0, 0%, 100%, 0.12)";
    ctx.beginPath();
    ctx.moveTo(labelW - 0.5, 0);
    ctx.lineTo(labelW - 0.5, h);
    ctx.stroke();

    // notes
    notes.forEach((n) => {
      const x = labelW + (n.startSec / total) * w;
      const wpx = Math.max(2, (n.durationSec / total) * w);
      const y = h - (n.midi - minMidi + 1) * noteH;
      const alpha = 0.45 + 0.55 * n.velocity;
      ctx.fillStyle = `hsla(20, 95%, 55%, ${alpha})`;
      ctx.fillRect(x, y + 1, wpx, Math.max(2, noteH - 2));
    });

    // playhead
    const phX = labelW + (playheadRef.current / total) * w;
    ctx.strokeStyle = "hsl(180, 90%, 60%)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(phX, 0);
    ctx.lineTo(phX, h);
    ctx.stroke();

    // ghost playhead (where the user would seek on click)
    if (hoverRef.current !== null) {
      const ghostX = labelW + (hoverRef.current / total) * w;
      ctx.save();
      ctx.strokeStyle = "hsla(180, 90%, 60%, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ghostX, 0);
      ctx.lineTo(ghostX, h);
      ctx.stroke();
      ctx.restore();
      // small time tag
      const label = `${Math.floor(hoverRef.current / 60)}:${Math.floor(hoverRef.current % 60).toString().padStart(2, "0")}`;
      ctx.font = "10px ui-sans-serif, system-ui";
      const padX = 4;
      const tagW = ctx.measureText(label).width + padX * 2;
      const tagH = 14;
      const tagX = Math.min(cssW - tagW - 2, Math.max(labelW + 2, ghostX + 4));
      ctx.fillStyle = "hsla(180, 90%, 60%, 0.85)";
      ctx.fillRect(tagX, 2, tagW, tagH);
      ctx.fillStyle = "hsl(220, 25%, 10%)";
      ctx.textBaseline = "middle";
      ctx.fillText(label, tagX + padX, 2 + tagH / 2);
    }
  }, [notes, durationSec, noteRange]);

  // Redraw on data change & on resize
  useEffect(() => {
    drawPianoRoll();
    const onResize = () => drawPianoRoll();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawPianoRoll]);

  // ---- Faux progress smoothing ----
  useEffect(() => {
    if (!isProcessing) {
      setDisplayPercent(progress.stage === "done" ? 100 : 0);
      return;
    }
    let raf: number;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setDisplayPercent((cur) => {
        // target depends on stage; allow overflow but cap below real if real is ahead
        const real = progress.percent;
        let target = real;
        if (progress.stage === "decoding") target = Math.max(real, 8);
        else if (progress.stage === "loading-model") target = Math.max(real, 18);
        else if (progress.stage === "running") target = Math.max(real, 25 + real * 0.65);
        else if (progress.stage === "post") target = Math.max(real, 92);
        const speed = target > cur ? 18 : 0; // %/s
        const next = Math.min(99, cur + speed * dt);
        return next < target ? next : Math.min(target, 99);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isProcessing, progress]);


  // ---- Conversion ----
  const handleRun = async (overrideFile?: File, overrideThresholds?: ProfileThresholds) => {
    const target = overrideFile ?? file;
    if (!target) return;
    setIsProcessing(true);
    setRawNotesCache([]);
    setPlayheadSec(0);
    playheadRef.current = 0;
    try {
      // Step 1 — quick audio analysis (key + bpm + mono samples). Fast (~1-2s).
      let analysis: Awaited<ReturnType<typeof analyzeAudioFile>> | null = null;
      try {
        analysis = await analyzeAudioFile(target);
      } catch {
        analysis = null;
      }

      // Step 2 — pick thresholds. If user supplied an override (Advanced panel),
      // use it. Otherwise auto-detect a profile from the analysis samples.
      let useThresholds = overrideThresholds ?? thresholds;
      let pickedProfile: AudioProfile = profile;
      if (!overrideThresholds && analysis) {
        try {
          const est = estimateProfile(analysis.monoSamples, analysis.sampleRate);
          pickedProfile = est.profile;
          useThresholds = est.thresholds;
          setProfile(est.profile);
          setThresholds(est.thresholds);
        } catch (e) {
          if (typeof window !== "undefined" && window.localStorage?.getItem("audio2midiDebug") === "1") {
            console.warn("[audio2midi] profile estimation failed", e);
          }
        }
      }

      if (typeof window !== "undefined" && window.localStorage?.getItem("audio2midiDebug") === "1") {
        console.log("[audio2midi] run", { profile: pickedProfile, thresholds: useThresholds, key: analysis?.key, bpm: analysis?.bpm });
      }

      // Step 3 — Basic Pitch with the chosen thresholds
      const result = await audioToMidiNotes(
        target,
        {
          onsetThreshold: useThresholds.onsetThreshold,
          frameThreshold: useThresholds.frameThreshold,
          minNoteDurationMs: useThresholds.minNoteDurationMs,
          includePitchBends: includeBends,
          skipDefaultMerge: true,
        },
        setProgress,
      );

      setKeyResult(analysis?.key ?? null);
      setBpmResult(analysis?.bpm ?? null);
      setRawNotesCache(result.notes);
      setDurationSec(result.durationSec);
      setDisplayPercent(100);

      // Preview count via a one-shot pipeline run (notes themselves are derived).
      const previewCount = runPostProcessPipeline(result.notes, {
        octaveGhost: pp.octaveGhost,
        hardenedMerge: pp.hardenedMerge,
        snapToGrid: pp.snapToGrid,
        tonalFilter: pp.tonalFilter,
        bpm: analysis?.bpm?.bpm ?? null,
        bpmConfidence: analysis?.bpm?.confidence ?? 0,
        tonic: analysis?.key?.tonic ?? null,
        mode: analysis?.key?.mode ?? null,
        keyConfidence: analysis?.key?.confidence ?? 0,
      }).notes.length;
      toast({
        title: t("audio2midi.toasts.doneTitle"),
        description: t("audio2midi.toasts.doneDesc", { count: previewCount }),
      });
    } catch (err) {
      console.error(err);
      toast({
        title: t("audio2midi.toasts.errorTitle"),
        description: String((err as Error).message ?? err),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };



  // Re-run Basic Pitch with new thresholds (Advanced panel profile change)
  const handleApplyProfile = (next: AudioProfile) => {
    setProfile(next);
    if (next === "custom") return;
    const preset = PROFILE_PRESETS[next];
    setThresholds(preset);
    if (file) void handleRun(file, preset);
  };


  const handleSelectAndRun = (f?: File) => {
    if (!f) return;
    handleFile(f);
    void handleRun(f);
  };

  // ---- Transport ----
  const stopTransport = useCallback(() => {
    if (transportRef.current) {
      transportRef.current.sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* noop */
        }
      });
      transportRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsPlaying(false);
  }, []);

  const startTransportFrom = useCallback(
    (fromSec: number) => {
      if (notes.length === 0) return;
      const audioCtx = getAudioContext();
      const startCtx = audioCtx.currentTime + 0.05;
      const sources: { stop: () => void }[] = [];
      notes.forEach((n) => {
        const offset = n.startSec - fromSec;
        if (n.startSec + n.durationSec < fromSec) return;
        const startAt = startCtx + Math.max(0, offset);
        const remaining =
          offset >= 0 ? n.durationSec : Math.max(0.05, n.durationSec - (fromSec - n.startSec));
        const handle = playNoteHandle(n.midi, "piano", {
          startAt,
          durationMs: remaining * 1000,
          velocity: n.velocity,
        });
        sources.push(handle);
      });
      transportRef.current = { startedAtCtx: startCtx, startedAtSec: fromSec, sources };
      setIsPlaying(true);

      const tick = () => {
        if (!transportRef.current) return;
        const t = transportRef.current.startedAtSec + (audioCtx.currentTime - transportRef.current.startedAtCtx);
        playheadRef.current = Math.min(durationSec, Math.max(0, t));
        setPlayheadSec(playheadRef.current);
        drawPianoRoll();
        if (t >= durationSec) {
          stopTransport();
          playheadRef.current = 0;
          setPlayheadSec(0);
          drawPianoRoll();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [notes, durationSec, drawPianoRoll, stopTransport],
  );

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopTransport();
      return;
    }
    const from = playheadRef.current >= durationSec - 0.05 ? 0 : playheadRef.current;
    startTransportFrom(from);
  };

  // Click-to-seek on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current;
    if (!cv || durationSec === 0) return;
    const rect = cv.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const labelW = 44;
    const usable = rect.width - labelW;
    const ratio = Math.min(1, Math.max(0, (x - labelW) / usable));
    const t = ratio * durationSec;
    const wasPlaying = isPlaying;
    stopTransport();
    playheadRef.current = t;
    setPlayheadSec(t);
    drawPianoRoll();
    if (wasPlaying) startTransportFrom(t);
  };

  useEffect(() => () => stopTransport(), [stopTransport]);

  const handleDownloadMidi = () => {
    if (notes.length === 0) return;
    const blob = notesToMidiBlob(notes, 120);
    const name = file?.name?.replace(/\.[^.]+$/, "") ?? "audio";
    downloadBlob(blob, `${name}.mid`);
  };

  const stageLabel = STAGE_LABEL[progress.stage];

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <Card className="equipment-card overflow-hidden border-border/80">
          <CardContent className="space-y-4 p-3 sm:p-6">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                handleSelectAndRun(event.dataTransfer.files[0]);
              }}
              className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 text-center transition-all duration-300 sm:min-h-[280px] sm:p-6 ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background/40 hover:border-primary hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                id="audio-upload-midi"
                type="file"
                accept={AUDIO_ACCEPT}
                className="sr-only"
                onChange={(event) => handleSelectAndRun(event.target.files?.[0])}
              />
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary sm:mb-6 sm:h-20 sm:w-20">
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 animate-spin sm:h-9 sm:w-9" />
                ) : (
                  <Upload className="h-8 w-8 sm:h-9 sm:w-9" />
                )}
              </div>
              <h2 className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl">
                {isProcessing ? _uploadAnalyzing : _uploadTitle}
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">{_uploadDescription}</p>
              {file && !isProcessing && (
                <p className="mt-4 text-xs text-muted-foreground">
                  <FileAudio className="mr-1 inline h-3.5 w-3.5" />
                  {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isProcessing}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choisir un fichier
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{stageLabel}</span>
                  <span>{displayPercent.toFixed(0)} %</span>
                </div>
                <Progress value={displayPercent} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {notes.length > 0 && (() => {
        const slot = typeof document !== "undefined" ? document.getElementById("audio2midi-player-slot") : null;
        const playerNode = (
          <Card className="equipment-card overflow-hidden border-border/80">
            <CardContent className="space-y-3 p-3 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="text-sm">
                  <span className="font-semibold text-foreground">{notes.length} {t("audio2midi.results.notes")}</span>
                  <span className="text-muted-foreground">
                    {" "}· {fmtTime(playheadSec)} / {fmtTime(durationSec)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleTogglePlay}>
                    {isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" /> {t("audio2midi.results.pause")}
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" /> {t("audio2midi.results.play")}
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownloadMidi}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Music4 className="mr-2 h-4 w-4" /> {t("audio2midi.results.download")}
                  </Button>
                </div>
              </div>

              {/* Info banner: profile / key / bpm */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                <span>
                  <span className="text-muted-foreground/80">{t("audio2midi.info.profile")} : </span>
                  <span className="font-medium text-foreground">{t(`audio2midi.profiles.${profile}`)}</span>
                </span>
                {keyResult && (
                  <span>
                    <span className="text-muted-foreground/80">{t("audio2midi.info.key")} : </span>
                    <span className="font-medium text-foreground">
                      {keyResult.tonic} {keyResult.mode === "minor" ? "min" : "maj"}
                    </span>
                    {keyResult.confidence < 0.6 && (
                      <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        ({t("audio2midi.info.lowConfidence")})
                      </span>
                    )}
                  </span>
                )}
                {bpmResult && bpmResult.bpm > 0 && (
                  <span>
                    <span className="text-muted-foreground/80">BPM : </span>
                    <span className="font-medium text-foreground">{bpmResult.bpm}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  {t("audio2midi.advanced.toggle")}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Advanced panel */}
              {advancedOpen && (
                <div className="space-y-4 rounded-md border border-border/60 bg-background/40 p-3 sm:p-4">
                  <div>
                    <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("audio2midi.advanced.profileLabel")}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {(["mono-clean", "piano-clean", "piano-dirty", "dense-pad"] as const).map((p) => (
                        <Button
                          key={p}
                          size="sm"
                          variant={profile === p ? "default" : "outline"}
                          onClick={() => handleApplyProfile(p)}
                          disabled={isProcessing}
                        >
                          {t(`audio2midi.profiles.${p}`)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("audio2midi.advanced.passesLabel")}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          setPp({ octaveGhost: true, hardenedMerge: true, snapToGrid: true, tonalFilter: true })
                        }
                      >
                        {t("audio2midi.advanced.resetPasses")}
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {([
                        { passKey: "octaveGhost", label: t("audio2midi.advanced.passes.octaveGhost") },
                        { passKey: "hardenedMerge", label: t("audio2midi.advanced.passes.hardenedMerge") },
                        { passKey: "snapToGrid", label: t("audio2midi.advanced.passes.snapToGrid") },
                        { passKey: "tonalFilter", label: t("audio2midi.advanced.passes.tonalFilter") },
                      ] as const).map(({ passKey, label }) => {
                        const id = `pp-${passKey}`;
                        const checked = pp[passKey];
                        const toggle = () => setPp((s) => ({ ...s, [passKey]: !s[passKey] }));
                        let traceLabel = "";
                        if (checked) {
                          if (passKey === "snapToGrid") {
                            const tr = trace.snapToGrid;
                            traceLabel = tr.skipped
                              ? t("audio2midi.advanced.traceSkipped")
                              : tr.snapped > 0
                                ? t("audio2midi.advanced.traceSnapped", { count: tr.snapped })
                                : t("audio2midi.advanced.traceNoChange");
                          } else if (passKey === "tonalFilter") {
                            const tr = trace.tonalFilter;
                            traceLabel = tr.skipped
                              ? t("audio2midi.advanced.traceSkipped")
                              : tr.aborted
                                ? t("audio2midi.advanced.traceAborted")
                                : tr.removed > 0
                                  ? t("audio2midi.advanced.traceRemoved", { count: tr.removed })
                                  : t("audio2midi.advanced.traceNoChange");
                          } else {
                            const tr = trace[passKey];
                            traceLabel = tr.aborted
                              ? t("audio2midi.advanced.traceAborted")
                              : tr.removed > 0
                                ? t("audio2midi.advanced.traceRemoved", { count: tr.removed })
                                : t("audio2midi.advanced.traceNoChange");
                          }
                        }
                        return (
                          <div
                            key={passKey}
                            role="button"
                            tabIndex={0}
                            onClick={toggle}
                            onKeyDown={(e) => {
                              if (e.key === " " || e.key === "Enter") {
                                e.preventDefault();
                                toggle();
                              }
                            }}
                            className="flex cursor-pointer items-center justify-between rounded-md border border-border/40 bg-muted/10 px-3 py-2 transition-colors hover:bg-muted/20"
                          >
                            <div className="flex flex-col">
                              <label htmlFor={id} className="cursor-pointer text-sm text-foreground" onClick={(e) => e.preventDefault()}>
                                {label}
                              </label>
                              {traceLabel && (
                                <span className="text-[10px] text-muted-foreground/80">{traceLabel}</span>
                              )}
                            </div>
                            <Switch
                              id={id}
                              checked={checked}
                              onCheckedChange={(v) => setPp((s) => ({ ...s, [passKey]: v }))}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {t("audio2midi.advanced.passesHint")}
                    </p>
                  </div>
                </div>
              )}

              <div ref={wrapRef} className="rounded-lg border border-border/60 bg-card/40 p-2">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseMove={(e) => {
                    const cv = canvasRef.current;
                    if (!cv || durationSec === 0) return;
                    const rect = cv.getBoundingClientRect();
                    const labelW = 44;
                    const usable = rect.width - labelW;
                    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left - labelW) / usable));
                    hoverRef.current = ratio * durationSec;
                    drawPianoRoll();
                  }}
                  onMouseLeave={() => {
                    hoverRef.current = null;
                    drawPianoRoll();
                  }}
                  className="h-72 w-full cursor-pointer sm:h-[28rem]"
                />
                <p className="mt-1 px-1 text-[11px] text-muted-foreground">
                  {t("audio2midi.results.scrubHint")}
                </p>
              </div>
            </CardContent>
          </Card>
        );
        return slot ? createPortal(playerNode, slot) : playerNode;
      })()}
    </div>
  );
};

export default AudioToMidi;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileAudio,
  Loader2,
  Music4,
  Pause,
  Play,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { audioToMidiNotes, type AudioToMidiProgress } from "@/lib/audioToMidi/basicPitch";
import { notesToMidiBlob, downloadBlob, type NoteEvent } from "@/lib/musicTheory/midiExport";
import { playNoteHandle, getAudioContext, type NoteHandle } from "@/lib/musicTheory/audio";


const STAGE_LABEL: Record<AudioToMidiProgress["stage"], string> = {
  decoding: "Décodage de l'audio…",
  "loading-model": "Chargement du modèle…",
  running: "Détection des notes…",
  post: "Post-traitement…",
  done: "Terminé",
};

interface AudioToMidiProps {
  uploadTitle?: string;
  uploadAnalyzingTitle?: string;
  uploadDescription?: string;
}

const AudioToMidi = ({
  uploadTitle = "Glisse ton fichier audio",
  uploadAnalyzingTitle = "Conversion en cours…",
  uploadDescription = "WAV, MP3, FLAC, OGG, M4A — le fichier ne quitte jamais ton navigateur.",
}: AudioToMidiProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<AudioToMidiProgress>({ stage: "decoding", percent: 0 });
  const [displayPercent, setDisplayPercent] = useState(0);
  const [notes, setNotes] = useState<NoteEvent[]>([]);
  const [durationSec, setDurationSec] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Less sensitive defaults — fewer doubled notes
  const onsetThreshold = 0.7;
  const frameThreshold = 0.45;
  const minNoteMs = 120;
  const includeBends = false;

  const handleFile = useCallback(
    (f?: File) => {
      if (!f) return;
      if (!f.type.startsWith("audio/")) {
        toast({
          title: "Fichier invalide",
          description: "Charge un fichier audio (WAV, MP3, FLAC…)",
          variant: "destructive",
        });
        return;
      }
      setFile(f);
      setNotes([]);
    },
    [toast],
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
  const handleRun = async (overrideFile?: File) => {
    const target = overrideFile ?? file;
    if (!target) return;
    setIsProcessing(true);
    setNotes([]);
    setPlayheadSec(0);
    playheadRef.current = 0;
    try {
      const result = await audioToMidiNotes(
        target,
        {
          onsetThreshold,
          frameThreshold,
          minNoteDurationMs: minNoteMs,
          includePitchBends: includeBends,
        },
        setProgress,
      );
      setNotes(result.notes);
      setDurationSec(result.durationSec);
      setDisplayPercent(100);
      toast({ title: "Conversion terminée", description: `${result.notes.length} notes détectées` });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: String((err as Error).message ?? err),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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

  const stageLabel = useMemo(() => STAGE_LABEL[progress.stage], [progress.stage]);

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
            <label
              htmlFor="audio-upload-midi"
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
                id="audio-upload-midi"
                type="file"
                accept="audio/*"
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
                {isProcessing ? uploadAnalyzingTitle : uploadTitle}
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">{uploadDescription}</p>
              {file && !isProcessing && (
                <p className="mt-4 text-xs text-muted-foreground">
                  <FileAudio className="mr-1 inline h-3.5 w-3.5" />
                  {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </label>

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

      {notes.length > 0 && (
        <Card className="equipment-card overflow-hidden border-border/80">
          <CardContent className="space-y-3 p-3 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="text-sm">
                <span className="font-semibold text-foreground">{notes.length} notes</span>
                <span className="text-muted-foreground">
                  {" "}· {fmtTime(playheadSec)} / {fmtTime(durationSec)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleTogglePlay}>
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" /> Lecture
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadMidi}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Music4 className="mr-2 h-4 w-4" /> Télécharger le MIDI
                </Button>
              </div>
            </div>
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
                Clique sur la timeline pour te déplacer · le repère pointillé montre où la lecture reprendra.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioToMidi;

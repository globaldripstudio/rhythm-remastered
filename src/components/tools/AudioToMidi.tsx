import { useCallback, useMemo, useRef, useState } from "react";
import {
  Download,
  FileAudio,
  Loader2,
  Music4,
  Play,
  Square,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { audioToMidiNotes, type AudioToMidiProgress } from "@/lib/audioToMidi/basicPitch";
import { notesToMidiBlob, downloadBlob, type NoteEvent } from "@/lib/musicTheory/midiExport";
import { playNote, getAudioContext } from "@/lib/musicTheory/audio";

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
  const [notes, setNotes] = useState<NoteEvent[]>([]);
  const [durationSec, setDurationSec] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlayingMidi, setIsPlayingMidi] = useState(false);
  const playStopRef = useRef({ cancelled: false });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sensible defaults baked-in (no UI exposure for these power-user knobs)
  const onsetThreshold = 0.5;
  const frameThreshold = 0.3;
  const minNoteMs = 80;
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

  const drawPianoRoll = useCallback((notes: NoteEvent[], duration: number) => {
    const cv = canvasRef.current;
    if (!cv || notes.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth * dpr;
    const h = cv.clientHeight * dpr;
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    const minMidi = Math.max(21, Math.min(...notes.map((n) => n.midi)) - 2);
    const maxMidi = Math.min(108, Math.max(...notes.map((n) => n.midi)) + 2);
    const range = maxMidi - minMidi + 1;
    const noteH = h / range;
    const total = Math.max(1, duration);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let m = minMidi; m <= maxMidi; m++) {
      if (m % 12 === 0) ctx.fillRect(0, h - (m - minMidi + 1) * noteH, w, noteH);
    }
    notes.forEach((n) => {
      const x = (n.startSec / total) * w;
      const wpx = Math.max(2, (n.durationSec / total) * w);
      const y = h - (n.midi - minMidi + 1) * noteH;
      const alpha = 0.4 + 0.6 * n.velocity;
      ctx.fillStyle = `hsl(20, 95%, 55%, ${alpha})`;
      ctx.fillRect(x, y + 1, wpx, Math.max(2, noteH - 2));
    });
  }, []);

  const handleRun = async (overrideFile?: File) => {
    const target = overrideFile ?? file;
    if (!target) return;
    setIsProcessing(true);
    setNotes([]);
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
      setTimeout(() => drawPianoRoll(result.notes, result.durationSec), 30);
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

  const handlePlayMidi = async () => {
    if (isPlayingMidi) {
      playStopRef.current.cancelled = true;
      setIsPlayingMidi(false);
      return;
    }
    if (notes.length === 0) return;
    const ctx = getAudioContext();
    setIsPlayingMidi(true);
    playStopRef.current.cancelled = false;
    const t0 = ctx.currentTime + 0.1;
    notes.forEach((n) => {
      playNote(n.midi, "piano", {
        startAt: t0 + n.startSec,
        durationMs: n.durationSec * 1000,
        velocity: n.velocity,
      });
    });
    const totalMs = durationSec * 1000 + 200;
    const start = performance.now();
    const tick = () => {
      if (playStopRef.current.cancelled) return;
      if (performance.now() - start >= totalMs) {
        setIsPlayingMidi(false);
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  };

  const handleDownloadMidi = () => {
    if (notes.length === 0) return;
    const blob = notesToMidiBlob(notes, 120);
    const name = file?.name?.replace(/\.[^.]+$/, "") ?? "audio";
    downloadBlob(blob, `${name}.mid`);
  };

  const handleDownloadCsv = () => {
    const header = "start,end,midi,velocity\n";
    const rows = notes
      .map(
        (n) =>
          `${n.startSec.toFixed(4)},${(n.startSec + n.durationSec).toFixed(4)},${n.midi},${n.velocity.toFixed(3)}`,
      )
      .join("\n");
    downloadBlob(new Blob([header + rows], { type: "text/csv" }), "notes.csv");
  };

  const stageLabel = useMemo(() => STAGE_LABEL[progress.stage], [progress.stage]);

  return (
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
          className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 text-center transition-all duration-300 sm:min-h-[320px] sm:p-6 ${
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
              <span>{progress.percent.toFixed(0)} %</span>
            </div>
            <Progress value={progress.percent} />
          </div>
        )}

        {notes.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="text-sm">
                <span className="font-semibold text-foreground">{notes.length} notes</span>
                <span className="text-muted-foreground"> détectées · {durationSec.toFixed(1)} s</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handlePlayMidi}>
                  {isPlayingMidi ? (
                    <Square className="mr-2 h-4 w-4" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {isPlayingMidi ? "Stop" : "Écouter"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
                  <Download className="mr-2 h-4 w-4" /> CSV
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
            <div className="rounded-lg border border-border/60 bg-card/40 p-2">
              <canvas ref={canvasRef} className="h-48 w-full" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioToMidi;

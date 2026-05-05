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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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

const AudioToMidi = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<AudioToMidiProgress>({ stage: "decoding", percent: 0 });
  const [notes, setNotes] = useState<NoteEvent[]>([]);
  const [durationSec, setDurationSec] = useState(0);
  const [onsetThreshold, setOnsetThreshold] = useState(0.5);
  const [frameThreshold, setFrameThreshold] = useState(0.3);
  const [minNoteMs, setMinNoteMs] = useState(60);
  const [includeBends, setIncludeBends] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlayingMidi, setIsPlayingMidi] = useState(false);
  const playStopRef = useRef({ cancelled: false });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFile = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("audio/")) {
      toast({ title: "Fichier invalide", description: "Charge un fichier audio (WAV, MP3, FLAC…)", variant: "destructive" });
      return;
    }
    setFile(f);
    setNotes([]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

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
    // grid
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let m = minMidi; m <= maxMidi; m++) {
      if (m % 12 === 0) ctx.fillRect(0, h - (m - minMidi + 1) * noteH, w, noteH);
    }
    // notes
    notes.forEach((n) => {
      const x = (n.startSec / total) * w;
      const wpx = Math.max(2, (n.durationSec / total) * w);
      const y = h - (n.midi - minMidi + 1) * noteH;
      const alpha = 0.4 + 0.6 * n.velocity;
      ctx.fillStyle = `hsl(20, 95%, 55%, ${alpha})`;
      ctx.fillRect(x, y + 1, wpx, Math.max(2, noteH - 2));
    });
  }, []);

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true);
    setNotes([]);
    try {
      const result = await audioToMidiNotes(
        file,
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
      toast({ title: "Erreur", description: String((err as Error).message ?? err), variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
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
      .map((n) => `${n.startSec.toFixed(4)},${(n.startSec + n.durationSec).toFixed(4)},${n.midi},${n.velocity.toFixed(3)}`)
      .join("\n");
    downloadBlob(new Blob([header + rows], { type: "text/csv" }), "notes.csv");
  };

  const stageLabel = useMemo(() => STAGE_LABEL[progress.stage], [progress.stage]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Music4 className="h-5 w-5 text-primary" />
            <CardTitle>Audio → MIDI</CardTitle>
            <Badge variant="outline" className="ml-2 border-primary/40 text-primary">100% local · gratuit</Badge>
          </div>
          <CardDescription>
            Conversion polyphonique audio vers MIDI via le modèle open source Spotify Basic Pitch. Le fichier ne quitte
            jamais le navigateur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border/60"
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm">
              Glisse un fichier audio ici ou{" "}
              <label className="cursor-pointer text-primary underline underline-offset-2">
                parcours
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>
            </p>
            {file && (
              <p className="text-xs text-muted-foreground">
                <FileAudio className="mr-1 inline h-3.5 w-3.5" />
                {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sensibilité onsets : {onsetThreshold.toFixed(2)}</Label>
              <Slider value={[onsetThreshold]} min={0.1} max={0.9} step={0.05} onValueChange={(v) => setOnsetThreshold(v[0])} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Seuil frames : {frameThreshold.toFixed(2)}</Label>
              <Slider value={[frameThreshold]} min={0.1} max={0.9} step={0.05} onValueChange={(v) => setFrameThreshold(v[0])} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Durée min : {minNoteMs} ms</Label>
              <Slider value={[minNoteMs]} min={10} max={500} step={10} onValueChange={(v) => setMinNoteMs(v[0])} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
              <Label className="text-sm">Inclure les pitch bends</Label>
              <Switch checked={includeBends} onCheckedChange={setIncludeBends} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRun} disabled={!file || isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Music4 className="mr-2 h-4 w-4" />}
              {isProcessing ? "Traitement…" : "Convertir en MIDI"}
            </Button>
            <Button variant="outline" disabled={notes.length === 0} onClick={handlePlayMidi}>
              {isPlayingMidi ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlayingMidi ? "Stop" : "Écouter le MIDI"}
            </Button>
            <Button
              disabled={notes.length === 0}
              onClick={handleDownloadMidi}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" /> Télécharger .mid
            </Button>
            <Button variant="outline" disabled={notes.length === 0} onClick={handleDownloadCsv}>
              <Download className="mr-2 h-4 w-4" /> .csv
            </Button>
          </div>

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
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{notes.length} notes — {durationSec.toFixed(1)} s</span>
              </div>
              <div className="rounded-lg border border-border/60 bg-card/40 p-2">
                <canvas ref={canvasRef} className="h-48 w-full" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioToMidi;

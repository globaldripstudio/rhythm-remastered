import { useCallback, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Download,
  FileAudio,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Scissors,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  createDemucs,
  decodeAudioFile,
  detectBackend,
  type DemucsRunner,
  type StemBuffers,
  type StemName,
} from "@/lib/stemSplitter/processor";
import { encodeMp3, encodeWav } from "@/lib/stemSplitter/encoders";

type Format = "wav" | "mp3";

const STEM_LABELS: Record<StemName, { label: string; emoji: string }> = {
  drums: { label: "Drums", emoji: "🥁" },
  bass: { label: "Bass", emoji: "🎸" },
  vocals: { label: "Vocals", emoji: "🎤" },
  other: { label: "Other", emoji: "🎹" },
};

const MAX_FILE_MB = 100;
const SAMPLE_RATE = 44100;

interface StemResult {
  name: StemName;
  blob: Blob;
  url: string;
  filename: string;
}

const StemSplitter = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("wav");
  const [backend, setBackend] = useState<"webgpu" | "wasm" | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [separationProgress, setSeparationProgress] = useState<{
    progress: number;
    currentSegment: number;
    totalSegments: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<string>("");
  const [results, setResults] = useState<StemResult[] | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [playingStem, setPlayingStem] = useState<StemName | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const runnerRef = useRef<DemucsRunner | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Backend detection on first interaction (don't load WASM yet)
  const ensureBackend = useCallback(async () => {
    if (backend) return backend;
    const b = await detectBackend();
    setBackend(b);
    return b;
  }, [backend]);

  const isMobile = useMemo(
    () => typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),
    []
  );

  const reset = useCallback(() => {
    if (results) results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults(null);
    setSeparationProgress(null);
    setDownloadProgress(null);
    setStage("");
    setStartedAt(null);
    setAudioDuration(null);
    setPlayingStem(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [results]);

  const handleFile = useCallback(
    (f: File | null | undefined) => {
      if (!f) return;
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast({ title: "Fichier trop lourd", description: `Max ${MAX_FILE_MB} Mo.`, variant: "destructive" });
        return;
      }
      reset();
      setFile(f);
      void ensureBackend();
    },
    [ensureBackend, reset, toast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile]
  );

  const startSeparation = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setResults(null);
    setStartedAt(Date.now());
    try {
      setStage("Décodage du fichier audio…");
      const decoded = await decodeAudioFile(file, SAMPLE_RATE);
      setAudioDuration(decoded.duration);

      if (!runnerRef.current) {
        setStage("Initialisation du modèle Demucs (1ʳᵉ fois : téléchargement ~80–300 Mo)…");
        runnerRef.current = await createDemucs({
          onDownloadProgress: (loaded, total) => setDownloadProgress({ loaded, total }),
          onProgress: (info) => setSeparationProgress(info),
          onLog: (phase) => setStage(`${phase}…`),
        });
        setBackend(runnerRef.current.backend);
      }

      setStage("Séparation des stems…");
      const stems: StemBuffers = await runnerRef.current.separate(decoded.left, decoded.right);

      setStage(`Encodage ${format.toUpperCase()}…`);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const out: StemResult[] = [];
      for (const name of Object.keys(STEM_LABELS) as StemName[]) {
        const buf = stems[name];
        if (!buf) continue;
        const blob =
          format === "wav"
            ? encodeWav(buf.left, buf.right, SAMPLE_RATE)
            : await encodeMp3(buf.left, buf.right, SAMPLE_RATE, 320);
        const filename = `${baseName} - ${STEM_LABELS[name].label}.${format}`;
        out.push({ name, blob, url: URL.createObjectURL(blob), filename });
      }
      setResults(out);
      setStage("Terminé ✓");
      toast({ title: "Stems prêts", description: `${out.length} pistes générées.` });
    } catch (err) {
      console.error("Stem splitter error:", err);
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast({ title: "Échec de la séparation", description: msg, variant: "destructive" });
      setStage(`Erreur : ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  }, [file, format, toast]);

  const downloadAll = useCallback(async () => {
    if (!results || !file) return;
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.filename, r.blob));
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName} - stems.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [results, file]);

  const togglePreview = useCallback(
    (r: StemResult) => {
      if (playingStem === r.name) {
        audioRef.current?.pause();
        setPlayingStem(null);
        return;
      }
      audioRef.current?.pause();
      const audio = new Audio(r.url);
      audio.onended = () => setPlayingStem(null);
      audioRef.current = audio;
      void audio.play();
      setPlayingStem(r.name);
    },
    [playingStem]
  );

  const eta = useMemo(() => {
    if (!separationProgress || !startedAt || !audioDuration) return null;
    const { currentSegment, totalSegments } = separationProgress;
    if (currentSegment === 0) return null;
    const elapsed = (Date.now() - startedAt) / 1000;
    const avg = elapsed / currentSegment;
    const remaining = (totalSegments - currentSegment) * avg;
    const speed = ((currentSegment / totalSegments) * audioDuration) / elapsed;
    return { remaining, speed };
  }, [separationProgress, startedAt, audioDuration]);

  return (
    <div className="space-y-6">
      <Card className="border-border/80">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/15 p-2">
                <Scissors className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Stem Splitter
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" /> 100% local
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Séparation IA Demucs — vocals / drums / bass / other. Aucun fichier ne quitte ton navigateur.
                </CardDescription>
              </div>
            </div>
            {backend && (
              <Badge variant="outline" className="text-xs">
                Backend : {backend === "webgpu" ? "WebGPU ⚡" : "WASM (CPU)"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/30"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Upload className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 text-sm font-medium">
              {file ? file.name : "Glisse un fichier audio ici (ou clique pour parcourir)"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              MP3 / WAV / FLAC / M4A — max {MAX_FILE_MB} Mo
            </p>
          </div>

          {/* Options */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm">Format de sortie</Label>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={format === "wav" ? "default" : "outline"}
                  onClick={() => setFormat("wav")}
                  disabled={isProcessing}
                >
                  WAV 44.1 kHz
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={format === "mp3" ? "default" : "outline"}
                  onClick={() => setFormat("mp3")}
                  disabled={isProcessing}
                >
                  MP3 320 kbps
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm">Mode</Label>
              <div className="mt-2 flex gap-2">
                <Button type="button" size="sm" variant="default" disabled>
                  4 stems (Demucs)
                </Button>
                <Button type="button" size="sm" variant="outline" disabled className="opacity-50">
                  6 stems · bientôt
                </Button>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {isMobile && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              ⚠️ Sur mobile, le traitement peut planter par manque de RAM. Préfère un ordinateur.
            </div>
          )}
          {file && !isProcessing && !results && (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              ℹ️ Le 1ᵉʳ traitement télécharge le modèle (~80–300 Mo, mis en cache ensuite). Ensuite, compte
              <strong className="mx-1 text-foreground">2 à 10 min</strong>pour un titre de 3-4 min selon ta machine.
              Garde l'onglet ouvert.
            </div>
          )}

          {/* Action */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              onClick={startSeparation}
              disabled={!file || isProcessing}
              className="studio-button gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Traitement…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> Lancer la séparation
                </>
              )}
            </Button>
            {(file || results) && !isProcessing && (
              <Button variant="outline" size="lg" onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Nouveau fichier
              </Button>
            )}
          </div>

          {/* Progress */}
          {(downloadProgress || separationProgress || stage) && (
            <div className="space-y-3 rounded-lg border border-border bg-background/40 p-4">
              <div className="text-sm font-medium">{stage}</div>
              {downloadProgress && downloadProgress.total > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Téléchargement modèle</span>
                    <span>
                      {(downloadProgress.loaded / 1024 / 1024).toFixed(1)} /{" "}
                      {(downloadProgress.total / 1024 / 1024).toFixed(1)} Mo
                    </span>
                  </div>
                  <Progress
                    value={(downloadProgress.loaded / downloadProgress.total) * 100}
                    className="mt-1 h-2"
                  />
                </div>
              )}
              {separationProgress && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Séparation — segment {separationProgress.currentSegment}/{separationProgress.totalSegments}
                    </span>
                    <span>{(separationProgress.progress * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={separationProgress.progress * 100} className="mt-1 h-2" />
                  {eta && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Vitesse : {eta.speed.toFixed(2)}× temps réel — ETA :{" "}
                      {eta.remaining < 60
                        ? `${Math.round(eta.remaining)} s`
                        : `${Math.floor(eta.remaining / 60)} min ${Math.round(eta.remaining % 60)} s`}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {results && results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Stems générés</h3>
                <Button size="sm" variant="default" onClick={downloadAll} className="gap-2">
                  <Download className="h-3.5 w-3.5" /> Tout télécharger (.zip)
                </Button>
              </div>
              <div className="grid gap-2">
                {results.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl">{STEM_LABELS[r.name].emoji}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{STEM_LABELS[r.name].label}</div>
                        <div className="truncate text-xs text-muted-foreground">{r.filename}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => togglePreview(r)} className="gap-1">
                        {playingStem === r.name ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <a href={r.url} download={r.filename}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="h-3.5 w-3.5" />
                          <FileAudio className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StemSplitter;

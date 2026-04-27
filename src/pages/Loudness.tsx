import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, FileAudio, Gauge, Loader2, Music2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AnalysisResult = {
  lufs: number;
  peakDb: number;
  duration: number;
  sampleRate: number;
  channels: number;
  fileName: string;
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

const dbFromPower = (power: number) => -0.691 + 10 * Math.log10(Math.max(power, 1e-12));

const analyzeLoudness = async (file: File): Promise<AnalysisResult> => {
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextCtor();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  await audioContext.close();

  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  const source = offlineContext.createBufferSource();
  const highPass = offlineContext.createBiquadFilter();
  const highShelf = offlineContext.createBiquadFilter();

  source.buffer = audioBuffer;
  highPass.type = "highpass";
  highPass.frequency.value = 38;
  highPass.Q.value = 0.5;
  highShelf.type = "highshelf";
  highShelf.frequency.value = 1500;
  highShelf.gain.value = 4;

  source.connect(highPass);
  highPass.connect(highShelf);
  highShelf.connect(offlineContext.destination);
  source.start(0);

  const renderedBuffer = await offlineContext.startRendering();
  const channelCount = renderedBuffer.numberOfChannels;
  const sampleRate = renderedBuffer.sampleRate;
  const blockSize = Math.max(1, Math.round(sampleRate * 0.4));
  const hopSize = Math.max(1, Math.round(sampleRate * 0.1));
  const blocks: number[] = [];
  let peak = 0;

  const channelData = Array.from({ length: channelCount }, (_, index) => renderedBuffer.getChannelData(index));

  for (let channel = 0; channel < channelCount; channel += 1) {
    const samples = channelData[channel];
    for (let i = 0; i < samples.length; i += 1) {
      peak = Math.max(peak, Math.abs(samples[i]));
    }
  }

  for (let start = 0; start + blockSize <= renderedBuffer.length; start += hopSize) {
    let blockPower = 0;
    for (let channel = 0; channel < channelCount; channel += 1) {
      const samples = channelData[channel];
      let sum = 0;
      for (let i = start; i < start + blockSize; i += 1) {
        sum += samples[i] * samples[i];
      }
      blockPower += sum / blockSize;
    }
    blocks.push(blockPower);
  }

  const usableBlocks = blocks.length ? blocks : [channelData.reduce((total, samples) => {
    let sum = 0;
    for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
    return total + sum / Math.max(samples.length, 1);
  }, 0)];

  const absoluteGatedBlocks = usableBlocks.filter((power) => dbFromPower(power) > -70);
  const firstPassBlocks = absoluteGatedBlocks.length ? absoluteGatedBlocks : usableBlocks;
  const firstPassPower = firstPassBlocks.reduce((sum, power) => sum + power, 0) / firstPassBlocks.length;
  const relativeGate = dbFromPower(firstPassPower) - 10;
  const relativeGatedBlocks = firstPassBlocks.filter((power) => dbFromPower(power) > relativeGate);
  const finalBlocks = relativeGatedBlocks.length ? relativeGatedBlocks : firstPassBlocks;
  const integratedPower = finalBlocks.reduce((sum, power) => sum + power, 0) / finalBlocks.length;

  return {
    lufs: dbFromPower(integratedPower),
    peakDb: 20 * Math.log10(Math.max(peak, 1e-12)),
    duration: audioBuffer.duration,
    sampleRate,
    channels: channelCount,
    fileName: file.name,
  };
};

const Loudness = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const targetHint = useMemo(() => {
    if (!result) return null;
    if (result.lufs > -12) return "Master très fort, proche des références modernes agressives.";
    if (result.lufs > -16) return "Zone streaming moderne, bonne densité générale.";
    return "Master plus dynamique, confortable pour les styles respirants.";
  }, [result]);

  const handleFile = useCallback(async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Sélectionne un fichier audio valide.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeLoudness(file);
      setResult(analysis);
    } catch (analysisError) {
      console.error(analysisError);
      setError("Impossible d'analyser ce fichier. Essaie un WAV, MP3, AIFF, FLAC ou AAC exporté correctement.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Analyse LUFS en ligne | Global Drip Studio"
        description="Téléversez un fichier audio et mesurez sa loudness LUFS directement dans votre navigateur."
        path="/loudness"
      />
      <Header />
      <main className="pt-28 pb-16 sm:pt-32 sm:pb-20">
        <section className="container mx-auto px-4 sm:px-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
            <ArrowLeft className="w-4 h-4" />
            Retour au studio
          </Button>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                <Gauge className="w-4 h-4 text-primary" />
                Analyse locale dans le navigateur
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                  Loudness <span className="hero-text">LUFS</span>
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
                  Téléverse un morceau, récupère sa loudness intégrée et son peak pour contrôler ton master avant diffusion.
                </p>
              </div>
            </div>

            <Card className="equipment-card overflow-hidden border-border/80">
              <CardContent className="p-4 sm:p-6">
                <label
                  htmlFor="audio-upload"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    void handleFile(event.dataTransfer.files[0]);
                  }}
                  className={`flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition-all duration-300 ${
                    isDragging ? "border-primary bg-primary/10" : "border-border bg-background/40 hover:border-primary hover:bg-muted/30"
                  }`}
                >
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    className="sr-only"
                    onChange={(event) => void handleFile(event.target.files?.[0])}
                  />
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
                    {isAnalyzing ? <Loader2 className="h-9 w-9 animate-spin" /> : <Upload className="h-9 w-9" />}
                  </div>
                  <h2 className="mb-3 text-2xl font-bold">
                    {isAnalyzing ? "Analyse en cours" : "Dépose ton fichier audio"}
                  </h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    WAV, MP3, AIFF, FLAC ou AAC. Le fichier reste sur ton appareil et n'est pas envoyé à un serveur.
                  </p>
                </label>

                {error && (
                  <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {result && (
            <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Résultats d'analyse loudness">
              <Card className="equipment-card sm:col-span-2">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3 text-muted-foreground">
                    <Music2 className="w-5 h-5 text-primary" />
                    <span className="truncate text-sm">{result.fileName}</span>
                  </div>
                  <p className="text-5xl font-bold text-primary">{result.lufs.toFixed(1)}</p>
                  <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">LUFS intégré</p>
                  {targetHint && <p className="mt-4 text-sm text-muted-foreground">{targetHint}</p>}
                </CardContent>
              </Card>

              <Card className="equipment-card">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Peak</p>
                  <p className="mt-3 text-3xl font-bold">{result.peakDb.toFixed(1)} dBFS</p>
                </CardContent>
              </Card>

              <Card className="equipment-card">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Fichier</p>
                  <div className="mt-3 flex items-center gap-2 text-3xl font-bold">
                    <FileAudio className="w-7 h-7 text-primary" />
                    {formatDuration(result.duration)}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {result.channels} canal{result.channels > 1 ? "s" : ""} · {(result.sampleRate / 1000).toFixed(1)} kHz
                  </p>
                </CardContent>
              </Card>
            </section>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Loudness;
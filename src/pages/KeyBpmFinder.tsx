import { useCallback, useState } from "react";
import { FileAudio, KeyRound, Loader2, Music2, Upload, Activity, Disc3, Info } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { analyzeAudioFile, type AudioAnalysisResult } from "@/lib/audioAnalysis";

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

const formatKey = (tonic: string, mode: "major" | "minor", t: (k: string) => string) =>
  `${tonic} ${mode === "major" ? t("keybpm.modes.major") : t("keybpm.modes.minor")}`;


const KeyBpmFinder = () => {
  const { t, i18n } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const toggleLanguage = () => {
    document.body.classList.add("lang-switching");
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
    setTimeout(() => document.body.classList.remove("lang-switching"), 500);
  };

  const handleFile = useCallback(async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError(t("keybpm.errors.invalidFile"));
      return;
    }
    setError(null);
    setResult(null);
    setIsAnalyzing(true);
    const start = performance.now();
    try {
      // Yield to the UI so the loader paints before the heavy work starts
      await new Promise((r) => setTimeout(r, 30));
      const analysis = await analyzeAudioFile(file);
      setResult(analysis);
      setElapsed((performance.now() - start) / 1000);
    } catch (err) {
      console.error(err);
      setError(t("keybpm.errors.analysis"));
    } finally {
      setIsAnalyzing(false);
    }
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("seo.keybpm.title")}
        description={t("seo.keybpm.description")}
        path="/key-bpm-finder"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Global Drip Studio Key & BPM Finder",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Web browser",
          "url": "https://globaldripstudio.fr/key-bpm-finder",
          "description": t("seo.keybpm.description"),
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
          "featureList": ["BPM detection", "Musical key detection", "Camelot wheel notation", "Client-side processing"],
        }}
      />
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <img src="/lovable-uploads/logo-blanc-sans-fond.png" alt="Global Drip Studio" className="h-6 sm:h-8 object-contain" />
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">← {t("nav.backHome")}</span>
                  <span className="sm:hidden">← {t("nav.backHomeShort")}</span>
                </Button>
              </Link>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-border"
              aria-label="Switch language"
            >
              <span className={i18n.language === "fr" ? "text-foreground font-bold" : ""}>FR</span>
              <span className="text-muted-foreground/40">|</span>
              <span className={i18n.language === "en" ? "text-foreground font-bold" : ""}>EN</span>
            </button>
          </div>
        </div>
      </header>

      <main className="py-8 sm:py-20">
        <section className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8">
            <div className="space-y-4 animate-fade-in sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                <KeyRound className="w-4 h-4 text-primary" />
                {t("keybpm.badge")}
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
                  Key &amp; BPM <span className="hero-text">Finder</span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-xl">
                  {t("keybpm.subtitle")}
                </p>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-3">
                {(["bpm", "key", "camelot"] as const).map((item) => (
                  <div key={item} className="rounded-md border border-border bg-background/40 p-3">
                    <p className="font-semibold text-foreground">{t(`keybpm.presentation.${item}.title`)}</p>
                    <p className="mt-1 leading-relaxed">{t(`keybpm.presentation.${item}.description`)}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-border bg-background/40 p-3 text-sm leading-relaxed text-muted-foreground sm:p-4">
                {t("keybpm.methodIntro")}
              </div>
            </div>

            <Card className="equipment-card overflow-hidden border-border/80">
              <CardContent className="p-3 sm:p-6">
                <label
                  htmlFor="audio-upload-keybpm"
                  onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => { event.preventDefault(); setIsDragging(false); void handleFile(event.dataTransfer.files[0]); }}
                  className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 text-center transition-all duration-300 sm:min-h-[320px] sm:p-6 ${
                    isDragging ? "border-primary bg-primary/10" : "border-border bg-background/40 hover:border-primary hover:bg-muted/30"
                  }`}
                >
                  <input
                    id="audio-upload-keybpm"
                    type="file"
                    accept="audio/*"
                    className="sr-only"
                    onChange={(event) => void handleFile(event.target.files?.[0])}
                  />
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary sm:mb-6 sm:h-20 sm:w-20">
                    {isAnalyzing ? <Loader2 className="h-8 w-8 animate-spin sm:h-9 sm:w-9" /> : <Upload className="h-8 w-8 sm:h-9 sm:w-9" />}
                  </div>
                  <h2 className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl">
                    {isAnalyzing ? t("keybpm.upload.analyzing") : t("keybpm.upload.title")}
                  </h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    {t("keybpm.upload.description")}
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

          {/* SEO content block */}
          <section className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]" aria-labelledby="keybpm-seo-title">
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h2 id="keybpm-seo-title" className="text-xl font-bold sm:text-2xl">{t("keybpm.seoBlock.title")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{t("keybpm.seoBlock.description")}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(["djmix", "production", "remix"] as const).map((item) => (
                  <div key={item} className="rounded-md bg-muted/25 p-3">
                    <h3 className="text-sm font-semibold text-foreground">{t(`keybpm.seoBlock.topics.${item}.title`)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(`keybpm.seoBlock.topics.${item}.description`)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-4 sm:p-5">
              <h2 className="text-base font-bold text-foreground sm:text-lg">{t("keybpm.seoBlock.howTitle")}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {(["bpm", "key", "camelot", "privacy"] as const).map((item) => (
                  <li key={item}>• {t(`keybpm.seoBlock.how.${item}`)}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Results */}
          {result && (
            <section className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-2" aria-label={t("keybpm.resultsAria")}>
              <Card className="equipment-card lg:col-span-2">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <Music2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="truncate text-sm">{result.fileName}</span>
                    </div>
                    {elapsed !== null && (
                      <span className="w-fit rounded-full border border-border px-3 py-1 text-xs">
                        {t("keybpm.analyzedIn", { seconds: elapsed.toFixed(1) })}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* BPM */}
                    <div className="rounded-md border border-border bg-background/40 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        <Activity className="h-4 w-4 text-primary" />
                        BPM
                      </div>
                      <p className="mt-3 text-5xl font-bold text-primary sm:text-6xl">
                        {result.bpm.bpm > 0 ? result.bpm.bpm.toFixed(1) : "—"}
                      </p>
                      {result.bpm.candidates.length > 1 && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          <span className="text-foreground">{t("keybpm.alternatives")}:</span>{" "}
                          {result.bpm.candidates.slice(1, 4).map((c, i) => (
                            <span key={i}>{i > 0 && " · "}{c.bpm.toFixed(1)}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Key */}
                    <div className="rounded-md border border-border bg-background/40 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        <KeyRound className="h-4 w-4 text-primary" />
                        {t("keybpm.metrics.key")}
                      </div>
                      <p className="mt-3 text-5xl font-bold text-primary sm:text-6xl">
                        {formatKey(result.key.tonic, result.key.mode, t)}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-secondary/50 bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary">
                        <Disc3 className="h-3.5 w-3.5" />
                        Camelot {result.key.camelot}
                      </div>
                      <p className={`mt-3 text-xs uppercase ${confidenceColor(result.key.confidence)}`}>
                        {t("keybpm.confidence.label")}: {confidenceLabel(result.key.confidence, t)} ({Math.round(result.key.confidence * 100)}%)
                      </p>
                      {result.key.alternative && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t("keybpm.alternative")}: <span className="text-foreground">{formatKey(result.key.alternative.tonic, result.key.alternative.mode, t)}</span> · Camelot {result.key.alternative.camelot}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                    <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                      <Info className="h-4 w-4 text-primary" />
                      {t("keybpm.camelotHelp.title")}
                    </div>
                    <p className="leading-relaxed">{t("keybpm.camelotHelp.description")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="equipment-card">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground">{t("keybpm.metrics.file")}</h3>
                  <div className="mt-3 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                    <FileAudio className="w-7 h-7 text-primary" />
                    {formatDuration(result.duration)}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {result.channels} {result.channels > 1 ? t("keybpm.metrics.channels") : t("keybpm.metrics.channel")} · {(result.sampleRate / 1000).toFixed(1)} kHz
                  </p>
                </CardContent>
              </Card>

              <Card className="equipment-card">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground">{t("keybpm.tip.title")}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("keybpm.tip.description")}</p>
                </CardContent>
              </Card>

              <Card className="equipment-card lg:col-span-2">
                <CardContent className="p-6 sm:p-8 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                    {t("projects.readyToJoin")} <span className="hero-text">{t("projects.collaborationsWord")}</span> ?
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                    {t("projects.readyDesc")}
                  </p>
                  <a href="/#contact">
                    <Button size="lg" className="studio-button text-sm sm:text-base">
                      {t("projects.startProject")}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </section>
          )}
        </section>
      </main>
    </div>
  );
};

export default KeyBpmFinder;

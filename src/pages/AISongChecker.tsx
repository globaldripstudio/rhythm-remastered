import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bot, FileAudio, Loader2, Upload, Sparkles, Info, AlertTriangle, BarChart3, Activity, HelpCircle, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { AUDIO_ACCEPT, isLikelyAudioFile } from "@/lib/audioFileInput";
import { analyzeForAI, type AISongCheckResult, type Verdict, type ProbBlock, type MarkerId, type MarkerSide, type Confidence, type QualityIssue, type TopMarker } from "@/lib/aiSongCheck";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolkitHeader from "@/components/tools/ToolkitHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { softwareAppSchema, breadcrumbSchema } from "@/lib/seo/schemas";

type FeatureKey =
  | "spectralFlatnessMean"
  | "spectralFlatnessStd"
  | "hfCutoffHz"
  | "hfEnergyRatio"
  | "stereoCorrelation"
  | "onsetIntervalCv"
  | "rmsMicroDynamics"
  | "silenceRatio"
  | "envelopeRepetition"
  | "noiseFloorDb";

const STRINGS = {
  fr: {
    title: "AI Song Checker",
    tagline: "Détectez si un morceau a été généré par une IA — 100% local, aucun upload.",
    dropTitle: "Glissez un fichier audio ici",
    dropSub: "ou cliquez pour parcourir (MP3, WAV, FLAC, M4A, OGG)",
    analyzing: "Analyse acoustique en cours…",
    analyze: "Analyser un autre fichier",
    duration: "Durée",
    seconds: "secondes",
    spectral: "Analyse spectrale",
    temporal: "Analyse temporelle",
    overall: "Verdict global",
    human: "Humain",
    hybrid: "Hybride (IA + Humain)",
    ai: "IA pure",
    invalid: "Fichier audio invalide. Formats acceptés : MP3, WAV, FLAC, M4A, OGG.",
    error: "Erreur lors de l'analyse du fichier.",
    disclaimerTitle: "Méthode et limites",
    disclaimer:
      "L'analyse combine 16 marqueurs acoustiques (planéité spectrale, cohérence de phase, coupure HF, corrélation stéréo, variation des bandes mel, régularité des transitoires, micro-dynamique, plancher de bruit, répétition d'enveloppe, décroissance des queues, présence de respiration…). Le verdict est obtenu par élimination : si on détecte des traces évidentes d'enregistrement humain, on écarte l'option « IA pure » (et inversement). Ce n'est pas un modèle d'IA entraîné : un mastering très propre, une production électronique très carrée ou un enregistrement mono peuvent produire des faux positifs.",
    detailsTitle: "Mesures détaillées",
    topMarkersTitle: "Indices clés",
    sideAi: "indice IA",
    sideHuman: "indice humain",
    confidenceTitle: "Fiabilité de l'analyse",
    confidence: { high: "Élevée", medium: "Moyenne", low: "Faible" } as Record<Confidence, string>,
    confidenceHelp: {
      high: "Le fichier offre suffisamment de matière pour un verdict solide.",
      medium: "Quelques limitations détectées — le verdict reste indicatif.",
      low: "Trop peu de matière exploitable — verdict à prendre avec précaution.",
    } as Record<Confidence, string>,
    qualityIssues: {
      shortFile: "Fichier court (< 10 s) — peu de matière analysable.",
      lowSampleRate: "Taux d'échantillonnage faible — bande passante limitée.",
      lowBandwidth: "Bande passante très réduite (MP3 bas débit ?) — peut imiter une signature IA.",
      noisy: "Plancher de bruit élevé — peut masquer les marqueurs IA.",
      monoOnly: "Fichier mono ou stéréo factice — la corrélation stéréo n'est pas exploitable.",
    } as Record<QualityIssue, string>,
    markerLabels: {
      flatnessStd: "Variance spectrale",
      hfCutoff: "Coupure haute fréquence",
      hfEnergyRatio: "Énergie >16 kHz",
      stereoCorr: "Image stéréo",
      melCv: "Variation des bandes",
      phaseCoherence: "Cohérence de phase",
      rolloff85: "Rolloff spectral",
      onsetCv: "Régularité des transitoires",
      rmsMicro: "Micro-dynamique",
      envRepetition: "Répétition d'enveloppe",
      noiseFloor: "Plancher de bruit",
      zcrCv: "Stabilité de pitch",
      decayRegularity: "Décroissance des queues",
      breathRatio: "Respirations / ambiance",
    } as Record<MarkerId, string>,
    features: {
      spectralFlatnessMean: "Planéité spectrale moy.",
      spectralFlatnessStd: "Variance de planéité",
      hfCutoffHz: "Coupure HF (Hz)",
      hfEnergyRatio: "Énergie >16 kHz",
      stereoCorrelation: "Corrélation stéréo",
      onsetIntervalCv: "CV inter-transitoires",
      rmsMicroDynamics: "Micro-dynamique RMS (dB)",
      silenceRatio: "Ratio de silence",
      envelopeRepetition: "Répétition d'enveloppe",
      noiseFloorDb: "Plancher de bruit (dB)",
    } as Record<FeatureKey, string>,
    featureDesc: {
      spectralFlatnessMean: "Indique si le spectre est plutôt bruité (proche de 1) ou tonal/musical (proche de 0).",
      spectralFlatnessStd: "Variation de la texture spectrale au fil du temps. Une variance faible (<0.04) trahit un signal uniforme typique de l'IA.",
      hfCutoffHz: "Fréquence à laquelle l'énergie haute disparaît. Une coupure nette entre 14–17 kHz est caractéristique des générateurs IA (Suno, Udio, MusicGen).",
      hfEnergyRatio: "Proportion d'énergie au-dessus de 16 kHz. Très faible (<0.5%) = bande passante artificiellement limitée, souvent IA.",
      stereoCorrelation: "Similarité entre canaux gauche et droit. >0.95 = quasi-mono (fréquent en IA), 0.4–0.9 = stéréo naturelle, <0.2 = inhabituel.",
      onsetIntervalCv: "Régularité des frappes/attaques. <0.2 = trop métronomique (souvent IA), 0.3–0.7 = jeu humain naturel.",
      rmsMicroDynamics: "Variations de volume sur des fenêtres de 50 ms. <3 dB = signal très compressé/lissé typique de l'IA, 4–10 dB = humain.",
      silenceRatio: "Proportion du morceau sous −60 dBFS. Des valeurs extrêmes (0% ou >40%) sont suspectes.",
      envelopeRepetition: "Autocorrélation de l'enveloppe RMS. >0.6 = motifs très répétés/bouclés, typique des sorties IA courtes.",
      noiseFloorDb: "Niveau du bruit de fond résiduel. <−70 dB = plancher anormalement propre (IA), bruit ambiant naturel = plus haut.",
    } as Record<FeatureKey, string>,
    verdicts: {
      very_likely: "très probable",
      likely: "probablement",
      unlikely: "probablement pas",
      very_unlikely: "très peu probable",
    },
    backHome: "← Retour à l'accueil",
  },
  en: {
    title: "AI Song Checker",
    tagline: "Detect if a track was generated by AI — 100% local, no upload.",
    dropTitle: "Drop an audio file here",
    dropSub: "or click to browse (MP3, WAV, FLAC, M4A, OGG)",
    analyzing: "Running acoustic analysis…",
    analyze: "Analyze another file",
    duration: "Duration",
    seconds: "seconds",
    spectral: "Spectral analysis",
    temporal: "Temporal analysis",
    overall: "Overall verdict",
    human: "Human",
    hybrid: "Hybrid (AI + Human)",
    ai: "Pure AI",
    invalid: "Invalid audio file. Accepted formats: MP3, WAV, FLAC, M4A, OGG.",
    error: "Error analyzing file.",
    disclaimerTitle: "Method & limits",
    disclaimer:
      "Analysis combines 16 acoustic markers (spectral flatness, phase coherence, HF cutoff, stereo correlation, mel-band variation, transient regularity, micro-dynamics, noise floor, envelope repetition, decay tails, breath presence…). The verdict is reached by elimination: if obvious traces of real recording are detected, the « pure AI » option is ruled out (and vice-versa). This is NOT a trained AI model: very clean masters, rigid electronic productions or mono recordings can produce false positives.",
    detailsTitle: "Detailed measurements",
    topMarkersTitle: "Key signals",
    sideAi: "AI signal",
    sideHuman: "human signal",
    confidenceTitle: "Analysis reliability",
    confidence: { high: "High", medium: "Medium", low: "Low" } as Record<Confidence, string>,
    confidenceHelp: {
      high: "The file provides enough material for a solid verdict.",
      medium: "Some limitations detected — the verdict is indicative.",
      low: "Too little usable material — treat the verdict with caution.",
    } as Record<Confidence, string>,
    qualityIssues: {
      shortFile: "Short file (< 10 s) — limited analysis material.",
      lowSampleRate: "Low sample rate — limited bandwidth.",
      lowBandwidth: "Very narrow bandwidth (low-bitrate MP3?) — can mimic an AI signature.",
      noisy: "High noise floor — can mask AI markers.",
      monoOnly: "Mono or fake-stereo file — stereo correlation is not exploitable.",
    } as Record<QualityIssue, string>,
    markerLabels: {
      flatnessStd: "Spectral variance",
      hfCutoff: "High-frequency cutoff",
      hfEnergyRatio: "Energy >16 kHz",
      stereoCorr: "Stereo image",
      melCv: "Mel band variation",
      phaseCoherence: "Phase coherence",
      rolloff85: "Spectral rolloff",
      onsetCv: "Transient regularity",
      rmsMicro: "Micro-dynamics",
      envRepetition: "Envelope repetition",
      noiseFloor: "Noise floor",
      zcrCv: "Pitch stability",
      decayRegularity: "Decay tails",
      breathRatio: "Breaths / ambience",
    } as Record<MarkerId, string>,
    features: {
      spectralFlatnessMean: "Mean spectral flatness",
      spectralFlatnessStd: "Flatness variance",
      hfCutoffHz: "HF cutoff (Hz)",
      hfEnergyRatio: "Energy >16 kHz",
      stereoCorrelation: "Stereo correlation",
      onsetIntervalCv: "Onset interval CV",
      rmsMicroDynamics: "RMS micro-dynamics (dB)",
      silenceRatio: "Silence ratio",
      envelopeRepetition: "Envelope repetition",
      noiseFloorDb: "Noise floor (dB)",
    } as Record<FeatureKey, string>,
    featureDesc: {
      spectralFlatnessMean: "Tells whether the spectrum is noise-like (near 1) or tonal/musical (near 0).",
      spectralFlatnessStd: "How much spectral texture varies over time. Low variance (<0.04) signals an unnaturally uniform AI output.",
      hfCutoffHz: "Frequency where high-end energy disappears. A sharp cutoff between 14–17 kHz is typical of AI generators (Suno, Udio, MusicGen).",
      hfEnergyRatio: "Share of energy above 16 kHz. Very low (<0.5%) = artificially limited bandwidth, often AI.",
      stereoCorrelation: "Similarity between L/R channels. >0.95 = near-mono (common with AI), 0.4–0.9 = natural stereo, <0.2 = unusual.",
      onsetIntervalCv: "Regularity of attacks/hits. <0.2 = overly metronomic (often AI), 0.3–0.7 = natural human playing.",
      rmsMicroDynamics: "Volume variations over 50 ms windows. <3 dB = heavily compressed/smoothed AI signal, 4–10 dB = human.",
      silenceRatio: "Share of the track below −60 dBFS. Extreme values (0% or >40%) are suspicious.",
      envelopeRepetition: "Autocorrelation of the RMS envelope. >0.6 = strongly looped/repeated patterns, typical of short AI outputs.",
      noiseFloorDb: "Residual background noise level. <−70 dB = unnaturally clean floor (AI); natural ambience sits higher.",
    } as Record<FeatureKey, string>,
    verdicts: {
      very_likely: "very likely",
      likely: "likely",
      unlikely: "unlikely",
      very_unlikely: "very unlikely",
    },
    backHome: "← Back home",
  },
};

const verdictColor = (v: Verdict) => {
  switch (v) {
    case "very_likely":
      return "text-red-400";
    case "likely":
      return "text-orange-400";
    case "unlikely":
      return "text-emerald-300";
    case "very_unlikely":
      return "text-emerald-400";
  }
};

const ProbRow = ({
  label,
  pct,
  verdict,
  verdictText,
}: {
  label: string;
  pct: number;
  verdict: Verdict;
  verdictText: string;
}) => (
  <div className="flex items-center gap-3">
    <span className="w-44 shrink-0 text-sm text-muted-foreground">{label}</span>
    <div className="flex-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>
    </div>
    <span className={`w-36 shrink-0 text-right text-sm font-medium ${verdictColor(verdict)}`}>
      {verdictText} ({Math.round(pct * 100)}%)
    </span>
  </div>
);

const Block = ({
  title,
  icon: Icon,
  block,
  L,
}: {
  title: string;
  icon: typeof Activity;
  block: ProbBlock;
  L: typeof STRINGS.fr;
}) => (
  <Card className="border-primary/20 bg-card/60 backdrop-blur">
    <CardContent className="space-y-4 p-5">
      <div className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <div className="space-y-3">
        <ProbRow label={L.human} pct={block.human} verdict={block.humanVerdict} verdictText={L.verdicts[block.humanVerdict]} />
        <ProbRow label={L.hybrid} pct={block.hybrid} verdict={block.hybridVerdict} verdictText={L.verdicts[block.hybridVerdict]} />
        <ProbRow label={L.ai} pct={block.ai} verdict={block.aiVerdict} verdictText={L.verdicts[block.aiVerdict]} />
      </div>
    </CardContent>
  </Card>
);

const FEATURE_ORDER: FeatureKey[] = [
  "spectralFlatnessMean",
  "spectralFlatnessStd",
  "hfCutoffHz",
  "hfEnergyRatio",
  "stereoCorrelation",
  "onsetIntervalCv",
  "rmsMicroDynamics",
  "silenceRatio",
  "envelopeRepetition",
  "noiseFloorDb",
];

const AISongChecker = () => {
  const { i18n } = useTranslation();
  const L = STRINGS[(i18n.language === "en" ? "en" : "fr") as "fr" | "en"];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AISongCheckResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file?: File) => {
      if (!file) return;
      if (!isLikelyAudioFile(file)) {
        setError(L.invalid);
        return;
      }
      setError(null);
      setResult(null);
      setFileName(file.name);
      setIsAnalyzing(true);
      try {
        await new Promise((r) => setTimeout(r, 30));
        const r = await analyzeForAI(file);
        setResult(r);
      } catch (e) {
        console.error(e);
        setError(L.error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [L]
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${L.title} — Global Drip Studio`}
        description={L.tagline}
        path="/ai-song-checker"
        jsonLd={[
          softwareAppSchema({
            name: "AI Song Checker — Global Drip Studio",
            path: "/ai-song-checker",
            description: L.tagline,
            features: [
              "Analyse spectrale et temporelle locale",
              "Détection IA / Humain / Hybride par élimination",
              "100% navigateur, aucune upload",
            ],
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "AI Song Checker", path: "/ai-song-checker" },
          ]),
        ]}
      />
      <ToolkitHeader current={"aisong" as any} />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs items={[{ name: L.title, path: "/ai-song-checker" }]} />

        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Beta
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <Bot className="mr-2 inline h-7 w-7 text-primary" />
            {L.title}
          </h1>
          <p className="mt-3 text-muted-foreground">{L.tagline}</p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          {!result && !isAnalyzing && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`group cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border bg-card/40 hover:border-primary/50"
              }`}
            >
              <Upload className="mx-auto mb-3 h-10 w-10 text-primary" />
              <p className="font-medium">{L.dropTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{L.dropSub}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept={AUDIO_ACCEPT}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
              />
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/40 p-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{L.analyzing}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/40 p-4">
                <div className="flex items-center gap-3">
                  <FileAudio className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {L.duration}: {result.durationSec.toFixed(1)} {L.seconds} · {result.sampleRate} Hz
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-3.5 w-3.5" /> {L.analyze}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AUDIO_ACCEPT}
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
                />
              </div>

              <Block title={L.spectral} icon={BarChart3} block={result.spectral} L={L} />
              <Block title={L.temporal} icon={Activity} block={result.temporal} L={L} />
              <Block title={L.overall} icon={Sparkles} block={result.overall} L={L} />

              {result.hybridMix && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                      <Sparkles className="h-4 w-4" /> {L.mixTitle}
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-orange-400"
                        style={{ width: `${result.hybridMix.aiPct}%` }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300"
                        style={{ width: `${result.hybridMix.humanPct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-orange-400">~{result.hybridMix.aiPct}% {L.mixAi}</span>
                      <span className="text-emerald-400">~{result.hybridMix.humanPct}% {L.mixHuman}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{L.mixHelp}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border/60">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Info className="h-4 w-4 text-primary" /> {L.detailsTitle}
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    {FEATURE_ORDER.map((k) => {
                      const v = result.features[k];
                      const display = typeof v === "number"
                        ? Math.abs(v) >= 1000
                          ? v.toFixed(0)
                          : Math.abs(v) >= 10
                          ? v.toFixed(2)
                          : v.toFixed(3)
                        : String(v);
                      return (
                        <div
                          key={k}
                          className="flex items-center justify-between gap-2 rounded border border-border/40 bg-muted/20 px-3 py-1.5"
                        >
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span>{L.features[k]}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  aria-label={L.features[k]}
                                  className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground/70 hover:text-primary"
                                >
                                  <HelpCircle className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                                {L.featureDesc[k]}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-mono">{display}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                <div className="mb-1 flex items-center gap-2 font-semibold text-primary">
                  <Info className="h-4 w-4" /> {L.disclaimerTitle}
                </div>
                <p className="text-muted-foreground">{L.disclaimer}</p>
              </div>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              {L.backHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AISongChecker;

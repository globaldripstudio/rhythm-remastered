import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Download, FileAudio, Gauge, Info, Loader2, Music2, Upload, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AnalysisResult = {
  lufs: number;
  peakDb: number;
  truePeakDb: number;
  loudnessRange: number;
  maxMomentaryLufs: number;
  maxShortTermLufs: number;
  plr: number;
  momentaryLufs: number;
  shortTermLufs: number;
  curve: Array<{ time: number; momentary: number; shortTerm: number }>;
  duration: number;
  sampleRate: number;
  channels: number;
  fileName: string;
  mode: AnalysisMode;
};

type AnalysisMode = "stereo" | "left" | "right";
type MusicContext = "rap" | "pop" | "electronic" | "rock" | "acoustic" | "broadcast";
type CurveFocus = "both" | "momentary" | "shortTerm";
const professionalSettings = { windowMs: 400, hopMs: 50, gateLufs: -70, truePeak: true };

const analysisModes: Array<{ value: AnalysisMode; label: string }> = [
  { value: "stereo", label: "Stéréo" },
  { value: "left", label: "Mono gauche" },
  { value: "right", label: "Mono droite" },
];

const loudnessMarkers = [
  { value: -14, label: "-14 LUFS", hint: "Streaming dense" },
  { value: -16, label: "-16 LUFS", hint: "Streaming équilibré" },
  { value: -20, label: "-20 LUFS", hint: "Très dynamique" },
  { value: -23, label: "-23 LUFS", hint: "Broadcast EBU" },
];

const contextLabels: Record<MusicContext, string> = {
  rap: "Rap / Trap",
  pop: "Pop / R&B",
  electronic: "Électro / Club",
  rock: "Rock / Metal",
  acoustic: "Acoustique / Jazz",
  broadcast: "Podcast / Vidéo",
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

const safeFileName = (name: string) => name.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "rapport-lufs";

const dbFromPower = (power: number) => -0.691 + 10 * Math.log10(Math.max(power, 1e-12));

const getSelectedChannels = (buffer: AudioBuffer, mode: AnalysisMode) => {
  const left = buffer.getChannelData(0);
  if (mode === "left" || buffer.numberOfChannels === 1) return [left];
  const right = buffer.getChannelData(Math.min(1, buffer.numberOfChannels - 1));
  if (mode === "right") return [right];
  return [left, right];
};

const averagePower = (powers: number[]) => powers.reduce((sum, power) => sum + power, 0) / Math.max(powers.length, 1);

const percentile = (values: number[], ratio: number) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return Number.NaN;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * ratio)))];
};

const estimateTruePeak = (channels: Float32Array[]) => {
  let peak = 0;
  for (const samples of channels) {
    for (let i = 1; i < samples.length - 2; i += 1) {
      for (let phase = 0; phase < 4; phase += 1) {
        const t = phase / 4;
        const y0 = samples[i - 1];
        const y1 = samples[i];
        const y2 = samples[i + 1];
        const y3 = samples[i + 2];
        const interpolated = 0.5 * ((2 * y1) + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t * t + (-y0 + 3 * y1 - 3 * y2 + y3) * t * t * t);
        peak = Math.max(peak, Math.abs(interpolated));
      }
    }
    peak = Math.max(peak, Math.abs(samples[samples.length - 1] ?? 0));
  }
  return 20 * Math.log10(Math.max(peak, 1e-12));
};

const analyzeLoudness = async (file: File, mode: AnalysisMode): Promise<AnalysisResult> => {
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
  const windowSeconds = professionalSettings.windowMs / 1000;
  const hopSeconds = professionalSettings.hopMs / 1000;
  const blockSize = Math.max(1, Math.round(sampleRate * windowSeconds));
  const hopSize = Math.max(1, Math.round(sampleRate * hopSeconds));
  const blocks: number[] = [];
  let peak = 0;

  const channelData = Array.from({ length: channelCount }, (_, index) => renderedBuffer.getChannelData(index));

  for (let channel = 0; channel < channelCount; channel += 1) {
    const samples = channelData[channel];
    for (let i = 0; i < samples.length; i += 1) {
      peak = Math.max(peak, Math.abs(samples[i]));
    }
  }

  const selectedChannels = getSelectedChannels(renderedBuffer, mode);
  const truePeakDb = professionalSettings.truePeak ? estimateTruePeak(selectedChannels) : 20 * Math.log10(Math.max(peak, 1e-12));

  for (let start = 0; start + blockSize <= renderedBuffer.length; start += hopSize) {
    let blockPower = 0;
    for (const samples of selectedChannels) {
      let sum = 0;
      for (let i = start; i < start + blockSize; i += 1) {
        sum += samples[i] * samples[i];
      }
      blockPower += sum / blockSize;
    }
    blocks.push(blockPower);
  }

  const usableBlocks = blocks.length ? blocks : [selectedChannels.reduce((total, samples) => {
    let sum = 0;
    for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
    return total + sum / Math.max(samples.length, 1);
  }, 0)];

  const absoluteGatedBlocks = usableBlocks.filter((power) => dbFromPower(power) > professionalSettings.gateLufs);
  const firstPassBlocks = absoluteGatedBlocks.length ? absoluteGatedBlocks : usableBlocks;
  const firstPassPower = firstPassBlocks.reduce((sum, power) => sum + power, 0) / firstPassBlocks.length;
  const relativeGate = dbFromPower(firstPassPower) - 10;
  const relativeGatedBlocks = firstPassBlocks.filter((power) => dbFromPower(power) > relativeGate);
  const finalBlocks = relativeGatedBlocks.length ? relativeGatedBlocks : firstPassBlocks;
  const integratedPower = finalBlocks.reduce((sum, power) => sum + power, 0) / finalBlocks.length;
  const shortTermWindow = Math.max(1, Math.round(3 / hopSeconds));
  const curve = usableBlocks.map((power, index) => {
    const shortTermBlocks = usableBlocks.slice(Math.max(0, index - shortTermWindow + 1), index + 1);
    return {
      time: index * hopSeconds,
      momentary: dbFromPower(power),
      shortTerm: dbFromPower(averagePower(shortTermBlocks)),
    };
  });
  const latestCurvePoint = curve[curve.length - 1];
  const gatedShortTerm = curve.map((point) => point.shortTerm).filter((value) => value > professionalSettings.gateLufs);
  const loudnessRange = percentile(gatedShortTerm, 0.95) - percentile(gatedShortTerm, 0.10);
  const integratedLufs = dbFromPower(integratedPower);
  const maxMomentaryLufs = Math.max(...curve.map((point) => point.momentary).filter(Number.isFinite));
  const maxShortTermLufs = Math.max(...curve.map((point) => point.shortTerm).filter(Number.isFinite));

  return {
    lufs: integratedLufs,
    peakDb: 20 * Math.log10(Math.max(peak, 1e-12)),
    truePeakDb,
    loudnessRange: Number.isFinite(loudnessRange) ? loudnessRange : 0,
    maxMomentaryLufs,
    maxShortTermLufs,
    plr: truePeakDb - integratedLufs,
    momentaryLufs: latestCurvePoint?.momentary ?? dbFromPower(integratedPower),
    shortTermLufs: latestCurvePoint?.shortTerm ?? dbFromPower(integratedPower),
    curve,
    duration: audioBuffer.duration,
    sampleRate,
    channels: channelCount,
    fileName: file.name,
    mode,
  };
};

const LoudnessCurve = ({ data, focus, onFocusChange }: { data: AnalysisResult["curve"]; focus: CurveFocus; onFocusChange: (focus: CurveFocus) => void }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const width = 760;
  const height = 280;
  const paddingLeft = 54;
  const paddingRight = 30;
  const paddingTop = 24;
  const paddingBottom = 42;
  const usableData = data.length ? data : [{ time: 0, momentary: -70, shortTerm: -70 }];
  const values = [...usableData.flatMap((point) => [point.momentary, point.shortTerm]), ...loudnessMarkers.map((marker) => marker.value)].filter(Number.isFinite);
  const minValue = Math.floor(Math.min(...values, -24) / 5) * 5;
  const maxValue = Math.ceil(Math.max(...values, -8) / 5) * 5;
  const valueRange = Math.max(maxValue - minValue, 1);
  const timeMax = Math.max(usableData[usableData.length - 1].time, 0.1);
  const pointToCoord = (point: { time: number }, value: number) => {
    const x = paddingLeft + (point.time / timeMax) * (width - paddingLeft - paddingRight);
    const y = paddingTop + ((maxValue - value) / valueRange) * (height - paddingTop - paddingBottom);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };
  const hoveredPoint = hoveredIndex === null ? null : usableData[hoveredIndex];
  const hoverX = hoveredPoint ? paddingLeft + (hoveredPoint.time / timeMax) * (width - paddingLeft - paddingRight) : 0;
  const hoverMomentaryY = hoveredPoint ? paddingTop + ((maxValue - hoveredPoint.momentary) / valueRange) * (height - paddingTop - paddingBottom) : 0;
  const hoverShortTermY = hoveredPoint ? paddingTop + ((maxValue - hoveredPoint.shortTerm) / valueRange) * (height - paddingTop - paddingBottom) : 0;
  const momentaryPath = usableData.map((point) => pointToCoord(point, point.momentary)).join(" ");
  const shortTermPath = usableData.map((point) => pointToCoord(point, point.shortTerm)).join(" ");

  return (
    <div className="min-h-[420px] resize-y overflow-auto rounded-md border border-border bg-background/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Waves className="h-4 w-4 text-primary" />
          Courbe LUFS
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {([{ value: "both", label: "Les deux" }, { value: "momentary", label: "Momentary" }, { value: "shortTerm", label: "Short-term" }] as const).map((option) => (
            <button key={option.value} type="button" onClick={() => onFocusChange(option.value)} className={`rounded-full border px-3 py-1 transition-colors ${focus === option.value ? "border-primary bg-primary/15 text-foreground" : "border-border hover:border-primary"}`}>
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Courbe LUFS momentary et short-term" className="h-[340px] min-h-80 w-full overflow-visible" onMouseLeave={() => setHoveredIndex(null)} onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * width;
        const ratio = Math.min(1, Math.max(0, (x - paddingLeft) / (width - paddingLeft - paddingRight)));
        setHoveredIndex(Math.min(usableData.length - 1, Math.max(0, Math.round(ratio * (usableData.length - 1)))));
      }}>
        <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} className="stroke-border" strokeWidth="1" />
        <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} className="stroke-border" strokeWidth="1" />
        <text x={paddingLeft - 8} y={paddingTop - 6} textAnchor="end" className="fill-muted-foreground text-[11px]">LUFS</text>
        <text x={width - paddingRight} y={height - 10} textAnchor="end" className="fill-muted-foreground text-[11px]">temps</text>
        {[minValue, Math.round((minValue + maxValue) / 2), maxValue].map((tick) => {
          const y = paddingTop + ((maxValue - tick) / valueRange) * (height - paddingTop - paddingBottom);
          return <text key={tick} x={paddingLeft - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{tick}</text>;
        })}
        {[0, timeMax / 2, timeMax].map((tick) => {
          const x = paddingLeft + (tick / timeMax) * (width - paddingLeft - paddingRight);
          return <text key={tick} x={x} y={height - 22} textAnchor="middle" className="fill-muted-foreground text-[10px]">{formatDuration(tick)}</text>;
        })}
        {loudnessMarkers.map((marker) => {
          const y = paddingTop + ((maxValue - marker.value) / valueRange) * (height - paddingTop - paddingBottom);
          return y >= paddingTop && y <= height - paddingBottom ? (
            <g key={marker.value}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} className="stroke-border/70" strokeDasharray="5 5" strokeWidth="1" />
              <text x={width - paddingRight} y={y - 5} textAnchor="end" className="fill-muted-foreground text-[10px]">{marker.label}</text>
            </g>
          ) : null;
        })}
        <polyline points={momentaryPath} fill="none" className="stroke-primary" strokeWidth={focus === "momentary" ? "4" : "2.5"} strokeLinecap="round" strokeLinejoin="round" opacity={focus === "shortTerm" ? "0.25" : "1"} />
        <polyline points={shortTermPath} fill="none" className="stroke-accent" strokeWidth={focus === "shortTerm" ? "4" : "2.5"} strokeLinecap="round" strokeLinejoin="round" opacity={focus === "momentary" ? "0.25" : "0.95"} />
        {hoveredPoint && (
          <g pointerEvents="none">
            <line x1={hoverX} y1={paddingTop} x2={hoverX} y2={height - paddingBottom} className="stroke-foreground/40" strokeDasharray="4 4" />
            {(focus !== "shortTerm") && <circle cx={hoverX} cy={hoverMomentaryY} r="4" className="fill-primary" />}
            {(focus !== "momentary") && <circle cx={hoverX} cy={hoverShortTermY} r="4" className="fill-accent" />}
            <rect x={Math.min(hoverX + 10, width - 176)} y={Math.max(10, Math.min(hoverMomentaryY, hoverShortTermY) - 34)} width="166" height="58" rx="6" className="fill-background stroke-border" />
            <text x={Math.min(hoverX + 20, width - 166)} y={Math.max(30, Math.min(hoverMomentaryY, hoverShortTermY) - 14)} className="fill-foreground text-[11px]">{formatDuration(hoveredPoint.time)}</text>
            <text x={Math.min(hoverX + 20, width - 166)} y={Math.max(46, Math.min(hoverMomentaryY, hoverShortTermY) + 2)} className="fill-primary text-[11px]">M {hoveredPoint.momentary.toFixed(1)} LUFS</text>
            <text x={Math.min(hoverX + 20, width - 166)} y={Math.max(62, Math.min(hoverMomentaryY, hoverShortTermY) + 18)} className="fill-accent text-[11px]">S {hoveredPoint.shortTerm.toFixed(1)} LUFS</text>
          </g>
        )}
      </svg>
    </div>
  );
};

const Loudness = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>("stereo");
  const [curveFocus, setCurveFocus] = useState<CurveFocus>("both");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const inferredContext = useMemo<MusicContext | null>(() => {
    if (!result) return null;
    if (result.lufs > -11 && result.loudnessRange < 5) return "electronic";
    if (result.lufs > -12.5 && result.plr < 10) return "rap";
    if (result.lufs > -15 && result.loudnessRange < 8) return "pop";
    if (result.loudnessRange > 12 && result.lufs < -17) return "acoustic";
    if (result.lufs < -20) return "broadcast";
    return "rock";
  }, [result]);

  const targetHint = useMemo(() => {
    if (!result || !inferredContext) return null;
    const contextAdvice: Record<MusicContext, string> = {
      rap: result.lufs > -10.5 ? "Master très fort pour rap/trap : impact immédiat, mais surveille la fatigue et la marge true peak." : result.lufs > -14 ? "Zone solide pour rap/trap streaming : densité moderne avec encore un peu de respiration." : "Master rap/trap plutôt dynamique : utile pour préserver les transitoires, moins compétitif en lecture directe.",
      pop: result.lufs > -11 ? "Pop/R&B très dense : efficace en A/B, à contrôler sur voix lead, sibilances et plateformes normalisées." : result.lufs > -15 ? "Bon équilibre pop/R&B : présence moderne, voix lisible et risque limité de normalisation agressive." : "Pop/R&B très dynamique : musical, mais potentiellement plus bas perçu face aux sorties commerciales.",
      electronic: result.lufs > -9.5 ? "Électro/club très poussé : adapté à certains masters agressifs, vérifie kick/bass et distorsion inter-sample." : result.lufs > -13 ? "Électro/club dense et exploitable : bonne énergie tout en gardant du punch." : "Électro/club dynamique : intéressant pour versions extended, moins frontal pour playlists loud.",
      rock: result.lufs > -10 ? "Rock/metal très comprimé : puissant, mais attention à l'écrasement des cymbales et guitares." : result.lufs > -14 ? "Rock/metal moderne équilibré : énergie, largeur et transitoires encore contrôlables." : "Rock/metal dynamique : garde l'impact batterie, idéal si l'arrangement respire.",
      acoustic: result.lufs > -14 ? "Acoustique/jazz assez fort : vérifie que les nuances et attaques naturelles restent intactes." : result.lufs > -20 ? "Acoustique/jazz cohérent : dynamique naturelle et confort d'écoute préservés." : "Très dynamique : pertinent pour musique intimiste, piano, jazz ou livraisons audiophiles.",
      broadcast: result.lufs > -16 ? "Podcast/vidéo fort : risque de réduction par normalisation, vise souvent plus bas selon la destination." : result.lufs > -21 ? "Podcast/vidéo confortable : voix présente, compatible avec de nombreux usages web." : "Niveau proche broadcast très dynamique : adapté à certains contenus EBU, peut sembler bas en social media.",
    };
    const technical = result.truePeakDb > -1 ? " True peak élevé : prévois un plafond de limiteur plus prudent pour l'encodage." : " True peak sain pour l'export et les encodages courants.";
    return `${contextAdvice[inferredContext]}${technical}`;
  }, [inferredContext, result]);

  const runAnalysis = useCallback(async (file: File, mode: AnalysisMode) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeLoudness(file, mode);
      setResult(analysis);
    } catch (analysisError) {
      console.error(analysisError);
      setError("Impossible d'analyser ce fichier. Essaie un WAV, MP3, AIFF, FLAC ou AAC exporté correctement.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleModeChange = useCallback((mode: AnalysisMode) => {
    setSelectedMode(mode);
    if (selectedFile) void runAnalysis(selectedFile, mode);
  }, [runAnalysis, selectedFile]);

  const handleFile = useCallback(async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Sélectionne un fichier audio valide.");
      return;
    }
    setSelectedFile(file);
    await runAnalysis(file, selectedMode);
  }, [runAnalysis, selectedMode]);

  const exportPdfReport = useCallback(() => {
    if (!result) return;
    const report = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = report.internal.pageSize.getWidth();
    const margin = 16;
    const modeLabel = analysisModes.find((mode) => mode.value === result.mode)?.label ?? "Stéréo";
    report.setFillColor(12, 12, 14);
    report.rect(0, 0, pageWidth, 34, "F");
    report.setTextColor(255, 255, 255);
    report.setFont("helvetica", "bold");
    report.setFontSize(20);
    report.text("Rapport Loudness LUFS", margin, 18);
    report.setFont("helvetica", "normal");
    report.setFontSize(10);
    report.text("Global Drip Studio", margin, 26);
    report.setTextColor(24, 24, 27);
    report.setFontSize(11);
    let y = 48;
    report.text(`Fichier : ${result.fileName}`, margin, y);
    y += 7;
    report.text(`Mode : ${modeLabel} · Durée : ${formatDuration(result.duration)} · ${(result.sampleRate / 1000).toFixed(1)} kHz · ${result.channels} canal${result.channels > 1 ? "s" : ""}`, margin, y);
    y += 12;
    const metrics = [
      ["LUFS intégré", `${result.lufs.toFixed(1)} LUFS`],
      ["Momentary actuel", `${result.momentaryLufs.toFixed(1)} LUFS`],
      ["Short-term actuel", `${result.shortTermLufs.toFixed(1)} LUFS`],
      ["Peak", `${result.peakDb.toFixed(1)} dBFS`],
      ["True peak estimé", `${result.truePeakDb.toFixed(1)} dBTP`],
      ["LRA / PLR", `${result.loudnessRange.toFixed(1)} LU / ${result.plr.toFixed(1)} dB`],
      ["Maximums", `M ${result.maxMomentaryLufs.toFixed(1)} · S ${result.maxShortTermLufs.toFixed(1)} LUFS`],
      ["Profil déduit", inferredContext ? contextLabels[inferredContext] : "Analyse neutre"],
    ];
    metrics.forEach(([label, value], index) => {
      const x = margin + (index % 2) * 88;
      const rowY = y + Math.floor(index / 2) * 22;
      report.setFillColor(245, 245, 245);
      report.roundedRect(x, rowY, 82, 16, 2, 2, "F");
      report.setFont("helvetica", "normal");
      report.setFontSize(8);
      report.setTextColor(100, 100, 100);
      report.text(label, x + 4, rowY + 5);
      report.setFont("helvetica", "bold");
      report.setFontSize(12);
      report.setTextColor(20, 20, 20);
      report.text(value, x + 4, rowY + 12);
    });
    y += 100;
    report.setFont("helvetica", "bold");
    report.setFontSize(13);
    report.text("Interprétation", margin, y);
    y += 7;
    report.setFont("helvetica", "normal");
    report.setFontSize(10);
    report.text(report.splitTextToSize(targetHint ?? "Analyse effectuée avec paramètres professionnels BS.1770.", pageWidth - margin * 2), margin, y);
    y += 28;
    report.setFont("helvetica", "bold");
    report.text("Méthodologie", margin, y);
    y += 7;
    report.setFont("helvetica", "normal");
    report.text(report.splitTextToSize(`Analyse locale : fenêtre ${professionalSettings.windowMs} ms, pas ${professionalSettings.hopMs} ms, gating absolu ${professionalSettings.gateLufs} LUFS, gating relatif -10 LU, K-weighting BS.1770 et true peak estimé par interpolation 4x.`, pageWidth - margin * 2), margin, y);
    y += 24;
    report.setDrawColor(220, 220, 220);
    report.line(margin, y, pageWidth - margin, y);
    y += 8;
    report.setFont("helvetica", "bold");
    report.text("Repères", margin, y);
    y += 7;
    report.setFont("helvetica", "normal");
    report.text("-14 LUFS : streaming dense · -16 LUFS : streaming équilibré · -20 LUFS : dynamique · -23 LUFS : broadcast EBU", margin, y);
    report.save(`${safeFileName(result.fileName)}-rapport-lufs.pdf`);
  }, [inferredContext, result, targetHint]);

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
              <div className="flex flex-wrap gap-2" aria-label="Mode d'analyse LUFS">
                {analysisModes.map((mode) => (
                  <Button
                    key={mode.value}
                    type="button"
                    variant={selectedMode === mode.value ? "default" : "outline"}
                    onClick={() => handleModeChange(mode.value)}
                    disabled={isAnalyzing}
                    className="min-w-32"
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
              <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                Analyse professionnelle automatique : fenêtre 400 ms, pas 50 ms, gating BS.1770 à -70 LUFS, estimation true peak et interprétation musicale déduite des mesures.
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
                    WAV, MP3, AIFF, FLAC ou AAC. Analyse BS.1770 avec gating intégré, fenêtres momentary/short-term et estimation true peak, sans envoi serveur.
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
              <Card className="equipment-card sm:col-span-2 lg:col-span-4">
                <CardContent className="p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
                    <div className="flex min-w-0 items-center gap-3">
                      <Music2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="truncate text-sm">{result.fileName}</span>
                    </div>
                    <span className="rounded-full border border-border px-3 py-1 text-xs">
                      {analysisModes.find((mode) => mode.value === result.mode)?.label}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-5xl font-bold text-primary">{result.lufs.toFixed(1)}</p>
                      <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">LUFS intégré</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold">{result.momentaryLufs.toFixed(1)}</p>
                      <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">LUFS momentary</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold">{result.shortTermLufs.toFixed(1)}</p>
                      <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">LUFS short-term</p>
                    </div>
                  </div>
                  {targetHint && <p className="mt-4 text-sm text-muted-foreground">{targetHint}</p>}
                  <div className="mt-4 rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                    <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                      <Info className="h-4 w-4 text-primary" />
                      Repères BS.1770
                    </div>
                    <p>
                      <strong className="text-foreground">Momentary</strong> mesure une fenêtre courte de 400 ms pour suivre les variations immédiates. <strong className="text-foreground">Short-term</strong> moyenne environ 3 s pour représenter la perception récente et stable du niveau.
                    </p>
                  </div>
                  <div className="mt-6">
                    <LoudnessCurve data={result.curve} focus={curveFocus} onFocusChange={setCurveFocus} />
                  </div>
                </CardContent>
              </Card>

              <Card className="equipment-card sm:col-span-2">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Peak</p>
                  <p className="mt-3 text-3xl font-bold">{result.peakDb.toFixed(1)} dBFS</p>
                  <p className="mt-2 text-sm text-muted-foreground">True peak estimé : {result.truePeakDb.toFixed(1)} dBTP</p>
                </CardContent>
              </Card>

              <Card className="equipment-card sm:col-span-2">
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
              <Card className="equipment-card sm:col-span-2">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Dynamique</p>
                  <p className="mt-3 text-3xl font-bold">{result.loudnessRange.toFixed(1)} LU</p>
                  <p className="mt-2 text-sm text-muted-foreground">LRA estimée · PLR {result.plr.toFixed(1)} dB</p>
                </CardContent>
              </Card>
              <Card className="equipment-card sm:col-span-2">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Maximums</p>
                  <p className="mt-3 text-3xl font-bold">M {result.maxMomentaryLufs.toFixed(1)} · S {result.maxShortTermLufs.toFixed(1)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Pics momentary et short-term relevés sur toute la durée.</p>
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
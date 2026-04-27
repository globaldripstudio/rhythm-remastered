import { useCallback, useMemo, useState } from "react";
import { Download, FileAudio, Gauge, Info, Loader2, Music2, Upload, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

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
const professionalSettings = { windowMs: 400, hopMs: 100, gateLufs: -70, truePeak: true };

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

const drawPdfLoudnessCurve = (report: jsPDF, result: AnalysisResult, x: number, y: number, width: number, height: number) => {
  const data = result.curve.length ? result.curve : [{ time: 0, momentary: -70, shortTerm: -70 }];
  const values = [...data.flatMap((point) => [point.momentary, point.shortTerm]), ...loudnessMarkers.map((marker) => marker.value)].filter(Number.isFinite);
  const minValue = Math.floor(Math.min(...values, -24) / 5) * 5;
  const maxValue = Math.ceil(Math.max(...values, -8) / 5) * 5;
  const valueRange = Math.max(maxValue - minValue, 1);
  const timeMax = Math.max(data[data.length - 1].time, 0.1);
  const plot = { left: x + 12, top: y + 13, right: x + width - 30, bottom: y + height - 14 };
  const toPoint = (point: { time: number }, value: number) => ({
    x: plot.left + (point.time / timeMax) * (plot.right - plot.left),
    y: plot.top + ((maxValue - value) / valueRange) * (plot.bottom - plot.top),
  });

  report.setFillColor(17, 20, 24);
  report.roundedRect(x, y, width, height, 3, 3, "F");
  report.setDrawColor(45, 52, 60);
  report.line(plot.left, plot.bottom, plot.right, plot.bottom);
  report.line(plot.left, plot.top, plot.left, plot.bottom);
  loudnessMarkers.forEach((marker) => {
    const markerY = toPoint({ time: 0 }, marker.value).y;
    if (markerY >= plot.top && markerY <= plot.bottom) {
      report.setDrawColor(48, 56, 64);
      report.setLineDashPattern([1.5, 2], 0);
      report.line(plot.left, markerY, plot.right, markerY);
      report.setLineDashPattern([], 0);
      report.setTextColor(150, 158, 170);
      report.setFontSize(6.5);
      report.text(marker.label, plot.right + 3, markerY + 1.5);
    }
  });

  const drawSeries = (key: "momentary" | "shortTerm", color: [number, number, number]) => {
    report.setDrawColor(...color);
    report.setLineWidth(0.45);
    data.forEach((point, index) => {
      if (index === 0) return;
      const previous = toPoint(data[index - 1], data[index - 1][key]);
      const current = toPoint(point, point[key]);
      report.line(previous.x, previous.y, current.x, current.y);
    });
  };
  drawSeries("momentary", [20, 184, 166]);
  drawSeries("shortTerm", [255, 112, 54]);
  report.setTextColor(226, 232, 240);
  report.setFont("helvetica", "bold");
  report.setFontSize(9);
  report.text("Courbe LUFS", x + 6, y + 8);
  report.setFont("helvetica", "normal");
  report.setFontSize(7);
  report.setTextColor(20, 184, 166);
  report.text("Momentary", x + width - 58, y + 8);
  report.setTextColor(255, 112, 54);
  report.text("Short-term", x + width - 30, y + 8);
  report.setTextColor(150, 158, 170);
  report.text(`${formatDuration(0)}                     ${formatDuration(timeMax / 2)}                     ${formatDuration(timeMax)}`, plot.left, y + height - 4);
};

const dbFromPower = (power: number) => -0.691 + 10 * Math.log10(Math.max(power, 1e-12));

const createHighShelfCoefficients = (sampleRate: number, gainDb = 3.99984385397, frequency = 1681.974450955533, q = 0.7071752369554196) => {
  const a = 10 ** (gainDb / 40);
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const sin = Math.sin(omega);
  const cos = Math.cos(omega);
  const alpha = sin / (2 * q);
  const sqrtA = Math.sqrt(a);
  const b0 = a * ((a + 1) + (a - 1) * cos + 2 * sqrtA * alpha);
  const b1 = -2 * a * ((a - 1) + (a + 1) * cos);
  const b2 = a * ((a + 1) + (a - 1) * cos - 2 * sqrtA * alpha);
  const a0 = (a + 1) - (a - 1) * cos + 2 * sqrtA * alpha;
  const a1 = 2 * ((a - 1) - (a + 1) * cos);
  const a2 = (a + 1) - (a - 1) * cos - 2 * sqrtA * alpha;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
};

const createHighPassCoefficients = (sampleRate: number, frequency = 38.13547087602444, q = 0.5003270373238773) => {
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const sin = Math.sin(omega);
  const cos = Math.cos(omega);
  const alpha = sin / (2 * q);
  const b0 = (1 + cos) / 2;
  const b1 = -(1 + cos);
  const b2 = (1 + cos) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cos;
  const a2 = 1 - alpha;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
};

const applyBiquad = (input: Float32Array | Float64Array, coefficients: ReturnType<typeof createHighShelfCoefficients>) => {
  const output = new Float64Array(input.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < input.length; i += 1) {
    const x0 = input[i];
    const y0 = coefficients.b0 * x0 + coefficients.b1 * x1 + coefficients.b2 * x2 - coefficients.a1 * y1 - coefficients.a2 * y2;
    output[i] = y0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }
  return output;
};

const applyBs1770KWeighting = (samples: Float32Array, sampleRate: number) => {
  const preFiltered = applyBiquad(samples, createHighShelfCoefficients(sampleRate));
  return applyBiquad(preFiltered, createHighPassCoefficients(sampleRate));
};

const getSelectedChannels = (buffer: AudioBuffer, mode: AnalysisMode) => {
  const left = buffer.getChannelData(0);
  if (mode === "left" || buffer.numberOfChannels === 1) return [left];
  const right = buffer.getChannelData(Math.min(1, buffer.numberOfChannels - 1));
  if (mode === "right") return [right];
  return Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
};

const getSelectedChannelArrays = <T extends Float32Array | Float64Array>(channels: T[], mode: AnalysisMode) => {
  if (mode === "left" || channels.length === 1) return [channels[0]];
  const right = channels[Math.min(1, channels.length - 1)];
  if (mode === "right") return [right];
  return channels;
};

const getChannelWeight = (index: number) => (index === 3 || index === 4 ? 1.41 : 1);

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

const calculateWindowPowers = (channels: Array<Float32Array | Float64Array>, blockSize: number, hopSize: number) => {
  const powers: number[] = [];
  const length = Math.min(...channels.map((samples) => samples.length));
  for (let start = 0; start + blockSize <= length; start += hopSize) {
    let blockPower = 0;
    channels.forEach((samples, channelIndex) => {
      let sum = 0;
      for (let i = start; i < start + blockSize; i += 1) sum += samples[i] * samples[i];
      blockPower += getChannelWeight(channelIndex) * (sum / blockSize);
    });
    powers.push(blockPower);
  }
  return powers;
};

const calculateIntegratedPower = (blocks: number[]) => {
  const absoluteGatedBlocks = blocks.filter((power) => dbFromPower(power) >= professionalSettings.gateLufs);
  if (!absoluteGatedBlocks.length) return 0;
  const firstPassPower = averagePower(absoluteGatedBlocks);
  const relativeGate = dbFromPower(firstPassPower) - 10;
  const relativeGatedBlocks = absoluteGatedBlocks.filter((power) => dbFromPower(power) >= relativeGate);
  return relativeGatedBlocks.length ? averagePower(relativeGatedBlocks) : firstPassPower;
};

const analyzeLoudness = async (file: File, mode: AnalysisMode): Promise<AnalysisResult> => {
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextCtor();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  await audioContext.close();
  const channelCount = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const windowSeconds = professionalSettings.windowMs / 1000;
  const hopSeconds = professionalSettings.hopMs / 1000;
  const blockSize = Math.max(1, Math.round(sampleRate * windowSeconds));
  const hopSize = Math.max(1, Math.round(sampleRate * hopSeconds));
  let peak = 0;

  const channelData = Array.from({ length: channelCount }, (_, index) => audioBuffer.getChannelData(index));

  for (let channel = 0; channel < channelCount; channel += 1) {
    const samples = channelData[channel];
    for (let i = 0; i < samples.length; i += 1) {
      peak = Math.max(peak, Math.abs(samples[i]));
    }
  }

  const selectedChannels = getSelectedChannels(audioBuffer, mode);
  const truePeakDb = professionalSettings.truePeak ? estimateTruePeak(selectedChannels) : 20 * Math.log10(Math.max(peak, 1e-12));
  const weightedChannels = channelData.map((samples) => applyBs1770KWeighting(samples, sampleRate));
  const selectedWeightedChannels = getSelectedChannelArrays(weightedChannels, mode);
  const momentaryBlocks = calculateWindowPowers(selectedWeightedChannels, blockSize, hopSize);
  const fallbackPower = selectedWeightedChannels.reduce((total, samples, channelIndex) => {
    let sum = 0;
    for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
    return total + getChannelWeight(channelIndex) * (sum / Math.max(samples.length, 1));
  }, 0);
  const usableBlocks = momentaryBlocks.length ? momentaryBlocks : [fallbackPower];
  const integratedPower = calculateIntegratedPower(usableBlocks);
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
  const shortTermPowers = calculateWindowPowers(selectedWeightedChannels, Math.max(1, Math.round(sampleRate * 3)), hopSize);
  const shortTermLoudnessValues = shortTermPowers.map(dbFromPower).filter((value) => value >= professionalSettings.gateLufs);
  const lraGate = shortTermLoudnessValues.length ? (dbFromPower(calculateIntegratedPower(shortTermPowers)) - 20) : professionalSettings.gateLufs;
  const gatedShortTerm = shortTermLoudnessValues.filter((value) => value >= lraGate);
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
  const width = 860;
  const height = 320;
  const paddingLeft = 54;
  const paddingRight = 118;
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
    <div className="flex min-h-[440px] resize-y flex-col overflow-hidden rounded-md border border-border bg-background/40 p-4">
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
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Courbe LUFS momentary et short-term" className="min-h-80 w-full flex-1 overflow-visible" onMouseLeave={() => setHoveredIndex(null)} onMouseMove={(event) => {
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
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} className="stroke-border/60" strokeDasharray="5 6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <text x={width - paddingRight + 12} y={y + 4} textAnchor="start" className="fill-muted-foreground text-[10px]">{marker.label}</text>
            </g>
          ) : null;
        })}
        <polyline points={momentaryPath} fill="none" className="stroke-secondary" strokeWidth={focus === "momentary" ? "3" : "1.7"} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity={focus === "shortTerm" ? "0.22" : "1"} />
        <polyline points={shortTermPath} fill="none" className="stroke-primary" strokeWidth={focus === "shortTerm" ? "3" : "1.7"} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity={focus === "momentary" ? "0.22" : "1"} />
        {hoveredPoint && (
          <g pointerEvents="none">
            <line x1={hoverX} y1={paddingTop} x2={hoverX} y2={height - paddingBottom} className="stroke-foreground/40" strokeDasharray="4 4" />
            {(focus !== "shortTerm") && <circle cx={hoverX} cy={hoverMomentaryY} r="4" className="fill-secondary" />}
            {(focus !== "momentary") && <circle cx={hoverX} cy={hoverShortTermY} r="4" className="fill-primary" />}
            <rect x={Math.min(hoverX + 10, width - 176)} y={Math.max(10, Math.min(hoverMomentaryY, hoverShortTermY) - 34)} width="166" height="58" rx="6" className="fill-background stroke-border" />
            <text x={Math.min(hoverX + 20, width - 166)} y={Math.max(30, Math.min(hoverMomentaryY, hoverShortTermY) - 14)} className="fill-foreground text-[11px]">{formatDuration(hoveredPoint.time)}</text>
            <text x={Math.min(hoverX + 20, width - 166)} y={Math.max(46, Math.min(hoverMomentaryY, hoverShortTermY) + 2)} className="fill-secondary text-[11px]">M {hoveredPoint.momentary.toFixed(1)} LUFS</text>
            <text x={Math.min(hoverX + 20, width - 166)} y={Math.max(62, Math.min(hoverMomentaryY, hoverShortTermY) + 18)} className="fill-primary text-[11px]">S {hoveredPoint.shortTerm.toFixed(1)} LUFS</text>
          </g>
        )}
      </svg>
    </div>
  );
};

const Loudness = () => {
  const { t, i18n } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>("stereo");
  const [curveFocus, setCurveFocus] = useState<CurveFocus>("both");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const toggleLanguage = () => {
    document.body.classList.add('lang-switching');
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
    setTimeout(() => document.body.classList.remove('lang-switching'), 500);
  };

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
    const pageHeight = report.internal.pageSize.getHeight();
    const margin = 16;
    const modeLabel = analysisModes.find((mode) => mode.value === result.mode)?.label ?? "Stéréo";
    report.setFillColor(12, 14, 17);
    report.rect(0, 0, pageWidth, pageHeight, "F");
    report.setFillColor(255, 112, 54);
    report.rect(0, 0, 5, pageHeight, "F");
    report.setFillColor(20, 184, 166);
    report.rect(5, 0, 2, pageHeight, "F");
    report.setFillColor(22, 26, 32);
    report.roundedRect(margin, 14, pageWidth - margin * 2, 42, 4, 4, "F");
    report.setTextColor(255, 255, 255);
    report.setFont("helvetica", "bold");
    report.setFontSize(22);
    report.text("Rapport Loudness LUFS", margin + 6, 30);
    report.setFont("helvetica", "normal");
    report.setFontSize(10);
    report.setTextColor(180, 188, 198);
    report.text("Global Drip Studio · analyse mastering professionnelle", margin + 6, 41);
    report.setTextColor(245, 245, 245);
    report.setFontSize(11);
    let y = 70;
    report.setFont("helvetica", "bold");
    report.text(result.fileName, margin, y);
    y += 7;
    report.setFont("helvetica", "normal");
    report.setTextColor(160, 168, 178);
    report.text(`Mode ${modeLabel} · ${formatDuration(result.duration)} · ${(result.sampleRate / 1000).toFixed(1)} kHz · ${result.channels} canal${result.channels > 1 ? "s" : ""}`, margin, y);
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
      report.setFillColor(24, 29, 35);
      report.roundedRect(x, rowY, 82, 16, 2, 2, "F");
      report.setFont("helvetica", "normal");
      report.setFontSize(8);
      report.setTextColor(155, 163, 174);
      report.text(label, x + 4, rowY + 5);
      report.setFont("helvetica", "bold");
      report.setFontSize(12);
      report.setTextColor(index === 0 ? 255 : 240, index === 0 ? 112 : 245, index === 0 ? 54 : 248);
      report.text(value, x + 4, rowY + 12);
    });
    y += 94;
    drawPdfLoudnessCurve(report, result, margin, y, pageWidth - margin * 2, 72);
    y += 84;
    report.setFont("helvetica", "bold");
    report.setTextColor(255, 255, 255);
    report.text("Méthodologie", margin, y);
    y += 7;
    report.setFont("helvetica", "normal");
    report.setTextColor(175, 184, 194);
    report.text(report.splitTextToSize(`Analyse locale : filtres K-weighting BS.1770 à coefficients biquad calculés, fenêtre ${professionalSettings.windowMs} ms, recouvrement 75 %, gating absolu ${professionalSettings.gateLufs} LUFS, gating relatif -10 LU et true peak estimé par interpolation 4x.`, pageWidth - margin * 2), margin, y);
    y += 24;
    report.setDrawColor(45, 52, 60);
    report.line(margin, y, pageWidth - margin, y);
    y += 8;
    report.setFont("helvetica", "bold");
    report.setTextColor(255, 255, 255);
    report.text("Repères", margin, y);
    y += 7;
    report.setFont("helvetica", "normal");
    report.setTextColor(175, 184, 194);
    report.text("-14 LUFS : streaming dense · -16 LUFS : streaming équilibré · -20 LUFS : dynamique · -23 LUFS : broadcast EBU", margin, y);
    report.setFontSize(8);
    report.setTextColor(120, 128, 138);
    report.text("Rapport généré localement — aucun fichier audio envoyé sur serveur.", margin, pageHeight - 12);
    report.save(`${safeFileName(result.fileName)}-rapport-lufs.pdf`);
  }, [inferredContext, result]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Analyse LUFS en ligne | Global Drip Studio"
        description="Téléversez un fichier audio et mesurez sa loudness LUFS directement dans votre navigateur."
        path="/loudness"
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
                  <span className="hidden sm:inline">← {t('nav.backHome')}</span>
                  <span className="sm:hidden">← {t('nav.backHomeShort')}</span>
                </Button>
              </Link>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-border"
              aria-label="Switch language"
            >
              <span className={i18n.language === 'fr' ? 'text-foreground font-bold' : ''}>FR</span>
              <span className="text-muted-foreground/40">|</span>
              <span className={i18n.language === 'en' ? 'text-foreground font-bold' : ''}>EN</span>
            </button>
          </div>
        </div>
      </header>
      <main className="py-16 sm:py-20">
        <section className="container mx-auto px-4 sm:px-6">
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
                Analyse professionnelle automatique : K-weighting BS.1770 strict, fenêtre 400 ms, recouvrement 75 %, gating à -70 LUFS, estimation true peak et interprétation musicale déduite des mesures.
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
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    {inferredContext && <span className="rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs text-foreground">Profil déduit : {contextLabels[inferredContext]}</span>}
                    <Button type="button" onClick={exportPdfReport} variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      Rapport PDF
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-5xl font-bold text-primary">{result.lufs.toFixed(1)}</p>
                      <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">LUFS intégré</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold">{result.momentaryLufs.toFixed(1)}</p>
                      <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">LUFS momentary actuel</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold">{result.shortTermLufs.toFixed(1)}</p>
                      <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">LUFS short-term actuel</p>
                    </div>
                  </div>
                  {targetHint && (
                    <div className="mt-5 rounded-md border border-secondary/40 bg-secondary/10 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Gauge className="h-4 w-4 text-secondary" />
                        Interprétation automatique
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{targetHint}</p>
                    </div>
                  )}
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
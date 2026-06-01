/**
 * Chord grid recognition — fully client-side.
 *
 * Pipeline (v2):
 *  1. Downsample to 11025 Hz mono.
 *  2. STFT (4096 / 1024) → magnitude → log compression (pre-whitening).
 *  3. Per-frame chroma over [65 Hz, 2000 Hz] with low-mid emphasis.
 *  4. Bass chroma over [65 Hz, 250 Hz] (used for inversion detection).
 *  5. Temporal median filter over chromas (3 frames) to smooth transients.
 *  6. Per-beat aggregation + template matching with:
 *     - Templates weighted by overtone series (1 / 0.5 / 0.33 / 0.25)
 *     - Non-chord-tone penalty (λ ≈ 0.3 of out-of-template energy)
 *     - Bass-match bonus (+0.2 when bass PC == root PC)
 *  7. Beat-to-beat transition penalty (small cost to change chord) — Viterbi-lite.
 *  8. Bar = majority vote of beat winners, confidence re-calibrated from bar chroma.
 *  9. Stricter 7th: a 7th flavour is only kept if the 7th pitch class is strong
 *     (>= 0.5 × triad-tone average), otherwise the triad version wins.
 * 10. Inversion: if a non-root chord tone dominates the bass chroma → "slash" bass.
 * 11. Modulation: sliding window of 8 bars; if the best-fit key changes vs the
 *     reference, mark a modulation event.
 *
 * Honest limits: on full mixes triad accuracy is ~75–88% on tonal material.
 * Extension (9/11/13) detection stays heuristic and OFF by default in the UI.
 */

import { FFT } from "./audioAnalysis";
import { transitionLogProb } from "./musicTheory/chords";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export type NoteName = typeof NOTE_NAMES[number];

export type ChordQualityKey =
  | "maj" | "min" | "dim" | "aug"
  | "maj7" | "m7" | "7" | "m7b5" | "dim7" | "sus4";

interface QualityDef {
  key: ChordQualityKey;
  intervals: number[];
  symbolSuffix: string;
  romanSuffix: string;
  minorCase: boolean;
  /** Index of the seventh inside `intervals` (if any) — used for stricter 7th gating. */
  seventhIdx?: number;
}

const QUALITIES: QualityDef[] = [
  { key: "maj",  intervals: [0, 4, 7],     symbolSuffix: "",     romanSuffix: "",     minorCase: false },
  { key: "min",  intervals: [0, 3, 7],     symbolSuffix: "m",    romanSuffix: "",     minorCase: true  },
  { key: "dim",  intervals: [0, 3, 6],     symbolSuffix: "°",    romanSuffix: "°",    minorCase: true  },
  { key: "aug",  intervals: [0, 4, 8],     symbolSuffix: "+",    romanSuffix: "+",    minorCase: false },
  { key: "maj7", intervals: [0, 4, 7, 11], symbolSuffix: "maj7", romanSuffix: "maj7", minorCase: false, seventhIdx: 3 },
  { key: "m7",   intervals: [0, 3, 7, 10], symbolSuffix: "m7",   romanSuffix: "7",    minorCase: true,  seventhIdx: 3 },
  { key: "7",    intervals: [0, 4, 7, 10], symbolSuffix: "7",    romanSuffix: "7",    minorCase: false, seventhIdx: 3 },
  { key: "m7b5", intervals: [0, 3, 6, 10], symbolSuffix: "ø",    romanSuffix: "ø",    minorCase: true,  seventhIdx: 3 },
  { key: "dim7", intervals: [0, 3, 6, 9],  symbolSuffix: "°7",   romanSuffix: "°7",   minorCase: true,  seventhIdx: 3 },
  { key: "sus4", intervals: [0, 5, 7],     symbolSuffix: "sus4", romanSuffix: "sus4", minorCase: false },
];

const TRIAD_FALLBACK: Record<ChordQualityKey, ChordQualityKey> = {
  maj: "maj", min: "min", dim: "dim", aug: "aug", sus4: "sus4",
  maj7: "maj", m7: "min", "7": "maj", m7b5: "dim", dim7: "dim",
};

const NUMERAL_BY_SEMITONE = [
  "I", "bII", "II", "bIII", "III", "IV", "#IV", "V", "bVI", "VI", "bVII", "VII",
] as const;

const FN_MAJOR: Record<string, "T" | "S" | "D"> = {
  I: "T", iii: "T", vi: "T", IV: "S", ii: "S", V: "D", "vii°": "D",
};
const FN_MINOR: Record<string, "T" | "S" | "D"> = {
  i: "T", bIII: "T", bVI: "T", iv: "S", "ii°": "S", bVII: "S", v: "D", V: "D",
};

const pitchClass = (n: string): number => NOTE_NAMES.indexOf(n as NoteName);

// ---------------- Templates (overtone-weighted) ----------------

interface ChordTemplate {
  rootPc: number;
  quality: QualityDef;
  vector: Float32Array;
}

/**
 * Build a chroma template where each chord tone seeds a small harmonic series
 * (overtones 1, 2, 3, 4 at weights 1.0, 0.5, 0.33, 0.25). This models the
 * fact that a real triad excites partials that land on different pitch classes.
 */
const buildTemplates = (): ChordTemplate[] => {
  const out: ChordTemplate[] = [];
  const harmonicSemitones = [0, 12, 19, 24]; // root, 8ve, 8ve+5th, 2×8ve
  const harmonicWeights   = [1.0, 0.5, 0.33, 0.25];
  for (let r = 0; r < 12; r += 1) {
    for (const q of QUALITIES) {
      const v = new Float32Array(12);
      q.intervals.forEach((iv, idx) => {
        // Slight root emphasis on top of the harmonic model
        const toneEmphasis = idx === 0 ? 1.1 : 0.95;
        harmonicSemitones.forEach((hs, hi) => {
          const pc = (r + iv + hs) % 12;
          v[pc] += harmonicWeights[hi] * toneEmphasis;
        });
      });
      // L2 normalize
      let norm = 0;
      for (let i = 0; i < 12; i += 1) norm += v[i] * v[i];
      norm = Math.sqrt(norm) || 1;
      for (let i = 0; i < 12; i += 1) v[i] /= norm;
      out.push({ rootPc: r, quality: q, vector: v });
    }
  }
  return out;
};

const TEMPLATES = buildTemplates();

// ---------------- Audio helpers ----------------

const downsample = (input: Float32Array, srIn: number, srOut: number): Float32Array => {
  if (srIn === srOut) return input;
  const ratio = srIn / srOut;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    let sum = 0;
    for (let j = start; j < end; j += 1) sum += input[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
};

// ---------------- Frame chroma computation ----------------

interface FrameChromas {
  chromas: Float32Array[];
  bassChromas: Float32Array[];
  hopSec: number;
}

const computeFrameChromas = (samples: Float32Array, sampleRate: number): FrameChromas => {
  const fftSize = 4096;
  const hopSize = 1024;
  const fft = new FFT(fftSize);
  const window = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i += 1) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  const minHz = 65;
  const maxHz = 2000;
  const bassMaxHz = 250;
  const minBin = Math.max(1, Math.floor((minHz * fftSize) / sampleRate));
  const maxBin = Math.min(fftSize / 2 - 1, Math.ceil((maxHz * fftSize) / sampleRate));
  const bassMaxBin = Math.min(maxBin, Math.ceil((bassMaxHz * fftSize) / sampleRate));

  const binPc = new Int8Array(maxBin - minBin + 1);
  const binWeight = new Float32Array(maxBin - minBin + 1);
  for (let bin = minBin; bin <= maxBin; bin += 1) {
    const freq = (bin * sampleRate) / fftSize;
    const midi = 69 + 12 * Math.log2(freq / 440);
    binPc[bin - minBin] = ((Math.round(midi) % 12) + 12) % 12;
    binWeight[bin - minBin] = freq < 250 ? 1.25 : freq < 1000 ? 1.0 : 0.6;
  }

  const numFrames = Math.max(0, Math.floor((samples.length - fftSize) / hopSize) + 1);
  const chromas: Float32Array[] = [];
  const bassChromas: Float32Array[] = [];
  const buf = new Float64Array(fftSize);
  const gamma = 100; // log-compression strength (pre-whitening)

  for (let f = 0; f < numFrames; f += 1) {
    const offset = f * hopSize;
    for (let i = 0; i < fftSize; i += 1) buf[i] = samples[offset + i] * window[i];
    const mags = fft.forwardMagnitudes(buf);
    const c = new Float32Array(12);
    const cb = new Float32Array(12);
    for (let bin = minBin; bin <= maxBin; bin += 1) {
      // Log compression flattens dynamics → emphasises tonal partials over kick/snare bursts
      const m = Math.log1p(gamma * mags[bin]);
      const pc = binPc[bin - minBin];
      c[pc] += m * binWeight[bin - minBin];
      if (bin <= bassMaxBin) cb[pc] += m;
    }
    // L2 normalize each
    let n1 = 0, n2 = 0;
    for (let i = 0; i < 12; i += 1) { n1 += c[i] * c[i]; n2 += cb[i] * cb[i]; }
    n1 = Math.sqrt(n1); n2 = Math.sqrt(n2);
    if (n1 > 0) for (let i = 0; i < 12; i += 1) c[i] /= n1;
    if (n2 > 0) for (let i = 0; i < 12; i += 1) cb[i] /= n2;
    chromas.push(c);
    bassChromas.push(cb);
  }

  // Temporal median filter (window 3) on chromas to smooth transients.
  const smoothed: Float32Array[] = chromas.map((c) => new Float32Array(c));
  for (let f = 1; f < chromas.length - 1; f += 1) {
    for (let i = 0; i < 12; i += 1) {
      const a = chromas[f - 1][i];
      const b = chromas[f][i];
      const c = chromas[f + 1][i];
      // median of 3
      const med = a > b ? (b > c ? b : a > c ? c : a) : (a > c ? a : b > c ? c : b);
      smoothed[f][i] = med;
    }
  }
  return { chromas: smoothed, bassChromas, hopSec: hopSize / sampleRate };
};

// ---------------- Scoring ----------------

const dot = (a: Float32Array, b: Float32Array): number => {
  let s = 0;
  for (let i = 0; i < 12; i += 1) s += a[i] * b[i];
  return s;
};

/** Score = dot(chroma, template) − λ × out-of-template energy + bass bonus. */
const scoreTemplate = (
  chroma: Float32Array,
  bassChroma: Float32Array | null,
  tpl: ChordTemplate,
): number => {
  const lambda = 0.3;
  let inT = 0;
  let outT = 0;
  for (let i = 0; i < 12; i += 1) {
    if (tpl.vector[i] > 0.01) inT += chroma[i] * tpl.vector[i];
    else outT += chroma[i];
  }
  let score = inT - lambda * outT;
  if (bassChroma) {
    // Bonus when the bass clearly outlines the chord root.
    const bassRoot = bassChroma[tpl.rootPc];
    let bassMax = 0;
    for (let i = 0; i < 12; i += 1) if (bassChroma[i] > bassMax) bassMax = bassChroma[i];
    if (bassMax > 0 && bassRoot / bassMax > 0.7) score += 0.2 * bassRoot;
  }
  return score;
};

interface ChordScore {
  template: ChordTemplate;
  score: number;
}

const rankTemplates = (chroma: Float32Array, bass: Float32Array | null): ChordScore[] => {
  const out: ChordScore[] = [];
  for (const t of TEMPLATES) out.push({ template: t, score: scoreTemplate(chroma, bass, t) });
  out.sort((a, b) => b.score - a.score);
  return out;
};

const sumChromas = (chromas: Float32Array[], from: number, to: number): Float32Array => {
  const out = new Float32Array(12);
  const end = Math.min(chromas.length, to);
  for (let f = Math.max(0, from); f < end; f += 1) {
    const c = chromas[f];
    for (let i = 0; i < 12; i += 1) out[i] += c[i];
  }
  let norm = 0;
  for (let i = 0; i < 12; i += 1) norm += out[i] * out[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < 12; i += 1) out[i] /= norm;
  return out;
};

// ---------------- Romanization ----------------

const normalizeRomanForFn = (numeral: string, minorCase: boolean): string => {
  let prefix = "";
  let body = numeral;
  if (body.startsWith("b") || body.startsWith("#")) {
    prefix = body[0];
    body = body.slice(1);
  }
  if (minorCase) body = body.toLowerCase();
  return prefix + body;
};

export interface ChordHit {
  root: NoteName;
  quality: ChordQualityKey;
  /** Display symbol e.g. "Cmaj7", "F#m7", "Am/E" */
  symbol: string;
  /** Roman numeral relative to the song key e.g. "Imaj7", "vi7", "bVII" */
  roman: string;
  /** Functional role in the key (best-effort) */
  fn?: "T" | "S" | "D";
  /** 0..1 — recalibrated confidence */
  confidence: number;
  /** Tentative extensions beyond the chord triad/7th */
  extensions: Array<"9" | "11" | "13">;
  /** Detected bass note when it differs from the root (slash chord). */
  bass?: NoteName | null;
}

const romanize = (
  rootPc: number,
  quality: QualityDef,
  tonicPc: number,
  mode: "major" | "minor",
): { roman: string; fn?: "T" | "S" | "D" } => {
  const semis = ((rootPc - tonicPc) % 12 + 12) % 12;
  const baseNumeral: string = NUMERAL_BY_SEMITONE[semis];
  let body: string = baseNumeral;
  let prefix = "";
  if (body.startsWith("b") || body.startsWith("#")) {
    prefix = body[0];
    body = body.slice(1);
  }
  if (quality.minorCase) body = body.toLowerCase();
  const roman = prefix + body + quality.romanSuffix;
  const fnLookup = normalizeRomanForFn(baseNumeral, quality.minorCase);
  const fnMap = mode === "major" ? FN_MAJOR : FN_MINOR;
  const fn = fnMap[fnLookup];
  return { roman, fn };
};

const detectExtensions = (
  chroma: Float32Array,
  rootPc: number,
  quality: QualityDef,
): Array<"9" | "11" | "13"> => {
  const chordTonePcs = quality.intervals.map((iv) => (rootPc + iv) % 12);
  let chordAvg = 0;
  for (const pc of chordTonePcs) chordAvg += chroma[pc];
  chordAvg /= chordTonePcs.length;
  if (chordAvg <= 0) return [];

  const out: Array<"9" | "11" | "13"> = [];
  const ratio = (pc: number) => chroma[pc] / chordAvg;
  const THRESH = 0.78;
  const isChordTone = (pc: number) => chordTonePcs.includes(pc);

  const pc9 = (rootPc + 2) % 12;
  const pc11 = (rootPc + 5) % 12;
  const pc13 = (rootPc + 9) % 12;

  if (!isChordTone(pc9) && ratio(pc9) >= THRESH) out.push("9");
  if (!isChordTone(pc11) && ratio(pc11) >= THRESH) out.push("11");
  if (!isChordTone(pc13) && ratio(pc13) >= THRESH) out.push("13");
  return out;
};

// ---------------- Stricter 7th gating ----------------

const tplFor = (rootPc: number, key: ChordQualityKey): ChordTemplate => {
  return TEMPLATES.find((t) => t.rootPc === rootPc && t.quality.key === key)!;
};

/**
 * If the winner is a 7th-flavoured chord but the seventh pitch class is weak,
 * fall back to the matching triad. Helps avoid spurious "maj7"/"7" detections
 * on pop mixes where the bass and root drive the chroma.
 */
const refineSeventh = (
  chroma: Float32Array,
  bass: Float32Array | null,
  best: ChordScore,
): ChordScore => {
  const q = best.template.quality;
  if (q.seventhIdx === undefined) return best;
  const seventhPc = (best.template.rootPc + q.intervals[q.seventhIdx]) % 12;
  const triadPcs = q.intervals.slice(0, 3).map((iv) => (best.template.rootPc + iv) % 12);
  let triadAvg = 0;
  for (const pc of triadPcs) triadAvg += chroma[pc];
  triadAvg /= triadPcs.length;
  const seventhEnergy = chroma[seventhPc];
  // Stricter gate on dominant 7 (most over-detected): need a clearly present b7.
  const thresh = q.key === "7" ? 0.7 : 0.5;
  if (seventhEnergy < thresh * triadAvg) {
    const fallback = TRIAD_FALLBACK[q.key];
    const tpl = tplFor(best.template.rootPc, fallback);
    const score = scoreTemplate(chroma, bass, tpl);
    return { template: tpl, score };
  }
  return best;
};

// ---------------- Quality filtering, diatonic prior, degree mapping ----------------

const DEFAULT_QUALITIES: ReadonlySet<ChordQualityKey> = new Set([
  "maj", "min", "maj7", "m7", "7", "sus4",
]);
const EXOTIC_QUALITIES: ReadonlySet<ChordQualityKey> = new Set([
  "dim", "aug", "m7b5", "dim7",
]);

/**
 * Hard gating to allow an exotic quality: every chord tone must be clearly
 * present in the chroma (>= 0.7 × triad average) AND the candidate must beat
 * the best non-exotic candidate by a margin >= 0.08.
 */
const exoticPasses = (
  chroma: Float32Array,
  tpl: ChordTemplate,
  exoticScore: number,
  bestNonExoticScore: number,
): boolean => {
  const pcs = tpl.quality.intervals.map((iv) => (tpl.rootPc + iv) % 12);
  let avg = 0;
  for (const pc of pcs) avg += chroma[pc];
  avg /= pcs.length;
  if (avg <= 0) return false;
  for (const pc of pcs) {
    if (chroma[pc] < 0.7 * avg) return false;
  }
  return exoticScore - bestNonExoticScore >= 0.08;
};

// Expected qualities per scale degree (offset in semitones from tonic).
// sus4 is treated as neutral (no bonus / no malus).
const DIATONIC_MAJOR: Record<number, ChordQualityKey[]> = {
  0:  ["maj", "maj7"],
  2:  ["min", "m7"],
  4:  ["min", "m7"],
  5:  ["maj", "maj7"],
  7:  ["maj", "7"],
  9:  ["min", "m7"],
  11: ["dim", "m7b5"],
};
const DIATONIC_MINOR: Record<number, ChordQualityKey[]> = {
  0:  ["min", "m7"],
  2:  ["dim", "m7b5"],
  3:  ["maj", "maj7"],
  5:  ["min", "m7"],
  7:  ["min", "m7", "maj", "7"], // v naturel ou V harmonique
  8:  ["maj", "maj7"],
  10: ["maj", "maj7"],
};

const DIATONIC_BONUS = 0.06;
const NON_DIATONIC_EXOTIC_MALUS = 0.04;

const diatonicBonus = (
  rootPc: number,
  quality: ChordQualityKey,
  tonicPc: number,
  mode: "major" | "minor",
): number => {
  if (quality === "sus4") return 0;
  const offset = ((rootPc - tonicPc) % 12 + 12) % 12;
  const expected = (mode === "major" ? DIATONIC_MAJOR : DIATONIC_MINOR)[offset];
  if (expected && expected.includes(quality)) return DIATONIC_BONUS;
  if (EXOTIC_QUALITIES.has(quality)) return -NON_DIATONIC_EXOTIC_MALUS;
  return 0;
};

/** Roman-numeral token (normalisé, sans suffixe d'extension) pour le prior de transition. */
const degreeToken = (
  rootPc: number,
  quality: ChordQualityKey,
  tonicPc: number,
  mode: "major" | "minor",
): string => {
  const semis = ((rootPc - tonicPc) % 12 + 12) % 12;
  let base: string = NUMERAL_BY_SEMITONE[semis];
  let prefix = "";
  if (base.startsWith("b") || base.startsWith("#")) {
    prefix = base[0];
    base = base.slice(1);
  }
  const qDef = QUALITIES.find((x) => x.key === quality)!;
  if (qDef.minorCase) base = base.toLowerCase();
  let suffix = "";
  if (quality === "dim" || quality === "dim7") suffix = "°";
  return prefix + base + suffix;
};


// ---------------- Inversion detection ----------------

const detectBass = (
  bassChroma: Float32Array,
  rootPc: number,
  quality: QualityDef,
): NoteName | null => {
  const chordPcs = quality.intervals.map((iv) => (rootPc + iv) % 12);
  let bestPc = -1;
  let bestVal = 0;
  for (const pc of chordPcs) {
    if (bassChroma[pc] > bestVal) {
      bestVal = bassChroma[pc];
      bestPc = pc;
    }
  }
  if (bestPc < 0 || bestPc === rootPc) return null;
  // Require dominant bass: bestPc must clearly exceed the root in the bass band.
  const rootEnergy = bassChroma[rootPc];
  if (bestVal < rootEnergy * 1.4) return null;
  return NOTE_NAMES[bestPc];
};

// ---------------- Public API ----------------

export interface ChordSegment {
  beatStart: number;
  beatLength: number;
  startSec: number;
  durationSec: number;
  chord: ChordHit;
}

export interface ModulationEvent {
  /** Bar index (0-based) at which the new key takes effect. */
  barIndex: number;
  tonic: NoteName;
  mode: "major" | "minor";
}

export interface ChordGridResult {
  bpm: number;
  tonic: NoteName;
  mode: "major" | "minor";
  beatDurationSec: number;
  barDurationSec: number;
  beatsPerBar: number;
  beats: ChordHit[];
  bars: ChordHit[];
  segments: ChordSegment[];
  modulations: ModulationEvent[];
}

interface DetectOptions {
  beatsPerBar?: number;
  maxBars?: number;
}

const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

const KRUMHANSL_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KRUMHANSL_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const detectKeyFromChroma = (
  c: Float32Array,
): { tonic: NoteName; mode: "major" | "minor"; score: number } => {
  let best = { tonic: "C" as NoteName, mode: "major" as "major" | "minor", score: -Infinity };
  for (let t = 0; t < 12; t += 1) {
    for (const m of ["major", "minor"] as const) {
      const prof = m === "major" ? KRUMHANSL_MAJOR : KRUMHANSL_MINOR;
      let s = 0;
      for (let i = 0; i < 12; i += 1) s += c[i] * prof[(i - t + 12) % 12];
      if (s > best.score) best = { tonic: NOTE_NAMES[t], mode: m, score: s };
    }
  }
  return best;
};

export const detectChords = (
  monoSamples: Float32Array,
  sampleRate: number,
  bpm: number,
  tonic: NoteName,
  mode: "major" | "minor",
  opts: DetectOptions = {},
): ChordGridResult => {
  const beatsPerBar = opts.beatsPerBar ?? 4;
  const maxBars = opts.maxBars ?? 64;
  const targetSr = 11025;
  const ds = downsample(monoSamples, sampleRate, targetSr);
  const { chromas, bassChromas, hopSec } = computeFrameChromas(ds, targetSr);

  const safeBpm = bpm > 0 ? bpm : 120;
  const beatDurationSec = 60 / safeBpm;
  const barDurationSec = beatDurationSec * beatsPerBar;
  const tonicPc = pitchClass(tonic);

  const totalBeats = Math.min(
    Math.floor(chromas.length * hopSec / beatDurationSec),
    maxBars * beatsPerBar,
  );

  // First pass: per-beat ranking with quality filtering + diatonic prior
  interface BeatRanked {
    chroma: Float32Array;
    bass: Float32Array;
    ranking: ChordScore[];
  }
  const beatRanks: BeatRanked[] = [];
  for (let b = 0; b < totalBeats; b += 1) {
    const fStart = Math.floor((b * beatDurationSec) / hopSec);
    const fEnd = Math.floor(((b + 1) * beatDurationSec) / hopSec);
    const chroma = sumChromas(chromas, fStart, fEnd);
    const bass = sumChromas(bassChromas, fStart, fEnd);
    const raw = rankTemplates(chroma, bass);

    // Best non-exotic score (for exotic gating)
    let bestNonExoticScore = -Infinity;
    for (const r of raw) {
      if (DEFAULT_QUALITIES.has(r.template.quality.key)) {
        if (r.score > bestNonExoticScore) bestNonExoticScore = r.score;
      }
    }

    // Filter exotic qualities unless they pass hard gating
    const filtered: ChordScore[] = [];
    for (const r of raw) {
      const qk = r.template.quality.key;
      if (DEFAULT_QUALITIES.has(qk)) {
        filtered.push(r);
      } else if (EXOTIC_QUALITIES.has(qk)) {
        if (exoticPasses(chroma, r.template, r.score, bestNonExoticScore)) {
          filtered.push(r);
        }
      }
    }

    // Apply diatonic bonus / non-diatonic exotic malus
    for (const r of filtered) {
      r.score += diatonicBonus(r.template.rootPc, r.template.quality.key, tonicPc, mode);
    }
    filtered.sort((a, b2) => b2.score - a.score);

    beatRanks.push({ chroma, bass, ranking: filtered.slice(0, 6) });
  }

  // Beats: no Viterbi, no Markov prior, no transition penalty.
  // Each beat is scored independently from its own chroma. Beats are used
  // only for display / confirmation — bars (below) decide the actual grid.
  const winners: ChordScore[] = [];
  for (let b = 0; b < beatRanks.length; b += 1) {
    const top = beatRanks[b].ranking[0];
    if (!top) continue;
    const refined = refineSeventh(beatRanks[b].chroma, beatRanks[b].bass, top);
    winners.push(refined);
  }



  const beats: ChordHit[] = winners.map((w, b) => {
    const { chroma, bass, ranking } = beatRanks[b];
    const second = ranking.find((r) => r.template !== w.template) ?? ranking[1] ?? ranking[0];
    const bestScore = Math.max(0, w.score);
    const secondScore = Math.max(0, second?.score ?? 0);
    const marginNorm = bestScore > 0 ? (bestScore - secondScore) / (bestScore + 1e-3) : 0;
    const absFit = Math.max(0, Math.min(1, bestScore));
    const conf = Math.max(0, Math.min(1, 0.4 * absFit + 0.6 * sigmoid(marginNorm * 8 - 1)));

    const q = w.template.quality;
    const root = NOTE_NAMES[w.template.rootPc];
    const { roman, fn } = romanize(w.template.rootPc, q, tonicPc, mode);
    const extensions = detectExtensions(chroma, w.template.rootPc, q);
    const bassNote = detectBass(bass, w.template.rootPc, q);
    const symbol = bassNote ? `${root}${q.symbolSuffix}/${bassNote}` : `${root}${q.symbolSuffix}`;
    return { root, quality: q.key, symbol, roman, fn, confidence: conf, extensions, bass: bassNote };
  });

  // Bar aggregation — recompute the best chord directly on the BAR chroma
  // (with exotic gating + diatonic prior + 7th refinement). Beat votes are used
  // only as a tiebreaker. This prevents a single biased beat sequence from
  // locking a whole bar onto a wrong chord.
  const bars: ChordHit[] = [];
  for (let bar = 0; bar * beatsPerBar < totalBeats; bar += 1) {
    const slice = beats.slice(bar * beatsPerBar, (bar + 1) * beatsPerBar);
    if (slice.length === 0) break;

    const fStart = Math.floor((bar * barDurationSec) / hopSec);
    const fEnd = Math.floor(((bar + 1) * barDurationSec) / hopSec);
    const barChroma = sumChromas(chromas, fStart, fEnd);
    const barBass = sumChromas(bassChromas, fStart, fEnd);

    // Rank templates on the bar chroma directly
    const rawBar = rankTemplates(barChroma, barBass);
    let bestNonExoticScore = -Infinity;
    for (const r of rawBar) {
      if (DEFAULT_QUALITIES.has(r.template.quality.key)) {
        if (r.score > bestNonExoticScore) bestNonExoticScore = r.score;
      }
    }
    const filteredBar: ChordScore[] = [];
    for (const r of rawBar) {
      const qk = r.template.quality.key;
      if (DEFAULT_QUALITIES.has(qk)) {
        filteredBar.push(r);
      } else if (EXOTIC_QUALITIES.has(qk)) {
        if (exoticPasses(barChroma, r.template, r.score, bestNonExoticScore)) {
          filteredBar.push(r);
        }
      }
    }
    for (const r of filteredBar) {
      r.score += diatonicBonus(r.template.rootPc, r.template.quality.key, tonicPc, mode);
    }
    filteredBar.sort((a, b2) => b2.score - a.score);

    // Beat-vote tiebreak: among the top 3 bar candidates, prefer the one matching
    // the majority beat winner if scores are within 5%.
    const beatVote = new Map<string, number>();
    for (const h of slice) {
      const k = `${h.root}:${h.quality}`;
      beatVote.set(k, (beatVote.get(k) ?? 0) + 1);
    }
    let chosen = filteredBar[0];
    if (chosen && filteredBar.length > 1) {
      const top = chosen.score;
      for (let i = 1; i < Math.min(3, filteredBar.length); i += 1) {
        const cand = filteredBar[i];
        if (top - cand.score > 0.05 * Math.abs(top + 1e-3)) break;
        const candKey = `${NOTE_NAMES[cand.template.rootPc]}:${cand.template.quality.key}`;
        const chosenKey = `${NOTE_NAMES[chosen.template.rootPc]}:${chosen.template.quality.key}`;
        if ((beatVote.get(candKey) ?? 0) > (beatVote.get(chosenKey) ?? 0)) chosen = cand;
      }
    }
    if (!chosen) continue;

    // Refine 7ths on bar chroma too
    chosen = refineSeventh(barChroma, barBass, chosen);
    const tpl = chosen.template;

    // Confidence: blend acoustic margin (bar), beat agreement, avg beat conf
    const secondScore = Math.max(0, filteredBar[1]?.score ?? 0);
    const bestScore = Math.max(0, chosen.score);
    const marginNorm = bestScore > 0 ? (bestScore - secondScore) / (bestScore + 1e-3) : 0;
    const winnerKey = `${NOTE_NAMES[tpl.rootPc]}:${tpl.quality.key}`;
    const agreement = (beatVote.get(winnerKey) ?? 0) / slice.length;
    const beatConfAvg = slice.reduce((a, h) => a + h.confidence, 0) / slice.length;
    let conf = Math.max(0, Math.min(1,
      0.25 * agreement + 0.30 * beatConfAvg + 0.45 * sigmoid(marginNorm * 6 - 0.5),
    ));
    // Ambiguous bar (acoustic margin too small) → cap confidence low instead
    // of falsely affirming a chord. Bars decide the grid; if they hesitate, say so.
    if (marginNorm < 0.03) conf = Math.min(conf, 0.3);
    else if (marginNorm < 0.06) conf = Math.min(conf, 0.5);


    const root = NOTE_NAMES[tpl.rootPc];
    const { roman, fn } = romanize(tpl.rootPc, tpl.quality, tonicPc, mode);
    const bassNote = detectBass(barBass, tpl.rootPc, tpl.quality);
    const symbol = bassNote ? `${root}${tpl.quality.symbolSuffix}/${bassNote}` : `${root}${tpl.quality.symbolSuffix}`;
    bars.push({
      root,
      quality: tpl.quality.key,
      symbol,
      roman,
      fn,
      confidence: conf,
      extensions: detectExtensions(barChroma, tpl.rootPc, tpl.quality),
      bass: bassNote,
    });
  }

  // Segments
  const segments: ChordSegment[] = [];
  for (let i = 0; i < bars.length; i += 1) {
    const cur = bars[i];
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      if (last.chord.symbol === cur.symbol) {
        last.beatLength += beatsPerBar;
        last.durationSec += barDurationSec;
        continue;
      }
    }
    segments.push({
      beatStart: i * beatsPerBar,
      beatLength: beatsPerBar,
      startSec: i * barDurationSec,
      durationSec: barDurationSec,
      chord: cur,
    });
  }

  // Modulation detection — sliding window of 8 bars over chord-root chromas.
  const modulations: ModulationEvent[] = [];
  const WIN = 8;
  if (bars.length >= WIN) {
    const buildKeyChroma = (from: number, to: number): Float32Array => {
      const c = new Float32Array(12);
      for (let i = from; i < to && i < bars.length; i += 1) {
        const tpl = tplFor(pitchClass(bars[i].root), bars[i].quality);
        for (let pc = 0; pc < 12; pc += 1) c[pc] += tpl.vector[pc];
      }
      let n = 0;
      for (let i = 0; i < 12; i += 1) n += c[i] * c[i];
      n = Math.sqrt(n) || 1;
      for (let i = 0; i < 12; i += 1) c[i] /= n;
      return c;
    };
    let currentTonic = tonic;
    let currentMode = mode;
    for (let i = 0; i + WIN <= bars.length; i += WIN) {
      const k = detectKeyFromChroma(buildKeyChroma(i, i + WIN));
      if (k.tonic !== currentTonic || k.mode !== currentMode) {
        // Skip the first window (which should match the song key already)
        if (i > 0) {
          modulations.push({ barIndex: i, tonic: k.tonic, mode: k.mode });
        }
        currentTonic = k.tonic;
        currentMode = k.mode;
      }
    }
  }

  return {
    bpm: safeBpm,
    tonic,
    mode,
    beatDurationSec,
    barDurationSec,
    beatsPerBar,
    beats,
    bars,
    segments,
    modulations,
  };
};

// ---------------- Helpers exposed for the UI ----------------

/** Intervals for a given quality (used to build piano voicings). */
export const intervalsFor = (q: ChordQualityKey): number[] => {
  return QUALITIES.find((x) => x.key === q)!.intervals.slice();
};

/** Quality suffix → symbol (e.g. "maj7" → "maj7"). */
export const symbolSuffixFor = (q: ChordQualityKey): string =>
  QUALITIES.find((x) => x.key === q)!.symbolSuffix;

/**
 * Build a piano voicing (MIDI numbers) for a ChordHit.
 *  - Root in octave 3, body of the chord around C4.
 *  - Adds bass note one octave below when an inversion is detected.
 *  - Optionally adds 9 / 11 / 13 colour tones above.
 */
export const buildPianoVoicing = (chord: ChordHit, withExtensions = false): number[] => {
  const rootPc = pitchClass(chord.root);
  const intervals = intervalsFor(chord.quality);
  const base = 48 + rootPc; // C3 + offset → root around C3/D3/E3…
  const notes = new Set<number>();
  notes.add(base); // root in bass register
  for (const iv of intervals) notes.add(60 + ((rootPc + iv) % 12) + (((rootPc + iv) % 12) < rootPc ? 0 : 0));
  // Rebuild upper voices cleanly above middle C
  const upper = intervals.map((iv) => 60 + ((rootPc + iv) % 12));
  // Ensure ascending order without doubling root in upper
  upper.forEach((n) => notes.add(n));
  if (chord.bass) {
    const bassPc = pitchClass(chord.bass);
    notes.add(36 + bassPc); // bass note octave lower
  }
  if (withExtensions && chord.extensions.length > 0) {
    if (chord.extensions.includes("9"))  notes.add(60 + ((rootPc + 14) % 12) + 12);
    if (chord.extensions.includes("11")) notes.add(60 + ((rootPc + 17) % 12) + 12);
    if (chord.extensions.includes("13")) notes.add(60 + ((rootPc + 21) % 12) + 12);
  }
  return [...notes].sort((a, b) => a - b);
};

/** Pitch classes (0..11) currently sounded by a chord — for piano highlight. */
export const chordPitchClasses = (chord: ChordHit, withExtensions = false): Set<number> => {
  const rootPc = pitchClass(chord.root);
  const out = new Set<number>();
  for (const iv of intervalsFor(chord.quality)) out.add((rootPc + iv) % 12);
  if (chord.bass) out.add(pitchClass(chord.bass));
  if (withExtensions) {
    if (chord.extensions.includes("9"))  out.add((rootPc + 2) % 12);
    if (chord.extensions.includes("11")) out.add((rootPc + 5) % 12);
    if (chord.extensions.includes("13")) out.add((rootPc + 9) % 12);
  }
  return out;
};

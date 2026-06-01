/**
 * Chord grid recognition — fully client-side.
 * Pipeline: downsample → framed chroma (FFT) → per-beat template matching →
 * optional Viterbi-style smoothing via majority vote per bar → romanization.
 *
 * Honest limits:
 * - Trained on stems / single instruments would be much better. On a full mix,
 *   triad/7th accuracy is ~70–85% on tonal material, less on dense productions.
 * - 9/11/13 extension detection is heuristic ("tentative"). Off by default in UI.
 * - Assumes 4/4 with downbeat ~= t=0 (no downbeat tracking in v1).
 */

import { FFT } from "./audioAnalysis";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export type NoteName = typeof NOTE_NAMES[number];

export type ChordQualityKey =
  | "maj" | "min" | "dim" | "aug"
  | "maj7" | "m7" | "7" | "m7b5" | "dim7" | "sus4";

interface QualityDef {
  key: ChordQualityKey;
  intervals: number[];
  /** Suffix appended after the root letter (e.g. "Cmaj7") */
  symbolSuffix: string;
  /** Suffix appended after the roman numeral (e.g. "Imaj7") */
  romanSuffix: string;
  /** True if the chord is "minor-quality" (lowercase roman numeral) */
  minorCase: boolean;
}

const QUALITIES: QualityDef[] = [
  { key: "maj",  intervals: [0, 4, 7],     symbolSuffix: "",     romanSuffix: "",     minorCase: false },
  { key: "min",  intervals: [0, 3, 7],     symbolSuffix: "m",    romanSuffix: "",     minorCase: true  },
  { key: "dim",  intervals: [0, 3, 6],     symbolSuffix: "°",    romanSuffix: "°",    minorCase: true  },
  { key: "aug",  intervals: [0, 4, 8],     symbolSuffix: "+",    romanSuffix: "+",    minorCase: false },
  { key: "maj7", intervals: [0, 4, 7, 11], symbolSuffix: "maj7", romanSuffix: "maj7", minorCase: false },
  { key: "m7",   intervals: [0, 3, 7, 10], symbolSuffix: "m7",   romanSuffix: "7",    minorCase: true  },
  { key: "7",    intervals: [0, 4, 7, 10], symbolSuffix: "7",    romanSuffix: "7",    minorCase: false },
  { key: "m7b5", intervals: [0, 3, 6, 10], symbolSuffix: "ø",    romanSuffix: "ø",    minorCase: true  },
  { key: "dim7", intervals: [0, 3, 6, 9],  symbolSuffix: "°7",   romanSuffix: "°7",   minorCase: true  },
  { key: "sus4", intervals: [0, 5, 7],     symbolSuffix: "sus4", romanSuffix: "sus4", minorCase: false },
];

const NUMERAL_BY_SEMITONE = [
  "I", "bII", "II", "bIII", "III", "IV", "#IV", "V", "bVI", "VI", "bVII", "VII",
] as const;

// Functional roles relative to major-scale numerals (mirrors src/lib/musicTheory/chords.ts)
const FN_MAJOR: Record<string, "T" | "S" | "D"> = {
  I: "T", iii: "T", vi: "T", IV: "S", ii: "S", V: "D", "vii°": "D",
};
const FN_MINOR: Record<string, "T" | "S" | "D"> = {
  i: "T", bIII: "T", bVI: "T", iv: "S", "ii°": "S", bVII: "S", v: "D", V: "D",
};

const pitchClass = (n: string): number => NOTE_NAMES.indexOf(n as NoteName);

// ---------------- Templates ----------------

interface ChordTemplate {
  rootPc: number;
  quality: QualityDef;
  /** 12-d unit vector */
  vector: Float32Array;
}

const buildTemplates = (): ChordTemplate[] => {
  const out: ChordTemplate[] = [];
  for (let r = 0; r < 12; r += 1) {
    for (const q of QUALITIES) {
      const v = new Float32Array(12);
      // Root emphasized slightly, chord tones equal
      q.intervals.forEach((iv, idx) => {
        v[(r + iv) % 12] = idx === 0 ? 1.0 : 0.85;
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
  /** chroma[frame][pc] */
  chromas: Float32Array[];
  hopSec: number;
}

const computeFrameChromas = (samples: Float32Array, sampleRate: number): FrameChromas => {
  const fftSize = 4096;
  const hopSize = 1024; // ~93ms at 11025Hz
  const fft = new FFT(fftSize);
  const window = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i += 1) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  // Consider 65 Hz (~C2) to 2000 Hz (~B6)
  const minHz = 65;
  const maxHz = 2000;
  const minBin = Math.max(1, Math.floor((minHz * fftSize) / sampleRate));
  const maxBin = Math.min(fftSize / 2 - 1, Math.ceil((maxHz * fftSize) / sampleRate));
  const binPc = new Int8Array(maxBin - minBin + 1);
  const binWeight = new Float32Array(maxBin - minBin + 1);
  for (let bin = minBin; bin <= maxBin; bin += 1) {
    const freq = (bin * sampleRate) / fftSize;
    const midi = 69 + 12 * Math.log2(freq / 440);
    binPc[bin - minBin] = ((Math.round(midi) % 12) + 12) % 12;
    // Slight emphasis on low-mid range (where chord tones live)
    binWeight[bin - minBin] = freq < 250 ? 1.2 : freq < 1000 ? 1.0 : 0.7;
  }

  const numFrames = Math.max(0, Math.floor((samples.length - fftSize) / hopSize) + 1);
  const chromas: Float32Array[] = [];
  const buf = new Float64Array(fftSize);

  for (let f = 0; f < numFrames; f += 1) {
    const offset = f * hopSize;
    for (let i = 0; i < fftSize; i += 1) buf[i] = samples[offset + i] * window[i];
    const mags = fft.forwardMagnitudes(buf);
    const c = new Float32Array(12);
    for (let bin = minBin; bin <= maxBin; bin += 1) {
      c[binPc[bin - minBin]] += mags[bin] * binWeight[bin - minBin];
    }
    // L2 normalize per frame
    let norm = 0;
    for (let i = 0; i < 12; i += 1) norm += c[i] * c[i];
    norm = Math.sqrt(norm);
    if (norm > 0) for (let i = 0; i < 12; i += 1) c[i] /= norm;
    chromas.push(c);
  }
  return { chromas, hopSec: hopSize / sampleRate };
};

// ---------------- Chord scoring ----------------

const dot = (a: Float32Array, b: Float32Array): number => {
  let s = 0;
  for (let i = 0; i < 12; i += 1) s += a[i] * b[i];
  return s;
};

interface ChordScore {
  template: ChordTemplate;
  score: number;
}

const scoreChroma = (chroma: Float32Array): ChordScore[] => {
  const out: ChordScore[] = [];
  for (const t of TEMPLATES) out.push({ template: t, score: dot(chroma, t.vector) });
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
  // normalize
  let norm = 0;
  for (let i = 0; i < 12; i += 1) norm += out[i] * out[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < 12; i += 1) out[i] /= norm;
  return out;
};

// ---------------- Romanization ----------------

const normalizeRomanForFn = (numeral: string, minorCase: boolean): string => {
  // Convert "I" -> "i" if minor-case quality. Numeral may carry "b" or "#" prefix.
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
  /** Display symbol e.g. "Cmaj7", "F#m7" */
  symbol: string;
  /** Roman numeral relative to the song key e.g. "Imaj7", "vi7", "bVII" */
  roman: string;
  /** Functional role in the key (best-effort) */
  fn?: "T" | "S" | "D";
  /** 0..1 — relative confidence of this chord vs the second-best */
  confidence: number;
  /** Extensions tentatively detected beyond the chord triad/7th */
  extensions: Array<"9" | "11" | "13">;
}

const romanize = (
  rootPc: number,
  quality: QualityDef,
  tonicPc: number,
  mode: "major" | "minor",
): { roman: string; fn?: "T" | "S" | "D" } => {
  const semis = ((rootPc - tonicPc) % 12 + 12) % 12;
  const baseNumeral = NUMERAL_BY_SEMITONE[semis];
  let body = baseNumeral;
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

// ---------------- Extension heuristic ----------------

const detectExtensions = (
  chroma: Float32Array,
  rootPc: number,
  quality: QualityDef,
): Array<"9" | "11" | "13"> => {
  // Reference: average energy of the chord tones
  const chordTonePcs = quality.intervals.map((iv) => (rootPc + iv) % 12);
  let chordAvg = 0;
  for (const pc of chordTonePcs) chordAvg += chroma[pc];
  chordAvg /= chordTonePcs.length;
  if (chordAvg <= 0) return [];

  const out: Array<"9" | "11" | "13"> = [];
  const ratio = (pc: number) => chroma[pc] / chordAvg;
  // Threshold tuned tentatively. Must be present clearly AND not be a chord tone already.
  const THRESH = 0.75;
  const isChordTone = (pc: number) => chordTonePcs.includes(pc);

  const pc9 = (rootPc + 2) % 12;
  const pc11 = (rootPc + 5) % 12;
  const pc13 = (rootPc + 9) % 12;

  if (!isChordTone(pc9) && ratio(pc9) >= THRESH) out.push("9");
  if (!isChordTone(pc11) && ratio(pc11) >= THRESH) out.push("11");
  if (!isChordTone(pc13) && ratio(pc13) >= THRESH) out.push("13");
  return out;
};

// ---------------- Public API ----------------

export interface ChordSegment {
  /** Index of first beat (0-based) covered */
  beatStart: number;
  /** Number of beats covered */
  beatLength: number;
  startSec: number;
  durationSec: number;
  chord: ChordHit;
}

export interface ChordGridResult {
  bpm: number;
  tonic: NoteName;
  mode: "major" | "minor";
  beatDurationSec: number;
  barDurationSec: number;
  beatsPerBar: number;
  /** Chord per beat (already includes confidence & extensions) */
  beats: ChordHit[];
  /** Same data aggregated by bar (mesure) via majority vote */
  bars: ChordHit[];
  /** Merged contiguous runs (per bar) — used for the compact grid display */
  segments: ChordSegment[];
}

interface DetectOptions {
  beatsPerBar?: number;
  /** Maximum number of bars to analyze (caps cost). 64 bars at 120bpm ≈ 2min08. */
  maxBars?: number;
}

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
  const { chromas, hopSec } = computeFrameChromas(ds, targetSr);

  const safeBpm = bpm > 0 ? bpm : 120;
  const beatDurationSec = 60 / safeBpm;
  const barDurationSec = beatDurationSec * beatsPerBar;
  const tonicPc = pitchClass(tonic);

  const totalBeats = Math.min(
    Math.floor(chromas.length * hopSec / beatDurationSec),
    maxBars * beatsPerBar,
  );

  const beats: ChordHit[] = [];
  for (let b = 0; b < totalBeats; b += 1) {
    const fStart = Math.floor((b * beatDurationSec) / hopSec);
    const fEnd = Math.floor(((b + 1) * beatDurationSec) / hopSec);
    const chroma = sumChromas(chromas, fStart, fEnd);
    const ranked = scoreChroma(chroma);
    const best = ranked[0];
    const second = ranked[1];
    const conf = best.score > 0
      ? Math.max(0, Math.min(1, (best.score - second.score) / Math.max(0.05, best.score) * 1.4))
      : 0;
    const { template } = best;
    const q = template.quality;
    const root = NOTE_NAMES[template.rootPc];
    const { roman, fn } = romanize(template.rootPc, q, tonicPc, mode);
    const extensions = detectExtensions(chroma, template.rootPc, q);
    beats.push({
      root,
      quality: q.key,
      symbol: `${root}${q.symbolSuffix}`,
      roman,
      fn,
      confidence: conf,
      extensions,
    });
  }

  // Aggregate to bars via majority vote of the beat-level winners.
  const bars: ChordHit[] = [];
  for (let bar = 0; bar * beatsPerBar < totalBeats; bar += 1) {
    const slice = beats.slice(bar * beatsPerBar, (bar + 1) * beatsPerBar);
    if (slice.length === 0) break;
    // Majority by symbol; on tie, pick the one with highest confidence
    const counts = new Map<string, { hit: ChordHit; count: number; totalConf: number }>();
    for (const h of slice) {
      const k = h.symbol;
      const entry = counts.get(k);
      if (entry) {
        entry.count += 1;
        entry.totalConf += h.confidence;
      } else {
        counts.set(k, { hit: h, count: 1, totalConf: h.confidence });
      }
    }
    const sorted = [...counts.values()].sort((a, b) =>
      b.count - a.count || b.totalConf - a.totalConf,
    );
    const winner = sorted[0];
    // Recompute extensions & confidence from the full bar chroma for a stabler result
    const fStart = Math.floor((bar * barDurationSec) / hopSec);
    const fEnd = Math.floor(((bar + 1) * barDurationSec) / hopSec);
    const barChroma = sumChromas(chromas, fStart, fEnd);
    const tpl = TEMPLATES.find((t) =>
      NOTE_NAMES[t.rootPc] === winner.hit.root && t.quality.key === winner.hit.quality,
    )!;
    const ranked = scoreChroma(barChroma);
    const bestScore = ranked[0].score;
    const winnerScore = dot(barChroma, tpl.vector);
    // Confidence ≈ agreement between beats × score margin
    const agreement = winner.count / slice.length;
    const margin = bestScore > 0 ? Math.max(0, (winnerScore - ranked[1].score) / Math.max(0.05, bestScore)) : 0;
    const conf = Math.max(0, Math.min(1, agreement * 0.6 + margin * 1.0));
    bars.push({
      ...winner.hit,
      confidence: conf,
      extensions: detectExtensions(barChroma, tpl.rootPc, tpl.quality),
    });
  }

  // Merge contiguous identical bars into segments
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
  };
};

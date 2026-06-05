/**
 * Chord detection from a harmonic-only signal.
 *
 * Pipeline:
 * 1. Compute a frame-by-frame chroma vector (12 pitch classes) on the input.
 * 2. Segment time along the BPM grid (one chord per beat by default).
 * 3. For each segment, average chroma → match against chord templates.
 *
 * Templates cover triads (maj/min/dim/aug), sus2/sus4, sevenths (7, maj7, min7).
 * Quality is determined by the best-scoring template; the root is the rotation
 * that maximizes the score.
 */

import { FFT } from "@/lib/audioAnalysis";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export type ChordQuality = "maj" | "min" | "dim" | "aug" | "sus2" | "sus4" | "7" | "maj7" | "min7";

export interface ChordSegment {
  startSec: number;
  endSec: number;
  root: string;       // "C", "C#", ...
  quality: ChordQuality;
  confidence: number; // 0..1
  /** Pitch classes that belong to the chord, e.g. {0, 4, 7} for C major. */
  pitchClasses: Set<number>;
}

// Templates expressed as pitch-class weights relative to root = 0.
const TEMPLATES: Record<ChordQuality, number[]> = {
  maj:  [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  min:  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  dim:  [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
  aug:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  sus2: [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  sus4: [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  "7":  [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  maj7: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
  min7: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
};

// Slight bias toward common triads to avoid over-detecting jazz extensions on simple material.
const QUALITY_PRIOR: Record<ChordQuality, number> = {
  maj: 1.06, min: 1.06, sus2: 0.98, sus4: 0.98,
  "7": 0.95, maj7: 0.92, min7: 0.95,
  dim: 0.88, aug: 0.82,
};

function normalize(v: number[]): number[] {
  let sum = 0;
  for (const x of v) sum += x;
  if (sum <= 0) return v.slice();
  return v.map((x) => x / sum);
}

const TEMPLATES_NORM: Record<ChordQuality, number[]> = Object.fromEntries(
  (Object.entries(TEMPLATES) as Array<[ChordQuality, number[]]>).map(([k, v]) => [k, normalize(v)]),
) as Record<ChordQuality, number[]>;

/** Cosine similarity between two same-length vectors. */
function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na * nb);
  return d > 0 ? dot / d : 0;
}

/** Rotate a 12-element array right by `n` positions (so pitch-class `n` ends up at index 0). */
function rotate(v: number[], n: number): number[] {
  const out = new Array<number>(12);
  for (let i = 0; i < 12; i++) out[i] = v[(i + n) % 12];
  return out;
}

/** Compute a sequence of chroma frames for the whole signal. Hop = ~93 ms at 22050 Hz. */
export function computeChromaFrames(samples: Float32Array, sampleRate: number): { frames: Float32Array[]; hopSec: number } {
  const fftSize = 4096;
  const hopSize = 2048;
  const fft = new FFT(fftSize);

  const window = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  const minHz = 55;   // A1
  const maxHz = 2100;
  const minBin = Math.max(1, Math.floor((minHz * fftSize) / sampleRate));
  const maxBin = Math.min(fftSize / 2 - 1, Math.ceil((maxHz * fftSize) / sampleRate));

  // Precompute pitch class & weighting per bin (de-emphasize extremes).
  const binPc = new Int8Array(maxBin - minBin + 1);
  const binW = new Float32Array(maxBin - minBin + 1);
  for (let bin = minBin; bin <= maxBin; bin++) {
    const freq = (bin * sampleRate) / fftSize;
    const midi = 69 + 12 * Math.log2(freq / 440);
    binPc[bin - minBin] = ((Math.round(midi) % 12) + 12) % 12;
    // Bell-shaped weight peaking around MIDI 60 (C4 ≈ 261 Hz)
    const z = (midi - 60) / 24;
    binW[bin - minBin] = Math.exp(-z * z);
  }

  const numFrames = Math.max(0, Math.floor((samples.length - fftSize) / hopSize) + 1);
  const frames: Float32Array[] = new Array(numFrames);
  const buf = new Float64Array(fftSize);

  for (let f = 0; f < numFrames; f++) {
    const offset = f * hopSize;
    for (let i = 0; i < fftSize; i++) buf[i] = samples[offset + i] * window[i];
    const mags = fft.forwardMagnitudes(buf);
    const ch = new Float32Array(12);
    for (let bin = minBin; bin <= maxBin; bin++) {
      ch[binPc[bin - minBin]] += mags[bin] * binW[bin - minBin];
    }
    // L1 normalize the chroma frame
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += ch[i];
    if (sum > 0) for (let i = 0; i < 12; i++) ch[i] /= sum;
    frames[f] = ch;
  }
  return { frames, hopSec: hopSize / sampleRate };
}

/** Aggregate chroma frames into one mean vector for a time window. */
function meanChroma(frames: Float32Array[], hopSec: number, startSec: number, endSec: number): Float32Array {
  const startIdx = Math.max(0, Math.floor(startSec / hopSec));
  const endIdx = Math.min(frames.length, Math.ceil(endSec / hopSec));
  const out = new Float32Array(12);
  if (endIdx <= startIdx) return out;
  let count = 0;
  for (let i = startIdx; i < endIdx; i++) {
    let energy = 0;
    for (let pc = 0; pc < 12; pc++) energy += frames[i][pc];
    if (energy < 1e-6) continue; // skip silent frames
    for (let pc = 0; pc < 12; pc++) out[pc] += frames[i][pc];
    count++;
  }
  if (count > 0) for (let pc = 0; pc < 12; pc++) out[pc] /= count;
  return out;
}

/** Best chord match for a single chroma vector. */
function matchChord(chroma: Float32Array): { root: number; quality: ChordQuality; score: number } {
  const cv = Array.from(chroma);
  let best = { root: 0, quality: "maj" as ChordQuality, score: -Infinity };
  for (let root = 0; root < 12; root++) {
    const rotated = rotate(cv, root);
    for (const q of Object.keys(TEMPLATES_NORM) as ChordQuality[]) {
      const s = cosine(rotated, TEMPLATES_NORM[q]) * QUALITY_PRIOR[q];
      if (s > best.score) best = { root, quality: q, score: s };
    }
  }
  return best;
}

export interface DetectChordsOptions {
  bpm?: number;
  /** Number of beats per chord segment (default 2 = half-bar in 4/4). */
  beatsPerSegment?: number;
  /** Fallback segment length when bpm is unavailable. */
  fallbackSegmentSec?: number;
  durationSec: number;
}

export function detectChords(
  samples: Float32Array,
  sampleRate: number,
  opts: DetectChordsOptions,
): ChordSegment[] {
  const { frames, hopSec } = computeChromaFrames(samples, sampleRate);
  if (frames.length === 0) return [];

  const segLen = (opts.bpm && opts.bpm > 0)
    ? (60 / opts.bpm) * (opts.beatsPerSegment ?? 2)
    : (opts.fallbackSegmentSec ?? 1.0);

  const segments: ChordSegment[] = [];
  const total = opts.durationSec;
  for (let t = 0; t < total; t += segLen) {
    const end = Math.min(total, t + segLen);
    const chroma = meanChroma(frames, hopSec, t, end);
    let energy = 0;
    for (let i = 0; i < 12; i++) energy += chroma[i];
    if (energy < 1e-6) continue;
    const m = matchChord(chroma);
    // Confidence: scale cosine [0..1], penalize weak matches.
    const conf = Math.max(0, Math.min(1, (m.score - 0.5) * 2));
    const pcs = new Set<number>();
    TEMPLATES[m.quality].forEach((v, i) => { if (v > 0) pcs.add((i + m.root) % 12); });
    segments.push({
      startSec: t,
      endSec: end,
      root: NOTE_NAMES[m.root],
      quality: m.quality,
      confidence: conf,
      pitchClasses: pcs,
    });
  }

  // Merge consecutive identical chords
  const merged: ChordSegment[] = [];
  for (const s of segments) {
    const last = merged[merged.length - 1];
    if (last && last.root === s.root && last.quality === s.quality) {
      last.endSec = s.endSec;
      last.confidence = Math.max(last.confidence, s.confidence);
    } else {
      merged.push({ ...s, pitchClasses: new Set(s.pitchClasses) });
    }
  }
  return merged;
}

/** Find the chord active at a given time (binary search). */
export function chordAtTime(chords: ChordSegment[], timeSec: number): ChordSegment | null {
  if (chords.length === 0) return null;
  let lo = 0, hi = chords.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = chords[mid];
    if (timeSec < c.startSec) hi = mid - 1;
    else if (timeSec >= c.endSec) lo = mid + 1;
    else return c;
  }
  return chords[Math.min(chords.length - 1, Math.max(0, lo))];
}

export function formatChord(c: ChordSegment): string {
  const q = c.quality === "maj" ? "" : c.quality === "min" ? "m" : c.quality;
  return `${c.root}${q}`;
}

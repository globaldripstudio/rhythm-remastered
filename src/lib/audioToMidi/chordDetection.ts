/**
 * Chord detection from a harmonic-only signal.
 *
 * v3 — Phase A + B refinements:
 * 1. **CQT-style filterbank** instead of round-to-nearest-bin FFT chroma.
 *    Each semitone from C1 (32.7 Hz) to C7 (2093 Hz) gets a triangular
 *    weighting around its centre frequency. Bass resolution gains ~4×.
 * 2. **HPS-enhanced chroma**: each pitch class is boosted when its 3rd and
 *    5th are also present, which suppresses harmonic-ghost confusions
 *    (e.g. C ↔ Em).
 * 3. **Temporal median filter (3 frames)** on each chroma to kill
 *    transient flickers from ornamentation, before per-beat averaging.
 * 4. **Bass / mid chroma split** kept for inversion/slash detection.
 * 5. **Harmonic-aware templates** kept (Fourier-derived weights for the
 *    first 6 harmonics of each chord tone).
 * 6. **Extended quality set** kept: maj, min, dim, aug, sus2, sus4, 7,
 *    maj7, min7, m7b5, dim7, 6, m6.
 * 7. **Function-weighted Viterbi**: per-beat emission scores combined
 *    with a transition matrix that strongly favours staying, and within
 *    a tonality boosts cadential moves (V→I, IV→I, ii→V, vi→IV…)
 *    relative to other diatonic moves.
 * 8. **Beat-aligned segmentation**: when a beat grid is supplied,
 *    segments are anchored to actual beats instead of a rigid grid
 *    starting at t=0.
 */

import { FFT } from "@/lib/audioAnalysis";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const PITCH_CLASSES: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

export type ChordQuality =
  | "maj" | "min" | "dim" | "aug"
  | "sus2" | "sus4"
  | "7" | "maj7" | "min7" | "m7b5" | "dim7"
  | "6" | "m6";

export interface ChordSegment {
  startSec: number;
  endSec: number;
  root: string;
  quality: ChordQuality;
  confidence: number;
  /** Pitch classes that belong to the chord (root reference). */
  pitchClasses: Set<number>;
  /** Bass pitch class actually heard (may differ from root → inversion). */
  bassPc?: number;
}

// Interval recipes (semitones from root)
const INTERVALS: Record<ChordQuality, number[]> = {
  maj:  [0, 4, 7],
  min:  [0, 3, 7],
  dim:  [0, 3, 6],
  aug:  [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  "7":  [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  "6":  [0, 4, 7, 9],
  m6:   [0, 3, 7, 9],
};
const QUALITY_KEYS = Object.keys(INTERVALS) as ChordQuality[];

// Soft prior — favors simple triads over rare jazz qualities.
const QUALITY_PRIOR: Record<ChordQuality, number> = {
  maj: 1.10, min: 1.10,
  sus2: 0.95, sus4: 0.95,
  "7": 0.96, maj7: 0.92, min7: 0.95,
  dim: 0.82, aug: 0.78,
  m7b5: 0.80, dim7: 0.78,
  "6": 0.86, m6: 0.86,
};

// First 6 harmonics → pitch-class offsets and amplitude weights
const HARMONIC_PC_OFFSETS = [0, 0, 7, 0, 4, 7];
const HARMONIC_WEIGHTS = [1.0, 0.55, 0.40, 0.28, 0.20, 0.15];

function buildHarmonicTemplate(intervals: number[]): number[] {
  const t = new Array<number>(12).fill(0);
  for (const iv of intervals) {
    for (let h = 0; h < HARMONIC_PC_OFFSETS.length; h++) {
      const pc = ((iv + HARMONIC_PC_OFFSETS[h]) % 12 + 12) % 12;
      t[pc] += HARMONIC_WEIGHTS[h];
    }
  }
  let sumSq = 0;
  for (const v of t) sumSq += v * v;
  const n = Math.sqrt(sumSq);
  if (n > 0) for (let i = 0; i < 12; i++) t[i] /= n;
  return t;
}

const QUALITY_TEMPLATES: Record<ChordQuality, number[]> =
  Object.fromEntries(
    (Object.entries(INTERVALS) as Array<[ChordQuality, number[]]>).map(([q, iv]) => [q, buildHarmonicTemplate(iv)]),
  ) as Record<ChordQuality, number[]>;

const BASS_TEMPLATE_ROOT = (() => {
  const t = new Array<number>(12).fill(0);
  t[0] = 1.0;
  t[7] = 0.35;
  let n = 0;
  for (const v of t) n += v * v;
  n = Math.sqrt(n);
  for (let i = 0; i < 12; i++) t[i] /= n;
  return t;
})();

function cosine(a: number[] | Float32Array, b: number[] | Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < 12; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na * nb);
  return d > 0 ? dot / d : 0;
}

function rotate(v: number[] | Float32Array, n: number): number[] {
  const out = new Array<number>(12);
  for (let i = 0; i < 12; i++) out[i] = v[(i + n) % 12];
  return out;
}

// ---------------- CQT-style filterbank ----------------

interface CqtBank {
  /** For each semitone filter, the FFT bins it covers + their weights. */
  filters: Array<{ bins: number[]; weights: number[]; midi: number }>;
  /** Index ranges (inclusive) into `filters` for bass and mid bands. */
  bassRange: [number, number];
  midRange: [number, number];
  /** Mid-band Gaussian weighting around MIDI 60. */
  midWeights: number[];
}

const cqtCache = new Map<string, CqtBank>();

function buildCqtBank(fftSize: number, sampleRate: number): CqtBank {
  const cacheKey = `${fftSize}_${sampleRate}`;
  const cached = cqtCache.get(cacheKey);
  if (cached) return cached;

  // Cover MIDI 24 (C1, 32.7 Hz) to MIDI 96 (C7, 2093 Hz) → 73 filters
  const MIDI_LO = 24, MIDI_HI = 96;
  const filters: CqtBank["filters"] = [];
  const halfBins = fftSize / 2;

  for (let midi = MIDI_LO; midi <= MIDI_HI; midi++) {
    const fCenter = 440 * Math.pow(2, (midi - 69) / 12);
    const fLow = 440 * Math.pow(2, (midi - 69 - 0.5) / 12);
    const fHigh = 440 * Math.pow(2, (midi - 69 + 0.5) / 12);
    const binCenter = (fCenter * fftSize) / sampleRate;
    const binLow = (fLow * fftSize) / sampleRate;
    const binHigh = (fHigh * fftSize) / sampleRate;
    const lo = Math.max(1, Math.floor(binLow));
    const hi = Math.min(halfBins - 1, Math.ceil(binHigh));
    const bins: number[] = [];
    const weights: number[] = [];
    for (let b = lo; b <= hi; b++) {
      let w: number;
      if (b <= binCenter) {
        w = (b - binLow) / Math.max(1e-6, binCenter - binLow);
      } else {
        w = (binHigh - b) / Math.max(1e-6, binHigh - binCenter);
      }
      w = Math.max(0, w);
      if (w > 0) { bins.push(b); weights.push(w); }
    }
    // If filter is narrower than a single FFT bin (true in low octaves), at
    // least include the nearest bin to avoid empty filters.
    if (bins.length === 0) {
      const nearest = Math.max(1, Math.min(halfBins - 1, Math.round(binCenter)));
      bins.push(nearest);
      weights.push(1);
    }
    filters.push({ bins, weights, midi });
  }

  // Bass: C1 (24) → B3 (59), Mid: C2 (36) → B6 (95)
  const idxOfMidi = (m: number) => Math.max(0, Math.min(filters.length - 1, m - MIDI_LO));
  const bassRange: [number, number] = [idxOfMidi(24), idxOfMidi(59)];
  const midRange: [number, number] = [idxOfMidi(36), idxOfMidi(95)];

  // Mid weighting: Gaussian centred on MIDI 60 (C4), σ = 18 semitones
  const midWeights: number[] = filters.map((f) => {
    const z = (f.midi - 60) / 18;
    return Math.exp(-z * z);
  });

  const bank: CqtBank = { filters, bassRange, midRange, midWeights };
  cqtCache.set(cacheKey, bank);
  return bank;
}

// ---------------- STFT + dual-band chroma frames ----------------

export interface ChromaFrames {
  bass: Float32Array[];
  mid: Float32Array[];
  hopSec: number;
}

export function computeChromaFrames(samples: Float32Array, sampleRate: number): ChromaFrames {
  const fftSize = 4096;
  const hopSize = 2048;
  const fft = new FFT(fftSize);
  const window = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  const bank = buildCqtBank(fftSize, sampleRate);

  const numFrames = Math.max(0, Math.floor((samples.length - fftSize) / hopSize) + 1);
  const bass: Float32Array[] = new Array(numFrames);
  const mid: Float32Array[] = new Array(numFrames);
  const buf = new Float64Array(fftSize);

  // Filter response cache per frame
  const filterEnergy = new Float32Array(bank.filters.length);

  for (let f = 0; f < numFrames; f++) {
    const offset = f * hopSize;
    for (let i = 0; i < fftSize; i++) buf[i] = samples[offset + i] * window[i];
    const mags = fft.forwardMagnitudes(buf);

    // Log compression — reduces dynamic range disparity between bass and treble
    const logMag = new Float32Array(mags.length);
    for (let i = 0; i < mags.length; i++) logMag[i] = Math.log1p(mags[i] * 32);

    // Cheap spectral whitening: subtract local mean (radius 8 bins)
    const R = 8;
    for (let i = 0; i < mags.length; i++) {
      let s = 0, c = 0;
      for (let j = Math.max(0, i - R); j <= Math.min(mags.length - 1, i + R); j++) { s += logMag[j]; c++; }
      // reuse logMag in-place is unsafe — write back into mags as whitened
      mags[i] = Math.max(0, logMag[i] - s / c);
    }

    // Apply CQT filterbank
    for (let k = 0; k < bank.filters.length; k++) {
      const ft = bank.filters[k];
      let e = 0;
      for (let j = 0; j < ft.bins.length; j++) e += mags[ft.bins[j]] * ft.weights[j];
      filterEnergy[k] = e;
    }

    const bch = new Float32Array(12);
    const mch = new Float32Array(12);
    for (let k = bank.bassRange[0]; k <= bank.bassRange[1]; k++) {
      bch[((bank.filters[k].midi % 12) + 12) % 12] += filterEnergy[k];
    }
    for (let k = bank.midRange[0]; k <= bank.midRange[1]; k++) {
      mch[((bank.filters[k].midi % 12) + 12) % 12] += filterEnergy[k] * bank.midWeights[k];
    }

    // L1 normalize
    let bs = 0, ms = 0;
    for (let i = 0; i < 12; i++) { bs += bch[i]; ms += mch[i]; }
    if (bs > 0) for (let i = 0; i < 12; i++) bch[i] /= bs;
    if (ms > 0) for (let i = 0; i < 12; i++) mch[i] /= ms;

    bass[f] = bch;
    mid[f] = mch;
  }

  // Temporal median (length 3) — kill flickers without smearing transitions
  const bassSmoothed = temporalMedian3(bass);
  const midSmoothed = temporalMedian3(mid);

  // HPS-style enhancement on the mid chroma (the one that carries the colour)
  for (let f = 0; f < midSmoothed.length; f++) {
    const c = midSmoothed[f];
    const out = new Float32Array(12);
    for (let pc = 0; pc < 12; pc++) {
      const fifth = c[(pc + 7) % 12];
      const third = c[(pc + 4) % 12];
      const thirdMin = c[(pc + 3) % 12];
      // Reinforce a pc when its 5th and a third (major OR minor) are also lit.
      const reinf = 0.35 * Math.sqrt(c[pc] * fifth) + 0.20 * Math.sqrt(c[pc] * Math.max(third, thirdMin));
      out[pc] = c[pc] + reinf;
    }
    // Re-normalize
    let s = 0;
    for (let i = 0; i < 12; i++) s += out[i];
    if (s > 0) for (let i = 0; i < 12; i++) out[i] /= s;
    midSmoothed[f] = out;
  }

  return { bass: bassSmoothed, mid: midSmoothed, hopSec: hopSize / sampleRate };
}

function temporalMedian3(frames: Float32Array[]): Float32Array[] {
  if (frames.length === 0) return frames;
  const out: Float32Array[] = new Array(frames.length);
  for (let f = 0; f < frames.length; f++) {
    const prev = frames[Math.max(0, f - 1)];
    const cur = frames[f];
    const next = frames[Math.min(frames.length - 1, f + 1)];
    const o = new Float32Array(12);
    for (let pc = 0; pc < 12; pc++) {
      const a = prev[pc], b = cur[pc], c = next[pc];
      // median of 3
      o[pc] = a < b ? (b < c ? b : (a < c ? c : a)) : (a < c ? a : (b < c ? c : b));
    }
    out[f] = o;
  }
  return out;
}

function meanChroma(frames: Float32Array[], hopSec: number, startSec: number, endSec: number): Float32Array {
  const startIdx = Math.max(0, Math.floor(startSec / hopSec));
  const endIdx = Math.min(frames.length, Math.ceil(endSec / hopSec));
  const out = new Float32Array(12);
  if (endIdx <= startIdx) return out;
  let count = 0;
  for (let i = startIdx; i < endIdx; i++) {
    let energy = 0;
    for (let pc = 0; pc < 12; pc++) energy += frames[i][pc];
    if (energy < 1e-6) continue;
    for (let pc = 0; pc < 12; pc++) out[pc] += frames[i][pc];
    count++;
  }
  if (count > 0) for (let pc = 0; pc < 12; pc++) out[pc] /= count;
  return out;
}

// ---------------- Function-weighted diatonic transitions ----------------

const DIATONIC_MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const DIATONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
const DIATONIC_MAJOR_QUALITIES: ChordQuality[] = ["maj", "min", "min", "maj", "maj", "min", "dim"];
const DIATONIC_MINOR_QUALITIES: ChordQuality[] = ["min", "dim", "maj", "min", "min", "maj", "maj"];

/**
 * For a diatonic destination degree (0=I … 6=vii), returns a multiplier on
 * the base diatonic transition probability. Cadential moves (V→I, IV→I,
 * ii→V, vi→IV, I→IV/V/vi, V→vi deceptive) get a boost. Reversed/awkward
 * moves stay near 1.0 (still allowed, just not boosted).
 */
const FUNCTION_TRANSITION_BOOST: number[][] = (() => {
  // 7×7 matrix, index [srcDeg][dstDeg], base 1.0
  const m: number[][] = [];
  for (let i = 0; i < 7; i++) m.push(new Array<number>(7).fill(1));
  const set = (s: number, d: number, v: number) => { m[s][d] = v; };
  // From I (0)
  set(0, 3, 2.5); set(0, 4, 2.5); set(0, 5, 2.0); set(0, 1, 1.4); set(0, 0, 1.0);
  // From ii (1)
  set(1, 4, 3.0); set(1, 0, 1.2);
  // From iii (2)
  set(2, 5, 2.2); set(2, 3, 1.6);
  // From IV (3)
  set(3, 0, 3.0); set(3, 4, 2.4); set(3, 1, 1.6); set(3, 6, 1.5);
  // From V (4)
  set(4, 0, 3.5); set(4, 5, 2.0); /* deceptive */ set(4, 3, 1.2);
  // From vi (5)
  set(5, 3, 2.8); set(5, 1, 2.0); set(5, 4, 1.6); set(5, 0, 1.4);
  // From vii° (6)
  set(6, 0, 3.0); set(6, 2, 1.5);
  return m;
})();

interface DiatonicCtx {
  /** Map state-key "root:quality" → diatonic degree (0..6), or -1 if non-diatonic. */
  degreeOf: Int8Array; // length = ALL_STATES.length
}

function buildDiatonicContext(tonic: string | null, mode: "major" | "minor" | null): DiatonicCtx | null {
  if (!tonic || !mode) return null;
  const root = PITCH_CLASSES[tonic] ?? 0;
  const intervals = mode === "major" ? DIATONIC_MAJOR_INTERVALS : DIATONIC_MINOR_INTERVALS;
  const qualities = mode === "major" ? DIATONIC_MAJOR_QUALITIES : DIATONIC_MINOR_QUALITIES;
  // Map "root:quality" → degree
  const map = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const r = (root + intervals[i]) % 12;
    const base = qualities[i];
    map.set(`${r}:${base}`, i);
    // Extensions of each degree map to the same degree
    if (base === "maj") {
      map.set(`${r}:maj7`, i); map.set(`${r}:7`, i); map.set(`${r}:6`, i);
      map.set(`${r}:sus2`, i); map.set(`${r}:sus4`, i);
    }
    if (base === "min") {
      map.set(`${r}:min7`, i); map.set(`${r}:m6`, i);
      map.set(`${r}:sus2`, i); map.set(`${r}:sus4`, i);
    }
    if (base === "dim") {
      map.set(`${r}:m7b5`, i); map.set(`${r}:dim7`, i);
    }
  }
  const degreeOf = new Int8Array(ALL_STATES.length);
  for (let s = 0; s < ALL_STATES.length; s++) {
    degreeOf[s] = map.has(ALL_STATES[s].key) ? (map.get(ALL_STATES[s].key) ?? -1) : -1;
  }
  return { degreeOf };
}

// ---------------- Public API ----------------

export interface DetectChordsOptions {
  bpm?: number;
  /** Number of beats per chord segment (default 1 = one segment per beat). */
  beatsPerSegment?: number;
  /** Fallback segment length when bpm is unavailable. */
  fallbackSegmentSec?: number;
  durationSec: number;
  /** Optional key prior — when set, diatonic transitions get a boost. */
  keyTonic?: string | null;
  keyMode?: "major" | "minor" | null;
  /** Precomputed chroma frames — pass when re-running with new params. */
  precomputedFrames?: ChromaFrames;
  /** Optional pre-aligned beat times in seconds. When provided, segments are
   *  built between consecutive beats (after merging beatsPerSegment-many). */
  beatTimes?: number[];
}

interface CandidateState {
  root: number;
  quality: ChordQuality;
  key: string;
}

const ALL_STATES: CandidateState[] = (() => {
  const out: CandidateState[] = [];
  for (let r = 0; r < 12; r++) {
    for (const q of QUALITY_KEYS) {
      out.push({ root: r, quality: q, key: `${r}:${q}` });
    }
  }
  return out;
})();

function segmentEmissions(bassChroma: Float32Array, midChroma: Float32Array): Float32Array {
  const out = new Float32Array(ALL_STATES.length);
  for (let root = 0; root < 12; root++) {
    const rotBass = rotate(bassChroma, root);
    const rotMid = rotate(midChroma, root);
    const bassScore = cosine(rotBass, BASS_TEMPLATE_ROOT);
    for (let qi = 0; qi < QUALITY_KEYS.length; qi++) {
      const q = QUALITY_KEYS[qi];
      const qualityScore = cosine(rotMid, QUALITY_TEMPLATES[q]);
      const score = (0.35 * bassScore + 0.65 * qualityScore) * QUALITY_PRIOR[q];
      out[root * QUALITY_KEYS.length + qi] = Math.max(0, score);
    }
  }
  return out;
}

/** Viterbi decode with function-weighted diatonic transitions. */
function viterbiDecode(
  emissions: Float32Array[],
  diatonic: DiatonicCtx | null,
): { path: number[]; pathScores: number[] } {
  const T = emissions.length;
  const S = ALL_STATES.length;
  if (T === 0) return { path: [], pathScores: [] };

  const SELF = Math.log(0.55);
  const DIATONIC_BASE = Math.log(0.020);
  const OTHER = Math.log(0.001);
  const EPS = 1e-6;

  let prevLL = new Float64Array(S);
  for (let s = 0; s < S; s++) {
    const em = Math.log(emissions[0][s] + EPS);
    const isDia = diatonic ? diatonic.degreeOf[s] >= 0 : false;
    const prior = diatonic
      ? (isDia ? Math.log(1 / 12) : Math.log(1 / (S * 4)))
      : Math.log(1 / S);
    prevLL[s] = em + prior;
  }

  const backptr: Int16Array[] = new Array(T);
  backptr[0] = new Int16Array(S);

  for (let t = 1; t < T; t++) {
    const curLL = new Float64Array(S);
    const bp = new Int16Array(S);
    for (let dst = 0; dst < S; dst++) {
      const em = Math.log(emissions[t][dst] + EPS);
      const dstDeg = diatonic ? diatonic.degreeOf[dst] : -1;
      let best = -Infinity;
      let bestSrc = 0;
      for (let src = 0; src < S; src++) {
        let trans: number;
        if (src === dst) {
          trans = SELF;
        } else if (diatonic && dstDeg >= 0) {
          const srcDeg = diatonic.degreeOf[src];
          if (srcDeg >= 0) {
            // Diatonic → diatonic: apply function boost
            const boost = FUNCTION_TRANSITION_BOOST[srcDeg][dstDeg];
            trans = DIATONIC_BASE + Math.log(boost);
          } else {
            // Non-diatonic → diatonic: standard diatonic prob (return to scale)
            trans = DIATONIC_BASE;
          }
        } else {
          trans = OTHER;
        }
        const cand = prevLL[src] + trans;
        if (cand > best) { best = cand; bestSrc = src; }
      }
      curLL[dst] = best + em;
      bp[dst] = bestSrc;
    }
    backptr[t] = bp;
    prevLL = curLL;
  }

  let bestS = 0, bestV = -Infinity;
  for (let s = 0; s < S; s++) if (prevLL[s] > bestV) { bestV = prevLL[s]; bestS = s; }
  const path = new Array<number>(T);
  const pathScores = new Array<number>(T);
  path[T - 1] = bestS;
  for (let t = T - 1; t > 0; t--) {
    pathScores[t] = emissions[t][path[t]];
    path[t - 1] = backptr[t][path[t]];
  }
  pathScores[0] = emissions[0][path[0]];
  return { path, pathScores };
}

function dominantBass(chroma: Float32Array): number {
  let bestPc = 0, best = -Infinity;
  for (let pc = 0; pc < 12; pc++) if (chroma[pc] > best) { best = chroma[pc]; bestPc = pc; }
  return bestPc;
}

export function detectChords(
  samples: Float32Array,
  sampleRate: number,
  opts: DetectChordsOptions,
): { chords: ChordSegment[]; frames: ChromaFrames } {
  const frames = opts.precomputedFrames ?? computeChromaFrames(samples, sampleRate);
  if (frames.bass.length === 0) return { chords: [], frames };

  const total = opts.durationSec;

  // Build segment boundaries
  const boundaries: Array<[number, number]> = [];
  const beatsPer = Math.max(1, Math.round(opts.beatsPerSegment ?? 1));
  if (opts.beatTimes && opts.beatTimes.length >= 2) {
    const bt = opts.beatTimes;
    for (let i = 0; i + beatsPer < bt.length; i += beatsPer) {
      boundaries.push([bt[i], bt[i + beatsPer]]);
    }
    // Cap to duration
    if (boundaries.length > 0) {
      boundaries[boundaries.length - 1][1] = Math.min(total, boundaries[boundaries.length - 1][1]);
    }
  } else {
    const segLen = (opts.bpm && opts.bpm > 0)
      ? (60 / opts.bpm) * beatsPer
      : (opts.fallbackSegmentSec ?? 0.6);
    for (let t = 0; t < total; t += segLen) {
      boundaries.push([t, Math.min(total, t + segLen)]);
    }
  }

  const emissions: Float32Array[] = [];
  const bassDominants: number[] = [];
  const validIdx: number[] = [];
  for (let i = 0; i < boundaries.length; i++) {
    const [s, e] = boundaries[i];
    if (e - s < 0.05) continue;
    const bassMean = meanChroma(frames.bass, frames.hopSec, s, e);
    const midMean = meanChroma(frames.mid, frames.hopSec, s, e);
    let energy = 0;
    for (let k = 0; k < 12; k++) energy += midMean[k] + bassMean[k];
    if (energy < 1e-6) continue;
    emissions.push(segmentEmissions(bassMean, midMean));
    bassDominants.push(dominantBass(bassMean));
    validIdx.push(i);
  }
  if (emissions.length === 0) return { chords: [], frames };

  const diatonic = buildDiatonicContext(opts.keyTonic ?? null, opts.keyMode ?? null);
  const { path, pathScores } = viterbiDecode(emissions, diatonic);

  const segs: ChordSegment[] = [];
  for (let i = 0; i < path.length; i++) {
    const state = ALL_STATES[path[i]];
    const [s, e] = boundaries[validIdx[i]];
    const pcs = new Set<number>();
    INTERVALS[state.quality].forEach((iv) => pcs.add((iv + state.root) % 12));
    const conf = Math.max(0, Math.min(1, (pathScores[i] - 0.4) * 2));
    segs.push({
      startSec: s,
      endSec: e,
      root: NOTE_NAMES[state.root],
      quality: state.quality,
      confidence: conf,
      pitchClasses: pcs,
      bassPc: bassDominants[i],
    });
  }

  // Merge consecutive identical chords
  const merged: ChordSegment[] = [];
  for (const seg of segs) {
    const last = merged[merged.length - 1];
    if (last && last.root === seg.root && last.quality === seg.quality) {
      last.endSec = seg.endSec;
      last.confidence = Math.max(last.confidence, seg.confidence);
      // Keep first bass if consistent, else clear it
      if (last.bassPc !== seg.bassPc) last.bassPc = undefined;
    } else {
      merged.push({ ...seg, pitchClasses: new Set(seg.pitchClasses) });
    }
  }
  return { chords: merged, frames };
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
  const q =
    c.quality === "maj" ? "" :
    c.quality === "min" ? "m" :
    c.quality === "7" ? "7" :
    c.quality === "maj7" ? "maj7" :
    c.quality === "min7" ? "m7" :
    c.quality === "m7b5" ? "m7♭5" :
    c.quality === "dim7" ? "dim7" :
    c.quality === "dim" ? "°" :
    c.quality === "aug" ? "+" :
    c.quality === "sus2" ? "sus2" :
    c.quality === "sus4" ? "sus4" :
    c.quality === "6" ? "6" :
    c.quality === "m6" ? "m6" : c.quality;
  const root = c.root;
  if (c.bassPc !== undefined) {
    const rootPc = PITCH_CLASSES[root] ?? 0;
    if (c.bassPc !== rootPc) {
      return `${root}${q}/${NOTE_NAMES[c.bassPc]}`;
    }
  }
  return `${root}${q}`;
}

/**
 * Estimate the key from a chord track. Weights each chord by its duration
 * and computes a 12-bin pitch-class histogram over its chord tones, then
 * runs Krumhansl-Schmuckler.
 */
export function detectKeyFromChords(chords: ChordSegment[]): { tonic: string; mode: "major" | "minor"; confidence: number } | null {
  if (chords.length === 0) return null;
  const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  const hist = new Array<number>(12).fill(0);
  for (const c of chords) {
    const dur = Math.max(0.05, c.endSec - c.startSec);
    const rootPc = PITCH_CLASSES[c.root] ?? 0;
    const intervals = INTERVALS[c.quality];
    intervals.forEach((iv, i) => {
      const pc = (rootPc + iv) % 12;
      const weight = i === 0 ? 1.5 : 1.0;
      hist[pc] += dur * weight * (0.5 + 0.5 * c.confidence);
    });
  }
  let total = 0;
  for (const v of hist) total += v;
  if (total <= 0) return null;
  for (let i = 0; i < 12; i++) hist[i] /= total;

  const pearson = (a: number[], b: number[]): number => {
    let ma = 0, mb = 0;
    for (let i = 0; i < 12; i++) { ma += a[i]; mb += b[i]; }
    ma /= 12; mb /= 12;
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < 12; i++) {
      const xa = a[i] - ma, xb = b[i] - mb;
      num += xa * xb; da += xa * xa; db += xb * xb;
    }
    const d = Math.sqrt(da * db);
    return d > 0 ? num / d : 0;
  };
  let best = { tonic: "C", mode: "major" as "major" | "minor", score: -Infinity };
  let second = -Infinity;
  for (let shift = 0; shift < 12; shift++) {
    const rotated = new Array<number>(12);
    for (let i = 0; i < 12; i++) rotated[i] = hist[(i + shift) % 12];
    const sMaj = pearson(rotated, MAJOR);
    const sMin = pearson(rotated, MINOR);
    if (sMaj > best.score) { second = best.score; best = { tonic: NOTE_NAMES[shift], mode: "major", score: sMaj }; }
    else if (sMaj > second) second = sMaj;
    if (sMin > best.score) { second = best.score; best = { tonic: NOTE_NAMES[shift], mode: "minor", score: sMin }; }
    else if (sMin > second) second = sMin;
  }
  const gap = best.score - second;
  const confidence = Math.max(0, Math.min(1, gap * 4 + best.score * 0.3));
  return { tonic: best.tonic, mode: best.mode, confidence };
}

// ---------------- Beat tracking helpers ----------------

/**
 * Given an onset envelope and a BPM estimate, returns a phase-aligned grid
 * of beat times (seconds) covering [0, durationSec]. The phase is chosen
 * to maximise envelope energy at beat positions.
 */
export function alignBeatGrid(
  envelope: Float32Array,
  hopRate: number,
  bpm: number,
  durationSec: number,
): number[] {
  if (bpm <= 0 || envelope.length < 4) return [];
  const period = (60 / bpm) * hopRate; // in frames
  const periodInt = Math.max(2, Math.round(period));
  // Try every phase 0..periodInt-1, score by sum of env at beat positions.
  let bestPhase = 0;
  let bestScore = -Infinity;
  const N = envelope.length;
  for (let phase = 0; phase < periodInt; phase++) {
    let s = 0;
    // Look up env around each beat position (±1 frame for resilience)
    for (let i = phase; i < N; i += period) {
      const idx = Math.round(i);
      if (idx < 0 || idx >= N) continue;
      const a = idx > 0 ? envelope[idx - 1] : 0;
      const b = envelope[idx];
      const c = idx < N - 1 ? envelope[idx + 1] : 0;
      s += Math.max(a, b, c);
    }
    if (s > bestScore) { bestScore = s; bestPhase = phase; }
  }
  const beats: number[] = [];
  const startSec = bestPhase / hopRate;
  const periodSec = 60 / bpm;
  for (let t = startSec; t <= durationSec + 1e-6; t += periodSec) {
    beats.push(t);
  }
  // Ensure the grid starts at or before 0 so first segment isn't lost
  if (beats.length === 0 || beats[0] > 0.001) {
    beats.unshift(Math.max(0, (beats[0] ?? 0) - periodSec));
  }
  return beats;
}

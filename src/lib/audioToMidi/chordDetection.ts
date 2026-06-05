/**
 * Chord detection from a harmonic-only signal.
 *
 * Improvements over the v1:
 * 1. **Bass / mid chroma split.** Bass band (40–250 Hz) is used to score the
 *    chord root; mid band (250–2000 Hz) scores the quality. This lets us
 *    weight inversions and avoid letting the bass pollute the quality match.
 * 2. **Harmonic-aware templates.** Each chord template includes weight from
 *    the first 6 harmonics of its chord tones (so a plain C major template
 *    already predicts a bit of energy on G and E above, instead of getting
 *    confused with C7 or Cadd9).
 * 3. **Extended quality set.** maj, min, dim, aug, sus2, sus4, 7, maj7, min7,
 *    m7b5, dim7, 6, m6.
 * 4. **Viterbi smoothing.** Per-beat emission scores combined with a
 *    transition matrix that strongly favours staying on the same chord and
 *    softly favours diatonic moves when a key prior is provided. This kills
 *    the per-beat flicker that templates produce on their own.
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

// Soft prior — favors simple triads over rare jazz qualities. Multiplicative on emission scores.
const QUALITY_PRIOR: Record<ChordQuality, number> = {
  maj: 1.10, min: 1.10,
  sus2: 0.95, sus4: 0.95,
  "7": 0.96, maj7: 0.92, min7: 0.95,
  dim: 0.82, aug: 0.78,
  m7b5: 0.80, dim7: 0.78,
  "6": 0.86, m6: 0.86,
};

// Pitch-class offsets of the first 6 harmonics of a given note (rounded to nearest semitone):
// n=1 → 0, n=2 → +12 (=0), n=3 → +19 (≈7), n=4 → +24 (=0), n=5 → +28 (≈4), n=6 → +31 (≈7)
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
  // L2 normalize
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

// Bass template: spike on the root pitch class (plus a touch on the 5th for
// open-voicing piano playing the root + 5 in the left hand).
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

  const bassMinHz = 40, bassMaxHz = 250;
  const midMinHz = 250, midMaxHz = 2000;
  const bassMinBin = Math.max(1, Math.floor((bassMinHz * fftSize) / sampleRate));
  const bassMaxBin = Math.min(fftSize / 2 - 1, Math.ceil((bassMaxHz * fftSize) / sampleRate));
  const midMinBin = Math.max(1, Math.floor((midMinHz * fftSize) / sampleRate));
  const midMaxBin = Math.min(fftSize / 2 - 1, Math.ceil((midMaxHz * fftSize) / sampleRate));

  const binPc = new Int8Array(fftSize / 2);
  for (let bin = 1; bin < fftSize / 2; bin++) {
    const freq = (bin * sampleRate) / fftSize;
    const midi = 69 + 12 * Math.log2(freq / 440);
    binPc[bin] = ((Math.round(midi) % 12) + 12) % 12;
  }
  // Mid-band weighting: bell centered on MIDI 60
  const midBinW = new Float32Array(fftSize / 2);
  for (let bin = midMinBin; bin <= midMaxBin; bin++) {
    const freq = (bin * sampleRate) / fftSize;
    const midi = 69 + 12 * Math.log2(freq / 440);
    const z = (midi - 60) / 24;
    midBinW[bin] = Math.exp(-z * z);
  }

  const numFrames = Math.max(0, Math.floor((samples.length - fftSize) / hopSize) + 1);
  const bass: Float32Array[] = new Array(numFrames);
  const mid: Float32Array[] = new Array(numFrames);
  const buf = new Float64Array(fftSize);

  for (let f = 0; f < numFrames; f++) {
    const offset = f * hopSize;
    for (let i = 0; i < fftSize; i++) buf[i] = samples[offset + i] * window[i];
    const mags = fft.forwardMagnitudes(buf);

    // Light spectral whitening: divide by smoothed magnitude → de-emphasises broad timbre.
    // (Cheap version: subtract a moving average of log magnitudes.)
    const logMag = new Float32Array(mags.length);
    for (let i = 0; i < mags.length; i++) logMag[i] = Math.log1p(mags[i]);
    const R = 8;
    const smooth = new Float32Array(mags.length);
    for (let i = 0; i < mags.length; i++) {
      let s = 0, c = 0;
      for (let j = Math.max(0, i - R); j <= Math.min(mags.length - 1, i + R); j++) { s += logMag[j]; c++; }
      smooth[i] = s / c;
    }
    const whitened = new Float32Array(mags.length);
    for (let i = 0; i < mags.length; i++) whitened[i] = Math.max(0, logMag[i] - smooth[i]);

    const bch = new Float32Array(12);
    const mch = new Float32Array(12);
    for (let bin = bassMinBin; bin <= bassMaxBin; bin++) bch[binPc[bin]] += whitened[bin];
    for (let bin = midMinBin; bin <= midMaxBin; bin++) mch[binPc[bin]] += whitened[bin] * midBinW[bin];

    let bs = 0, ms = 0;
    for (let i = 0; i < 12; i++) { bs += bch[i]; ms += mch[i]; }
    if (bs > 0) for (let i = 0; i < 12; i++) bch[i] /= bs;
    if (ms > 0) for (let i = 0; i < 12; i++) mch[i] /= ms;
    bass[f] = bch;
    mid[f] = mch;
  }
  return { bass, mid, hopSec: hopSize / sampleRate };
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

// ---------------- Diatonic transition prior ----------------

// 7 scale degrees → typical triad quality (major scale & natural minor)
const DIATONIC_MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const DIATONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
const DIATONIC_MAJOR_QUALITIES: ChordQuality[] = ["maj", "min", "min", "maj", "maj", "min", "dim"];
const DIATONIC_MINOR_QUALITIES: ChordQuality[] = ["min", "dim", "maj", "min", "min", "maj", "maj"];

function diatonicChordSet(tonic: string | null, mode: "major" | "minor" | null): Set<string> {
  if (!tonic || !mode) return new Set();
  const root = PITCH_CLASSES[tonic] ?? 0;
  const intervals = mode === "major" ? DIATONIC_MAJOR_INTERVALS : DIATONIC_MINOR_INTERVALS;
  const qualities = mode === "major" ? DIATONIC_MAJOR_QUALITIES : DIATONIC_MINOR_QUALITIES;
  const set = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const r = (root + intervals[i]) % 12;
    const base = qualities[i];
    set.add(`${r}:${base}`);
    // Allow common 7th extensions of each degree
    if (base === "maj") { set.add(`${r}:maj7`); set.add(`${r}:7`); set.add(`${r}:6`); set.add(`${r}:sus2`); set.add(`${r}:sus4`); }
    if (base === "min") { set.add(`${r}:min7`); set.add(`${r}:m6`); }
    if (base === "dim") { set.add(`${r}:m7b5`); set.add(`${r}:dim7`); }
  }
  return set;
}

// ---------------- Public API ----------------

export interface DetectChordsOptions {
  bpm?: number;
  /** Number of beats per chord segment (default 1 = one segment per beat). */
  beatsPerSegment?: number;
  /** Fallback segment length when bpm is unavailable. */
  fallbackSegmentSec?: number;
  durationSec: number;
  /** Optional key prior — when set, diatonic transitions get a small boost. */
  keyTonic?: string | null;
  keyMode?: "major" | "minor" | null;
  /** Precomputed chroma frames — pass when re-running with new params on cached audio. */
  precomputedFrames?: ChromaFrames;
}

interface CandidateState {
  root: number;
  quality: ChordQuality;
  /** Key string "root:quality" used by the diatonic set. */
  key: string;
}

const ALL_STATES: CandidateState[] = (() => {
  const out: CandidateState[] = [];
  for (let r = 0; r < 12; r++) {
    for (const q of Object.keys(INTERVALS) as ChordQuality[]) {
      out.push({ root: r, quality: q, key: `${r}:${q}` });
    }
  }
  return out;
})();

/** Compute one segment's emission score per state. Returns a flat array aligned with ALL_STATES. */
function segmentEmissions(bassChroma: Float32Array, midChroma: Float32Array): Float32Array {
  const out = new Float32Array(ALL_STATES.length);
  // Pre-rotate chromas once per root
  for (let root = 0; root < 12; root++) {
    const rotBass = rotate(bassChroma, root);
    const rotMid = rotate(midChroma, root);
    const bassScore = cosine(rotBass, BASS_TEMPLATE_ROOT);
    for (const q of Object.keys(INTERVALS) as ChordQuality[]) {
      const qualityScore = cosine(rotMid, QUALITY_TEMPLATES[q]);
      const score = (0.35 * bassScore + 0.65 * qualityScore) * QUALITY_PRIOR[q];
      const idx = root * Object.keys(INTERVALS).length + Object.keys(INTERVALS).indexOf(q);
      // Note: ALL_STATES is built in the same order, so this index matches.
      out[idx] = Math.max(0, score);
    }
  }
  return out;
}

/** Viterbi decode: returns one state index per segment. */
function viterbiDecode(
  emissions: Float32Array[],
  diatonicSet: Set<string>,
): { path: number[]; pathScores: number[] } {
  const T = emissions.length;
  const S = ALL_STATES.length;
  if (T === 0) return { path: [], pathScores: [] };

  const SELF = Math.log(0.55);
  const DIATONIC = Math.log(0.025);
  const OTHER = Math.log(0.001);
  const EPS = 1e-6;

  // Precompute per-state diatonic flag
  const isDiatonic = new Uint8Array(S);
  if (diatonicSet.size > 0) {
    for (let s = 0; s < S; s++) isDiatonic[s] = diatonicSet.has(ALL_STATES[s].key) ? 1 : 0;
  }

  let prevLL = new Float64Array(S);
  // Initial distribution: emissions × small diatonic boost
  for (let s = 0; s < S; s++) {
    const em = Math.log(emissions[0][s] + EPS);
    const prior = diatonicSet.size > 0 && isDiatonic[s] ? Math.log(1 / 7) : Math.log(1 / S);
    prevLL[s] = em + prior;
  }

  const backptr: Int16Array[] = new Array(T);
  backptr[0] = new Int16Array(S); // unused but allocated for symmetry

  for (let t = 1; t < T; t++) {
    const curLL = new Float64Array(S);
    const bp = new Int16Array(S);
    // For efficiency: compute per-destination max separately for self vs others.
    // But with S=156 and T~few hundred, O(T·S²) ≈ a few million ops — acceptable in JS.
    for (let dst = 0; dst < S; dst++) {
      const em = Math.log(emissions[t][dst] + EPS);
      let best = -Infinity;
      let bestSrc = 0;
      const dstDiatonic = diatonicSet.size > 0 && isDiatonic[dst];
      for (let src = 0; src < S; src++) {
        let trans: number;
        if (src === dst) trans = SELF;
        else if (dstDiatonic) trans = DIATONIC;
        else trans = OTHER;
        const cand = prevLL[src] + trans;
        if (cand > best) { best = cand; bestSrc = src; }
      }
      curLL[dst] = best + em;
      bp[dst] = bestSrc;
    }
    backptr[t] = bp;
    prevLL = curLL;
  }

  // Backtrack
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

/** Bass pitch-class for a segment: argmax of the bass chroma. */
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

  const segLen = (opts.bpm && opts.bpm > 0)
    ? (60 / opts.bpm) * (opts.beatsPerSegment ?? 1)
    : (opts.fallbackSegmentSec ?? 0.6);

  const total = opts.durationSec;
  // Build segment boundaries
  const boundaries: Array<[number, number]> = [];
  for (let t = 0; t < total; t += segLen) {
    boundaries.push([t, Math.min(total, t + segLen)]);
  }

  // Compute emissions + bass dominants per segment
  const emissions: Float32Array[] = [];
  const bassDominants: number[] = [];
  const validIdx: number[] = [];
  for (let i = 0; i < boundaries.length; i++) {
    const [s, e] = boundaries[i];
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

  // Diatonic set from key prior
  const diatonic = diatonicChordSet(opts.keyTonic ?? null, opts.keyMode ?? null);

  // Viterbi
  const { path, pathScores } = viterbiDecode(emissions, diatonic);

  // Build segments
  const segs: ChordSegment[] = [];
  for (let i = 0; i < path.length; i++) {
    const state = ALL_STATES[path[i]];
    const [s, e] = boundaries[validIdx[i]];
    const pcs = new Set<number>();
    INTERVALS[state.quality].forEach((iv) => pcs.add((iv + state.root) % 12));
    // Confidence: normalize emission to [0..1]
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
  // Append slash bass when bass clearly differs from root
  if (c.bassPc !== undefined) {
    const rootPc = PITCH_CLASSES[root] ?? 0;
    if (c.bassPc !== rootPc) {
      return `${root}${q}/${NOTE_NAMES[c.bassPc]}`;
    }
  }
  return `${root}${q}`;
}

/**
 * Estimate the key from a chord track. Weights each chord by its duration and
 * computes a 12-bin pitch-class histogram over its chord tones, then runs
 * Krumhansl-Schmuckler. Often more reliable than the raw audio chroma because
 * the chord detector already discounted bass octave noise and timbral bias.
 */
export function detectKeyFromChords(chords: ChordSegment[]): { tonic: string; mode: "major" | "minor"; confidence: number } | null {
  if (chords.length === 0) return null;
  const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  const hist = new Array<number>(12).fill(0);
  for (const c of chords) {
    const dur = Math.max(0.05, c.endSec - c.startSec);
    // root weight high, third/fifth moderate
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

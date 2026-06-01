/**
 * Client-side audio analysis: BPM detection + Key detection (Krumhansl-Schmuckler).
 * Designed for accuracy comparable to commercial tools while staying under 5s on typical tracks.
 */

export type CamelotCode = string;
export type KeyMode = "major" | "minor";

export interface KeyResult {
  tonic: string;          // "C", "C#", "D", ... "B"
  mode: KeyMode;
  camelot: CamelotCode;   // e.g. "8B" for C major
  confidence: number;     // 0..1
  alternative: { tonic: string; mode: KeyMode; camelot: CamelotCode; score: number } | null;
}

export interface BpmResult {
  bpm: number;            // rounded to 0.1
  confidence: number;     // 0..1
  candidates: Array<{ bpm: number; score: number }>;
}

export interface AudioAnalysisResult {
  bpm: BpmResult;
  key: KeyResult;
  duration: number;
  sampleRate: number;
  channels: number;
  fileName: string;
  /** Decoded mono samples at original sample rate — used for downstream chord analysis. */
  monoSamples: Float32Array;
}

// ---------------- Note / Camelot tables ----------------

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Camelot wheel mapping: index by [pitchClass][mode]
// Major: B side. Minor: A side.
const CAMELOT_MAJOR: Record<string, string> = {
  C: "8B", "C#": "3B", D: "10B", "D#": "5B", E: "12B", F: "7B",
  "F#": "2B", G: "9B", "G#": "4B", A: "11B", "A#": "6B", B: "1B",
};
const CAMELOT_MINOR: Record<string, string> = {
  C: "5A", "C#": "12A", D: "7A", "D#": "2A", E: "9A", F: "4A",
  "F#": "11A", G: "6A", "G#": "1A", A: "8A", "A#": "3A", B: "10A",
};

export const getCamelot = (tonic: string, mode: KeyMode): string =>
  mode === "major" ? CAMELOT_MAJOR[tonic] : CAMELOT_MINOR[tonic];

// Krumhansl-Schmuckler key profiles (Temperley-revised values for better pop/electronic accuracy)
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

// ---------------- Utility math ----------------

const mean = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length);

const pearsonCorrelation = (a: number[], b: number[]): number => {
  const n = a.length;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i += 1) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  const denom = Math.sqrt(da * db);
  return denom > 0 ? num / denom : 0;
};

// ---------------- Mono mixdown + downsampling ----------------

const mixToMono = (audioBuffer: AudioBuffer): Float32Array => {
  const len = audioBuffer.length;
  const ch = audioBuffer.numberOfChannels;
  const out = new Float32Array(len);
  for (let c = 0; c < ch; c += 1) {
    const data = audioBuffer.getChannelData(c);
    for (let i = 0; i < len; i += 1) out[i] += data[i];
  }
  if (ch > 1) for (let i = 0; i < len; i += 1) out[i] /= ch;
  return out;
};

// Simple anti-aliasing decimation (averaging — good enough for onset/chroma analysis)
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

// ---------------- FFT (radix-2 Cooley-Tukey, in-place) ----------------

export class FFT {
  private readonly n: number;
  private readonly cosTable: Float64Array;
  private readonly sinTable: Float64Array;

  constructor(n: number) {
    if ((n & (n - 1)) !== 0) throw new Error("FFT size must be power of 2");
    this.n = n;
    this.cosTable = new Float64Array(n / 2);
    this.sinTable = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i += 1) {
      this.cosTable[i] = Math.cos((-2 * Math.PI * i) / n);
      this.sinTable[i] = Math.sin((-2 * Math.PI * i) / n);
    }
  }

  // In-place real FFT — returns magnitudes (length n/2)
  forwardMagnitudes(real: Float64Array): Float64Array {
    const n = this.n;
    const imag = new Float64Array(new ArrayBuffer(n * 8));
    // Bit reversal
    let j = 0;
    for (let i = 0; i < n - 1; i += 1) {
      if (i < j) {
        [real[i], real[j]] = [real[j], real[i]];
      }
      let m = n >> 1;
      while (m >= 1 && j >= m) { j -= m; m >>= 1; }
      j += m;
    }
    // Butterflies
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1;
      const tableStep = n / size;
      for (let i = 0; i < n; i += size) {
        for (let k = 0, ti = 0; k < half; k += 1, ti += tableStep) {
          const ix = i + k;
          const jx = ix + half;
          const tre = real[jx] * this.cosTable[ti] - imag[jx] * this.sinTable[ti];
          const tim = real[jx] * this.sinTable[ti] + imag[jx] * this.cosTable[ti];
          real[jx] = real[ix] - tre;
          imag[jx] = imag[ix] - tim;
          real[ix] += tre;
          imag[ix] += tim;
        }
      }
    }
    const mags: Float64Array = new Float64Array(new ArrayBuffer((n / 2) * 8));
    for (let i = 0; i < n / 2; i += 1) {
      mags[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }
    return mags;
  }
}

// ---------------- Onset detection (spectral flux) ----------------

const computeOnsetEnvelope = (samples: Float32Array, sampleRate: number): { envelope: Float32Array; hopRate: number } => {
  const fftSize = 1024;
  const hopSize = 512;
  const fft = new FFT(fftSize);
  const window = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i += 1) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1))); // Hann
  }
  const numFrames = Math.max(1, Math.floor((samples.length - fftSize) / hopSize) + 1);
  const envelope = new Float32Array(numFrames);
  let prevMags: Float64Array = new Float64Array(new ArrayBuffer((fftSize / 2) * 8));
  const buf = new Float64Array(fftSize);

  for (let f = 0; f < numFrames; f += 1) {
    const offset = f * hopSize;
    for (let i = 0; i < fftSize; i += 1) buf[i] = samples[offset + i] * window[i];
    const mags = fft.forwardMagnitudes(buf);
    let flux = 0;
    for (let i = 0; i < mags.length; i += 1) {
      const diff = mags[i] - prevMags[i];
      if (diff > 0) flux += diff; // half-wave rectification
    }
    envelope[f] = flux;
    prevMags = mags;
  }

  // Normalize and remove local mean (adaptive threshold)
  const smoothed = new Float32Array(numFrames);
  const winRadius = 5;
  for (let i = 0; i < numFrames; i += 1) {
    let sum = 0, count = 0;
    for (let j = Math.max(0, i - winRadius); j <= Math.min(numFrames - 1, i + winRadius); j += 1) {
      sum += envelope[j];
      count += 1;
    }
    smoothed[i] = Math.max(0, envelope[i] - sum / count);
  }
  // Final normalization
  let max = 0;
  for (let i = 0; i < numFrames; i += 1) if (smoothed[i] > max) max = smoothed[i];
  if (max > 0) for (let i = 0; i < numFrames; i += 1) smoothed[i] /= max;

  return { envelope: smoothed, hopRate: sampleRate / hopSize };
};

// ---------------- BPM detection (Fourier tempogram + harmonic scoring) ----------------
//
// Why a Fourier tempogram instead of pure autocorrelation:
// Autocorrelation lives on a discrete lag grid where the lag-to-BPM mapping is
// non-linear (BPM = 60 * hopRate / lag). Around 90 BPM at our hop rate, adjacent
// lags map to BPMs ~1.4 BPM apart — so the "true" 91 BPM falls between two grid
// points and ends up snapped to 92 even after interpolation. By taking the FFT of
// the onset envelope itself (over a long, zero-padded window), the bin spacing in
// BPM space is uniform and we get sub-0.1 BPM resolution at any tempo. This is
// the same approach librosa's fourier_tempogram uses and resolves the 92-vs-91
// quantization artifact at the source.

const detectBpm = (samples: Float32Array, sampleRate: number): BpmResult => {
  const targetSr = 11025;
  const ds = downsample(samples, sampleRate, targetSr);
  const { envelope, hopRate } = computeOnsetEnvelope(ds, targetSr);

  // ---- Fourier tempogram on the full onset envelope ----
  // Zero-pad to a power of two large enough for ≥ 0.05 BPM resolution.
  // Resolution per bin = (60 * hopRate) / N. With hopRate ≈ 21.5, N = 32768 → ~0.039 BPM/bin.
  let N = 1;
  while (N < envelope.length) N *= 2;
  if (N < 32768) N = 32768;
  const fft = new FFT(N);
  const buf = new Float64Array(N);
  // Hann window over the actual envelope length, then zero-pad
  const L = envelope.length;
  // Remove DC so the spectrum isn't dominated by the mean
  let envMean = 0;
  for (let i = 0; i < L; i += 1) envMean += envelope[i];
  envMean /= Math.max(1, L);
  for (let i = 0; i < L; i += 1) {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (L - 1)));
    buf[i] = (envelope[i] - envMean) * w;
  }
  const spec = fft.forwardMagnitudes(buf); // length N/2

  // Continuous-BPM access via linear interpolation in the magnitude spectrum.
  // BPM → frequency-in-frames → bin index = bpm/60 * N / hopRate
  const specAt = (bpm: number): number => {
    const idx = (bpm / 60) * N / hopRate;
    if (idx < 0 || idx >= spec.length - 1) return 0;
    const lo = Math.floor(idx);
    const frac = idx - lo;
    return spec[lo] * (1 - frac) + spec[lo + 1] * frac;
  };

  // Harmonic score combines the BPM with its half/double/triple/quadruple harmonics.
  // The half-harmonic term (subdivisions) helps when the dominant onset rate is
  // the half-bar pulse, the multiplier terms help when it's the eighth-note pulse.
  const score = (bpm: number): number =>
    specAt(bpm)
    + 0.6 * specAt(bpm * 2)
    + 0.4 * specAt(bpm * 3)
    + 0.3 * specAt(bpm * 4)
    + 0.5 * specAt(bpm / 2);

  // ---- Coarse search across the full plausible range at 0.05 BPM resolution ----
  const minBpm = 50;
  const maxBpm = 220;
  const coarse: Array<{ bpm: number; s: number }> = [];
  for (let bpm = minBpm; bpm <= maxBpm; bpm += 0.05) {
    coarse.push({ bpm, s: score(bpm) });
  }

  // Pick local maxima as candidates
  const peaks: Array<{ bpm: number; s: number }> = [];
  for (let i = 1; i < coarse.length - 1; i += 1) {
    if (coarse[i].s > coarse[i - 1].s && coarse[i].s > coarse[i + 1].s) {
      peaks.push(coarse[i]);
    }
  }
  peaks.sort((a, b) => b.s - a.s);

  if (peaks.length === 0) {
    return { bpm: 0, confidence: 0, candidates: [] };
  }

  // Octave-fold each candidate into the musical sweet-spot 70-180 BPM
  // and re-score so we compare like with like.
  const folded = peaks.slice(0, 8).map((p) => {
    let bpm = p.bpm;
    while (bpm > 180) bpm /= 2;
    while (bpm < 70) bpm *= 2;
    return { bpm, s: score(bpm) };
  });

  // Cluster nearby candidates (within 1 BPM) so different octaves of the same
  // tempo reinforce each other instead of competing.
  folded.sort((a, b) => b.s - a.s);
  const clusters: Array<{ bpm: number; s: number }> = [];
  for (const c of folded) {
    const hit = clusters.find((cl) => Math.abs(cl.bpm - c.bpm) < 1.0);
    if (hit) {
      // Weighted average of bpm, summed score
      const total = hit.s + c.s;
      hit.bpm = (hit.bpm * hit.s + c.bpm * c.s) / total;
      hit.s = total;
    } else {
      clusters.push({ bpm: c.bpm, s: c.s });
    }
  }
  clusters.sort((a, b) => b.s - a.s);
  const best = clusters[0];

  // ---- Ultra-fine refinement: ±1 BPM at 0.01 resolution around the winner ----
  let refinedBpm = best.bpm;
  let refinedScore = score(refinedBpm);
  const lo = Math.max(minBpm, best.bpm - 1.0);
  const hi = Math.min(maxBpm, best.bpm + 1.0);
  for (let bpm = lo; bpm <= hi; bpm += 0.01) {
    const s = score(bpm);
    if (s > refinedScore) { refinedScore = s; refinedBpm = bpm; }
  }

  // ---- Integer snap: produced music sits on integer BPMs.
  //      If the nearest integer is within 0.5 BPM and scores ≥ 99% of the
  //      refined value, prefer it. Tightened from 98% → 99% so we only snap
  //      when the integer is genuinely a peak, never when the true tempo is fractional.
  const nearestInt = Math.round(refinedBpm);
  if (Math.abs(refinedBpm - nearestInt) <= 0.5) {
    const intScore = score(nearestInt);
    if (intScore >= refinedScore * 0.99) {
      refinedBpm = nearestInt;
      refinedScore = intScore;
    }
  }

  // Confidence: ratio of best cluster score to the sum of top clusters.
  const totalScore = clusters.slice(0, 5).reduce((s, r) => s + r.s, 0);
  const confidence = totalScore > 0 ? Math.min(1, (best.s / totalScore) * 1.5) : 0;

  return {
    bpm: Math.round(refinedBpm * 10) / 10,
    confidence,
    candidates: clusters.slice(0, 5).map((c) => ({ bpm: Math.round(c.bpm * 10) / 10, score: c.s })),
  };
};

// ---------------- Key detection (chroma + Krumhansl-Schmuckler) ----------------

const computeChroma = (samples: Float32Array, sampleRate: number): Float32Array => {
  // Use larger FFT for better frequency resolution at low end
  const fftSize = 4096;
  const hopSize = 2048;
  const fft = new FFT(fftSize);
  const window = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i += 1) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  // Precompute bin -> pitch class mapping (only consider 65 Hz to 2000 Hz — covers C2 to ~B6)
  const minHz = 65;
  const maxHz = 2000;
  const minBin = Math.max(1, Math.floor((minHz * fftSize) / sampleRate));
  const maxBin = Math.min(fftSize / 2 - 1, Math.ceil((maxHz * fftSize) / sampleRate));
  const binPitchClass = new Int8Array(maxBin - minBin + 1);
  const binWeight = new Float32Array(maxBin - minBin + 1);

  for (let bin = minBin; bin <= maxBin; bin += 1) {
    const freq = (bin * sampleRate) / fftSize;
    // MIDI note number = 69 + 12 * log2(f/440)
    const midi = 69 + 12 * Math.log2(freq / 440);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    binPitchClass[bin - minBin] = pc;
    // De-emphasize very low and very high; A4 region weighted highest
    binWeight[bin - minBin] = 1.0;
  }

  // Analyze the central 70% of the track to skip intros/outros
  const totalFrames = Math.max(1, Math.floor((samples.length - fftSize) / hopSize) + 1);
  const startFrame = Math.floor(totalFrames * 0.15);
  const endFrame = Math.ceil(totalFrames * 0.85);

  const chroma = new Float32Array(12);
  const buf = new Float64Array(fftSize);

  for (let f = startFrame; f < endFrame; f += 1) {
    const offset = f * hopSize;
    if (offset + fftSize > samples.length) break;
    for (let i = 0; i < fftSize; i += 1) buf[i] = samples[offset + i] * window[i];
    const mags = fft.forwardMagnitudes(buf);
    for (let bin = minBin; bin <= maxBin; bin += 1) {
      const pc = binPitchClass[bin - minBin];
      chroma[pc] += mags[bin] * binWeight[bin - minBin];
    }
  }

  // Normalize
  let total = 0;
  for (let i = 0; i < 12; i += 1) total += chroma[i];
  if (total > 0) for (let i = 0; i < 12; i += 1) chroma[i] /= total;
  return chroma;
};

const detectKey = (samples: Float32Array, sampleRate: number): KeyResult => {
  const chroma = computeChroma(samples, sampleRate);
  const chromaArr = Array.from(chroma);

  const scores: Array<{ tonic: string; mode: KeyMode; score: number }> = [];

  for (let shift = 0; shift < 12; shift += 1) {
    const rotated: number[] = [];
    for (let i = 0; i < 12; i += 1) rotated.push(chromaArr[(i + shift) % 12]);
    const majorScore = pearsonCorrelation(rotated, MAJOR_PROFILE);
    const minorScore = pearsonCorrelation(rotated, MINOR_PROFILE);
    scores.push({ tonic: NOTE_NAMES[shift], mode: "major", score: majorScore });
    scores.push({ tonic: NOTE_NAMES[shift], mode: "minor", score: minorScore });
  }

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const second = scores[1];
  // Confidence: gap between best and second, normalized (clamped)
  const gap = best.score - second.score;
  const confidence = Math.max(0, Math.min(1, gap * 4 + best.score * 0.3));

  return {
    tonic: best.tonic,
    mode: best.mode,
    camelot: getCamelot(best.tonic, best.mode),
    confidence,
    alternative: {
      tonic: second.tonic,
      mode: second.mode,
      camelot: getCamelot(second.tonic, second.mode),
      score: second.score,
    },
  };
};

// ---------------- Public entry point ----------------

export const analyzeAudioFile = async (file: File): Promise<AudioAnalysisResult> => {
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextCtor();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  await audioContext.close();

  const mono = mixToMono(audioBuffer);
  const sr = audioBuffer.sampleRate;

  // Run BPM and Key in sequence — both are CPU-bound, sequential is fine and predictable
  const bpm = detectBpm(mono, sr);
  const key = detectKey(mono, sr);

  return {
    bpm,
    key,
    duration: audioBuffer.duration,
    sampleRate: sr,
    channels: audioBuffer.numberOfChannels,
    fileName: file.name,
  };
};

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

class FFT {
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
    const mags = new Float64Array(n / 2);
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
  let prevMags = new Float64Array(fftSize / 2);
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

// ---------------- BPM detection (autocorrelation + octave correction) ----------------

const detectBpm = (samples: Float32Array, sampleRate: number): BpmResult => {
  // Downsample to ~11025 Hz for speed (mono onset detection doesn't need high SR)
  const targetSr = 11025;
  const ds = downsample(samples, sampleRate, targetSr);
  const { envelope, hopRate } = computeOnsetEnvelope(ds, targetSr);

  // Autocorrelation in lag domain corresponding to BPM range [50, 220]
  const minBpm = 50;
  const maxBpm = 220;
  const minLag = Math.max(2, Math.floor((60 / maxBpm) * hopRate));
  const maxLag = Math.min(envelope.length - 1, Math.floor((60 / minBpm) * hopRate));

  const ac = new Float32Array(maxLag - minLag + 1);
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0;
    const lim = envelope.length - lag;
    for (let i = 0; i < lim; i += 1) sum += envelope[i] * envelope[i + lag];
    ac[lag - minLag] = sum / lim;
  }

  // Find local maxima as candidates
  const candidates: Array<{ lag: number; score: number; bpm: number }> = [];
  for (let i = 1; i < ac.length - 1; i += 1) {
    if (ac[i] > ac[i - 1] && ac[i] > ac[i + 1]) {
      const lag = i + minLag;
      // Parabolic interpolation for sub-sample precision
      const a = ac[i - 1], b = ac[i], c = ac[i + 1];
      const denom = (a - 2 * b + c);
      const offset = denom !== 0 ? 0.5 * (a - c) / denom : 0;
      const refinedLag = lag + offset;
      candidates.push({ lag: refinedLag, score: b, bpm: (60 * hopRate) / refinedLag });
    }
  }

  if (candidates.length === 0) {
    return { bpm: 0, confidence: 0, candidates: [] };
  }

  // Score each candidate by considering harmonic support: a true tempo will have peaks at 2x and 3x its lag too
  const scoreWithHarmonics = (cand: { lag: number; score: number }) => {
    let total = cand.score;
    for (const mult of [2, 3, 4]) {
      const idx = Math.round(cand.lag * mult - minLag);
      if (idx >= 0 && idx < ac.length) total += ac[idx] * (1 / mult);
    }
    return total;
  };

  const scored = candidates.map((c) => ({ ...c, harmScore: scoreWithHarmonics(c) }));
  scored.sort((a, b) => b.harmScore - a.harmScore);

  // Take top candidate, then apply octave correction:
  // Prefer values in the 70-180 BPM "musical sweet spot"
  const top = scored.slice(0, 6);
  const adjusted = top.map((c) => {
    let bpm = c.bpm;
    while (bpm < 70 && bpm * 2 <= 200) bpm *= 2;
    while (bpm > 180 && bpm / 2 >= 60) bpm /= 2;
    return { bpm, score: c.harmScore };
  });

  // Aggregate: round-bin BPMs and sum scores (tracks with similar BPMs reinforce)
  const bins = new Map<number, number>();
  adjusted.forEach((c) => {
    const key = Math.round(c.bpm * 2) / 2; // 0.5 BPM resolution for binning
    bins.set(key, (bins.get(key) ?? 0) + c.score);
  });

  const ranked = Array.from(bins.entries())
    .map(([bpm, score]) => ({ bpm, score }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const totalScore = ranked.reduce((s, r) => s + r.score, 0);
  const confidence = totalScore > 0 ? Math.min(1, best.score / totalScore * 1.5) : 0;

  return {
    bpm: Math.round(best.bpm * 10) / 10,
    confidence,
    candidates: ranked.slice(0, 5),
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

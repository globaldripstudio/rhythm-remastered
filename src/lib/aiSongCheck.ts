// AI Song Checker — heuristic, on-device analysis.
// IMPORTANT: This is NOT a trained classifier. It computes acoustic
// fingerprints frequently associated with AI-generated audio (Suno,
// Udio, MusicGen…) and returns probabilistic hints. Treat as indicative.

export type Verdict = "very_likely" | "likely" | "unlikely" | "very_unlikely";

export interface ProbBlock {
  human: number;
  hybrid: number;
  ai: number;
  humanVerdict: Verdict;
  hybridVerdict: Verdict;
  aiVerdict: Verdict;
}

export interface AISongCheckResult {
  durationSec: number;
  sampleRate: number;
  spectral: ProbBlock;
  temporal: ProbBlock;
  overall: ProbBlock;
  features: {
    spectralFlatnessMean: number;
    spectralFlatnessStd: number;
    hfCutoffHz: number;
    stereoCorrelation: number;
    onsetIntervalCv: number; // coefficient of variation
    rmsMicroDynamics: number; // dB std over short windows
    silenceRatio: number;
  };
}

const verdictFor = (p: number): Verdict => {
  if (p >= 0.7) return "very_likely";
  if (p >= 0.5) return "likely";
  if (p >= 0.25) return "unlikely";
  return "very_unlikely";
};

const normalize3 = (a: number, b: number, c: number): [number, number, number] => {
  const s = a + b + c || 1;
  return [a / s, b / s, c / s];
};

const toProbBlock = (human: number, hybrid: number, ai: number): ProbBlock => {
  const [h, hy, a] = normalize3(human, hybrid, ai);
  return {
    human: h,
    hybrid: hy,
    ai: a,
    humanVerdict: verdictFor(h),
    hybridVerdict: verdictFor(hy),
    aiVerdict: verdictFor(a),
  };
};

// FFT-free spectral analysis using browser AnalyserNode would require
// playback; instead we use OfflineAudioContext with a custom DFT via
// the browser's AnalyserNode in an OfflineAudioContext is not available,
// so we compute a windowed magnitude spectrum via radix-2 FFT.

// Iterative radix-2 FFT (in-place). Length must be power of 2.
const fftReal = (input: Float32Array): { re: Float32Array; im: Float32Array } => {
  const n = input.length;
  const re = new Float32Array(n);
  const im = new Float32Array(n);
  re.set(input);

  // bit-reversal
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < half; k++) {
        const tRe = curRe * re[i + k + half] - curIm * im[i + k + half];
        const tIm = curRe * im[i + k + half] + curIm * re[i + k + half];
        re[i + k + half] = re[i + k] - tRe;
        im[i + k + half] = im[i + k] - tIm;
        re[i + k] += tRe;
        im[i + k] += tIm;
        const nRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nRe;
      }
    }
  }
  return { re, im };
};

const hann = (n: number): Float32Array => {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
  return w;
};

// Decode an audio file in the browser
export const decodeAudio = async (file: File): Promise<AudioBuffer> => {
  const arr = await file.arrayBuffer();
  const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
  const ctx = new Ctx();
  try {
    return await ctx.decodeAudioData(arr);
  } finally {
    ctx.close().catch(() => {});
  }
};

// Main analysis
export const analyzeForAI = async (file: File): Promise<AISongCheckResult> => {
  const buffer = await decodeAudio(file);
  const sr = buffer.sampleRate;
  const dur = buffer.duration;
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;

  // Downmix to mono for spectral work
  const mono = new Float32Array(left.length);
  for (let i = 0; i < left.length; i++) mono[i] = 0.5 * (left[i] + right[i]);

  // --- Spectral features (windowed FFT over the track) ---
  const FFT = 2048;
  const HOP = 1024;
  const win = hann(FFT);
  const frames = Math.max(1, Math.floor((mono.length - FFT) / HOP));
  const flatnessVals: number[] = [];
  const centroidVals: number[] = [];
  const hfCutoffs: number[] = [];

  const maxFrames = Math.min(frames, 600); // cap for perf (~10s at 48kHz)
  const step = Math.max(1, Math.floor(frames / maxFrames));

  for (let f = 0; f < frames; f += step) {
    const off = f * HOP;
    const frame = new Float32Array(FFT);
    for (let i = 0; i < FFT; i++) frame[i] = mono[off + i] * win[i];
    const { re, im } = fftReal(frame);
    const mags = new Float32Array(FFT / 2);
    let geo = 0;
    let arith = 0;
    let nz = 0;
    let weighted = 0;
    let sumMag = 0;
    for (let i = 1; i < FFT / 2; i++) {
      const m = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
      mags[i] = m;
      if (m > 1e-10) {
        geo += Math.log(m);
        nz++;
      }
      arith += m;
      weighted += i * m;
      sumMag += m;
    }
    const flatness = nz > 0 ? Math.exp(geo / nz) / (arith / (FFT / 2)) : 0;
    flatnessVals.push(flatness);
    centroidVals.push(sumMag > 0 ? (weighted / sumMag) * (sr / FFT) : 0);

    // HF cutoff: bin where energy drops below 1% of max for the rest
    const maxM = Math.max(...mags);
    let cutoffBin = FFT / 2 - 1;
    const threshold = maxM * 0.005;
    for (let i = FFT / 2 - 1; i > 0; i--) {
      if (mags[i] > threshold) {
        cutoffBin = i;
        break;
      }
    }
    hfCutoffs.push((cutoffBin * sr) / FFT);
  }

  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
  const std = (a: number[], m?: number) => {
    const mu = m ?? mean(a);
    return Math.sqrt(a.reduce((s, v) => s + (v - mu) ** 2, 0) / (a.length || 1));
  };

  const flatnessMean = mean(flatnessVals);
  const flatnessStd = std(flatnessVals, flatnessMean);
  const hfCutoff = mean(hfCutoffs);

  // Stereo correlation
  let sumLR = 0;
  let sumL2 = 0;
  let sumR2 = 0;
  for (let i = 0; i < left.length; i++) {
    sumLR += left[i] * right[i];
    sumL2 += left[i] * left[i];
    sumR2 += right[i] * right[i];
  }
  const stereoCorr = sumL2 > 0 && sumR2 > 0 ? sumLR / Math.sqrt(sumL2 * sumR2) : 1;

  // --- Temporal features ---
  // Onset detection via spectral flux
  const fluxFFT = 1024;
  const fluxHop = 512;
  const fluxFrames = Math.max(2, Math.floor((mono.length - fluxFFT) / fluxHop));
  const fluxWin = hann(fluxFFT);
  let prevMags: Float32Array | null = null;
  const flux: number[] = [];
  const stepF = Math.max(1, Math.floor(fluxFrames / 1500));
  for (let f = 0; f < fluxFrames; f += stepF) {
    const off = f * fluxHop;
    const frame = new Float32Array(fluxFFT);
    for (let i = 0; i < fluxFFT; i++) frame[i] = mono[off + i] * fluxWin[i];
    const { re, im } = fftReal(frame);
    const mags = new Float32Array(fluxFFT / 2);
    for (let i = 0; i < fluxFFT / 2; i++) mags[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    let f0 = 0;
    if (prevMags) {
      for (let i = 0; i < mags.length; i++) {
        const d = mags[i] - prevMags[i];
        if (d > 0) f0 += d;
      }
    }
    flux.push(f0);
    prevMags = mags;
  }
  // Peak picking
  const fluxMean = mean(flux);
  const fluxStd = std(flux, fluxMean);
  const peakThresh = fluxMean + 1.2 * fluxStd;
  const onsets: number[] = [];
  for (let i = 2; i < flux.length - 2; i++) {
    if (
      flux[i] > peakThresh &&
      flux[i] >= flux[i - 1] &&
      flux[i] >= flux[i + 1] &&
      flux[i] >= flux[i - 2] &&
      flux[i] >= flux[i + 2]
    ) {
      onsets.push((i * fluxHop * stepF) / sr);
    }
  }
  // Inter-onset interval CV
  let onsetCv = 0;
  if (onsets.length > 4) {
    const iois: number[] = [];
    for (let i = 1; i < onsets.length; i++) iois.push(onsets[i] - onsets[i - 1]);
    const mu = mean(iois);
    const sd = std(iois, mu);
    onsetCv = mu > 0 ? sd / mu : 0;
  }

  // RMS micro-dynamics (window ~50ms)
  const rmsWin = Math.floor(sr * 0.05);
  const rmsHop = Math.floor(sr * 0.025);
  const rmsDb: number[] = [];
  for (let i = 0; i + rmsWin < mono.length; i += rmsHop) {
    let s = 0;
    for (let k = 0; k < rmsWin; k++) s += mono[i + k] * mono[i + k];
    const r = Math.sqrt(s / rmsWin);
    rmsDb.push(20 * Math.log10(r + 1e-9));
  }
  const rmsMicro = std(rmsDb);

  // Silence ratio (frames below -60 dBFS)
  const silenceRatio = rmsDb.filter((d) => d < -60).length / (rmsDb.length || 1);

  // --- Heuristic scoring ---
  // SPECTRAL block
  // AI signals: very low flatness variance (synthetic uniformity),
  // HF cutoff between 14k-18k (most AI music models),
  // stereo correlation extremely high (>0.97) or extremely low.
  let aiSpec = 0;
  let humanSpec = 0;

  // flatness std normalized — humans ~0.05-0.15, AI tends lower
  const flatStdNorm = Math.min(1, flatnessStd / 0.1);
  aiSpec += (1 - flatStdNorm) * 0.35;
  humanSpec += flatStdNorm * 0.35;

  // HF cutoff suspicion (AI cuts around 15-17kHz commonly)
  let hfSuspicion = 0;
  if (hfCutoff > 13500 && hfCutoff < 17500) hfSuspicion = 1 - Math.abs(hfCutoff - 15500) / 2000;
  else hfSuspicion = 0;
  aiSpec += hfSuspicion * 0.3;
  humanSpec += (1 - hfSuspicion) * 0.3;

  // Stereo correlation — humans usually 0.4-0.9; AI often >0.95 or near mono
  const stereoSus = stereoCorr > 0.95 ? (stereoCorr - 0.95) / 0.05 : stereoCorr < 0.2 ? (0.2 - stereoCorr) / 0.2 : 0;
  aiSpec += stereoSus * 0.35;
  humanSpec += (1 - stereoSus) * 0.35;

  const hybridSpec = Math.max(0, 1 - Math.abs(aiSpec - humanSpec)) * 0.4 + Math.min(aiSpec, humanSpec) * 0.4;
  const spectral = toProbBlock(humanSpec, hybridSpec, aiSpec);

  // TEMPORAL block
  // AI signals: very regular onsets (low CV), low micro-dynamics,
  // unnaturally consistent silence patterns.
  let aiTemp = 0;
  let humanTemp = 0;

  // onset CV — humans ~0.3-0.7, AI often <0.2
  const onsetNorm = Math.min(1, onsetCv / 0.5);
  aiTemp += (1 - onsetNorm) * 0.4;
  humanTemp += onsetNorm * 0.4;

  // micro-dynamics std (dB) — humans 4-10dB typical, AI often <3
  const microNorm = Math.min(1, rmsMicro / 6);
  aiTemp += (1 - microNorm) * 0.4;
  humanTemp += microNorm * 0.4;

  // silence ratio extremes
  const silSus = silenceRatio < 0.005 || silenceRatio > 0.4 ? 0.6 : 0.2;
  aiTemp += silSus * 0.2;
  humanTemp += (1 - silSus) * 0.2;

  const hybridTemp = Math.max(0, 1 - Math.abs(aiTemp - humanTemp)) * 0.4 + Math.min(aiTemp, humanTemp) * 0.4;
  const temporal = toProbBlock(humanTemp, hybridTemp, aiTemp);

  // Overall blend
  const overall = toProbBlock(
    (spectral.human + temporal.human) / 2,
    (spectral.hybrid + temporal.hybrid) / 2,
    (spectral.ai + temporal.ai) / 2
  );

  return {
    durationSec: dur,
    sampleRate: sr,
    spectral,
    temporal,
    overall,
    features: {
      spectralFlatnessMean: flatnessMean,
      spectralFlatnessStd: flatnessStd,
      hfCutoffHz: hfCutoff,
      stereoCorrelation: stereoCorr,
      onsetIntervalCv: onsetCv,
      rmsMicroDynamics: rmsMicro,
      silenceRatio,
    },
  };
};

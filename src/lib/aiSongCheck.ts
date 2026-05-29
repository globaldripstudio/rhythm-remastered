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
  // Estimated AI/Human ratio, only present when overall verdict is hybrid
  // and the spectral/temporal blocks diverge meaningfully.
  hybridMix: { aiPct: number; humanPct: number } | null;
  features: {
    spectralFlatnessMean: number;
    spectralFlatnessStd: number;
    hfCutoffHz: number;
    hfEnergyRatio: number; // energy above 16kHz / total
    stereoCorrelation: number;
    onsetIntervalCv: number;
    rmsMicroDynamics: number;
    silenceRatio: number;
    envelopeRepetition: number; // 0..1, higher = looped/repeated
    noiseFloorDb: number;
  };
}

const verdictFor = (p: number): Verdict => {
  if (p >= 0.6) return "very_likely";
  if (p >= 0.4) return "likely";
  if (p >= 0.2) return "unlikely";
  return "very_unlikely";
};

// Softmax with temperature — low T = decisive verdicts
const softmaxT = (vals: number[], T = 0.4): number[] => {
  const max = Math.max(...vals);
  const exps = vals.map((v) => Math.exp((v - max) / T));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
};

const toProbBlock = (humanRaw: number, hybridRaw: number, aiRaw: number): ProbBlock => {
  const [h, hy, a] = softmaxT([humanRaw, hybridRaw, aiRaw], 0.35);
  return {
    human: h,
    hybrid: hy,
    ai: a,
    humanVerdict: verdictFor(h),
    hybridVerdict: verdictFor(hy),
    aiVerdict: verdictFor(a),
  };
};

// Iterative radix-2 FFT (in-place). Length must be power of 2.
const fftReal = (input: Float32Array): { re: Float32Array; im: Float32Array } => {
  const n = input.length;
  const re = new Float32Array(n);
  const im = new Float32Array(n);
  re.set(input);

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

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const std = (a: number[], m?: number) => {
  const mu = m ?? mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - mu) ** 2, 0) / (a.length || 1));
};

// Tent function: returns 1 at center, 0 at edges
const tent = (x: number, center: number, halfWidth: number): number => {
  const d = Math.abs(x - center);
  return Math.max(0, 1 - d / halfWidth);
};

export const analyzeForAI = async (file: File): Promise<AISongCheckResult> => {
  const buffer = await decodeAudio(file);
  const sr = buffer.sampleRate;
  const dur = buffer.duration;
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;

  const mono = new Float32Array(left.length);
  for (let i = 0; i < left.length; i++) mono[i] = 0.5 * (left[i] + right[i]);

  // --- Spectral features ---
  const FFT = 2048;
  const HOP = 1024;
  const win = hann(FFT);
  const frames = Math.max(1, Math.floor((mono.length - FFT) / HOP));
  const flatnessVals: number[] = [];
  const hfCutoffs: number[] = [];
  let totalEnergy = 0;
  let hfEnergy = 0;
  const hf16Bin = Math.floor((16000 * FFT) / sr);

  const maxFrames = Math.min(frames, 600);
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
    for (let i = 1; i < FFT / 2; i++) {
      const m = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
      mags[i] = m;
      if (m > 1e-10) {
        geo += Math.log(m);
        nz++;
      }
      arith += m;
      totalEnergy += m;
      if (i >= hf16Bin) hfEnergy += m;
    }
    const flatness = nz > 0 ? Math.exp(geo / nz) / (arith / (FFT / 2)) : 0;
    flatnessVals.push(flatness);

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

  const flatnessMean = mean(flatnessVals);
  const flatnessStd = std(flatnessVals, flatnessMean);
  const hfCutoff = mean(hfCutoffs);
  const hfEnergyRatio = totalEnergy > 0 ? hfEnergy / totalEnergy : 0;

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

  // --- Temporal: onset/flux ---
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
  const silenceRatio = rmsDb.filter((d) => d < -60).length / (rmsDb.length || 1);

  // Noise floor: percentile 5 of RMS dB (excluding pure silence)
  const sortedNonSilent = rmsDb.filter((d) => d > -80).slice().sort((a, b) => a - b);
  const noiseFloorDb = sortedNonSilent.length > 0 ? sortedNonSilent[Math.floor(sortedNonSilent.length * 0.05)] : -60;

  // Envelope repetition via autocorrelation on RMS envelope (peak after lag 1s)
  let envRepetition = 0;
  if (rmsDb.length > 50) {
    const env = rmsDb.map((d) => Math.pow(10, d / 20));
    const envMean = mean(env);
    const centered = env.map((v) => v - envMean);
    const denom = centered.reduce((s, v) => s + v * v, 0) || 1;
    const framesPerSec = 1 / 0.025;
    const minLag = Math.max(5, Math.floor(framesPerSec * 0.8));
    const maxLag = Math.min(centered.length - 10, Math.floor(framesPerSec * 8));
    let maxCorr = 0;
    for (let lag = minLag; lag < maxLag; lag++) {
      let s = 0;
      for (let i = 0; i + lag < centered.length; i++) s += centered[i] * centered[i + lag];
      const c = s / denom;
      if (c > maxCorr) maxCorr = c;
    }
    envRepetition = Math.max(0, Math.min(1, maxCorr));
  }

  // ============== SCORING ==============
  // Each marker votes [-1..+1]: positive = AI-like, negative = human-like.

  // Spectral markers
  const flatStdM = flatnessStd < 0.04 ? 1 - flatnessStd / 0.04 : -Math.min(1, (flatnessStd - 0.04) / 0.1);
  const hfCutoffM = hfCutoff > 13500 && hfCutoff < 17500
    ? tent(hfCutoff, 15500, 2000)
    : hfCutoff > 19000
    ? -0.6
    : 0;
  const hfEnergyM = hfEnergyRatio < 0.005 ? 0.7 : hfEnergyRatio > 0.05 ? -0.5 : 0;
  const stereoM = stereoCorr > 0.95 ? Math.min(1, (stereoCorr - 0.95) / 0.05) : stereoCorr > 0.4 && stereoCorr < 0.9 ? -0.7 : 0;

  const spectralAi = Math.max(0, flatStdM) * 0.3 + Math.max(0, hfCutoffM) * 0.3 + Math.max(0, hfEnergyM) * 0.15 + Math.max(0, stereoM) * 0.25;
  const spectralHuman = Math.max(0, -flatStdM) * 0.3 + Math.max(0, -hfCutoffM) * 0.3 + Math.max(0, -hfEnergyM) * 0.15 + Math.max(0, -stereoM) * 0.25;

  // Temporal markers
  const onsetM = onsets.length > 4 ? (onsetCv < 0.2 ? 1 - onsetCv / 0.2 : -Math.min(1, (onsetCv - 0.2) / 0.4)) : 0;
  const microM = rmsMicro < 3 ? 1 - rmsMicro / 3 : -Math.min(1, (rmsMicro - 3) / 5);
  const repM = envRepetition > 0.6 ? Math.min(1, (envRepetition - 0.6) / 0.3) : -Math.min(0.5, (0.6 - envRepetition) / 0.6);
  const noiseM = noiseFloorDb < -70 ? Math.min(1, (-70 - noiseFloorDb) / 15) : -0.3;

  const temporalAi = Math.max(0, onsetM) * 0.35 + Math.max(0, microM) * 0.3 + Math.max(0, repM) * 0.2 + Math.max(0, noiseM) * 0.15;
  const temporalHuman = Math.max(0, -onsetM) * 0.35 + Math.max(0, -microM) * 0.3 + Math.max(0, -repM) * 0.2 + Math.max(0, -noiseM) * 0.15;

  // Hybrid logit: peaks when spectral and temporal disagree (one says AI, the other human).
  // Disagreement magnitude in [0..1]; we also require both signals to be non-trivial.
  const specDelta = spectralAi - spectralHuman; // [-1..1]
  const tempDelta = temporalAi - temporalHuman; // [-1..1]
  const disagreement = Math.max(0, -specDelta * tempDelta); // > 0 only if opposite signs
  const strength = (Math.abs(specDelta) + Math.abs(tempDelta)) / 2;
  const hybridRaw = Math.min(1, disagreement * 4) * strength;

  // Build blocks. Hybrid inside each block is small unless both halves split.
  const spectral = toProbBlock(spectralHuman, hybridRaw * 0.5, spectralAi);
  const temporal = toProbBlock(temporalHuman, hybridRaw * 0.5, temporalAi);

  const overallHuman = (spectralHuman + temporalHuman) / 2;
  const overallAi = (spectralAi + temporalAi) / 2;
  const overall = toProbBlock(overallHuman, hybridRaw, overallAi);

  // Hybrid mix estimation: only when hybrid is the dominant verdict
  let hybridMix: { aiPct: number; humanPct: number } | null = null;
  if (overall.hybrid >= 0.45 && overall.hybrid >= overall.human && overall.hybrid >= overall.ai) {
    // Combine the two-sided AI/Human signal across both axes
    const aiTotal = spectralAi + temporalAi;
    const humanTotal = spectralHuman + temporalHuman;
    const tot = aiTotal + humanTotal;
    if (tot > 0.05) {
      const aiPct = Math.round((aiTotal / tot) * 100);
      hybridMix = { aiPct, humanPct: 100 - aiPct };
    }
  }

  return {
    durationSec: dur,
    sampleRate: sr,
    spectral,
    temporal,
    overall,
    hybridMix,
    features: {
      spectralFlatnessMean: flatnessMean,
      spectralFlatnessStd: flatnessStd,
      hfCutoffHz: hfCutoff,
      hfEnergyRatio,
      stereoCorrelation: stereoCorr,
      onsetIntervalCv: onsetCv,
      rmsMicroDynamics: rmsMicro,
      silenceRatio,
      envelopeRepetition: envRepetition,
      noiseFloorDb,
    },
  };
};

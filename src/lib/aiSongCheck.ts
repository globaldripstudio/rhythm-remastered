// AI Song Checker — on-device acoustic analysis.
// Computes ~16 acoustic markers commonly associated with AI-generated music
// (Suno, Udio, MusicGen…) and combines them with an elimination-style
// scoring scheme that produces decisive Human / Hybrid / AI verdicts.

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
  hybridMix: { aiPct: number; humanPct: number } | null;
  features: {
    spectralFlatnessMean: number;
    spectralFlatnessStd: number;
    hfCutoffHz: number;
    hfEnergyRatio: number;
    stereoCorrelation: number;
    onsetIntervalCv: number;
    rmsMicroDynamics: number;
    silenceRatio: number;
    envelopeRepetition: number;
    noiseFloorDb: number;
  };
}

// Sharper verdict bands — pushes results toward clearer language.
const verdictFor = (p: number): Verdict => {
  if (p >= 0.55) return "very_likely";
  if (p >= 0.35) return "likely";
  if (p >= 0.18) return "unlikely";
  return "very_unlikely";
};

const softmaxT = (vals: number[], T: number): number[] => {
  const max = Math.max(...vals);
  const exps = vals.map((v) => Math.exp((v - max) / T));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
};

const toProbBlock = (humanRaw: number, hybridRaw: number, aiRaw: number, T = 0.22): ProbBlock => {
  const [h, hy, a] = softmaxT([humanRaw, hybridRaw, aiRaw], T);
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

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Two-sided marker → vote in [-1, +1]. Positive = AI-like, negative = human-like.
// `aiCenter` is the value where vote = +1 (most AI-like).
// `humanCenter` is the value where vote = -1 (most human-like).
// Linear interpolation in between, clamped.
const vote = (value: number, humanCenter: number, aiCenter: number): number => {
  if (humanCenter === aiCenter) return 0;
  const t = (value - humanCenter) / (aiCenter - humanCenter);
  return Math.max(-1, Math.min(1, t * 2 - 1));
};

export const analyzeForAI = async (file: File): Promise<AISongCheckResult> => {
  const buffer = await decodeAudio(file);
  const sr = buffer.sampleRate;
  const dur = buffer.duration;
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;

  const mono = new Float32Array(left.length);
  for (let i = 0; i < left.length; i++) mono[i] = 0.5 * (left[i] + right[i]);

  // ===== Spectral pass =====
  const FFT = 2048;
  const HOP = 1024;
  const win = hann(FFT);
  const frames = Math.max(1, Math.floor((mono.length - FFT) / HOP));
  const flatnessVals: number[] = [];
  const hfCutoffs: number[] = [];
  const rolloff85Vals: number[] = [];
  let totalEnergy = 0;
  let hfEnergy = 0;
  const hf16Bin = Math.floor((16000 * FFT) / sr);
  const hf4Bin = Math.floor((4000 * FFT) / sr);
  const hf8Bin = Math.floor((8000 * FFT) / sr);

  // Mel-ish: 16 log-spaced bands from 80 Hz to sr/2
  const NUM_BANDS = 16;
  const bandEdges: number[] = [];
  const fMin = 80;
  const fMax = sr / 2;
  for (let i = 0; i <= NUM_BANDS; i++) {
    const f = fMin * Math.pow(fMax / fMin, i / NUM_BANDS);
    bandEdges.push(Math.max(1, Math.min(FFT / 2 - 1, Math.floor((f * FFT) / sr))));
  }
  const bandEnergyOverTime: number[][] = Array.from({ length: NUM_BANDS }, () => []);

  // Phase coherence: track unwrapped phase at 5 mid bins across frames
  const phaseBins = [
    Math.floor((300 * FFT) / sr),
    Math.floor((600 * FFT) / sr),
    Math.floor((1000 * FFT) / sr),
    Math.floor((1800 * FFT) / sr),
    Math.floor((3000 * FFT) / sr),
  ];
  const phaseDeltas: number[][] = phaseBins.map(() => []);
  const prevPhase: number[] = phaseBins.map(() => 0);
  let phaseInit = false;

  // Per-frame HF (4–8 kHz) energy + total energy, to compute breath ratio later
  const frameHfMidEnergy: number[] = [];
  const frameTotalEnergy: number[] = [];

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
    let frameTot = 0;
    let frameHfMid = 0;
    for (let i = 1; i < FFT / 2; i++) {
      const m = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
      mags[i] = m;
      if (m > 1e-10) {
        geo += Math.log(m);
        nz++;
      }
      arith += m;
      totalEnergy += m;
      frameTot += m;
      if (i >= hf16Bin) hfEnergy += m;
      if (i >= hf4Bin && i < hf8Bin) frameHfMid += m;
    }
    frameTotalEnergy.push(frameTot);
    frameHfMidEnergy.push(frameHfMid);

    const flatness = nz > 0 ? Math.exp(geo / nz) / (arith / (FFT / 2)) : 0;
    flatnessVals.push(flatness);

    // HF cutoff (top frequency above noise floor)
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

    // Rolloff 85% (frequency below which 85% of cumulative energy lies)
    const target85 = arith * 0.85;
    let cum = 0;
    let r85Bin = FFT / 2 - 1;
    for (let i = 1; i < FFT / 2; i++) {
      cum += mags[i];
      if (cum >= target85) {
        r85Bin = i;
        break;
      }
    }
    rolloff85Vals.push((r85Bin * sr) / FFT);

    // Mel-ish band energies
    for (let b = 0; b < NUM_BANDS; b++) {
      let s = 0;
      for (let i = bandEdges[b]; i < bandEdges[b + 1]; i++) s += mags[i];
      bandEnergyOverTime[b].push(s);
    }

    // Phase coherence
    for (let p = 0; p < phaseBins.length; p++) {
      const bin = phaseBins[p];
      const ph = Math.atan2(im[bin], re[bin]);
      if (phaseInit) {
        let d = ph - prevPhase[p];
        // wrap to [-pi, pi]
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        phaseDeltas[p].push(d);
      }
      prevPhase[p] = ph;
    }
    phaseInit = true;
  }

  const flatnessMean = mean(flatnessVals);
  const flatnessStd = std(flatnessVals, flatnessMean);
  const hfCutoff = mean(hfCutoffs);
  const hfEnergyRatio = totalEnergy > 0 ? hfEnergy / totalEnergy : 0;
  const rolloff85 = mean(rolloff85Vals);

  // Mel-band variance: average across bands of (std/mean) — coefficient of variation
  const melCv = mean(
    bandEnergyOverTime.map((arr) => {
      const mu = mean(arr);
      return mu > 1e-9 ? std(arr, mu) / mu : 0;
    })
  );

  // Phase coherence: average std of phase deltas across tracked bins.
  // Low std (≈0) = unnaturally smooth → AI. Natural music ≈ 1.0–1.8 rad.
  const phaseCoherence = mean(phaseDeltas.map((arr) => (arr.length > 1 ? std(arr) : 1.5)));

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

  // ===== Temporal pass: onset/flux =====
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

  // RMS micro-dynamics (window ~50 ms)
  const rmsWin = Math.floor(sr * 0.05);
  const rmsHop = Math.floor(sr * 0.025);
  const rmsDb: number[] = [];
  const rmsLin: number[] = [];
  for (let i = 0; i + rmsWin < mono.length; i += rmsHop) {
    let s = 0;
    for (let k = 0; k < rmsWin; k++) s += mono[i + k] * mono[i + k];
    const r = Math.sqrt(s / rmsWin);
    rmsLin.push(r);
    rmsDb.push(20 * Math.log10(r + 1e-9));
  }
  const rmsMicro = std(rmsDb);
  const silenceRatio = rmsDb.filter((d) => d < -60).length / (rmsDb.length || 1);

  const sortedNonSilent = rmsDb.filter((d) => d > -80).slice().sort((a, b) => a - b);
  const noiseFloorDb = sortedNonSilent.length > 0 ? sortedNonSilent[Math.floor(sortedNonSilent.length * 0.05)] : -60;

  // Envelope repetition
  let envRepetition = 0;
  if (rmsDb.length > 50) {
    const env = rmsLin.slice();
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

  // ===== New marker: ZCR variance (pitch jitter proxy) =====
  // Per 30 ms windows, count zero crossings. Natural voice/instruments vary; AI is steadier.
  const zcrWin = Math.floor(sr * 0.03);
  const zcrHop = Math.floor(sr * 0.015);
  const zcrs: number[] = [];
  for (let i = 0; i + zcrWin < mono.length; i += zcrHop) {
    let zc = 0;
    let prev = mono[i];
    for (let k = 1; k < zcrWin; k++) {
      const cur = mono[i + k];
      if ((prev >= 0 && cur < 0) || (prev < 0 && cur >= 0)) zc++;
      prev = cur;
    }
    zcrs.push(zc / zcrWin);
  }
  const zcrMu = mean(zcrs);
  const zcrCv = zcrMu > 1e-6 ? std(zcrs, zcrMu) / zcrMu : 0;

  // ===== New marker: reverb tail decay regularity =====
  // Find peaks in RMS env, measure slope over the following 8 frames (~200 ms).
  // Low variance of slopes = "perfect" decay every time → AI.
  const decaySlopes: number[] = [];
  for (let i = 4; i < rmsDb.length - 10; i++) {
    if (
      rmsDb[i] > rmsDb[i - 1] &&
      rmsDb[i] > rmsDb[i + 1] &&
      rmsDb[i] > -25
    ) {
      // Linear fit on rmsDb[i..i+8]
      const xs: number[] = [];
      const ys: number[] = [];
      for (let k = 0; k < 8; k++) {
        xs.push(k);
        ys.push(rmsDb[i + k]);
      }
      const mx = mean(xs);
      const my = mean(ys);
      let num = 0;
      let den = 0;
      for (let k = 0; k < xs.length; k++) {
        num += (xs[k] - mx) * (ys[k] - my);
        den += (xs[k] - mx) ** 2;
      }
      if (den > 0) decaySlopes.push(num / den);
    }
  }
  const decayRegularity = decaySlopes.length > 5 ? std(decaySlopes) : 5;

  // ===== New marker: breath/ambience ratio =====
  // Compare HF (4–8 kHz) energy share in quietest 25% frames vs all frames.
  // Higher in quiet = breaths/room noise = human.
  let breathRatio = 1;
  if (frameTotalEnergy.length > 20) {
    const ratios = frameTotalEnergy.map((t, i) => (t > 1e-6 ? frameHfMidEnergy[i] / t : 0));
    const sorted = frameTotalEnergy.slice().sort((a, b) => a - b);
    const quietThresh = sorted[Math.floor(sorted.length * 0.25)];
    const quietRatios = ratios.filter((_, i) => frameTotalEnergy[i] <= quietThresh);
    const loudRatios = ratios.filter((_, i) => frameTotalEnergy[i] > quietThresh);
    const qMean = mean(quietRatios);
    const lMean = mean(loudRatios);
    breathRatio = lMean > 1e-6 ? qMean / lMean : 1;
  }

  // ============== SCORING ==============
  // Each marker → vote in [-1, +1]. Positive = AI-like.
  type Marker = { v: number; w: number };
  const sMarkers: Marker[] = [
    // Spectral
    { v: vote(flatnessStd, 0.12, 0.025), w: 1.0 }, // low variance over time = AI
    { v: vote(hfCutoff, 19500, 15500), w: 1.0 }, // capped around 15.5 kHz = AI
    { v: vote(hfEnergyRatio, 0.04, 0.003), w: 0.6 }, // very low HF share = AI
    { v: vote(stereoCorr, 0.7, 0.97), w: 0.9 }, // near-mono = AI
    { v: vote(melCv, 0.9, 0.35), w: 1.0 }, // low band-level variation over time = AI
    { v: vote(phaseCoherence, 1.6, 0.6), w: 1.1 }, // smooth phase = AI
    { v: vote(rolloff85, 9000, 4500), w: 0.6 }, // low rolloff = bandwidth limited = AI
  ];
  const tMarkers: Marker[] = [
    // Temporal
    { v: vote(onsetCv, 0.5, 0.12), w: 1.2 }, // metronomic = AI
    { v: vote(rmsMicro, 7, 2.5), w: 1.1 }, // very lissé = AI
    { v: vote(envRepetition, 0.25, 0.75), w: 0.9 }, // looped envelope = AI
    { v: vote(noiseFloorDb, -55, -78), w: 1.0 }, // unnaturally clean floor = AI
    { v: vote(zcrCv, 0.45, 0.1), w: 0.9 }, // pitch-jitter / instability low = AI
    { v: vote(decayRegularity, 6, 1.2), w: 0.9 }, // perfect decay every time = AI
    { v: vote(breathRatio, 1.6, 0.6), w: 0.8 }, // quiet sections lack breath/room = AI
  ];

  const evidence = (markers: Marker[]) => {
    let aiE = 0;
    let huE = 0;
    let wTot = 0;
    for (const m of markers) {
      aiE += Math.max(0, m.v) * m.w;
      huE += Math.max(0, -m.v) * m.w;
      wTot += m.w;
    }
    return { ai: aiE / (wTot || 1), human: huE / (wTot || 1) };
  };

  const spec = evidence(sMarkers);
  const temp = evidence(tMarkers);

  // Aggregate global evidence (weight temporal slightly higher — onset/dynamics
  // tend to be the most reliable "human" signature in mixed productions).
  const aiE = spec.ai * 0.45 + temp.ai * 0.55;
  const huE = spec.human * 0.45 + temp.human * 0.55;

  // ===== Elimination logic =====
  // pureHuman raw: human evidence, strongly suppressed by AI evidence
  // pureAI raw: AI evidence, strongly suppressed by human evidence
  // hybrid raw: peaks when both signals are non-trivial simultaneously
  const SUPPRESS = 2.2;
  const pureHumanRaw = Math.pow(huE, 1.1) * clamp01(1 - aiE * SUPPRESS);
  const pureAiRaw = Math.pow(aiE, 1.1) * clamp01(1 - huE * SUPPRESS);
  // Coexistence score: high only if BOTH evidences are meaningful.
  const coexist = 4 * Math.sqrt(Math.max(0, aiE * huE));
  const hybridRaw = coexist * (1 - Math.abs(aiE - huE) * 0.6);

  const spectral = toProbBlock(spec.human, 2 * Math.sqrt(spec.ai * spec.human), spec.ai);
  const temporal = toProbBlock(temp.human, 2 * Math.sqrt(temp.ai * temp.human), temp.ai);
  const overall = toProbBlock(pureHumanRaw, hybridRaw, pureAiRaw, 0.18);

  // ===== Hybrid mix estimation =====
  // Show whenever there is meaningful evidence of BOTH worlds — not only when
  // hybrid wins. Threshold tuned so that an obvious all-human or all-AI track
  // doesn't get a misleading mix readout.
  let hybridMix: { aiPct: number; humanPct: number } | null = null;
  const bothMeaningful = aiE > 0.12 && huE > 0.12;
  if (bothMeaningful || overall.hybrid >= 0.35) {
    const total = aiE + huE;
    if (total > 0.05) {
      // Slight contrast bias so the dominant side is not flattened to 50/50.
      const rawAi = aiE / total;
      const contrasted = clamp01(0.5 + (rawAi - 0.5) * 1.15);
      const aiPct = Math.round(contrasted * 100);
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

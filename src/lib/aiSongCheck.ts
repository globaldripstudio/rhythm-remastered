// AI Song Checker — on-device acoustic analysis.
// Computes ~16 acoustic markers commonly associated with AI-generated music
// (Suno, Udio, MusicGen…) and combines them with an elimination-style
// scoring scheme that produces decisive Human / Hybrid / AI verdicts.

export type Verdict = "very_likely" | "likely" | "unlikely" | "very_unlikely";

export type MarkerId =
  | "flatnessStd"
  | "hfCutoff"
  | "hfEnergyRatio"
  | "stereoCorr"
  | "melCv"
  | "phaseCoherence"
  | "rolloff85"
  | "onsetCv"
  | "rmsMicro"
  | "envRepetition"
  | "noiseFloor"
  | "zcrCv"
  | "decayRegularity"
  | "breathRatio";

export type MarkerSide = "ai" | "human";

export interface TopMarker {
  id: MarkerId;
  side: MarkerSide;
  strength: number; // 0..1 normalized contribution
}

export type QualityIssue =
  | "shortFile"
  | "lowSampleRate"
  | "lowBandwidth"
  | "noisy"
  | "monoOnly";

export interface CompressionInfo {
  detected: boolean;
  codecGuess: string | null;
  cutoffHz: number;
  sourceBoundary: boolean;
}

export type Confidence = "high" | "medium" | "low";

export interface ProbBlock {
  human: number;
  hybrid: number;
  ai: number;
  humanVerdict: Verdict;
  hybridVerdict: Verdict;
  aiVerdict: Verdict;
  topMarkers: TopMarker[];
}

export interface FileMeta {
  nativeSampleRate: number | null;
  bitrateKbps: number | null;
  year: number | null;
  encoder: string | null;
}

export interface AISongCheckResult {
  durationSec: number;
  sampleRate: number | null;
  meta?: FileMeta;
  trim?: { startSec: number; endSec: number };
  preAiEra?: boolean;
  spectral: ProbBlock;
  temporal: ProbBlock;
  overall: ProbBlock;
  confidence: Confidence;
  qualityIssues: QualityIssue[];
  compression: CompressionInfo;
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

const toProbBlock = (humanRaw: number, hybridRaw: number, aiRaw: number, topMarkers: TopMarker[] = [], T = 0.22): ProbBlock => {
  const [h, hy, a] = softmaxT([humanRaw, hybridRaw, aiRaw], T);
  return {
    human: h,
    hybrid: hy,
    ai: a,
    humanVerdict: verdictFor(h),
    hybridVerdict: verdictFor(hy),
    aiVerdict: verdictFor(a),
    topMarkers,
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

// Reads the container header (before any browser resampling) and basic tags.
const readText = (b: Uint8Array, start: number, end: number): string => {
  if (end <= start) return "";
  const enc = b[start];
  const body = b.subarray(start + 1, end);
  try {
    if (enc === 1 || enc === 2) return new TextDecoder(enc === 1 ? "utf-16" : "utf-16be").decode(body).replace(/\0/g, "").trim();
    if (enc === 3) return new TextDecoder("utf-8").decode(body).replace(/\0/g, "").trim();
    return new TextDecoder("latin1").decode(body).replace(/\0/g, "").trim();
  } catch {
    return "";
  }
};

export const parseFileMeta = (b: Uint8Array): FileMeta => {
  const meta: FileMeta = { nativeSampleRate: null, bitrateKbps: null, year: null, encoder: null };
  const str = (o: number, n: number) => String.fromCharCode(...b.subarray(o, o + n));
  const years: number[] = [];
  const pushYear = (s: string) => {
    const m = s.match(/(19|20)\d{2}/);
    if (m) years.push(parseInt(m[0], 10));
  };
  // WAV
  if (b.length > 12 && str(0, 4) === "RIFF" && str(8, 4) === "WAVE") {
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    let o = 12;
    while (o + 8 <= b.length) {
      const id = str(o, 4);
      const size = dv.getUint32(o + 4, true);
      if (id === "fmt " && o + 16 <= b.length) meta.nativeSampleRate = dv.getUint32(o + 12, true);
      if (id === "LIST" && str(o + 8, 4) === "INFO") {
        let p = o + 12;
        const end = Math.min(b.length, o + 8 + size);
        while (p + 8 <= end) {
          const sid = str(p, 4);
          const ss = dv.getUint32(p + 4, true);
          const val = new TextDecoder("latin1").decode(b.subarray(p + 8, Math.min(end, p + 8 + ss))).replace(/\0/g, "").trim();
          if (sid === "ICRD") pushYear(val);
          if (sid === "ISFT") meta.encoder = val;
          p += 8 + ss + (ss & 1);
        }
      }
      o += 8 + size + (size & 1);
    }
  }
  // FLAC
  else if (b.length > 22 && str(0, 4) === "fLaC") {
    meta.nativeSampleRate = (b[18] << 12) | (b[19] << 4) | (b[20] >> 4);
    const txt = new TextDecoder("utf-8").decode(b.subarray(0, Math.min(b.length, 65536)));
    const d = txt.match(/DATE=([^\0\x00-\x1f]{4,20})/i);
    if (d) pushYear(d[1]);
    const e = txt.match(/ENCODER=([^\x00-\x1f]{1,60})/i);
    if (e) meta.encoder = e[1];
  } else {
    // MP3 (optional ID3v2)
    let o = 0;
    if (b.length > 10 && str(0, 3) === "ID3") {
      const ver = b[3];
      const tagSize = ((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f);
      let p = 10;
      const end = Math.min(b.length, 10 + tagSize);
      while (p + 10 <= end && ver >= 3) {
        const id = str(p, 4);
        if (!/^[A-Z0-9]{4}$/.test(id)) break;
        const size = ver === 4
          ? ((b[p + 4] & 0x7f) << 21) | ((b[p + 5] & 0x7f) << 14) | ((b[p + 6] & 0x7f) << 7) | (b[p + 7] & 0x7f)
          : (b[p + 4] << 24) | (b[p + 5] << 16) | (b[p + 6] << 8) | b[p + 7];
        if (size <= 0) break;
        const fs = p + 10;
        const fe = Math.min(end, fs + size);
        if (id === "TDRC" || id === "TYER" || id === "TDOR" || id === "TORY") pushYear(readText(b, fs, fe));
        if ((id === "TENC" || id === "TSSE") && !meta.encoder) meta.encoder = readText(b, fs, fe) || null;
        p = fe;
      }
      o = 10 + tagSize;
    }
    const SR = [[44100, 48000, 32000], [22050, 24000, 16000], [11025, 12000, 8000]];
    const BR_MPEG1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
    const BR_MPEG2_L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
    for (let i = o; i < Math.min(b.length - 4, o + 65536); i++) {
      if (b[i] === 0xff && (b[i + 1] & 0xe0) === 0xe0) {
        const verBits = (b[i + 1] >> 3) & 3; // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
        const layer = (b[i + 1] >> 1) & 3;
        const srIdx = (b[i + 2] >> 2) & 3;
        const brIdx = b[i + 2] >> 4;
        if (verBits === 1 || layer === 0 || srIdx === 3 || brIdx === 15 || brIdx === 0) continue;
        const sampleRate = SR[verBits === 3 ? 0 : verBits === 2 ? 1 : 2][srIdx];
        const bitrate = (verBits === 3 ? BR_MPEG1_L3 : BR_MPEG2_L3)[brIdx];
        const padding = (b[i + 2] >> 1) & 1;
        const frameLength = Math.floor(((verBits === 3 ? 144 : 72) * bitrate * 1000) / sampleRate) + padding;
        const next = i + frameLength;
        // Certify an MP3 header only when the following frame agrees. This
        // prevents arbitrary bytes in artwork/other containers being shown as 48 kHz.
        if (frameLength > 4 && next + 3 < b.length && b[next] === 0xff && (b[next + 1] & 0xe0) === 0xe0) {
          const nextVer = (b[next + 1] >> 3) & 3;
          const nextSrIdx = (b[next + 2] >> 2) & 3;
          if (nextVer === verBits && nextSrIdx === srIdx) {
            meta.nativeSampleRate = sampleRate;
            meta.bitrateKbps = bitrate;
            break;
          }
        }
      }
    }
    // LAME tag fallback for encoder
    if (!meta.encoder) {
      const txt = new TextDecoder("latin1").decode(b.subarray(0, Math.min(b.length, 200000)));
      const m = txt.match(/LAME\d\.\d+/);
      if (m) meta.encoder = m[0];
    }
  }
  if (years.length) meta.year = Math.min(...years);
  if (meta.nativeSampleRate !== null && (meta.nativeSampleRate < 4000 || meta.nativeSampleRate > 384000)) meta.nativeSampleRate = null;
  return meta;
};

// Public release of mainstream generative music models (Suno v1 / Udio).
const GENERATIVE_ERA_YEAR = 2023;

export const analyzeForAI = async (file: File): Promise<AISongCheckResult> => {
  let meta: FileMeta = { nativeSampleRate: null, bitrateKbps: null, year: null, encoder: null };
  let tagBytes = 0;
  try {
    const header = new Uint8Array(await file.slice(0, Math.min(file.size, 4 * 1024 * 1024)).arrayBuffer());
    meta = parseFileMeta(header);
    if (header.length >= 10 && String.fromCharCode(...header.subarray(0, 3)) === "ID3") {
      tagBytes = 10 + (((header[6] & 0x7f) << 21) | ((header[7] & 0x7f) << 14) | ((header[8] & 0x7f) << 7) | (header[9] & 0x7f));
    }
    // Large embedded artwork can put the first audio frame beyond the initial
    // read. Probe directly after the declared ID3 tag instead of trusting the
    // browser-decoded rate, which may have been resampled by the audio device.
    if (meta.nativeSampleRate === null && header.length >= 10 && String.fromCharCode(...header.subarray(0, 3)) === "ID3") {
      const tagSize = ((header[6] & 0x7f) << 21) | ((header[7] & 0x7f) << 14) | ((header[8] & 0x7f) << 7) | (header[9] & 0x7f);
      const audioStart = 10 + tagSize;
      const probe = new Uint8Array(await file.slice(audioStart, Math.min(file.size, audioStart + 128 * 1024)).arrayBuffer());
      const audioMeta = parseFileMeta(probe);
      meta.nativeSampleRate = audioMeta.nativeSampleRate;
      meta.bitrateKbps = audioMeta.bitrateKbps;
      if (!meta.encoder) meta.encoder = audioMeta.encoder;
    }
    // ID3v1 stores the year in the final 128 bytes and is common on older MP3s.
    if (meta.year === null && file.size >= 128) {
      const tail = new Uint8Array(await file.slice(file.size - 128).arrayBuffer());
      if (String.fromCharCode(...tail.subarray(0, 3)) === "TAG") {
        const taggedYear = new TextDecoder("latin1").decode(tail.subarray(93, 97));
        const match = taggedYear.match(/(19|20)\d{2}/);
        if (match) meta.year = Number(match[0]);
      }
    }
    // The local file date is a final historical source when the container has
    // no date. It affects the historical prior but is never presented as encoder metadata.
    if (meta.year === null && file.lastModified > 0) {
      const modifiedYear = new Date(file.lastModified).getFullYear();
      const nowYear = new Date().getFullYear();
      if (modifiedYear >= 1950 && modifiedYear <= nowYear) meta.year = modifiedYear;
    }
  } catch {
    /* ignore */
  }
  const buffer = await decodeAudio(file);
  const sr = buffer.sampleRate;
  const fullLeft = buffer.getChannelData(0);
  const fullRight = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : fullLeft;

  // ===== Trim leading / trailing silence: analyse only where there is signal =====
  const tw = Math.floor(sr * 0.05);
  let peakDb = -120;
  const winDb: number[] = [];
  for (let i = 0; i + tw <= fullLeft.length; i += tw) {
    let s = 0;
    for (let k = 0; k < tw; k++) {
      const v = 0.5 * (fullLeft[i + k] + fullRight[i + k]);
      s += v * v;
    }
    const d = 10 * Math.log10(s / tw + 1e-12);
    winDb.push(d);
    if (d > peakDb) peakDb = d;
  }
  const thr = Math.min(-50, peakDb - 40);
  let first = winDb.findIndex((d) => d > thr);
  let last = winDb.length - 1;
  while (last > 0 && winDb[last] <= thr) last--;
  if (first < 0) { first = 0; last = winDb.length - 1; }
  let startS = Math.max(0, (first - 1) * tw);
  let endS = Math.min(fullLeft.length, (last + 2) * tw);
  if (endS - startS < sr * 3) { startS = 0; endS = fullLeft.length; }
  const left = fullLeft.subarray(startS, endS);
  const right = fullRight.subarray(startS, endS);
  const dur = left.length / sr;

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
  // Lossy-codec detection: per-frame edge steepness at the cutoff and
  // residual energy above it. A brickwall lowpass (MP3/AAC/Opus) drops
  // tens of dB within a few bins and leaves a near-silent floor above.
  const edgeDropsDb: number[] = [];
  const aboveFloorRatios: number[] = [];
  // Global peak spectrum (max magnitude per bin over the whole track):
  // a codec brickwall shows up here unambiguously, even when individual
  // frames have little HF content (808-heavy mixes, sparse hats...).
  const peakSpec = new Float64Array(FFT / 2);
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
    for (let i = 1; i < FFT / 2; i++) if (mags[i] > peakSpec[i]) peakSpec[i] = mags[i];

    // Edge steepness: dB drop from the cutoff bin to ~5 bins above it,
    // and residual energy above the cutoff relative to the frame peak.
    if (maxM > 1e-9 && cutoffBin < FFT / 2 - 10) {
      const ref = mags[cutoffBin];
      let above = 0;
      let aboveN = 0;
      for (let i = cutoffBin + 2; i < Math.min(FFT / 2, cutoffBin + 8); i++) {
        above += mags[i];
        aboveN++;
      }
      const aboveMean = aboveN > 0 ? above / aboveN : 0;
      edgeDropsDb.push(20 * Math.log10((ref + 1e-9) / (aboveMean + 1e-9)));
      let tail = 0;
      let tailN = 0;
      for (let i = cutoffBin + 8; i < FFT / 2; i++) {
        tail += mags[i];
        tailN++;
      }
      aboveFloorRatios.push(tailN > 0 ? tail / tailN / maxM : 0);
    }

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

  // ===== Lossy-codec detection =====
  // A codec lowpass is a brickwall: steep drop (> 25 dB within ~5 bins)
  // at a characteristic frequency, with a near-silent floor above.
  // Natural/AI bandwidth limits roll off progressively instead.
  const median = (a: number[]) => {
    if (a.length === 0) return 0;
    const s = a.slice().sort((x, y) => x - y);
    return s[Math.floor(s.length / 2)];
  };
  const medDrop = median(edgeDropsDb);
  const medFloor = median(aboveFloorRatios);
  const medCutoff = median(hfCutoffs);
  const CODEC_CUTS: { hz: number; label: string }[] = [
    { hz: 15000, label: "MP3 ~96-128 kbps" },
    { hz: 16000, label: "MP3 ~128 kbps" },
    { hz: 17000, label: "MP3 ~160 kbps / AAC" },
    { hz: 18000, label: "MP3 ~192 kbps / AAC" },
    { hz: 18500, label: "AAC ~192 kbps" },
    { hz: 20000, label: "MP3 / AAC / Opus" },
  ];
  const nyquist = sr / 2;
  const matchedCut = CODEC_CUTS.find((c) => Math.abs(medCutoff - c.hz) <= 700);
  const frameDetected =
    medCutoff > 8000 &&
    medCutoff < nyquist * 0.97 &&
    medDrop > 15 &&
    medFloor < 0.01 &&
    matchedCut !== undefined;

  // Peak-spectrum brickwall detection (primary, robust).
  const half = FFT / 2;
  const pDb = new Float64Array(half);
  let pMax = -Infinity;
  for (let i = 1; i < half; i++) {
    pDb[i] = 20 * Math.log10(peakSpec[i] + 1e-12);
    if (pDb[i] > pMax) pMax = pDb[i];
  }
  const minBin = Math.floor((13000 * FFT) / sr);
  // Leave room for the wide "above" window (1–3 kHz past the edge).
  const maxBin = Math.min(half - Math.round((3100 * FFT) / sr), Math.floor((nyquist * 0.97 * FFT) / sr));
  let bestDrop = 0;
  let bestBin = -1;
  for (let c = minBin; c <= maxBin; c++) {
    let below = 0;
    for (let i = c - 6; i < c; i++) below += pDb[i];
    below /= 6;
    // Wide comparison band 1–3 kHz above the edge: codec roll-offs are often
    // gradual (energy lingers just past the cutoff), so a narrow band right
    // above the edge underestimates the true drop.
    let above = 0;
    let n = 0;
    for (let i = c + Math.round((1000 * FFT) / sr); i < Math.min(half, c + Math.round((3000 * FFT) / sr)); i++) { above += pDb[i]; n++; }
    above /= Math.max(1, n);
    const drop = below - above;
    // require content below the edge to be meaningful (within 90 dB of peak)
    if (below > pMax - 90 && drop > bestDrop) { bestDrop = drop; bestBin = c; }
  }
  const peakCutHz = bestBin > 0 ? (bestBin * sr) / FFT : 0;
  // 30 dB threshold: loud sub-bass mixes can soften the measured brickwall drop
  // (e.g. 32.8 dB on a true 20 kHz MP3 cutoff) — 35 dB was too strict.
  const peakDetected = bestBin > 0 && bestDrop > 30;

  const compressionDetected = peakDetected || frameDetected;
  // Prefer the peak-spectrum cutoff for display when a codec wall was found:
  // the per-frame median is heavily biased by sub-bass content. Without a
  // detected wall, fall back to the per-frame mean (no brickwall to report).
  const cutHz = compressionDetected && bestBin > 0 ? peakCutHz : hfCutoff;
  const guess =
    CODEC_CUTS.reduce((a, b) => (Math.abs(b.hz - cutHz) < Math.abs(a.hz - cutHz) ? b : a)).label;
  // Fallback bitrate when no consecutive MPEG frames certified the header
  // value (sloppy converter containers): estimate from payload size/duration,
  // excluding ID3 tags so embedded artwork cannot inflate the estimate.
  let bitrateKbps = meta.bitrateKbps;
  if (bitrateKbps === null) {
    const durationSec = fullLeft.length / sr;
    if (durationSec > 1) {
      const est = Math.round(((file.size - tagBytes) * 8) / (durationSec * 1000));
      if (est >= 32 && est <= 400) bitrateKbps = est;
    }
  }
  // A 15–16.4 kHz source boundary inside a >=160 kbps MP3 is not explained by
  // that bitrate alone. Treat it as surviving acoustic evidence (often a 32 kHz
  // generative source), while keeping the later MP3 conversion as file context.
  const anomalousSourceBoundary =
    compressionDetected &&
    peakCutHz >= 14800 &&
    peakCutHz <= 16400 &&
    bitrateKbps !== null &&
    bitrateKbps >= 160;
  const compression: CompressionInfo = {
    detected: compressionDetected,
    codecGuess: compressionDetected ? guess : null,
    cutoffHz: cutHz,
    sourceBoundary: anomalousSourceBoundary,
  };

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
  type Marker = { id: MarkerId; v: number; w: number };
  const sMarkersAll: Marker[] = [
    // Recalibrated: sustained harmonic material (pads, 808s) naturally sits ~0.02–0.05.
    { id: "flatnessStd", v: vote(flatnessStd, 0.05, 0.01), w: 1.0 },
    { id: "hfCutoff", v: vote(hfCutoff, 18000, 14000), w: 0.7 },
    { id: "hfEnergyRatio", v: vote(hfEnergyRatio, 0.04, 0.003), w: 0.6 },
    // Deep markers (survive lossy re-encoding) are weighted higher.
    { id: "stereoCorr", v: vote(stereoCorr, 0.55, 0.98), w: 0.9 },
    { id: "melCv", v: vote(melCv, 1.0, 0.25), w: 1.0 },
    { id: "phaseCoherence", v: vote(phaseCoherence, 1.6, 0.6), w: 1.4 },
    { id: "rolloff85", v: vote(rolloff85, 9000, 4500), w: 0.4 },
  ];
  // On lossy-compressed files, bandwidth markers measure the codec, not
  // the source — exclude them so an MP3 can't mimic an AI signature.
  const sMarkers = compressionDetected && !anomalousSourceBoundary
    ? sMarkersAll.filter((m) => m.id !== "hfCutoff" && m.id !== "rolloff85" && m.id !== "hfEnergyRatio")
    : sMarkersAll.map((m) =>
        anomalousSourceBoundary && m.id === "hfCutoff"
          ? { ...m, v: Math.max(m.v, 0.9), w: 1.2 }
          : m
      );
  const tMarkers: Marker[] = [
    { id: "onsetCv", v: vote(onsetCv, 0.5, 0.12), w: 1.2 },
    { id: "rmsMicro", v: vote(rmsMicro, 7, 2.5), w: 1.3 },
    { id: "envRepetition", v: vote(envRepetition, 0.25, 0.75), w: 0.9 },
    { id: "noiseFloor", v: vote(noiseFloorDb, -55, -78), w: 1.3 },
    { id: "zcrCv", v: vote(zcrCv, 0.45, 0.1), w: 0.9 },
    { id: "decayRegularity", v: vote(decayRegularity, 6, 1.2), w: 0.9 },
    { id: "breathRatio", v: vote(breathRatio, 1.6, 0.6), w: 0.8 },
  ];
  // Deep acoustic concurrence survives transcoding better than metadata or the
  // bandwidth alone. Only reinforce it when several independent signatures
  // agree, avoiding a global threshold change for old/noisy human recordings.
  if (anomalousSourceBoundary) {
    if (stereoCorr > 0.98 && envRepetition > 0.62) {
      tMarkers.push({ id: "stereoCorr", v: 0.9, w: 1.2 });
      tMarkers.push({ id: "envRepetition", v: 0.75, w: 1.1 });
    }
    if (noiseFloorDb > -35 && phaseCoherence < 1.35) {
      tMarkers.push({ id: "noiseFloor", v: 0.65, w: 0.9 });
    }
  }

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

  const deepConcurrence = anomalousSourceBoundary && stereoCorr > 0.98 && envRepetition > 0.62;
  const aiE = Math.min(1, spec.ai * 0.45 + temp.ai * 0.55 + (deepConcurrence ? 0.08 : 0));
  const huE = spec.human * 0.45 + temp.human * 0.55;

  // ===== Bayesian fusion =====
  // Acoustic evidence -> log-likelihood ratio, combined with a historical
  // prior from file dating. Each source weighs by its reliability.
  const nowYear = new Date().getFullYear();
  const yr = meta.year !== null && meta.year >= 1950 && meta.year <= nowYear ? meta.year : null;
  let priorAI = 0.5;
  if (yr !== null) {
    // Pre-2021 files predate public generative music: treated as human.
    if (yr <= 2020) priorAI = 0.0005;
    else if (yr <= 2022) priorAI = 0.05;
  }
  const preAiEra = yr !== null && yr < GENERATIVE_ERA_YEAR;
  const logit = (p: number) => Math.log(p / (1 - p));
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const K_LLR = 6;
  const pAI = sigmoid(K_LLR * (aiE - huE) + logit(priorAI));

  const hybridScore = (a: number, h: number) => {
    const m = Math.min(a, h);
    const diff = Math.abs(a - h);
    return 1.4 * m * Math.pow(Math.max(0, 1 - diff), 3);
  };

  // Hybrid = real disagreement between independent domains, gated by prior.
  // Two sources: (1) cross-domain contradiction (spectral vs temporal net signs),
  // (2) intrinsic hybrid within one domain corroborated by a clear opposite
  // verdict in the other (e.g. AI-sampled loop + human-played instruments).
  const specNet = spec.ai - spec.human;
  const tempNet = temp.ai - temp.human;
  const disagreement = specNet * tempNet < 0 ? Math.min(Math.abs(specNet), Math.abs(tempNet)) : 0;
  // The corroborating domain must be decidedly one-sided (net margin > 0.15),
  // otherwise a merely torn domain would manufacture hybrids on pure-AI or
  // pure-human files whose other domain is simply ambiguous.
  const intrS = hybridScore(spec.ai, spec.human) * clamp01((temp.human - temp.ai - 0.15) * 3);
  const intrT = hybridScore(temp.ai, temp.human) * clamp01((spec.human - spec.ai - 0.15) * 3);
  // A clear intrinsic signal (>= 0.30) is trusted at face value; a weak one is
  // discounted to avoid manufacturing hybrids on merely ambiguous pure files.
  const intrMax = Math.max(intrS, intrT);
  const hybridRaw = Math.max(disagreement, intrMax >= 0.3 ? intrMax : 0.55 * intrMax);
  const hY = clamp01(sigmoid(12 * (hybridRaw - 0.2)) * Math.min(1, priorAI * 2));
  const aiP = pAI * (1 - hY);
  const huP = (1 - pAI) * (1 - hY);

  const topFrom = (markers: Marker[], n = 3): TopMarker[] =>
    markers
      .map((m) => ({
        id: m.id,
        side: (m.v >= 0 ? "ai" : "human") as MarkerSide,
        strength: clamp01(Math.abs(m.v) * m.w),
      }))
      .filter((m) => m.strength > 0.05)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, n);

  const spectral = toProbBlock(spec.human, hybridScore(spec.ai, spec.human), spec.ai, topFrom(sMarkers));
  const temporal = toProbBlock(temp.human, hybridScore(temp.ai, temp.human), temp.ai, topFrom(tMarkers));
  const historicalLock = yr !== null && yr <= 2020;
  const overall: ProbBlock = historicalLock ? {
    human: 0.995, hybrid: 0.004, ai: 0.001,
    humanVerdict: "very_likely", hybridVerdict: "very_unlikely", aiVerdict: "very_unlikely",
    topMarkers: topFrom([...sMarkers, ...tMarkers]),
  } : {
    human: huP, hybrid: hY, ai: aiP,
    humanVerdict: verdictFor(huP), hybridVerdict: verdictFor(hY), aiVerdict: verdictFor(aiP),
    topMarkers: topFrom([...sMarkers, ...tMarkers]),
  };

  // ===== Quality assessment =====
  const qualityIssues: QualityIssue[] = [];
  if (dur < 10) qualityIssues.push("shortFile");
  if (sr < 32000) qualityIssues.push("lowSampleRate");
  if (hfCutoff < 13000 && hfEnergyRatio < 0.0015 && !compressionDetected) qualityIssues.push("lowBandwidth");
  if (noiseFloorDb > -30) qualityIssues.push("noisy");
  if (stereoCorr > 0.995) qualityIssues.push("monoOnly");

  const decisiveness = Math.max(huP, aiP, hY);
  let confidence: Confidence = "high";
  if (historicalLock) confidence = "high";
  else if (qualityIssues.includes("shortFile") || decisiveness < 0.6) confidence = "low";
  else if (qualityIssues.length >= 1 || decisiveness < 0.8) confidence = "medium";

  return {
    durationSec: fullLeft.length / sr,
    sampleRate: meta.nativeSampleRate,
    meta,
    trim: { startSec: startS / sr, endSec: endS / sr },
    preAiEra,
    spectral,
    temporal,
    overall,
    confidence,
    qualityIssues,
    compression,
    features: {
      spectralFlatnessMean: flatnessMean,
      spectralFlatnessStd: flatnessStd,
      hfCutoffHz: cutHz,
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

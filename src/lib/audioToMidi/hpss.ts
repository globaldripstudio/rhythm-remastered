/**
 * Harmonic / Percussive Source Separation (HPSS) — Fitzgerald 2010.
 *
 * Computes an STFT, runs median filters horizontally (favoring sustained tones)
 * and vertically (favoring sharp transients), then resynthesizes two signals
 * via soft masking + iSTFT (overlap-add).
 *
 * Pure TypeScript, no dependencies. Targets 22050 Hz mono input — heavier rates
 * are downmixed by the caller before invocation.
 */

import { FFT } from "@/lib/audioAnalysis";

export interface HpssResult {
  harmonic: Float32Array;
  percussive: Float32Array;
  sampleRate: number;
  /** RMS energy ratio percussive / total — < 0.15 typically means no drums. */
  percussiveEnergyRatio: number;
}

const FFT_SIZE = 2048;
const HOP_SIZE = 512;
const HARMONIC_FILTER_LEN = 17; // frames (≈ 400 ms at hop 512 / 22050)
const PERCUSSIVE_FILTER_LEN = 17; // bins (≈ 180 Hz)

/** Median of a small Float32Array slice using insertion sort (fast for N < 32). */
function median(arr: Float32Array): number {
  const n = arr.length;
  const tmp = new Float32Array(arr);
  // Insertion sort
  for (let i = 1; i < n; i++) {
    const v = tmp[i];
    let j = i - 1;
    while (j >= 0 && tmp[j] > v) { tmp[j + 1] = tmp[j]; j--; }
    tmp[j + 1] = v;
  }
  return n % 2 === 1 ? tmp[(n - 1) >> 1] : 0.5 * (tmp[n >> 1 - 1] + tmp[n >> 1]);
}

/** Forward STFT returning interleaved real/imag arrays per frame. */
function stft(samples: Float32Array): { real: Float64Array[]; imag: Float64Array[]; mag: Float32Array[] } {
  const fft = new FFT(FFT_SIZE);
  const numFrames = Math.max(0, Math.floor((samples.length - FFT_SIZE) / HOP_SIZE) + 1);
  const window = new Float64Array(FFT_SIZE);
  for (let i = 0; i < FFT_SIZE; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1)));
  }

  const real: Float64Array[] = new Array(numFrames);
  const imag: Float64Array[] = new Array(numFrames);
  const mag: Float32Array[] = new Array(numFrames);

  // We re-run a manual radix-2 FFT here to retain both real & imag (the FFT class only returns mags).
  const cos = new Float64Array(FFT_SIZE / 2);
  const sin = new Float64Array(FFT_SIZE / 2);
  for (let i = 0; i < FFT_SIZE / 2; i++) {
    cos[i] = Math.cos((-2 * Math.PI * i) / FFT_SIZE);
    sin[i] = Math.sin((-2 * Math.PI * i) / FFT_SIZE);
  }

  for (let f = 0; f < numFrames; f++) {
    const offset = f * HOP_SIZE;
    const re = new Float64Array(FFT_SIZE);
    const im = new Float64Array(FFT_SIZE);
    for (let i = 0; i < FFT_SIZE; i++) re[i] = samples[offset + i] * window[i];

    // Bit-reverse
    let j = 0;
    for (let i = 0; i < FFT_SIZE - 1; i++) {
      if (i < j) { const tr = re[i]; re[i] = re[j]; re[j] = tr; const ti = im[i]; im[i] = im[j]; im[j] = ti; }
      let m = FFT_SIZE >> 1;
      while (m >= 1 && j >= m) { j -= m; m >>= 1; }
      j += m;
    }
    // Butterflies
    for (let size = 2; size <= FFT_SIZE; size <<= 1) {
      const half = size >> 1;
      const step = FFT_SIZE / size;
      for (let i = 0; i < FFT_SIZE; i += size) {
        for (let k = 0, ti = 0; k < half; k++, ti += step) {
          const ix = i + k;
          const jx = ix + half;
          const tre = re[jx] * cos[ti] - im[jx] * sin[ti];
          const tim = re[jx] * sin[ti] + im[jx] * cos[ti];
          re[jx] = re[ix] - tre;
          im[jx] = im[ix] - tim;
          re[ix] += tre;
          im[ix] += tim;
        }
      }
    }

    const half = FFT_SIZE / 2 + 1;
    const reH = new Float64Array(half);
    const imH = new Float64Array(half);
    const magH = new Float32Array(half);
    for (let i = 0; i < half; i++) {
      reH[i] = re[i];
      imH[i] = im[i];
      magH[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    }
    real[f] = reH;
    imag[f] = imH;
    mag[f] = magH;
  }

  return { real, imag, mag };
}

/** Inverse STFT with overlap-add (Hann window twice for COLA). */
function istft(real: Float64Array[], imag: Float64Array[], outLen: number): Float32Array {
  const numFrames = real.length;
  if (numFrames === 0) return new Float32Array(0);

  const window = new Float64Array(FFT_SIZE);
  for (let i = 0; i < FFT_SIZE; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1)));
  }

  const out = new Float32Array(outLen);
  const wsum = new Float32Array(outLen);

  const cos = new Float64Array(FFT_SIZE / 2);
  const sin = new Float64Array(FFT_SIZE / 2);
  for (let i = 0; i < FFT_SIZE / 2; i++) {
    // inverse twiddle: e^{+j 2π i / N}
    cos[i] = Math.cos((2 * Math.PI * i) / FFT_SIZE);
    sin[i] = Math.sin((2 * Math.PI * i) / FFT_SIZE);
  }

  for (let f = 0; f < numFrames; f++) {
    const reH = real[f];
    const imH = imag[f];
    const re = new Float64Array(FFT_SIZE);
    const im = new Float64Array(FFT_SIZE);
    // Reconstruct full spectrum (conjugate symmetric)
    for (let i = 0; i <= FFT_SIZE / 2; i++) {
      re[i] = reH[i];
      im[i] = imH[i];
    }
    for (let i = 1; i < FFT_SIZE / 2; i++) {
      re[FFT_SIZE - i] = reH[i];
      im[FFT_SIZE - i] = -imH[i];
    }

    // Bit-reverse
    let j = 0;
    for (let i = 0; i < FFT_SIZE - 1; i++) {
      if (i < j) { const tr = re[i]; re[i] = re[j]; re[j] = tr; const ti = im[i]; im[i] = im[j]; im[j] = ti; }
      let m = FFT_SIZE >> 1;
      while (m >= 1 && j >= m) { j -= m; m >>= 1; }
      j += m;
    }
    // Inverse butterflies
    for (let size = 2; size <= FFT_SIZE; size <<= 1) {
      const half = size >> 1;
      const step = FFT_SIZE / size;
      for (let i = 0; i < FFT_SIZE; i += size) {
        for (let k = 0, ti = 0; k < half; k++, ti += step) {
          const ix = i + k;
          const jx = ix + half;
          const tre = re[jx] * cos[ti] - im[jx] * sin[ti];
          const tim = re[jx] * sin[ti] + im[jx] * cos[ti];
          re[jx] = re[ix] - tre;
          im[jx] = im[ix] - tim;
          re[ix] += tre;
          im[ix] += tim;
        }
      }
    }

    const offset = f * HOP_SIZE;
    for (let i = 0; i < FFT_SIZE; i++) {
      const pos = offset + i;
      if (pos >= outLen) break;
      const w = window[i];
      out[pos] += (re[i] / FFT_SIZE) * w;
      wsum[pos] += w * w;
    }
  }

  // Normalize by accumulated window squared
  for (let i = 0; i < outLen; i++) {
    if (wsum[i] > 1e-8) out[i] /= wsum[i];
  }
  return out;
}

/** Median filter along the time axis for each frequency bin. */
function medianFilterHorizontal(mag: Float32Array[], len: number): Float32Array[] {
  const numFrames = mag.length;
  if (numFrames === 0) return [];
  const numBins = mag[0].length;
  const half = (len - 1) >> 1;
  const out: Float32Array[] = new Array(numFrames);
  for (let f = 0; f < numFrames; f++) out[f] = new Float32Array(numBins);
  const buf = new Float32Array(len);

  for (let b = 0; b < numBins; b++) {
    for (let f = 0; f < numFrames; f++) {
      for (let k = 0; k < len; k++) {
        const idx = f + k - half;
        const clamped = idx < 0 ? 0 : (idx >= numFrames ? numFrames - 1 : idx);
        buf[k] = mag[clamped][b];
      }
      out[f][b] = median(buf);
    }
  }
  return out;
}

/** Median filter along the frequency axis within each frame. */
function medianFilterVertical(mag: Float32Array[], len: number): Float32Array[] {
  const numFrames = mag.length;
  if (numFrames === 0) return [];
  const numBins = mag[0].length;
  const half = (len - 1) >> 1;
  const out: Float32Array[] = new Array(numFrames);
  const buf = new Float32Array(len);

  for (let f = 0; f < numFrames; f++) {
    const o = new Float32Array(numBins);
    for (let b = 0; b < numBins; b++) {
      for (let k = 0; k < len; k++) {
        const idx = b + k - half;
        const clamped = idx < 0 ? 0 : (idx >= numBins ? numBins - 1 : idx);
        buf[k] = mag[f][clamped];
      }
      o[b] = median(buf);
    }
    out[f] = o;
  }
  return out;
}

/** Run HPSS on mono samples. Returns harmonic + percussive Float32Arrays of same length. */
export function hpss(samples: Float32Array, sampleRate: number): HpssResult {
  if (samples.length < FFT_SIZE * 2) {
    return {
      harmonic: new Float32Array(samples),
      percussive: new Float32Array(samples.length),
      sampleRate,
      percussiveEnergyRatio: 0,
    };
  }
  const { real, imag, mag } = stft(samples);
  const harmMag = medianFilterHorizontal(mag, HARMONIC_FILTER_LEN);
  const percMag = medianFilterVertical(mag, PERCUSSIVE_FILTER_LEN);

  // Soft masking: mask_h = H^2 / (H^2 + P^2), mask_p = P^2 / (H^2 + P^2)
  const numFrames = mag.length;
  const numBins = mag[0].length;
  const harmRe: Float64Array[] = new Array(numFrames);
  const harmIm: Float64Array[] = new Array(numFrames);
  const percRe: Float64Array[] = new Array(numFrames);
  const percIm: Float64Array[] = new Array(numFrames);

  for (let f = 0; f < numFrames; f++) {
    const re = new Float64Array(numBins);
    const im = new Float64Array(numBins);
    const pre = new Float64Array(numBins);
    const pim = new Float64Array(numBins);
    for (let b = 0; b < numBins; b++) {
      const h = harmMag[f][b];
      const p = percMag[f][b];
      const denom = h * h + p * p + 1e-12;
      const mh = (h * h) / denom;
      const mp = (p * p) / denom;
      re[b] = real[f][b] * mh;
      im[b] = imag[f][b] * mh;
      pre[b] = real[f][b] * mp;
      pim[b] = imag[f][b] * mp;
    }
    harmRe[f] = re;
    harmIm[f] = im;
    percRe[f] = pre;
    percIm[f] = pim;
  }

  const harmonic = istft(harmRe, harmIm, samples.length);
  const percussive = istft(percRe, percIm, samples.length);

  // Quick RMS to expose percussive energy ratio
  let hSum = 0, pSum = 0;
  for (let i = 0; i < samples.length; i++) {
    hSum += harmonic[i] * harmonic[i];
    pSum += percussive[i] * percussive[i];
  }
  const total = hSum + pSum + 1e-12;
  return { harmonic, percussive, sampleRate, percussiveEnergyRatio: pSum / total };
}

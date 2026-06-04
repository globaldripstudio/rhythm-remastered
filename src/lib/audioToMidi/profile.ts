/**
 * Audio profile detector — runs a quick spectral pass on the first ~10s of the file
 * to pick the right Basic Pitch thresholds for the material.
 *
 * Output is one of four profiles, each mapped to a preset of thresholds.
 * The user can override the profile after the fact via the Advanced panel.
 */

export type AudioProfile = "mono-clean" | "piano-clean" | "piano-dirty" | "dense-pad" | "custom";

export interface ProfileThresholds {
  onsetThreshold: number;
  frameThreshold: number;
  minNoteDurationMs: number;
}

export const PROFILE_PRESETS: Record<Exclude<AudioProfile, "custom">, ProfileThresholds> = {
  "mono-clean":  { onsetThreshold: 0.55, frameThreshold: 0.40, minNoteDurationMs: 80 },
  "piano-clean": { onsetThreshold: 0.65, frameThreshold: 0.45, minNoteDurationMs: 100 },
  "piano-dirty": { onsetThreshold: 0.78, frameThreshold: 0.55, minNoteDurationMs: 150 },
  "dense-pad":   { onsetThreshold: 0.60, frameThreshold: 0.50, minNoteDurationMs: 180 },
};

export interface ProfileEstimate {
  profile: Exclude<AudioProfile, "custom">;
  thresholds: ProfileThresholds;
  metrics: {
    polyphony: number;     // 0..1, higher = more simultaneous content
    brightness: number;    // 0..1, ratio of high-freq energy
    transientSpikes: number; // 0..1, density of sharp attacks (proxy for bitcrush/saturation)
    noiseFloor: number;    // 0..1
  };
}

/**
 * Estimate the profile from the first ~10 seconds of mono audio samples.
 * Sample rate doesn't need to be high — 22050 Hz mono is enough.
 */
export function estimateProfile(samples: Float32Array, sampleRate: number): ProfileEstimate {
  const maxLen = Math.min(samples.length, Math.floor(sampleRate * 10));
  const slice = samples.subarray(0, maxLen);

  const fftSize = 1024;
  const hopSize = 512;
  const numFrames = Math.max(1, Math.floor((slice.length - fftSize) / hopSize) + 1);

  // Hann window
  const win = new Float32Array(fftSize);
  for (let i = 0; i < fftSize; i++) win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));

  // Naive DFT-magnitude via FFT — reuse the FFT from audioAnalysis would create a circular dep.
  // We use a small in-place radix-2 here to keep this module self-contained and lightweight.
  const cos = new Float32Array(fftSize / 2);
  const sin = new Float32Array(fftSize / 2);
  for (let i = 0; i < fftSize / 2; i++) {
    cos[i] = Math.cos((-2 * Math.PI * i) / fftSize);
    sin[i] = Math.sin((-2 * Math.PI * i) / fftSize);
  }

  const real = new Float32Array(fftSize);
  const imag = new Float32Array(fftSize);

  const splitBin = Math.floor((2000 * fftSize) / sampleRate); // < 2 kHz vs > 2 kHz

  let prevFlux = 0;
  const fluxFrames: number[] = [];
  const polyFrames: number[] = [];
  let lowEnergyAcc = 0;
  let highEnergyAcc = 0;
  let totalEnergyAcc = 0;

  let prevMags = new Float32Array(fftSize / 2);

  for (let f = 0; f < numFrames; f++) {
    const offset = f * hopSize;
    for (let i = 0; i < fftSize; i++) {
      real[i] = slice[offset + i] * win[i];
      imag[i] = 0;
    }
    // bit-reverse
    let j = 0;
    for (let i = 0; i < fftSize - 1; i++) {
      if (i < j) { const tr = real[i]; real[i] = real[j]; real[j] = tr; const ti = imag[i]; imag[i] = imag[j]; imag[j] = ti; }
      let m = fftSize >> 1;
      while (m >= 1 && j >= m) { j -= m; m >>= 1; }
      j += m;
    }
    // butterflies
    for (let size = 2; size <= fftSize; size <<= 1) {
      const half = size >> 1;
      const step = fftSize / size;
      for (let i = 0; i < fftSize; i += size) {
        for (let k = 0, ti = 0; k < half; k++, ti += step) {
          const ix = i + k;
          const jx = ix + half;
          const tre = real[jx] * cos[ti] - imag[jx] * sin[ti];
          const tim = real[jx] * sin[ti] + imag[jx] * cos[ti];
          real[jx] = real[ix] - tre;
          imag[jx] = imag[ix] - tim;
          real[ix] += tre;
          imag[ix] += tim;
        }
      }
    }

    let lowE = 0, highE = 0, flux = 0;
    let peakCount = 0;
    let prevMag = 0, prevPrev = 0;
    const mags = new Float32Array(fftSize / 2);
    for (let i = 1; i < fftSize / 2; i++) {
      const m = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
      mags[i] = m;
      if (i < splitBin) lowE += m; else highE += m;
      const d = m - prevMags[i];
      if (d > 0) flux += d;
      // crude peak count for polyphony proxy
      if (i >= 2 && prevMag > prevPrev && prevMag > m && prevMag > 0.5) peakCount++;
      prevPrev = prevMag;
      prevMag = m;
    }
    prevMags = mags;
    fluxFrames.push(flux);
    polyFrames.push(peakCount);
    lowEnergyAcc += lowE;
    highEnergyAcc += highE;
    totalEnergyAcc += lowE + highE;
    prevFlux = flux;
  }

  // Aggregate
  fluxFrames.sort((a, b) => a - b);
  polyFrames.sort((a, b) => a - b);
  const median = (arr: number[]) => arr.length ? arr[Math.floor(arr.length / 2)] : 0;
  const p90 = (arr: number[]) => arr.length ? arr[Math.floor(arr.length * 0.9)] : 0;

  const fluxMedian = median(fluxFrames);
  const fluxP90 = p90(fluxFrames);
  const polyMedian = median(polyFrames);

  // Normalize heuristics into 0..1
  const polyphony = Math.min(1, polyMedian / 8);                            // 8+ simultaneous peaks → dense
  const brightness = totalEnergyAcc > 0 ? Math.min(1, highEnergyAcc / totalEnergyAcc * 1.6) : 0;
  const transientSpikes = fluxMedian > 0 ? Math.min(1, (fluxP90 / fluxMedian - 1) / 4) : 0;
  // estimate noise floor as ratio of the 10% quietest frames' energy to median
  const q10 = fluxFrames.length ? fluxFrames[Math.floor(fluxFrames.length * 0.1)] : 0;
  const noiseFloor = fluxMedian > 0 ? Math.min(1, q10 / fluxMedian) : 0;

  // Decision tree
  let profile: Exclude<AudioProfile, "custom">;
  if (transientSpikes > 0.55 && brightness > 0.45) {
    profile = "piano-dirty";
  } else if (polyphony > 0.65) {
    profile = "dense-pad";
  } else if (polyphony < 0.25 && transientSpikes < 0.35) {
    profile = "mono-clean";
  } else {
    profile = "piano-clean";
  }

  return {
    profile,
    thresholds: PROFILE_PRESETS[profile],
    metrics: { polyphony, brightness, transientSpikes, noiseFloor },
  };
}

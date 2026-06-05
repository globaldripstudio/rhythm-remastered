/**
 * Musical-context analysis tying together HPSS, BPM, key, and chord detection.
 *
 * Run order:
 *   1. Decode → mono samples at original SR.
 *   2. Downsample to 22050 Hz mono (Basic Pitch native rate, also fine for HPSS).
 *   3. HPSS split.
 *   4. BPM from percussive (fallback: harmonic onsets).
 *   5. Key from chroma of harmonic.
 *   6. Chord track from harmonic + BPM grid.
 *
 * Note re-voting (with Basic Pitch's detected notes) is done in a separate
 * helper exposed below — the caller invokes it after Basic Pitch returns.
 */

import { hpss } from "@/lib/audioToMidi/hpss";
import { detectChords, detectKeyFromChords, type ChordSegment } from "@/lib/audioToMidi/chordDetection";
import type { NoteEvent } from "@/lib/musicTheory/midiExport";

// Reuse the FFT-tempogram BPM detector + key detector from audioAnalysis to avoid duplicating ~200 lines.
// We expose them implicitly by calling internal copies tuned to harmonic / percussive sources.
import { FFT } from "@/lib/audioAnalysis";

export interface KeyEstimate {
  tonic: string;
  mode: "major" | "minor";
  confidence: number;
}

export interface BpmEstimate {
  bpm: number;
  confidence: number;
}

export interface MusicalContext {
  key: KeyEstimate;
  bpm: BpmEstimate;
  chords: ChordSegment[];
  /** Mono samples at 22050 Hz, ready for Basic Pitch. */
  harmonicSamples: Float32Array;
  /** Full mono samples at 22050 Hz (pre-HPSS). */
  monoSamples: Float32Array;
  sampleRate: number;
  durationSec: number;
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

// ---------------- Decoding & downsampling ----------------

async function decodeMono22050(file: File): Promise<{ samples: Float32Array; sampleRate: number; durationSec: number }> {
  const Ctor: typeof OfflineAudioContext =
    (window as unknown as { OfflineAudioContext: typeof OfflineAudioContext }).OfflineAudioContext
    || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  const arr = await file.arrayBuffer();
  const tmpCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const decoded = await tmpCtx.decodeAudioData(arr.slice(0));
  await tmpCtx.close();
  const targetRate = 22050;
  const offline = new Ctor(1, Math.ceil(decoded.duration * targetRate), targetRate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start(0);
  const rendered = await offline.startRendering();
  return {
    samples: rendered.getChannelData(0).slice(),
    sampleRate: targetRate,
    durationSec: rendered.duration,
  };
}

// ---------------- BPM (Fourier tempogram, adapted) ----------------

function onsetEnvelope(samples: Float32Array, sampleRate: number): { envelope: Float32Array; hopRate: number } {
  const fftSize = 1024;
  const hopSize = 512;
  const fft = new FFT(fftSize);
  const win = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i++) win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  const numFrames = Math.max(1, Math.floor((samples.length - fftSize) / hopSize) + 1);
  const env = new Float32Array(numFrames);
  let prev: Float64Array = new Float64Array(new ArrayBuffer((fftSize / 2) * 8));
  const buf = new Float64Array(fftSize);
  for (let f = 0; f < numFrames; f++) {
    const off = f * hopSize;
    for (let i = 0; i < fftSize; i++) buf[i] = samples[off + i] * win[i];
    const mags = fft.forwardMagnitudes(buf);
    let flux = 0;
    for (let i = 0; i < mags.length; i++) {
      const d = mags[i] - prev[i];
      if (d > 0) flux += d;
    }
    env[f] = flux;
    prev = mags as unknown as Float64Array;
  }
  // Local-mean subtraction
  const smooth = new Float32Array(numFrames);
  const R = 5;
  for (let i = 0; i < numFrames; i++) {
    let s = 0, c = 0;
    for (let j = Math.max(0, i - R); j <= Math.min(numFrames - 1, i + R); j++) { s += env[j]; c++; }
    smooth[i] = Math.max(0, env[i] - s / c);
  }
  let mx = 0;
  for (let i = 0; i < numFrames; i++) if (smooth[i] > mx) mx = smooth[i];
  if (mx > 0) for (let i = 0; i < numFrames; i++) smooth[i] /= mx;
  return { envelope: smooth, hopRate: sampleRate / hopSize };
}

function detectBpmFromEnvelope(envelope: Float32Array, hopRate: number): BpmEstimate {
  if (envelope.length < 32) return { bpm: 0, confidence: 0 };
  let N = 1;
  while (N < envelope.length) N *= 2;
  if (N < 16384) N = 16384;
  const fft = new FFT(N);
  const buf = new Float64Array(N);
  let mean = 0;
  for (let i = 0; i < envelope.length; i++) mean += envelope[i];
  mean /= envelope.length;
  for (let i = 0; i < envelope.length; i++) {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (envelope.length - 1)));
    buf[i] = (envelope[i] - mean) * w;
  }
  const spec = fft.forwardMagnitudes(buf);
  const specAt = (bpm: number): number => {
    const idx = (bpm / 60) * N / hopRate;
    if (idx < 0 || idx >= spec.length - 1) return 0;
    const lo = Math.floor(idx);
    const frac = idx - lo;
    return spec[lo] * (1 - frac) + spec[lo + 1] * frac;
  };
  const score = (bpm: number) =>
    specAt(bpm) + 0.6 * specAt(bpm * 2) + 0.4 * specAt(bpm * 3) + 0.3 * specAt(bpm * 4) + 0.5 * specAt(bpm / 2);

  const coarse: Array<{ bpm: number; s: number }> = [];
  for (let bpm = 50; bpm <= 220; bpm += 0.1) coarse.push({ bpm, s: score(bpm) });
  const peaks: Array<{ bpm: number; s: number }> = [];
  for (let i = 1; i < coarse.length - 1; i++) {
    if (coarse[i].s > coarse[i - 1].s && coarse[i].s > coarse[i + 1].s) peaks.push(coarse[i]);
  }
  peaks.sort((a, b) => b.s - a.s);
  if (peaks.length === 0) return { bpm: 0, confidence: 0 };

  const folded = peaks.slice(0, 8).map((p) => {
    let bpm = p.bpm;
    while (bpm > 180) bpm /= 2;
    while (bpm < 70) bpm *= 2;
    return { bpm, s: score(bpm) };
  });
  folded.sort((a, b) => b.s - a.s);
  const clusters: Array<{ bpm: number; s: number }> = [];
  for (const c of folded) {
    const hit = clusters.find((cl) => Math.abs(cl.bpm - c.bpm) < 1.0);
    if (hit) {
      const total = hit.s + c.s;
      hit.bpm = (hit.bpm * hit.s + c.bpm * c.s) / total;
      hit.s = total;
    } else clusters.push({ bpm: c.bpm, s: c.s });
  }
  clusters.sort((a, b) => b.s - a.s);
  const best = clusters[0];

  // Refine ±1 BPM at 0.02 resolution
  let rb = best.bpm, rs = score(rb);
  for (let bpm = Math.max(50, best.bpm - 1); bpm <= Math.min(220, best.bpm + 1); bpm += 0.02) {
    const s = score(bpm);
    if (s > rs) { rs = s; rb = bpm; }
  }
  // Integer snap
  const ni = Math.round(rb);
  if (Math.abs(rb - ni) <= 0.5 && score(ni) >= rs * 0.99) { rb = ni; rs = score(ni); }

  const total = clusters.slice(0, 5).reduce((a, c) => a + c.s, 0);
  const conf = total > 0 ? Math.min(1, (best.s / total) * 1.5) : 0;
  return { bpm: Math.round(rb * 10) / 10, confidence: conf };
}

function bpmFromOnsets(onsetTimes: number[]): BpmEstimate {
  if (onsetTimes.length < 8) return { bpm: 0, confidence: 0 };
  const maxT = onsetTimes[onsetTimes.length - 1];
  const hopRate = 50; // 20 ms bins
  const L = Math.ceil(maxT * hopRate) + 1;
  const env = new Float32Array(L);
  for (const t of onsetTimes) {
    const i = Math.floor(t * hopRate);
    if (i >= 0 && i < L) env[i] += 1;
  }
  return detectBpmFromEnvelope(env, hopRate);
}

// ---------------- Key detection ----------------

function chromaFromSamples(samples: Float32Array, sampleRate: number): Float32Array {
  const fftSize = 4096;
  const hopSize = 2048;
  const fft = new FFT(fftSize);
  const win = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i++) win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  const minHz = 65, maxHz = 2000;
  const minBin = Math.max(1, Math.floor((minHz * fftSize) / sampleRate));
  const maxBin = Math.min(fftSize / 2 - 1, Math.ceil((maxHz * fftSize) / sampleRate));
  const binPc = new Int8Array(maxBin - minBin + 1);
  for (let bin = minBin; bin <= maxBin; bin++) {
    const freq = (bin * sampleRate) / fftSize;
    const midi = 69 + 12 * Math.log2(freq / 440);
    binPc[bin - minBin] = ((Math.round(midi) % 12) + 12) % 12;
  }
  const totalFrames = Math.max(1, Math.floor((samples.length - fftSize) / hopSize) + 1);
  const sFrame = Math.floor(totalFrames * 0.10);
  const eFrame = Math.ceil(totalFrames * 0.90);
  const chroma = new Float32Array(12);
  const buf = new Float64Array(fftSize);
  for (let f = sFrame; f < eFrame; f++) {
    const off = f * hopSize;
    if (off + fftSize > samples.length) break;
    for (let i = 0; i < fftSize; i++) buf[i] = samples[off + i] * win[i];
    const mags = fft.forwardMagnitudes(buf);
    let frameEnergy = 0;
    for (let bin = minBin; bin <= maxBin; bin++) frameEnergy += mags[bin];
    if (frameEnergy < 1e-3) continue; // skip silence
    for (let bin = minBin; bin <= maxBin; bin++) chroma[binPc[bin - minBin]] += mags[bin];
  }
  let total = 0;
  for (let i = 0; i < 12; i++) total += chroma[i];
  if (total > 0) for (let i = 0; i < 12; i++) chroma[i] /= total;
  return chroma;
}

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const xa = a[i] - ma, xb = b[i] - mb;
    num += xa * xb; da += xa * xa; db += xb * xb;
  }
  const d = Math.sqrt(da * db);
  return d > 0 ? num / d : 0;
}

function keyFromChroma(chroma: Float32Array): { scores: Array<{ tonic: string; mode: "major" | "minor"; score: number }>; best: KeyEstimate } {
  const arr = Array.from(chroma);
  const scores: Array<{ tonic: string; mode: "major" | "minor"; score: number }> = [];
  for (let shift = 0; shift < 12; shift++) {
    const rotated: number[] = [];
    for (let i = 0; i < 12; i++) rotated.push(arr[(i + shift) % 12]);
    scores.push({ tonic: NOTE_NAMES[shift], mode: "major", score: pearson(rotated, MAJOR_PROFILE) });
    scores.push({ tonic: NOTE_NAMES[shift], mode: "minor", score: pearson(rotated, MINOR_PROFILE) });
  }
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0], second = scores[1];
  const gap = best.score - second.score;
  const confidence = Math.max(0, Math.min(1, gap * 4 + best.score * 0.3));
  return { scores, best: { tonic: best.tonic, mode: best.mode, confidence } };
}

/**
 * Re-vote the key after Basic Pitch returns by weighting pitch classes
 * by duration × velocity, then re-running Krumhansl-Schmuckler.
 * If the note-based result disagrees with the chroma-based one, lower confidence.
 */
export function reconcileKeyWithNotes(audioKey: KeyEstimate, notes: NoteEvent[]): KeyEstimate {
  if (notes.length < 5) return audioKey;
  const pcChroma = new Float32Array(12);
  for (const n of notes) {
    const pc = ((n.midi % 12) + 12) % 12;
    pcChroma[pc] += Math.max(0.1, n.velocity) * Math.max(0.05, n.durationSec);
  }
  let total = 0;
  for (let i = 0; i < 12; i++) total += pcChroma[i];
  if (total > 0) for (let i = 0; i < 12; i++) pcChroma[i] /= total;
  const { best: noteKey } = keyFromChroma(pcChroma);

  if (noteKey.tonic === audioKey.tonic && noteKey.mode === audioKey.mode) {
    // Agreement boost
    return { ...audioKey, confidence: Math.min(1, audioKey.confidence * 1.2 + 0.1) };
  }
  // Disagreement: prefer the higher-confidence side, but cap.
  if (noteKey.confidence > audioKey.confidence + 0.15) {
    return { tonic: noteKey.tonic, mode: noteKey.mode, confidence: Math.min(0.7, noteKey.confidence) };
  }
  // Otherwise keep audio key but lower confidence.
  return { ...audioKey, confidence: Math.max(0, audioKey.confidence - 0.2) };
}

// ---------------- Public entry point ----------------

export interface AnalyzeContextProgress {
  stage: "decoding" | "hpss" | "bpm" | "key" | "chords" | "done";
  percent: number;
}

export async function analyzeMusicalContext(
  file: File,
  onProgress?: (p: AnalyzeContextProgress) => void,
): Promise<MusicalContext> {
  onProgress?.({ stage: "decoding", percent: 0 });
  const { samples: mono, sampleRate, durationSec } = await decodeMono22050(file);

  onProgress?.({ stage: "hpss", percent: 15 });
  const hp = hpss(mono, sampleRate);

  onProgress?.({ stage: "bpm", percent: 55 });
  let bpm: BpmEstimate;
  if (hp.percussiveEnergyRatio > 0.10) {
    const { envelope, hopRate } = onsetEnvelope(hp.percussive, sampleRate);
    bpm = detectBpmFromEnvelope(envelope, hopRate);
  } else {
    // No drums — use harmonic onsets (often gives chord-strum tempo).
    const { envelope, hopRate } = onsetEnvelope(hp.harmonic, sampleRate);
    bpm = detectBpmFromEnvelope(envelope, hopRate);
    bpm.confidence *= 0.7; // less trusted
  }

  onProgress?.({ stage: "key", percent: 75 });
  const chroma = chromaFromSamples(hp.harmonic, sampleRate);
  const { best: keyEst } = keyFromChroma(chroma);

  onProgress?.({ stage: "chords", percent: 85 });
  // Pass 1: chord detection with no key prior (uniform diatonic).
  const pass1 = detectChords(hp.harmonic, sampleRate, {
    bpm: bpm.bpm > 0 ? bpm.bpm : undefined,
    beatsPerSegment: 1,
    durationSec,
  });

  // Re-vote key from chord track (often more reliable than raw chroma).
  const chordKey = detectKeyFromChords(pass1.chords);
  let bestKey: KeyEstimate = keyEst;
  if (chordKey) {
    if (chordKey.tonic === keyEst.tonic && chordKey.mode === keyEst.mode) {
      bestKey = { ...keyEst, confidence: Math.min(1, keyEst.confidence * 1.2 + 0.15) };
    } else if (chordKey.confidence > keyEst.confidence) {
      bestKey = chordKey;
    } else {
      bestKey = { ...keyEst, confidence: Math.max(0, keyEst.confidence - 0.15) };
    }
  }

  // Pass 2: re-run chord detection with the key prior using cached frames.
  const pass2 = detectChords(hp.harmonic, sampleRate, {
    bpm: bpm.bpm > 0 ? bpm.bpm : undefined,
    beatsPerSegment: 1,
    durationSec,
    keyTonic: bestKey.tonic,
    keyMode: bestKey.mode,
    precomputedFrames: pass1.frames,
  });

  onProgress?.({ stage: "done", percent: 100 });

  return {
    key: bestKey,
    bpm,
    chords: pass2.chords,
    harmonicSamples: hp.harmonic,
    monoSamples: mono,
    sampleRate,
    durationSec,
  };
}

/** Re-score chords with a key prior (chords in-key get a small boost). */
export function applyKeyPriorToChords(chords: ChordSegment[]): ChordSegment[] {
  // Currently a no-op placeholder — chord templates already capture the harmony.
  // Could be used later to bias maj7/min7 within the diatonic scale.
  return chords;
}

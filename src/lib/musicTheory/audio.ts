// Shared Web Audio engine for piano + guitar
import { midiToFreq } from "./scales";

export type Timbre = "piano" | "guitar";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function ensureContext(): AudioContext {
  if (!ctx) {
    const Ctor: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

export function setMasterVolume(v: number) {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
}

export function getAudioContext(): AudioContext {
  return ensureContext();
}

interface PlayOpts {
  durationMs?: number;
  velocity?: number; // 0..1
  startAt?: number; // absolute audioCtx time
}

export interface NoteHandle {
  stop: (when?: number) => void;
}

/** Play one MIDI note with the given timbre. Returns end time. */
export function playNote(midi: number, timbre: Timbre = "piano", opts: PlayOpts = {}): number {
  playNoteHandle(midi, timbre, opts);
  return (opts.startAt ?? getAudioContext().currentTime) + (opts.durationMs ?? 600) / 1000;
}

/** Play one MIDI note and return a handle to stop it early. */
export function playNoteHandle(midi: number, timbre: Timbre = "piano", opts: PlayOpts = {}): NoteHandle {
  const c = ensureContext();
  const out = masterGain!;
  const freq = midiToFreq(midi);
  const start = opts.startAt ?? c.currentTime;
  const duration = (opts.durationMs ?? 600) / 1000;
  const velocity = opts.velocity ?? 0.85;

  const gain = c.createGain();
  // Start fully silent — use linear ramp from 0 to avoid clicks ("pocs")
  gain.gain.setValueAtTime(0, start);
  const oscs: OscillatorNode[] = [];

  // Release tail to prevent abrupt cutoff clicks
  const releaseSec = 0.08;
  const stopAt = start + duration + releaseSec + 0.02;

  if (timbre === "piano") {
    // Triangle + sine harmonic + soft envelope
    const o1 = c.createOscillator();
    o1.type = "triangle";
    o1.frequency.setValueAtTime(freq, start);
    // Tiny phase offset to avoid coherent stacking when multiple notes start together
    o1.detune.setValueAtTime((Math.random() - 0.5) * 4, start);
    const o2 = c.createOscillator();
    o2.type = "sine";
    o2.frequency.setValueAtTime(freq * 2, start);
    o2.detune.setValueAtTime((Math.random() - 0.5) * 4, start);
    const h2g = c.createGain();
    h2g.gain.value = 0.18;
    o1.connect(gain);
    o2.connect(h2g).connect(gain);

    const peak = 0.55 * velocity;
    const attack = 0.012;
    const sustainTime = Math.max(start + attack + 0.02, start + duration - releaseSec);
    // Linear attack from 0 → no click
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.5), start + Math.min(0.18, duration * 0.6));
    gain.gain.setTargetAtTime(0.0001, sustainTime, releaseSec / 3);
    gain.gain.linearRampToValueAtTime(0, stopAt);

    o1.start(start);
    o2.start(start);
    o1.stop(stopAt);
    o2.stop(stopAt);
    oscs.push(o1, o2);
  } else {
    // Guitar: sawtooth + lowpass + pluck noise
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(freq, start);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(Math.min(8000, freq * 6), start);
    lp.frequency.exponentialRampToValueAtTime(Math.max(800, freq * 2), start + duration);
    lp.Q.value = 2;
    o.connect(lp).connect(gain);

    // pluck noise burst
    const noiseBuf = c.createBuffer(1, c.sampleRate * 0.02, c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = c.createBufferSource();
    noise.buffer = noiseBuf;
    const ng = c.createGain();
    ng.gain.value = 0.25 * velocity;
    noise.connect(ng).connect(gain);
    noise.start(start);

    const peak = 0.5 * velocity;
    const attack = 0.014;
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.001), start + duration);
    gain.gain.linearRampToValueAtTime(0, stopAt);

    o.start(start);
    o.stop(stopAt);
    oscs.push(o);
  }

  gain.connect(out);
  return {
    stop: (when?: number) => {
      const w = when ?? c.currentTime;
      const rel = 0.06;
      try {
        const cur = Math.max(0.0001, gain.gain.value);
        gain.gain.cancelScheduledValues(w);
        gain.gain.setValueAtTime(cur, w);
        gain.gain.linearRampToValueAtTime(0, w + rel);
      } catch { /* noop */ }
      oscs.forEach((o) => {
        try { o.stop(w + rel + 0.02); } catch { /* noop */ }
      });
    },
  };
}

export function playChord(
  midiNotes: number[],
  timbre: Timbre = "piano",
  opts: PlayOpts = {},
): number {
  let end = 0;
  midiNotes.forEach((m, i) => {
    // Tiny strum/spread to avoid phase pile-up
    const stagger = (opts.startAt ?? getAudioContext().currentTime) + (timbre === "guitar" ? i * 0.018 : i * 0.004);
    const t = playNote(m, timbre, { ...opts, startAt: stagger });
    if (t > end) end = t;
  });
  return end;
}

import {
  BasicPitch,
  noteFramesToTime,
  outputToNotesPoly,
  addPitchBendsToNoteEvents,
} from "@spotify/basic-pitch";
import type { NoteEvent } from "@/lib/musicTheory/midiExport";

export interface AudioToMidiOptions {
  onsetThreshold?: number;
  frameThreshold?: number;
  minNoteDurationMs?: number;
  inferOnsets?: boolean;
  includePitchBends?: boolean;
  /** If true, skip the default same-pitch merging — useful when running our own post-process pipeline. */
  skipDefaultMerge?: boolean;
  /** Favour a single melodic line (only for monophonic sources). Default false. */
  melodiaTrick?: boolean;
  /** Extend note ends while the model still hears the pitch (hysteresis). Default true. */
  extendSustain?: boolean;
}

/** Basic Pitch frame duration (hop 256 @ 22050 Hz). */
export const BP_FRAME_SEC = 256 / 22050;
const BP_MIDI_OFFSET = 21;

/**
 * Hysteresis sustain: a note keeps sounding while its frame activation stays
 * above `releaseThr` (lower than the detection threshold), tolerating short
 * dips (reverb tails, vibrato). Stops early when the same pitch re-attacks.
 */
export function extendNoteSustain(
  notes: NoteEvent[],
  frames: number[][],
  frameThreshold: number,
  opts: { maxGapFrames?: number; releaseRatio?: number } = {},
): NoteEvent[] {
  if (!frames.length) return notes;
  const releaseThr = frameThreshold * (opts.releaseRatio ?? 0.6);
  const maxGap = opts.maxGapFrames ?? 4;
  const nF = frames.length;
  const byPitchStarts = new Map<number, number[]>();
  for (const n of notes) {
    const a = byPitchStarts.get(n.midi) ?? [];
    a.push(n.startSec);
    byPitchStarts.set(n.midi, a);
  }
  byPitchStarts.forEach((a) => a.sort((x, y) => x - y));
  return notes.map((n) => {
    const bin = n.midi - BP_MIDI_OFFSET;
    if (bin < 0 || bin >= (frames[0]?.length ?? 0)) return n;
    const starts = byPitchStarts.get(n.midi) ?? [];
    const nextStart = starts.find((s) => s > n.startSec + 1e-3) ?? Infinity;
    const limitF = Math.min(nF - 1, Math.floor(nextStart / BP_FRAME_SEC) - 1);
    let f = Math.round((n.startSec + n.durationSec) / BP_FRAME_SEC);
    let lastActive = f - 1;
    let gap = 0;
    while (f <= limitF) {
      if ((frames[f]?.[bin] ?? 0) >= releaseThr) { lastActive = f; gap = 0; }
      else if (++gap > maxGap) break;
      f++;
    }
    const newEnd = (lastActive + 1) * BP_FRAME_SEC;
    if (newEnd <= n.startSec + n.durationSec) return n;
    return { ...n, durationSec: newEnd - n.startSec };
  });
}

export interface AudioToMidiProgress {
  stage: "decoding" | "loading-model" | "running" | "post" | "done";
  percent: number;
}

const MODEL_URL = `${window.location.origin}/models/basic-pitch/model.json`;

let basicPitchInstance: BasicPitch | null = null;

function getBasicPitch(): BasicPitch {
  if (!basicPitchInstance) {
    basicPitchInstance = new BasicPitch(MODEL_URL);
  }
  return basicPitchInstance;
}

/** Decode an audio file into a mono 22050 Hz Float32Array buffer (Basic Pitch native rate). */
export async function decodeForBasicPitch(file: File): Promise<{ samples: Float32Array; sampleRate: number; durationSec: number }> {
  const arr = await file.arrayBuffer();
  const Ctor: typeof OfflineAudioContext =
    (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  // First decode at native rate, then resample to 22050 mono
  const tmpCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const decoded = await tmpCtx.decodeAudioData(arr.slice(0));
  tmpCtx.close();

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

export async function audioToMidiNotes(
  file: File,
  options: AudioToMidiOptions = {},
  onProgress?: (p: AudioToMidiProgress) => void,
  preDecodedSamples?: Float32Array,
): Promise<{ notes: NoteEvent[]; durationSec: number; samples: Float32Array; frames: number[][] }> {
  const opts = {
    onsetThreshold: 0.7,
    frameThreshold: 0.45,
    minNoteDurationMs: 120,
    inferOnsets: true,
    includePitchBends: false,
    melodiaTrick: false,
    extendSustain: true,
    ...options,
  };

  onProgress?.({ stage: "decoding", percent: 0 });
  const decoded = preDecodedSamples
    ? { samples: preDecodedSamples, durationSec: preDecodedSamples.length / 22050 }
    : await decodeForBasicPitch(file);
  const { samples, durationSec } = decoded;

  onProgress?.({ stage: "loading-model", percent: 0 });
  const bp = getBasicPitch();
  // Trigger model load to surface any download progress
  await bp.model;

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  onProgress?.({ stage: "running", percent: 0 });
  await bp.evaluateModel(
    samples,
    (f, o, c) => {
      frames.push(...f);
      onsets.push(...o);
      contours.push(...c);
    },
    (pct) => onProgress?.({ stage: "running", percent: pct }),
  );

  onProgress?.({ stage: "post", percent: 80 });
  let polyNotes = outputToNotesPoly(
    frames,
    onsets,
    opts.onsetThreshold,
    opts.frameThreshold,
    Math.max(1, Math.round(opts.minNoteDurationMs / (256 / 22050) / 1000)),
    opts.inferOnsets,
    null,
    null,
    opts.melodiaTrick,
  );

  if (opts.includePitchBends) {
    polyNotes = addPitchBendsToNoteEvents(contours, polyNotes);
  }

  const notesTime = noteFramesToTime(polyNotes);

  const rawNotes: NoteEvent[] = notesTime.map((n) => ({
    midi: n.pitchMidi,
    startSec: n.startTimeSeconds,
    durationSec: n.durationSeconds,
    velocity: Math.max(0.1, Math.min(1, n.amplitude)),
  }));

  let processed: NoteEvent[] = opts.extendSustain
    ? extendNoteSustain(rawNotes, frames, opts.frameThreshold)
    : rawNotes;

  if (!opts.skipDefaultMerge) {
    // Dedupe: merge same-pitch notes that overlap or are <120ms apart
    const byPitch = new Map<number, NoteEvent[]>();
    processed.forEach((n) => {
      const arr = byPitch.get(n.midi) ?? [];
      arr.push(n);
      byPitch.set(n.midi, arr);
    });
    const merged: NoteEvent[] = [];
    byPitch.forEach((arr) => {
      arr.sort((a, b) => a.startSec - b.startSec);
      let cur: NoteEvent | null = null;
      for (const n of arr) {
        if (!cur) {
          cur = { ...n };
          continue;
        }
        const curEnd = cur.startSec + cur.durationSec;
        const gap = n.startSec - curEnd;
        if (gap < 0.12) {
          const newEnd = Math.max(curEnd, n.startSec + n.durationSec);
          cur.durationSec = newEnd - cur.startSec;
          cur.velocity = Math.max(cur.velocity, n.velocity);
        } else {
          merged.push(cur);
          cur = { ...n };
        }
      }
      if (cur) merged.push(cur);
    });
    processed = merged;
  }

  // Drop notes shorter than minNoteDurationMs
  const minSec = opts.minNoteDurationMs / 1000;
  const notes = processed
    .filter((n) => n.durationSec >= minSec)
    .sort((a, b) => a.startSec - b.startSec);


  onProgress?.({ stage: "done", percent: 100 });
  return { notes, durationSec, samples, frames };
}


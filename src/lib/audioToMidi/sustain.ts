import type { NoteEvent } from "@/lib/musicTheory/midiExport";

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


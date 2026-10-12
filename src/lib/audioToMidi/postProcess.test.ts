import { describe, it, expect } from "vitest";
import { passCompleteChords, passQuantizeDurations, runPostProcessPipeline } from "./postProcess";
import { extendNoteSustain, BP_FRAME_SEC } from "./sustain";
import type { ChordSegment } from "./chordDetection";

const frames = (n: number, active: Record<number, number>) =>
  Array.from({ length: n }, () => { const r = new Array(88).fill(0); for (const [b, v] of Object.entries(active)) r[+b] = v; return r; });

describe("audio→midi post-process", () => {
  it("extends a note while its pitch still sounds", () => {
    const f = frames(200, { [60 - 21]: 0.25 }); // above release (0.3*0.6=0.18)
    const [n] = extendNoteSustain([{ midi: 60, startSec: 0, durationSec: 0.2, velocity: 0.8 }], f, 0.3);
    expect(n.durationSec).toBeCloseTo(200 * BP_FRAME_SEC, 2);
  });
  it("stops sustain at the next attack of the same pitch", () => {
    const f = frames(200, { [60 - 21]: 0.25 });
    const out = extendNoteSustain([
      { midi: 60, startSec: 0, durationSec: 0.2, velocity: 0.8 },
      { midi: 60, startSec: 1, durationSec: 0.2, velocity: 0.8 },
    ], f, 0.3);
    expect(out[0].startSec + out[0].durationSec).toBeLessThan(1);
  });
  it("adds a missing chord tone that clearly sounds", () => {
    const chord: ChordSegment = { startSec: 0, endSec: 1, root: "C", quality: "maj" as any, confidence: 0.9, pitchClasses: new Set([0, 4, 7]) };
    const notes = [
      { midi: 60, startSec: 0, durationSec: 0.8, velocity: 0.8 },
      { midi: 67, startSec: 0, durationSec: 0.8, velocity: 0.8 },
    ];
    const r = passCompleteChords(notes, [chord], frames(100, { [64 - 21]: 0.5 }));
    expect(r.added).toBe(1);
    expect(r.notes.some((n) => n.midi === 64)).toBe(true);
  });
  it("does not add a chord tone without evidence", () => {
    const chord: ChordSegment = { startSec: 0, endSec: 1, root: "C", quality: "maj" as any, confidence: 0.9, pitchClasses: new Set([0, 4, 7]) };
    const r = passCompleteChords([
      { midi: 60, startSec: 0, durationSec: 0.8, velocity: 0.8 },
      { midi: 67, startSec: 0, durationSec: 0.8, velocity: 0.8 },
    ], [chord], frames(100, {}));
    expect(r.added).toBe(0);
  });
  it("snaps note ends to the 16th grid at 120 BPM", () => {
    const { notes } = passQuantizeDurations([{ midi: 60, startSec: 0, durationSec: 0.3, velocity: 1 }], 120);
    expect(notes[0].durationSec).toBeCloseTo(0.25, 5);
  });
  it("keeps distinct repeated arpeggio attacks", () => {
    const input = [
      { midi: 64, startSec: 0, durationSec: 0.08, velocity: 0.7 },
      { midi: 64, startSec: 0.12, durationSec: 0.08, velocity: 0.72 },
    ];
    const { notes, trace } = runPostProcessPipeline(input, { octaveGhost: false, hardenedMerge: true, snapToGrid: false, tonalFilter: false });
    expect(notes).toHaveLength(2);
    expect(trace.hardenedMerge.removed).toBe(0);
  });
  it("still collapses an almost identical duplicate detection", () => {
    const input = [
      { midi: 64, startSec: 0, durationSec: 0.08, velocity: 0.7 },
      { midi: 64, startSec: 0.09, durationSec: 0.05, velocity: 0.71 },
    ];
    const { notes } = runPostProcessPipeline(input, { octaveGhost: false, hardenedMerge: true, snapToGrid: false, tonalFilter: false });
    expect(notes).toHaveLength(1);
  });
});

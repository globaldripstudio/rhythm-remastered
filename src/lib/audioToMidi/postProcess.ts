/**
 * Musical post-processing for Audio → MIDI notes.
 *
 * Passes are pure and each can be toggled off. They never change pitch.
 * Each guarded by a "max removal ratio" safeguard.
 *
 * The chord-aware pass takes a chord track (per-segment pitch-class set)
 * and trims low-confidence out-of-chord noise notes.
 */

import type { NoteEvent } from "@/lib/musicTheory/midiExport";
import type { ChordSegment } from "@/lib/audioToMidi/chordDetection";
import { chordAtTime } from "@/lib/audioToMidi/chordDetection";

export interface PostProcessOptions {
  octaveGhost: boolean;
  hardenedMerge: boolean;
  snapToGrid: boolean;
  tonalFilter: boolean;
  monophonic?: boolean;
  chordAware?: boolean;
  chords?: ChordSegment[];
  bpm?: number | null;
  bpmConfidence?: number;
  tonic?: string | null;     // e.g. "A"
  mode?: "major" | "minor" | null;
  keyConfidence?: number;
}

export interface PostProcessTrace {
  octaveGhost: { removed: number; aborted: boolean };
  hardenedMerge: { removed: number; aborted: boolean };
  snapToGrid: { snapped: number; skipped: boolean };
  tonalFilter: { removed: number; aborted: boolean; skipped: boolean };
  chordAware?: { removed: number; aborted: boolean; skipped: boolean };
  monophonic?: { removed: number; trimmed: number };
}

const MAX_REMOVAL_RATIO = 0.30;

const PITCH_CLASSES: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

const SCALE_PCS: Record<"major" | "minor", number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  // Natural minor + leading tone (covers harmonic minor) → safer for tonal pop/rock
  minor: [0, 2, 3, 5, 7, 8, 10, 11],
};

function getScalePCs(tonic: string, mode: "major" | "minor"): Set<number> {
  const root = PITCH_CLASSES[tonic] ?? 0;
  const set = new Set<number>();
  SCALE_PCS[mode].forEach((iv) => set.add((root + iv) % 12));
  return set;
}

/** Pass A — remove octave-ghost notes (upper octave with low velocity & short duration overlapping a fundamental). */
function passOctaveGhost(notes: NoteEvent[]): { notes: NoteEvent[]; removed: number; aborted: boolean } {
  if (notes.length === 0) return { notes, removed: 0, aborted: false };
  const kept = new Array<boolean>(notes.length).fill(true);

  // Index notes by midi for fast lookup
  const byMidi = new Map<number, number[]>();
  notes.forEach((n, i) => {
    const arr = byMidi.get(n.midi) ?? [];
    arr.push(i);
    byMidi.set(n.midi, arr);
  });

  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    const candidateIdx = byMidi.get(n.midi - 12);
    if (!candidateIdx) continue;
    for (const j of candidateIdx) {
      const fund = notes[j];
      const onsetDiff = Math.abs(n.startSec - fund.startSec);
      if (onsetDiff > 0.030) continue;
      if (n.velocity > fund.velocity * 0.40) continue;
      if (n.durationSec > fund.durationSec * 0.50) continue;
      kept[i] = false;
      break;
    }
  }

  const filtered = notes.filter((_, i) => kept[i]);
  const removed = notes.length - filtered.length;
  if (removed / notes.length > MAX_REMOVAL_RATIO) {
    return { notes, removed: 0, aborted: true };
  }
  return { notes: filtered, removed, aborted: false };
}

/** Pass B — merge same-pitch notes with compatible velocities (ratio ≤ 2×) within 60 ms. */
function passHardenedMerge(notes: NoteEvent[]): { notes: NoteEvent[]; removed: number; aborted: boolean } {
  if (notes.length === 0) return { notes, removed: 0, aborted: false };
  const byPitch = new Map<number, NoteEvent[]>();
  notes.forEach((n) => {
    const arr = byPitch.get(n.midi) ?? [];
    arr.push(n);
    byPitch.set(n.midi, arr);
  });

  const merged: NoteEvent[] = [];
  byPitch.forEach((arr) => {
    arr.sort((a, b) => a.startSec - b.startSec);
    let cur: NoteEvent | null = null;
    for (const n of arr) {
      if (!cur) { cur = { ...n }; continue; }
      const curEnd = cur.startSec + cur.durationSec;
      const gap = n.startSec - curEnd;
      const velRatio = Math.max(cur.velocity, n.velocity) / Math.max(0.01, Math.min(cur.velocity, n.velocity));
      if (gap < 0.060 && velRatio <= 2.0) {
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

  merged.sort((a, b) => a.startSec - b.startSec);
  const removed = notes.length - merged.length;
  if (removed / notes.length > MAX_REMOVAL_RATIO) {
    return { notes, removed: 0, aborted: true };
  }
  return { notes: merged, removed, aborted: false };
}

/** Pass C — snap onsets to the 16th-note grid if and only if the offset is within ±15 ms. */
function passSnapToGrid(notes: NoteEvent[], bpm: number): { notes: NoteEvent[]; snapped: number } {
  if (notes.length === 0 || bpm <= 0) return { notes, snapped: 0 };
  const sixteenthSec = 60 / bpm / 4;
  let snapped = 0;
  const out = notes.map((n) => {
    const k = Math.round(n.startSec / sixteenthSec);
    const target = k * sixteenthSec;
    const diff = target - n.startSec;
    if (Math.abs(diff) <= 0.015) {
      snapped++;
      return { ...n, startSec: target };
    }
    return n;
  });
  return { notes: out, snapped };
}

/** Pass D — remove out-of-scale notes that are also low-confidence (low vel + short duration). */
function passTonalFilter(
  notes: NoteEvent[],
  tonic: string,
  mode: "major" | "minor",
): { notes: NoteEvent[]; removed: number; aborted: boolean } {
  if (notes.length === 0) return { notes, removed: 0, aborted: false };
  const scale = getScalePCs(tonic, mode);
  let maxVel = 0;
  notes.forEach((n) => { if (n.velocity > maxVel) maxVel = n.velocity; });
  const velThreshold = maxVel * 0.25;

  const filtered = notes.filter((n) => {
    const pc = ((n.midi % 12) + 12) % 12;
    if (scale.has(pc)) return true;
    // Out of scale: keep if loud OR sustained
    if (n.velocity >= velThreshold) return true;
    if (n.durationSec >= 0.150) return true;
    return false;
  });
  const removed = notes.length - filtered.length;
  if (removed / notes.length > MAX_REMOVAL_RATIO) {
    return { notes, removed: 0, aborted: true };
  }
  return { notes: filtered, removed, aborted: false };
}

/** Pass E — strict monophony: at any instant exactly one note may sound.
 *  Greedy: walk by onset; on overlap, keep the louder note (ties → longer),
 *  drop the other entirely (no tails). Final pass trims each kept note so it
 *  ends at most at the next onset minus a 1 ms gap.
 */
function passMonophonic(notes: NoteEvent[]): { notes: NoteEvent[]; removed: number; trimmed: number } {
  if (notes.length === 0) return { notes, removed: 0, trimmed: 0 };
  const sorted = [...notes].sort((a, b) => a.startSec - b.startSec);
  const kept: NoteEvent[] = [];
  let removed = 0;
  for (const n of sorted) {
    const prev = kept[kept.length - 1];
    if (!prev) { kept.push({ ...n }); continue; }
    const prevEnd = prev.startSec + prev.durationSec;
    if (n.startSec >= prevEnd) {
      kept.push({ ...n });
      continue;
    }
    // Overlap: pick winner
    const nScore = n.velocity * 1000 + n.durationSec;
    const prevScore = prev.velocity * 1000 + prev.durationSec;
    if (nScore > prevScore) {
      kept[kept.length - 1] = { ...n };
    }
    removed++;
  }
  // Trim each kept note so it ends before the next onset
  let trimmed = 0;
  const GAP = 0.001;
  for (let i = 0; i < kept.length - 1; i++) {
    const cur = kept[i];
    const next = kept[i + 1];
    const maxEnd = next.startSec - GAP;
    const curEnd = cur.startSec + cur.durationSec;
    if (curEnd > maxEnd) {
      cur.durationSec = Math.max(0.030, maxEnd - cur.startSec);
      trimmed++;
    }
  }
  return { notes: kept, removed, trimmed };
}

/** Pass F — chord-aware filter: drop weak out-of-chord notes given a chord track.
 *  In-chord notes always kept. Out-of-chord kept only if loud OR sustained.
 *  Out-of-chord short + quiet → removed (likely artifact).
 */
function passChordAware(notes: NoteEvent[], chords: ChordSegment[]): { notes: NoteEvent[]; removed: number; aborted: boolean } {
  if (notes.length === 0 || chords.length === 0) return { notes, removed: 0, aborted: false };
  let maxVel = 0;
  for (const n of notes) if (n.velocity > maxVel) maxVel = n.velocity;
  const velThreshold = maxVel * 0.45;
  const kept: NoteEvent[] = [];
  for (const n of notes) {
    const c = chordAtTime(chords, n.startSec + n.durationSec * 0.5);
    if (!c) { kept.push(n); continue; }
    const pc = ((n.midi % 12) + 12) % 12;
    if (c.pitchClasses.has(pc)) { kept.push(n); continue; }
    // Out of chord — keep if salient.
    if (n.velocity >= velThreshold) { kept.push(n); continue; }
    if (n.durationSec >= 0.200) { kept.push(n); continue; }
    // Drop
  }
  const removed = notes.length - kept.length;
  if (removed / notes.length > MAX_REMOVAL_RATIO) return { notes, removed: 0, aborted: true };
  return { notes: kept, removed, aborted: false };
}

export function runPostProcessPipeline(
  input: NoteEvent[],
  opts: PostProcessOptions,
): { notes: NoteEvent[]; trace: PostProcessTrace } {
  let cur = input;
  const trace: PostProcessTrace = {
    octaveGhost: { removed: 0, aborted: false },
    hardenedMerge: { removed: 0, aborted: false },
    snapToGrid: { snapped: 0, skipped: false },
    tonalFilter: { removed: 0, aborted: false, skipped: false },
  };

  if (opts.octaveGhost) {
    const r = passOctaveGhost(cur);
    cur = r.notes;
    trace.octaveGhost = { removed: r.removed, aborted: r.aborted };
  }

  if (opts.hardenedMerge) {
    const r = passHardenedMerge(cur);
    cur = r.notes;
    trace.hardenedMerge = { removed: r.removed, aborted: r.aborted };
  }

  if (opts.snapToGrid) {
    if (opts.bpm && opts.bpm > 0 && (opts.bpmConfidence ?? 0) >= 0.5) {
      const r = passSnapToGrid(cur, opts.bpm);
      cur = r.notes;
      trace.snapToGrid = { snapped: r.snapped, skipped: false };
    } else {
      trace.snapToGrid = { snapped: 0, skipped: true };
    }
  }

  if (opts.chordAware) {
    if (opts.chords && opts.chords.length > 0) {
      const r = passChordAware(cur, opts.chords);
      cur = r.notes;
      trace.chordAware = { removed: r.removed, aborted: r.aborted, skipped: false };
    } else {
      trace.chordAware = { removed: 0, aborted: false, skipped: true };
    }
  }

  if (opts.tonalFilter) {
    if (opts.tonic && opts.mode && (opts.keyConfidence ?? 0) >= 0.6) {
      const r = passTonalFilter(cur, opts.tonic, opts.mode);
      cur = r.notes;
      trace.tonalFilter = { removed: r.removed, aborted: r.aborted, skipped: false };
    } else {
      trace.tonalFilter = { removed: 0, aborted: false, skipped: true };
    }
  }

  if (opts.monophonic) {
    const r = passMonophonic(cur);
    cur = r.notes;
    trace.monophonic = { removed: r.removed, trimmed: r.trimmed };
  }

  if (typeof window !== "undefined" && window.localStorage?.getItem("audio2midiDebug") === "1") {
    console.log("[audio2midi] post-process trace", trace, { in: input.length, out: cur.length, opts });
  }

  return { notes: cur, trace };
}


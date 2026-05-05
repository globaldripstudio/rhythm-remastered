import { Midi } from "@tonejs/midi";
import type { Chord } from "./chords";

export function chordsToMidiBlob(chords: Chord[], bpm = 90, beatsPerChord = 4): Blob {
  const midi = new Midi();
  midi.header.setTempo(bpm);
  const track = midi.addTrack();
  const secondsPerBeat = 60 / bpm;
  const dur = beatsPerChord * secondsPerBeat;
  let t = 0;
  chords.forEach((c) => {
    c.midi.forEach((n) => {
      track.addNote({ midi: n, time: t, duration: dur * 0.95, velocity: 0.8 });
    });
    t += dur;
  });
  return new Blob([midi.toArray()], { type: "audio/midi" });
}

export interface NoteEvent {
  midi: number;
  startSec: number;
  durationSec: number;
  velocity: number; // 0..1
}

export function notesToMidiBlob(notes: NoteEvent[], bpm = 120): Blob {
  const midi = new Midi();
  midi.header.setTempo(bpm);
  const track = midi.addTrack();
  notes.forEach((n) => {
    track.addNote({
      midi: n.midi,
      time: n.startSec,
      duration: Math.max(0.02, n.durationSec),
      velocity: Math.max(0.05, Math.min(1, n.velocity)),
    });
  });
  return new Blob([midi.toArray()], { type: "audio/midi" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

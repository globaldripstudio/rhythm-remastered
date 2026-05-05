// Music theory: scales, modes, notes
export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export const NOTE_NAMES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;
export type NoteName = typeof NOTE_NAMES[number];

export type ModeId =
  | "ionian"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "aeolian"
  | "locrian"
  | "harmonicMinor"
  | "melodicMinor"
  | "majorPentatonic"
  | "minorPentatonic"
  | "blues";

export interface ModeDef {
  id: ModeId;
  label: string;
  intervals: number[]; // semitones from tonic
  // diatonic chord qualities for degrees 1..7 (only for 7-note modes)
  diatonicQualities?: ChordQuality[];
}

export type ChordQuality =
  | "maj"
  | "min"
  | "dim"
  | "aug"
  | "maj7"
  | "min7"
  | "7"
  | "m7b5"
  | "dim7"
  | "sus2"
  | "sus4";

export const MODES: Record<ModeId, ModeDef> = {
  ionian: {
    id: "ionian",
    label: "Ionien (Majeur)",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    diatonicQualities: ["maj", "min", "min", "maj", "maj", "min", "dim"],
  },
  dorian: {
    id: "dorian",
    label: "Dorien",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    diatonicQualities: ["min", "min", "maj", "maj", "min", "dim", "maj"],
  },
  phrygian: {
    id: "phrygian",
    label: "Phrygien",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    diatonicQualities: ["min", "maj", "maj", "min", "dim", "maj", "min"],
  },
  lydian: {
    id: "lydian",
    label: "Lydien",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    diatonicQualities: ["maj", "maj", "min", "dim", "maj", "min", "min"],
  },
  mixolydian: {
    id: "mixolydian",
    label: "Mixolydien",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    diatonicQualities: ["maj", "min", "dim", "maj", "min", "min", "maj"],
  },
  aeolian: {
    id: "aeolian",
    label: "Éolien (Mineur naturel)",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    diatonicQualities: ["min", "dim", "maj", "min", "min", "maj", "maj"],
  },
  locrian: {
    id: "locrian",
    label: "Locrien",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    diatonicQualities: ["dim", "maj", "min", "min", "maj", "maj", "min"],
  },
  harmonicMinor: {
    id: "harmonicMinor",
    label: "Mineur harmonique",
    intervals: [0, 2, 3, 5, 7, 8, 11],
    diatonicQualities: ["min", "dim", "aug", "min", "maj", "maj", "dim"],
  },
  melodicMinor: {
    id: "melodicMinor",
    label: "Mineur mélodique",
    intervals: [0, 2, 3, 5, 7, 9, 11],
    diatonicQualities: ["min", "min", "aug", "maj", "maj", "dim", "dim"],
  },
  majorPentatonic: {
    id: "majorPentatonic",
    label: "Pentatonique majeure",
    intervals: [0, 2, 4, 7, 9],
  },
  minorPentatonic: {
    id: "minorPentatonic",
    label: "Pentatonique mineure",
    intervals: [0, 3, 5, 7, 10],
  },
  blues: {
    id: "blues",
    label: "Blues",
    intervals: [0, 3, 5, 6, 7, 10],
  },
};

export function tonicIndex(tonic: NoteName): number {
  return NOTE_NAMES.indexOf(tonic);
}

/** Returns the set of pitch classes (0..11) belonging to the scale */
export function scalePitchClasses(tonic: NoteName, modeId: ModeId): Set<number> {
  const root = tonicIndex(tonic);
  const set = new Set<number>();
  for (const i of MODES[modeId].intervals) set.add((root + i) % 12);
  return set;
}

/** MIDI helpers */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
export function midiToName(midi: number): string {
  const n = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${n}${octave}`;
}
export function pitchClassName(pc: number): NoteName {
  return NOTE_NAMES[((pc % 12) + 12) % 12];
}

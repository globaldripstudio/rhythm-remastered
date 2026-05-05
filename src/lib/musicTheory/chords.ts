import { ChordQuality, MODES, ModeId, NOTE_NAMES, NoteName, tonicIndex } from "./scales";

export interface Chord {
  root: NoteName;
  quality: ChordQuality;
  /** MIDI notes around octave 4 */
  midi: number[];
  /** Display symbol e.g. Am7, Cmaj7, F#dim */
  symbol: string;
  /** Roman numeral for current key */
  roman: string;
}

const QUALITY_INTERVALS: Record<ChordQuality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  "7": [0, 4, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

const QUALITY_SYMBOL: Record<ChordQuality, string> = {
  maj: "",
  min: "m",
  dim: "dim",
  aug: "aug",
  maj7: "maj7",
  min7: "m7",
  "7": "7",
  m7b5: "m7♭5",
  dim7: "dim7",
  sus2: "sus2",
  sus4: "sus4",
};

export function buildChord(root: NoteName, quality: ChordQuality, baseOctave = 4, roman = ""): Chord {
  const rootMidi = (baseOctave + 1) * 12 + tonicIndex(root);
  const midi = QUALITY_INTERVALS[quality].map((iv) => rootMidi + iv);
  return {
    root,
    quality,
    midi,
    symbol: `${root}${QUALITY_SYMBOL[quality]}`,
    roman,
  };
}

const ROMAN_NUM = ["I", "II", "III", "IV", "V", "VI", "VII"];

/**
 * Parse a degree token like "I", "ii", "V7", "vi", "bVII", "iv", "Imaj7", "ii7"
 * Returns [degreeIndex 1..7, qualityOverride|null, accidental: -1|0|1, suffix]
 */
function parseDegree(token: string): { degree: number; quality?: ChordQuality; accidental: number } {
  let t = token;
  let accidental = 0;
  if (t.startsWith("b")) {
    accidental = -1;
    t = t.slice(1);
  } else if (t.startsWith("#")) {
    accidental = 1;
    t = t.slice(1);
  }
  // extract roman numeral prefix (longest match)
  const upperOrLower = t.match(/^[ivIV]+/)?.[0] ?? "";
  const suffix = t.slice(upperOrLower.length);
  const isMinor = upperOrLower === upperOrLower.toLowerCase();
  const degIdx = ROMAN_NUM.indexOf(upperOrLower.toUpperCase());
  const degree = degIdx >= 0 ? degIdx + 1 : 1;

  let quality: ChordQuality | undefined;
  const isDim = suffix.includes("°") || suffix.startsWith("dim");
  const isHalfDim = suffix.includes("ø") || suffix.includes("m7b5");
  const isMaj7 = /maj7/i.test(suffix);
  const isMin7 = /^m?7/.test(suffix) && isMinor;
  const isDom7 = suffix === "7" && !isMinor;

  if (isHalfDim) quality = "m7b5";
  else if (isDim) quality = "dim";
  else if (isMaj7) quality = "maj7";
  else if (isDom7) quality = "7";
  else if (isMin7) quality = "min7";
  else if (suffix === "7" && isMinor) quality = "min7";
  else if (suffix === "sus2") quality = "sus2";
  else if (suffix === "sus4") quality = "sus4";
  else if (isMinor) quality = "min";
  else quality = "maj";

  return { degree, quality, accidental };
}

/** Returns chord for a single roman degree token in the given key/mode */
export function chordFromRoman(token: string, tonic: NoteName, modeId: ModeId, baseOctave = 4): Chord {
  const { degree, quality, accidental } = parseDegree(token);
  const mode = MODES[modeId];
  // Use diatonic intervals if 7-note mode; otherwise fallback to major scale intervals
  const intervals = mode.intervals.length === 7 ? mode.intervals : MODES.ionian.intervals;
  const baseInterval = intervals[(degree - 1) % intervals.length];
  const rootPc = (tonicIndex(tonic) + baseInterval + accidental + 12) % 12;
  const rootName = NOTE_NAMES[rootPc];
  // If the user used a roman case that contradicts the diatonic quality, prefer their token
  return buildChord(rootName, quality!, baseOctave, token);
}

export function progressionFromRomans(
  tokens: string[],
  tonic: NoteName,
  modeId: ModeId,
  baseOctave = 4,
): Chord[] {
  return tokens.map((tok) => chordFromRoman(tok, tonic, modeId, baseOctave));
}

export interface ProgressionPreset {
  id: string;
  label: string;
  genre: string;
  tokens: string[];
  /** suggested mode: "major" or "minor" hint */
  mood: "major" | "minor";
}

export const PROGRESSION_PRESETS: ProgressionPreset[] = [
  // Pop
  { id: "pop-axis", label: "Axis (I–V–vi–IV)", genre: "Pop", tokens: ["I", "V", "vi", "IV"], mood: "major" },
  { id: "pop-456", label: "Sensitive (vi–IV–I–V)", genre: "Pop", tokens: ["vi", "IV", "I", "V"], mood: "major" },
  { id: "pop-50s", label: "50s (I–vi–IV–V)", genre: "Pop", tokens: ["I", "vi", "IV", "V"], mood: "major" },
  // RnB / Soul
  { id: "rnb-251", label: "ii–V–I", genre: "RnB / Soul", tokens: ["ii7", "V7", "Imaj7"], mood: "major" },
  { id: "rnb-neo", label: "Neo Soul (Imaj7–iii7–vi7–IV)", genre: "RnB / Soul", tokens: ["Imaj7", "iii7", "vi7", "IV"], mood: "major" },
  { id: "rnb-modal", label: "Modal (i–iv–bVII–bIII)", genre: "RnB / Soul", tokens: ["i", "iv", "bVII", "bIII"], mood: "minor" },
  // Trap / Drill
  { id: "trap-1", label: "Dark Drill (i–bVI–bIII–bVII)", genre: "Trap / Drill", tokens: ["i", "bVI", "bIII", "bVII"], mood: "minor" },
  { id: "trap-2", label: "Tension (i–iv–bVI–V)", genre: "Trap / Drill", tokens: ["i", "iv", "bVI", "V"], mood: "minor" },
  { id: "trap-3", label: "Cinematic (i–bVII–bVI–V)", genre: "Trap / Drill", tokens: ["i", "bVII", "bVI", "V"], mood: "minor" },
  // Lo-fi / Jazz
  { id: "jazz-251", label: "ii7–V7–Imaj7", genre: "Lo-fi / Jazz", tokens: ["ii7", "V7", "Imaj7"], mood: "major" },
  { id: "jazz-1625", label: "Rhythm Changes (Imaj7–vi7–ii7–V7)", genre: "Lo-fi / Jazz", tokens: ["Imaj7", "vi7", "ii7", "V7"], mood: "major" },
  // Sad / Cinematic
  { id: "cine-1", label: "Andalusian (i–bVII–bVI–V)", genre: "Cinématique", tokens: ["i", "bVII", "bVI", "V"], mood: "minor" },
  { id: "cine-2", label: "Lament (i–bVII–bVI–bVII)", genre: "Cinématique", tokens: ["i", "bVII", "bVI", "bVII"], mood: "minor" },
];

export function randomProgression(modeMood: "major" | "minor"): string[] {
  const pool = PROGRESSION_PRESETS.filter((p) => p.mood === modeMood);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return [...pick.tokens];
}

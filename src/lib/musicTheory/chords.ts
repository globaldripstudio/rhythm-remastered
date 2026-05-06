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
  /** Tonalité d'origine du morceau de référence (utilisée en mode "Aucun/auto") */
  defaultTonic?: NoteName;
}

export const PROGRESSION_PRESETS: ProgressionPreset[] = [
  // Pop — grilles ultra-classiques avec morceaux de référence
  { id: "pop-axis", label: "Let It Be — The Beatles (I–V–vi–IV)", genre: "Pop", tokens: ["I", "V", "vi", "IV"], mood: "major", defaultTonic: "C" },
  // Zombie : Em–C–G–D = vi–IV–I–V dans la tonalité de Sol majeur
  { id: "pop-zombie", label: "Zombie — The Cranberries (vi–IV–I–V)", genre: "Pop", tokens: ["vi", "IV", "I", "V"], mood: "major", defaultTonic: "G" },
  { id: "pop-50s", label: "Stand By Me — Ben E. King (I–vi–IV–V)", genre: "Pop", tokens: ["I", "vi", "IV", "V"], mood: "major", defaultTonic: "A" },
  { id: "pop-canon", label: "Canon de Pachelbel (I–V–vi–iii–IV–I–IV–V)", genre: "Pop", tokens: ["I", "V", "vi", "iii", "IV", "I", "IV", "V"], mood: "major", defaultTonic: "D" },
  { id: "pop-someone", label: "Someone Like You — Adele (I–iii–vi–IV)", genre: "Pop", tokens: ["I", "iii", "vi", "IV"], mood: "major", defaultTonic: "A" },
  // Don't Stop Believin' : E–B–C#m–A = I–V–vi–IV (E majeur)
  { id: "pop-believin", label: "Don't Stop Believin' — Journey (I–V–vi–IV)", genre: "Pop", tokens: ["I", "V", "vi", "IV"], mood: "major", defaultTonic: "E" },
  // Hallelujah : C–Am–C–Am–F–G–C–G en Do majeur
  { id: "pop-hallelujah", label: "Hallelujah — L. Cohen (I–vi–IV–V–I)", genre: "Pop", tokens: ["I", "vi", "I", "vi", "IV", "V", "I", "V"], mood: "major", defaultTonic: "C" },

  // RnB / Soul
  // Sunday Morning : Em7–A7–Dmaj7 → ii7–V7–Imaj7 en Ré majeur
  { id: "rnb-sunday", label: "Sunday Morning — Maroon 5 (ii7–V7–Imaj7)", genre: "RnB / Soul", tokens: ["ii7", "V7", "Imaj7"], mood: "major", defaultTonic: "D" },
  { id: "rnb-neo", label: "Neo Soul (Imaj7–iii7–vi7–IV)", genre: "RnB / Soul", tokens: ["Imaj7", "iii7", "vi7", "IV"], mood: "major", defaultTonic: "F" },
  { id: "rnb-quiet", label: "Quiet Storm — Sade style (Imaj7–vi7–ii7–V7)", genre: "RnB / Soul", tokens: ["Imaj7", "vi7", "ii7", "V7"], mood: "major", defaultTonic: "F" },

  // PluggnB
  { id: "plug-dreamy", label: "Dreamy plugg (Imaj7–iii7–vi7–IV)", genre: "PluggnB", tokens: ["Imaj7", "iii7", "vi7", "IV"], mood: "major", defaultTonic: "C" },

  // Rage — boucles mineures sombres
  { id: "yeat-getbusy", label: "Gët Busy — Yeat (i–bVI–bVII–v)", genre: "Rage", tokens: ["i", "bVI", "bVII", "v"], mood: "minor", defaultTonic: "F#" },
  { id: "yeat-richminion", label: "Rich Minion — Yeat (i–bVII–bVI–bVII)", genre: "Rage", tokens: ["i", "bVII", "bVI", "bVII"], mood: "minor", defaultTonic: "G" },
  { id: "yeat-moneysobig", label: "Money So Big — Yeat (i–bIII–bVII–iv)", genre: "Rage", tokens: ["i", "bIII", "bVII", "iv"], mood: "minor", defaultTonic: "F#" },
  { id: "yeat-money", label: "Money Twërk — Yeat (i–v–bVI–bVII)", genre: "Rage", tokens: ["i", "v", "bVI", "bVII"], mood: "minor", defaultTonic: "G" },

  // Trap / Drill
  // Mask Off : Fm boucle flûte (i–bIII–iv)
  { id: "trap-maskoff", label: "Mask Off — Future (i–bIII–iv–i)", genre: "Trap / Drill", tokens: ["i", "bIII", "iv", "i"], mood: "minor", defaultTonic: "F" },
  { id: "trap-xo", label: "XO Tour Llif3 — Lil Uzi (i–bVI–bIII–bVII)", genre: "Trap / Drill", tokens: ["i", "bVI", "bIII", "bVII"], mood: "minor", defaultTonic: "C#" },
  { id: "trap-memphis", label: "Memphis phrygien (i–bII–i–bVII)", genre: "Trap / Drill", tokens: ["i", "bII", "i", "bVII"], mood: "minor", defaultTonic: "A" },

  // Reggae — riddims classiques
  // No Woman No Cry : C–G–Am–F = I–V–vi–IV (Do majeur)
  { id: "reggae-noooman", label: "No Woman No Cry — Bob Marley (I–V–vi–IV)", genre: "Reggae", tokens: ["I", "V", "vi", "IV"], mood: "major", defaultTonic: "C" },
  { id: "reggae-threelitle", label: "Three Little Birds — Bob Marley (I–IV–I–V)", genre: "Reggae", tokens: ["I", "IV", "I", "V"], mood: "major", defaultTonic: "A" },
  // Get Up Stand Up : Cm groove mineur (i–bVII)
  { id: "reggae-getupstandup", label: "Get Up Stand Up — Bob Marley (i–bVII)", genre: "Reggae", tokens: ["i", "bVII", "i", "bVII"], mood: "minor", defaultTonic: "C" },

  // Lo-fi / Jazz
  { id: "jazz-251", label: "ii–V–I jazz (ii7–V7–Imaj7)", genre: "Lo-fi / Jazz", tokens: ["ii7", "V7", "Imaj7"], mood: "major", defaultTonic: "C" },
  { id: "jazz-1625", label: "Rhythm changes (Imaj7–vi7–ii7–V7)", genre: "Lo-fi / Jazz", tokens: ["Imaj7", "vi7", "ii7", "V7"], mood: "major", defaultTonic: "C" },
  { id: "lofi-1", label: "Lo-fi nostalgique (Imaj7–iii7–IVmaj7–iv)", genre: "Lo-fi / Jazz", tokens: ["Imaj7", "iii7", "IV", "iv"], mood: "major", defaultTonic: "C" },
  { id: "lofi-2", label: "Bossa nova (ii7–V7–Imaj7–vi7)", genre: "Lo-fi / Jazz", tokens: ["ii7", "V7", "Imaj7", "vi7"], mood: "major", defaultTonic: "F" },
  // Autumn Leaves : ii7–V7–Imaj7–IVmaj7–vii(ø)–III7–vi en Sol majeur (relatif Em)
  { id: "jazz-autumn", label: "Autumn Leaves (ii7–V7–Imaj7–IVmaj7)", genre: "Lo-fi / Jazz", tokens: ["ii7", "V7", "Imaj7", "IV"], mood: "major", defaultTonic: "G" },

  // House / Deep
  { id: "house-strobe", label: "Strobe — Deadmau5 (I–vi–IV–V)", genre: "House / Deep", tokens: ["I", "vi", "IV", "V"], mood: "major", defaultTonic: "B" },
  // Levels : Bm groove (i–bVI–bIII–bVII)
  { id: "house-levels", label: "Levels — Avicii (i–bVI–bIII–bVII)", genre: "House / Deep", tokens: ["i", "bVI", "bIII", "bVII"], mood: "minor", defaultTonic: "C#" },

  // Rock / Indie
  // Wonderwall (capo 2) sonne F#m–A–E–B = i–bIII–bVII–IV (F# mineur)
  { id: "rock-wonderwall", label: "Wonderwall — Oasis (i–bIII–bVII–IV)", genre: "Rock / Indie", tokens: ["i", "bIII", "bVII", "IV"], mood: "minor", defaultTonic: "F#" },
  { id: "rock-seven", label: "Seven Nation Army — White Stripes (i–bIII–i–bVII–bVI)", genre: "Rock / Indie", tokens: ["i", "bIII", "i", "bVII", "bVI"], mood: "minor", defaultTonic: "E" },
  { id: "rock-teenspirit", label: "Smells Like Teen Spirit — Nirvana (I–IV–bIII–bVI)", genre: "Rock / Indie", tokens: ["I", "IV", "bIII", "bVI"], mood: "major", defaultTonic: "F" },
  // Hotel California (intro) : Bm–F#–A–E–G–D–Em–F# = i–V–bVII–IV–bVI–bIII–iv–V
  { id: "rock-hotel", label: "Hotel California — Eagles (i–V–bVII–IV–bVI–bIII–iv–V)", genre: "Rock / Indie", tokens: ["i", "V", "bVII", "IV", "bVI", "bIII", "iv", "V"], mood: "minor", defaultTonic: "B" },

  // Cinématique
  { id: "cine-hittheroad", label: "Hit the Road Jack — Ray Charles (i–bVII–bVI–V)", genre: "Cinématique", tokens: ["i", "bVII", "bVI", "V"], mood: "minor", defaultTonic: "A" },
];

/**
 * Functional harmony "next chord" suggestions.
 * Maps a normalized degree to the set of degrees that classically sound good after.
 * Anything outside the set is rendered as "discouraged" (greyed) in the builder.
 */
const MAJOR_TRANSITIONS: Record<string, string[]> = {
  I: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  ii: ["V", "vii°", "iii", "IV"],
  iii: ["vi", "IV", "ii"],
  IV: ["V", "I", "ii", "vii°", "vi"],
  V: ["I", "vi", "iii"],
  vi: ["ii", "IV", "V", "iii"],
  "vii°": ["I", "iii"],
};

const MINOR_TRANSITIONS: Record<string, string[]> = {
  i: ["i", "iv", "v", "V", "bVI", "bVII", "bIII", "ii°"],
  "ii°": ["V", "i"],
  bIII: ["bVI", "iv", "bVII", "i"],
  iv: ["V", "v", "i", "bVII", "bVI"],
  v: ["i", "bVII"],
  V: ["i", "bVI"],
  bVI: ["bVII", "iv", "bIII"],
  bVII: ["bIII", "iv", "i", "bVI"],
};

/** Functional role for each degree (T=Tonic, S=Subdominant, D=Dominant) */
export type HarmonicFunction = "T" | "S" | "D";

const FN_MAJOR: Record<string, HarmonicFunction> = {
  I: "T", iii: "T", vi: "T", IV: "S", ii: "S", V: "D", "vii°": "D",
};
const FN_MINOR: Record<string, HarmonicFunction> = {
  i: "T", bIII: "T", bVI: "T", iv: "S", "ii°": "S", bVII: "S", v: "D", V: "D",
};

const FN_LABEL: Record<HarmonicFunction, string> = {
  T: "Tonique",
  S: "Sous-dominante",
  D: "Dominante",
};

function normalizeDegree(token: string): string {
  return token.replace(/maj7|m7b5|7|sus2|sus4|dim7|dim/gi, "").trim() || token;
}

export interface NextSuggestion {
  /** Set of degrees that work as a next chord */
  good: Set<string>;
  /** All possible degrees of the current mode */
  all: string[];
  /** Per-degree explanation (FR) */
  reasons: Record<string, string>;
}

export function suggestNextDegrees(currentToken: string | null, mood: "major" | "minor"): NextSuggestion {
  const table = mood === "major" ? MAJOR_TRANSITIONS : MINOR_TRANSITIONS;
  const fnMap = mood === "major" ? FN_MAJOR : FN_MINOR;
  const allDegrees = mood === "major"
    ? ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
    : ["i", "ii°", "bIII", "iv", "v", "V", "bVI", "bVII"];

  // Premier accord : tout est permis (mais on suggère T en priorité visuelle)
  if (!currentToken) {
    const reasons: Record<string, string> = {};
    allDegrees.forEach((d) => {
      const fn = fnMap[d];
      reasons[d] = `Premier accord — fonction ${FN_LABEL[fn] ?? "—"}. La majorité des morceaux démarrent sur la tonique (${mood === "major" ? "I" : "i"}).`;
    });
    return { good: new Set(allDegrees), all: allDegrees, reasons };
  }

  const key = normalizeDegree(currentToken);
  const good = new Set<string>(table[key] ?? allDegrees);
  const prevFn = fnMap[key];
  const reasons: Record<string, string> = {};
  allDegrees.forEach((d) => {
    const nextFn = fnMap[d];
    const arrow = `${FN_LABEL[prevFn] ?? "—"} → ${FN_LABEL[nextFn] ?? "—"}`;
    if (good.has(d)) {
      if (prevFn === "D" && nextFn === "T") reasons[d] = `Résolution classique (${arrow}).`;
      else if (prevFn === "S" && nextFn === "D") reasons[d] = `Cadence parfaite en préparation (${arrow}).`;
      else if (prevFn === "T" && nextFn === "S") reasons[d] = `Ouverture naturelle (${arrow}).`;
      else if (prevFn === "T" && nextFn === "D") reasons[d] = `Tension directe (${arrow}).`;
      else reasons[d] = `Enchaînement fluide (${arrow}).`;
    } else {
      if (prevFn === "D" && nextFn === "S") reasons[d] = `Régression D → S : casse la résolution attendue (${arrow}).`;
      else if (prevFn === "T" && nextFn === "T") reasons[d] = `Tonique → Tonique : statique, manque de mouvement.`;
      else reasons[d] = `Transition peu naturelle dans la grammaire fonctionnelle (${arrow}).`;
    }
  });
  return { good, all: allDegrees, reasons };
}

export function functionOf(token: string, mood: "major" | "minor"): HarmonicFunction | undefined {
  const map = mood === "major" ? FN_MAJOR : FN_MINOR;
  return map[normalizeDegree(token)];
}

export function randomProgression(modeMood: "major" | "minor"): string[] {
  const pool = PROGRESSION_PRESETS.filter((p) => p.mood === modeMood);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return [...pick.tokens];
}

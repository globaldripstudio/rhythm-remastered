/**
 * Genre / subgenre loudness targets — creative mastering references (2024-2026).
 *
 * These are *creative* integrated LUFS ranges commonly used by mastering engineers
 * (sources: Mastering The Mix, iZotope, Ian Shepherd / Production Advice, AES papers,
 * Mastered for Streaming guides). They are independent of platform normalization,
 * which on most streaming services lowers playback to -14 LUFS (Spotify, YouTube,
 * Tidal, Amazon) or -16 LUFS (Apple Music Sound Check). True peak ceiling is set
 * to -1 dBTP for streaming-bound material to leave headroom for lossy codecs
 * (AAC/Opus/MP3), per AES TD1004 and EBU R128 s2.
 */

export type SubGenreTarget = {
  id: string;
  labelFr: string;
  labelEn: string;
  /** Typical commercial integrated LUFS range for a finished master */
  lufsMin: number;
  lufsMax: number;
  /** Maximum recommended true peak (dBTP) */
  truePeakMax: number;
  /** Typical LRA range (LU). Used for nuance when value is outside */
  lraMin?: number;
  lraMax?: number;
  /** Short context line (FR/EN), 1 line max */
  noteFr?: string;
  noteEn?: string;
};

export type GenreGroup = {
  id: string;
  labelFr: string;
  labelEn: string;
  subs: SubGenreTarget[];
};

export const GENRE_GROUPS: GenreGroup[] = [
  {
    id: "hiphop",
    labelFr: "Hip-Hop / Urbain",
    labelEn: "Hip-Hop / Urban",
    subs: [
      { id: "hiphop-modern", labelFr: "Hip-Hop moderne", labelEn: "Modern Hip-Hop", lufsMin: -10, lufsMax: -8, truePeakMax: -1, lraMin: 4, lraMax: 8 },
      { id: "trap", labelFr: "Trap", labelEn: "Trap", lufsMin: -8, lufsMax: -6, truePeakMax: -1, lraMin: 3, lraMax: 6, noteFr: "808 saturée tolérée si LRA reste cohérent.", noteEn: "Saturated 808 acceptable if LRA stays coherent." },
      { id: "drill", labelFr: "Drill", labelEn: "Drill", lufsMin: -8, lufsMax: -6, truePeakMax: -1, lraMin: 3, lraMax: 6 },
      { id: "boombap", labelFr: "Boom Bap", labelEn: "Boom Bap", lufsMin: -12, lufsMax: -10, truePeakMax: -1, lraMin: 5, lraMax: 9 },
      { id: "lofi-hiphop", labelFr: "Lo-fi Hip-Hop", labelEn: "Lo-fi Hip-Hop", lufsMin: -16, lufsMax: -13, truePeakMax: -1, lraMin: 6, lraMax: 12 },
    ],
  },
  {
    id: "pop",
    labelFr: "Pop",
    labelEn: "Pop",
    subs: [
      { id: "pop", labelFr: "Pop mainstream", labelEn: "Mainstream Pop", lufsMin: -10, lufsMax: -8, truePeakMax: -1, lraMin: 4, lraMax: 8 },
      { id: "dance-pop", labelFr: "Dance-Pop", labelEn: "Dance-Pop", lufsMin: -9, lufsMax: -7, truePeakMax: -1, lraMin: 3, lraMax: 6 },
      { id: "indie-pop", labelFr: "Indie Pop", labelEn: "Indie Pop", lufsMin: -12, lufsMax: -10, truePeakMax: -1, lraMin: 5, lraMax: 9 },
      { id: "synthpop", labelFr: "Synthpop / Hyperpop", labelEn: "Synthpop / Hyperpop", lufsMin: -10, lufsMax: -7, truePeakMax: -1, lraMin: 3, lraMax: 7 },
    ],
  },
  {
    id: "rnb",
    labelFr: "R&B / Soul / Afro",
    labelEn: "R&B / Soul / Afro",
    subs: [
      { id: "rnb", labelFr: "R&B contemporain", labelEn: "Contemporary R&B", lufsMin: -12, lufsMax: -10, truePeakMax: -1, lraMin: 5, lraMax: 9 },
      { id: "soul", labelFr: "Soul / Neo-Soul", labelEn: "Soul / Neo-Soul", lufsMin: -13, lufsMax: -11, truePeakMax: -1, lraMin: 6, lraMax: 10 },
      { id: "afrobeats", labelFr: "Afrobeats / Amapiano", labelEn: "Afrobeats / Amapiano", lufsMin: -10, lufsMax: -8, truePeakMax: -1, lraMin: 4, lraMax: 8 },
      { id: "reggaeton", labelFr: "Reggaeton / Latin", labelEn: "Reggaeton / Latin", lufsMin: -9, lufsMax: -7, truePeakMax: -1, lraMin: 3, lraMax: 6 },
    ],
  },
  {
    id: "electronic",
    labelFr: "Électronique / Club",
    labelEn: "Electronic / Club",
    subs: [
      { id: "house", labelFr: "House", labelEn: "House", lufsMin: -9, lufsMax: -7, truePeakMax: -1, lraMin: 4, lraMax: 8 },
      { id: "tech-house", labelFr: "Tech House", labelEn: "Tech House", lufsMin: -9, lufsMax: -7, truePeakMax: -1, lraMin: 4, lraMax: 7 },
      { id: "techno", labelFr: "Techno", labelEn: "Techno", lufsMin: -10, lufsMax: -8, truePeakMax: -1, lraMin: 4, lraMax: 8 },
      { id: "edm", labelFr: "EDM / Big Room / Festival", labelEn: "EDM / Big Room / Festival", lufsMin: -7, lufsMax: -5, truePeakMax: -1, lraMin: 3, lraMax: 6, noteFr: "Master club très dense, prévoir version stream à -8/-9 LUFS.", noteEn: "Very dense club master, deliver a -8/-9 LUFS stream version." },
      { id: "dnb", labelFr: "Drum & Bass", labelEn: "Drum & Bass", lufsMin: -8, lufsMax: -6, truePeakMax: -1, lraMin: 3, lraMax: 7 },
      { id: "dubstep", labelFr: "Dubstep / Bass Music", labelEn: "Dubstep / Bass Music", lufsMin: -7, lufsMax: -5, truePeakMax: -1, lraMin: 3, lraMax: 6 },
      { id: "trance", labelFr: "Trance / Progressive", labelEn: "Trance / Progressive", lufsMin: -10, lufsMax: -8, truePeakMax: -1, lraMin: 5, lraMax: 9 },
      { id: "ambient", labelFr: "Ambient / Downtempo", labelEn: "Ambient / Downtempo", lufsMin: -20, lufsMax: -16, truePeakMax: -1, lraMin: 8, lraMax: 18 },
    ],
  },
  {
    id: "rock",
    labelFr: "Rock / Metal",
    labelEn: "Rock / Metal",
    subs: [
      { id: "indie-rock", labelFr: "Indie / Alt Rock", labelEn: "Indie / Alt Rock", lufsMin: -12, lufsMax: -10, truePeakMax: -1, lraMin: 6, lraMax: 10 },
      { id: "hard-rock", labelFr: "Hard Rock", labelEn: "Hard Rock", lufsMin: -10, lufsMax: -8, truePeakMax: -1, lraMin: 5, lraMax: 9 },
      { id: "metal-modern", labelFr: "Metal moderne", labelEn: "Modern Metal", lufsMin: -8, lufsMax: -6, truePeakMax: -1, lraMin: 3, lraMax: 7, noteFr: "Densité extrême habituelle, surveiller la fatigue auditive.", noteEn: "Extreme density is common — watch listener fatigue." },
      { id: "classic-rock", labelFr: "Classic Rock", labelEn: "Classic Rock", lufsMin: -13, lufsMax: -11, truePeakMax: -1, lraMin: 7, lraMax: 12 },
    ],
  },
  {
    id: "acoustic",
    labelFr: "Acoustique / Jazz / Classique",
    labelEn: "Acoustic / Jazz / Classical",
    subs: [
      { id: "acoustic-folk", labelFr: "Acoustique / Folk", labelEn: "Acoustic / Folk", lufsMin: -18, lufsMax: -14, truePeakMax: -1, lraMin: 7, lraMax: 14 },
      { id: "singer-songwriter", labelFr: "Singer-songwriter", labelEn: "Singer-songwriter", lufsMin: -16, lufsMax: -12, truePeakMax: -1, lraMin: 6, lraMax: 12 },
      { id: "jazz", labelFr: "Jazz", labelEn: "Jazz", lufsMin: -20, lufsMax: -16, truePeakMax: -1, lraMin: 8, lraMax: 16 },
      { id: "classical", labelFr: "Classique", labelEn: "Classical", lufsMin: -23, lufsMax: -18, truePeakMax: -1, lraMin: 12, lraMax: 25 },
    ],
  },
  {
    id: "cinematic",
    labelFr: "Cinématique / Score",
    labelEn: "Cinematic / Score",
    subs: [
      { id: "film-score", labelFr: "Score / Musique de film", labelEn: "Film Score", lufsMin: -23, lufsMax: -18, truePeakMax: -1, lraMin: 12, lraMax: 25 },
      { id: "trailer", labelFr: "Trailer / Bande-annonce", labelEn: "Trailer", lufsMin: -14, lufsMax: -10, truePeakMax: -1, lraMin: 6, lraMax: 12 },
    ],
  },
  {
    id: "broadcast",
    labelFr: "Broadcast / Podcast / Vidéo",
    labelEn: "Broadcast / Podcast / Video",
    subs: [
      { id: "podcast-stereo", labelFr: "Podcast stéréo", labelEn: "Podcast (stereo)", lufsMin: -17, lufsMax: -15, truePeakMax: -1, lraMin: 4, lraMax: 9, noteFr: "Cible AES TD1008 : -16 LUFS ±1 pour la lecture mobile.", noteEn: "AES TD1008 target: -16 LUFS ±1 for mobile playback." },
      { id: "podcast-mono", labelFr: "Podcast mono", labelEn: "Podcast (mono)", lufsMin: -20, lufsMax: -18, truePeakMax: -1, lraMin: 4, lraMax: 9 },
      { id: "ebu-r128", labelFr: "Broadcast EBU R128", labelEn: "Broadcast EBU R128", lufsMin: -24, lufsMax: -22, truePeakMax: -1, lraMin: 5, lraMax: 20, noteFr: "Norme TV/Radio EU : -23 LUFS ±1, TP ≤ -1 dBTP.", noteEn: "EU TV/Radio standard: -23 LUFS ±1, TP ≤ -1 dBTP." },
      { id: "netflix", labelFr: "Netflix / OTT (dialog)", labelEn: "Netflix / OTT (dialog)", lufsMin: -28, lufsMax: -26, truePeakMax: -2, lraMin: 6, lraMax: 20, noteFr: "Spec Netflix : -27 LKFS ±2 dialog-gated, TP ≤ -2 dBTP.", noteEn: "Netflix spec: -27 LKFS ±2 dialog-gated, TP ≤ -2 dBTP." },
    ],
  },
];

/** Flat lookup of all subgenres by id */
export const SUBGENRE_BY_ID: Record<string, SubGenreTarget> = GENRE_GROUPS.reduce(
  (acc, g) => {
    g.subs.forEach((s) => { acc[s.id] = s; });
    return acc;
  },
  {} as Record<string, SubGenreTarget>,
);

export type LoudnessVerdict = "below" | "in-range" | "above";

export type LoudnessInterpretation = {
  /** 1-2 short lines, ready to display */
  lines: string[];
  verdict: LoudnessVerdict;
  truePeakOk: boolean;
};

const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "–");

/**
 * Build a concise (1-2 lines max) interpretation for the given measurement
 * relative to the chosen subgenre target. Designed for audio professionals:
 * no fluff, factual deltas, actionable.
 */
export const buildInterpretation = (
  measurement: { lufs: number; truePeakDb: number; loudnessRange: number },
  sub: SubGenreTarget,
  lang: "fr" | "en",
): LoudnessInterpretation => {
  const { lufs, truePeakDb, loudnessRange } = measurement;
  const center = (sub.lufsMin + sub.lufsMax) / 2;
  let verdict: LoudnessVerdict;
  let deltaText: string;

  if (lufs > sub.lufsMax + 0.4) {
    verdict = "above";
    const delta = lufs - sub.lufsMax;
    deltaText = lang === "fr"
      ? `+${delta.toFixed(1)} LU au-dessus de la cible (${sub.lufsMin}…${sub.lufsMax} LUFS) — réduire le gain de pré-limiteur ou alléger la compression bus.`
      : `+${delta.toFixed(1)} LU above the target (${sub.lufsMin}…${sub.lufsMax} LUFS) — reduce pre-limiter gain or ease bus compression.`;
  } else if (lufs < sub.lufsMin - 0.4) {
    verdict = "below";
    const delta = sub.lufsMin - lufs;
    deltaText = lang === "fr"
      ? `-${delta.toFixed(1)} LU sous la cible (${sub.lufsMin}…${sub.lufsMax} LUFS) — possible perte d'impact face aux références du genre.`
      : `-${delta.toFixed(1)} LU below the target (${sub.lufsMin}…${sub.lufsMax} LUFS) — likely to feel weaker than genre references.`;
  } else {
    verdict = "in-range";
    deltaText = lang === "fr"
      ? `Dans la cible du genre (${sub.lufsMin}…${sub.lufsMax} LUFS, centre ${fmt(center)}).`
      : `Within genre target (${sub.lufsMin}…${sub.lufsMax} LUFS, center ${fmt(center)}).`;
  }

  const truePeakOk = truePeakDb <= sub.truePeakMax;
  const tpDeltaText = truePeakOk
    ? lang === "fr"
      ? `True peak ${fmt(truePeakDb)} dBTP : sain pour l'encodage (cible ≤ ${sub.truePeakMax} dBTP).`
      : `True peak ${fmt(truePeakDb)} dBTP: safe for codecs (target ≤ ${sub.truePeakMax} dBTP).`
    : lang === "fr"
      ? `True peak ${fmt(truePeakDb)} dBTP > ${sub.truePeakMax} dBTP : risque de clipping inter-sample en AAC/MP3, baisser le ceiling du limiteur.`
      : `True peak ${fmt(truePeakDb)} dBTP > ${sub.truePeakMax} dBTP: inter-sample clipping risk on AAC/MP3, lower the limiter ceiling.`;

  // Optional 2nd-line nuance about LRA only when out of typical band
  let line2 = `${fmt(lufs)} LUFS · ${deltaText} ${tpDeltaText}`;
  if (sub.lraMin !== undefined && sub.lraMax !== undefined && Number.isFinite(loudnessRange)) {
    if (loudnessRange < sub.lraMin - 1) {
      const lraNote = lang === "fr"
        ? `LRA ${fmt(loudnessRange)} LU sous le typique (${sub.lraMin}…${sub.lraMax}) : compression probablement trop ferme, dynamique écrasée.`
        : `LRA ${fmt(loudnessRange)} LU below typical (${sub.lraMin}…${sub.lraMax}): compression likely too tight, dynamics squashed.`;
      line2 = `${fmt(lufs)} LUFS · ${deltaText} ${tpDeltaText}`;
      return { lines: [line2, lraNote], verdict, truePeakOk };
    }
    if (loudnessRange > sub.lraMax + 2) {
      const lraNote = lang === "fr"
        ? `LRA ${fmt(loudnessRange)} LU au-dessus du typique (${sub.lraMin}…${sub.lraMax}) : très dynamique, peut sembler bas en lecture normalisée.`
        : `LRA ${fmt(loudnessRange)} LU above typical (${sub.lraMin}…${sub.lraMax}): very dynamic, may feel low after platform normalization.`;
      return { lines: [line2, lraNote], verdict, truePeakOk };
    }
  }

  // Subgenre-specific note overrides line 2 if present
  if (sub.noteFr || sub.noteEn) {
    return {
      lines: [line2, lang === "fr" ? sub.noteFr ?? sub.noteEn ?? "" : sub.noteEn ?? sub.noteFr ?? ""],
      verdict,
      truePeakOk,
    };
  }

  return { lines: [line2], verdict, truePeakOk };
};

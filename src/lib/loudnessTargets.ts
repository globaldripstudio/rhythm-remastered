/**
 * Genre / subgenre loudness targets — consolidated mastering references (2024-2026).
 *
 * Implicit context: lossless production (WAV/AIFF/FLAC) destined for streaming
 * platforms and physical media. Codec-related concerns are intentionally excluded
 * from interpretations.
 *
 * Sources: Mastering The Mix, iZotope, Production Advice, AES TD1004,
 * EBU R128 s2, Mastered for Streaming guides.
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
  /** Typical LRA range (LU) */
  lraMin?: number;
  lraMax?: number;
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
      { id: "hiphop-trap-drill", labelFr: "Hip-Hop / Trap / Drill", labelEn: "Hip-Hop / Trap / Drill", lufsMin: -8.5, lufsMax: -7, truePeakMax: -1, lraMin: 3, lraMax: 7 },
      { id: "boombap-lofi", labelFr: "Boom Bap / Lo-fi", labelEn: "Boom Bap / Lo-fi", lufsMin: -13, lufsMax: -10, truePeakMax: -1, lraMin: 5, lraMax: 10 },
    ],
  },
  {
    id: "pop",
    labelFr: "Pop",
    labelEn: "Pop",
    subs: [
      { id: "pop-dance", labelFr: "Pop / Dance-Pop", labelEn: "Pop / Dance-Pop", lufsMin: -10, lufsMax: -7, truePeakMax: -1, lraMin: 3, lraMax: 7 },
      { id: "indie-synth", labelFr: "Indie / Synthpop", labelEn: "Indie / Synthpop", lufsMin: -12, lufsMax: -9, truePeakMax: -1, lraMin: 4, lraMax: 9 },
    ],
  },
  {
    id: "rnb",
    labelFr: "R&B / Soul / Afro / Latin",
    labelEn: "R&B / Soul / Afro / Latin",
    subs: [
      { id: "rnb-soul", labelFr: "R&B / Soul", labelEn: "R&B / Soul", lufsMin: -13, lufsMax: -10, truePeakMax: -1, lraMin: 5, lraMax: 10 },
      { id: "afro-latin", labelFr: "Afrobeats / Reggaeton / Latin", labelEn: "Afrobeats / Reggaeton / Latin", lufsMin: -10, lufsMax: -7, truePeakMax: -1, lraMin: 3, lraMax: 7 },
    ],
  },
  {
    id: "electronic",
    labelFr: "Électronique / Club",
    labelEn: "Electronic / Club",
    subs: [
      { id: "house-techno", labelFr: "House / Tech House / Techno", labelEn: "House / Tech House / Techno", lufsMin: -10, lufsMax: -7, truePeakMax: -0.5, lraMin: 4, lraMax: 8 },
      { id: "edm-bass", labelFr: "EDM / Big Room / Dubstep / Bass", labelEn: "EDM / Big Room / Dubstep / Bass", lufsMin: -8, lufsMax: -5, truePeakMax: -0.5, lraMin: 3, lraMax: 6 },
      { id: "dnb", labelFr: "Drum & Bass", labelEn: "Drum & Bass", lufsMin: -8, lufsMax: -6, truePeakMax: -0.5, lraMin: 3, lraMax: 7 },
      { id: "trance", labelFr: "Trance / Progressive", labelEn: "Trance / Progressive", lufsMin: -10, lufsMax: -8, truePeakMax: -1, lraMin: 5, lraMax: 9 },
      { id: "ambient", labelFr: "Ambient / Downtempo", labelEn: "Ambient / Downtempo", lufsMin: -20, lufsMax: -14, truePeakMax: -1, lraMin: 8, lraMax: 18 },
    ],
  },
  {
    id: "rock",
    labelFr: "Rock / Metal",
    labelEn: "Rock / Metal",
    subs: [
      { id: "indie-alt-rock", labelFr: "Indie / Alt Rock", labelEn: "Indie / Alt Rock", lufsMin: -12, lufsMax: -10, truePeakMax: -1, lraMin: 6, lraMax: 10 },
      { id: "hard-metal", labelFr: "Hard Rock / Metal moderne", labelEn: "Hard Rock / Modern Metal", lufsMin: -10, lufsMax: -6, truePeakMax: -1, lraMin: 3, lraMax: 8 },
      { id: "classic-rock", labelFr: "Classic Rock", labelEn: "Classic Rock", lufsMin: -13, lufsMax: -10, truePeakMax: -1, lraMin: 7, lraMax: 12 },
    ],
  },
  {
    id: "acoustic",
    labelFr: "Acoustique / Jazz / Classique",
    labelEn: "Acoustic / Jazz / Classical",
    subs: [
      { id: "acoustic-folk", labelFr: "Acoustique / Folk / Singer-songwriter", labelEn: "Acoustic / Folk / Singer-songwriter", lufsMin: -18, lufsMax: -12, truePeakMax: -1, lraMin: 6, lraMax: 14 },
      { id: "jazz-classical", labelFr: "Jazz / Classique", labelEn: "Jazz / Classical", lufsMin: -22, lufsMax: -16, truePeakMax: -1, lraMin: 10, lraMax: 25 },
    ],
  },
  {
    id: "cinematic",
    labelFr: "Cinématique",
    labelEn: "Cinematic",
    subs: [
      { id: "score-trailer", labelFr: "Score / Trailer", labelEn: "Score / Trailer", lufsMin: -22, lufsMax: -10, truePeakMax: -1, lraMin: 8, lraMax: 25 },
    ],
  },
  {
    id: "broadcast",
    labelFr: "Broadcast / Podcast",
    labelEn: "Broadcast / Podcast",
    subs: [
      { id: "podcast", labelFr: "Podcast", labelEn: "Podcast", lufsMin: -17, lufsMax: -15, truePeakMax: -1, lraMin: 4, lraMax: 9 },
      { id: "ebu-r128", labelFr: "Broadcast EBU R128", labelEn: "Broadcast EBU R128", lufsMin: -24, lufsMax: -22, truePeakMax: -1, lraMin: 5, lraMax: 20 },
      { id: "netflix", labelFr: "Netflix / OTT (dialog)", labelEn: "Netflix / OTT (dialog)", lufsMin: -28, lufsMax: -26, truePeakMax: -2, lraMin: 6, lraMax: 20 },
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
  /** 1 to 2 short observational lines, ready to display */
  lines: string[];
  verdict: LoudnessVerdict;
  truePeakOk: boolean;
};

const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "–");
const fmtTp = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "–");

const PLR_CRITICAL = 5; // dB — below this, limiter is objectively over-pushed
const LRA_COLLAPSE_MARGIN = 2; // LU below the genre floor
const TP_TOLERANCE_DB = 0.1; // dB — TP measurement noise floor; below this no alert

/**
 * Build a concise (1-2 lines, observational) interpretation for the given
 * measurement relative to the chosen subgenre target.
 *
 * Implicit context: pro engineer, lossless workflow, streaming + physical
 * delivery. No codec-related warnings ever (no AAC/MP3 mentions).
 *
 * Editorial frame:
 * - Line 1 (always): qualitative reading of density / macro dynamics.
 *   The numeric LUFS gap vs target is NOT repeated here — it is already
 *   shown in the interpretation box header.
 * - Line 2 (only if objectively warranted): single technical alert,
 *   priority TP ≥ 0 > TP > genre target > PLR < 5 > LRA collapsed.
 *   PLR is never qualified ("healthy", "aggressive", etc.) outside that alert.
 */
export const buildInterpretation = (
  measurement: { lufs: number; truePeakDb: number; loudnessRange: number; plr: number },
  sub: SubGenreTarget,
  lang: "fr" | "en",
): LoudnessInterpretation => {
  const { lufs, truePeakDb, loudnessRange, plr } = measurement;
  const tolerance = 1; // LU before we speak of an actual gap

  let verdict: LoudnessVerdict;
  let mainLine: string;

  if (lufs > sub.lufsMax + tolerance + 2) {
    verdict = "above";
    mainLine = lang === "fr"
      ? "Densité au-delà des références récentes du sous-genre."
      : "Density beyond recent references for the subgenre.";
  } else if (lufs > sub.lufsMax + tolerance) {
    verdict = "above";
    mainLine = lang === "fr"
      ? "Densité dans la zone haute du sous-genre, lecture cohérente avec les références récentes."
      : "Density in the upper zone of the subgenre, consistent with recent references.";
  } else if (lufs < sub.lufsMin - tolerance - 2) {
    verdict = "below";
    mainLine = lang === "fr"
      ? "Macro-dynamique nettement plus large que les références du sous-genre."
      : "Macro-dynamics noticeably wider than the subgenre's references.";
  } else if (lufs < sub.lufsMin - tolerance) {
    verdict = "below";
    mainLine = lang === "fr"
      ? "Lecture plus aérée que les références du sous-genre."
      : "More open reading than the subgenre's references.";
  } else {
    verdict = "in-range";
    mainLine = lang === "fr"
      ? "Densité dans la plage du sous-genre, dynamique macro et transitoires préservés."
      : "Density within the subgenre range, macro dynamics and transients preserved.";
  }

  const truePeakOk = truePeakDb <= sub.truePeakMax;
  const lines = [mainLine];

  // Single technical alert by descending priority
  let alert: string | null = null;
  if (Number.isFinite(truePeakDb) && truePeakDb >= 0) {
    alert = lang === "fr"
      ? `True peak ${fmtTp(truePeakDb)} dBTP : clipping inter-sample mesuré.`
      : `True peak ${fmtTp(truePeakDb)} dBTP: inter-sample clipping measured.`;
  } else if (truePeakDb > sub.truePeakMax + TP_TOLERANCE_DB) {
    alert = lang === "fr"
      ? `True peak ${fmtTp(truePeakDb)} dBTP, légèrement au-dessus de la convention du sous-genre (${sub.truePeakMax} dBTP) ; aucun clipping inter-sample mesuré.`
      : `True peak ${fmtTp(truePeakDb)} dBTP, slightly above the subgenre convention (${sub.truePeakMax} dBTP); no inter-sample clipping measured.`;
  } else if (Number.isFinite(plr) && plr < PLR_CRITICAL) {
    alert = lang === "fr"
      ? `PLR ${fmt(plr)} dB : transitoires fortement écrasés, signature d'un limiteur très poussé.`
      : `PLR ${fmt(plr)} dB: transients heavily crushed, signature of a very pushed limiter.`;
  } else if (
    sub.lraMin !== undefined &&
    Number.isFinite(loudnessRange) &&
    loudnessRange < sub.lraMin - LRA_COLLAPSE_MARGIN
  ) {
    alert = lang === "fr"
      ? `LRA ${fmt(loudnessRange)} LU vs ≥ ${sub.lraMin} LU typique : macro-dynamique très resserrée pour le sous-genre.`
      : `LRA ${fmt(loudnessRange)} LU vs ≥ ${sub.lraMin} LU typical: macro-dynamics very tight for the subgenre.`;
  }

  if (alert) lines.push(alert);

  return { lines, verdict, truePeakOk };
};

## Refonte interprétation Loudness + correctif axe temps PDF

### 1. Consolidation des genres (`src/lib/loudnessTargets.ts`)

Liste resserrée à ~15 entrées :

- **Hip-Hop / Urbain** : *Hip-Hop / Trap / Drill* (-8.5…-7), *Boom Bap / Lo-fi* (-13…-10).
- **Pop** : *Pop / Dance-Pop* (-10…-7), *Indie / Synthpop* (-12…-9).
- **R&B / Soul / Afro / Latin** : *R&B / Soul* (-13…-10), *Afrobeats / Reggaeton / Latin* (-10…-7).
- **Électronique / Club** : *House / Tech House / Techno* (-10…-7), *EDM / Big Room / Dubstep / Bass* (-8…-5), *Drum & Bass* (-8…-6), *Trance / Progressive* (-10…-8), *Ambient / Downtempo* (-20…-14).
- **Rock / Metal** : *Indie / Alt Rock* (-12…-10), *Hard Rock / Metal moderne* (-10…-6), *Classic Rock* (-13…-10).
- **Acoustique / Jazz / Classique** : *Acoustique / Folk / Singer-songwriter* (-18…-12), *Jazz / Classique* (-22…-16).
- **Cinématique** : *Score / Trailer* (-22…-10).
- **Broadcast** : *Podcast* (-17…-15), *Broadcast EBU R128* (-24…-22), *Netflix / OTT dialog* (-28…-26).

True peak : -1 dBTP par défaut, **-0.5 dBTP** pour genres club denses (House/Techno, EDM/Bass, D&B, Dubstep).

### 2. Sélecteur de genre épuré (`src/pages/Loudness.tsx`)

Supprimer l'affichage `{lufsMin}…{lufsMax} LUFS` à droite du nom dans `<SelectItem>`.

### 3. Box d'interprétation : en-tête + ton apaisé, conscient du contexte pro

**En-tête enrichi** :

```
Interprétation · House / Tech House / Techno · cible -10…-7 LUFS · TP ≤ -0.5 dBTP
```

**Refonte de `buildInterpretation`** — l'IA part du principe implicite que l'utilisateur est un pro travaillant en **format sans perte (WAV/AIFF/FLAC)** pour **plateformes streaming + supports physiques** :

- **Une seule ligne** observationnelle, jamais prescriptive.
- Pas de répétition de la mesure brute / delta (visibles dans le panneau LUFS).
- **Tolérance ±1 LU** avant tout commentaire d'écart.
- **Aucune mention codec lossy** (MP3/AAC/Opus) — hors périmètre.
- **Aucune mention support** (CD/vinyle/streaming) dans la phrase — c'est implicite, on s'adresse à des pros.
- TP dans la zone tolérée → **silence**.
- TP au-dessus → mention factuelle neutre, sans injonction.

**Grille de tournures (FR)** :

| Situation | Phrase |
|---|---|
| Dans la plage (±1 LU) | "Cohérent avec les références actuelles du genre." |
| Légèrement au-dessus | "Densité un peu supérieure aux références récentes — choix artistique défendable." |
| Très au-dessus (>+1.5 LU) | "Master très dense ; à comparer en A/B avec une référence avant validation." |
| Légèrement en-dessous | "Légèrement plus aéré que les références — peut servir l'arrangement." |
| Très en-dessous (>1.5 LU) | "Plus dynamique que les standards actuels du genre ; à valider selon l'intention." |
| TP > tolérance | "True peak {x} dBTP : marge de sécurité serrée." |
| LRA très resserré (>2 LU sous le typique) | "Dynamique resserrée — vérifier la lecture des transitoires." |

Suppression du disclaimer `loudness.interpretationDisclaimer`.

### 4. Box "Cibles plateformes" (streaming + broadcast uniquement)

Placée après les 4 cartes de mesure, avant la carte CTA.

| Plateforme | Cible | True peak max |
|---|---|---|
| Spotify | -14 LUFS | -1 dBTP |
| Apple Music | -16 LUFS | -1 dBTP |
| Tidal | -14 LUFS | -1 dBTP |
| YouTube Music | -14 LUFS | -1 dBTP |
| Amazon Music | -14 LUFS | -2 dBTP |
| Deezer | -15 LUFS | -1 dBTP |
| SoundCloud | non normalisé | -1 dBTP |
| Beatport | non normalisé | -1 dBTP |
| Broadcast EBU R128 | -23 LUFS ±1 | -1 dBTP |
| Netflix (dialog) | -27 LKFS ±2 | -2 dBTP |

(**Pas** de ligne CD ni vinyle, comme demandé.)

Note discrète sous le tableau : "Le streaming normalise à la lecture ; un master plus fort sera baissé sans perte de qualité."

### 5. Correctif axe temps de la courbe LUFS du rapport PDF (`src/pages/Loudness.tsx`, fonction `drawPdfLoudnessCurve`)

Actuellement (ligne 114) :
```js
report.text(`${formatDuration(0)}                     ${formatDuration(timeMax / 2)}                     ${formatDuration(timeMax)}`, plot.left, y + height - 4);
```

→ Trois marqueurs grossièrement espacés par des espaces, **non alignés** sur les positions x réelles de la courbe.

**Nouvelle logique** :

1. Construire un tableau de ticks :
   - `0` (toujours)
   - chaque minute pleine : `60`, `120`, `180`, … tant que `tick < timeMax - 5` (pour éviter chevauchement avec la fin)
   - `timeMax` (toujours, formaté `M:SS` exact, ex. `4:28`)
2. Pour chaque tick, calculer la position x exacte :
   ```js
   const tx = plot.left + (tick / timeMax) * (plot.right - plot.left);
   ```
3. Dessiner :
   - une petite graduation verticale de 1.5 mm sous l'axe à `tx, plot.bottom`
   - le label `formatDuration(tick)` centré sous la graduation (`textAnchor` simulé via décalage `-textWidth/2`, jsPDF supporte `align: "center"` dans `text()`)
4. Si le morceau dure < 60 s, n'afficher que `0:00` et la durée finale.
5. Si la durée finale est à moins de 5 s d'un tick minute (ex. 3:58 vs 3:00), supprimer ce tick minute pour éviter le chevauchement et ne garder que `0:00`, les minutes précédentes et la fin exacte.

**Code prévu** :
```js
const buildTicks = (timeMax: number): number[] => {
  const ticks: number[] = [0];
  for (let m = 60; m < timeMax - 5; m += 60) ticks.push(m);
  if (timeMax > 1) ticks.push(timeMax);
  return ticks;
};
const ticks = buildTicks(timeMax);
report.setTextColor(150, 158, 170);
report.setFontSize(6.5);
ticks.forEach((tick) => {
  const tx = plot.left + (tick / timeMax) * (plot.right - plot.left);
  report.setDrawColor(80, 88, 98);
  report.line(tx, plot.bottom, tx, plot.bottom + 1.5);
  report.text(formatDuration(tick), tx, y + height - 4, { align: "center" });
});
```

Cela garantit que `0:00`, chaque `M:00` intermédiaire et la durée exacte (`4:28`, etc.) sont **précisément alignés** sur la courbe.

### 6. i18n (`fr.json` + `en.json`)

- Libellés des sous-genres consolidés.
- Réécriture `loudness.interpretation.*` (formulations observationnelles, sans codec, sans support).
- Suppression `loudness.interpretationDisclaimer`.
- Ajout `loudness.platformTargets.title`, `loudness.platformTargets.rows.*` (label/lufs/tp), `loudness.platformTargets.note`.

### Détails techniques

**Fichiers modifiés** :
- `src/lib/loudnessTargets.ts` — fusion sous-genres, TP -0.5 dBTP pour club, refonte `buildInterpretation` (1 ligne, observationnel, ±1 LU, zéro mention codec/support).
- `src/pages/Loudness.tsx` — sélecteur épuré, en-tête interprétation enrichi, suppression disclaimer, nouvelle box "Cibles plateformes" (streaming + broadcast), **correctif `drawPdfLoudnessCurve`** : ticks temps précis (`0:00`, minutes pleines, fin exacte) alignés sur la courbe.
- `src/i18n/locales/fr.json` + `en.json` — clés interprétation + section plateformes.

**Pas de changement** : moteur d'analyse BS.1770, structure des cartes de mesures, courbe SVG à l'écran (déjà correcte ligne 368-371).
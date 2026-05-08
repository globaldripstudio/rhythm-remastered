## Objectif

Fiabiliser la mesure True Peak (TP) et corriger la fausse alerte "marge de sécurité serrée" déclenchée sur des dépassements de l'ordre du centième de dB (bruit de mesure).

## Constat

- L'estimateur TP actuel (`src/pages/Loudness.tsx`, `estimateTruePeak`) fait du **suréchantillonnage ×4 par interpolation cubique Catmull-Rom**. C'est une approximation rapide mais **non conforme à ITU-R BS.1770** qui spécifie un **filtre polyphase FIR** sur ×4. L'erreur typique de la cubique peut atteindre 0.1–0.3 dB selon le matériau (sous-estimation ou sur-estimation des pics inter-sample).
- L'alerte TP se déclenche dès que `truePeakDb > sub.truePeakMax` (comparaison stricte). Combinée à l'arrondi d'affichage à 1 décimale, on alerte sur des écarts invisibles à l'oeil (-0.47 dBTP affiché "-0.5", cible "-0.5", alerte déclenchée).
- Formulation actuelle ("marge de sécurité serrée par rapport à la cible") sonne injonctive et peut laisser croire qu'il faut baisser le ceiling, alors que le master peut être parfaitement dans les clous.

## Changements

### 1. Améliorer la précision de la mesure TP — `src/pages/Loudness.tsx`

Remplacer `estimateTruePeak` par une implémentation conforme **ITU-R BS.1770-4 Annexe 2** :

- Suréchantillonnage **×4** via **filtre polyphase FIR** (4 sous-filtres de ~12 taps, fenêtre Kaiser, coupure ~20 kHz à fs source).
- Coefficients pré-calculés en constante module (4 × 12 = 48 floats).
- Recherche du pic absolu sur le signal suréchantillonné de chaque canal.
- Fallback : si la longueur du canal < taille filtre, on retombe sur le sample peak.

Précision attendue : ±0.05 dB sur les pics inter-sample, conforme à ce qu'affichent les outils pros (iZotope Insight, Youlean, Nugen MasterCheck).

### 2. Tolérance d'alerte TP — `src/lib/loudnessTargets.ts`

Introduire `TP_TOLERANCE_DB = 0.1` :

- L'alerte "TP au-dessus de la cible du genre" ne se déclenche que si `truePeakDb > sub.truePeakMax + TP_TOLERANCE_DB`.
- En dessous de ce seuil : pas d'alerte (on est dans le bruit de mesure résiduel).
- L'alerte `truePeakDb >= 0` (clipping inter-sample mesuré, faute objective) **reste stricte, inchangée**.

### 3. Affichage 2 décimales uniquement dans la ligne d'alerte TP — `src/lib/loudnessTargets.ts`

- Header de l'interprétation et bloc de mesures : **inchangés** (1 décimale, `result.truePeakDb.toFixed(1)`).
- Dans la ligne d'alerte TP (et seulement là), afficher 2 décimales pour qu'un dépassement signalé soit *visiblement* un dépassement.
- Helper local `fmtTp(v)` → `v.toFixed(2)`.

### 4. Reformuler la ligne TP > cible — `src/lib/loudnessTargets.ts`

Remplacer la formulation actuelle ("marge de sécurité serrée par rapport à la cible du sous-genre") par une lecture **informative et non injonctive**, mentionnant la convention du sous-genre sans suggérer d'action :

- FR : `True peak {x.xx} dBTP, légèrement au-dessus de la convention du sous-genre ({cible} dBTP) ; aucun clipping inter-sample mesuré.`
- EN : `True peak {x.xx} dBTP, slightly above the subgenre convention ({target} dBTP); no inter-sample clipping measured.`

### 5. Ce qu'on ne touche pas

- Mesure LUFS, LRA, PLR, courbes, en-tête de cibles, mode neutre, valeurs par sous-genre.
- Alerte TP ≥ 0 dBTP (clipping mesuré).
- Alertes PLR < 5 et LRA effondré.
- UI de la page Loudness, i18n existante.

## Validation

- `tsc --noEmit` doit passer (vérification automatique du build).
- Test mental sur le cas utilisateur : master ceilé à -0.6 dBFS, TP réel ~-0.55 dBTP, cible -0.5 → **plus d'alerte** (sous tolérance 0.1).
- Cas TP = -0.35 dBTP, cible -0.5 → alerte affichée "-0.35 dBTP" (2 décimales), formulation neutre.
- Cas TP = +0.2 dBTP → alerte stricte "clipping inter-sample mesuré" (inchangé).
- Cohérence visuelle : pas de double affichage de TP avec décimales différentes dans le même bloc (header reste 1 déc., alerte 2 déc., justifié par la précision de l'événement signalé).

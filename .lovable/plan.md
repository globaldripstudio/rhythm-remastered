# Saisie manuelle + détection d'accords renforcée

## Pourquoi la détection actuelle échoue souvent

Trois causes structurelles, indépendantes de la qualité du fichier :

1. **BPM** — l'autocorrélation/tempogramme sur le flux spectral repère une *périodicité*, pas un *tempo musical*. Sur un plaqué d'accords (pas de transitoires nets), un arpège syncopé, ou un morceau à grosse réverbe, le pic dominant tombe souvent sur une subdivision (croches → x2) ou sur le rythme harmonique (changement d'accord toutes les 2 mesures → /2 voire /4). La désambiguïsation x2/x/2 actuelle suppose une fenêtre 70-180 BPM, ce qui marche pour la pop mais rate le jazz lent ou la dance rapide.
2. **Tonalité** — Krumhansl-Schmuckler corrèle un chroma global à 24 profils. Si le morceau module, contient des emprunts modaux, ou si la basse domine le chroma (très fréquent), le tonique détecté est souvent le V ou le vi. Le revote par les notes Basic Pitch n'aide pas si Basic Pitch a lui-même halluciné.
3. **Accords** — les templates actuels sont des vecteurs binaires 12-bins. Ils ignorent :
   - **la basse** (un C/E n'est pas un C),
   - **les harmoniques** (un C majeur excite aussi G et E aigus → ressemble à C7 ou Cadd9),
   - **la cohérence temporelle** (un accord ne change pas tous les 500 ms — un lisseur Viterbi/HMM est indispensable),
   - **la tonalité** (un Bdim dans C majeur est plus probable qu'un Bb augmenté).

C'est rattrapable sans librairie externe, en gardant tout client-side.

## Plan

### 1. Saisie manuelle BPM et tonalité (UI)

Dans `AudioToMidi.tsx`, sous le bandeau de résultats actuels (BPM, tonalité, Camelot), ajouter une zone éditable :

```text
┌─────────────────────────────────────────────────────────┐
│ Tonalité détectée : C minor (62%)    [✎ Corriger]      │
│ BPM détecté       : 92.4 (48%)       [✎ Corriger]      │
└─────────────────────────────────────────────────────────┘
```

Au clic sur *Corriger* :
- Tonalité : un `Select` (12 toniques × 2 modes = 24 options) + bouton "Réinitialiser".
- BPM : un `Input` numérique (40-240, pas 0.1) + bouton "÷2" / "×2" / "Réinitialiser".

Comportement :
- L'override force `keyResult` / `bpmResult` avec `confidence = 1.0` (verrouillé).
- Re-déclenche **automatiquement** : détection d'accords (qui dépend du BPM pour la segmentation), puis post-process (qui dépend des accords + tonalité).
- Indicateur visuel "verrouillé manuellement" (icône cadenas) tant que l'utilisateur n'a pas réinitialisé.
- État stocké en `useState`, pas de persistance disque.

### 2. Détection d'accords renforcée

Refonte de `src/lib/audioToMidi/chordDetection.ts` autour de 4 améliorations qui se cumulent.

#### 2.a Chroma plus propre : CRP (Chroma DCT-Reduced log Pitch)

Au lieu d'un chroma magnitude brut :
- Spectre log-magnitude par bin de pitch (CQT-like via banque de filtres bandlimités centrés sur chaque demi-ton de C1 à C7).
- Compression logarithmique → DCT → on garde les coefficients 50-120 → IDCT.
- Repliement en 12 pitch classes.

Effet : supprime le timbre (les harmoniques d'un piano disparaissent), garde la couleur harmonique. C'est ce qui fait que MIR distingue C de Cmaj7.

#### 2.b Séparation basse / médium

Deux chromas :
- `chromaBass` : 40-250 Hz (E1-B3) → identifie la fondamentale réelle / le renversement.
- `chromaMid`  : 250-2000 Hz → identifie la qualité (tierce, septième, extensions).

Le score d'un accord devient : `0.4 × cos(chromaBass, bassTemplate) + 0.6 × cos(chromaMid, qualityTemplate)`.

Permet de détecter les renversements (C/E, C/G) et de pondérer correctement les accords avec basse dissonante.

#### 2.c Templates étendus + harmoniques

Templates passés à 13 qualités : maj, min, dim, aug, sus2, sus4, 7, maj7, min7, m7b5, dim7, 6, m6. Au lieu de vecteurs binaires, chaque template inclut **les harmoniques attendues** :

```text
C major template (idéal) = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0]
C major + harmoniques    = [1.0, 0, 0, 0, 0.6, 0, 0, 0.55, 0, 0, 0.15, 0.1]
```

(coefficients dérivés du théorème de Fourier pour les 6 premières harmoniques de C, E, G, normalisés).

Effet : les "faux positifs C7" sur un simple C disparaissent, parce que le template C major prédit déjà la présence d'un peu de Bb (10e harmonique faible).

#### 2.d Lissage temporel Viterbi

Au lieu d'élire l'accord segment par segment :
- Sur la grille (1 segment par temps avec `beatsPerSegment = 1`), calculer pour chaque segment le **vecteur de log-vraisemblance** sur tous les accords candidats (12 × 13 = 156).
- Matrice de transition `P(chord_{t+1} | chord_t)` :
  - rester sur le même accord : `0.6` (les accords durent),
  - transitions cohérentes dans la tonalité (I→V, vi→IV, ii→V…) : `0.05` chacune,
  - autres transitions : `0.001`.
- Viterbi → chemin optimal d'accords.
- Re-merge des segments consécutifs identiques.

Effet : disparition des "flickers" (un C qui devient F pendant 1 temps puis revient C). C'est la vraie raison pour laquelle Chordify et consorts paraissent magiques.

### 3. Couplage tonalité ↔ accords

Boucle de cohérence en deux passes :

1. Passe 1 : tonalité depuis chroma global, accords avec transitions uniformes.
2. **Re-vote tonalité depuis la liste d'accords** : histogramme des fondamentales d'accords pondéré par durée → détermine la tonalité plus fiablement que le chroma brut. Si concordance avec passe 1 → confiance haute. Sinon, on garde la version "accords" (plus parlante musicalement) et on baisse la confiance affichée.
3. Passe 2 : Viterbi avec matrice de transition diatonique basée sur la tonalité retenue.

Si l'utilisateur override la tonalité (section 1), on saute directement à la passe 2 avec sa valeur.

### 4. Fichiers touchés

```text
src/components/tools/AudioToMidi.tsx     — UI override BPM/tonalité + re-déclenchement
src/lib/audioToMidi/chordDetection.ts    — CRP, double chroma, templates harmoniques, Viterbi
src/lib/audioToMidi/musicalContext.ts    — re-vote tonalité depuis accords, 2 passes
src/i18n/locales/{fr,en}.json            — libellés "Corriger / Réinitialiser / Verrouillé"
```

Pas de nouveau fichier, pas de nouvelle dépendance npm.

### 5. Hors scope

- Modulation détectée (changement de tonalité au sein du morceau) — phase ultérieure.
- Détection de mesure (4/4 vs 3/4 vs 6/8) — toujours phase ultérieure.
- Saisie manuelle d'une grille d'accords — l'override BPM/tonalité couvre 90 % des cas problématiques.

### 6. Vérification

Test manuel sur les 5 fichiers du jeu de référence du plan précédent + un cas piano avec basse renversée (vise détection du renversement) + un cas modulant (vise downgrade de confiance plutôt que faux tonique). Debug via `localStorage.audio2midiDebug = "1"` qui logge maintenant la matrice Viterbi top-3 et le détail des deux chromas.

## Effort

~600 lignes ajoutées/modifiées. Faisable en une itération. Le gros morceau est le Viterbi (~150 lignes propres), le reste est de l'extension incrémentale des fonctions existantes.

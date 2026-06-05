# Refonte du moteur Audio → MIDI

## Diagnostic honnête

L'implémentation actuelle empile trois faiblesses qui se renforcent :

1. **Basic Pitch seul** est un modèle généraliste calibré sur du piano solo. Sur des accords plaqués, des pads, ou des arrangements denses, il fragmente les notes, hallucine des octaves, et rate les harmonies tenues.
2. **Détection de tonalité** : Krumhansl-Schmuckler appliqué au spectre brut (chroma du signal complet) est très bruité dès qu'il y a percussions, basse, ou réverbération.
3. **Détection de BPM** : l'autocorrélation sur le flux spectral brut confond souvent x2 / x/2 et échoue sur les morceaux sans batterie franche (justement les plaqués d'accords).
4. **Post-process tonal** dépend de la tonalité détectée — donc quand la tonalité est fausse, il *aggrave* le résultat.

Les toggles ne sont pas le problème de fond. Le problème est qu'on demande à 4 modules indépendants de bien marcher en parallèle, alors qu'ils devraient se nourrir l'un l'autre.

## Principe directeur du correctif

**Chaîne en cascade** : chaque étape consomme la sortie validée de la précédente et augmente la robustesse globale.

```text
audio ─┬─► HPSS (harmonique / percussif)
       │       │
       │       ├─► percussif ─► BPM (onsets percussifs) ──┐
       │       │                                          │
       │       └─► harmonique ─► chroma-CQT ──┬─► tonalité (depuis chroma stable)
       │                                      │
       │                                      └─► accords (template match)
       │
       └─► Basic Pitch (sur harmonique) ─► notes brutes
                                              │
                                              ▼
                       post-process informé par {tonalité, BPM, accords}
                                              │
                                              ▼
                                         notes finales
```

Trois gains :
- Le BPM est calculé sur la piste percussive (ou les onsets harmoniques si pas de drums), pas sur le signal complet → fini les confusions x2.
- La tonalité vient du **chroma de la piste harmonique** + une corroboration par les notes détectées (vote pondéré par durée × vélocité) → beaucoup plus stable.
- Les accords sortent du même chroma, alignés sur la grille BPM → on peut afficher une grille d'accords et l'utiliser pour valider/corriger les notes Basic Pitch.

## Plan d'implémentation (4 étapes)

### Étape 1 — Séparation harmonique/percussive (HPSS)

Nouveau fichier `src/lib/audioToMidi/hpss.ts`.

Implémentation classique par filtres médians sur le spectrogramme STFT :
- STFT (FFT 2048, hop 512) → magnitude
- Filtre médian horizontal (17 frames) → composante harmonique
- Filtre médian vertical (17 bins) → composante percussive
- Masques doux (ratio) → resynthèse iSTFT pour obtenir deux Float32Array

Léger (≈300 lignes JS, < 2s sur 3 min d'audio). Aucune dépendance externe.

### Étape 2 — Refonte BPM + tonalité

Nouveau fichier `src/lib/audioToMidi/musicalContext.ts`. Remplace l'usage de `analyzeAudioFile` dans `AudioToMidi.tsx`.

**BPM** :
- Onsets calculés sur la **piste percussive** par flux spectral + pic-picking adaptatif.
- Si la piste percussive est trop faible (énergie < seuil), fallback sur les onsets de Basic Pitch (déjà calculés !) ce qui résout le cas "plaqués d'accords sans batterie".
- Autocorrélation tempogram 60–200 BPM, **désambiguïsation x2/x/2** via score de plausibilité (60–140 BPM favorisé sauf si pic strictement > 1.5× du concurrent).
- Confiance = (pic principal − médiane) / pic principal.

**Tonalité** :
- Chroma CQT (12 bins) sur la piste harmonique, moyenné sur tout le morceau **après seuillage des frames silencieuses**.
- Corrélation Krumhansl-Schmuckler sur ce chroma → top-3 candidats.
- Une fois Basic Pitch terminé, on **revote** : histogramme des pitch-classes des notes détectées pondéré par `durée × vélocité`, puis on re-corrèle. Les deux votes doivent concorder ; sinon confiance abaissée.
- Camelot conservé.

### Étape 3 — Reconnaissance d'accords

Nouveau fichier `src/lib/audioToMidi/chordDetection.ts`.

- Chroma CQT segmenté sur la grille BPM (1 accord par temps fort, ou par demi-mesure selon densité).
- Templates pour : maj, min, 7, maj7, min7, sus2, sus4, dim, aug (et inversions par rotation du chroma).
- Score de cohérence par segment → liste `{ startSec, endSec, root, quality, confidence }`.
- Affichée dans une nouvelle bande au-dessus du piano roll (réutilise les composants `ChordGrid` existants si possible).

Bonus : ce flux d'accords sert au post-process — on peut renforcer les notes qui appartiennent à l'accord du moment, atténuer celles qui sortent.

### Étape 4 — Post-process recalibré

Modifications dans `src/lib/audioToMidi/postProcess.ts` :

- **Nouveau pass "chord-aware"** : pour chaque note, on regarde l'accord actif. Note dans l'accord → gardée. Note hors accord avec vélocité < 30 % du max local **et** durée < 100 ms → retirée.
- **Pass octave-ghost** durci : ne déclenche que si l'octave inférieure existe ET fait partie de l'accord actif.
- **Snap to grid** : grille de croches (et non plus doubles-croches) par défaut, parce qu'à 120 BPM une fenêtre de ±15 ms en doubles est trop serrée. Tolérance ±20 ms.
- **Tonal filter** : remplacé par le chord-aware filter, plus précis.

L'UI des "Réglages avancés" reste minimaliste (juste le profil sonore comme demandé). Les passes tournent automatiquement, leur trace reste visible en debug.

## Détails techniques

- **Pas de nouvelles dépendances npm.** Tout est implémenté en TypeScript pur (FFT, filtre médian, CQT via banque de filtres bandlimités). Performance ciblée : < 4s d'analyse totale (HPSS + chroma + BPM + tonalité + accords) sur un morceau de 3 min, en sus de Basic Pitch.
- **Workers Web** : HPSS et CQT déportés dans un Web Worker pour ne pas bloquer le thread principal pendant que Basic Pitch tourne (qui lui occupe déjà le GPU/WASM).
- **Cache** : tous les artefacts intermédiaires (STFT, chroma, onsets percussifs) gardés en mémoire pour la durée du composant — permet de re-tourner le post-process instantanément quand l'utilisateur change de profil sonore.
- **Debug** : `localStorage.audio2midiDebug = "1"` logge à chaque étape les confidences, les top-3 candidats tonalité, le tempogram, et la matrice d'accords.

## Hors scope (Phase 2, après validation)

- Saisie manuelle BPM/tonalité par l'utilisateur (l'utilisateur l'a explicitement demandé en second temps).
- Quantization rythmique des notes sur la grille d'accords.
- Export d'un MIDI multi-pistes (mélodie + accords séparés).
- Détection de mesure (4/4 vs 3/4 vs 6/8).

## Vérification

Jeu de tests qualitatifs (manuels) sur 5 fichiers représentatifs :
1. Plaqués d'accords piano (cas qui échoue actuellement) — viser tonalité juste, BPM juste à ±2, accords corrects sur > 70 % des temps.
2. Mélodie monophonique nette — viser > 95 % des notes correctes.
3. Pad synthé tenu — viser absence de fragmentation excessive.
4. Morceau pop complet avec batterie — viser BPM exact, tonalité juste.
5. Morceau jazz avec accords étendus (maj7, min7) — viser détection de la qualité, pas seulement de la fondamentale.

Chaque test loggé via `audio2midiDebug` pour comparaison avant/après.

## Effort estimé

~1500 lignes de code TypeScript (FFT et filtres réutilisables), 4 nouveaux fichiers, 2 fichiers modifiés. Faisable en une itération si tu valides l'architecture. Sinon on peut faire étape par étape (HPSS + nouveau BPM d'abord, le reste ensuite).

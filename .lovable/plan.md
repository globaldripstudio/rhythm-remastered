# Correctif Chord Grid V2.1 + Prior prédictif

## 1. UI — retirer les mini pianos par carte

Dans `src/components/tools/ChordGrid.tsx` :
- Supprimer le mini `<PianoKeyboard>` rendu sous chaque `ChordTile`.
- Retirer imports et props devenus inutilisés.
- Conserver le clic = lecture du voicing piano, le badge de confiance, et l'édition manuelle.

## 2. Légende `°` / `ø` / `7` / `sus4` / `/X`

Mettre à jour la mini-légende du composant et `keybpm.chords.*` (`fr.json` + `en.json`) avec explications courtes :
- `°` diminué (rare hors classique/jazz), `°7` septième diminuée, `ø` demi-diminué (m7b5, ii jazz)
- `maj7` / `m7` / `7` / `sus4` / `/X` renversement basse

## 3. Corriger la régression "°7 partout" dans `src/lib/chordRecognition.ts`

**Cause racine** : `dim7` ([0,3,6,9]) est symétrique → 4 fondamentales possibles → devient un passe-partout avec les templates harmoniques V2. `dim` / `m7b5` souffrent du même biais. Pas de prior tonal/diatonique.

**Corrections** :

a. **Restreindre le set de qualités par défaut** à `{maj, min, maj7, m7, 7, sus4}`. `dim`, `m7b5`, `dim7`, `aug` ne sont autorisés que si gating dur : chaque PC de l'accord ≥ 0.7 × moyenne triade ET marge ≥ 0.08 sur le 2e candidat. Sinon, fallback sur le meilleur candidat du set par défaut.

b. **Prior diatonique** : bonus `+α` (~0.06) sur les templates dont la fondamentale appartient au diatonique de la tonalité ET dont la qualité est cohérente avec le degré (I/IV/V majeur, ii/iii/vi mineur, etc.). Malus `-β` (~0.04) sur les qualités exotiques hors contexte attendu.

c. **Étendre `refineSeventh`** à `dim7` et `m7b5` (fallback triade si 7ème faible).

d. **Augmenter `TRANS_PENALTY`** : 0.08 → 0.12 (réduit le flicker).

## 4. Prior prédictif (transition de Markov fonctionnel)

Idée : croiser le score acoustique avec la probabilité d'enchaînement, comme dans le builder guidé "Accords & Gamme".

### Données

Réutiliser `MAJOR_TRANSITIONS` / `MINOR_TRANSITIONS` de `src/lib/musicTheory/chords.ts` :
- Construire une table `transitionLogProb(prevDegree, nextDegree, mode)` :
  - Si `next ∈ TRANSITIONS[prev]` → log-prob alto (ex: `log(0.9 / |goods|)`)
  - Sinon → log-prob bas (ex: `log(0.05 / (12 - |goods|))`)
  - Cas spécial : `next === prev` reste autorisé mais sans bonus (continuation = neutre).
- Premier beat : pas de prior de transition (uniforme).

### Intégration dans le pipeline (Viterbi-lite étendu)

Dans `detectChords`, au moment du choix par beat, remplacer la sélection greedy actuelle par un Viterbi à 1er ordre sur le top-K candidats (K=6 déjà gardé) :

```
score_total(b, i) = max_j [ score_total(b-1, j)
                          + acoustic_score(b, i)
                          + γ · transition_logprob(j → i)
                          − (sameChord ? 0 : TRANS_PENALTY) ]
```

- γ ≈ 0.5 (poids du prior fonctionnel face au score acoustique).
- Backtrack standard à la fin pour récupérer la séquence optimale.
- Le `transition_logprob` se calcule en mappant la fondamentale du candidat vers son degré romain dans la tonalité du morceau (fonction `romanize` existante), puis en consultant la table.

### Effet attendu

- Élimine de facto les enchaînements peu probables (ex: `Imaj7 → bII°7` en majeur).
- Privilégie les cadences naturelles (V→I, IV→V, ii→V).
- Compatible avec les modulations existantes : si le morceau module, le moteur de modulation actuel (fenêtre 8 bars) peut être consulté pour rebaser la tonalité utilisée par le prior — v1 : on garde la tonalité globale, on traitera la modulation comme amélioration ultérieure si nécessaire.

### Garde-fou

- Le prior est appliqué **après** le filtrage de qualités exotiques (étape 3a), pas avant : on ne veut pas qu'un mauvais candidat `dim7` soit "sauvé" par un prior bidon.
- Si la confiance acoustique est très haute (margin_norm > 0.5), réduire γ (ex: γ·(1 − margin_norm)) pour ne pas écraser un signal franc par la théorie.

## 5. Re-calibrage confiance

Pas de changement de formule. Avec les filtres + prior, la marge `best − second` augmente sur matériel tonal → 3/3 (`●●●`) devient effectivement atteignable.

## Fichiers touchés

- `src/components/tools/ChordGrid.tsx` (UI)
- `src/lib/chordRecognition.ts` (filtrage qualités, prior diatonique, Viterbi + transition prior, refineSeventh étendu)
- `src/lib/musicTheory/chords.ts` (exposer une fonction `transitionLogProb(prev, next, mode)` réutilisable)
- `src/i18n/locales/fr.json` + `en.json` (légende)

## Hors scope

- Export MIDI, édition manuelle, lecture au clic, renversements, modulations : inchangés.
- Pas de nouvelle dépendance, pas de prior Markov appris (on garde la grammaire fonctionnelle codée à la main, alignée sur le builder).

## Objectif

Affiner le groupe **Hip-Hop / Urbain** dans `src/lib/loudnessTargets.ts` en 3 sous-genres distincts au lieu de 2, et harmoniser les éventuelles mentions chiffrées dans le contenu SEO/FAQ de `Loudness.tsx`.

## Modifications

### 1. `src/lib/loudnessTargets.ts`

Remplacer les 2 sous-genres actuels du groupe `hiphop` par 3 :

| ID | Label FR | Label EN | LUFS min | LUFS max | TP max | LRA min | LRA max |
|---|---|---|---|---|---|---|---|
| `hiphop-trap` | Trap (US / FR) | Trap (US / FR) | -9 | -7.5 | -1 | 3 | 7 |
| `hiphop-drill` | Drill (UK / NY) | Drill (UK / NY) | -10 | -8 | -1 | 4 | 8 |
| `hiphop-boombap` | Boom Bap / Lo-fi | Boom Bap / Lo-fi | -13 | -10 | -1 | 5 | 10 |

Justification :
- **Trap -9 à -7.5** : couvre la fourchette réelle des sorties commerciales (Future, 21 Savage, Ninho, Gazo, Tiakola). On ne pousse plus implicitement à -7 fixe.
- **Drill -10 à -8** : sub-bass UK/NY drill nécessite plus d'air, mesures réelles confirment.
- **Boom Bap / Lo-fi** : élargi pour englober Griselda, MIKE, Earl, lo-fi instrumental.

### 2. Vérifications de cohérence

- Grep `hiphop-trap-drill` dans tout `src/` (sélection par défaut, persistance localStorage, traductions). Rebrancher les usages sur `hiphop-trap`.
- Vérifier `Loudness.tsx`, `LoudnessEn.tsx`, `i18n/locales/{fr,en}.json`.

### 3. Mise à jour cohérence éditoriale

- Repérer dans `Loudness.tsx` (intro, FAQ, JSON-LD `HowTo`) les mentions chiffrées de cibles Trap/Drill et les aligner sur les nouvelles plages.
- Idem pour `LoudnessEn.tsx` si du contenu textuel y est dupliqué.

## Hors-scope

- Logique `buildInterpretation` (seuils PLR/LRA/TP inchangés).
- Aucun autre groupe de genre touché.

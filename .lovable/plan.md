
# Fiabilisation de l'analyse Audio → MIDI

## Principe directeur

Zéro saisie utilisateur par défaut. L'outil reste un drag & drop → résultat. Tout ce qui est ajouté tourne automatiquement, et tout est désactivable via un panneau "Avancé" replié.

On **ne touche pas** au moteur Basic Pitch lui-même (modèle Spotify, gardé tel quel) ni à l'export MIDI. On agit uniquement en **amont** (réglage des seuils selon le matériau) et en **aval** (nettoyage des notes sorties).

## Étape 1 — Préréglages automatiques selon le matériau

Avant d'appeler Basic Pitch, on fait une **passe rapide d'analyse spectrale** (~200 ms) sur les 10 premières secondes du fichier pour estimer :
- Densité polyphonique (mono / accords légers / accords denses).
- Brillance / quantité de transitoires sales (détecte le bitcrush, la saturation, le bruit).
- Niveau de bruit de fond.

À partir de ça, on choisit automatiquement un préréglage de seuils :

| Profil détecté            | onsetThreshold | frameThreshold | minNoteDurationMs |
|---------------------------|----------------|----------------|-------------------|
| Mélodie monophonique propre | 0.55         | 0.40           | 80                |
| Piano / clavier clean     | 0.65           | 0.45           | 100               |
| Piano sale / bitcrushé    | 0.78           | 0.55           | 150               |
| Accords denses / pad      | 0.60           | 0.50           | 180               |

Le profil retenu est affiché discrètement sous le résultat ("Profil détecté : piano sale — modifier"), et l'utilisateur peut basculer vers un autre profil en un clic s'il n'est pas content. Pas de champ à remplir.

## Étape 2 — Post-traitement musical automatique

Après Basic Pitch, on enchaîne 4 passes de nettoyage. Toutes tournent par défaut, toutes peuvent être désactivées individuellement dans le panneau Avancé (replié).

**Passe A — Filtre d'octaves fantômes**
Pour chaque note, si une note à l'octave supérieure démarre dans une fenêtre de ±30 ms, avec vélocité ≤ 40 % et durée ≤ 50 % de la note fondamentale → c'est très probablement un harmonique mal interprété, on la supprime.

**Passe B — Fusion durcie des répétitions**
La fusion actuelle (gap < 120 ms) reste, mais on ajoute une condition : on ne fusionne que si les vélocités sont compatibles (ratio ≤ 2×). Sinon on garde les deux (vraie répétition voulue).

**Passe C — Snap temporel léger** (si BPM détectable)
Réutilisation de la détection de BPM déjà présente dans `Key & BPM Finder` (lib partagée). Si un BPM fiable sort, on snap les onsets sur la double-croche **avec une tolérance de ±15 ms maximum** (jamais plus, pour ne pas casser les morceaux non quantisés). Si le BPM n'est pas fiable, on saute la passe.

**Passe D — Filtre tonal automatique**
- On détecte la tonalité du **fichier audio source** via le moteur de détection de tonalité existant (`Key & BPM Finder` partage déjà cette logique).
- Les notes **hors-gamme** ET de **faible confiance** (vélocité < 25 % du max ET durée < 150 ms) sont supprimées. Les notes hors-gamme avec une présence forte sont **conservées** (vraies altérations, modulations, blue notes).
- Si la détection de tonalité retourne une confiance < 60 %, la passe est désactivée automatiquement (matériau modal/atonal/jazz — on ne risque pas de casser).
- La tonalité détectée est affichée à côté du profil ("Tonalité : A min — désactiver le filtre"), cliquable pour neutraliser la passe si l'utilisateur veut.

## Étape 3 — UI : zéro friction

Panneau replié par défaut sous le résultat, intitulé "Réglages avancés". À l'intérieur :
- Sélecteur de profil (4 options ci-dessus + "Personnalisé").
- 3 sliders (les seuils) si "Personnalisé".
- 4 toggles pour les passes A/B/C/D.
- Bouton "Relancer l'analyse" qui réutilise le fichier déjà chargé sans le re-décoder.

Bandeau d'info **toujours visible** au-dessus du player MIDI :
> Profil : Piano sale · Tonalité : A min · BPM : 76
> *(chaque info est cliquable pour modifier)*

Aucun champ à remplir, aucune case à cocher avant analyse. L'utilisateur drag-and-drop, ça tourne, le résultat est là.

## Étape 4 — Garde-fous

- Si une passe supprime plus de 30 % des notes, on l'annule automatiquement et on log silencieusement (la passe est probablement trop agressive sur ce matériau).
- Mode diagnostic via `localStorage.audio2midiDebug = "1"` : affiche dans la console le profil détecté, la tonalité, le BPM, et le nombre de notes retiré par chaque passe.
- Aucune passe ne peut modifier la **hauteur** d'une note. Elles ne font que **garder** ou **supprimer**. Donc impossible d'inventer un accord faux.

## Hors scope (volontairement)

- Aucune analyse d'accords réintroduite dans cet outil.
- Aucun changement de modèle (Basic Pitch reste).
- Aucun changement de l'export MIDI ni du player.
- Aucun lien dur avec Key & BPM Finder dans l'UI — on partage juste les libs de détection en interne.

## Détails techniques

Fichiers concernés :
- `src/lib/audioToMidi/basicPitch.ts` — passage des seuils en paramètre, pas de logique nouvelle ici.
- `src/lib/audioToMidi/profile.ts` *(nouveau)* — détection rapide de profil (densité, brillance, bruit).
- `src/lib/audioToMidi/postProcess.ts` *(nouveau)* — passes A/B/C/D, chacune isolée et testable.
- `src/lib/audioToMidi/keyDetect.ts` *(nouveau, wrapper)* — réutilise la détection de tonalité existante côté Key & BPM Finder.
- `src/components/tools/AudioToMidi.tsx` — orchestration (profil → seuils → Basic Pitch → post-process), bandeau info, panneau Avancé.
- i18n FR/EN pour les nouveaux libellés.

Ordre d'exécution :
1. Wrappers de détection (profil, tonalité, BPM partagé).
2. Post-traitement A → B → C → D, chacun derrière son toggle interne (true par défaut).
3. UI bandeau + panneau Avancé.
4. Garde-fou anti-suppression massive.
5. Test sur le fichier `LEX_LBSP_76_electric_piano_bitcrushed_Amin.wav` que tu as envoyé, plus 2 autres fichiers de référence (un mélodie mono propre, un pad dense) pour vérifier qu'on ne casse rien.

Pas de nouvelle dépendance npm. Tout tourne dans le navigateur, aucune donnée envoyée.

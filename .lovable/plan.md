## Problème

Quand on décoche puis recoche un toggle (octaves fantômes, fusion, snap, tonal), la pile de notes affichée ne revient pas exactement à l'état initial. Les passes de `postProcess.ts` sont pourtant pures (aucune mutation du tableau d'entrée) — le bug vient de l'orchestration dans `AudioToMidi.tsx` : deux sources de vérité coexistent (`rawNotesCache` brut + `notes` post-traité), réconciliées par un `useEffect` qui dépend d'un `useCallback` `applyPostProcess`. Cette chaîne crée des cas où :
- l'effet ne se redéclenche pas (identité de callback stable malgré un changement de `pp` batché),
- ou se redéclenche en chevauchant un autre `setNotes` provenant de `handleRun`, laissant `notes` dans un état qui ne correspond plus à `pp`.

## Correctif (1 fichier, frontend pur)

**`src/components/tools/AudioToMidi.tsx`**

1. **Une seule source de vérité.** Supprimer le state `notes` + l'`useEffect` de re-post-process. Le remplacer par un `useMemo` dérivé :
   ```ts
   const { notes, trace } = useMemo(
     () => runPostProcessPipeline(rawNotesCache, { ...pp, bpm, bpmConfidence, tonic, mode, keyConfidence }),
     [rawNotesCache, pp, keyResult, bpmResult],
   );
   ```
   `handleRun` n'appelle plus `setNotes` ni `applyPostProcess` — il pose uniquement `rawNotesCache`, `keyResult`, `bpmResult`, `durationSec`. Tout dérive de là, donc cocher/décocher un toggle redonne mathématiquement le même résultat.

2. **Supprimer `applyPostProcess` (useCallback)** devenu inutile.

3. **Afficher la trace des passes** sous le bandeau d'info (déjà calculée par `runPostProcessPipeline`) : pour chaque passe activée, montrer `−N notes` ou `aborted (safeguard)` ou `skipped (clé/BPM peu fiable)`. Permet à l'utilisateur de voir immédiatement l'effet réel d'un toggle et de confirmer le retour à l'état initial.

4. **Bouton "Réinitialiser les passes"** à côté des toggles → remet `pp` aux 4 booléens `true`.

5. **Transport** : `startTransportFrom` et le rendu canvas lisent déjà `notes` — comme c'est désormais un `useMemo`, la référence reste stable tant que les inputs ne changent pas, donc les `useEffect` de redraw se comportent correctement.

## Hors scope

- Aucune modification de `postProcess.ts`, `profile.ts`, `basicPitch.ts`.
- Aucun changement des seuils, de l'UI des profils, ni des passes elles-mêmes.
- Aucun changement de traduction (les libellés existent déjà ; on ajoutera juste 1–2 clés pour la trace et le bouton reset).

## Vérification

- Lancer une analyse, décocher chaque passe une à une puis recocher → le compteur de notes et la trace doivent revenir aux mêmes valeurs qu'au départ.
- Mode debug (`localStorage.audio2midiDebug = "1"`) : la trace console doit être identique avant/après un cycle toggle off→on.

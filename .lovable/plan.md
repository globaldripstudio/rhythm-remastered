# Stem Splitter Admin (Demucs WASM, 100% gratuit)

## Choix technique

- Librairie : `demucs-web` (npm, MIT, 0 dépendance) + `onnxruntime-web`
- Modèle : Demucs ONNX hébergé sur le CDN par défaut (~80-300 Mo, mis en cache navigateur après le 1er téléchargement)
- Backend : **WebGPU** quand dispo (3-4× plus rapide), fallback **WASM** sinon
- Stems en sortie : drums, bass, other, vocals (4 stems classiques Demucs)
- Encodage WAV : librairie locale légère (pas d'API externe)
- Encodage MP3 : `lamejs` (LAME en WASM, gratuit, qualité 320kbps)
- Téléchargement groupé : `jszip` pour packager les stems
- Aucun appel serveur, aucun upload, aucun coût récurrent
- Pas de besoin de `REPLICATE_API_TOKEN` ni d'aucun secret

## Accès & sécurité

- Nouvel onglet « Stem Splitter » dans le dashboard admin (`src/components/admin/Dashboard.tsx`)
- Composant `src/components/admin/StemSplitter.tsx` rendu uniquement à l'intérieur du Dashboard
- Le Dashboard est déjà gardé par `useAdminAuth` (RBAC limité à `globaldripstudio@gmail.com`) → aucune route publique ajoutée
- Le traitement étant 100% local, aucun fichier ne quitte le navigateur (RGPD parfait)

## Interface admin

```text
+------------------------------------------------------+
|  Stem Splitter — Demucs (gratuit, local)             |
+------------------------------------------------------+
|  [Drop zone: glisser un MP3/WAV/FLAC, max 100 Mo]    |
|                                                      |
|  Mode : ( • ) 4 stems  ( ) 6 stems (bientôt)         |
|  Format : ( • ) WAV 44.1k   ( ) MP3 320 kbps         |
|  Backend détecté : WebGPU ✓  (ou WASM)               |
|                                                      |
|  [ Lancer la séparation ]                            |
+------------------------------------------------------+
|  Téléchargement modèle  : ████████░░ 82%   (1ère fois)|
|  Séparation             : ███░░░░░░░ 30%   (3/10)    |
|  Vitesse : 1.4× temps réel — ETA : 2 min 14 s        |
+------------------------------------------------------+
|  Résultats :                                         |
|    🥁 Drums   ▶ [preview]  ⬇ [download]              |
|    🎸 Bass    ▶ [preview]  ⬇ [download]              |
|    🎤 Vocals  ▶ [preview]  ⬇ [download]              |
|    🎹 Other   ▶ [preview]  ⬇ [download]              |
|    [ Télécharger tous les stems (.zip) ]             |
+------------------------------------------------------+
```

Notes UX :
- Avertissement clair avant lancement : « Le traitement peut prendre 2 à 10 minutes. Garde l'onglet ouvert. »
- Détection mobile : message dissuasif (RAM limitée), proposer de continuer quand même
- Reset / nouveau fichier sans recharger la page (le modèle reste en mémoire/cache)

## Pour le mode 6 stems

`htdemucs_6s` n'a pas de modèle ONNX public stable à ce jour. On expose le toggle « 6 stems » comme **désactivé avec un badge « bientôt »** plutôt que mentir sur la dispo. Si tu veux absolument 6 stems plus tard, on basculera ce seul mode sur Replicate.

## Fichiers à créer / modifier

- `src/components/admin/StemSplitter.tsx` — UI + logique drop, progress, lecture preview, downloads
- `src/lib/stemSplitter/processor.ts` — wrapper autour de `DemucsProcessor` avec init WebGPU/WASM
- `src/lib/stemSplitter/encoders.ts` — encodeWav (Float32 → WAV PCM 16-bit) + encodeMp3 (lamejs)
- `src/lib/stemSplitter/zip.ts` — packager .zip via jszip
- `src/components/admin/Dashboard.tsx` — ajouter onglet « Stems » (icône Wand2 ou Scissors)
- `src/i18n/locales/fr.json` + `en.json` — strings UI (admin, FR/EN)
- `package.json` — ajout `demucs-web`, `onnxruntime-web`, `lamejs`, `jszip`

## Petits ajustements connexes

- Bouton « Envoyer au calculateur » dans la box Métronome a déjà été ajouté précédemment, on n'y retouche pas.

## Ce que tu n'auras PAS à faire

- Aucun secret à fournir
- Aucun compte tiers à créer
- Aucune carte bancaire
- Aucun coût mensuel

## Limitations honnêtes que je veux clarifier

- 1er traitement : ~30 s à 2 min de téléchargement modèle (mis en cache ensuite)
- Traitement : ~2-10 min pour un titre de 3-4 min selon ta machine
- Sur mobile (iOS Safari) : risque de plantage RAM, on affiche un warning
- Si tu veux du temps de traitement court (30-90 s par titre), il faudra basculer plus tard sur Replicate (payant)

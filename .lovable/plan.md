# Correctif : ingestion YouTube dans l'AI Song Checker

## Diagnostic

L'edge function `fetch-audio-from-url` répond `500 — "No playable formats found"` sur YouTube. Cause : `@distube/ytdl-core` est cassé par les changements récents de signatures côté YouTube (problème connu, le repo cumule des centaines d'issues ouvertes). Ce n'est pas un bug de notre code — la lib elle-même ne résout plus les URLs de stream de façon fiable.

SoundCloud et liens directs ne sont pas affectés.

## Correctif

### 1. Remplacer `ytdl-core` par `youtubei.js`

`youtubei.js` (alias YouTube.js / InnerTube) est la lib la plus maintenue pour Deno aujourd'hui : elle parle directement à l'API InnerTube interne de YouTube (la même que l'app Android), donc beaucoup plus résiliente aux changements de signatures que les libs basées sur le scraping du watch page.

Dans `supabase/functions/fetch-audio-from-url/index.ts` :

- Retirer l'import `@distube/ytdl-core`.
- Importer `npm:youtubei.js@10` et instancier `Innertube.create({ retrieve_player: false })` au démarrage de la requête (client web).
- Détection d'URL YouTube : regex `youtube\.com|youtu\.be` (plus large qu'avant).
- Récupérer l'`Innertube.getInfo(videoId)` puis sélectionner `info.chooseFormat({ type: 'audio', quality: 'best' })`. Garde-fou : si `info.basic_info.duration > MAX_DURATION_SEC`, renvoyer 413.
- Récupérer le `stream` via `info.download({ type: 'audio', quality: 'best' })` qui retourne déjà un `ReadableStream<Uint8Array>` web-standard — on peut court-circuiter `nodeReadableToWebStream` pour YouTube.
- `mime` = `audio/mp4` (m4a/AAC) ou `audio/webm` selon le format choisi.
- Title = `info.basic_info.title`.

### 2. Garde-fou si InnerTube échoue aussi

Si `youtubei.js` lève (rare mais possible quand YouTube fait un push cassant), renvoyer un 502 avec un message clair : « Récupération YouTube temporairement indisponible — utilise l'upload de fichier ou un lien direct. » Le client (`AISongChecker.tsx`) affiche déjà l'erreur dans le toast, pas de changement front nécessaire.

### 3. Pas de changement nécessaire côté UI

`AISongChecker.tsx` lit déjà le `Response` en blob et l'envoie au pipeline d'analyse — il s'en moque que le MIME soit `audio/mp4`, `audio/webm` ou `audio/mpeg` puisque `decodeAudioData` accepte les trois.

### 4. Limites conservées

`MAX_BYTES = 30 MB`, `MAX_DURATION_SEC = 600`, rate-limit 10/h par IP — inchangés.

## Détails techniques

- `youtubei.js` est pur TypeScript, compatible Deno via `npm:` — pas besoin de polyfills Node spécifiques.
- Pour YouTube, le stream renvoyé est un MP4 audio fragmenté (m4a). `AudioContext.decodeAudioData` Firefox/Chrome/Safari le lit sans souci.
- Le `capStream` actuel continue de fonctionner puisqu'il prend n'importe quel `ReadableStream<Uint8Array>`.

## Limites résiduelles (à savoir)

- Si YouTube fait un changement cassant côté InnerTube, la lib peut elle aussi se retrouver KO le temps qu'un patch sorte. Aucune lib n'est immunisée — c'est intrinsèque au fait de scraper une plateforme qui ne veut pas qu'on télécharge.
- Vidéos avec age-restriction ou region-locked : possible échec — on renverra un 502 propre.
- Pas de support pour les playlists, shorts, ou Music (le format `music.youtube.com` peut être traité comme un watch URL standard via normalisation de l'ID).

## Fichiers modifiés

- `supabase/functions/fetch-audio-from-url/index.ts` (remplacement de la branche YouTube)

Aucun changement de schéma DB, aucun nouveau secret.

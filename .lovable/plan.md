# Plan : YouTube côté client + favicon nettoyé partout

## Partie 1 — Ingestion YouTube 100% côté navigateur

L'idée : c'est le navigateur de l'utilisateur final qui télécharge l'audio YouTube, pas notre serveur. Avantage : zéro infra, zéro coût récurrent, pas de dépendance à un service externe. Inconvénient honnête à connaître : ça repose sur `youtubei.js` exécuté dans le browser, et YouTube peut casser le truc à n'importe quel moment (la lib se met à jour vite, mais il peut y avoir des fenêtres de 24-72h où ça ne marche plus).

### Mise en œuvre

**Lib utilisée** : `youtubei.js` (npm), qui parle à l'API InnerTube. Compatible navigateur via le proxy CORS de YouTube lui-même (la lib gère ça nativement avec son `Platform.load('web')`).

**Côté code** :

- `src/lib/audioFromYoutube.ts` (nouveau) : encapsule la logique
  - `extractYoutubeAudio(url, { onProgress }): Promise<File>`
  - Détecte l'ID vidéo (regex YouTube/youtu.be/shorts/music)
  - Crée une instance `Innertube` configurée pour le navigateur
  - Appelle `getBasicInfo()` pour récupérer titre + durée
  - Garde-fou : rejette si durée > 600 s (10 min) avec message clair
  - Sélectionne le meilleur format audio (`chooseFormat({ type: 'audio', quality: 'best' })`)
  - Télécharge le stream avec `download()` qui renvoie un `ReadableStream`
  - Affiche la progression (octets téléchargés / total)
  - Reconstruit un `File` (`new File([blob], 'youtube-<id>.webm', { type: 'audio/webm' })`)

- `src/pages/AISongChecker.tsx`
  - Restaure le support YouTube dans l'onglet "Lien"
  - Détecte si l'URL est YouTube : route vers `extractYoutubeAudio()` (client)
  - Sinon : continue d'appeler l'edge function `fetch-audio-from-url` (SoundCloud / liens directs)
  - Affiche une barre de progression pendant le download YouTube
  - Toast d'erreur clair si YouTube est temporairement KO ("YouTube a changé récemment, réessaye plus tard ou utilise l'upload")

- `src/i18n/locales/{fr,en}.json` : remet YouTube dans les placeholders + helper texts.

- `supabase/functions/fetch-audio-from-url/index.ts` : retire la branche YouTube (plus de blocage côté serveur, puisque tout se passe client).

### Limites assumées et communiquées

- Vidéos avec age-restriction ou region-lock : échec propre, message expliquant d'utiliser l'upload.
- Shorts et YouTube Music : supportés (normalisation de l'ID en amont).
- Playlists : non supporté — on prend juste la première vidéo si l'URL contient `list=`.
- Plafond 10 min / 30 Mo conservé.

## Partie 2 — Favicon partout, propre

Objectif simple : le favicon que tu vois sur la landing doit s'afficher partout, sans Lovable nulle part.

### Trois actions

1. **Régénérer un `.ico` propre depuis ton `favicon.png` actuel**. Les navigateurs (surtout dans l'historique et les onglets) demandent toujours `/favicon.ico` en premier. Je convertis ton PNG en `.ico` multi-résolution (16/32/48 px) avec ImageMagick.

2. **Déclarer tous les formats explicitement dans `index.html`** :
   ```html
   <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3" />
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=3" />
   <link rel="icon" type="image/png" sizes="192x192" href="/favicon.png?v=3" />
   <link rel="shortcut icon" href="/favicon.ico?v=3" />
   <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png?v=3" />
   ```
   Le `?v=3` force Chrome/Firefox/Safari à re-télécharger le favicon au lieu de réutiliser celui qu'ils ont en cache.

3. **Ajouter un header `Cache-Control` court** sur `/favicon.*` via `public/.htaccess` pour éviter qu'OVH te ressorte un vieux fichier cache trop longtemps.

### Ce que je ne peux PAS faire (à savoir)

- **L'historique Chrome déjà enregistré** : les vignettes d'historique stockent le favicon vu *à la première visite*. Elles se rafraîchiront uniquement quand tu revisiteras chaque page. Le seul moyen de forcer un nettoyage global de ton côté = `Paramètres → Confidentialité → Effacer les images et fichiers en cache` (ça ne supprime pas ton historique).
- **L'URL de preview Lovable** (`*.lovable.app`) : c'est un iframe wrapper Lovable, ils peuvent injecter leur propre favicon par-dessus le tien. C'est hors de portée du code projet. Sur ton vrai domaine `globaldripstudio.fr`, c'est 100% sous contrôle.

## Fichiers touchés

- `src/lib/audioFromYoutube.ts` (nouveau)
- `src/pages/AISongChecker.tsx` (logique URL + progress)
- `src/i18n/locales/fr.json`, `src/i18n/locales/en.json` (textes YouTube)
- `supabase/functions/fetch-audio-from-url/index.ts` (retrait branche YouTube)
- `public/favicon.ico` (régénéré depuis le PNG)
- `index.html` (déclarations favicon)
- `public/.htaccess` (cache headers favicon)
- `package.json` (ajout `youtubei.js`)

Aucun coût récurrent, aucun secret à ajouter, aucun changement DB.

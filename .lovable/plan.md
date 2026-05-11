## Objectif

Empêcher que `/admin` (et ses sous-pages) apparaisse dans les résultats Google, même si quelqu'un connaît l'URL ou si elle est référencée ailleurs.

## État actuel

- `public/robots.txt` contient déjà `Disallow: /admin` pour Googlebot, Bingbot et `*`.
- `public/sitemap.xml` ne référence pas `/admin`.
- La page `src/pages/Admin.tsx` n'a **aucune** balise `<meta name="robots">`.
- `react-helmet-async` est déjà installé.

Le `Disallow` dans robots.txt empêche Google de **crawler** la page, mais **pas** de l'indexer s'il découvre l'URL via un lien externe (Google peut alors afficher l'URL nue sans description). Pour une exclusion solide, il faut combiner plusieurs couches.

## Plan

### 1. Ajouter `<meta name="robots" content="noindex, nofollow, noarchive">` sur `/admin`

Dans `src/pages/Admin.tsx`, injecter via `react-helmet-async` :
```tsx
<Helmet>
  <title>Admin</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
</Helmet>
```
C'est la directive la plus respectée par Google. Important : pour qu'elle soit lue, Google doit pouvoir crawler la page — voir étape 2.

### 2. Ajuster `robots.txt`

Retirer `Disallow: /admin` (et garder uniquement le `noindex` côté page) **OU** garder le `Disallow` et ajouter en parallèle un en-tête HTTP `X-Robots-Tag: noindex` côté serveur (étape 3). Sinon Google voit l'URL bloquée et peut quand même l'indexer sans pouvoir lire le `noindex`.

Recommandation : **retirer `/admin` de robots.txt** et s'appuyer sur le `noindex` HTML + en-tête HTTP. C'est l'approche officiellement recommandée par Google.

### 3. En-tête HTTP `X-Robots-Tag` côté OVH

Créer `public/.htaccess` avec :
```apache
<IfModule mod_headers.c>
  <FilesMatch "^admin">
    Header set X-Robots-Tag "noindex, nofollow, noarchive, nosnippet"
  </FilesMatch>
</IfModule>
```
Comme l'app est une SPA (toutes les routes servent `index.html`), on ajoute aussi une règle qui applique l'en-tête si la requête correspond à `/admin*` via `mod_rewrite` ou `SetEnvIf Request_URI`. Ceci garantit la directive même pour les bots qui ne lisent pas le DOM.

### 4. Vérifier l'absence de liens internes vers `/admin`

Recherche rapide dans le code pour s'assurer qu'aucun composant public (Header, Footer, sitemap dynamique) ne pointe vers `/admin`. Si un lien existe, ajouter `rel="nofollow"` ou le retirer.

### 5. (Optionnel) Demander la suppression dans Google Search Console

Une fois les directives en place, tu pourras demander la suppression manuelle de l'URL via la Search Console (outil "Suppressions"). Action manuelle de ta part — je te fournirai la marche à suivre.

## Détails techniques

- `HelmetProvider` doit envelopper l'app (vérifier `src/main.tsx` ou `src/App.tsx`) — sinon l'ajouter.
- Les sous-routes éventuelles (`/admin/*`) héritent du même composant `Admin.tsx`, donc le `noindex` couvre tout.
- Le `.htaccess` ne fonctionne que sur l'hébergement Apache OVH — confirmé compatible avec ton déploiement OVH actuel.

## Hors scope

- Pas de changement de l'URL `/admin` vers une URL "secrète" (sécurité par obscurité, peu utile vu la protection anti-bruteforce déjà en place).
- Pas de modification du parcours de connexion ni du Dashboard.
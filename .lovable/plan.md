## Objectif

Faire ranker Global Drip Studio sur deux fronts :
1. **Services studio** (mixage, mastering, sound design, production) — France entière, focus Bouches-du-Rhône / PACA pour le local.
2. **Toolkit audio** — long-tail à forte intention (loudness meter en ligne, audio to midi gratuit, key & bpm finder, accords & gammes, métronome tap tempo) qui draine déjà du trafic et alimente le funnel vers les services.

Pas de FAQ visible (tu utilises le chatbot IA), mais on exploite le chatbot via schema `SpeakableSpecification` + on intègre le contenu Q/A directement dans les blocs SEO et schemas, sans l'afficher en mode FAQ classique.

---

## 1. Fondations techniques (corrections immédiates)

- **`SEO.tsx` enrichi** : ajouter `keywords`, `og:locale`, `og:site_name`, `twitter:card`, `robots`, support `noindex`, support `alternateLocales`, support tableau `jsonLd` (plusieurs blocs schema par page).
- **`index.html`** : corriger `hreflang` EN qui pointe sur la même URL FR (à retirer tant qu'on n'a pas de pages EN dédiées — ça vaut mieux que de mentir à Google), supprimer `meta keywords` (ignoré par Google et signal de spam léger), ajouter `theme-color`, `apple-touch-icon`, `manifest`.
- **`sitemap.xml`** : ajouter `/chord-progression`, `/audio-to-midi`, `/portfolio`, l'article blog manquant ("bien mixer une voix", "techniques sound design"), mettre à jour les `lastmod` au 2026-05-06, ajuster les priorités (services 0.9, outils 0.8, blog 0.7).
- **`robots.txt`** : bloquer `/admin`, `/ebook/reader`, `/payment-success`, `/ebook/login` (pas d'intérêt SEO + données sensibles).
- **404** (`NotFound.tsx`) : vérifier qu'on renvoie bien `noindex` côté SEO meta.

## 2. Schema.org enrichi (données structurées)

Ajouter sur chaque page concernée des blocs JSON-LD ciblés (Google adore) :

- **Home** : `LocalBusiness` (déjà présent, à enrichir avec `geo`, `hasMap`, `paymentAccepted`, `currenciesAccepted`) + `Organization` + `WebSite` avec `SearchAction` (sitelinks searchbox).
- **Services** : `Service` x N avec `offers.priceSpecification`, `areaServed` (FR + cities PACA), `provider`.
- **Outils du toolkit** : `SoftwareApplication` ou `WebApplication` avec `applicationCategory: "MultimediaApplication"`, `operatingSystem: "Web"`, `offers` (gratuit), `featureList`, `browserRequirements`. C'est ce qui fait apparaître les outils dans des carrousels Google.
- **Articles blog** : `Article` complet avec `author`, `datePublished`, `dateModified`, `image`, `wordCount`, `articleSection`.
- **Breadcrumbs** : `BreadcrumbList` sur toutes les pages internes (home → services → mixage, etc.).
- **Ebook** : `Product` avec `offers`, `aggregateRating` si applicable.

## 3. Contenu SEO sur les pages outils

Ajouter sur chaque page du toolkit, **sous les résultats / repliable** pour ne pas casser l'UX :

- Bloc "Pourquoi utiliser cet outil" (200-300 mots, mots-clés long-tail).
- Bloc "Cas d'usage" (3-4 scénarios concrets).
- Bloc "Comment ça marche" (étapes courtes — éligible schema `HowTo`).
- Liens internes contextuels vers les services studio + autres outils du toolkit (maillage interne crucial).
- CTA discret vers les services pour convertir le trafic outil en lead.

Pages concernées : `Loudness`, `KeyBpmFinder`, `TapTempoMetronome`, `ChordProgression`, `AudioToMidi`.

## 4. Page Services renforcée

- Sections H2/H3 par service avec mots-clés ciblés (mixage en ligne, mastering professionnel France, sound design jeu vidéo, production beatmaking, etc.).
- Tarifs structurés (Google adore les prix visibles → schema `Offer`).
- Zone d'intervention explicite (France entière à distance + sessions sur place Martigues, Marseille, Aix-en-Provence, Aubagne, Istres, Vitrolles).
- Témoignages clients structurés en `Review` schema.
- Liens internes vers blog + outils.

## 5. Performance & Core Web Vitals

- `preconnect` Google Fonts ✅ déjà OK, ajouter `dns-prefetch` Supabase.
- Lazy-load des composants lourds : `AudioComparison`, `AdminCalendar` (déjà sur `/admin`), embeds Spotify (déjà gérés).
- Vérifier que les images critiques utilisent `loading="eager"` + `fetchpriority="high"` pour le LCP, et `loading="lazy"` ailleurs.
- Ajouter `width`/`height` explicites sur toutes les `<img>` non-hero pour éviter CLS.
- Précharger l'image hero.

## 6. Maillage interne & contenu éditorial

- Ajouter sur la home un bloc "Outils gratuits pour producteurs" qui pointe vers le toolkit (capte les visiteurs services).
- Ajouter sur chaque page outil un footer "Ressources" : 2 articles de blog + 2 services pertinents.
- Ajouter sur les pages services des liens vers les outils ("besoin de checker ton LUFS avant de m'envoyer ton mix ? → /loudness").

## 7. Bonus différenciants

- **Sitemap segmenté** : `sitemap-pages.xml`, `sitemap-tools.xml`, `sitemap-blog.xml` + index, déclaré dans robots.txt.
- **`speakable` schema** sur les blocs courts pour Google Assistant.
- **Schema `FAQPage` "fantôme"** : on génère des Q/R basées sur les questions fréquentes du chatbot et on les injecte uniquement en JSON-LD (sans rendu visible) — Google les indexe et peut les afficher en rich snippet.
- **OG images dynamiques** : créer une OG par page (toolkit + services) plutôt qu'une seule pour toute le site → améliore le CTR sur les partages.
- **Fil d'Ariane visible** sur pages internes.

---

## Détails techniques

**Fichiers à créer**
- `public/sitemap-pages.xml`, `public/sitemap-tools.xml`, `public/sitemap-blog.xml`, `public/sitemap.xml` (index)
- `public/manifest.webmanifest`
- `src/components/Breadcrumbs.tsx` (composant + schema)
- `src/components/seo/ToolSeoBlock.tsx` (bloc contenu réutilisable pour outils)
- `src/lib/seo/schemas.ts` (factories pour LocalBusiness, SoftwareApp, Service, Article, Breadcrumb, FAQ)

**Fichiers à modifier**
- `src/components/SEO.tsx` (support multi-jsonLd + meta avancées)
- `index.html` (correction hreflang, manifest, theme-color, suppression keywords)
- `public/robots.txt` (compléter Disallow)
- `src/pages/Index.tsx`, `Services.tsx`, `Loudness.tsx`, `KeyBpmFinder.tsx`, `TapTempoMetronome.tsx`, `ChordProgression.tsx`, `AudioToMidi.tsx`, `Blog.tsx`, `BlogArticle.tsx`, `Ebook.tsx`, `Projets.tsx` (intégration nouveaux schemas + breadcrumbs + bloc SEO outils).
- `src/i18n/locales/fr.json` + `en.json` (nouvelles clés `seo.tools.<tool>.about/howto/usecases`)

**Validation après implémentation**
- Test Google Rich Results sur 5 URLs clés
- Test PageSpeed Insights (cible LCP < 2.5s, CLS < 0.1)
- Vérification sitemap dans Search Console
- Audit Lighthouse SEO ≥ 95

---

## Ce que je ne fais PAS

- Pas de pages EN dédiées (tu n'as pas confirmé l'international → on retire le hreflang trompeur).
- Pas de FAQ visible (chatbot remplace) — uniquement schema FAQPage invisible.
- Pas de blog AI-generated en masse (qualité > quantité, on garde le ton du studio).
- Pas de modification du chatbot lui-même (hors scope).

Une fois validé, je passe en mode build et j'implémente tout d'un coup.
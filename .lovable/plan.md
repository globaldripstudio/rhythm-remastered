## Plan d'exécution — Lots 1, 2, 3

Ordre d'application : **Lot 1 → Lot 2 → Lot 3**, livrés en messages séparés. Je consulte avant tout point sensible.

---

### 🟢 Lot 1 — Impact direct

**#2 — Navigation fluide (sans rechargement)**
Remplacer tous les `<a href="...">` internes du Header et du Footer par `<Link to="...">`. Plus de rechargement complet, plus de clignotement, animations préservées.
*Périmètre :* `Header.tsx`, `Footer.tsx`, et autres composants de nav qui pointent vers des routes internes.

**#12 — SEO de la page Portfolio**
Ajouter une balise `<SEO>` (titre + description + canonical + hreflang) sur `/portfolio` pour qu'elle apparaisse correctement dans Google.

**#16 — Sécurité CORS des fonctions backend (vérification)**
Tu as raison : les emails partent vers ta boîte uniquement, Stripe est verrouillé côté API. Je vais quand même **auditer** les 6 edge functions (`send-contact-email`, `create-payment`, `chat-assistant`, `serve-ebook`, `track-blog-view`, `track-visit`) pour confirmer qu'aucune ne peut être détournée pour un autre usage (spam, abus quota IA). Si tout est OK, je le confirme sans rien modifier. Sinon, je restreins l'origine.

> **Points 1, 4, 6, 7 : ignorés** comme demandé (comportement volontaire / déjà OK).

---

### 🟡 Lot 2 — Cohérence i18n

**#5 — Redirections legacy lang-aware**
Quand un visiteur anglophone tombe sur une vieille URL `/projects` (depuis Google), l'envoyer sur `/en/projects` au lieu de `/projets`. Idem pour `/our-projects`, `/about`, `/programs`.

**#10 — Page 404 bilingue**
Détecter la langue (URL `/en/...` ou préférence i18n) et afficher la 404 en anglais le cas échéant.

**#11 — CTA des articles EN restent en EN**
Les boutons "Devis" / liens internes des articles anglais utiliseront `localizePath` au lieu de `navigate('/')` pour rester sur la version anglaise du site.

**#14 — Titre Google par défaut propre**
Si jamais quelqu'un accède à un slug d'article inconnu, fournir un titre/description génériques propres au lieu de retomber sur ceux de l'article "compression".

> **Points 8, 9, 15 : ignorés** comme demandé.

---

### 🔵 Lot 3 — Nettoyage technique

**#3** — Bouton "Retour" sur `/services` → `navigate()` au lieu de `window.location.href`.
**#13** — Breadcrumb services : retirer l'ancre `#service-id` du schema.org breadcrumb (garder un path propre).
**#17 — Rate-limit persistant et "smart"**
Remplacer le compteur en mémoire par un **stockage persistant en base** (table `rate_limits` avec `key`, `count`, `window_start`) + nettoyage automatique des entrées expirées (archivage simplifié : suppression auto des fenêtres dépassées). Ça nécessitera une **migration DB** que je te ferai approuver.
**#18** — Vérifier que `get-stripe-data` valide bien le rôle admin côté serveur. *(Au vu du code déjà lu : c'est OK. Je le confirme dans le rapport, sans modif.)*
**#19** — `LangLock` : déplacer `i18n.changeLanguage()` dans un `useLayoutEffect` pour éviter le warning React 18 strict.
**#20** — Header dropdown "Toolkit" : `aria-expanded` dynamique synchronisé avec l'état hover/focus.
**#21 — Refacto Loudness (CONDITIONNEL)**
⚠️ Le code actuel mentionne explicitement que le wrapper évite **une boucle infinie sur Radix Select**. Avant de toucher, je vais :
1. Tester si remplacer `LoudnessFr/En` par `<LangLock>` reproduit le bug.
2. Si **OUI** → on **NE TOUCHE À RIEN** (la qualité de l'analyse audio prime).
3. Si **NON** → on simplifie.
Je te confirme le résultat avant de pousser le changement.

---

### Détails techniques (pour référence)

**Lot 1**
- `Header.tsx` / `Footer.tsx` : `<a href>` → `<Link>` pour toutes les routes internes.
- `Portfolio.tsx` : ajouter `<SEO>` avec `alternates` FR/EN.
- Audit CORS : lecture des 6 fichiers `supabase/functions/*/index.ts`.

**Lot 2**
- `App.tsx` : convertir les `<Navigate>` en composant custom `<LangAwareRedirect to="/projets" enTo="/en/projects" />`.
- `NotFound.tsx` : utiliser `useTranslation()` + `getLangFromPath()`.
- `BlogArticle.tsx` (article Venin EN) : remplacer `navigate('/')` par `navigate(localizePath('/', lang))`.
- `BlogArticle.tsx` : fallback `seoKey` → titre/description génériques.

**Lot 3**
- `Services.tsx` : `navigate('/#services')` au lieu de `window.location.href`.
- `Services.tsx` breadcrumb : path `/services` sans ancre.
- Migration SQL : table `rate_limits (key text, count int, window_start timestamptz)`, RLS DENY anon, fonction `check_rate_limit(key, max, window_seconds)` security definer + cron de purge quotidien.
- `chat-assistant`, `create-payment`, `send-contact-email` : remplacer `Map` mémoire par appel RPC `check_rate_limit`.
- `LangLock.tsx` : `useLayoutEffect`.
- `Header.tsx` dropdown : `useState` + `aria-expanded={open}`.
- `Loudness*` : test reproduction Radix bug → décision.

---

### Livraison

1. Message 1 : Lot 1 (3 modifs + 1 audit).
2. Message 2 : Lot 2 (4 modifs).
3. Message 3 : Lot 3 (7 modifs dont 1 migration DB à approuver, 1 conditionnel).

Je consulte avant : la migration `rate_limits` (Lot 3 #17) et la décision finale sur Loudness (Lot 3 #21).
## Audit du site — anomalies relevées

Aucune correction n'a été faite. Pour chaque point, on choisira ensemble (corriger / ignorer / garder pour plus tard).

### A. Navigation & SPA

1. **Ancres `#accueil`, `#services`, `#equipement`, `#contact` du Header ne fonctionnent pas hors de la home.**
   Sur `/blog`, `/projets`, `/ebook`, `/loudness`, `/en/...`, cliquer ne fait rien (pas de section ciblée sur la page courante).

2. **Tous les liens de nav du Header et du Footer utilisent `<a href>` au lieu de `<Link>`.**
   Conséquence : rechargement complet de la page → perte d'état React, ré-exécution de tous les chargements, animations relancées. Concerne : `/projets`, `/blog`, `/loudness`, `/key-bpm-finder`, `/tap-tempo-metronome`, `/chord-progression`, `/audio-to-midi`, `/mentions-legales`, `/politique-confidentialite`, `/cgv`.

3. **Bouton "Retour" sur la page `/services` détaillée fait `window.location.href = '/#services'`**, donc rechargement complet au lieu d'un `navigate()`.

4. **Articles "comingSoon"** (`/blog/bien-mixer-une-voix`, `/blog/10-techniques-sound-design`) : URL directe → page 404, alors que la liste les présente comme "à venir". Aucune redirection vers `/blog`.

5. **Redirections legacy `/projects` et `/our-projects`** envoient vers `/projets` (FR) même si l'utilisateur est en EN. Devraient pointer vers `/en/projects` quand `i18n.language === 'en'`.

### B. Internationalisation

6. **Outils `/key-bpm-finder`, `/tap-tempo-metronome`, `/chord-progression`, `/audio-to-midi` ne sont pas traduits** : pas d'`useTranslation()`, contenu en français en dur. Pourtant le toggle FR/EN reste affiché (via `ToolkitHeader`) et change `i18n.language` sans effet visible.

7. **Aucune route `/en/...` pour ces 4 outils** → toggle EN ne navigue nulle part de cohérent (et casse `mirrorPath`, qui ne trouve pas de pendant et tombe sur `i18n.changeLanguage` muet).

8. **Page `/portfolio` entièrement en français en dur** (textes, descriptions). Aucun `t()`. Présente dans le sitemap mais jamais linkée depuis le site.

9. **Pages légales (`/mentions-legales`, `/politique-confidentialite`, `/cgv`) en FR uniquement** : pas de version EN, pas d'`alternates hreflang`. Liens du footer pointent vers ces URLs FR depuis les pages EN.

10. **`NotFound` (404) en FR uniquement.** Pas de version EN, pas de `alternates`.

11. **Liens internes des articles EN** (CTA "Devis" Venin, etc.) : `navigate('/')` force le retour en FR depuis `/en/blog/venin-the-first-blood`.

### C. SEO

12. **`/portfolio` n'a pas de balise `<SEO>`** (pas de title/description spécifique, pas de canonical). Page indexable sans métadonnées.

13. **`/services` (route séparée)** : breadcrumb utilise `/services#${service.id}` comme path, ce qui produit un schema.org breadcrumb avec ancre — non standard.

14. **Articles non publiés (comingSoon)** : `BlogArticle.seoKey` retombe par défaut sur `"compression"` si le slug n'est ni Venin ni compression → mauvais titre/description si on accède à un slug coming-soon.

15. **Toggle FR/EN sur les pages outils non bilingues** (`/services`, `/portfolio`, `/key-bpm-finder`, …) est visible mais inerte côté URL. Mauvais signal UX et potentiel duplicate content si Google suit le `?lang=` interne.

### D. Sécurité

16. **Toutes les edge functions ont `Access-Control-Allow-Origin: "*"`** alors que le site est servi depuis un domaine connu. Devrait être restreint à `globaldripstudio.fr`, `globaldripstudio.lovable.app` et l'origine preview.

17. **Rate-limiting en mémoire** dans `chat-assistant`, `create-payment`, `send-contact-email` : reset à chaque cold-start, et non partagé entre instances. Contourné facilement en pratique (Cloud Functions Supabase scalent).

18. **`get-stripe-data`** : à confirmer que l'appel est gardé par un check de rôle admin côté serveur (pas seulement par auth).

### E. Code / qualité

19. **`LangLock` appelle `i18n.changeLanguage()` pendant le render** (side effect en cycle React). Fonctionne aujourd'hui mais peut générer un warning React 18 strict. Pourrait être passé dans un `useLayoutEffect`.

20. **`Header` toolkit dropdown** : `aria-haspopup="menu" aria-expanded="false"` est statique → accessibilité dégradée (le menu s'ouvre au hover sans mise à jour de l'état ARIA).

21. **`Loudness` est wrappé par `LoudnessFr` et `LoudnessEn`** : pattern dupliqué qu'on pourrait remplacer par `<LangLock lang="fr"><Loudness /></LangLock>` pour rester cohérent avec le reste de l'App.

---

### Comment procéder

Plutôt que de tout corriger en bloc, je propose qu'on traite par lot. Mes recommandations de priorité :

- **À corriger en priorité (impact UX/SEO immédiat)** : 1, 2, 4, 6/7 (outils non traduits + routes EN), 12, 16.
- **À corriger ensuite (cohérence i18n/SEO)** : 5, 8, 9, 10, 11, 14, 15.
- **À nettoyer plus tard (dette)** : 3, 13, 17, 18, 19, 20, 21.

Dis-moi quelles anomalies tu veux qu'on traite (numéros), et dans quel ordre, ou si tu veux qu'on parte sur un des trois lots ci-dessus.
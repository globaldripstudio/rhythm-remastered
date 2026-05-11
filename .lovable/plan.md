## Problème

Sur `/en/loudness`, cliquer "FR" change seulement la langue i18n mais reste sur l'URL `/en/loudness` — or `LoudnessEn.tsx` reforce immédiatement i18n en EN au montage. Résultat : le toggle ne fait rien de visible. Inversement depuis `/loudness`, cliquer "EN" devrait amener sur `/en/loudness` (URL canonique EN pour le SEO), pas seulement basculer i18n.

## Correctif

### `src/components/tools/ToolkitHeader.tsx` (seul header utilisé sur Loudness)

Rendre `toggleLanguage` route-aware via `useNavigate` + `useLocation` :

```ts
const navigate = useNavigate();
const { pathname } = useLocation();

// Mapping FR ↔ EN (extensible plus tard pour les 4 autres outils)
const LOCALIZED_ROUTES: Record<string, string> = {
  "/loudness": "/en/loudness",
  "/en/loudness": "/loudness",
};

const toggleLanguage = () => {
  document.body.classList.add("lang-switching");
  const nextLang = i18n.language === "fr" ? "en" : "fr";
  const target = LOCALIZED_ROUTES[pathname];
  if (target) {
    navigate(target);
  } else {
    i18n.changeLanguage(nextLang); // outils sans variante EN dédiée
  }
  setTimeout(() => document.body.classList.remove("lang-switching"), 500);
};
```

Pourquoi ne pas appeler `changeLanguage` quand on navigue ? Parce que `LoudnessEn.tsx` force déjà EN au montage et restaure la langue précédente au démontage — la navigation suffit, et on évite un double-flip.

### Vérifications de cheminement

1. Depuis `/loudness` (FR) → clic "EN" → `navigate("/en/loudness")` → `LoudnessEn` monte → `i18n.changeLanguage("en")` → contenu EN, URL EN. OK.
2. Depuis `/en/loudness` (EN forcé) → clic "FR" → `navigate("/loudness")` → `LoudnessEn` démonte → restaure `previous` (FR) → contenu FR, URL FR. OK.
3. Sur les 4 autres outils (`/key-bpm-finder`, `/tap-tempo-metronome`, `/chord-progression`, `/audio-to-midi`) : pas de variante EN routée, donc fallback sur simple `changeLanguage`. Comportement actuel préservé.
4. État visuel du switch (FR/EN en gras) : déjà piloté par `i18n.language`, qui sera bien à jour après navigation grâce au `useEffect` de `LoudnessEn`.

## Hors-scope

- Pas de création de routes `/en/...` pour les autres outils (non demandé).
- `Header.tsx` global non touché : il n'est pas rendu sur les pages Loudness.
- Aucun changement de contenu, de SEO, ni de hreflang (déjà corrects).

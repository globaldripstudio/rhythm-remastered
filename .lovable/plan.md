## Diagnostic

J'ai reproduit le problème en chargeant `/en/loudness` dans la preview. Deux soucis :

1. **Erreur React fatale** dans la console : `Maximum update depth exceeded` provenant du composant Radix `<Select>` (le sélecteur de genre musical) imbriqué dans `Loudness.tsx`. En dev l'erreur est récupérée par React (la page finit par s'afficher), mais en build production sans error boundary → **page blanche**. Stack : `setRef` → `dispatchSetState` dans `@radix-ui/react-select` → boucle de commit.

2. **Cause de la boucle** : `LoudnessEn` force `i18n.changeLanguage("en")` dans un `useEffect` après le premier render. Conséquence :
   - Render #1 en FR (langue par défaut/persistée) → Radix Select monte ses items FR
   - `useEffect` change la langue → Render #2 en EN → les enfants du `Select` changent de texte mais Radix réutilise le même `Select` instance et son collection-tracker re-déclenche un setState dans le commit → boucle.

3. **Effet visuel attendu manquant** : pas de transition blur (`lang-switching`) lors du switch via navigation, et un flash FR→EN visible avant stabilisation.

## Correctif

### 1. Synchroniser la langue AVANT le premier render (`src/pages/LoudnessEn.tsx`)

Remplacer le `useEffect` par un changement synchrone exécuté pendant le render (idempotent, hors cycle React) + `useLayoutEffect` pour la restauration au démontage. Cela élimine le double-render et donc la boucle Radix.

```tsx
const LoudnessEn = () => {
  const { i18n } = useTranslation();
  // Force EN synchroneously, BEFORE first render of <Loudness />.
  if (i18n.language !== "en") {
    i18n.changeLanguage("en");
  }
  useLayoutEffect(() => {
    // No restore on unmount: the destination route's wrapper (or the toggle)
    // owns the next language. Restoring here causes a flash back to FR
    // when navigating from /en/loudness → /loudness via the toggle.
    return;
  }, []);
  return <Loudness />;
};
```

(On supprime la logique de "previous language" : la page de destination, ou le toggle, dicte la langue.)

### 2. Idem côté FR : créer un wrapper symétrique (`src/pages/LoudnessFr.tsx` ou inline dans la route `/loudness`)

Pour qu'arriver sur `/loudness` force aussi `i18n.changeLanguage("fr")` (sinon un user qui a EN persisté en localStorage et tape `/loudness` voit du EN). Petit composant identique mais en `"fr"`.

Routes mises à jour dans `App.tsx` :
```tsx
<Route path="/loudness" element={<LoudnessFr />} />
<Route path="/en/loudness" element={<LoudnessEn />} />
```

### 3. Ajouter la transition blur sur navigation (`src/components/tools/ToolkitHeader.tsx`)

Déjà présent dans `toggleLanguage` (`document.body.classList.add("lang-switching")` + cleanup 500 ms). Vérifier que le timing est conservé pendant la navigation route-aware (déjà OK dans le code actuel — le `setTimeout` retire la classe 500 ms après, indépendamment de la navigation).

### 4. Filet de sécurité contre la boucle Radix (défense en profondeur)

Sur le `<Select>` de genre musical (ligne 742 de `Loudness.tsx`), ajouter `key={lang}` pour forcer un remount propre si la langue change en cours de session :
```tsx
<Select key={lang} value={selectedSubgenre ?? "none"} ...>
```
Coût : remise à zéro visuelle du dropdown lors d'un toggle FR↔EN sans navigation, mais sur les pages `/loudness` ↔ `/en/loudness` la navigation remonte déjà tout l'arbre, donc invisible.

## Vérifications post-fix

1. `/loudness` → clic "EN" : `navigate("/en/loudness")` → wrapper EN force la langue avant render → page rend directement en EN, pas de flash, pas d'erreur console. Blur visible 500 ms.
2. `/en/loudness` → clic "FR" : `navigate("/loudness")` → wrapper FR force la langue avant render → contenu FR direct.
3. Accès direct à `/en/loudness` (depuis Google) avec localStorage FR : page rend en EN dès la première frame.
4. Accès direct à `/loudness` avec localStorage EN : page rend en FR dès la première frame.
5. Aucune erreur "Maximum update depth" dans la console.
6. Toggle FR/EN sur les 4 autres outils (`/key-bpm-finder`, etc.) : comportement actuel préservé (`i18n.changeLanguage` direct).

## Hors-scope

- Pas de généralisation à Landing/Blog/Projets/Boutique (ce sera le sujet du prochain plan, déjà rédigé).
- Pas de modification du contenu, du SEO, du sitemap ou des hreflang.
- Pas de touche à `Header.tsx` global ni à `BlogArticleHeader.tsx`.

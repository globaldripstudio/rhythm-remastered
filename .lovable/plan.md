## Objectifs

1. **Verdicts plus tranchés** : ajuster la logique heuristique pour éviter les résultats type "46% / 29% / 24%" peu utiles.
2. **Tooltips explicatifs** sur chaque mesure détaillée.
3. **Retour accueil** = toujours scroll en haut, comme une 1ʳᵉ visite.
4. **Estimation ratio IA/Humain** quand le verdict est Hybride.

---

## 1. Précision des résultats — `src/lib/aiSongCheck.ts`

Le calcul actuel utilise une moyenne pondérée douce qui produit toujours 3 scores proches. On va le rendre plus décisif :

- **Ajouter de nouvelles features discriminantes** :
  - Énergie au-dessus de 16 kHz (les modèles IA coupent net vers 15–17 kHz)
  - Symétrie/régularité du spectrogramme moyen (uniformité temporelle)
  - "Repetition score" : autocorrélation de l'enveloppe (Suno/Udio bouclent souvent des motifs trop réguliers)
  - Détection de bruit de fond (plancher de bruit anormalement bas = IA)
- **Pondération par "confiance"** : si plusieurs marqueurs forts pointent dans la même direction, amplifier le score (fonction sigmoïde / softmax avec température < 1) au lieu de la moyenne actuelle.
- **Repenser le calcul du score hybride** : aujourd'hui c'est `1 - |ai - human|`, ce qui le pousse haut quand les deux sont proches → cause directe du "tout 30-40%". Le remplacer par une vraie détection : Hybride seulement quand le profil spectral est IA-like ET le profil temporel est humain-like (ou inversement). Sinon il reste bas.
- **Normalisation finale via softmax à température basse (T ≈ 0.4)** : les 3 scores sont contrastés et un verdict ressort clairement.

Résultat attendu : la majorité des morceaux retournent un score dominant > 60 %.

## 2. Estimation du mix IA/Humain quand Hybride

Ajouter dans `AISongCheckResult` :
```ts
hybridMix?: { aiPct: number; humanPct: number } | null;
```

Calcul : uniquement si `overall.hybrid` est le score dominant (≥ 45 %) ET que les blocs spectral/temporel divergent fortement. On utilise la position relative des deux blocs (ex : spectre = 70 % IA, temporel = 65 % Humain → ratio ≈ 52 % IA / 48 % Humain). Sinon `null` et on n'affiche rien.

Affichage dans le bloc "Verdict global" : petit encart `Estimation du mix : ~XX% IA / ~YY% humain` avec disclaimer "indicatif".

## 3. Tooltips sur les mesures détaillées — `src/pages/AISongChecker.tsx`

Ajouter dans `STRINGS.fr/en` un champ `featureDescriptions` avec une phrase courte par mesure :

- **Planéité spectrale moy.** : à quel point le spectre est "bruité/plat" vs tonal. Élevée = bruit, basse = musical.
- **Variance de planéité** : à quel point la texture spectrale varie au fil du temps. Faible variance = signal très uniforme (typique IA).
- **Coupure HF** : fréquence où l'énergie haute disparaît. ~15–17 kHz = coupure typique des générateurs IA.
- **Corrélation stéréo** : similarité gauche/droite. > 0.95 = quasi-mono (souvent IA), 0.4–0.9 = stéréo naturelle.
- **CV inter-transitoires** : régularité des frappes/attaques. Bas = trop métronomique (IA), 0.3–0.7 = humain.
- **Micro-dynamique RMS** : variations de volume sur 50 ms. < 3 dB = très compressé/lissé (IA).
- **Ratio de silence** : proportion de silence dans le morceau. Valeurs extrêmes = suspect.

Implémentation : un petit `<Tooltip>` (shadcn) avec icône `Info` à côté de chaque label, ou un `<HoverCard>` pour avoir plus de place sur desktop + accessibilité tactile mobile (clic ouvre/ferme).

## 4. Retour accueil scroll top

Deux endroits concernés :
- `src/pages/AISongChecker.tsx` ligne 332 : le `Link to="/"` doit déclencher `window.scrollTo(0, 0)` après navigation.
- Plus globalement : vérifier que `App.tsx` n'a pas déjà un ScrollToTop. Si non, ajouter un composant `ScrollToTop` monté dans le Router qui fait `window.scrollTo({ top: 0, behavior: 'instant' })` à chaque changement de pathname. Cela couvre aussi tous les autres "retour accueil" du site.

---

## Fichiers modifiés
- `src/lib/aiSongCheck.ts` — refactor scoring + features
- `src/pages/AISongChecker.tsx` — tooltips, affichage mix hybride, scroll top
- `src/App.tsx` — composant ScrollToTop global (si absent)
- `src/components/ui/tooltip.tsx` — déjà présent, juste à importer

## Note honnête sur les limites
L'analyse reste heuristique (pas un modèle ML entraîné). On peut rendre les verdicts plus tranchés et ajouter des features, mais aucune méthode locale gratuite n'égalera SubmitHub (qui utilise probablement un modèle entraîné). On garde le disclaimer "Beta — heuristique".
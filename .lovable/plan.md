## Diagnostic

Le morceau 100% humain ressort en **79% hybride spectral** et **100% hybride global**. Trois bugs combinés dans `src/lib/aiSongCheck.ts` :

**1. Formule du score hybride trop permissive**
Actuellement :
- Blocs spectral/temporel : `hybridRaw = 2·√(ai·human)`
- Bloc global : `hybridRaw = 4·√(ai·human) · (1 − 0.6·|ai−human|)`

Le `√` amplifie le moindre soupçon d'IA. Avec `human=0.5` et `ai=0.15`, on obtient déjà `hybrid=0.87` côté global → softmax à T=0.18 → 100% hybride. C'est cassé : un signal très asymétrique (humain >> IA) doit collapser vers « pur humain », pas vers « hybride ».

**2. Marqueurs spectraux trop sensibles sur du rap/mix moderne**
Sur un mix rap mastérisé moderne, plusieurs marqueurs « pro-IA » tirent en faux positif :
- `stereoCorr > 0.9` (kick/basse centrés mono)
- `hfCutoff ≈ 15–16 kHz` (limiteur de mastering)
- `rolloff85` bas (mix bass-heavy)
- `melCv` modérément bas (mastering serré)

Cumulés, ils peuvent pousser `spec.ai` à 0.3–0.4 sur un titre humain → suffisant pour basculer hybride.

**3. Softmax à T=0.18 trop tranchant**
À cette température, dès qu'un score domine de 0.1, il rafle 95%+. Ça transforme un léger biais en verdict absolu.

---

## Corrections

### A. Nouvelle formule hybride (cœur du fix)
Remplacer le `√` par `min` pénalisé par l'asymétrie. Hybride ne monte QUE quand les deux camps ont des preuves comparables :

```
hybridRaw = 2 · min(ai, human) · (1 − |ai − human|)²
```

Comportement :
- `ai=0.15, hu=0.5` → `2·0.15·(0.65)² = 0.127` → faible ✓
- `ai=0.4, hu=0.4` → `2·0.4·1 = 0.8` → fort ✓
- `ai=0.5, hu=0.2` → `2·0.2·(0.7)² = 0.196` → faible ✓
- `ai=0.3, hu=0.45` → `2·0.3·(0.85)² = 0.433` → modéré, OK pour vrai hybride

Cette même formule sera utilisée dans les blocs spectral, temporel et overall (suppression de la branche spéciale `coexist`).

### B. Rebalance des marqueurs spectraux
- **Poids `stereoCorr` : 0.9 → 0.5** (peu fiable sur productions modernes)
- **Poids `hfCutoff` : 1.0 → 0.7** (le mastering coupe naturellement)
- **Poids `rolloff85` : 0.6 → 0.4**
- Recentrer `hfCutoff` : `vote(hfCutoff, 19500, 14500)` → `vote(hfCutoff, 18000, 14000)` (moins de pénalité à 16 kHz, qui est très courant en humain)
- Recentrer `stereoCorr` : `vote(stereoCorr, 0.7, 0.97)` → `vote(stereoCorr, 0.55, 0.98)` (besoin d'être vraiment quasi-mono pour voter AI fort)
- Recentrer `melCv` : `vote(melCv, 0.9, 0.35)` → `vote(melCv, 1.0, 0.25)` (un mastering serré ne suffit pas)

### C. Suppression mutuelle plus douce dans l'élimination globale
Constante `SUPPRESS` passée de **2.2 → 1.8** : on continue à éliminer mais on évite que `pureHuman` tombe à zéro dès qu'on voit 0.3 d'IA. Combinée à la nouvelle formule hybride asymétrique, ça suffit pour que `pureHuman` reste vainqueur sur les vrais humains.

### D. Softmax un peu moins agressif sur le global
Température overall : **0.18 → 0.24**. Toujours tranché (un leader à +0.2 reste >70%) mais plus de saut binaire 0%/100%.

---

## Résultat attendu

Sur le morceau « Lil Moine » 100% humain :
- Marqueurs temporels sains (onset CV, micro-dynamique, breath ratio) → `temp.human` fort, `temp.ai` faible
- Marqueurs spectraux mitigés (mastering) → `spec.human` modéré, `spec.ai` modéré
- Asymétrie globale `human > ai` → hybride pénalisé par `(1 − |Δ|)²`
- Verdict global attendu : **Humain probable / très probable (~60-75%)**, hybride < 25%, IA < 10%

Sur les vrais hybrides (LofAI), le ratio `ai ≈ human` reste élevé → hybride continue de gagner, mix affiché normalement.

---

## Fichiers modifiés

- `src/lib/aiSongCheck.ts` — nouvelle formule hybride, poids/centres recalibrés, `SUPPRESS=1.8`, T=0.24

Aucun changement UI nécessaire.

## Note honnête

L'analyse reste un calcul de signal sans modèle entraîné. Les ajustements ci-dessus corrigent le faux positif sur du rap mastérisé, mais un morceau électronique très carré ou un mix très limité en bande passante peut toujours flirter avec « hybride ». Le disclaimer Beta couvre déjà ce cas.

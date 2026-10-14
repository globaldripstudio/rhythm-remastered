# Réécrire l'argumentaire de la formation (Boutique + fiche e-book, FR/EN)

## Principes de ton (corrigés)
- La formation ne remplace jamais un ingénieur du son. Elle fait comprendre l'importance du son et permet de s'en passer légitimement sur certains projets. On ne compare pas au travail d'un ingé son : le lecteur le comprendra seul.
- Aucun argument de prix estimé, de « validation par un partenaire » ni de chiffre inventé.
- Pas de « zéro théorie » : les notions et termes techniques de l'audio sont expliqués clairement, dans le langage et le contexte des vidéastes.
- Ton pro, factuel, non moralisateur, positionnement premium.

## Nouveaux textes (FR)

**Sous-titre**
« La première formation audio pensée exclusivement pour les vidéastes et monteurs. Comprendre ce que le son apporte à vos images, et savoir le traiter vous-même quand le projet le permet. »

**Ce que cette formation règle** (constat terrain, pas une liste générique)
- Des images soignées, desservies par une captation terrain approximative.
- Un son traité en dernier, au montage, sans méthode : coupes sèches, « pocs », niveaux qui changent d'une scène à l'autre.
- Des mix qui saturent ou qui sonnent différemment selon la plateforme de diffusion.
- Des heures perdues en post-production faute de réflexes et de workflows clairs.

**La promesse**
« Comprendre pourquoi le son compte autant que l'image, puis acquérir les méthodes pour livrer vous-même une bande-son propre et maîtrisée sur les projets qui le permettent. »

**L'approche**
« Un discours pensé pour les vidéastes : chaque notion audio et chaque terme technique est expliqué clairement et relié à une utilité immédiate dans Premiere Pro, Final Cut Pro, DaVinci Resolve ou CapCut. Les 25 techniques prêtes à tourner indiquent aussi des plugins payants pour aller plus loin. »

**Ce que vous recevez** : inchangé (70 pages, exemples audio, samples sweeps et impacts, 2 cheatsheets imprimables, plan 5 semaines, ressources audio en ligne).

**Au programme / Pour qui / Une question ?** : inchangés.

## Corrections annexes
- Retirer le lien « Voir la fiche détaillée » de la Boutique (inutile et non fonctionnel).
- Traduction EN fidèle de tous les nouveaux textes (même ton, mêmes nuances, rien d'ajouté).

## Hors périmètre
Prix (89 €), paiement, mise en page générale, aperçu PDF (toujours en attente du fichier).

## Détails techniques
- Clés `boutique.subtitle`, `ebookSell.pains.items`, nouvelles clés `ebookSell.promise` et `ebookSell.approach` dans `fr.json` / `en.json`.
- `EbookSellingBlocks` : ajout d'un bloc promesse + approche (Card existante, jetons de couleur existants).
- `Boutique.tsx` : suppression du lien `detailsPath`.
- Vérification Playwright sur /boutique, /en/shop, /ebook, /en/ebook.

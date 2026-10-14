# Réécrire l'argumentaire de la formation (Boutique + fiche e-book, FR/EN)

Base : lecture complète du PDF v1.2 (70 pages, auteur Guillaume Surget, ingénieur du son / sound designer).

## Principes de ton
- La formation ne remplace pas un ingénieur du son. Elle fait comprendre l'importance du son et permet de s'en passer légitimement sur certains projets ; le chapitre 10 apprend même à bien travailler avec un ingé son.
- Aucun prix estimé, aucune « validation partenaire », aucun chiffre inventé.
- Pas de « zéro théorie » : les notions audio (amplitude, fréquence, EQ, compression, dBFS, LUFS, True Peak, échantillonnage…) sont expliquées clairement, pour des vidéastes.
- Ton pro, factuel, non moralisateur, positionnement premium.

## Nouveaux textes (FR)

**Accroche** (reprise de la couverture)
« Du tournage à la finition : méthodes concrètes, workflows et checklists pour un son professionnel. »

**Sous-titre**
« La première formation audio pensée exclusivement pour les vidéastes et monteurs. Comprendre ce que le son apporte à vos images, et savoir le traiter vous-même quand le projet le permet. »

**Ce que cette formation règle** (le parcours réel d'un projet)
- Au tournage : gain mal réglé, micro mal placé, pas de room tone. Les problèmes partent dès la captation.
- Au montage : coupes sèches, « pocs », pas de fades ni de J/L-cuts, pistes désorganisées.
- Au mix : niveaux qui changent d'une scène à l'autre, voix couverte par la musique, master qui sature.
- À la livraison : volume incohérent selon la plateforme, pas de stems ni de version M&E, aucun contrôle qualité.

**La promesse**
« Comprendre pourquoi le son compte autant que l'image, puis acquérir une méthode reproductible pour livrer vous-même une bande-son propre et maîtrisée sur les projets qui le permettent. »

**L'approche**
« Un langage pensé pour les vidéastes : chaque notion et chaque terme technique est expliqué clairement, puis appliqué pas à pas dans Premiere Pro, Final Cut Pro, DaVinci Resolve et CapCut. Un chapitre par étape, un exercice pour valider. Les 25 techniques prêtes à tourner indiquent aussi des plugins tiers pour aller plus loin. »

**L'auteur** (nouveau bloc, faits tirés du livre)
« Guillaume Surget, ingénieur du son et sound designer chez Global Drip Studio. Il a travaillé sur des projets pour Porsche (Type7), Canyon Bicycles, Ambit Components, Pulsor Agency et Ultrack Agency, aux côtés de vidéastes professionnels. La formation est née de leurs questions de terrain. »

**Ce que vous recevez** : inchangé, avec deux précisions tirées du livre : exemples d'écoute A/B, et mini pack de samples (risers et impacts).

**Au programme** : 11 chapitres inchangés + étude de cas ajoutée aux annexes.

**Aperçu** : pages 1 à 5 du PDF (couverture, sommaire, introduction) affichées en images et agrandissables au clic. Le PDF complet reste privé.

## Corrections annexes
- Retirer le lien « Voir la fiche détaillée » de la Boutique.
- Traduction EN fidèle de tout le nouveau contenu.

## Hors périmètre
Prix (89 €), paiement, mise en page générale.

## Détails techniques
- `fr.json` / `en.json` : `boutique.subtitle`, nouvelle clé `boutique.tagline`, `ebookSell.pains.items`, nouvelles clés `ebookSell.promise`, `ebookSell.approach` et `ebookSell.author` ; `includes` et `program.annexes` mis à jour.
- `EbookSellingBlocks` : blocs promesse/approche, auteur et aperçu (lightbox via le composant Dialog existant).
- Aperçu : `pdftoppm` (pages 1 à 5) depuis le PDF importé, en assets du projet.
- `Boutique.tsx` : suppression du lien `detailsPath`.
- Vérification Playwright sur /boutique, /en/shop, /ebook, /en/ebook.

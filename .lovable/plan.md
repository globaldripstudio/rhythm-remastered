Objectif : repartir proprement sur l’outil de grille d’accords et le rendre fiable, honnête et calibrable. Le problème actuel n’est pas un simple détail de pondération : si Tirita reste bloqué sur B7, il faut reprendre la chaîne complète de décision au lieu d’empiler des rustines.

Acte 1 — Diagnostic reproductible
- Ajouter un mode diagnostic interne pour l’analyse d’accords, sans changement visuel majeur.
- Pour chaque mesure : capturer le chroma, la basse, les 5 meilleurs candidats, leur score brut, leur score après bonus/malus, la marge, la confiance et les raisons de rejet.
- Objectif : savoir si B7 vient du signal chroma, du template, du bonus tonal, de la basse, des extensions ou de l’agrégation.
- Sortie attendue : une trace claire permettant de comparer Tirita mesure par mesure.

Acte 2 — Assainir le moteur acoustique
- Séparer strictement le score audio brut des aides musicales.
- Réécrire le score de template autour de trois critères lisibles : présence des notes de l’accord, pénalité des notes incompatibles, cohérence de basse.
- Détecter d’abord les triades stables (`maj`, `min`, `sus4`) avant les enrichissements.
- Les accords 7/maj7/m7 ne doivent plus concourir au même niveau que les triades tant que la triade n’est pas fiable.
- Objectif : arrêter les accords “intelligents mais faux” et privilégier un accord simple mais probable.

Acte 3 — Gating strict des enrichissements
- Ajouter une 7e seulement en post-traitement, à partir du chroma de la mesure entière.
- Pour une dominante 7 : la 7e mineure doit être clairement présente, sinon fallback automatique vers majeur.
- Pour maj7/m7 : même logique, avec seuils distincts mais explicites.
- Les extensions 9/11/13 restent décoratives et ne doivent jamais influencer l’identité principale de l’accord.
- Objectif : empêcher définitivement les faux B7, A7, E7 générés par un fragment spectral faible.

Acte 4 — Décision par mesure d’abord
- La mesure devient l’unité principale de reconnaissance.
- Les beats servent uniquement à confirmer, repérer une mesure instable ou signaler une coupe plus fine.
- Si une mesure est contradictoire, la confiance baisse au lieu de verrouiller un faux accord.
- Les segments consécutifs ne sont fusionnés que si la confiance et la stabilité sont suffisantes.
- Objectif : obtenir une grille musicale lisible plutôt qu’une moyenne de beats bruités.

Acte 5 — Réintroduire le prédictif comme garde-fou, pas comme pilote
- Le calcul prédictif ne choisit jamais un accord absent du top acoustique plausible.
- Il sert uniquement à départager des candidats proches et jouables dans la tonalité ou la progression précédente.
- Pondération très faible, bornée, désactivée quand la marge acoustique est nette.
- Les degrés impossibles ou très improbables sont pénalisés, mais jamais au point d’écraser le signal.
- Objectif : retrouver l’idée du builder guidé “Accords & Gamme” sans recréer un verrouillage harmonique.

Acte 6 — Calibration sur morceaux tests
- Utiliser Tirita comme cas prioritaire de non-régression.
- Ajouter au moins 3 profils de test : boucle simple diatonique, morceau full mix dense, progression avec vraies dominantes 7.
- Comparer avant/après : accord principal, qualité, confiance, stabilité par mesure.
- Objectif : ne plus valider une correction “au feeling”.

Acte 7 — Finition UX honnête
- Garder l’UI actuelle, sans refonte visuelle.
- Rendre les états d’incertitude plus clairs : confiance basse, accord approximatif, mesure ambiguë.
- Conserver l’édition manuelle et l’export MIDI, mais ne pas les mélanger avec le chantier moteur.
- Objectif : un outil utilisable même quand l’audio ne permet pas une certitude totale.

Ordre d’exécution recommandé : Acte 1 → Acte 2 → Acte 3 → test Tirita → Acte 4 → test Tirita → Acte 5 → calibration complète → Acte 7.

Fichiers principaux concernés :
- `src/lib/chordRecognition.ts`
- `src/lib/musicTheory/chords.ts` uniquement pour le prédictif / transitions
- `src/components/tools/ChordGrid.tsx` uniquement si on affiche les états d’incertitude

Hors scope pour cette refonte :
- changer l’upload audio
- changer l’export MIDI
- réintroduire les mini-pianos
- ajouter une dépendance lourde
- promettre une reconnaissance parfaite sur tous les full mixes
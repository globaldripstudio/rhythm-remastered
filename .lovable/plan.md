Constat : oui, le résultat est clairement inacceptable. Le prior prédictif a été intégré trop fort et au mauvais niveau : il peut verrouiller la séquence sur un accord stable, ici B7, au lieu de rester un simple arbitre entre candidats acoustiquement proches.

Plan de correction :

1. Rendre le prior prédictif non destructif
- Le prior Markov ne pourra plus imposer un accord absent du signal.
- Il ne s’appliquera qu’entre candidats acoustiquement plausibles, avec un poids beaucoup plus faible.
- Il sera désactivé quand le meilleur candidat acoustique est nettement devant.

2. Corriger le Viterbi actuel
- Remplacer l’usage des candidats du beat précédent par le vrai chemin décodé précédent.
- Éviter que la pénalité de changement + la transition neutre de répétition favorisent artificiellement “le même accord partout”.
- Supprimer ou réduire fortement la pénalité de changement au niveau beat, puis lisser plutôt au niveau mesure.

3. Sécuriser les dominantes 7 partout
- Ajouter un gating spécifique aux accords `7` : la 7e mineure doit être réellement présente, sinon fallback vers majeur.
- Ne pas autoriser une dominante non diatonique à devenir une solution par défaut juste parce qu’elle est stable dans le prior.

4. Agrégation par mesure plus fiable
- Recalculer le meilleur accord directement sur le chroma de la mesure, puis utiliser les beats seulement comme vote secondaire.
- Si les 4 beats sont faibles/contradictoires, afficher une confiance basse plutôt que répéter un accord sûr mais faux.

5. Débogage visible mais discret
- Ajouter en interne des raisons de score exploitables pour calibrer Tirita et d’autres morceaux.
- Optionnel côté UI ensuite : afficher “beta / confiance basse” quand l’analyse harmonique est trop ambiguë.

Fichiers concernés :
- `src/lib/chordRecognition.ts`
- potentiellement `src/lib/musicTheory/chords.ts` si la transition doit être adoucie

Hors scope de ce correctif :
- changer l’upload audio
- changer l’export MIDI
- réintroduire les mini-pianos
- faire une reconnaissance parfaite multi-instruments ; l’objectif immédiat est d’arrêter les faux verrouillages massifs et de rendre la grille honnête.
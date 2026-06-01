L'outil ne bloque plus sur un seul accord. Les actes 2, 3 et 5 sont en place (triades d'abord, gating des 7e, prédictif réduit à un tie-break). Les vraies faiblesses restantes sont : la décision par mesure n'est pas encore robuste, on n'a aucune calibration sérieuse, et l'UI ne dit pas quand elle hésite. Voici la suite, en 4 étapes ciblées.

Étape A — Décision par mesure vraiment solide (Acte 4 complet)
- La mesure reste l'unité de décision, mais on renforce trois points :
  - Stabilité intra-mesure : si les beats d'une mesure désignent des triades incompatibles, on baisse la confiance au lieu de trancher arbitrairement.
  - Fusion de mesures consécutives : on ne fusionne deux mesures en un seul accord affiché que si même triade ET confiance correcte des deux côtés.
  - Détection de mesure ambiguë : marquer explicitement les mesures où aucun candidat ne sort clairement, plutôt que d'inventer un accord propre.
- Objectif : éliminer les "faux accords nets" qui apparaissent encore sur les passages bruités.

Étape B — Calibration sur cas tests (Acte 6)
- Geler 3 morceaux de référence :
  - Tirita (cas qui a tout déclenché).
  - Une boucle diatonique simple (vérifier qu'on ne casse rien de basique).
  - Un morceau avec vraies dominantes 7 (vérifier que le gating des 7e ne tue pas les vraies 7e).
- Pour chaque morceau, capturer une trace : accord retenu, qualité, confiance, marge, top 3 candidats par mesure.
- Sauvegarder ces traces comme référence de non-régression (fichier interne, pas d'UI).
- Tout changement futur du moteur doit être comparé à ces traces avant d'être validé.

Étape C — UX honnête sur l'incertitude (Acte 7)
- Dans `ChordGrid`, distinguer visuellement trois états sans refonte :
  - accord confiant (rendu actuel),
  - accord approximatif (confiance moyenne, marge faible),
  - mesure ambiguë (aucun candidat clair).
- Garder le label d'accord lisible, ajouter seulement un indicateur discret (opacité, point, liseré).
- Ne pas toucher à l'édition manuelle ni à l'export MIDI.

Étape D — Nettoyage et garde-fous
- Retirer les rustines devenues inutiles depuis la refonte (anciens biais Markov résiduels, anciens bonus tonals doublons).
- Vérifier que le mode diagnostic (`localStorage.chordGridDebug = "1"`) couvre bien les nouveaux états (mesure ambiguë, fusion refusée, 7e rejetée).
- Documenter brièvement dans le code les seuils clés (gating 7e, marge tie-break, seuil ambiguïté) pour pouvoir les régler sans relire toute la logique.

Ordre d'exécution : A → B (test Tirita + 2 autres) → C → D.

Hors scope :
- Refonte visuelle de l'outil.
- Nouvelle dépendance d'analyse audio.
- Réintroduction des mini-pianos.
- Promesse de reconnaissance parfaite sur full mix dense.

Fichiers concernés :
- `src/lib/chordRecognition.ts` (étapes A et D).
- `src/components/tools/ChordGrid.tsx` (étape C uniquement, affichage incertitude).
- Référence de calibration : nouveau fichier interne sous `src/lib/chordRecognition/__fixtures__/` pour les traces (étape B).
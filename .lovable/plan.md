Je vais remplacer l’approximation actuelle par un calcul LUFS plus strictement aligné sur BS.1770 / EBU R128, afin de rapprocher le LUFS intégré de loudness.info.

Plan d’implémentation :

1. Remplacer le K-weighting approximatif
   - Retirer le chaînage actuel `highpass + highshelf` basé sur les filtres WebAudio approximatifs.
   - Implémenter directement les filtres numériques BS.1770 avec coefficients biquad précis :
     - pré-filtre high-shelf K-weighting,
     - filtre high-pass RLB.
   - Appliquer ces filtres canal par canal sur les samples décodés avant tout calcul d’énergie.

2. Corriger le calcul d’énergie multicanal
   - Calculer la loudness sur les samples K-weighted.
   - Sommer correctement l’énergie des canaux selon BS.1770 pour stéréo/mono.
   - Conserver les modes “Stéréo”, “Mono gauche”, “Mono droite”, mais avec un comportement plus rigoureux.

3. Rendre le gating intégré plus conforme EBU R128
   - Utiliser des blocs de 400 ms avec recouvrement cohérent.
   - Appliquer :
     - gate absolu à -70 LUFS,
     - moyenne préliminaire,
     - gate relatif à -10 LU,
     - loudness intégrée finale sur les blocs retenus.
   - Éviter les biais liés aux silences de fin de morceau.

4. Améliorer les valeurs affichées
   - Garder le LUFS intégré comme valeur principale.
   - Clarifier les libellés “momentary” et “short-term” si besoin pour éviter de les confondre avec le LUFS global.
   - Continuer à afficher les maximums momentary/short-term, plus utiles musicalement que la dernière valeur si le morceau finit par un silence.

5. Mettre à jour le rapport PDF
   - Actualiser la méthodologie pour indiquer une conformité BS.1770 plus stricte.
   - Garder la courbe LUFS et la direction artistique actuelle du rapport.

6. Vérification
   - Lancer le build TypeScript.
   - Si possible, tester avec le fichier WAV fourni et comparer le nouveau LUFS intégré avec la référence loudness.info `-9.1 LUFS`.
   - L’objectif est de réduire fortement l’écart, en gardant en tête que de petites différences peuvent subsister selon les détails d’implémentation, décodage navigateur et arrondis.
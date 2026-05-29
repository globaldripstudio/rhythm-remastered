## Améliorations de l'AI Song Checker — Recommandations

### Problème résolu
Suppression du ratio IA/Humain et recalibrage du scoring pour éliminer le biais hybride sur les morceaux 100 % humains.

### Recommandations par ordre de valeur décroissante

1. Explication du verdict
   Pour chaque bloc (spectral / temporel / global), afficher les 2–3 marqueurs les plus déterminants pour le verdict courant.
   → Crédibilise le résultat, aide l’utilisateur à comprendre pourquoi.

2. Indicateur de confiance
   Remplacer le ratio par un bandeau « Confiance : Élevée / Moyenne / Faible » calculé sur :
   - Durée du fichier (n < 10 s = faible)
   - Qualité d’encodage (détection MP3 bas débit)
   - Niveau de bruit / distorsion
   → Prévient les faux positifs dus à un mauvais fichier source.

3. Profil de ressemblance IA
   Comparer le vecteur de marqueurs à des profils pré-enregistrés de générateurs connus (Suno, Udio, MusicGen, AIVA).
   Afficher un classement type : « Ressemble le plus aux sorties Suno v3 (68 %) ».
   → Différenciateur fort, répond au vrai besoin « de quelle IA s’agit-il ? »

4. Export de rapport
   Bouton « Télécharger le rapport » qui génère un récapitulatif PNG/PDF avec :
   - Nom du fichier, date, verdict
   - Pourcentages des 3 catégories
   - Mesures détaillées
   → Utile pour les labels, avocats (contentieux droit d’auteur), producteurs.

5. Alertes qualité audio
   Détecter au décodage si le fichier présente des caractéristiques qui réduisent la fiabilité :
   - Trop court (< 5 s)
   - Trop compressé (MP3 128 kbps ou moins)
   - Trop bruité (SNR < 20 dB)
   - Mono artificiel (stereoCorr > 0.99 mais canaux non identiques)
   → Avertissement visuel : « Résultats moins fiables — fichier trop court »

6. Historique local (localStorage)
   Sauvegarder automatiquement chaque analyse (date, nom, verdict global).
   Panneau latéral ou section dépliable pour recharger une analyse précédente.
   → Pratique pour comparer plusieurs versions d’un même morceau au fil du mastering.

7. Mini visualisation spectrale
   Un graphe simple de l’enveloppe spectrale (énergie par bande mel moyennée) ou un mini spectrogramme 2D.
   → Rend l’outil plus « scientifique » et visuellement impressionnant pour les clients.

### Pistes non prioritaires (si demandées)
- Analyse batch (dossier entier)
- Mode comparaison A/B (deux fichiers côte à côte)
- Détection de segment (analyse par fenêtre de 10 s pour repérer la partie IA dans un morceau hybride)

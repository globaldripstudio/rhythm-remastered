# Parcours de commande, dépôt de fichiers et hiérarchie des CTA

## Objectif
Rendre les quatre achats à prix fixe transparents avant paiement, puis offrir un parcours premium entièrement sur le site : confirmation claire, dépôt privé des fichiers et suivi côté studio, sans demander au client de préparer un lien externe.

## 1. Trois étapes propres à chaque offre
- Remplacer les trois textes génériques de la fenêtre « Acheter » par un récapitulatif propre au service sélectionné.
- Étape 1 : paiement sécurisé et rappel exact de l’offre.
- Étape 2 : e-mail de confirmation avec lien privé vers l’espace d’envoi du site.
- Étape 3 : délai compté après réception et validation de tous les fichiers, avec le nombre exact de révisions :
  - Mixage + Mastering, identifié actuellement par le badge « Premium » : **3–5 jours, 3 révisions**.
  - Mixage + Mastering Essentiel : **24–48 h, 2 révisions**. Les 4 h représentent le temps de travail compris dans le tarif, pas le délai de livraison.
  - Stem Mastering : **24–48 h, 2 révisions**.
  - Mixage hybride : **3–5 jours, 3 révisions**.
- Reporter la correction du délai Essentiel partout où il est présenté, en français et en anglais, pour éviter toute contradiction.

## 2. Confirmation de paiement et dépôt premium sur le site
- Ajouter un traitement sécurisé de la confirmation Stripe pour les services, séparé du parcours e-book, avec contrôle de signature et protection contre les doublons.
- Enregistrer chaque commande payée côté serveur et créer un lien d’envoi privé, non devinable et limité à la commande concernée.
- Envoyer un e-mail bilingue selon la langue choisie au paiement, contenant : service acheté, délai, révisions, point de départ du délai et bouton vers l’espace d’envoi.
- Remplacer sur la page de succès les consignes WeTransfer/Drive par l’accès direct à cet espace.
- Créer une page d’envoi sans compte client : plusieurs WAV/ZIP et autres formats audio, progression visible, **2 Go maximum par fichier**, liste des fichiers déposés et confirmation finale.
- Au-delà de 2 Go par fichier, afficher clairement qu’il s’agit probablement d’un morceau volumineux ou d’un projet EP/album et proposer un échange direct avec le studio au lieu de bloquer sans solution.
- Garder les fichiers dans un espace privé ; aucune lecture publique directe. Le lien client ne donne accès qu’à sa commande et les fichiers restent consultables par l’administrateur autorisé.
- Informer le studio lorsqu’un dépôt est finalisé afin que la validation des fichiers et le démarrage du délai soient explicites.

## 3. Hiérarchie des boutons
- Conserver la hiérarchie déjà cohérente sur les cartes : « Plus d’infos » en secondaire, puis « Acheter » ou « Réserver » en action principale selon le service.
- Dans la fiche flottante d’une offre à prix fixe, inverser la hiérarchie actuelle :
  - **Acheter** devient l’action principale mise en couleur.
  - **Échanger avant de commander** devient l’action secondaire, moins accentuée, et mène au formulaire.
- Pour les offres non achetables, conserver **Réserver** comme seule action principale.
- Harmoniser les états survol, focus clavier, chargement et contraste avec les boutons historiques, sans créer une nouvelle couleur concurrente.

## 4. CTA après les outils et traductions
- Vérifier et conserver les apparitions convenues :
  - Audio→MIDI après une conversion : Essentiel + Stem Mastering.
  - Loudness Analyzer après une analyse : Mixage + Mastering + Stem Mastering.
  - AI Song Checker après une analyse : Pack Single.
  - Accords & gammes au bas de l’outil : Pack Single.
- Vérifier les liens « Plus d’infos », « Acheter » et « Parler de mon projet », ainsi que la présélection du service dans le formulaire.
- Compléter toutes les nouvelles chaînes en français et en anglais, y compris erreurs, dépassement de taille, confirmation de dépôt et e-mail.

## 5. Validation
- Ajouter des tests ciblés sur les règles commerciales : délais et révisions exacts des quatre offres, limite de 2 Go, refus d’un service non autorisé et impossibilité de réutiliser une confirmation Stripe.
- Tester les fenêtres et boutons sur ordinateur et mobile, le dépôt multi-fichiers, le cas supérieur à 2 Go, les quatre emplacements post-outil et les deux langues.
- Vérifier le paiement en environnement de test, la réception de l’e-mail, l’ouverture du lien privé et la visibilité des fichiers côté studio.

## Détails techniques
- Les prix restent exclusivement déterminés par la liste serveur existante ; le navigateur ne choisit jamais un montant.
- Les commandes et jetons d’envoi seront stockés dans des tables privées, inaccessibles directement aux visiteurs ; les opérations publiques passeront par des fonctions serveur limitées et validées.
- Le stockage sera privé avec URLs d’envoi temporaires, limite serveur de 2 Go et limitation de débit sur les points d’entrée.
- Le traitement Stripe sera idempotent et n’enverra l’e-mail qu’après paiement confirmé.

# Ajouter Macro Forex aux partenaires et créer un carrousel

## Résultat attendu
- Ajouter une septième carte **Macro Forex** dans « Nous avons les meilleurs partenaires » avec le logo fourni.
- Au clic, ouvrir la même fenêtre que pour les partenaires existants et y afficher la vidéo YouTube `NIEd0tHLy74`.
- Afficher les crédits fournis, avec **Sound Design/mixage : Guillaume SURGET** mis en évidence comme sur les autres collaborations.
- Utiliser le lien YouTube fourni pour le bouton externe de cette collaboration.

## Carrousel des partenaires
- Conserver les dimensions, le style et l’alignement actuels des cartes.
- Remplacer la grille par une seule rangée horizontale qui défile lentement et en boucle de droite vers la gauche.
- Dupliquer visuellement la série de cartes pour obtenir une boucle continue sans saut, sans dupliquer leur contenu dans la fenêtre ouverte.
- Mettre le défilement en pause au survol de la rangée et lorsqu’une carte reçoit le focus clavier.
- Sur mobile, garder une seule ligne et permettre le défilement tactile naturel.
- Respecter la préférence système de réduction des animations en désactivant le mouvement automatique.

## Détails techniques
- Héberger le logo fourni comme ressource du projet et l’importer dans la liste des partenaires.
- Ajouter une animation CSS dédiée basée sur la largeur exacte d’une série de cartes, avec masquage horizontal du débordement.
- Conserver les boutons accessibles, les libellés d’image et le fonctionnement actuel de la fenêtre partenaire.

## Vérifications
- Vérifier la boucle, la pause au survol, le clic sur chaque copie visuelle et l’ouverture de la bonne vidéo.
- Contrôler l’affichage sur ordinateur et mobile sans changement de largeur du reste de la page.
- Vérifier que la compilation reste valide et qu’aucune autre section du site ne change.

# Repositionner la Boutique : vendre une formation complète

## Constat
La page dit « Le seul produit disponible à ce jour : un manuel de terrain… » : formulation d'inventaire, qui ne dit ni ce qu'on achète (formation PDF + ressources audio), ni pourquoi elle est unique. Les ressources audio, samples et cheatsheets n'apparaissent nulle part.

## Angle retenu
Accroche = résultat concret, preuve = kit complet et programme détaillé, argument de fond = la première formation audio pensée exclusivement pour les vidéastes.

## Structure de la page (FR, traduite à l'identique en EN)

1. **En-tête**
   - Badge : Formation PDF + ressources audio
   - Titre : Formation au Sound Design pour Vidéastes et Monteurs (inchangé)
   - Sous-titre : « La première formation audio pensée exclusivement pour la vidéo. Des méthodes concrètes, des checklists et des workflows pour faire sonner vos images dès cette semaine. »
   - Bloc prix existant : 89 €, accès immédiat, bouton « Obtenir la formation — 89 € ».

2. **Ce que cette formation règle** (tiré de l'introduction, ton factuel) : heures perdues en post-production, coupes approximatives, « pocs » disgracieux, rendu sonore qui change d'une scène à l'autre, mix qui saturent.

3. **Ce que vous recevez**
   - Formation PDF de 70 pages, téléchargeable et imprimable
   - Exemples audio à écouter dans presque tous les chapitres
   - Samples prêts à l'emploi pour le sound design (sweeps et impacts)
   - 2 cheatsheets imprimables
   - Un plan d'entraînement sur 5 semaines, avec des objectifs pour chaque semaine
   - Ressources audio téléchargeables et écoutables en ligne
   - Aucun chiffre sur le nombre d'audios ou de samples.

4. **Aperçu** : pages 1 à 5 du PDF en images, consultables en grand au clic.

5. **Au programme** : les 11 chapitres, des bases vers la pratique avancée :
   1. Mettre le son au service de l'image (notions clés)
   2. Les fondamentaux (sans école d'ingé son)
   3. Captation terrain (gagner à l'enregistrement)
   4. Hygiène de montage (gestes qui changent tout)
   5. Outils natifs par logiciel
   6. Mettre son projet à tempo
   7. Design sonore créatif (du « propre » au « puissant »)
   8. 25 techniques prêtes à tourner
   9. Export, normalisation et livrables
   10. Travailler avec un ingénieur du son / sound designer (optionnel)
   11. Dépannage & contrôle qualité
   - Annexes : checklists imprimables, glossaire concis, plan d'entraînement (5 semaines)

6. **Pour qui** : vidéastes et monteurs en priorité; convient aussi aux créateurs de contenu et aux débutants en audio. Aucune base requise. Compatible Premiere Pro, Final Cut Pro, DaVinci Resolve et CapCut.

7. **Une question ?** : contact par email avec l'adresse du studio, puis rappel du bouton d'achat.

**SEO** : titre et description mentionnant formation PDF pour vidéastes, exemples audio, samples et checklists.

## Cohérence avec la fiche e-book
Les mêmes blocs « Ce que vous recevez » et « Au programme » sont ajoutés à la fiche détaillée. Sa description pour Google, qui parle à tort de « formation mixage audio », est corrigée.

## Hors périmètre
Prix, paiement, couverture et style général restent identiques.

## Détails techniques
- Textes dans les sections `boutique` et `ebook` de `fr.json` / `en.json` (`pains`, `includes`, `chapters`, `audience`, `contact`), et `seo.ebook`.
- Composant partagé `EbookSellingBlocks` utilisé par `Boutique.tsx` et `Ebook.tsx` ; icônes lucide et jetons de couleur existants.
- Aperçu : les pages 1 à 5 sont converties en images avec `pdftoppm` depuis le PDF de formation, puis stockées en assets publics. Seules ces 5 pages sont publiques ; le PDF complet reste privé. Si le PDF n'est pas récupérable depuis l'espace privé, il faudra l'importer dans le chat.

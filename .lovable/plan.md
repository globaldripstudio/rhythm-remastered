# Repositionner la Boutique : vendre une formation complète, pas « un produit »

## Constat
La page dit « Le seul produit disponible à ce jour : un manuel de terrain… » : formulation d'inventaire, qui ne dit ni ce qu'on achète (formation PDF + ressources audio), ni pourquoi elle est unique. Les ressources audio, samples et cheatsheets n'apparaissent nulle part.

## Angle retenu
Accroche = résultat concret, preuve = kit complet, argument de fond = l'unique formation audio pensée pour la vidéo.

## Nouveau contenu (FR, traduit à l'identique en EN)

**Badge** : Formation PDF + ressources audio

**Titre** : Formation au Sound Design pour Vidéastes et Monteurs (inchangé)

**Sous-titre** : « La première formation audio pensée exclusivement pour la vidéo. Faites sonner vos montages comme un pro, sans dépendre d'un ingénieur son. »

**Bloc « Ce que vous recevez »** (nouveau, liste avec icônes) :
- Formation PDF de 70 pages, téléchargeable et imprimable
- Exemples audio à écouter à presque tous les chapitres, pour entendre chaque technique
- Pack de samples prêts à l'emploi pour le sound design (sweeps et impacts)
- Cheatsheets imprimables à garder à côté de votre poste de montage
- Toutes les ressources audio téléchargeables et écoutables en ligne

**Bloc « Pour qui »** (court) : vidéastes et monteurs en priorité; convient aussi aux créateurs de contenu et aux débutants en audio. Aucune base requise.

**Bloc « Ce que cette formation règle »** (tiré de l'introduction, ton factuel) : heures perdues en post-production, coupes approximatives, « pocs » disgracieux, son qui change d'une scène à l'autre, mix qui saturent.

**Bloc « Au programme »** (aperçu du sommaire, repliable) :
- Design sonore créatif : ambiances, silence et dynamique, ponctuation des titres, reverb/pitch/reverse, layering
- 25 techniques prêtes à tourner
- Export et livrables : cibles LUFS/True Peak, formats, stems, contrôle qualité, piste M&E, ADR
- Travailler avec un ingénieur du son
- Dépannage, templates et étude de cas
- Annexes : checklists imprimables, glossaire, plan d'entraînement sur 5 semaines

**Les 3 atouts existants** conservés et reformulés (5 semaines pour devenir autonome / Premiere Pro, Final Cut, DaVinci, CapCut / sans jargon inutile).

**Bloc prix** : 89 €, « Accès immédiat après paiement », « Mises à jour gratuites », bouton « Obtenir la formation — 89 € ».

**SEO** : titre et description mentionnant formation PDF, exemples audio, samples et cheatsheets.

## Cohérence avec la fiche e-book
Ajout du même bloc « Ce que vous recevez » sur la fiche détaillée, et correction de sa description SEO actuelle, qui parle à tort de « formation mixage audio ».

## Hors périmètre
Prix, paiement, couverture et mise en page générale restent tels quels.

## Détails techniques
- Textes dans les sections `boutique` et `ebook` de `fr.json` / `en.json` (clés `includes.*`, `audience.*`), et `seo.ebook`.
- `Boutique.tsx` et `Ebook.tsx` : rendu d'une liste d'éléments inclus (icônes lucide : FileText, Headphones, AudioWaveform, ListChecks, Download) avec les jetons de couleur existants.

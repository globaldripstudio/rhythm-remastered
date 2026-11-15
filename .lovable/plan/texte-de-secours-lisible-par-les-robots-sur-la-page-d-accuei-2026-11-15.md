# Texte de secours lisible par les robots sur la page d'accueil

## Objectif
Le code brut de la page d'accueil ne contient aucun texte visible (zone principale vide). On y place un résumé du studio, que les robots qui ne lancent pas le JavaScript (certains robots d'IA, aperçus de liens) pourront lire. Les visiteurs ne voient aucun changement : le site remplace ce texte dès qu'il s'affiche.

## Contenu (français, ton pro, uniquement des infos déjà publiées sur le site)
- Titre principal : Global Drip Studio — studio d'enregistrement, mixage, mastering et sound design à Martigues
- Courte présentation du studio
- Liste des services avec liens : Mixage, Mastering, Mixage + Mastering, Stem Mastering, Mixage hybride, Captation sonore, Direction artistique / arrangement, Composition / Beatmaking, Sound design, Formation MAO / mixage, Pack Single
- Boutique : formation Sound Design pour vidéastes et monteurs (89 €)
- Outils gratuits avec liens : Audio→MIDI, Loudness Analyzer, AI Song Checker, Key & BPM Finder, Accords & gammes
- Contact : adresse, téléphone, e-mail, horaires (repris du schéma déjà présent)
- Lien vers la version anglaise

## Garde-fous
- Aucun texte inventé : tout est repris de llms.txt et du schéma existant.
- Aucun changement visuel, aucun impact sur le suivi des visites.
- Texte caché aux visiteurs pendant le chargement (pas de flash de texte brut).

## Détails techniques
- Insertion dans `<div id="root">` d'index.html, balisage sémantique (h1/h2/ul/a/address); `createRoot().render` l'écrase au montage.
- Style inline minimal pour masquer visuellement sans `display:none` (rester lisible par les robots).
- Vérification : curl du HTML brut (texte présent) + Playwright (rendu identique, aucune erreur console).

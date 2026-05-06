## 1. Mentions légales — Hébergeur OVHcloud

Remplacer la mention Lovable par OVHcloud (FR + EN), sans aucune mention de Lovable ailleurs.

**`src/i18n/locales/fr.json`** (clés `legalPages.mentions.s3*`) — remplacer `s3host`, `s3hostDesc`, `s3hostContact` par :
- `s3host`: "OVHcloud (OVH SAS)"
- `s3hostAddress1`: "2 rue Kellermann"
- `s3hostAddress2`: "59100 Roubaix — France"
- `s3hostRcs`: "RCS Lille Métropole 424 761 419 00045"
- `s3hostPhone`: "Téléphone : +33 9 72 10 10 07"
- `s3hostSite`: "Site : https://www.ovhcloud.com"

**`src/i18n/locales/en.json`** — mêmes clés, traductions EN équivalentes.

**`src/pages/MentionsLegales.tsx`** — remplacer le bloc `s3hostDesc`/`s3hostContact` par les 5 nouvelles lignes (adresse, RCS, téléphone, site).

## 2. CTA "Demander un devis" → scroll direct vers #contact

Bug actuel : sur les pages outils, le CTA `ContactCTA` ramène d'abord à la section Services puis glisse vers Contact. Cause : le `setTimeout(scroll, 500)` après `navigate('/')` ne suffit pas toujours, et un autre scroll (probablement lié au hash ou au re-render) intervient entre-temps.

**`src/components/ContactCTA.tsx`** — fiabiliser le scroll :
- Polling court (jusqu'à ~1.5 s) qui attend que `#contact` existe dans le DOM avant de scroller, plutôt qu'un `setTimeout` fixe.
- Toujours scroller vers `#contact` directement (jamais via `#services`).
- Conserver le déclenchement de `highlight-phone` après l'arrivée.

Aucun autre fichier impacté pour ce point — le comportement sur la homepage reste identique (scroll smooth direct).

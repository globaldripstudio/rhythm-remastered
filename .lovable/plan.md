# Audio → MIDI : fiabiliser l'outil et transformer son trafic en clients

## 1. Ce que disent vos données (90 derniers jours, base du site)

| Indicateur | Valeur | Lecture |
| :--- | :--- | :--- |
| Sessions sur /audio-to-midi | **1 644** (1 971 vues) | Vous avez raison : c'est de loin la 1re porte d'entrée |
| /key-bpm-finder | 224 | 7x moins |
| /ai-song-checker | 164 | 10x moins (outil récent) |
| /loudness (FR + EN) | 151 | 11x moins |
| Page d'accueil / | 614 | |
| /services + /contact | **30** au total | Presque personne n'atteint l'offre |
| Clics « Devis » depuis l'encart de l'outil MIDI | 16 | ~1 % des visiteurs MIDI |
| Formulaires de contact envoyés | **2** en 90 jours (8 depuis mars) | |
| Ventes e-book payées | **0** | |
| Origine | USA 1 065, France 529, Belgique 146, Allemagne 116, Brésil 64… | **~75 % hors France** |

Évolution mensuelle des sessions MIDI : mai 82 → juin 173 → juillet 624 → août 693 → septembre 412 → octobre (12 jours) 154. Le pic d'été retombe : la qualité de l'outil et la fidélisation comptent maintenant.

Parcours après l'outil MIDI : seulement 128 sessions vont ensuite sur l'accueil ; les autres restent dans les outils (accords 67, loudness 61, key-bpm 58). **Les visiteurs MIDI sont des beatmakers et compositeurs du monde entier, anglophones, qui cherchent un outil gratuit — pas un studio à Paris.** Leur vendre une séance studio en présentiel ne peut pas fonctionner ; il faut une offre en ligne, en dollars/euros, achetable en 2 clics.

## 2. Pourquoi l'outil « coupe » les notes et rate des notes d'accords

Causes identifiées dans les réglages actuels (pas dans le modèle lui-même) :

1. **Seuils trop stricts** : seuil de début de note 0,70 et seuil de tenue 0,45, contre 0,5 / 0,3 recommandés par Spotify. Une note tenue dont l'énergie décroît passe sous 0,45 et s'arrête trop tôt ; les notes internes d'un accord (plus faibles) n'atteignent jamais 0,70 et disparaissent.
2. **Option « mélodie » activée** dans l'extraction : elle favorise une ligne principale et supprime des notes simultanées — exactement le symptôme « accords incomplets ».
3. **Durée minimale 120 ms** et fusion des notes répétées : utile contre le bruit, mais efface les notes brèves des accords arpégés.
4. **Filtres de nettoyage** (tonalité, accords) qui peuvent retirer jusqu'à 30 % des notes : si la détection d'accord se trompe, de vraies notes sont jetées.

Les benchmarks publics confirment que la fin des notes est le point faible de tous les modèles de ce type ; le début des notes est fiable [3](https://scorestarling.com/blog/ai-music-transcription-accuracy). On peut donc corriger la tenue nous-mêmes à partir des données de tenue que le modèle fournit déjà.

### Améliorations proposées (dans l'ordre, sans changer de modèle)

- **A. Recalibrer les seuils par profil sonore** (piano/accords, guitare, voix/mélodie, synthé) au lieu d'un réglage unique ; désactiver l'option « mélodie » sauf en profil mono.
- **B. Tenue de note fidèle** : prolonger chaque note tant que le modèle la « voit » encore sonner, avec un seuil de fin plus bas que le seuil de début (hystérésis), et tolérer de courtes chutes (< 80 ms) dues à la réverbération ou au vibrato.
- **C. Complétion des accords** : quand un accord est détecté avec bonne confiance et qu'une de ses notes est fortement présente dans le spectre mais absente du MIDI, la réinsérer avec la même durée que les autres notes de l'accord (jamais l'inverse : on n'efface plus de notes « hors accord » tenues).
- **D. Option « quantifier la durée »** : aligner les fins de notes sur la grille du BPM détecté (désactivée par défaut).
- **E. Banc de test** : 8 à 10 extraits de référence (accords plaqués piano, arpèges guitare, mélodie voix, nappe synthé) avec leur MIDI exact, mesure automatique du taux de notes trouvées, des notes en trop et de la justesse des durées, pour prouver chaque amélioration chiffres à l'appui avant mise en ligne.

Option plus lourde, à décider plus tard : un second modèle spécialisé piano (meilleur sur les tenues), proposé uniquement en profil « Piano ».

## 3. Convertir ce trafic mondial — constats du marché et mesures radicales

Ce que font les studios en ligne qui convertissent :
- **Prix fixes affichés par titre**, en dollars : Maxcren 49 $ master / 99 $ mix+master [2](https://maxcren.com/mixing-mastering) ; Major Mixing 79 $ à 540 $, révisions et délai inscrits [1](https://majormixing.com/pricing/).
- **Essai gratuit sans carte ni compte** : 30 s masterisées gratuitement [3](https://maxcren.com/free-mastering-sample), échantillon en 24 h [5](https://razikmastering.com/free-mastering-sample/).
- **L'outil gratuit est branché directement sur l'offre** : Razik place un analyseur de loudness juste sur sa page d'essai gratuit [5](https://razikmastering.com/free-mastering-sample/).
- **Preuve sociale chiffrée** (notes, crédits, « vrais ingénieurs, pas d'algorithme »).

Mesures proposées pour votre site :
1. **Après chaque conversion MIDI, un encart contextuel** (en anglais pour les visiteurs non français) : « Votre idée mérite une vraie prod — mix/master à prix fixe » plutôt que l'actuel « Devis ».
2. **Offre en ligne à prix fixe payable par Stripe** (vous avez déjà Stripe) : par ex. Master 49 €, Mix + Master 129 €, Beat / arrangement à partir de votre MIDI, avec délai et révisions affichés.
3. **Aimant à prospects** : « Recevez votre fichier MIDI nettoyé + un pack de 5 grilles d'accords » contre un email → liste pour relances et promos.
4. **Essai gratuit** : « 30 secondes de votre titre masterisées gratuitement » depuis les pages loudness et AI checker.
5. **Page dédiée « Online mixing & mastering »** en anglais, liée depuis tous les outils, avec avant/après audio (vos comparateurs existants) et crédits.
6. **Mesure** : suivre le chemin outil → encart → offre → paiement dans votre dashboard.

## Questions à trancher avant de construire
- Prix et formules exacts que vous acceptez de proposer en ligne (les montants ci-dessus sont des exemples).
- Acceptez-vous de proposer un essai gratuit de 30 s (temps de travail pour vous) ?
- Ordre de livraison : je recommande d'abord la partie 2 (A, B, C, E), puis l'offre en ligne et l'encart post-conversion.

## Détails techniques
- `basicPitch.ts` : seuils par profil (onset 0,5 / frame 0,3 en polyphonique), `melodiaTrick` false hors mono, `minNoteDuration` 60 ms en polyphonique ; garder les matrices `frames` pour le post-traitement.
- Nouvelle passe `extendSustain` dans `postProcess.ts` : prolongation sur la matrice de frames avec seuil de fin ≈ 0,6 × seuil frame et tolérance de trous de 3–4 frames.
- Nouvelle passe `completeChords` : réinsertion des pitch classes de l'accord présentes dans le chroma/frames > seuil, dans le registre de l'accord ; `passChordAware` ne retire plus de notes > 150 ms.
- Banc de test Vitest + fichiers de référence dans le projet, métriques onset F1 et onset+offset F1 (tolérances 50 ms / 20 %).
- Conversion : nouveau composant d'encart post-résultat i18n FR/EN, produits Stripe à prix fixe, page offre en ligne, événements analytics `midi_offer_view` / `midi_offer_click` / `checkout_start`.

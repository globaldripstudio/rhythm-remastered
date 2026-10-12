# Audio → MIDI : fiabiliser l'outil et transformer son trafic en clients

## 1. Ce que disent vos données (90 derniers jours)

| Indicateur | Valeur | Lecture |
| :--- | :--- | :--- |
| Sessions sur /audio-to-midi | **1 644** | 1re porte d'entrée, de très loin |
| /key-bpm-finder · /ai-song-checker · /loudness | 224 · 164 · 151 | 7 à 11x moins |
| /services + /contact | **30** | Presque personne n'atteint l'offre |
| Clics « Devis » depuis l'outil MIDI | 16 | ~1 % des visiteurs MIDI |
| Formulaires envoyés | **2** (8 depuis mars) | |
| Ventes e-book payées | **0** | |
| Visiteurs hors France | **~75 %** (USA 1 065 sessions) | Public mondial, anglophone |

Sessions MIDI par mois : mai 82 → juillet 624 → août 693 → septembre 412 → octobre (12 j) 154. Après l'outil MIDI, les visiteurs restent dans les autres outils ; seuls 128 passent par l'accueil.

## 2. Améliorations Audio → MIDI (validées)

Principe : **un seul moteur, fiable sur tout type d'audio** (full prod, piano, sample, mono ou polyphonique), sans second modèle ni choix supplémentaire pour l'utilisateur.

- **A. Réglages adaptés automatiquement + analyse tonalité/tempo cachée** : l'audio passe d'abord, sans que ce soit affiché, par le même moteur que le Key & BPM Finder. Tonalité et tempo fiables sont ainsi connus avant la retranscription. Le profil sonore (dense, accords, mélodie seule) est détecté automatiquement et ajuste les seuils : plus de notes internes d'accords conservées, option « mélodie » désactivée hors son monophonique.
- **B. Tenue de note fidèle au son d'origine** : une note dure tant qu'elle sonne réellement dans l'audio ; tolérance aux micro-coupures (réverbération, vibrato) ; comportement calé sur le profil détecté (note piquée reste courte, nappe reste longue).
- **C. Complétion des accords** : une note de l'accord détecté, clairement présente dans le son mais absente du MIDI, est réinsérée avec la même durée que ses voisines. On ne supprime plus de notes longues jugées « hors accord ».
- **D. Option « caler les durées sur le tempo »** (désactivée par défaut), basée sur le tempo détecté ou saisi.
- **E. Calibrage ensemble : en suspens** jusqu'à ce que vous puissiez fournir des extraits audio et leur MIDI exact. Le banc de mesure sera prêt pour ce moment-là.

## 3. Conversion

Ton général des encarts : professionnel et disponible, jamais moralisateur. Aucun jugement sur le résultat de l'utilisateur ; on montre notre travail (cartes, lecteurs avant/après) et on laisse l'envie d'acheter venir de l'écoute.

1. **Encart après chaque conversion MIDI** (FR/EN) : offre beatmaker mise en avant (voir plus bas), lecteur d'exemple, boutons « Plus d'infos » et « Acheter ».
2. **Double bouton Stripe sur les offres à prix fixe** (Mixage + Mastering 250 €, Essentiel 140 €, Mixage hybride 190 €, Stem Mastering 60 €, Pack Single 690 €) :
   - sur la carte : « Plus d'infos » à gauche, « Acheter » à droite, même ligne, mise en page inchangée ;
   - dans la fenêtre détaillée : un bouton « Acheter » en plus de l'actuel « Réserver / Devis ».
   - Les offres « Sur devis » ou à l'heure gardent uniquement le parcours actuel.
   - Après paiement : page de confirmation + email avec les instructions d'envoi des fichiers.
3. Abandonné (aimant à prospects).
4. Abandonné (essai gratuit).
5. **Loudness Analyzer** : après analyse, encart sobre « Besoin d'un master pro ? » qui ouvre les cartes « Mixage + Mastering » et « Stem Mastering » (aucune carte « Mastering » seule n'existe aujourd'hui ; Stem Mastering est la plus proche), avec leurs lecteurs d'exemple.
6. **Pack Single après l'AI Song Checker et en bas de l'outil Accords & gammes**, même format d'encart.

Offre beatmaker après Audio → MIDI : **Mixage + Mastering | Essentiel (140 €)** en principal — elle est conçue pour les instrumentales en .wav —, avec **Stem Mastering (60 €)** comme alternative d'entrée de gamme.

## 4. Rapport comparatif : votre site face aux studios en ligne qui convertissent

| Critère | Global Drip Studio | Maxcren | Major Mixing | Razik Mastering |
| :--- | :--- | :--- | :--- | :--- |
| Prix affichés | Oui, en €, libellés FR | 49 $ master, 99 $ mix+master [2](https://maxcren.com/mixing-mastering) | 79 $ à 540 $ par titre [1](https://majormixing.com/pricing/) | Non visible sur la page d'essai |
| Achat direct | **Non** : toute réservation renvoie au formulaire de contact | Prix fixe par single, devis pour EP/album [2](https://maxcren.com/mixing-mastering) | Commande par titre | Envoi du fichier puis échange |
| Ce qui est inclus | Détails dans une fenêtre | Délai 2–4 jours, 1 révision [2](https://maxcren.com/mixing-mastering) | **6 révisions, 2–3 jours, week-ends inclus** [1](https://majormixing.com/pricing/) | Livraison 24 h [5](https://razikmastering.com/free-mastering-sample/) |
| Preuve sociale | Partenaires, crédits | « Une vraie personne, pas un preset » | **4,8★ sur 300+ avis** [1](https://majormixing.com/pricing/) | « 100 % ingénieurs humains » |
| Outil gratuit relié à l'offre | Outils excellents mais déconnectés de l'achat | — | — | **Analyseur de loudness placé sur la page de l'offre** [5](https://razikmastering.com/free-mastering-sample/) |
| Langue / devise | FR d'abord, € | EN, $ | EN, $ | EN |

Constats radicaux :
- **Votre problème n'est ni le prix ni la qualité : c'est l'absence de bouton « Acheter ».** Vos prix sont dans la fourchette des concurrents, mais un visiteur américain doit remplir un formulaire et attendre une réponse. Les concurrents vendent un titre en quelques clics.
- **Le message « humain, pas un algorithme »** est l'argument central chez tous. Vous avez mieux : un vrai studio hybride analogique, des crédits réels, et des outils gratuits reconnus. Il faut le dire au moment où l'utilisateur obtient son résultat.
- **Délai et nombre de révisions affichés en gros** rassurent un acheteur à distance ; c'est absent de vos cartes.
- **Les avis clients chiffrés** manquent : récolter quelques avis Google auprès de vos clients passés serait un gain fort et rapide.

## Prochaines étapes
1. Partie 2 (A, B, C, D) + banc de mesure ; calibrage (E) plus tard.
2. Boutons « Acheter » Stripe sur les cartes et dans les fenêtres des offres à prix fixe.
3. Encarts après Audio → MIDI, Loudness, AI Song Checker et Accords & gammes.

## Détails techniques
- Réutiliser le moteur tonalité/BPM de KeyBpmFinder (extrait en module partagé) en amont de `audioToMidiNotes`, en remplacement de l'estimation actuelle de `musicalContext.ts`.
- `basicPitch.ts` : seuils dérivés du profil auto (densité polyphonique estimée sur les frames), `melodiaTrick` uniquement si monophonique, conservation des matrices frames/onsets.
- `postProcess.ts` : passe `extendSustain` (hystérésis sur frames, trous ≤ 3–4 frames), passe `completeChords`, `passChordAware` ne retire plus les notes > 150 ms, passe optionnelle `quantizeDurations`.
- Banc de test Vitest : onset F1 et onset+offset F1 (tolérances 50 ms / 20 %).
- Stripe : produits/prix pour chaque carte à prix fixe, réutilisation de `create-payment`, email de confirmation avec instructions d'envoi ; événements analytics `offer_view`, `offer_click`, `checkout_start`.
- Encarts i18n FR/EN dans AudioToMidi et Loudness, liens vers les fenêtres des cartes existantes.

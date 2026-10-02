# AI Song Checker — neutraliser les marqueurs spectraux sur fichiers compressés

## Constat

La coupure haute fréquence d'un son généré par IA n'est **pas distinguishable** de celle d'un MP3 : les deux plafonnent typiquement entre 15 et 20 kHz. S'appuyer sur `hfCutoff` / `rolloff85` quand le fichier est un MP3 produit des faux positifs "IA". Solution : détecter la compression avec pertes, et neutraliser ces marqueurs dans ce cas.

## Ce qui sera fait

### 1. Détecteur de compression avec pertes (`src/lib/aiSongCheck.ts`)
- Mesurer la **raideur de la coupure spectrale** : une chute brutale (> seuil) sur quelques bins seulement = signature de codec (mur de briques), pas un roll-off naturel.
- Comparer la fréquence de coupure aux **coupures caractéristiques des codecs** : ~15/16 kHz (MP3 128), ~17-18 kHz (MP3 192, AAC), ~20 kHz (MP3 320, Opus). Tolérance ±500 Hz.
- Vérifier le **plancher de bruit au-dessus de la coupure** : énergie quasi nulle et plate = codec.
- Résultat : `compressionDetected: boolean` + `codecGuess` (ex. "MP3 ~128 kbps") à titre informatif.

### 2. Neutralisation des marqueurs
- Si compression détectée : retirer `hfCutoff` et `rolloff85` du vote (poids redistribués sur les 14 autres marqueurs), car ils mesurent alors le codec, pas l'origine du son.
- Les autres marqueurs (dynamique, transitoires, phase, artefacts temporels...) restent actifs — ils ne sont pas affectés par la coupure HF.
- Si pas de compression : comportement actuel inchangé.

### 3. Affichage
- Pastille d'info dans les résultats : « Compression avec pertes détectée (ex. MP3) — les marqueurs de bande passante ont été neutralisés pour éviter un faux positif. » (FR + EN)
- Le score global reste affiché, calculé sur les marqueurs restants.

## Détails techniques
- Fichier unique modifié : `src/lib/aiSongCheck.ts` (+ clés i18n FR/EN dans `AISongChecker.tsx` ou le fichier de traduction existant).
- Pas de nouvelle dépendance, analyse toujours 100 % locale dans le navigateur.
- Vérification : build OK + test navigateur sur un MP3 128 kbps (doit afficher la pastille et ne pas pénaliser le score) et sur un WAV non compressé (comportement inchangé).

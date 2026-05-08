## Refonte de l'interprétation automatique (Loudness)

### Esprit

Aiguillage de précision, pas verdict. On **décrit** avant de qualifier, on **contextualise** sans prescrire, on **alerte** uniquement sur faute technique objective. La récompense pour l'utilisateur est la densité d'information utile par analyse, pas un ton bienveillant.

L'écart au LUFS cible est **déjà visible** dans l'en-tête de la box d'interprétation (`Cible : LUFS … TP ≤ X dBTP`). On ne le répète donc pas dans le texte. L'interprétation se concentre sur la **lecture qualitative** que l'utilisateur ne peut pas tirer d'un seul chiffre.

### Cadre éditorial

Sortie : **1 à 2 lignes adaptatives**, FR + EN, factuelle, sans qualificatifs flatteurs ni verdicts esthétiques.

#### Ligne 1 — Lecture contextuelle (toujours)

Décrit le master en termes de densité, dynamique macro, transitoires, sans répéter les valeurs déjà affichées en en-tête. Aucune mention "+X LU au-dessus/en dessous" puisque l'écart est lisible en en-tête.

Exemples FR :
- Dans la plage : *"Densité dans la plage du sous-genre, dynamique macro et transitoires préservés."*
- Légèrement au-dessus (≤ +2 LU au-dessus du haut) : *"Densité dans la zone haute du sous-genre, lecture cohérente avec les références récentes."*
- Marqué au-dessus (> +2 LU) : *"Densité au-delà des références récentes du sous-genre."*
- Légèrement en dessous (≤ −2 LU sous le bas) : *"Lecture plus aérée que les références du sous-genre."*
- Marqué en dessous (> −2 LU) : *"Macro-dynamique nettement plus large que les références du sous-genre."*

Tolérance ±1 LU avant qu'on parle d'écart (la phrase "dans la plage" couvre cette zone).

#### Ligne 2 — Point d'attention technique (uniquement si justifié)

Ajoutée seulement quand une mesure est **objectivement** problématique. Aucune mention de codecs (AAC/MP3) — focus streaming lossless + supports physiques. Une seule alerte max, par ordre de priorité :

1. **TP ≥ 0 dBTP** : *"True peak {valeur} dBTP : clipping inter-sample mesuré."*
2. **TP > cible du genre mais < 0** : *"True peak {valeur} dBTP : marge de sécurité serrée par rapport à la cible du sous-genre."*
3. **PLR < 5 dB** : *"PLR {valeur} dB : transitoires fortement écrasés, signature d'un limiteur très poussé."*
4. **LRA effondré (< plancher du genre − 2 LU)** : *"LRA {valeur} LU vs ≥ {plancher} LU typique : macro-dynamique très resserrée pour le sous-genre."*

Hors de ces cas : pas de ligne 2. Le PLR n'est jamais qualifié de "sain" ou "agressif" — on le mentionne seulement pour signaler la faute.

### Changements code

1. **`src/lib/loudnessTargets.ts`**
   - Étendre la signature de `buildInterpretation` pour recevoir `plr` (déjà calculé dans `Loudness.tsx`).
   - Réécrire la sélection de `mainLine` selon les 5 cas ci-dessus (FR + EN), sans mention chiffrée d'écart LUFS.
   - Réécrire la logique de la ligne d'alerte : priorité TP ≥ 0 > TP > cible > PLR < 5 > LRA effondré. Une seule ligne.
   - Constantes internes : `PLR_CRITICAL = 5`, helper `lraCollapsed = lraMin && loudnessRange < lraMin - 2`.
   - Le commentaire d'en-tête conserve la mention "lossless streaming + physical, no codec warnings ever".

2. **`src/pages/Loudness.tsx`** (ligne 454)
   - Passer `plr: result.plr` dans l'objet measurement transmis à `buildInterpretation`.
   - Aucune autre modification UI. La box des cibles affiche déjà la plage LUFS et le TP cible (ligne 811), donc l'utilisateur a le contexte nécessaire pour interpréter sans répétition dans le texte.

3. **i18n**
   - Aucune clé i18n à ajouter : les phrases sont construites en dur dans `buildInterpretation` selon `lang`, ce qui permet l'insertion propre des valeurs chiffrées dans la ligne 2.

### Validation

- `tsc --noEmit` doit passer.
- Test mental sur 4 profils :
  - Master loud "propre" du genre → 1 ligne (lecture contextuelle), pas d'alerte.
  - Master très loud avec PLR effondré → 2 lignes (lecture + PLR).
  - Master dans la plage avec TP +0.2 dBTP → 2 lignes (lecture + clipping).
  - Master très dynamique sur du metal → 1 ligne (lecture aérée), pas d'alerte.
- Vérifier que les rapports PDF reflètent les nouvelles phrases (mêmes appels à `buildInterpretation`).

### Ce qu'on ne change PAS

- UI de l'analyseur, courbe LUFS, en-tête de cibles, mode neutre (sans genre).
- Valeurs de référence par sous-genre dans `GENRE_GROUPS`.
- i18n existante en dehors de `buildInterpretation`.

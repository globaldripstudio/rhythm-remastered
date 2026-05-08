## Diagnostic — pourquoi l'upload échoue sur mobile (iOS & Android)

Les deux outils utilisent le même pattern :

```tsx
<label htmlFor="audio-upload-...">
  <input id="..." type="file" accept="audio/*" className="sr-only" .../>
  ...
</label>
```

Trois causes cumulées qui cassent le flux mobile :

1. **`accept="audio/*"` est trop restrictif sur mobile**
   - iOS Safari ouvre par défaut la bibliothèque musicale Apple (DRM, pas de `.wav`/`.flac`/`.aiff` exposés).
   - Chrome/Android propose souvent uniquement l'enregistreur vocal ou une liste vide selon le MIME déclaré du fichier.
   - Beaucoup de fichiers audio stockés dans Files / Drive / Dropbox ont un MIME générique (`application/octet-stream`) → ils sont filtrés et invisibles.

2. **Input caché dans un `<label>` avec `sr-only`**
   - Sur certains navigateurs mobiles (Safari iOS notamment), un input positionné hors écran ou de taille 0 ne reçoit pas toujours le tap propagé via le label → le picker ne s'ouvre pas du tout.

3. **La zone est aussi un drop zone**
   - `onDragOver`/`onDrop` n'existent pas sur mobile, mais ne bloquent rien. En revanche, l'absence d'un bouton/CTA explicite "Choisir un fichier" laisse l'utilisateur sans signal clair que la zone est tappable.

## Plan de correction

Appliqué de façon identique à `Loudness.tsx`, `KeyBpmFinder.tsx`, et par cohérence à `AudioToMidi.tsx`.

### 1. Élargir `accept` pour montrer tous les fichiers audio
Remplacer `accept="audio/*"` par une liste explicite extensions + MIME — la présence d'extensions force iOS/Android à ouvrir le sélecteur de documents (Files / Drive) plutôt que la bibliothèque musicale :

```
accept=".mp3,.wav,.m4a,.aac,.flac,.ogg,.oga,.aiff,.aif,.opus,.webm,audio/*"
```

### 2. Déclencher le picker via une ref + bouton explicite
Au lieu de compter sur le `<label htmlFor>` + input `sr-only` (fragile sur mobile) :
- garder l'`<input>` caché mais utiliser `useRef` ;
- ajouter un bouton "Choisir un fichier" + rendre la zone entière cliquable via `onClick={() => inputRef.current?.click()}` ;
- conserver le drag & drop pour desktop (no-op sur mobile, pas gênant).

### 3. Validation côté JS plutôt que filtrée par `accept`
Dans `handleFile`, vérifier `file.type.startsWith('audio/')` OU extension dans la liste autorisée, et afficher un toast clair en cas de fichier non supporté. Ça évite de bloquer un fichier valide mal étiqueté par le système (cas fréquent depuis Drive/Dropbox).

### 4. UX mobile claire
- Pictogramme upload + libellé "Touchez pour choisir un fichier" visible ≤ sm, "Glissez ou cliquez" ≥ sm.
- Garder la zone min 240px (déjà OK).

### Fichiers à modifier
- `src/pages/Loudness.tsx` — input + handler
- `src/pages/KeyBpmFinder.tsx` — input + handler
- `src/components/tools/AudioToMidi.tsx` — même fix pour cohérence
- `src/i18n/locales/fr.json` & `en.json` — wording upload (mobile/desktop) + message d'erreur "format non supporté"

### Hors périmètre
- Pas de changement back-end : tout reste 100 % côté navigateur (Web Audio API, conforme à la promesse "aucun fichier envoyé").
- Pas de PWA / Capacitor : on reste sur navigateur mobile standard.

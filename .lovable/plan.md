## Objectif

Permettre à l'admin de réinitialiser son mot de passe par email depuis l'écran `/admin`, avec un flux complet et sécurisé.

## Parcours utilisateur

```text
/admin (LoginForm)
   │
   │ clic « Mot de passe oublié »
   ▼
/admin/forgot-password
   │ saisie email → envoi du lien
   ▼
[Email reçu par l'utilisateur]
   │ clic sur le lien
   ▼
/reset-password   (avec token de récupération dans le hash)
   │ saisie nouveau mot de passe + confirmation
   ▼
Redirection /admin → connexion automatique
```

## Ce qui sera créé / modifié

### 1. `src/components/admin/LoginForm.tsx` — modifié
Ajout d'un lien `Mot de passe oublié ?` discret sous le champ mot de passe, qui navigue vers `/admin/forgot-password`.

### 2. `src/pages/AdminForgotPassword.tsx` — nouveau
Page publique (hors `AdminContent`/`AuthProvider` admin) avec :
- Champ email + bouton « Envoyer le lien »
- Appel : `supabase.auth.resetPasswordForEmail(email, { redirectTo: \`${window.location.origin}/reset-password\` })`
- Confirmation neutre quel que soit le résultat (pas d'enumeration d'emails) : « Si un compte existe avec cette adresse, vous allez recevoir un email. »
- Lien retour vers `/admin`

### 3. `src/pages/ResetPassword.tsx` — nouveau
Page publique (route `/reset-password`) avec :
- Détection du token de récupération via `supabase.auth.onAuthStateChange` (événement `PASSWORD_RECOVERY`)
- Si pas en mode recovery : message d'erreur + lien vers `/admin/forgot-password`
- Champs : nouveau mot de passe + confirmation, validation basique (≥ 8 caractères, identiques)
- `supabase.auth.updateUser({ password })` puis redirection vers `/admin` après 2 s
- Toasts pour succès/erreur

### 4. `src/App.tsx` — modifié
Ajout de deux routes publiques :
- `/admin/forgot-password` → `AdminForgotPassword`
- `/reset-password` → `ResetPassword`

Mise à jour du test `pathname.startsWith("/admin")` pour aussi masquer le `LiveChat` sur `/reset-password`.

## Détails techniques

- **Sécurité** : `resetPasswordForEmail` ne révèle jamais si l'email existe (Supabase Auth retourne toujours succès côté client). Le toast de confirmation est neutre.
- **Auth state** : sur `/reset-password`, écouter `onAuthStateChange` AVANT de tester la session (pattern Supabase obligatoire). L'événement `PASSWORD_RECOVERY` est émis automatiquement quand la page est ouverte via le lien email.
- **Pas de nouvelle table** : le flux est 100% géré par Supabase Auth.
- **Pas de configuration manuelle d'email** : Supabase envoie un email de récupération par défaut (template intégré). Si vous voulez un email avec votre marque (Global Drip Studio), c'est un second chantier optionnel — je peux le proposer après.
- **i18n** : les pages affichent le contenu en français (cohérent avec le reste de l'admin qui n'est qu'en français).

## Hors périmètre

- Personnalisation de l'email envoyé par Supabase (template par défaut utilisé).
- Politique de complexité avancée du mot de passe (HIBP, etc.) — dispo en option si vous voulez.
- Limitation du nombre de demandes par IP (Supabase applique déjà un rate limit).
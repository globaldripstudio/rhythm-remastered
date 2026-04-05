

# Plan : Système e-book protégé avec lecteur PDF plein écran

## Résumé

Mettre en place un système complet d'achat, d'authentification client, et de lecture en ligne de l'e-book avec un lecteur PDF immersif plein écran, téléchargeable et imprimable.

## Architecture

```text
ACHAT                    BACKEND                      CLIENT
┌──────────┐   webhook   ┌──────────────────┐   login   ┌─────────────┐
│ Stripe   │────────────▶│ ebook_purchases  │◀──────────│ /ebook/login│
│ Checkout │             │ (table)          │           └──────┬──────┘
└──────────┘             └──────────────────┘                  │
                                                               ▼
┌──────────┐   upload    ┌──────────────────┐   serve   ┌─────────────┐
│ Admin    │────────────▶│ ebook-files      │──────────▶│/ebook/reader│
│ Dashboard│             │ (storage bucket) │           │ PDF plein   │
└──────────┘             └──────────────────┘           │ écran       │
                                                        └─────────────┘
```

## Étapes

### 1. Base de données

- Créer table `ebook_purchases` : `id`, `email`, `stripe_session_id`, `created_at`
- RLS : un utilisateur authentifié ne peut lire que sa propre ligne (email = auth.email())
- Les admins peuvent tout lire

### 2. Storage bucket `ebook-files`

- Bucket privé pour stocker le PDF
- Pas d'accès public direct — servi uniquement via Edge Function

### 3. Edge Function `stripe-ebook-webhook`

- Écoute `checkout.session.completed` depuis Stripe
- Insère l'email du client dans `ebook_purchases`
- Configurer le webhook dans Stripe avec le bon endpoint

### 4. Edge Function `serve-ebook`

- Vérifie le JWT de l'utilisateur
- Vérifie que son email est dans `ebook_purchases`
- Retourne le PDF depuis le bucket avec les headers appropriés pour permettre le téléchargement et l'impression
- Deux modes : `view` (inline) et `download` (attachment)

### 5. Pages client

**`/ebook/login`** — Connexion/inscription client
- Formulaire email + mot de passe
- À chaque connexion : `signOut({ scope: 'global' })` avant le sign-in pour invalider les autres sessions (anti-partage)
- Redirige vers `/ebook/reader` si achat validé

**`/ebook/reader`** — Lecteur PDF plein écran
- Route protégée (redirige si non connecté ou pas d'achat)
- **Lecteur immersif plein écran** : le PDF occupe 100% du viewport, pas de header ni footer du site
- Barre d'outils minimale en overlay (semi-transparente, auto-hide) avec :
  - Bouton télécharger (appelle `serve-ebook?mode=download`)
  - Bouton imprimer (`window.print()` ou impression via iframe)
  - Navigation de pages (précédent/suivant, numéro de page)
  - Bouton plein écran natif (Fullscreen API)
  - Bouton retour/déconnexion
- Utilisation de `react-pdf` (bibliothèque basée sur PDF.js) pour le rendu natif dans le navigateur
- Zoom adaptatif : le PDF s'adapte à la largeur de l'écran par défaut, avec possibilité de zoomer

### 6. Mise à jour du flow d'achat

- Modifier `create-payment` pour inclure `customer_email` et activer le webhook
- Mettre à jour `PaymentSuccess` pour inviter le client à créer son compte avec un lien vers `/ebook/login`

### 7. Dashboard Admin — Section E-book

- Nouvel onglet dans le dashboard admin
- Upload de PDF (remplace le fichier existant dans le bucket)
- Affichage de la date de dernière mise à jour
- Liste des achats récents (emails, dates)

## Détails techniques

- **react-pdf** : rendu page par page du PDF dans un composant React, avec contrôle total sur le zoom, la navigation, et le style — pas d'iframe externe
- **Anti-partage** : invalidation globale des sessions à chaque login = 1 seul appareil connecté à la fois
- **Téléchargement** : le bouton déclenche un fetch authentifié vers `serve-ebook?mode=download`, le fichier est servi avec `Content-Disposition: attachment`
- **Impression** : le PDF est chargé dans un iframe caché et `iframe.contentWindow.print()` est appelé, ou directement via `window.print()` avec un style d'impression dédié
- **Sécurité** : aucune URL publique vers le PDF, tout passe par l'Edge Function avec vérification JWT + achat


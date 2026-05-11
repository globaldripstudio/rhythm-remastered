## Objectif

Mettre en place un protocole anti-bruteforce sur `/admin` avec ces règles :
- Tentative avec un email ≠ `globaldripstudio@gmail.com` → **blocage permanent de l'IP**
- 10 échecs en moins de 5 minutes → **blocage permanent de l'IP**
- Sinon, 5 échecs consécutifs → **blocage temporaire 15 min**

## Architecture

Le contrôle se fait dans une **Edge Function** `admin-login-guard` appelée AVANT `signIn`. Le rate-limit natif Supabase Auth reste en complément.

```text
LoginForm
   │
   ▼
Edge Function admin-login-guard ──► Tables admin_login_attempts + admin_ip_blocklist
   │ (allowed?)                            ▲
   ▼                                       │
supabase.auth.signInWithPassword           │
   │                                       │
   ├─ succès ──► reset des compteurs ──────┘
   └─ échec  ──► incrément + verdict ──────┘
```

## Schéma DB

**`admin_ip_blocklist`** (IP bloquées)
- `ip_address` (PK), `reason` (`wrong_email` | `burst` | `repeated_failures`), `blocked_until` (NULL = permanent), `created_at`

**`admin_login_attempts`** (historique court, purgé > 24h)
- `id`, `ip_address`, `email_attempted`, `success`, `created_at` + index `(ip_address, created_at desc)`

RLS : `anon` et `authenticated` → DENY total. Seul l'admin peut lire / supprimer (pour déblocage manuel).

Trigger d'audit (`audit_trigger_row`) attaché aux deux tables comme les autres tables sensibles.

## Edge Function `admin-login-guard`

**Public** (`verify_jwt = false`) — appelée avant connexion.

Trois actions via `{ action }` dans le body :

1. **`check`** `{ email }` 
   - Récupère IP via `x-forwarded-for`
   - Si IP dans `admin_ip_blocklist` (et `blocked_until` non expiré ou NULL) → `403 { blocked: true, reason, until }`
   - Si `email !== 'globaldripstudio@gmail.com'` → insert blocklist permanent + log attempt(success=false) + `403`
   - Compte les échecs récents pour cette IP :
     - ≥10 dans les 5 dernières min → blocklist permanent → `403`
     - ≥5 dans les 15 dernières min → blocklist 15 min → `403`
   - Sinon → `200 { allowed: true }`

2. **`record_failure`** `{ email }` (appelé après échec `signIn`)
   - Insert `admin_login_attempts(success=false)`
   - Re-évalue immédiatement les seuils 10/5min et 5/15min, applique blocklist si dépassé

3. **`record_success`** `{ email }` (appelé après succès `signIn`)
   - Insert `admin_login_attempts(success=true)`
   - Pas de reset (l'historique se purge tout seul après 24h)

Sécurité de la function :
- Validation Zod du body
- Utilise la `SUPABASE_SERVICE_ROLE_KEY` (les tables sont DENY pour anon/authenticated)
- Jamais d'info détaillée renvoyée au client (juste « accès bloqué »)

## Modifications front

**`LoginForm.tsx`** :
- Avant `signIn`, appeler `supabase.functions.invoke('admin-login-guard', { body: { action: 'check', email } })`
- Si `blocked` → toast « Accès temporairement bloqué » + désactivation du formulaire pendant `until - now`
- Après échec `signIn` → `record_failure`
- Après succès `signIn` → `record_success`

**Compteur visible** : afficher discrètement « X tentative(s) restante(s) avant blocage » à partir du 3ᵉ échec (côté client uniquement, indicatif).

## Onglet admin "Sécurité"

Nouveau composant `src/components/admin/SecurityPanel.tsx` ajouté au Dashboard :
- Liste des IP bloquées (avec raison, date, expiration)
- Bouton « Débloquer » par ligne (DELETE row)
- Liste des 50 dernières tentatives (succès/échec, IP, email, date)

## Purge automatique

Fonction SQL `purge_old_login_attempts()` qui supprime `admin_login_attempts` > 24h. Appelée au début de chaque exécution de `admin-login-guard` (faible coût, pas besoin de cron).

## Risque accepté

- L'IP est lue via `x-forwarded-for` (déjà utilisé dans le projet) → un attaquant derrière un proxy rotatif peut contourner le blocage IP. C'est inhérent à toute stratégie IP-based ; la règle « email ≠ admin » reste très dissuasive.
- Pas de CAPTCHA (refusé en faveur du verrouillage serveur).

## Étapes d'implémentation

1. Migration DB : tables, index, RLS, triggers d'audit, fonction de purge
2. Edge Function `admin-login-guard` (public, verify_jwt=false)
3. Modification `LoginForm.tsx` : flux check/record
4. Composant `SecurityPanel.tsx` + ajout onglet dans `Dashboard.tsx`
5. Test : 5 mauvaises tentatives → blocage 15 min ; email autre → blocage permanent ; déblocage manuel depuis l'admin
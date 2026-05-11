## Objectif

Mettre en place un journal d'audit complet sur la base Supabase pour détecter toute action sensible (écriture, suppression, modification) sur l'ensemble du schéma `public`, avec une interface admin dédiée et une rétention de 1 an.

## Ce qui sera créé

### 1. Table `audit_log` (base de données)

Une nouvelle table pour stocker chaque action sensible :

- **table_name** — table concernée (ex: `user_roles`, `ebook_purchases`)
- **action** — type d'opération (`INSERT`, `UPDATE`, `DELETE`)
- **row_id** — identifiant de la ligne touchée
- **actor_user_id** — utilisateur connecté à l'origine de l'action (peut être nul pour actions système / service role)
- **actor_role** — rôle Postgres ayant exécuté l'action (`anon`, `authenticated`, `service_role`)
- **old_data** / **new_data** — snapshot JSON avant/après (utile pour les UPDATE et DELETE)
- **ip_address** / **user_agent** — quand disponibles via les en-têtes de requête
- **created_at** — horodatage

### 2. Triggers automatiques sur tout le schéma `public`

Une fonction générique `audit_trigger()` (en `SECURITY DEFINER`, non exposée à l'API) sera attachée à **toutes les tables existantes du schéma public** (sauf `audit_log` elle-même et `site_analytics` qui est déjà du logging) pour les événements `INSERT`, `UPDATE`, `DELETE`.

Tables concernées : `user_roles`, `profiles`, `ebook_purchases`, `contact_leads`, `clients`, `events`, `blog_views`.

Les triggers continueront automatiquement à fonctionner même si vous ajoutez des données via les Edge Functions (service role).

### 3. RLS stricte sur `audit_log`

- Lecture : **admin uniquement** (via `has_role`)
- Écriture/UPDATE/DELETE : **interdit** à tout le monde (anon, authenticated). Seuls les triggers internes peuvent écrire.

### 4. Purge automatique (rétention 1 an)

- Une fonction `purge_old_audit_logs()` supprime les entrées de plus de 365 jours.
- Déclenchée par l'extension `pg_cron` (planification quotidienne à 3h du matin).
- Si `pg_cron` n'est pas disponible sur l'instance, fallback : la fonction reste en place et peut être appelée manuellement ; je le signalerai.

### 5. Onglet "Audit" dans l'admin

Nouveau composant `src/components/admin/AuditLog.tsx` ajouté au dashboard existant (`src/pages/Admin.tsx`) avec :

- **Filtres** : table, action (INSERT/UPDATE/DELETE), utilisateur, plage de dates
- **Tableau paginé** : horodatage, table, action, acteur, ID de ligne, IP
- **Détail au clic** : affichage du diff `old_data` → `new_data` formaté en JSON
- **Compteurs en tête** : total 24h / 7j / 30j, alerte visuelle si pic anormal d'activité

Style cohérent avec le dashboard existant (dark, accents orange/teal).

## Détails techniques

```text
Flux d'écriture :
  app/edge function ──► table sensible ──► trigger AFTER ──► audit_log
                                                ▲
                                                │
                              capture auth.uid(), current_user,
                              row OLD/NEW en JSONB
```

- La fonction trigger utilise `current_setting('request.jwt.claims', true)` pour récupérer l'utilisateur même quand l'écriture vient d'une Edge Function avec service_role.
- Les en-têtes IP/User-Agent sont extraits via `current_setting('request.headers', true)` quand PostgREST les transmet (sinon nuls — c'est attendu pour les triggers déclenchés par service_role).
- Index composé sur `(created_at DESC, table_name, action)` pour des requêtes admin rapides.
- Volume estimé : faible (< quelques milliers de lignes/mois sur ce projet), pas de risque de saturation.

## Limites connues

- Les **lectures** (SELECT) ne sont pas journalisables côté Postgres sans extension dédiée (pgaudit, indisponible sur Lovable Cloud). Si vous voulez tracer "qui a consulté quoi", il faudra passer par des Edge Functions instrumentées — à discuter dans un second temps si besoin.
- Les actions effectuées **directement via le dashboard Lovable Cloud** seront aussi journalisées (acteur = `service_role`, sans user_id).
- Les snapshots JSON peuvent contenir des données sensibles (emails, etc.) — l'accès reste strictement limité à l'admin via RLS.

## Ordre d'exécution

1. Migration : création de `audit_log`, fonction `audit_trigger()`, triggers sur toutes les tables, fonction de purge, RLS, planification cron.
2. Création du composant `AuditLog.tsx` et intégration dans `Admin.tsx`.
3. Traductions FR/EN dans `src/i18n/locales/`.
4. Test rapide : insertion d'une ligne témoin → vérification qu'elle apparaît dans l'onglet Audit.
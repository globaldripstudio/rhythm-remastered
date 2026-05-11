## Problème

Depuis le dernier durcissement de sécurité, le droit `EXECUTE` sur la fonction `public.has_role(uuid, app_role)` a été révoqué pour les rôles `anon` et `authenticated`.

Or plusieurs policies RLS l'utilisent, dont **« Admins can view all roles »** sur `user_roles`. Lorsque le client exécute `SELECT role FROM user_roles WHERE user_id=... AND role='admin'`, Postgres évalue les policies SELECT et plante avec l'erreur `permission denied for function has_role` — la requête entière échoue, même si la policy « Users can view own roles » (qui n'utilise pas `has_role`) aurait suffi à autoriser la lecture.

→ `useAdminAuth` reçoit une erreur, l'écran admin affiche « Erreur lors de la vérification des permissions », et la connexion est impossible.

Les logs Postgres confirment cette erreur répétée à chaque tentative, et les logs d'auth montrent bien des login `200 OK` immédiatement suivis d'un logout côté client.

## Correction

Une seule migration SQL :

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  TO anon, authenticated;
```

`has_role` est déjà `SECURITY DEFINER` avec `search_path = public` et ne fait qu'un `SELECT EXISTS` borné sur `user_roles` — accorder le droit EXECUTE est sans risque (c'est précisément son rôle, et toutes les policies l'utilisent déjà).

## Vérification après migration

1. Retester la connexion admin avec `globaldripstudio@gmail.com` → le tableau de bord doit s'afficher.
2. Vérifier les logs Postgres : plus aucune erreur `permission denied for function has_role`.
3. Toutes les autres tables qui utilisent `has_role` dans leurs policies (`clients`, `events`, `profiles`, `ebook_purchases`, `audit_log`, `contact_leads`, `site_analytics`) redeviennent accessibles en lecture pour l'admin.

## Aucun changement de code applicatif

Le code React (`useAdminAuth`, `LoginForm`, `Admin`) est correct — c'est uniquement le `GRANT` SQL qui manque.
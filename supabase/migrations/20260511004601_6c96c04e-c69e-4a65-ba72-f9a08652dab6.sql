
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
-- has_role must remain callable by authenticated since RLS policies reference it (executes as definer regardless, but EXECUTE grant required for policy evaluation context is not — RLS uses definer privileges of policy owner). Keep authenticated grant for safety with RPC-less usage.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

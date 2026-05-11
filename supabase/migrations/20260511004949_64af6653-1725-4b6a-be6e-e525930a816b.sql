
-- Activer les extensions nécessaires pour la planification
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Table audit_log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  row_id TEXT,
  actor_user_id UUID,
  actor_role TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX idx_audit_log_table_action ON public.audit_log (table_name, action, created_at DESC);
CREATE INDEX idx_audit_log_actor ON public.audit_log (actor_user_id, created_at DESC);

-- 2. RLS sur audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anonymous select on audit_log"
  ON public.audit_log FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "Deny all insert on audit_log"
  ON public.audit_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny all update on audit_log"
  ON public.audit_log FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny all delete on audit_log"
  ON public.audit_log FOR DELETE
  TO anon, authenticated
  USING (false);

-- 3. Fonction trigger d'audit générique
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old JSONB;
  v_new JSONB;
  v_row_id TEXT;
  v_actor_id UUID;
  v_actor_role TEXT;
  v_headers JSONB;
  v_ip TEXT;
  v_ua TEXT;
BEGIN
  -- Capture des données avant/après
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_new := NULL;
    BEGIN v_row_id := (OLD).id::text; EXCEPTION WHEN OTHERS THEN v_row_id := NULL; END;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    BEGIN v_row_id := (NEW).id::text; EXCEPTION WHEN OTHERS THEN v_row_id := NULL; END;
  ELSE -- INSERT
    v_old := NULL;
    v_new := to_jsonb(NEW);
    BEGIN v_row_id := (NEW).id::text; EXCEPTION WHEN OTHERS THEN v_row_id := NULL; END;
  END IF;

  -- Récupération de l'utilisateur connecté
  BEGIN
    v_actor_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
  END;

  -- Rôle Postgres effectif (anon, authenticated, service_role, postgres...)
  v_actor_role := current_user;

  -- En-têtes de requête (transmis par PostgREST)
  BEGIN
    v_headers := current_setting('request.headers', true)::jsonb;
    v_ip := COALESCE(
      v_headers->>'x-forwarded-for',
      v_headers->>'cf-connecting-ip'
    );
    -- Conserver uniquement la première IP en cas de chaîne x-forwarded-for
    IF v_ip IS NOT NULL THEN
      v_ip := split_part(v_ip, ',', 1);
    END IF;
    v_ua := v_headers->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
    v_ua := NULL;
  END;

  INSERT INTO public.audit_log (
    table_name, action, row_id, actor_user_id, actor_role,
    old_data, new_data, ip_address, user_agent
  ) VALUES (
    TG_TABLE_NAME, TG_OP, v_row_id, v_actor_id, v_actor_role,
    v_old, v_new, v_ip, v_ua
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Empêcher l'appel direct via l'API
REVOKE EXECUTE ON FUNCTION public.audit_trigger() FROM anon, authenticated, public;

-- 4. Attacher les triggers à toutes les tables sensibles
DO $$
DECLARE
  t TEXT;
  audited_tables TEXT[] := ARRAY[
    'user_roles', 'profiles', 'ebook_purchases',
    'contact_leads', 'clients', 'events', 'blog_views'
  ];
BEGIN
  FOREACH t IN ARRAY audited_tables LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS audit_trigger_row ON public.%I;', t
    );
    EXECUTE format(
      'CREATE TRIGGER audit_trigger_row
         AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();', t
    );
  END LOOP;
END;
$$;

-- 5. Fonction de purge (rétention 1 an)
CREATE OR REPLACE FUNCTION public.purge_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.audit_log
  WHERE created_at < (now() - interval '365 days');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purge_old_audit_logs() FROM anon, authenticated, public;

-- 6. Planification quotidienne (3h du matin UTC)
DO $$
BEGIN
  PERFORM cron.unschedule('purge-audit-log-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-audit-log-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END;
$$;

SELECT cron.schedule(
  'purge-audit-log-daily',
  '0 3 * * *',
  $$ SELECT public.purge_old_audit_logs(); $$
);

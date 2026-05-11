
-- Table des IP bloquées
CREATE TABLE public.admin_ip_blocklist (
  ip_address TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_ip_blocklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read blocklist"
  ON public.admin_ip_blocklist FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blocklist"
  ON public.admin_ip_blocklist FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon all on blocklist"
  ON public.admin_ip_blocklist FOR SELECT TO anon
  USING (false);

CREATE POLICY "Deny client insert on blocklist"
  ON public.admin_ip_blocklist FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny client update on blocklist"
  ON public.admin_ip_blocklist FOR UPDATE TO anon, authenticated
  USING (false);

CREATE TRIGGER audit_trigger_row
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_ip_blocklist
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Table des tentatives
CREATE TABLE public.admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  email_attempted TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_login_attempts_ip_time
  ON public.admin_login_attempts (ip_address, created_at DESC);

ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read attempts"
  ON public.admin_login_attempts FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon all on attempts"
  ON public.admin_login_attempts FOR SELECT TO anon
  USING (false);

CREATE POLICY "Deny client insert on attempts"
  ON public.admin_login_attempts FOR INSERT TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny client update on attempts"
  ON public.admin_login_attempts FOR UPDATE TO anon, authenticated
  USING (false);

CREATE POLICY "Deny client delete on attempts"
  ON public.admin_login_attempts FOR DELETE TO anon, authenticated
  USING (false);

-- Purge des vieilles tentatives
CREATE OR REPLACE FUNCTION public.purge_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_login_attempts
  WHERE created_at < (now() - interval '24 hours');
END;
$$;

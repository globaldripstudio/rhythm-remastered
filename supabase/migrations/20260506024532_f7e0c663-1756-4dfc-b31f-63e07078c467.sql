-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Fix contact_leads: replace blanket deny with a permissive insert for anon submissions
DROP POLICY IF EXISTS "Deny anonymous insert on contact_leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Deny anonymous select on contact_leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Deny update on contact_leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Deny delete on contact_leads" ON public.contact_leads;

CREATE POLICY "Anyone can submit a contact lead"
ON public.contact_leads FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(first_name) BETWEEN 1 AND 100
  AND length(last_name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND (message IS NULL OR length(message) <= 2000)
);

CREATE POLICY "Deny anon select on contact_leads"
ON public.contact_leads FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny update on contact_leads"
ON public.contact_leads FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny delete on contact_leads"
ON public.contact_leads FOR DELETE
TO anon, authenticated
USING (false);
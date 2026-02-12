
-- Table to store contact form leads (emails)
CREATE TABLE public.contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- Only admins can read contact leads
CREATE POLICY "Admin can read contact_leads" ON public.contact_leads
FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Edge function (service role) inserts leads, deny anon
CREATE POLICY "Deny anonymous insert on contact_leads" ON public.contact_leads
FOR INSERT WITH CHECK (false);

CREATE POLICY "Deny anonymous select on contact_leads" ON public.contact_leads
FOR SELECT USING (false);

CREATE POLICY "Deny update on contact_leads" ON public.contact_leads
FOR UPDATE USING (false);

CREATE POLICY "Deny delete on contact_leads" ON public.contact_leads
FOR DELETE USING (false);

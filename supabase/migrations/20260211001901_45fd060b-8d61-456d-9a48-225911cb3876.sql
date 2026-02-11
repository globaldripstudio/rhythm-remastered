
-- Site analytics tracking table
CREATE TABLE public.site_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL DEFAULT 'page_view', -- page_view, button_click, cta_click
  page_path TEXT NOT NULL,
  button_name TEXT, -- for click events
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  city TEXT,
  country TEXT,
  country_code TEXT,
  session_id TEXT, -- to group visits
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (for tracking from public site)
CREATE POLICY "Anyone can insert analytics"
ON public.site_analytics FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Only admin can read analytics
CREATE POLICY "Admin can read analytics"
ON public.site_analytics FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Deny anonymous reads
CREATE POLICY "Deny anonymous select on site_analytics"
ON public.site_analytics FOR SELECT TO anon
USING (false);

-- Deny updates and deletes
CREATE POLICY "Deny update on site_analytics"
ON public.site_analytics FOR UPDATE TO anon, authenticated
USING (false);

CREATE POLICY "Deny delete on site_analytics"
ON public.site_analytics FOR DELETE TO anon, authenticated
USING (false);

-- Index for performance
CREATE INDEX idx_site_analytics_created_at ON public.site_analytics(created_at DESC);
CREATE INDEX idx_site_analytics_event_type ON public.site_analytics(event_type);
CREATE INDEX idx_site_analytics_page_path ON public.site_analytics(page_path);

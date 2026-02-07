-- Create table for blog article views
CREATE TABLE public.blog_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  view_count INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read view counts (public data)
CREATE POLICY "Anyone can read blog views"
ON public.blog_views
FOR SELECT
USING (true);

-- Allow anyone to increment views (via edge function with service role)
CREATE POLICY "Anyone can update blog views"
ON public.blog_views
FOR UPDATE
USING (true);

-- Allow insert for new articles (via edge function with service role)
CREATE POLICY "Anyone can insert blog views"
ON public.blog_views
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_blog_views_updated_at
BEFORE UPDATE ON public.blog_views
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data for available articles (100 base views each)
INSERT INTO public.blog_views (slug, view_count) VALUES 
  ('venin-le-premier-sang', 100),
  ('comprendre-la-compression', 100);
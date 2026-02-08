-- Remove public INSERT and UPDATE policies from blog_views
-- The track-blog-view edge function uses SUPABASE_SERVICE_ROLE_KEY 
-- which bypasses RLS, so it can still write to the table

DROP POLICY IF EXISTS "Anyone can insert blog views" ON public.blog_views;
DROP POLICY IF EXISTS "Anyone can update blog views" ON public.blog_views;

-- Keep only the SELECT policy for public reading (already exists, but recreate to ensure it's correct)
DROP POLICY IF EXISTS "Anyone can read blog views" ON public.blog_views;
CREATE POLICY "Anyone can read blog views" 
ON public.blog_views 
FOR SELECT 
USING (true);
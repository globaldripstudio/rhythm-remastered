-- Harden user_roles and events tables RLS policies with explicit authenticated role requirement
-- This adds defense-in-depth by blocking anonymous users at the role level

-- Update user_roles SELECT policy
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Update all 4 events policies
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
CREATE POLICY "Users can view own events" 
ON public.events 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own events" ON public.events;
CREATE POLICY "Users can create own events" 
ON public.events 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own events" ON public.events;
CREATE POLICY "Users can update own events" 
ON public.events 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
CREATE POLICY "Users can delete own events" 
ON public.events 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);
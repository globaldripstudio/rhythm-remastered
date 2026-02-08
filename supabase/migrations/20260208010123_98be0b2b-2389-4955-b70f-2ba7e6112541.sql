-- Update all RLS policies on clients table to explicitly require authentication
-- This adds defense-in-depth on top of the user_id check

DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients" 
ON public.clients 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own clients" ON public.clients;
CREATE POLICY "Users can create own clients" 
ON public.clients 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients" 
ON public.clients 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" 
ON public.clients 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);
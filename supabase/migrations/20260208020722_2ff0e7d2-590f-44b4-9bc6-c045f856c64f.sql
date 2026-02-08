-- Security hardening: Add explicit deny policies for anonymous users
-- This prevents any access bypass attempts via the 'anon' role

-- 1. Deny anonymous SELECT on profiles
CREATE POLICY "Deny anonymous access on profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 2. Deny anonymous SELECT on clients  
CREATE POLICY "Deny anonymous access on clients"
ON public.clients
FOR SELECT
TO anon
USING (false);

-- 3. Deny anonymous SELECT on events
CREATE POLICY "Deny anonymous access on events"
ON public.events
FOR SELECT
TO anon
USING (false);

-- 4. Blog views: Restrict write operations (using WITH CHECK for INSERT)
CREATE POLICY "Deny anonymous insert on blog_views"
ON public.blog_views
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous update on blog_views"
ON public.blog_views
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Deny anonymous delete on blog_views"
ON public.blog_views
FOR DELETE
TO anon
USING (false);

-- 5. User roles: Restrict all write operations to prevent privilege escalation
-- Only database triggers/service role should manage roles
CREATE POLICY "Deny all insert on user_roles"
ON public.user_roles
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Deny all update on user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated, anon
USING (false);

CREATE POLICY "Deny all delete on user_roles"
ON public.user_roles
FOR DELETE
TO authenticated, anon
USING (false);

-- 6. Profiles: Add DELETE policy to control profile deletion
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
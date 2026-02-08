-- Actively use has_role() function for admin access
-- This resolves the unused SECURITY DEFINER function security finding
-- Note: Only globaldripstudio@gmail.com has admin role

-- Allow admin to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admin to view all clients
CREATE POLICY "Admins can view all clients"
ON public.clients FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admin to view all events
CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admin to view all user roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
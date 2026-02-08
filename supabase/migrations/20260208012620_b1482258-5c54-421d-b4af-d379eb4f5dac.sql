-- Add INSERT policy to profiles table to prevent unauthorized profile creation
-- Note: Profiles are typically created by the handle_new_user trigger (SECURITY DEFINER)
-- but this policy provides defense-in-depth for any direct insert attempts

CREATE POLICY "Users can create own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
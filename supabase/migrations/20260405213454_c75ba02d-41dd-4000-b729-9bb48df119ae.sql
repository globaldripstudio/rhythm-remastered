
-- Create ebook_purchases table
CREATE TABLE public.ebook_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on email to prevent duplicates
CREATE UNIQUE INDEX idx_ebook_purchases_email ON public.ebook_purchases (email);

-- Enable RLS
ALTER TABLE public.ebook_purchases ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own purchase
CREATE POLICY "Users can view own purchase"
ON public.ebook_purchases
FOR SELECT
TO authenticated
USING (lower(email) = lower(auth.email()));

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
ON public.ebook_purchases
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Block anonymous access
CREATE POLICY "Deny anonymous access on ebook_purchases"
ON public.ebook_purchases
FOR SELECT
TO anon
USING (false);

-- Block all client-side inserts (only service_role via webhook)
CREATE POLICY "Deny client insert on ebook_purchases"
ON public.ebook_purchases
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- Block updates
CREATE POLICY "Deny update on ebook_purchases"
ON public.ebook_purchases
FOR UPDATE
TO anon, authenticated
USING (false);

-- Block deletes
CREATE POLICY "Deny delete on ebook_purchases"
ON public.ebook_purchases
FOR DELETE
TO anon, authenticated
USING (false);

-- Create private storage bucket for ebook files
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-files', 'ebook-files', false);

-- Only admins can upload to ebook-files bucket
CREATE POLICY "Admins can upload ebook files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ebook-files' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can update ebook files
CREATE POLICY "Admins can update ebook files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'ebook-files' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can delete ebook files
CREATE POLICY "Admins can delete ebook files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ebook-files' AND public.has_role(auth.uid(), 'admin'));

-- No public access to ebook files (served via edge function only)
CREATE POLICY "Deny public access to ebook files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ebook-files' AND false);

-- Admins can read ebook files  
CREATE POLICY "Admins can read ebook files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'ebook-files' AND public.has_role(auth.uid(), 'admin'));

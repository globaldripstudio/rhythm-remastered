-- Remove the public INSERT policy from contact-attachments bucket
-- File uploads now happen server-side via the edge function using service role key
DROP POLICY IF EXISTS "Anyone can upload contact attachments" ON storage.objects;
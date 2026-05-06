DROP POLICY IF EXISTS "Service role can read contact attachments" ON storage.objects;

CREATE POLICY "Admins can read contact attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contact-attachments' AND has_role(auth.uid(), 'admin'::app_role));
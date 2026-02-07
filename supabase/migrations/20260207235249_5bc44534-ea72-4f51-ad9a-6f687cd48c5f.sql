-- Create storage bucket for contact attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-attachments',
  'contact-attachments',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'image/jpeg', 'image/png', 'image/gif', 'application/zip', 'application/x-zip-compressed']
);

-- Allow anyone to upload to contact-attachments bucket (public form)
CREATE POLICY "Anyone can upload contact attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'contact-attachments');

-- Allow service role to read attachments (for email sending)
CREATE POLICY "Service role can read contact attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'contact-attachments');
GRANT INSERT, DELETE ON public.ebook_purchases TO authenticated;
CREATE POLICY "Admins can grant ebook access" ON public.ebook_purchases FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can revoke ebook access" ON public.ebook_purchases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.ebook_purchases (email, stripe_session_id)
SELECT 'globaldripstudio@gmail.com', 'admin-grant'
WHERE NOT EXISTS (SELECT 1 FROM public.ebook_purchases WHERE lower(email)='globaldripstudio@gmail.com');
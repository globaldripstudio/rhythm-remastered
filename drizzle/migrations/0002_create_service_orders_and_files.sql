CREATE TABLE public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  access_token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'awaiting_files' CHECK (status IN ('awaiting_files', 'files_received', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_orders TO authenticated;
GRANT ALL ON public.service_orders TO service_role;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read service orders" ON public.service_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update service orders" ON public.service_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Deny anonymous service order access" ON public.service_orders FOR SELECT TO anon USING (false);
CREATE POLICY "Deny client service order insert" ON public.service_orders FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client service order delete" ON public.service_orders FOR DELETE TO anon, authenticated USING (false);
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.service_order_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0 CHECK (size_bytes >= 0 AND size_bytes <= 2147483648),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'complete')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_order_files TO authenticated;
GRANT ALL ON public.service_order_files TO service_role;
ALTER TABLE public.service_order_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read service order files" ON public.service_order_files FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete service order files" ON public.service_order_files FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Deny anonymous service file access" ON public.service_order_files FOR SELECT TO anon USING (false);
CREATE POLICY "Deny client service file insert" ON public.service_order_files FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny client service file update" ON public.service_order_files FOR UPDATE TO anon, authenticated USING (false);

CREATE INDEX service_order_files_order_id_idx ON public.service_order_files(order_id);
CREATE INDEX service_orders_created_at_idx ON public.service_orders(created_at DESC);

CREATE POLICY "Admins can read service order objects" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'service-order-files' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete service order objects" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'service-order-files' AND public.has_role(auth.uid(), 'admin'::public.app_role));
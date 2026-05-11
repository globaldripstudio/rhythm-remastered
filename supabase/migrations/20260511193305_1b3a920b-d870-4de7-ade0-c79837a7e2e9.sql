-- Persistent rate-limit storage (replaces in-memory Map in edge functions)
CREATE TABLE public.rate_limits (
  key TEXT NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key, window_end)
);

CREATE INDEX idx_rate_limits_window_end ON public.rate_limits (window_end);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Deny all client access. Only service_role (edge functions) and admins can read.
CREATE POLICY "Admins can read rate_limits"
  ON public.rate_limits FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anon select on rate_limits"
  ON public.rate_limits FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "Deny client insert on rate_limits"
  ON public.rate_limits FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny client update on rate_limits"
  ON public.rate_limits FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny client delete on rate_limits"
  ON public.rate_limits FOR DELETE
  TO anon, authenticated
  USING (false);

-- Atomic check-and-increment. Returns TRUE when call is allowed, FALSE when limit hit.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _key TEXT,
  _max_count INTEGER,
  _window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_end TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  -- Bucket the current time into a fixed window so concurrent calls share a row
  v_window_end := date_trunc('second', now()) + make_interval(secs => _window_seconds);
  v_window_end := to_timestamp(
    ceil(extract(epoch FROM now()) / _window_seconds) * _window_seconds
  );

  INSERT INTO public.rate_limits (key, window_end, count)
  VALUES (_key, v_window_end, 1)
  ON CONFLICT (key, window_end)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;

  RETURN v_count <= _max_count;
END;
$$;

-- Purge expired buckets (run daily). Keeps 1h of buffer for late writes.
CREATE OR REPLACE FUNCTION public.purge_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_end < (now() - interval '1 hour');
END;
$$;
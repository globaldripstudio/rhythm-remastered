CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'purge-rate-limits-daily',
  '0 3 * * *',
  $$ SELECT public.purge_old_rate_limits(); $$
);
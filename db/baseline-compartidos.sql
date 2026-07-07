-- baseline_metrics: agregar 'compartidos' para que quede simétrico con la tabla metrics
-- (la migración metrics-audio-copyright.sql solo lo agregó a metrics).
alter table public.baseline_metrics
  add column if not exists compartidos integer;

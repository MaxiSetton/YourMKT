-- Agregar 'compartidos' a la tabla metrics
alter table public.metrics
  add column if not exists compartidos integer;

-- Agregar los campos para audio con copyright en posts
alter table public.posts
  add column if not exists tiene_audio_copyright boolean default false,
  add column if not exists nombre_cancion_copyright text;

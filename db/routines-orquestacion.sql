-- Orquestación de las routines (Calendario / Dirección / Producción) desde la web vía n8n.
-- Correr en Supabase → SQL Editor. La RLS existente sobre cada tabla cubre estas columnas:
-- el dueño (auth.uid()) puede leerlas/escribirlas; n8n las escribe con la service-role key.

-- Estado de generación para mostrar el "cargando" en la web mientras corre una routine.
-- La web lo setea al disparar (optimista); n8n lo transiciona/limpia al terminar.

-- campaigns: ideación completa (Routine 1 + Routine 2 en batch).
--   null      = sin generación en curso
--   'ideando' = R1 (calendario) o R2 (dirección de todas las piezas) corriendo
--   'error'   = la orquestación falló / timeout (la web ofrece reintentar)
alter table public.campaigns
  add column if not exists gen_status text;

-- posts: generación a nivel pieza.
--   null          = sin generación en curso
--   'ideando'     = Routine 2 re-pensando esta pieza (regenerar idea)
--   'produciendo' = Routine 3 produciendo / regenerando la pieza gráfica
--   'error'       = falló / timeout
alter table public.posts
  add column if not exists gen_status text;

-- spec de la pieza (lo escribe la Routine 2; lo lee la Routine 3). Idempotente por si ya existe.
alter table public.posts
  add column if not exists spec jsonb;

-- Resumen del día para el aviso 6am: por dueño, qué se produjo hoy + su mail (de auth.users).
-- La llama n8n directo por REST con la service-role key (no pasa por la app). SECURITY DEFINER para
-- poder leer auth.users; restringida a service_role.
create or replace function public.resumen_diario()
  returns table (email text, business_name text, total int, produced int, pending int)
  language sql
  security definer
  set search_path = public, auth
as $$
  select u.email::text,
         b.nombre,
         count(p.*)::int                                            as total,
         count(p.*) filter (where p.media_url is not null)::int     as produced,
         count(p.*) filter (where p.media_url is null)::int         as pending
  from public.posts p
  join public.campaigns c  on c.id = p.campaign_id
  join public.businesses b on b.id = c.business_id
  join auth.users u        on u.id = b.user_id
  where p.fecha = (now() at time zone 'America/Argentina/Buenos_Aires')::date
    and p.spec is not null
  group by u.email, b.nombre
  having count(p.*) > 0;
$$;

revoke all on function public.resumen_diario() from public;
grant execute on function public.resumen_diario() to service_role;

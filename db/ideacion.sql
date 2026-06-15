-- Campos de ideación (Etapa 1, skill campaign-director). Correr en Supabase → SQL Editor.
-- La RLS existente sobre cada tabla cubre las columnas/cambios nuevos.

-- 1) AUDIENCIA — nivel de conciencia + a quién apunta la campaña. Calibra todo el arco:
--    no le expliques a una audiencia caliente lo que ya sabe (ver R1 de la skill).
alter table public.campaigns
  add column if not exists audiencia_objetivo text,   -- a quién apunta: 'seguidores' (caliente) | 'nuevos' (frío) | 'mixta'
  add column if not exists nivel_conciencia text;     -- escalera Schwartz: 'no_consciente' | 'consciente_problema' | 'consciente_solucion' | 'consciente_producto' | 'mas_consciente'

-- 2) CAPACIDAD DE ASSETS — el pool deja de ser solo "lo real subido" y modela los tres cajones:
--    real / generable / faltante. Así la ideación reparte y declara lo que falta (ver R8).
alter table public.campaign_assets
  add column if not exists origen text not null default 'real',  -- 'real' (subido) | 'generado' (ya creado por el sistema) | 'a_generar' (slot que el sistema generará) | 'a_pedir' (falta, pedírselo al cliente)
  add column if not exists prompt text;                          -- para 'a_generar': prompt de generación (img→video / imagen)
alter table public.campaign_assets
  alter column url drop not null;                                -- los slots 'a_generar' / 'a_pedir' todavía no tienen archivo

-- 3) OUTPUT RICO DE IDEACIÓN — cada post guarda su spec estratégico, no solo el texto.
--    Es la "idea base" que recibe la Etapa 2 (reel-director) sin volver a decidir estrategia.
alter table public.posts
  add column if not exists rol text,            -- objetivo de la pieza en el arco: 'gancho'|'deseo'|'educacion'|'prueba'|'conversion'|'urgencia'|'comunidad'
  add column if not exists pilar text,          -- pilar de contenido del que sale la pieza
  add column if not exists angulo text,         -- el ángulo/concepto de la pieza
  add column if not exists hook text,           -- el gancho de apertura
  add column if not exists hook_formula text,   -- fórmula del hook: 'contrarian'|'error'|'lista'|'tiempo'|'pregunta'|'antes_despues'|...
  add column if not exists cta text,            -- CTA primario (uno solo, de baja fricción)
  add column if not exists asset_ids uuid[],    -- campaign_assets que usa esta pieza (reparto del pool)
  add column if not exists no_repetir text;     -- qué NO repetir de otras piezas (dedup del mensaje)

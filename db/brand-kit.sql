-- Brand kit en businesses: logo, paleta (3 colores) , vibe tipografico y voz.
-- Correr en Supabase → SQL Editor. RLS existente sobre businesses cubre las columnas nuevas.

alter table public.businesses
  add column if not exists logo_url text,            -- path en bucket business-docs ({userId}/brand/logo.*)
  add column if not exists color_primario text,      -- hex, ej '#7A1F1F'
  add column if not exists color_acento text,        -- hex, ej '#E8C66A'
  add column if not exists color_fondo text,         -- hex, ej '#F4E9D8'
  add column if not exists vibe_tipografico text,    -- 'clasica' | 'moderna' | 'editorial' | 'divertida'
  add column if not exists voz_preferencia text;     -- path del audio de referencia de voz en business-docs ({userId}/brand/voz-ref.*): OmniVoice lo clona. (Valores viejos: IDs EdgeTTS 'es-AR-*Neural', ya sin uso.)
  
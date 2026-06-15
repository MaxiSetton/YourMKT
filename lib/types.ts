export type Estado = string

export interface Business {
  id: string
  user_id: string | null
  nombre: string
  descripcion: string | null
  tono_marca: string | null
  tono_detalle: string | null
  rubro: string | null
  propuesta_valor: string | null
  publico_objetivo: string | null
  estetica_visual: string | null
  ejemplos_posts: string | null
  evitar: string | null
  sitio_web: string | null
  instagram: string | null
  logo_url: string | null
  color_primario: string | null
  color_acento: string | null
  color_fondo: string | null
  vibe_tipografico: string | null
  voz_preferencia: string | null
  created_at: string
}

export interface Campaign {
  id: string
  business_id: string
  nombre: string
  brief: string | null
  que_promociona: string | null
  objetivo: string | null
  fecha_inicio: string | null
  duracion_dias: number | null
  elementos_especificos: string | null
  estado: 'borrador' | 'activa' | 'finalizada'
  created_at: string
}

export type PostFormato = 'feed' | 'story' | 'reel'

export interface Post {
  id: string
  campaign_id: string
  fecha: string
  hora: string | null
  formato: PostFormato | null
  texto: string | null
  media_url: string | null
  media_tipo: string | null
  prompt_media: string | null
  version: number
  estado: 'borrador' | 'aprobado' | 'publicado'
  created_at: string
}

export interface Metric {
  id: string
  post_id: string
  alcance: number | null
  likes: number | null
  comentarios: number | null
  guardados: number | null
  cargado_at: string
}

export interface BaselineMetric {
  id: string
  business_id: string
  etiqueta: string | null
  fecha: string | null
  alcance: number | null
  likes: number | null
  comentarios: number | null
  guardados: number | null
  created_at: string
}

export type AssetTipo = 'imagen' | 'video'
export type AssetCategoria = 'producto' | 'proceso' | 'otro'

export interface CampaignAsset {
  id: string
  campaign_id: string
  tipo: AssetTipo
  categoria: AssetCategoria | null
  url: string
  nombre_archivo: string | null
  descripcion: string
  created_at: string
}

export const FORMATO_LABEL: Record<PostFormato, string> = {
  feed: 'Feed',
  story: 'Story',
  reel: 'Reel',
}

export const FORMATO_COLOR: Record<PostFormato, string> = {
  feed: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  story: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  reel: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
}

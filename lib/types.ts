export type Estado = string

export interface Business {
  id: string
  user_id: string | null
  nombre: string
  descripcion: string | null
  tono_marca: string | null
  created_at: string
}

export interface Campaign {
  id: string
  business_id: string
  nombre: string
  brief: string | null
  que_promociona: string | null
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

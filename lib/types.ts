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

// Audiencia (ideación): a quién apunta la campaña y qué tan enterada está (escalera de Schwartz).
export type AudienciaObjetivo = 'seguidores' | 'nuevos' | 'mixta'
export type NivelConciencia =
  | 'no_consciente'
  | 'consciente_problema'
  | 'consciente_solucion'
  | 'consciente_producto'
  | 'mas_consciente'

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
  audiencia_objetivo: AudienciaObjetivo | null
  nivel_conciencia: NivelConciencia | null
  estado: 'borrador' | 'activa' | 'finalizada'
  created_at: string
}

export type PostFormato = 'feed' | 'story' | 'reel'

// Rol de la pieza dentro del arco de la campaña (objetivo propio de cada post).
export type PostRol =
  | 'gancho'
  | 'deseo'
  | 'educacion'
  | 'prueba'
  | 'conversion'
  | 'urgencia'
  | 'comunidad'

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
  // Spec de ideación (Etapa 1): la "idea base" estructurada que recibe la Etapa 2.
  rol: PostRol | null
  pilar: string | null
  angulo: string | null
  hook: string | null
  hook_formula: string | null
  cta: string | null
  asset_ids: string[] | null
  no_repetir: string | null
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
// Los tres cajones del pool: lo subido, lo generable y lo que falta conseguir.
export type AssetOrigen = 'real' | 'generado' | 'a_generar' | 'a_pedir'

export interface CampaignAsset {
  id: string
  campaign_id: string
  tipo: AssetTipo
  categoria: AssetCategoria | null
  origen: AssetOrigen
  url: string | null
  prompt: string | null
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

// Rol de la pieza en el arco (etiqueta legible para la UI).
export const ROL_LABEL: Record<string, string> = {
  gancho: 'Gancho',
  deseo: 'Deseo',
  educacion: 'Educación',
  prueba: 'Prueba',
  conversion: 'Conversión',
  urgencia: 'Urgencia',
  comunidad: 'Comunidad',
}

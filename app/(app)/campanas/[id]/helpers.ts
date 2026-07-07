import type { Post } from '@/lib/types'
import { FORMATO_LABEL } from '@/lib/types'

export const isHttp = (s: string) => /^https?:\/\//.test(s)
export const dirOf = (p: string) => p.replace(/\/[^/]+$/, '')
export const baseName = (p: string) => p.split('/').pop() || 'archivo'

// Ordena los slides por su número (slide-1, slide-2, …) y cae al nombre si no hay número.
export const slideNum = (n: string) => {
  const m = n.match(/(\d+)(?=\.[a-z0-9]+$)/i)
  return m ? Number(m[1]) : 0
}

// El pedido se guarda con un prefijo interno; al cliente le mostramos el texto limpio.
export const limpiarPedido = (d: string) => d.replace(/^\[A pedir al cliente\]\s*/i, '')

export const sortByFecha = (posts: Post[]) =>
  [...posts].sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0))

// Día N dentro del arco (un número por fecha calendario), para etiquetar piezas de forma estable.
export function diaMap(posts: Post[]): Map<string, number> {
  const fechas = Array.from(new Set(posts.map((p) => p.fecha))).sort()
  const rank = new Map(fechas.map((f, i) => [f, i + 1] as const))
  const m = new Map<string, number>()
  posts.forEach((p) => m.set(p.id, rank.get(p.fecha) ?? 0))
  return m
}

export const fechaCorta = (fecha: string) =>
  new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

// Etiqueta corta de una pieza, para referenciarla desde la multimedia ("Para: Día 3 · Feed").
export function postTag(post: Post, dia: number): string {
  const fmt = post.formato ? FORMATO_LABEL[post.formato] : 'Post'
  return dia ? `Día ${dia} · ${fmt}` : fmt
}

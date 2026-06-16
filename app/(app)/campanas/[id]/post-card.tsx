'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Post } from '@/lib/types'
import { FORMATO_LABEL, FORMATO_COLOR, ROL_LABEL } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, CheckCircle, Globe } from 'lucide-react'

interface Props {
  post: Post
}

const isHttp = (s: string) => /^https?:\/\//.test(s)
const dirOf = (p: string) => p.replace(/\/[^/]+$/, '')
const slideNum = (name: string) => {
  const m = name.match(/(\d+)(?=\.[a-z0-9]+$)/i)
  return m ? Number(m[1]) : 0
}

// Bloque chico etiquetado para una parte de la idea.
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  )
}

export function PostCard({ post }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [video, setVideo] = useState<string | null>(null)
  const [slides, setSlides] = useState<string[]>([])
  const [current, setCurrent] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)

  // Resuelve la media: el video (firmado) para reels, o TODAS las slides de la carpeta para feed/carrusel.
  useEffect(() => {
    if (!post.media_url) return
    let active = true
    const supabase = createClient()

    if (post.media_tipo === 'video') {
      if (isHttp(post.media_url)) {
        setVideo(post.media_url)
      } else {
        supabase.storage
          .from('post-media')
          .createSignedUrl(post.media_url, 3600)
          .then(({ data }) => active && setVideo(data?.signedUrl ?? null))
      }
      return () => {
        active = false
      }
    }

    // imagen / carrusel: listar la carpeta del post y firmar todas las slides en orden
    const folder = dirOf(post.media_url)
    supabase.storage
      .from('post-media')
      .list(folder, { limit: 100 })
      .then(async ({ data: files }) => {
        const imgs = (files ?? [])
          .filter((f) => /\.(png|jpe?g|webp)$/i.test(f.name))
          .sort((a, b) => slideNum(a.name) - slideNum(b.name) || a.name.localeCompare(b.name))
        const paths = imgs.length
          ? imgs.map((f) => `${folder}/${f.name}`)
          : [post.media_url as string]
        const { data: signed } = await supabase.storage
          .from('post-media')
          .createSignedUrls(paths, 3600)
        if (active) setSlides((signed ?? []).map((s) => s.signedUrl).filter(Boolean) as string[])
      })

    return () => {
      active = false
    }
  }, [post.media_url, post.media_tipo])

  const updateEstado = async (estado: Post['estado']) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').update({ estado }).eq('id', post.id)
    if (error) toast.error('No se pudo actualizar el estado.')
    else {
      toast.success('Estado actualizado.')
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) toast.error('No se pudo eliminar el post.')
    else {
      toast.success('Post eliminado.')
      router.refresh()
    }
    setIsLoading(false)
  }

  const fecha = new Date(post.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const tieneIdea = post.rol || post.angulo || post.hook || post.cta || post.prompt_media || post.pilar

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.formato && (
              <Badge variant="outline" className={`text-xs ${FORMATO_COLOR[post.formato]}`}>
                {FORMATO_LABEL[post.formato]}
              </Badge>
            )}
            {post.rol && (
              <Badge variant="secondary" className="text-xs">
                {ROL_LABEL[post.rol] ?? post.rol}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{fecha}</span>
            {post.hora && (
              <span className="text-xs text-muted-foreground">{post.hora.slice(0, 5)}</span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0 -mr-1.5 -mt-0.5">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {post.estado === 'borrador' && (
                <DropdownMenuItem onClick={() => updateEstado('aprobado')} disabled={isLoading}>
                  <CheckCircle className="mr-2 size-4" />
                  Aprobar
                </DropdownMenuItem>
              )}
              {post.estado === 'aprobado' && (
                <DropdownMenuItem onClick={() => updateEstado('publicado')} disabled={isLoading}>
                  <Globe className="mr-2 size-4" />
                  Marcar publicado
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isLoading}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        {/* La idea (Etapa 1) — completa */}
        {tieneIdea && (
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
            {post.hook && (
              <p className="text-sm font-medium leading-snug">“{post.hook}”</p>
            )}
            {post.angulo && <Campo label="Ángulo">{post.angulo}</Campo>}
            <div className="grid gap-3 sm:grid-cols-2">
              {post.pilar && <Campo label="Pilar">{post.pilar}</Campo>}
              {post.cta && <Campo label="CTA">{post.cta}</Campo>}
            </div>
            {post.prompt_media && <Campo label="Idea visual">{post.prompt_media}</Campo>}
            {post.no_repetir && <Campo label="No repetir">{post.no_repetir}</Campo>}
          </div>
        )}

        {/* El texto / caption — entero */}
        {post.texto ? (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Copy</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{post.texto}</p>
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground/60">Sin texto todavía.</p>
        )}
      </CardContent>

      {/* Media: video del reel o galería completa del carrusel */}
      {(video || slides.length > 0) && (
        <CardFooter className="flex flex-col items-stretch gap-2 pt-0 pb-3">
          {video ? (
            <video
              src={video}
              controls
              playsInline
              className="mx-auto max-h-[28rem] rounded-md bg-black"
            />
          ) : (
            <>
              <div
                ref={stripRef}
                onScroll={(e) => {
                  const el = e.currentTarget
                  setCurrent(Math.round(el.scrollLeft / el.clientWidth))
                }}
                className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-md"
              >
                {slides.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`Slide ${i + 1}`}
                    className="aspect-[4/5] w-full shrink-0 snap-center rounded-md object-cover"
                  />
                ))}
              </div>
              {slides.length > 1 && (
                <div className="flex items-center justify-center gap-1.5">
                  {slides.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === current ? 'w-4 bg-foreground' : 'w-1.5 bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {current + 1}/{slides.length}
                  </span>
                </div>
              )}
            </>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

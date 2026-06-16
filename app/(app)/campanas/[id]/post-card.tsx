'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Post, CampaignAsset } from '@/lib/types'
import { FORMATO_LABEL, FORMATO_COLOR, ROL_LABEL } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, CheckCircle, Globe, Images, Play, X } from 'lucide-react'

interface Props {
  post: Post
  assets: CampaignAsset[]
}

const isHttp = (s: string) => /^https?:\/\//.test(s)
const dirOf = (p: string) => p.replace(/\/[^/]+$/, '')
const slideNum = (n: string) => {
  const m = n.match(/(\d+)(?=\.[a-z0-9]+$)/i)
  return m ? Number(m[1]) : 0
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed">{children}</p>
    </div>
  )
}

export function PostCard({ post, assets }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [video, setVideo] = useState<string | null>(null)
  const [slides, setSlides] = useState<string[]>([])
  const [current, setCurrent] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (!post.media_url) return
    let active = true
    const supabase = createClient()
    if (post.media_tipo === 'video') {
      if (isHttp(post.media_url)) setVideo(post.media_url)
      else
        supabase.storage
          .from('post-media')
          .createSignedUrl(post.media_url, 3600)
          .then(({ data }) => active && setVideo(data?.signedUrl ?? null))
      return () => {
        active = false
      }
    }
    const folder = dirOf(post.media_url)
    supabase.storage
      .from('post-media')
      .list(folder, { limit: 100 })
      .then(async ({ data: files }) => {
        const imgs = (files ?? [])
          .filter((f) => /\.(png|jpe?g|webp)$/i.test(f.name))
          .sort((a, b) => slideNum(a.name) - slideNum(b.name) || a.name.localeCompare(b.name))
        const paths = imgs.length ? imgs.map((f) => `${folder}/${f.name}`) : [post.media_url as string]
        const { data: signed } = await supabase.storage.from('post-media').createSignedUrls(paths, 3600)
        if (active) setSlides((signed ?? []).map((s) => s.signedUrl).filter(Boolean) as string[])
      })
    return () => {
      active = false
    }
  }, [post.media_url, post.media_tipo])

  const assigned = assets.filter((a) => post.asset_ids?.includes(a.id))

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

  // Drop: asignar un archivo de la multimedia a este post (lo agrega a asset_ids).
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const assetId = e.dataTransfer.getData('text/plain')
    if (!assetId || post.asset_ids?.includes(assetId)) return
    const nuevos = [...(post.asset_ids ?? []), assetId]
    const supabase = createClient()
    const { error } = await supabase.from('posts').update({ asset_ids: nuevos }).eq('id', post.id)
    if (error) toast.error('No se pudo asignar el archivo.')
    else {
      toast.success('Archivo asignado al post.')
      router.refresh()
    }
  }

  const quitarAsset = async (assetId: string) => {
    const nuevos = (post.asset_ids ?? []).filter((x) => x !== assetId)
    const supabase = createClient()
    const { error } = await supabase.from('posts').update({ asset_ids: nuevos }).eq('id', post.id)
    if (error) toast.error('No se pudo quitar.')
    else router.refresh()
  }

  const fecha = new Date(post.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  })

  const Gallery = ({ small }: { small?: boolean }) => (
    <div className="flex flex-col gap-1.5">
      <div
        onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-md"
      >
        {slides.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            className={`${small ? 'h-40' : 'h-[60vh]'} aspect-[4/5] w-auto shrink-0 snap-center rounded-md object-cover`}
          />
        ))}
      </div>
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-foreground' : 'w-1.5 bg-muted-foreground/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Card
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col transition-colors ${dragOver ? 'ring-2 ring-primary' : ''}`}
    >
      <CardHeader className="pb-2">
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

      <CardContent className="flex flex-1 flex-col gap-2 pt-0">
        {post.hook && <p className="line-clamp-2 text-sm font-medium leading-snug">“{post.hook}”</p>}
        {post.texto && (
          <p className="line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
            {post.texto}
          </p>
        )}
        {/* Archivos asignados a este post (drop target) */}
        {assigned.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {assigned.map((a) => {
              const falta = !a.url
              return (
                <span
                  key={a.id}
                  title={a.descripcion}
                  className={`inline-flex max-w-[10rem] items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                    falta ? 'border-amber-500/40 bg-amber-500/10 text-amber-700' : 'bg-muted'
                  }`}
                >
                  <span className="truncate">{falta ? 'falta: ' : ''}{a.nombre_archivo ?? a.descripcion}</span>
                  <button onClick={() => quitarAsset(a.id)} className="shrink-0 opacity-60 hover:opacity-100">
                    <X className="size-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-2 pt-0 pb-3">
        {video ? (
          <video src={video} controls playsInline className="max-h-44 w-full rounded-md bg-black object-contain" />
        ) : slides.length > 0 ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slides[0]} alt="Portada" className="h-44 w-full rounded-md object-cover" />
            {slides.length > 1 && (
              <Badge className="absolute right-2 top-2 gap-1 bg-black/70 text-white">
                <Images className="size-3" />
                {slides.length}
              </Badge>
            )}
          </div>
        ) : null}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Play className="size-3.5" />
              Ver pieza completa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                {post.formato && <span>{FORMATO_LABEL[post.formato]}</span>}
                {post.rol && <Badge variant="secondary" className="text-xs">{ROL_LABEL[post.rol] ?? post.rol}</Badge>}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {video ? (
                <video src={video} controls playsInline className="mx-auto max-h-[60vh] rounded-md bg-black" />
              ) : slides.length > 0 ? (
                <Gallery />
              ) : null}
              {(post.hook || post.angulo || post.cta || post.prompt_media || post.no_repetir || post.pilar) && (
                <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
                  {post.hook && <p className="text-sm font-medium leading-snug">“{post.hook}”</p>}
                  {post.angulo && <Campo label="Ángulo">{post.angulo}</Campo>}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {post.pilar && <Campo label="Pilar">{post.pilar}</Campo>}
                    {post.cta && <Campo label="CTA">{post.cta}</Campo>}
                  </div>
                  {post.prompt_media && <Campo label="Idea visual">{post.prompt_media}</Campo>}
                  {post.no_repetir && <Campo label="No repetir">{post.no_repetir}</Campo>}
                </div>
              )}
              {post.texto && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Copy</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{post.texto}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

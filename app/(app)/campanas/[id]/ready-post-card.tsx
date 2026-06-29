'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Post } from '@/lib/types'
import { FORMATO_LABEL, FORMATO_COLOR, ROL_LABEL } from '@/lib/types'
import { isHttp, dirOf, slideNum, baseName, fechaCorta } from './helpers'
import { postGen } from './gen'
import { RegenDialog } from './regen-dialog'
import { LoadingCard } from './loading-card'
import { MediaCarousel } from './media-carousel'
import { Campo } from './field'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Globe,
  Lightbulb,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Trash2,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react'

const BUCKET = 'post-media'

const ESTADO: Record<Post['estado'], { label: string; cls: string }> = {
  borrador: { label: 'Sin revisar', cls: 'border-border bg-muted text-muted-foreground' },
  aprobado: { label: 'Aprobado', cls: 'border-chart-4/30 bg-chart-4/15 text-chart-4' },
  publicado: { label: 'Publicado', cls: 'border-primary/30 bg-primary/10 text-primary' },
}

interface Props {
  post: Post
  dia: number
}

export function ReadyPostCard({ post, dia }: Props) {
  const router = useRouter()
  const [video, setVideo] = useState<string | null>(null)
  const [slides, setSlides] = useState<string[]>([])
  const [paths, setPaths] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [conMusica, setConMusica] = useState(false)
  // Optimista: muestra la pantalla de carga apenas se dispara n8n. Se suelta al llegar props nuevas.
  const [optimistic, setOptimistic] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setOptimistic(false)
  }, [post.gen_status, post.version, post.media_url])

  useEffect(() => {
    if (!post.media_url) return
    let active = true
    const supabase = createClient()

    if (post.media_tipo === 'video') {
      const p = post.media_url
      setPaths([p])
      if (isHttp(p)) setVideo(p)
      else
        supabase.storage
          .from(BUCKET)
          .createSignedUrl(p, 3600)
          .then(({ data }) => active && setVideo(data?.signedUrl ?? null))
      return () => {
        active = false
      }
    }

    const folder = dirOf(post.media_url)
    supabase.storage
      .from(BUCKET)
      .list(folder, { limit: 100 })
      .then(async ({ data: files }) => {
        const imgs = (files ?? [])
          .filter((f) => /\.(png|jpe?g|webp)$/i.test(f.name))
          .sort((a, b) => slideNum(a.name) - slideNum(b.name) || a.name.localeCompare(b.name))
        const ps = imgs.length ? imgs.map((f) => `${folder}/${f.name}`) : [post.media_url as string]
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(ps, 3600)
        if (!active) return
        setPaths(ps)
        setSlides((signed ?? []).map((s) => s.signedUrl).filter(Boolean) as string[])
      })

    return () => {
      active = false
    }
    // gen_status en deps: al terminar una regeneración (mismo media_url, archivo nuevo) re-firmamos la
    // URL para que no quede cacheada la pieza vieja.
  }, [post.media_url, post.media_tipo, post.gen_status])

  const updateEstado = async (estado: Post['estado']) => {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').update({ estado }).eq('id', post.id)
    if (error) toast.error('No se pudo actualizar el estado.')
    else {
      toast.success(estado === 'aprobado' ? 'Post aprobado.' : estado === 'publicado' ? 'Marcado como publicado.' : 'Vuelto a borrador.')
      router.refresh()
    }
    setBusy(false)
  }

  const handleDelete = async () => {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) toast.error('No se pudo eliminar el post.')
    else {
      toast.success('Post eliminado.')
      router.refresh()
    }
    setBusy(false)
  }

  const producing = post.gen_status === 'produciendo' || optimistic

  const regenerarPieza = async (observaciones: string) => {
    setOptimistic(true)
    try {
      await postGen(`/api/posts/${post.id}/producir`, { observaciones })
      toast.success('Regenerando la pieza. Te avisamos por mail cuando esté lista.')
      router.refresh()
    } catch (e) {
      setOptimistic(false)
      toast.error((e as Error).message)
      throw e
    }
  }

  const copyTexto = async () => {
    if (!post.texto) return
    try {
      await navigator.clipboard.writeText(post.texto)
      setCopied(true)
      toast.success('Copy copiado al portapapeles.')
      setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('No se pudo copiar.')
    }
  }

  const downloadOne = async (path: string) => {
    const supabase = createClient()
    const name = baseName(path)
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 120, {
      download: name,
    })
    if (error || !data?.signedUrl) {
      toast.error('No se pudo preparar la descarga.')
      return
    }
    const a = document.createElement('a')
    a.href = data.signedUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const downloadAll = async () => {
    if (paths.length === 0) return
    setBusy(true)
    for (const p of paths) await downloadOne(p)
    toast.success(paths.length > 1 ? `Descargando ${paths.length} archivos.` : 'Descargando archivo.')
    setBusy(false)
  }

  const estado = ESTADO[post.estado]
  const hasIdea = post.hook || post.angulo || post.cta || post.prompt_media || post.no_repetir || post.pilar
  const descargaLabel =
    post.media_tipo === 'video' ? 'Descargar video' : paths.length > 1 ? `Descargar (${paths.length})` : 'Descargar'

  // Mientras se regenera, ocultamos la pieza vieja y mostramos la pantalla de carga. El pop-up
  // "Ver anterior" muestra la pieza actual (media + texto) mientras se genera la nueva.
  if (producing) {
    const piezaAnterior = (
      <div className="flex flex-col gap-3">
        {video ? (
          <video src={video} controls playsInline className="w-full rounded-lg bg-black" />
        ) : slides.length > 0 ? (
          <MediaCarousel slides={slides} />
        ) : null}
        {post.texto && (
          <p className="whitespace-pre-line rounded-md bg-muted/40 p-3 text-sm leading-relaxed">
            {post.texto}
          </p>
        )}
      </div>
    )
    return <LoadingCard dia={dia} title="Regenerando la pieza" preview={piezaAnterior} />
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:flex-row">
      {/* Media — lo que se publica */}
      <div className="shrink-0 bg-muted md:w-[280px]">
        {video ? (
          <div className="relative aspect-[4/5] md:aspect-auto md:h-full w-full bg-black">
            <video
              ref={videoRef}
              src={video}
              controls
              playsInline
              muted={!conMusica && post.tiene_audio_copyright === true}
              className="h-full w-full object-contain"
            />
            {post.tiene_audio_copyright && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="h-8 shadow-sm backdrop-blur-md bg-background/80"
                  onClick={() => setConMusica(!conMusica)}
                >
                  {conMusica ? (
                    <>
                      <VolumeX className="mr-2 size-3.5" />
                      Escuchar sin música
                    </>
                  ) : (
                    <>
                      <Volume2 className="mr-2 size-3.5" />
                      Escuchar con música
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : slides.length > 0 ? (
          <MediaCarousel slides={slides} />
        ) : (
          <div className="grid aspect-[4/5] w-full place-items-center text-muted-foreground/50">
            <Clock className="size-6" />
          </div>
        )}
      </div>

      {/* Texto + acciones — lo que se copia */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            Día {dia}
          </Badge>
          {post.formato && (
            <Badge variant="outline" className={`text-xs ${FORMATO_COLOR[post.formato]}`}>
              {FORMATO_LABEL[post.formato]}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {fechaCorta(post.fecha)}
            {post.hora ? ` · ${post.hora.slice(0, 5)}` : ''}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <span className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium ${estado.cls}`}>
              {estado.label}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" aria-label="Más opciones" />}
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {post.estado !== 'borrador' && (
                  <DropdownMenuItem onClick={() => updateEstado('borrador')} disabled={busy}>
                    <RotateCcw className="mr-2 size-4" />
                    Volver a borrador
                  </DropdownMenuItem>
                )}
                {post.estado === 'publicado' && (
                  <DropdownMenuItem onClick={() => updateEstado('aprobado')} disabled={busy}>
                    <CheckCircle2 className="mr-2 size-4" />
                    Marcar como aprobado
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={busy}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Eliminar post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Descripción / copy a pegar */}
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Texto del post
            </p>
            {post.texto && (
              <Button variant="ghost" size="sm" className="-mr-2 h-7 gap-1.5 text-xs" onClick={copyTexto}>
                {copied ? <Check className="size-3.5 text-chart-4" /> : <Copy className="size-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            )}
          </div>
          {post.texto ? (
            <p className="max-h-56 overflow-y-auto whitespace-pre-line rounded-md bg-muted/40 p-3 text-sm leading-relaxed">
              {post.texto}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Sin texto todavía.</p>
          )}
        </div>

        {/* Aviso de copyright si corresponde */}
        {post.tiene_audio_copyright && post.nombre_cancion_copyright && (
          <Alert className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20 py-2.5">
            <AlertCircle className="size-4" color="currentColor" />
            <AlertTitle className="text-sm font-semibold">Audio con derechos de autor</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed mt-1">
              La descarga del video es sin música. Debés agregar la canción <strong>{post.nombre_cancion_copyright}</strong> manualmente en la red social al momento de publicar.
            </AlertDescription>
          </Alert>
        )}

        {/* Acciones principales: copiar (arriba) + descargar + aprobar/publicar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={downloadAll} disabled={busy || paths.length === 0}>
            <Download className="size-4" />
            {descargaLabel}
          </Button>

          <RegenDialog
            trigger={
              <Button size="sm" variant="outline" className="gap-2" disabled={busy || producing}>
                <RefreshCw className="size-4" />
                Regenerar pieza
              </Button>
            }
            title="Regenerar la pieza"
            description="Vuelve a generar la pieza gráfica y el copy a partir de la misma idea. No cambia la estrategia."
            confirmLabel="Regenerar pieza"
            placeholder="Ej: cambiá la música, otro plano de apertura, bajá el texto en pantalla…"
            onConfirm={regenerarPieza}
          />

          {post.estado === 'borrador' && (
            <Button size="sm" className="gap-2" onClick={() => updateEstado('aprobado')} disabled={busy}>
              <CheckCircle2 className="size-4" />
              Aprobar
            </Button>
          )}
          {post.estado === 'aprobado' && (
            <Button size="sm" className="gap-2" onClick={() => updateEstado('publicado')} disabled={busy}>
              <Globe className="size-4" />
              Marcar publicado
            </Button>
          )}

          {hasIdea && (
            <Dialog>
              <DialogTrigger
                render={<Button variant="ghost" size="sm" className="ml-auto gap-1.5 text-muted-foreground" />}
              >
                <Lightbulb className="size-4" />
                Ver idea
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base">
                    Idea · Día {dia}
                    {post.rol && (
                      <Badge variant="secondary" className="text-xs">
                        {ROL_LABEL[post.rol] ?? post.rol}
                      </Badge>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  {post.hook && <p className="text-sm font-medium leading-snug">“{post.hook}”</p>}
                  {post.angulo && <Campo label="Ángulo">{post.angulo}</Campo>}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {post.pilar && <Campo label="Pilar">{post.pilar}</Campo>}
                    {post.cta && <Campo label="CTA">{post.cta}</Campo>}
                  </div>
                  {post.prompt_media && <Campo label="Idea visual">{post.prompt_media}</Campo>}
                  {post.no_repetir && <Campo label="No repetir">{post.no_repetir}</Campo>}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Post, PostFormato, CampaignAsset } from '@/lib/types'
import { FORMATO_LABEL, FORMATO_COLOR, ROL_LABEL } from '@/lib/types'
import { fechaCorta, limpiarPedido } from './helpers'
import { postGen } from './gen'
import { RegenDialog } from './regen-dialog'
import { Campo } from './field'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Camera, Clock, ImageIcon, Loader2, MoreHorizontal, Music, RefreshCw, Sparkles, Trash2, Video } from 'lucide-react'

// Qué se PRODUCE después a partir de la idea, por formato — para que lo que se aprueba sea lo que llega.
const PRODUCE_HINT: Record<PostFormato, string> = {
  reel: 'Se produce como Reel: video vertical con voz, subtítulos y música, con tu marca.',
  feed: 'Se produce como pieza de feed (imagen o carrusel) con tu identidad visual.',
  story: 'Se produce como Story vertical.',
}

interface Props {
  post: Post
  dia: number
  assets: CampaignAsset[]
}

export function IdeaCard({ post, dia, assets }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const needed = (post.asset_ids ?? [])
    .map((id) => assets.find((a) => a.id === id))
    .filter((a): a is CampaignAsset => Boolean(a))

  const producing = post.gen_status === 'produciendo'
  const reideating = post.gen_status === 'ideando'
  const inProgress = producing || reideating

  const handleDelete = async () => {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) toast.error('No se pudo eliminar la idea.')
    else {
      toast.success('Idea eliminada.')
      router.refresh()
    }
    setBusy(false)
  }

  const generarPieza = async () => {
    setBusy(true)
    try {
      await postGen(`/api/posts/${post.id}/producir`)
      toast.success('Generando la pieza. Te avisamos por mail cuando esté lista.')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
    setBusy(false)
  }

  const regenerarIdea = async (observaciones: string) => {
    try {
      await postGen(`/api/posts/${post.id}/regenerar-idea`, { observaciones })
      toast.success('Volviendo a pensar la idea…')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
      throw e
    }
  }

  return (
    <div className="relative flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      {/* Encabezado: posición en el arco + formato + rol */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-6 items-center rounded-full bg-primary/10 px-2.5 text-xs font-semibold text-primary">
          Día {dia}
        </span>
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
        <span className="text-xs text-muted-foreground">
          {fechaCorta(post.fecha)}
          {post.hora ? ` · ${post.hora.slice(0, 5)}` : ''}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Más opciones" />}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={busy}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar idea
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hook + estrategia */}
      {post.hook && <p className="text-sm font-medium leading-snug">“{post.hook}”</p>}
      {post.angulo && <Campo label="Ángulo">{post.angulo}</Campo>}
      {(post.pilar || post.cta) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {post.pilar && <Campo label="Pilar">{post.pilar}</Campo>}
          {post.cta && <Campo label="CTA">{post.cta}</Campo>}
        </div>
      )}
      {post.prompt_media && (
        <div className="rounded-lg bg-muted/40 p-3">
          <Campo label="Idea visual">{post.prompt_media}</Campo>
        </div>
      )}
      {post.no_repetir && <Campo label="No repetir">{post.no_repetir}</Campo>}

      {/* Copy borrador */}
      {post.texto && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Borrador del copy
          </p>
          <p className="mt-0.5 max-h-32 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {post.texto}
          </p>
        </div>
      )}

      {/* Material que necesita esta pieza (conecta con la pestaña Multimedia) */}
      {needed.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Necesita este material
          </p>
          <div className="flex flex-wrap gap-1.5">
            {needed.map((a) => {
              const falta = !a.url
              const Icon = a.origen === 'a_generar' ? Sparkles : a.tipo === 'video' ? Video : a.tipo === 'imagen' && falta ? Camera : ImageIcon
              return (
                <span
                  key={a.id}
                  title={limpiarPedido(a.descripcion)}
                  className={`inline-flex max-w-[16rem] items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                    falta
                      ? 'border-spark/40 bg-spark-surface text-spark-foreground'
                      : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="size-3 shrink-0" />
                  <span className="truncate">{limpiarPedido(a.descripcion)}</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Audio en tendencia: lo que pasa después es que el reel sale SIN música y la canción va en IG */}
      {post.formato === 'reel' && post.tiene_audio_copyright && (
        <div className="flex items-start gap-1.5 rounded-lg border border-spark/40 bg-spark-surface px-2.5 py-2 text-[11px] text-spark-foreground">
          <Music className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Audio en tendencia: el reel se exporta <span className="font-medium">sin música</span> y vos agregás
            {post.nombre_cancion_copyright ? ` “${post.nombre_cancion_copyright}”` : ' el sonido'} en Instagram
            (las cuentas de empresa no pueden incrustar música con copyright).
          </span>
        </div>
      )}

      {/* Acciones de generación: producir la pieza o re-pensar la idea */}
      {inProgress ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
          <Loader2 className="size-3.5 shrink-0 animate-spin" />
          {producing
            ? 'Produciendo la pieza… te avisamos por mail cuando esté lista.'
            : 'Volviendo a pensar la idea…'}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            <Button size="sm" className="gap-2" onClick={generarPieza} disabled={busy}>
              <Sparkles className="size-4" />
              Generar pieza
            </Button>
            <RegenDialog
              trigger={
                <Button size="sm" variant="outline" className="gap-2" disabled={busy}>
                  <RefreshCw className="size-4" />
                  Regenerar idea
                </Button>
              }
              title="Regenerar la idea"
              description="Vuelve a pensar esta pieza (hook, ángulo, copy). No genera la pieza gráfica."
              confirmLabel="Regenerar idea"
              placeholder="Ej: que el hook sea más directo, cambiá el ángulo a testimonio…"
              onConfirm={regenerarIdea}
            />
          </div>
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Clock className="mt-0.5 size-3.5 shrink-0" />
            <span>{post.formato ? PRODUCE_HINT[post.formato] : ''}</span>
          </div>
        </>
      )}
    </div>
  )
}

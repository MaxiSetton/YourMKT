'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Post, CampaignAsset } from '@/lib/types'
import { FORMATO_LABEL, FORMATO_COLOR, ROL_LABEL } from '@/lib/types'
import { fechaCorta, limpiarPedido } from './helpers'
import { Campo } from './field'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Camera, Clock, ImageIcon, MoreHorizontal, Sparkles, Trash2, Video } from 'lucide-react'

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

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        Pendiente de producción
      </div>
    </div>
  )
}

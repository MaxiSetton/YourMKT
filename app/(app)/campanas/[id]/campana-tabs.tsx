'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Campaign, Post, CampaignAsset } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { IdeaCard } from './idea-card'
import { ReadyPostCard } from './ready-post-card'
import { MaterialSection } from './material-section'
import { NuevoPostDialog } from './nuevo-post-dialog'
import { postGen } from './gen'
import { sortByFecha, diaMap } from './helpers'
import { AlertCircle, ImageOff, Images, Layers, Lightbulb, Loader2, Plus } from 'lucide-react'

interface Props {
  campaign: Campaign
  posts: Post[]
  assets: CampaignAsset[]
  userId: string
}

function Count({ n, tone = 'muted' }: { n: number; tone?: 'muted' | 'spark' }) {
  if (n === 0) return null
  return (
    <span
      className={`ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums ${
        tone === 'spark' ? 'bg-spark text-spark-foreground' : 'bg-foreground/10 text-foreground/70'
      }`}
    >
      {n}
    </span>
  )
}

function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
      <Icon className="size-8 text-muted-foreground/40" />
      <div className="px-6">
        <p className="font-medium">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{children}</p>
      </div>
      {action}
    </div>
  )
}

export function CampanaTabs({ campaign, posts, assets, userId }: Props) {
  const router = useRouter()
  const [retrying, setRetrying] = useState(false)
  const dia = diaMap(posts)
  const ideas = sortByFecha(posts.filter((p) => !p.media_url))
  const listos = sortByFecha(posts.filter((p) => p.media_url))
  const pendientes = assets.filter((a) => !a.url && a.origen === 'a_pedir').length

  const ideando = campaign.gen_status === 'ideando'
  const ideacionError = campaign.gen_status === 'error'
  // Mientras algo se está generando (ideación de campaña o una pieza), refrescamos para ver el avance.
  const inProgress = ideando || posts.some((p) => p.gen_status === 'ideando' || p.gen_status === 'produciendo')

  useEffect(() => {
    if (!inProgress) return
    const t = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(t)
  }, [inProgress, router])

  const reintentarIdeacion = async () => {
    setRetrying(true)
    try {
      await postGen(`/api/campanas/${campaign.id}/idear`)
      toast.success('Reintentando la generación del calendario…')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
    setRetrying(false)
  }

  return (
    <Tabs defaultValue={listos.length > 0 ? 'posts' : 'ideas'}>
      {ideando && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" />
          <div>
            <p className="font-medium">Pensando la campaña…</p>
            <p className="text-primary/80">
              La IA está armando el calendario y dirigiendo cada pieza. Puede tardar unos minutos. Te
              avisamos por mail cuando esté listo para revisar.
            </p>
          </div>
        </div>
      )}
      {ideacionError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">No se pudo generar el calendario.</p>
            <p className="text-destructive/80">Revisá la conexión con n8n y reintentá.</p>
          </div>
          <Button size="sm" variant="outline" onClick={reintentarIdeacion} disabled={retrying}>
            Reintentar
          </Button>
        </div>
      )}
      <TabsList className="w-full">
        <TabsTrigger value="ideas">
          <Lightbulb />
          Ideas
          <Count n={ideas.length} />
        </TabsTrigger>
        <TabsTrigger value="posts">
          <Images />
          Posts listos
          <Count n={listos.length} />
        </TabsTrigger>
        <TabsTrigger value="material">
          <Layers />
          Multimedia
          <Count n={pendientes} tone="spark" />
        </TabsTrigger>
      </TabsList>

      {/* Ideas: el plan de la campaña (piezas todavía sin producir) */}
      <TabsContent value="ideas" className="mt-4">
        {ideas.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              El plan de contenido de la campaña. Cada pieza tiene su objetivo, hook y el material que
              necesita. Cuando se genera su multimedia, pasa a <span className="font-medium text-foreground">Posts listos</span>.
            </p>
            {ideas.map((p) => (
              <IdeaCard key={p.id} post={p} dia={dia.get(p.id) ?? 0} assets={assets} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Lightbulb}
            title="Todavía no hay ideas"
            action={
              <NuevoPostDialog campaignId={campaign.id}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="size-4" />
                  Agregar idea
                </Button>
              </NuevoPostDialog>
            }
          >
            Generá la campaña con el director de contenido, o agregá una pieza a mano para empezar a
            planificar.
          </EmptyState>
        )}
      </TabsContent>

      {/* Posts listos: lo procesado, listo para copiar y descargar */}
      <TabsContent value="posts" className="mt-4">
        {listos.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Piezas con su multimedia ya generada. Copiá el texto, descargá los archivos y marcá cada una
              a medida que la aprobás y publicás.
            </p>
            {listos.map((p) => (
              <ReadyPostCard key={p.id} post={p} dia={dia.get(p.id) ?? 0} />
            ))}
          </div>
        ) : (
          <EmptyState icon={ImageOff} title="Todavía no hay posts listos">
            Cuando se genere la multimedia de una idea, vas a verla acá lista para revisar, aprobar y
            descargar.
          </EmptyState>
        )}
      </TabsContent>

      {/* Multimedia: el material — qué pedimos, qué genera la IA, qué está cargado */}
      <TabsContent value="material" className="mt-4">
        <MaterialSection
          campaignId={campaign.id}
          userId={userId}
          initialAssets={assets}
          posts={posts}
          dia={dia}
        />
      </TabsContent>
    </Tabs>
  )
}

'use client'

import type { Campaign, Post, CampaignAsset } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { IdeaCard } from './idea-card'
import { ReadyPostCard } from './ready-post-card'
import { MaterialSection } from './material-section'
import { NuevoPostDialog } from './nuevo-post-dialog'
import { sortByFecha, diaMap } from './helpers'
import { ImageOff, Images, Layers, Lightbulb, Plus } from 'lucide-react'

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
  const dia = diaMap(posts)
  const ideas = sortByFecha(posts.filter((p) => !p.media_url))
  const listos = sortByFecha(posts.filter((p) => p.media_url))
  const pendientes = assets.filter((a) => !a.url && a.origen === 'a_pedir').length

  return (
    <Tabs defaultValue={listos.length > 0 ? 'posts' : 'ideas'}>
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

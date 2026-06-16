import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCampaign, getCampaignAssets, getPostsForCampaign, getUser } from '@/lib/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Plus, FileText } from 'lucide-react'
import { NuevoPostDialog } from './nuevo-post-dialog'
import { PostCard } from './post-card'
import { CampanaEstadoSelect } from './campana-estado-select'
import { MaterialSection } from './material-section'
import type { Campaign } from '@/lib/types'

const ESTADO_BADGE: Record<Campaign['estado'], string> = {
  borrador: 'bg-muted text-muted-foreground border-border',
  activa: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  finalizada: 'bg-muted text-muted-foreground/60 border-border',
}
const ESTADO_LABEL: Record<Campaign['estado'], string> = {
  borrador: 'Borrador',
  activa: 'Activa',
  finalizada: 'Finalizada',
}

export default async function CampanaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const campaign = await getCampaign(id)
  if (!campaign) notFound()

  const posts = await getPostsForCampaign(id)
  const assets = await getCampaignAssets(id)

  const borradores = posts.filter((p) => p.estado === 'borrador')
  const aprobados = posts.filter((p) => p.estado === 'aprobado')
  const publicados = posts.filter((p) => p.estado === 'publicado')

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-2">
        <Link
          href="/campanas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Campañas
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{campaign.nombre}</h1>
            <Badge variant="outline" className={`text-xs ${ESTADO_BADGE[campaign.estado]}`}>
              {ESTADO_LABEL[campaign.estado]}
            </Badge>
          </div>
          {campaign.que_promociona && (
            <p className="mt-1 text-sm text-muted-foreground">{campaign.que_promociona}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CampanaEstadoSelect campaignId={campaign.id} currentEstado={campaign.estado} />
          <NuevoPostDialog campaignId={campaign.id}>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              Nuevo post
            </Button>
          </NuevoPostDialog>
        </div>
      </div>

      {/* Brief */}
      {campaign.brief && (
        <Card className="mb-6 bg-muted/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Brief</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">{campaign.brief}</CardContent>
        </Card>
      )}

      {/* Material de la campaña */}
      <MaterialSection campaignId={campaign.id} userId={user.id} initialAssets={assets} />

      {/* Empty state */}
      {posts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="size-8 text-muted-foreground/40" />
            <div>
              <p className="font-medium">No hay posts en esta campaña</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Agregá el primer post para empezar a planificar el contenido.
              </p>
            </div>
            <NuevoPostDialog campaignId={campaign.id}>
              <Button size="sm" variant="outline" className="mt-1 gap-2">
                <Plus className="size-4" />
                Nuevo post
              </Button>
            </NuevoPostDialog>
          </CardContent>
        </Card>
      )}

      {/* Posts sections */}
      {posts.length > 0 && (
        <div className="flex flex-col gap-8">
          {borradores.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Borradores ({borradores.length})
              </h2>
              <div className="grid gap-4">
                {borradores.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}
          {aprobados.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Aprobados ({aprobados.length})
              </h2>
              <div className="grid gap-4">
                {aprobados.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}
          {publicados.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Publicados ({publicados.length})
              </h2>
              <div className="grid gap-4">
                {publicados.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

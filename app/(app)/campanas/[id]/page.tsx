import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCampaign, getCampaignAssets, getPostsForCampaign, getUser } from '@/lib/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Plus } from 'lucide-react'
import { NuevoPostDialog } from './nuevo-post-dialog'
import { CampanaEstadoSelect } from './campana-estado-select'
import { CampanaTabs } from './campana-tabs'
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

      <CampanaTabs campaign={campaign} posts={posts} assets={assets} userId={user.id} />
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getBusiness, getCampaigns, getUser } from '@/lib/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Megaphone } from 'lucide-react'
import { NuevaCampanaDialog } from './nueva-campana-dialog'
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

export default async function CampanasPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const business = await getBusiness()
  const campaigns = business ? await getCampaigns(business.id) : []

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campañas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestioná tus campañas de marketing y los posts asociados.
          </p>
        </div>
        {business && (
          <NuevaCampanaDialog businessId={business.id}>
            <Button size="sm" className="gap-2 shrink-0">
              <Plus className="size-4" />
              Nueva campaña
            </Button>
          </NuevaCampanaDialog>
        )}
      </div>

      {!business && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Megaphone className="size-8 text-muted-foreground/40" />
            <div>
              <p className="font-medium">Primero configurá tu negocio</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Antes de crear campañas, completá los datos de tu negocio.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-1">
              <Link href="/negocio">Ir a Mi Negocio</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {business && campaigns.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Megaphone className="size-8 text-muted-foreground/40" />
            <div>
              <p className="font-medium">No tenés campañas todavía</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Creá tu primera campaña para empezar a generar contenido.
              </p>
            </div>
            <NuevaCampanaDialog businessId={business.id}>
              <Button size="sm" variant="outline" className="mt-1 gap-2">
                <Plus className="size-4" />
                Nueva campaña
              </Button>
            </NuevaCampanaDialog>
          </CardContent>
        </Card>
      )}

      {campaigns.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/campanas/${c.id}`} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                      {c.nombre}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${ESTADO_BADGE[c.estado]}`}
                    >
                      {ESTADO_LABEL[c.estado]}
                    </Badge>
                  </div>
                  {c.brief && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {c.brief}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

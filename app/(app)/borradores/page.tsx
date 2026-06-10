import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getBusiness, getCampaigns, getAllPosts, getUser } from '@/lib/queries'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { LayoutGrid } from 'lucide-react'
import { FORMATO_LABEL, FORMATO_COLOR } from '@/lib/types'

export default async function BorradoresPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const business = await getBusiness()
  const campaigns = business ? await getCampaigns(business.id) : []
  const campaignMap = Object.fromEntries(campaigns.map((c) => [c.id, c]))
  const allPosts = await getAllPosts(campaigns.map((c) => c.id))
  const borradores = allPosts.filter((p) => p.estado === 'borrador')

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Borradores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todos los posts en estado borrador, de todas tus campañas.
        </p>
      </div>

      {borradores.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <LayoutGrid className="size-8 text-muted-foreground/40" />
            <div>
              <p className="font-medium">No hay borradores</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Los posts en estado borrador de tus campañas aparecerán aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {borradores.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {borradores.map((post) => {
            const campaign = campaignMap[post.campaign_id]
            const fecha = new Date(post.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
            })

            return (
              <Link key={post.id} href={`/campanas/${post.campaign_id}`} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      {post.formato && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${FORMATO_COLOR[post.formato]}`}
                        >
                          {FORMATO_LABEL[post.formato]}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{fecha}</span>
                    </div>
                    {campaign && (
                      <p className="text-xs font-medium text-primary/80 group-hover:text-primary transition-colors truncate">
                        {campaign.nombre}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    {post.texto ? (
                      <p className="line-clamp-3 text-sm leading-relaxed">{post.texto}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground/60 italic">Sin texto todavía.</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

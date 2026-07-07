import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getBusiness, getCampaigns, getAllPosts, getUser } from '@/lib/queries'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Sun, ChevronRight } from 'lucide-react'
import { FORMATO_LABEL, FORMATO_COLOR } from '@/lib/types'

function getLocalToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export default async function HoyPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const today = getLocalToday()
  const dateLabel = new Date(today + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const business = await getBusiness()
  const campaigns = business ? await getCampaigns(business.id) : []
  const campaignMap = Object.fromEntries(campaigns.map((c) => [c.id, c]))
  const allPosts = await getAllPosts(campaigns.map((c) => c.id))

  const todayPosts = allPosts.filter((p) => p.fecha === today)
  const upcomingPosts = allPosts
    .filter((p) => p.fecha > today)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 6)

  return (
    <div className="mx-auto max-w-2xl">
      {/* Greeting */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sun className="size-5 text-chart-3" />
          <h1 className="text-2xl font-semibold tracking-tight capitalize">{dateLabel}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Acá encontrás los posts programados para hoy y los próximos días.
        </p>
      </div>

      {/* Today */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Hoy
        </h2>
        {todayPosts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-muted-foreground">No hay posts programados para hoy.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {todayPosts.map((post) => {
              const campaign = campaignMap[post.campaign_id]
              return (
                <Link key={post.id} href={`/campanas/${post.campaign_id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {post.formato && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${FORMATO_COLOR[post.formato]}`}
                            >
                              {FORMATO_LABEL[post.formato]}
                            </Badge>
                          )}
                          {post.hora && (
                            <span className="text-xs text-muted-foreground">
                              {post.hora.slice(0, 5)}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                      </div>
                      {campaign && (
                        <p className="text-xs font-medium text-primary/80">{campaign.nombre}</p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      {post.texto ? (
                        <p className="line-clamp-3 text-sm leading-relaxed">{post.texto}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground/60 italic">Sin texto.</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcomingPosts.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Próximos
          </h2>
          <div className="flex flex-col gap-2">
            {upcomingPosts.map((post) => {
              const campaign = campaignMap[post.campaign_id]
              const fecha = new Date(post.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })
              return (
                <Link key={post.id} href={`/campanas/${post.campaign_id}`}>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent/50">
                    <span className="w-24 shrink-0 text-xs text-muted-foreground capitalize">
                      {fecha}
                    </span>
                    {post.formato && (
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-xs ${FORMATO_COLOR[post.formato]}`}
                      >
                        {FORMATO_LABEL[post.formato]}
                      </Badge>
                    )}
                    <span className="flex-1 truncate text-muted-foreground">
                      {post.texto ?? campaign?.nombre ?? '—'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

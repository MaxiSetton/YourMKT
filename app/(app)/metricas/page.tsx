import { redirect } from 'next/navigation'
import {
  getBusiness,
  getCampaigns,
  getAllPosts,
  getMetrics,
  getBaselineMetrics,
  getUser,
} from '@/lib/queries'
import { MetricasClient } from './metricas-client'

export default async function MetricasPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const business = await getBusiness()
  const campaigns = business ? await getCampaigns(business.id) : []
  const posts = await getAllPosts(campaigns.map((c) => c.id))
  const metrics = await getMetrics(posts.map((p) => p.id))
  const baseline = business ? await getBaselineMetrics(business.id) : []

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Métricas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seguí el rendimiento de tus posts y campañas a lo largo del tiempo.
        </p>
      </div>
      <MetricasClient
        posts={posts}
        metrics={metrics}
        baseline={baseline}
        campaigns={campaigns}
        businessId={business?.id ?? null}
      />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { getBusiness, getCampaigns, getAllPosts, getUser } from '@/lib/queries'
import { CalendarioClient } from './calendario-client'

export default async function CalendarioPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const business = await getBusiness()
  const campaigns = business ? await getCampaigns(business.id) : []
  const posts = await getAllPosts(campaigns.map((c) => c.id))

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualizá todos tus posts programados en el tiempo.
        </p>
      </div>
      <CalendarioClient posts={posts} campaigns={campaigns} />
    </div>
  )
}

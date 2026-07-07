import { redirect } from 'next/navigation'
import { getBusiness, getUser } from '@/lib/queries'
import { NegocioForm } from './negocio-form'

export default async function NegocioPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const business = await getBusiness()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Mi Negocio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configurá los datos de tu negocio para personalizar las campañas generadas por IA.
        </p>
      </div>
      <NegocioForm business={business} userId={user.id} />
    </div>
  )
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fireN8n } from '@/lib/routines'

// Botón "crear campaña": manda el evento a n8n. n8n firea Routine 1 (calendario) → Routine 2
// (dirección de todas las piezas), pollea y avisa por mail.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('nombre, fecha_inicio, business_id')
    .eq('id', id)
    .maybeSingle()
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
  if (!campaign.fecha_inicio)
    return NextResponse.json(
      { error: 'La campaña necesita una fecha de inicio para generar el calendario.' },
      { status: 400 },
    )

  const { data: business } = await supabase
    .from('businesses')
    .select('nombre')
    .eq('id', campaign.business_id)
    .maybeSingle()
  if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  await supabase.from('campaigns').update({ gen_status: 'ideando' }).eq('id', id)

  try {
    await fireN8n('idear-campana', {
      campaignId: id,
      negocio: business.nombre,
      campania: campaign.nombre,
      email: user.email,
    })
  } catch (e) {
    await supabase.from('campaigns').update({ gen_status: 'error' }).eq('id', id)
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}

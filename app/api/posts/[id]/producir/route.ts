import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fireN8n, diaFromInicio } from '@/lib/routines'

// Botón "generar / regenerar pieza": manda el evento a n8n, que firea Routine 3 (producción).
// Avisa por mail al terminar.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { observaciones = '' } = await req.json().catch(() => ({}))

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: post } = await supabase
    .from('posts')
    .select('campaign_id, fecha, formato, media_url')
    .eq('id', id)
    .maybeSingle()
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('nombre, fecha_inicio, business_id')
    .eq('id', post.campaign_id)
    .maybeSingle()
  if (!campaign?.fecha_inicio)
    return NextResponse.json({ error: 'La campaña no tiene fecha de inicio.' }, { status: 400 })

  const { data: business } = await supabase
    .from('businesses')
    .select('nombre')
    .eq('id', campaign.business_id)
    .maybeSingle()
  if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  await supabase.from('posts').update({ gen_status: 'produciendo' }).eq('id', id)

  try {
    await fireN8n('producir-post', {
      postId: id,
      negocio: business.nombre,
      campania: campaign.nombre,
      dia: diaFromInicio(post.fecha, campaign.fecha_inicio),
      formato: post.formato,
      observaciones,
      email: user.email,
    })
  } catch (e) {
    await supabase.from('posts').update({ gen_status: 'error' }).eq('id', id)
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}

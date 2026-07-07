// Helpers server-side para la orquestación. La web NO firea las routines: solo resuelve los datos
// (negocio/campaña/día) y dispara el webhook de n8n. n8n es el que llama a las routines.

// Día de la pieza dentro de la campaña, como lo esperan las routines:
// día 1 = fecha_inicio (1-indexado). Las fechas son 'YYYY-MM-DD'.
export function diaFromInicio(fecha: string, fechaInicio: string): number {
  const a = Date.parse(fecha + 'T00:00:00Z')
  const b = Date.parse(fechaInicio + 'T00:00:00Z')
  return Math.floor((a - b) / 86_400_000) + 1
}

// Dispara un workflow de n8n. n8n recibe los datos del evento y se encarga del resto (firea la
// routine, pollea Supabase, avisa por mail). El header valida que el webhook lo llamó la app.
export async function fireN8n(path: string, payload: Record<string, unknown>): Promise<void> {
  const base = process.env.N8N_WEBHOOK_BASE
  if (!base) throw new Error('N8N_WEBHOOK_BASE no está configurado')
  const res = await fetch(`${base.replace(/\/$/, '')}/${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-yourmkt-secret': process.env.N8N_WEBHOOK_SECRET ?? '',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`n8n ${path} respondió ${res.status} ${body}`.trim())
  }
}

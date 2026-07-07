// Helpers cliente para disparar la orquestación de routines (web → /api → n8n).

export async function postGen(url: string, body?: unknown): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(j.error || 'No se pudo iniciar la generación.')
  }
}

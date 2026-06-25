# n8n — orquestación de las routines de YourMKT

**n8n llama a las routines.** La web solo tiene los botones que mandan el evento a n8n; n8n firea la
routine, espera a que termine (mirando Supabase) y avisa por mail.

```
Crear campaña / botón → /api/... (web: setea "cargando" + manda el evento) → webhook n8n
n8n → firea la routine → cada 30-45s pregunta a Supabase si terminó → escribe gen_status → mail (Gmail)
```

Como n8n Cloud no tiene "env/variables" pero **sí tiene Credentials**, los tokens y la key de Supabase
van ahí (los pegás vos en n8n, nunca en el código).

## Qué configurás en n8n (una vez)
1. **Importar** los 4 `.json` (Import from File).
2. **Credenciales** (Credentials → New):
   - **Gmail OAuth2** → "Gmail account": conectá tu cuenta. Va en los nodos `Avisar ...`.
   - **Supabase API** → "Supabase YourMKT": host `https://qhjuyxuastyubtlodwym.supabase.co`, key = la
     **service-role**. La usan los nodos `Check ...` / `Marcar ...` / `Listar Storage` / `Resumen del dia`.
   - **Header Auth** ×3 → "Routine 1 token", "Routine 2 token", "Routine 3 token": en cada una,
     Name = `Authorization`, Value = `Bearer <TOKEN_DE_ESA_ROUTINE>` (los `ROUTINE_*_TOKEN` de tu `.env`).
     Van en los nodos `Fire R1/R2/R3`.
3. **URL de disparo** de cada routine (los nodos `Fire ...` traen un placeholder): pegá la URL real que
   te da la página de la routine en claude.ai ("copiar curl"). Reemplazá:
   - `__ROUTINE_1_FIRE_URL__` → en `idear-campana` (Fire R1).
   - `__ROUTINE_2_FIRE_URL__` → en `idear-campana` (Fire R2) **y** en `regenerar-idea` (Fire R2).
   - `__ROUTINE_3_FIRE_URL__` → en `producir-post` (Fire R3).
4. **Asigná las credenciales** importadas (aparecen como "REEMPLAZAR") a cada nodo y **activá**.

## Workflows

| Archivo | Trigger | Qué hace |
|---|---|---|
| `idear-campana.json` | Webhook `idear-campana` | fire **R1** (calendario) → espera que aparezcan los posts → fire **R2** (dirige todas las piezas) → espera que todas tengan `spec` → mail "campaña lista" |
| `regenerar-idea.json` | Webhook `regenerar-idea` | fire **R2** (un día, con observaciones) → espera que suba `version` (sin mail) |
| `producir-post.json` | Webhook `producir-post` | fire **R3** → espera `media_url` + archivo fresco en Storage → mail "post listo" |
| `aviso-diario.json` | Cron `0 6 * * *` | RPC `resumen_diario` en Supabase (qué se produjo hoy + mail del dueño de `auth.users`) → mail por dueño |

> La **producción de las 5am** la dispara **claude.ai** (trigger Horario de la Routine 3), NO n8n.
> `aviso-diario` solo manda el aviso a las 6am.

## Cómo n8n sabe que una routine terminó (mira Supabase)
- **R1 (calendario):** aparecen filas en `posts` para la campaña.
- **R2 (dirección, todas):** ya no hay posts con `spec` null. **R2 (un día):** subió `posts.version`.
- **R3 (pieza):** `posts.media_url` presente **y** el archivo del Storage tiene `updated_at` nuevo
  (sirve igual para la 1ª producción que para una regeneración; no se pierde la pieza anterior).
- Timeouts: calendario 30 min, dirección/pieza 45 min → si se pasa, marca `gen_status='error'` + mail.

## Del lado de la web
La web **no** firea routines ni guarda tokens de routine. Solo necesita (en Vercel + `.env`):

```dotenv
N8N_WEBHOOK_BASE=https://TU-N8N/webhook   # sin barra final; la app agrega /idear-campana, etc.
N8N_WEBHOOK_SECRET=...                     # opcional: si querés, validá el webhook con Header Auth en n8n
```

La web manda a n8n, en el cuerpo, los datos del evento (negocio, campaña, día, formato, observaciones,
`campaignId`/`postId`, `fromVersion`, email) — nada secreto.

## Notas
- **Migración:** corré `db/routines-orquestacion.sql` en Supabase (agrega `gen_status` + `spec` + el RPC
  `resumen_diario`).
- **Endpoint de disparo:** la URL/headers exactos los confirma el "copiar curl" de cada routine en
  claude.ai. El body que mandan los nodos es `{ "text": "<params como string>" }` (lo arma el nodo `Fire`).
- **TZ del cron 6am:** el RPC usa `America/Argentina/Buenos_Aires`. Poné el cron a las 6am de Argentina
  (o ajustá la TZ de tu n8n).
- **Smoke-test:** activá los workflows, disparáa cada uno desde la app y mirá la ejecución en n8n.

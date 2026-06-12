# YourMKT — Project Context (Vercel + Supabase)

Internal tool that turns a business's info into AI-generated Instagram marketing campaigns:
a human reviews/approves drafts, publishes, then loads metrics for comparison.

**Design & frontend work:** use the `yourmkt-design` and `web-interface-guidelines` skills in
`.claude/skills/`. This file is the **infra** context.

---

## Stack
- **Next.js 16** App Router (RSC) · React 19 · TypeScript · Tailwind v4 (CSS-first, tokens in
  `app/globals.css`) · shadcn/ui (`base-nova`) · lucide · sonner.
- **Supabase** (Postgres + Auth + Storage, RLS everywhere).
- Hosted on **Vercel**. `next.config.mjs` has `typescript.ignoreBuildErrors: true` and
  `images.unoptimized: true`.

## Supabase
- **Project:** `YourMKT_Database` · ref **`qhjuyxuastyubtlodwym`** · region us-east-1.
- **URL:** `https://qhjuyxuastyubtlodwym.supabase.co`
- ⚠️ **The project lives in MARCOS's Vercel-managed Supabase org** (`vercel_icfg_…`,
  "mpelletl29-7186's projects"), NOT Maxi's. It was provisioned via the Vercel↔Supabase
  integration in Marcos's account. To manage it over MCP you must auth the Supabase MCP with the
  account that owns that org. **Do not let anyone delete Marcos's Vercel project/integration — it
  can take the database with it.** Long-term: migrate to Maxi's own Supabase account.
- **Env vars the app reads** (set in Vercel + v0): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key is public by design; get it from the dashboard or MCP
  `get_publishable_keys`). Missing → `500 / MIDDLEWARE_INVOCATION_FAILED`.

### Schema (public, all RLS-enabled, owner = `auth.uid()` via `businesses.user_id`)
- **businesses** — `nombre`, `descripcion`, `tono_marca`, `tono_detalle`, `rubro`,
  `propuesta_valor`, `publico_objetivo`, `estetica_visual`, `ejemplos_posts`, `evitar`,
  `sitio_web`, `instagram`.
- **campaigns** — `business_id→`, `nombre`, `brief`, `que_promociona`, `objetivo`, `fecha_inicio`,
  `duracion_dias`, `elementos_especificos`, `estado` (`borrador|activa|finalizada`).
- **campaign_assets** — `campaign_id→`, `tipo` (`imagen|video`), `categoria`
  (`producto|proceso|otro`), `url`, `nombre_archivo`, `descripcion` **(NOT NULL)**. User-uploaded
  product/process media; description is mandatory so n8n never has to vision-read it.
- **posts** — `campaign_id→`, `fecha`, `hora`, `formato` (`feed|story|reel`), `texto`,
  `media_url`, `media_tipo`, `prompt_media`, `version`, `estado` (`borrador|aprobado|publicado`).
- **metrics** — `post_id→`, `alcance`, `likes`, `comentarios`, `guardados`.
- **baseline_metrics** — `business_id→`, prior metrics for campaign comparison.
- **Storage buckets** (private): `post-media`, `business-docs`. RLS requires the first path
  segment to be `auth.uid()`. Campaign assets upload to `post-media/{userId}/{campaignId}/…`.
- RLS pattern for child tables: `… in (select c.id from campaigns c join businesses b on
  b.id = c.business_id where b.user_id = auth.uid())`. Mirror it for any new table.

### posts ↔ generator JSON (n8n, pending)
The calendar generator (`generador-campanas/` in the parent workspace) outputs `copy`,
`mejor_horario`, `idea_visual`, `media`, `tipo`, `cta`, `hashtags`, `relacion_aspecto`. Map to
posts: `copy→texto`, `mejor_horario→hora`, `idea_visual→prompt_media`, `media→media_tipo`.
`tipo`, `cta`, `hashtags`, `relacion_aspecto` have **no column yet** — reconcile when wiring n8n.

## Vercel
- **Team:** `team_p7fEghtp20qElzOqxTMGoYXj` ("maxisetton-gmailcom's projects").
- **Project:** `yourmkt` · `prj_qHTzWTg59n8anYcELUav5pSoAVHp`. Domain `yourmkt.vercel.app`.
- A duplicate project `v0-continue-conversation` points at the **same repo** — safe to delete in v0.
- **Production branch = `main`.** Pushing to the v0 branch makes a **preview**, not production →
  promote manually (Deployments → ⋯ → Promote to Production) or push to `main`.
- Marcos's Vercel account also has a leftover project on this repo → he gets "failed deployment"
  emails on every push (he's not a member of Maxi's team). Harmless; he should disconnect Git on
  that project (carefully — see the Supabase warning above).

## GitHub & the v0 workflow
- Repo **`MaxiSetton/YourMKT`** (private). The real app lives on branch
  **`v0/maxisetton-6912-67a28f79`** (commit base `55e060d`); `main` is just a scaffold/README.
- **Editing flow used here:** `git clone`, `git checkout -B work <v0-branch>`, edit, verify
  (`npm install` → `npm run build`), commit, `git push origin HEAD:v0/maxisetton-6912-67a28f79`.
- ⚠️ **v0 does NOT auto-pull external commits.** After pushing from git, the user must **Pull/Sync
  in v0** or v0's next save can overwrite the changes. Pick ONE editing surface per file:
  recommended — infra/DB/logic via git (Claude), visual tweaks in v0 **after a Pull**.
- Verify build before pushing (`ignoreBuildErrors` is on, so `tsc` noise from `@base-ui` is
  expected/pre-existing — confirm via `next build`, and eyeball your own types).

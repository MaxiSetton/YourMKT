import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getBusiness, getCampaigns, getAllPosts, getUser } from '@/lib/queries'
import { FORMATO_LABEL } from '@/lib/types'
import type { Post, Campaign } from '@/lib/types'
import { Image as ImageIcon, Play, Check, Bell, ArrowUpRight, Sparkles, Rocket } from 'lucide-react'

const TZ = 'America/Argentina/Buenos_Aires'

function arNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  )
  return {
    today: `${parts.year}-${parts.month}-${parts.day}`,
    hhmm: `${parts.hour}:${parts.minute}`,
  }
}

export default async function InicioPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const business = await getBusiness()

  const { today, hhmm } = arNow()
  const d = new Date(today + 'T12:00:00')
  const eyebrow = `${d.toLocaleDateString('es-AR', { weekday: 'long' })} ${d.getDate()} · ${d.toLocaleDateString('es-AR', { month: 'long' })}`.toUpperCase()

  if (!business) {
    return (
      <div className="mx-auto max-w-2xl">
        <Header eyebrow={eyebrow} subtitle="Empecemos por lo importante." />
        <Link
          href="/negocio"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-input"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Cargá tu marca</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              La IA necesita conocer tu negocio para generar campañas con tu voz.
            </p>
          </div>
          <ArrowUpRight className="size-5 shrink-0 text-muted-foreground" />
        </Link>
      </div>
    )
  }

  const campaigns = await getCampaigns(business.id)
  const campaignMap: Record<string, Campaign> = Object.fromEntries(
    campaigns.map((c) => [c.id, c]),
  )
  const allPosts = await getAllPosts(campaigns.map((c) => c.id))

  const todayPosts = allPosts
    .filter((p) => p.fecha === today)
    .sort((a, b) => (a.hora ?? '99').localeCompare(b.hora ?? '99'))

  let nowIdx = todayPosts.findIndex(
    (p) => (p.hora?.slice(0, 5) ?? '99:99') > hhmm,
  )
  if (nowIdx === -1) nowIdx = todayPosts.length

  const activas = campaigns.filter((c) => c.estado === 'activa').length
  const programados = allPosts.filter((p) => p.estado === 'aprobado').length
  const mes = today.slice(0, 7)
  const publicadosMes = allPosts.filter(
    (p) => p.estado === 'publicado' && p.fecha.startsWith(mes),
  ).length
  const pendientes = allPosts.filter((p) => p.estado === 'borrador').length
  const campañaActiva = campaigns.find((c) => c.estado === 'activa')

  return (
    <div className="mx-auto max-w-2xl">
      <Header
        eyebrow={eyebrow}
        subtitle={
          todayPosts.length > 0 ? (
            <>
              {todayPosts.length} {todayPosts.length === 1 ? 'post' : 'posts'} en
              agenda
              {campañaActiva && (
                <>
                  {' · campaña '}
                  <span className="font-medium text-foreground">
                    {campañaActiva.nombre}
                  </span>
                </>
              )}
            </>
          ) : (
            'Nada para subir hoy. Buen momento para planear la próxima campaña.'
          )
        }
      />

      {todayPosts.length > 0 ? (
        <ol className="mb-9">
          {todayPosts.slice(0, nowIdx).map((post) => (
            <RailPost key={post.id} post={post} campaign={campaignMap[post.campaign_id]} />
          ))}
          <NowMarker hhmm={hhmm} />
          {todayPosts.slice(nowIdx).map((post) => (
            <RailPost key={post.id} post={post} campaign={campaignMap[post.campaign_id]} />
          ))}
        </ol>
      ) : (
        <Link
          href="/campanas"
          className="mb-9 flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card p-5 transition-colors hover:border-input"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Rocket className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Crear una campaña</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Dale un brief a la IA y armá el calendario de posts.
            </p>
          </div>
          <ArrowUpRight className="size-5 shrink-0 text-muted-foreground" />
        </Link>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Campañas activas" value={activas} />
        <Stat label="Programados" value={programados} />
        <Stat label="Publicados · mes" value={publicadosMes} />
      </div>

      {pendientes > 0 && (
        <Link
          href="/borradores"
          className="mt-3 flex items-center gap-3 rounded-2xl bg-spark-surface p-3.5 transition-opacity hover:opacity-90"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FBD6A8] text-spark-foreground">
            <Bell className="size-[18px]" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-medium text-spark-foreground">
              {pendientes} {pendientes === 1 ? 'post espera' : 'posts esperan'} tu
              aprobación
            </p>
            <p className="mt-0.5 text-[11px] text-spark-foreground/75">
              Revisalos antes de que se programen
            </p>
          </div>
          <span className="ml-auto whitespace-nowrap text-xs font-medium text-spark-foreground">
            Revisar →
          </span>
        </Link>
      )}
    </div>
  )
}

function Header({
  eyebrow,
  subtitle,
}: {
  eyebrow: string
  subtitle: React.ReactNode
}) {
  return (
    <div className="mb-7">
      <p className="mb-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-secondary-foreground">
        {eyebrow}
      </p>
      <h1 className="font-heading text-[2rem] font-semibold leading-[1.05] tracking-tight">
        Lo de hoy
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  )
}

function NowMarker({ hhmm }: { hhmm: string }) {
  return (
    <li className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
      <div className="pt-0 text-right font-mono text-[11px] font-medium tabular-nums text-spark-foreground">
        {hhmm}
      </div>
      <div className="relative border-l-2 border-border py-3 pl-5">
        <span className="absolute -left-[7px] top-[7px] size-3 rounded-full border-2 border-background bg-spark" />
        <div className="flex items-center gap-2">
          <div className="h-0.5 flex-1 rounded-full bg-spark" />
          <span className="rounded-md bg-spark-surface px-2 py-0.5 text-[10px] font-medium text-spark-foreground">
            ahora
          </span>
        </div>
      </div>
    </li>
  )
}

function RailPost({ post, campaign }: { post: Post; campaign?: Campaign }) {
  const done = post.estado === 'publicado'
  const isVideo = post.formato === 'reel'
  return (
    <li className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
      <div className="pt-3.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {post.hora ? post.hora.slice(0, 5) : '—'}
      </div>
      <div className="relative border-l-2 border-border pb-4 pl-5">
        <span
          className={`absolute -left-[6px] top-[15px] size-2.5 rounded-full border-2 border-background ${
            done ? 'bg-muted-foreground/40' : 'bg-primary'
          }`}
        />
        <Link
          href={`/campanas/${post.campaign_id}`}
          className={`block rounded-2xl border border-border bg-card p-3 transition-colors hover:border-input ${
            done ? 'opacity-65' : ''
          }`}
        >
          <div className="flex gap-3">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              {isVideo ? <Play className="size-6" /> : <ImageIcon className="size-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-[2px] bg-chart-2" />
                <span className="truncate text-xs text-muted-foreground">
                  {campaign?.nombre ?? 'Sin campaña'}
                </span>
                {done ? (
                  <Check className="ml-auto size-4 shrink-0 text-muted-foreground" />
                ) : (
                  post.formato && (
                    <span className="ml-auto shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {FORMATO_LABEL[post.formato]}
                    </span>
                  )
                )}
              </div>
              <p className="line-clamp-2 text-[13px] leading-snug text-card-foreground">
                {post.texto ?? 'Sin texto todavía.'}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </li>
  )
}

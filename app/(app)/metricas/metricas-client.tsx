'use client'

import type { Post, Metric, BaselineMetric, Campaign } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { CargarMetricasDialog } from './cargar-metricas-dialog'

interface Props {
  posts: Post[]
  metrics: Metric[]
  baseline: BaselineMetric[]
  campaigns: Campaign[]
  businessId: string | null
}

const chartConfig = {
  alcance: { label: 'Alcance', color: 'var(--chart-1)' },
  likes: { label: 'Likes', color: 'var(--chart-2)' },
  comentarios: { label: 'Comentarios', color: 'var(--chart-3)' },
  guardados: { label: 'Guardados', color: 'var(--chart-4)' },
  compartidos: { label: 'Compartidos', color: 'var(--chart-5)' },
}

const METRICAS = [
  { key: 'alcance', label: 'Alcance' },
  { key: 'likes', label: 'Likes' },
  { key: 'comentarios', label: 'Comentarios' },
  { key: 'guardados', label: 'Guardados' },
  { key: 'compartidos', label: 'Compartidos' },
] as const

type Fila = Record<string, number | null>

function promedio(rows: Fila[], key: string): number | null {
  const vals = rows.map((r) => r[key]).filter((v): v is number => v != null)
  if (vals.length === 0) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

const fmt = (v: number | null) =>
  v == null ? '—' : Math.round(v).toLocaleString('es-AR')

function BarraComparacion({
  label,
  value,
  max,
  esYourmkt,
}: {
  label: string
  value: number | null
  max: number
  esYourmkt: boolean
}) {
  const pct = value != null && max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="h-4 flex-1 overflow-hidden rounded bg-muted">
        <div
          className={`h-full rounded ${esYourmkt ? 'bg-primary' : 'bg-muted-foreground/40'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 shrink-0 text-right text-xs tabular-nums">{fmt(value)}</span>
    </div>
  )
}

export function MetricasClient({ posts, metrics, baseline, businessId }: Props) {
  const metricByPost = Object.fromEntries(metrics.map((m) => [m.post_id, m]))

  // Totals
  const totals = metrics.reduce(
    (acc, m) => ({
      alcance: acc.alcance + (m.alcance ?? 0),
      likes: acc.likes + (m.likes ?? 0),
      comentarios: acc.comentarios + (m.comentarios ?? 0),
      guardados: acc.guardados + (m.guardados ?? 0),
      compartidos: acc.compartidos + (m.compartidos ?? 0),
    }),
    { alcance: 0, likes: 0, comentarios: 0, guardados: 0, compartidos: 0 },
  )

  const postsWithMetrics = posts.filter((p) => metricByPost[p.id])

  // Bar chart data: top posts by alcance
  const topPosts = postsWithMetrics
    .map((p) => ({
      name: p.fecha,
      alcance: metricByPost[p.id]?.alcance ?? 0,
      likes: metricByPost[p.id]?.likes ?? 0,
      compartidos: metricByPost[p.id]?.compartidos ?? 0,
    }))
    .sort((a, b) => b.alcance - a.alcance)
    .slice(0, 8)

  // Comparación de promedios: posts anteriores (orgánicos) vs posts de YourMKT
  const filasYourmkt: Fila[] = metrics.map((m) => ({
    alcance: m.alcance,
    likes: m.likes,
    comentarios: m.comentarios,
    guardados: m.guardados,
    compartidos: m.compartidos,
  }))
  const filasAnteriores: Fila[] = baseline.map((b) => ({
    alcance: b.alcance,
    likes: b.likes,
    comentarios: b.comentarios,
    guardados: b.guardados,
    compartidos: b.compartidos,
  }))
  const comparacion = METRICAS.map(({ key, label }) => {
    const anteriores = promedio(filasAnteriores, key)
    const yourmkt = promedio(filasYourmkt, key)
    const lift =
      anteriores != null && anteriores > 0 && yourmkt != null
        ? Math.round(((yourmkt - anteriores) / anteriores) * 100)
        : null
    return { label, anteriores, yourmkt, max: Math.max(anteriores ?? 0, yourmkt ?? 0), lift }
  }).filter((r) => r.anteriores != null || r.yourmkt != null)

  const hayComparacion = baseline.length > 0 && comparacion.length > 0

  // Line chart data: baseline over time
  const baselineData = baseline
    .filter((b) => b.fecha)
    .map((b) => ({
      fecha: b.fecha!,
      alcance: b.alcance ?? 0,
      likes: b.likes ?? 0,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const hasAnyData = metrics.length > 0 || baseline.length > 0

  if (!hasAnyData) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <BarChart3 className="size-10 text-muted-foreground/40" />
        <div>
          <p className="font-medium">No hay métricas todavía</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cargá métricas de tus posts de YourMKT o de posts anteriores para empezar a comparar el rendimiento.
          </p>
        </div>
        <div className="mt-2">
          <CargarMetricasDialog posts={posts} businessId={businessId} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards y acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [
              { key: 'alcance', label: 'Alcance total' },
              { key: 'likes', label: 'Likes totales' },
              { key: 'comentarios', label: 'Comentarios' },
              { key: 'guardados', label: 'Guardados' },
              { key: 'compartidos', label: 'Compartidos' },
            ] as const
          ).map(({ key, label }) => (
          <Card key={key}>
            <CardHeader className="pb-1">
              <CardDescription className="text-xs">{label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totals[key].toLocaleString('es-AR')}</p>
            </CardContent>
          </Card>
        ))}
        </div>
        <div className="shrink-0">
          <CargarMetricasDialog posts={posts} businessId={businessId} />
        </div>
      </div>

      {/* Comparación: anteriores vs YourMKT */}
      {hayComparacion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Promedio por post: anteriores vs YourMKT</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-muted-foreground/40" /> Anteriores
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-primary" /> YourMKT
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {comparacion.map((row) => (
              <div key={row.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{row.label}</span>
                  {row.lift != null && (
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        row.lift >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-destructive'
                      }`}
                    >
                      {row.lift >= 0 ? '+' : ''}
                      {row.lift}% vs anteriores
                    </span>
                  )}
                </div>
                <BarraComparacion label="Anteriores" value={row.anteriores} max={row.max} esYourmkt={false} />
                <BarraComparacion label="YourMKT" value={row.yourmkt} max={row.max} esYourmkt />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bar chart: Posts rendimiento (YourMKT) */}
      {topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rendimiento por post (YourMKT)</CardTitle>
            <CardDescription>Alcance y likes de los mejores posts</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-56 w-full">
              <BarChart data={topPosts}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    new Date(v + 'T00:00:00').toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="alcance" fill="var(--color-alcance)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="likes" fill="var(--color-likes)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compartidos" fill="var(--color-compartidos)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Line chart: Baseline */}
      {baselineData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolución histórica (anteriores)</CardTitle>
            <CardDescription>Métricas orgánicas de la cuenta a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-56 w-full">
              <LineChart data={baselineData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    new Date(v + 'T00:00:00').toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="alcance"
                  stroke="var(--color-alcance)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="var(--color-likes)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

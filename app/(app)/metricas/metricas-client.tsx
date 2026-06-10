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

interface Props {
  posts: Post[]
  metrics: Metric[]
  baseline: BaselineMetric[]
  campaigns: Campaign[]
}

const chartConfig = {
  alcance: { label: 'Alcance', color: 'var(--chart-1)' },
  likes: { label: 'Likes', color: 'var(--chart-2)' },
  comentarios: { label: 'Comentarios', color: 'var(--chart-3)' },
  guardados: { label: 'Guardados', color: 'var(--chart-4)' },
}

export function MetricasClient({ posts, metrics, baseline, campaigns }: Props) {
  const metricByPost = Object.fromEntries(metrics.map((m) => [m.post_id, m]))

  // Totals
  const totals = metrics.reduce(
    (acc, m) => ({
      alcance: acc.alcance + (m.alcance ?? 0),
      likes: acc.likes + (m.likes ?? 0),
      comentarios: acc.comentarios + (m.comentarios ?? 0),
      guardados: acc.guardados + (m.guardados ?? 0),
    }),
    { alcance: 0, likes: 0, comentarios: 0, guardados: 0 },
  )

  const postsWithMetrics = posts.filter((p) => metricByPost[p.id])

  // Bar chart data: top posts by alcance
  const topPosts = postsWithMetrics
    .map((p) => ({
      name: p.fecha,
      alcance: metricByPost[p.id]?.alcance ?? 0,
      likes: metricByPost[p.id]?.likes ?? 0,
    }))
    .sort((a, b) => b.alcance - a.alcance)
    .slice(0, 8)

  // Line chart data: baseline over time
  const baselineData = baseline
    .filter((b) => b.fecha)
    .map((b) => ({
      fecha: b.fecha!,
      alcance: b.alcance ?? 0,
      likes: b.likes ?? 0,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const hasAnyMetrics = metrics.length > 0

  if (!hasAnyMetrics) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <BarChart3 className="size-10 text-muted-foreground/40" />
        <div>
          <p className="font-medium">No hay métricas todavía</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Las métricas aparecerán aquí una vez que se carguen datos de rendimiento para tus posts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            { key: 'alcance', label: 'Alcance total' },
            { key: 'likes', label: 'Likes totales' },
            { key: 'comentarios', label: 'Comentarios' },
            { key: 'guardados', label: 'Guardados' },
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

      {/* Bar chart: Posts rendimiento */}
      {topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rendimiento por post</CardTitle>
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
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Line chart: Baseline */}
      {baselineData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolución histórica (baseline)</CardTitle>
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

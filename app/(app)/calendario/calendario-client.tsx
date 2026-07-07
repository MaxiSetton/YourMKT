'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Post, Campaign } from '@/lib/types'
import { FORMATO_LABEL, FORMATO_COLOR } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  posts: Post[]
  campaigns: Campaign[]
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Monday-based week: Mon=0 ... Sun=6
  const startDow = (firstDay.getDay() + 6) % 7
  const days: (Date | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  // Pad to full weeks
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function toLocalIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function CalendarioClient({ posts, campaigns }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const campaignMap = Object.fromEntries(campaigns.map((c) => [c.id, c]))
  const days = getMonthDays(year, month)

  const postsByDay = posts.reduce<Record<string, Post[]>>((acc, p) => {
    if (!acc[p.fecha]) acc[p.fecha] = []
    acc[p.fecha].push(p)
    return acc
  }, {})

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const todayIso = toLocalIso(today)

  return (
    <div>
      {/* Nav */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Mes anterior">
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-base font-semibold">
          {MONTHS[month]} {year}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Mes siguiente">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px rounded-xl border border-border bg-border overflow-hidden">
        {/* Header */}
        {DAYS.map((d) => (
          <div
            key={d}
            className="bg-muted py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {/* Cells */}
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="bg-background min-h-[80px]" />
          }
          const iso = toLocalIso(date)
          const dayPosts = postsByDay[iso] ?? []
          const isToday = iso === todayIso
          const isPast = iso < todayIso

          return (
            <div
              key={iso}
              className={cn(
                'bg-background min-h-[80px] p-1.5 flex flex-col gap-1',
                isPast && 'bg-muted/30',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-6 items-center justify-center rounded-full text-xs font-medium self-end',
                  isToday && 'bg-primary text-primary-foreground',
                  !isToday && 'text-muted-foreground',
                )}
              >
                {date.getDate()}
              </span>
              {dayPosts.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/campanas/${p.campaign_id}`}>
                  <div
                    className={cn(
                      'rounded px-1 py-0.5 text-[10px] leading-tight truncate cursor-pointer',
                      p.formato ? FORMATO_COLOR[p.formato] : 'bg-muted text-muted-foreground',
                      'border',
                    )}
                    title={p.texto ?? campaignMap[p.campaign_id]?.nombre ?? ''}
                  >
                    {p.formato ? FORMATO_LABEL[p.formato] : ''}
                    {p.texto ? ` · ${p.texto.slice(0, 20)}` : ` · ${campaignMap[p.campaign_id]?.nombre ?? ''}`}
                  </div>
                </Link>
              ))}
              {dayPosts.length > 3 && (
                <span className="text-[10px] text-muted-foreground pl-0.5">
                  +{dayPosts.length - 3} más
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <CalendarDays className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No hay posts programados aún. Creá posts en tus campañas para verlos acá.
          </p>
        </div>
      )}
    </div>
  )
}

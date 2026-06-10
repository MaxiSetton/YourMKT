'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Building2,
  Megaphone,
  LayoutGrid,
  CalendarDays,
  Sun,
  BarChart3,
} from 'lucide-react'

const NAV = [
  { href: '/negocio', label: 'Mi Negocio', icon: Building2 },
  { href: '/campanas', label: 'Campañas', icon: Megaphone },
  { href: '/borradores', label: 'Borradores', icon: LayoutGrid },
  { href: '/calendario', label: 'Calendario', icon: CalendarDays },
  { href: '/hoy', label: 'Hoy', icon: Sun },
  { href: '/metricas', label: 'Métricas', icon: BarChart3 },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

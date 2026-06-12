'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Palette,
  Rocket,
  CalendarDays,
  BarChart3,
  Settings,
} from 'lucide-react'

export const NAV = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/negocio', label: 'Mi Marca', icon: Palette },
  { href: '/campanas', label: 'Campañas', icon: Rocket },
  { href: '/calendario', label: 'Calendario', icon: CalendarDays },
  { href: '/metricas', label: 'Métricas', icon: BarChart3 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-primary font-medium text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

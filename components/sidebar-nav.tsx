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
              'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-white/[0.07] font-medium text-white'
                : 'text-sidebar-foreground/65 hover:bg-white/[0.04] hover:text-white',
            )}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary shadow-[0_0_8px_var(--sidebar-primary)]"
                aria-hidden="true"
              />
            )}
            <Icon
              className={cn(
                'size-[18px] shrink-0',
                active && 'text-sidebar-primary',
              )}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

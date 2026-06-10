'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  Menu,
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

export function MobileNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="size-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <div className="flex items-center gap-2 px-6 py-5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-mono text-base font-bold">Y</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">YourMKT</span>
          </div>
          <nav className="flex flex-col gap-1 px-3">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground/70 hover:bg-accent/60',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <p className="mt-6 truncate px-6 text-xs text-muted-foreground">
            {email}
          </p>
        </SheetContent>
      </Sheet>
    </div>
  )
}

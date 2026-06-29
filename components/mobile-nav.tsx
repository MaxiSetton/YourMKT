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
import { Menu } from 'lucide-react'
import { NAV } from '@/components/sidebar-nav'

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
        <SheetContent
          side="left"
          className="w-64 border-sidebar-border bg-sidebar bg-[linear-gradient(180deg,#1F1242_0%,#160A2C_100%)] p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <div className="flex items-center gap-2 px-6 py-5">
            <span className="inline-flex items-center justify-center rounded-lg bg-white p-1 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" className="h-5 w-auto" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight text-white">
              YourMKT
            </span>
            <span
              className="mt-2 size-1.5 rounded-[2px] bg-spark shadow-[0_0_8px_var(--spark)]"
              aria-hidden="true"
            />
          </div>
          <nav className="flex flex-col gap-0.5 px-3">
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
                    className={cn('size-[18px] shrink-0', active && 'text-sidebar-primary')}
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <p className="mt-6 truncate px-6 text-xs text-sidebar-foreground/55">
            {email}
          </p>
        </SheetContent>
      </Sheet>
    </div>
  )
}

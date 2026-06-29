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
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <div className="flex items-center gap-2 px-6 py-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-7 w-auto" />
            <span className="font-heading text-lg font-semibold tracking-tight">
              YourMKT
            </span>
            <span
              className="mt-2 size-1.5 rounded-[2px] bg-spark"
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
          <p className="mt-6 truncate px-6 text-xs text-muted-foreground">
            {email}
          </p>
        </SheetContent>
      </Sheet>
    </div>
  )
}

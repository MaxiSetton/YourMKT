import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBusiness } from '@/lib/queries'
import { SidebarNav } from '@/components/sidebar-nav'
import { UserMenu } from '@/components/user-menu'
import { MobileNav } from '@/components/mobile-nav'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const business = await getBusiness()
  const marca = business?.nombre ?? 'Tu marca'
  const inicial = (business?.nombre ?? 'Y').charAt(0).toUpperCase()

  return (
    <div className="flex min-h-svh bg-background">
      {/* Sidebar - desktop: el rail "torre de control" — violeta oscuro, glow naranja, grilla técnica */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar bg-[linear-gradient(180deg,#1F1242_0%,#160A2C_100%)] py-5 text-sidebar-foreground md:flex">
        {/* glow naranja detrás del logo */}
        <div
          className="pointer-events-none absolute -left-10 -top-16 size-44 rounded-full bg-spark/25 blur-3xl"
          aria-hidden="true"
        />
        {/* grilla técnica sutil */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:18px_18px]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center gap-2 px-6 pb-7 pt-1">
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

        <div className="relative z-10">
          <SidebarNav />
        </div>

        <div className="relative z-10 mt-auto px-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-white/[0.04] p-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#A06BF6] font-heading text-sm font-semibold text-white">
              {inicial}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-medium text-white">{marca}</p>
              <p className="text-[11px] text-sidebar-foreground/55">Empresa activa</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <MobileNav email={user.email ?? ''} />
          <div className="hidden md:block" />
          <UserMenu email={user.email ?? ''} />
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}

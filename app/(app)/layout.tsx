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
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar py-5 md:flex">
        <div className="flex items-center gap-1 px-6 pb-7 pt-1">
          <span className="font-heading text-lg font-semibold tracking-tight">
            YourMKT
          </span>
          <span
            className="mt-2 size-1.5 rounded-[2px] bg-spark"
            aria-hidden="true"
          />
        </div>

        <SidebarNav />

        <div className="mt-auto px-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border p-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary font-heading text-sm font-semibold text-primary">
              {inicial}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-medium">{marca}</p>
              <p className="text-[11px] text-muted-foreground">Empresa activa</p>
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

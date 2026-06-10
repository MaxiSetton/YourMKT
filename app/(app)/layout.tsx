import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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

  return (
    <div className="flex min-h-svh bg-background">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar py-5 md:flex">
        <div className="flex items-center gap-2 px-6 pb-6">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-mono text-base font-bold">Y</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">YourMKT</span>
        </div>
        <SidebarNav />
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

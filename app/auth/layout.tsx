import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-8 bg-background p-6 md:p-10">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-9 w-auto" />
        <span className="text-xl font-semibold tracking-tight">YourMKT</span>
      </div>
      {children}
    </div>
  )
}

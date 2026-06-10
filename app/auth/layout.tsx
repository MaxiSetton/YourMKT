import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-8 bg-background p-6 md:p-10">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="font-mono text-lg font-bold">Y</span>
        </div>
        <span className="text-xl font-semibold tracking-tight">YourMKT</span>
      </div>
      {children}
    </div>
  )
}

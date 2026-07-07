import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center gap-8 overflow-hidden bg-[linear-gradient(160deg,#1F1242_0%,#140A2B_100%)] p-6 md:p-10">
      {/* glow naranja + grilla técnica — misma firma que el rail */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-spark/20 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]"
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-7 w-auto" />
        </span>
        <span className="text-xl font-semibold tracking-tight text-white">YourMKT</span>
        <span
          className="mt-1.5 size-1.5 rounded-[2px] bg-spark shadow-[0_0_8px_var(--spark)]"
          aria-hidden="true"
        />
      </div>
      <div className="relative z-10 flex w-full flex-col items-center">{children}</div>
    </div>
  )
}

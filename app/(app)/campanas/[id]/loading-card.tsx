'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'

interface Props {
  dia: number
  // Qué se está haciendo, ej: "Regenerando la pieza".
  title: string
}

// Pantalla de carga que reemplaza a la card mientras se (re)genera. Se puede "salir": se minimiza a un
// chip y sigue en segundo plano (n8n avisa por mail al terminar). Cuando termina, la card muestra lo nuevo.
export function LoadingCard({ dia, title }: Props) {
  const [minimized, setMinimized] = useState(false)

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed bg-card px-4 py-2.5 text-left text-xs text-muted-foreground ring-1 ring-foreground/5 transition-colors hover:bg-muted/40"
      >
        <Loader2 className="size-3.5 shrink-0 animate-spin" />
        <span>
          Día {dia} · {title.toLowerCase()} en segundo plano…
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground/70">ver</span>
      </button>
    )
  }

  return (
    <div className="relative flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-6 py-12 text-center ring-1 ring-foreground/5">
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-2 text-muted-foreground"
        onClick={() => setMinimized(true)}
        aria-label="Salir"
      >
        <X className="size-4" />
      </Button>
      <span className="inline-flex h-6 items-center rounded-full bg-primary/10 px-2.5 text-xs font-semibold text-primary">
        Día {dia}
      </span>
      <Loader2 className="size-7 animate-spin text-primary" />
      <div>
        <p className="font-medium text-primary">{title}…</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-primary/80">
          Te avisamos por mail cuando esté listo. Podés salir y seguir trabajando.
        </p>
      </div>
    </div>
  )
}

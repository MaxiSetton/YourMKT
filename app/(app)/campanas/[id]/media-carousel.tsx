'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  slides: string[]
  /** Relación de aspecto del marco (Tailwind). 4/5 para feed, 9/16 para vertical. */
  aspect?: string
}

// Carrusel de slides con swipe nativo + flechas, puntos y contador que SÍ siguen al slide actual.
// (El bug anterior venía de slides con ancho automático: scrollLeft/clientWidth no daba el índice.)
export function MediaCarousel({ slides, aspect = 'aspect-[4/5]' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  if (slides.length === 0) return null

  const go = (i: number) => {
    const el = trackRef.current
    if (!el) return
    const idx = Math.max(0, Math.min(slides.length - 1, i))
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
  }

  const multiple = slides.length > 1

  return (
    <div className="group/carousel relative overflow-hidden rounded-lg bg-muted">
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget
          setCurrent(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
      >
        {slides.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            draggable={false}
            className={`${aspect} w-full shrink-0 snap-center object-cover`}
          />
        ))}
      </div>

      {multiple && (
        <>
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={() => go(current - 1)}
            disabled={current === 0}
            className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition hover:bg-background disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Slide siguiente"
            onClick={() => go(current + 1)}
            disabled={current === slides.length - 1}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition hover:bg-background disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronRight className="size-4" />
          </button>

          <div className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white">
            {current + 1}/{slides.length}
          </div>

          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

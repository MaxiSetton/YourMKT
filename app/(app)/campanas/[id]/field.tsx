// Campo etiquetado reutilizable para mostrar partes de la idea (ángulo, CTA, idea visual, …).
export function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed">{children}</p>
    </div>
  )
}

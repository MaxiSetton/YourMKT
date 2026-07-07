'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Props {
  trigger: React.ReactNode
  title: string
  description: string
  confirmLabel: string
  placeholder?: string
  onConfirm: (observaciones: string) => Promise<void>
}

// Dialog con observaciones OPCIONALES, para regenerar idea o pieza.
export function RegenDialog({ trigger, title, description, confirmLabel, placeholder, onConfirm }: Props) {
  const [open, setOpen] = useState(false)
  const [obs, setObs] = useState('')
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    setBusy(true)
    try {
      await onConfirm(obs.trim())
      setOpen(false)
      setObs('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-1">
          <Label htmlFor="regen-obs">Observaciones (opcional)</Label>
          <Textarea
            id="regen-obs"
            rows={3}
            placeholder={placeholder ?? 'Qué querés cambiar. Dejalo vacío para que lo replantee libremente.'}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button type="button" onClick={handle} disabled={busy}>
            {busy ? 'Enviando…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

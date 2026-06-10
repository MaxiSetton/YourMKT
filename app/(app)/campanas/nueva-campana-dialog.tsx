'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  businessId: string
  children: React.ReactNode
}

export function NuevaCampanaDialog({ businessId, children }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [brief, setBrief] = useState('')
  const [quePromociona, setQuePromociona] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          business_id: businessId,
          nombre,
          brief,
          que_promociona: quePromociona,
          estado: 'borrador',
        })
        .select()
        .single()
      if (error) throw error
      toast.success('Campaña creada.')
      setOpen(false)
      router.push(`/campanas/${data.id}`)
      router.refresh()
    } catch {
      toast.error('No se pudo crear la campaña.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva campaña</DialogTitle>
          <DialogDescription>
            Completá los datos básicos para crear tu nueva campaña.
          </DialogDescription>
        </DialogHeader>
        <form id="nueva-campana" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="campana-nombre">Nombre</Label>
            <Input
              id="campana-nombre"
              placeholder="Ej: Lanzamiento verano 2025"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campana-que">¿Qué promocionás?</Label>
            <Input
              id="campana-que"
              placeholder="Ej: Colección nueva, descuento especial..."
              value={quePromociona}
              onChange={(e) => setQuePromociona(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campana-brief">Brief / Contexto</Label>
            <Textarea
              id="campana-brief"
              placeholder="Describí el objetivo, público y mensaje clave de la campaña."
              rows={3}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} type="button">
            Cancelar
          </Button>
          <Button form="nueva-campana" type="submit" disabled={isLoading}>
            {isLoading ? 'Creando...' : 'Crear campaña'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

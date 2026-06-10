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
  const [quePromociona, setQuePromociona] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [duracionDias, setDuracionDias] = useState('7')
  const [elementos, setElementos] = useState('')
  const [brief, setBrief] = useState('')
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
          que_promociona: quePromociona || null,
          objetivo: objetivo || null,
          fecha_inicio: fechaInicio || null,
          duracion_dias: duracionDias ? Number(duracionDias) : null,
          elementos_especificos: elementos || null,
          brief: brief || null,
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva campaña</DialogTitle>
          <DialogDescription>
            Completá los datos para que la IA arme el calendario de posts.
          </DialogDescription>
        </DialogHeader>
        <form id="nueva-campana" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="campana-nombre">Nombre *</Label>
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
            <Label htmlFor="campana-objetivo">Objetivo</Label>
            <Input
              id="campana-objetivo"
              placeholder="Ej: Aumentar ventas del producto X, dar a conocer la marca..."
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="campana-fecha">Fecha de inicio</Label>
              <Input
                id="campana-fecha"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="campana-duracion">Duración (días)</Label>
              <Input
                id="campana-duracion"
                type="number"
                min={1}
                max={60}
                value={duracionDias}
                onChange={(e) => setDuracionDias(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campana-elementos">Pedidos específicos</Label>
            <Textarea
              id="campana-elementos"
              placeholder="Cosas concretas que querés que aparezcan. Ej: '2x1 en café Patagonia', 'mencionar envío gratis', 'destacar el proceso de tostado'."
              rows={3}
              value={elementos}
              onChange={(e) => setElementos(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campana-brief">Brief / Contexto (opcional)</Label>
            <Textarea
              id="campana-brief"
              placeholder="Cualquier contexto extra para la campaña."
              rows={2}
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

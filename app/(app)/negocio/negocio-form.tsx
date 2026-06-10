'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Business } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'

const TONOS = [
  { value: 'profesional', label: 'Profesional' },
  { value: 'cercano', label: 'Cercano y amigable' },
  { value: 'humoristico', label: 'Humorístico' },
  { value: 'inspiracional', label: 'Inspiracional' },
  { value: 'informativo', label: 'Informativo' },
  { value: 'premium', label: 'Premium / Exclusivo' },
]

interface Props {
  business: Business | null
  userId: string
}

export function NegocioForm({ business, userId }: Props) {
  const router = useRouter()
  const [nombre, setNombre] = useState(business?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(business?.descripcion ?? '')
  const [tono, setTono] = useState(business?.tono_marca ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (business?.id) {
        const { error } = await supabase
          .from('businesses')
          .update({ nombre, descripcion, tono_marca: tono })
          .eq('id', business.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('businesses').insert({
          user_id: userId,
          nombre,
          descripcion,
          tono_marca: tono,
        })
        if (error) throw error
      }
      toast.success('Negocio guardado correctamente.')
      router.refresh()
    } catch {
      toast.error('Ocurrió un error al guardar el negocio.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Datos del negocio</CardTitle>
        <CardDescription>
          Esta información se usa como contexto para generar contenido con IA.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre del negocio</Label>
            <Input
              id="nombre"
              placeholder="Ej: Café del Centro"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describí brevemente a qué se dedica tu negocio, quiénes son tus clientes y qué te diferencia."
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tono">Tono de marca</Label>
            <Select value={tono} onValueChange={setTono}>
              <SelectTrigger id="tono">
                <SelectValue placeholder="Seleccioná un tono" />
              </SelectTrigger>
              <SelectContent>
                {TONOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

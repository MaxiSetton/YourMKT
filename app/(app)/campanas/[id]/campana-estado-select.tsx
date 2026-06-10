'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Campaign } from '@/lib/types'

interface Props {
  campaignId: string
  currentEstado: Campaign['estado']
}

export function CampanaEstadoSelect({ campaignId, currentEstado }: Props) {
  const router = useRouter()
  const [estado, setEstado] = useState<Campaign['estado']>(currentEstado)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = async (value: Campaign['estado']) => {
    setEstado(value)
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('campaigns')
      .update({ estado: value })
      .eq('id', campaignId)
    if (error) {
      toast.error('No se pudo cambiar el estado.')
      setEstado(currentEstado)
    } else {
      toast.success('Estado actualizado.')
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Select value={estado} onValueChange={handleChange} disabled={isLoading}>
      <SelectTrigger className="h-8 w-[130px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="borrador">Borrador</SelectItem>
        <SelectItem value="activa">Activa</SelectItem>
        <SelectItem value="finalizada">Finalizada</SelectItem>
      </SelectContent>
    </Select>
  )
}

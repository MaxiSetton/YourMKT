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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { PostFormato } from '@/lib/types'

interface Props {
  campaignId: string
  children: React.ReactNode
}

export function NuevoPostDialog({ campaignId, children }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [formato, setFormato] = useState<PostFormato | ''>('')
  const [texto, setTexto] = useState('')
  const [tieneAudioCopyright, setTieneAudioCopyright] = useState(false)
  const [nombreCancion, setNombreCancion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from('posts').insert({
        campaign_id: campaignId,
        fecha,
        hora: hora || null,
        formato: formato || null,
        texto: texto || null,
        estado: 'borrador',
        version: 1,
        tiene_audio_copyright: tieneAudioCopyright,
        nombre_cancion_copyright: tieneAudioCopyright ? nombreCancion : null,
      })
      if (error) throw error
      toast.success('Post creado.')
      setOpen(false)
      setFecha('')
      setHora('')
      setFormato('')
      setTexto('')
      setTieneAudioCopyright(false)
      setNombreCancion('')
      router.refresh()
    } catch {
      toast.error('No se pudo crear el post.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo post</DialogTitle>
          <DialogDescription>
            Completá los datos del post que querés agregar a la campaña.
          </DialogDescription>
        </DialogHeader>
        <form id="nuevo-post" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="post-fecha">Fecha</Label>
              <Input
                id="post-fecha"
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="post-hora">Hora (opcional)</Label>
              <Input
                id="post-hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="post-formato">Formato</Label>
            <Select value={formato} onValueChange={(v) => setFormato(v as PostFormato)}>
              <SelectTrigger id="post-formato">
                <SelectValue placeholder="Seleccioná el formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="reel">Reel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="post-texto">Texto del post</Label>
            <Textarea
              id="post-texto"
              placeholder="Escribí el copy del post o dejalo vacío para completar después."
              rows={4}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 rounded-md border p-3">
            <Checkbox
              id="post-audio-copyright"
              checked={tieneAudioCopyright}
              onCheckedChange={(c) => setTieneAudioCopyright(c === true)}
            />
            <Label htmlFor="post-audio-copyright" className="text-sm font-medium leading-none cursor-pointer">
              El audio tiene derechos de autor
            </Label>
          </div>

          {tieneAudioCopyright && (
            <div className="grid gap-2 animate-in fade-in zoom-in-95">
              <Label htmlFor="post-nombre-cancion">Nombre de la canción original</Label>
              <Input
                id="post-nombre-cancion"
                placeholder="Ej. Bruno Mars - Uptown Funk"
                required
                value={nombreCancion}
                onChange={(e) => setNombreCancion(e.target.value)}
              />
            </div>
          )}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} type="button">
            Cancelar
          </Button>
          <Button form="nuevo-post" type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Crear post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

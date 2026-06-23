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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Post } from '@/lib/types'
import { Plus } from 'lucide-react'

interface Props {
  posts: Post[]
}

export function CargarMetricasDialog({ posts }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [postId, setPostId] = useState('')
  const [alcance, setAlcance] = useState('')
  const [likes, setLikes] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [guardados, setGuardados] = useState('')
  const [compartidos, setCompartidos] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Solo mostrar posts publicados
  const publishedPosts = posts.filter((p) => p.estado === 'publicado')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postId) {
      toast.error('Seleccioná un post')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Verificar si ya existen métricas para este post
      const { data: existing } = await supabase
        .from('metrics')
        .select('id')
        .eq('post_id', postId)
        .maybeSingle()

      const payload = {
        post_id: postId,
        alcance: alcance ? parseInt(alcance, 10) : null,
        likes: likes ? parseInt(likes, 10) : null,
        comentarios: comentarios ? parseInt(comentarios, 10) : null,
        guardados: guardados ? parseInt(guardados, 10) : null,
        compartidos: compartidos ? parseInt(compartidos, 10) : null,
      }

      if (existing) {
        const { error } = await supabase
          .from('metrics')
          .update(payload)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('metrics').insert(payload)
        if (error) throw error
      }

      toast.success('Métricas guardadas correctamente.')
      setOpen(false)
      setPostId('')
      setAlcance('')
      setLikes('')
      setComentarios('')
      setGuardados('')
      setCompartidos('')
      router.refresh()
    } catch {
      toast.error('No se pudieron guardar las métricas.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Cargar métricas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cargar métricas</DialogTitle>
          <DialogDescription>
            Seleccioná un post publicado y cargá sus métricas. Los campos vacíos no sobreescribirán datos si no se completan (quedarán en nulo).
          </DialogDescription>
        </DialogHeader>
        <form id="cargar-metricas" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="post-select">Post publicado</Label>
            <Select value={postId} onValueChange={setPostId}>
              <SelectTrigger id="post-select">
                <SelectValue placeholder="Seleccioná el post" />
              </SelectTrigger>
              <SelectContent>
                {publishedPosts.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No hay posts publicados
                  </SelectItem>
                ) : (
                  publishedPosts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.fecha} - {p.texto ? p.texto.slice(0, 30) + '...' : 'Sin texto'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="metric-alcance">Alcance</Label>
              <Input
                id="metric-alcance"
                type="number"
                min="0"
                value={alcance}
                onChange={(e) => setAlcance(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metric-likes">Likes</Label>
              <Input
                id="metric-likes"
                type="number"
                min="0"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metric-comentarios">Comentarios</Label>
              <Input
                id="metric-comentarios"
                type="number"
                min="0"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metric-guardados">Guardados</Label>
              <Input
                id="metric-guardados"
                type="number"
                min="0"
                value={guardados}
                onChange={(e) => setGuardados(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metric-compartidos">Compartidos</Label>
              <Input
                id="metric-compartidos"
                type="number"
                min="0"
                value={compartidos}
                onChange={(e) => setCompartidos(e.target.value)}
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} type="button">
            Cancelar
          </Button>
          <Button form="cargar-metricas" type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar métricas'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

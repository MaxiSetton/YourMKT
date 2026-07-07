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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Post } from '@/lib/types'
import { Plus } from 'lucide-react'

interface Props {
  posts: Post[]
  businessId: string | null
}

type Modo = 'yourmkt' | 'anterior'

const camposVacios = {
  alcance: '',
  likes: '',
  comentarios: '',
  guardados: '',
  compartidos: '',
}

export function CargarMetricasDialog({ posts, businessId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [modo, setModo] = useState<Modo>('yourmkt')
  const [postId, setPostId] = useState('')
  const [etiqueta, setEtiqueta] = useState('')
  const [fecha, setFecha] = useState('')
  const [metricas, setMetricas] = useState(camposVacios)
  const [isLoading, setIsLoading] = useState(false)

  // Solo mostrar posts publicados
  const publishedPosts = posts.filter((p) => p.estado === 'publicado')

  const num = (v: string) => (v ? parseInt(v, 10) : null)
  const setMetrica = (key: keyof typeof camposVacios, value: string) =>
    setMetricas((m) => ({ ...m, [key]: value }))

  const reset = () => {
    setPostId('')
    setEtiqueta('')
    setFecha('')
    setMetricas(camposVacios)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const metricasPayload = {
      alcance: num(metricas.alcance),
      likes: num(metricas.likes),
      comentarios: num(metricas.comentarios),
      guardados: num(metricas.guardados),
      compartidos: num(metricas.compartidos),
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      if (modo === 'yourmkt') {
        if (!postId) {
          toast.error('Seleccioná un post')
          return
        }
        // Verificar si ya existen métricas para este post
        const { data: existing } = await supabase
          .from('metrics')
          .select('id')
          .eq('post_id', postId)
          .maybeSingle()

        if (existing) {
          const { error } = await supabase
            .from('metrics')
            .update(metricasPayload)
            .eq('id', existing.id)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('metrics')
            .insert({ post_id: postId, ...metricasPayload })
          if (error) throw error
        }
      } else {
        if (!businessId) {
          toast.error('No se encontró el negocio')
          return
        }
        if (!etiqueta.trim()) {
          toast.error('Poné una descripción para identificar el post')
          return
        }
        const { error } = await supabase.from('baseline_metrics').insert({
          business_id: businessId,
          etiqueta: etiqueta.trim(),
          fecha: fecha || null,
          ...metricasPayload,
        })
        if (error) throw error
      }

      toast.success('Métricas guardadas correctamente.')
      setOpen(false)
      reset()
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
            Cargá las métricas de un post de YourMKT o de un post anterior (orgánico) para comparar el rendimiento. Los campos vacíos quedan en nulo.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={modo} onValueChange={(v) => setModo(v as Modo)}>
          <TabsList className="w-full">
            <TabsTrigger value="yourmkt">Post de YourMKT</TabsTrigger>
            <TabsTrigger value="anterior">Post anterior</TabsTrigger>
          </TabsList>

          <form id="cargar-metricas" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <TabsContent value="yourmkt" className="m-0">
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
            </TabsContent>

            <TabsContent value="anterior" className="m-0">
              <div className="flex flex-col gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="baseline-etiqueta">Descripción del post</Label>
                  <Input
                    id="baseline-etiqueta"
                    placeholder="Ej: Promo verano (orgánico)"
                    value={etiqueta}
                    onChange={(e) => setEtiqueta(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="baseline-fecha">Fecha de publicación</Label>
                  <Input
                    id="baseline-fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="metric-alcance">Alcance</Label>
                <Input
                  id="metric-alcance"
                  type="number"
                  min="0"
                  value={metricas.alcance}
                  onChange={(e) => setMetrica('alcance', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric-likes">Likes</Label>
                <Input
                  id="metric-likes"
                  type="number"
                  min="0"
                  value={metricas.likes}
                  onChange={(e) => setMetrica('likes', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric-comentarios">Comentarios</Label>
                <Input
                  id="metric-comentarios"
                  type="number"
                  min="0"
                  value={metricas.comentarios}
                  onChange={(e) => setMetrica('comentarios', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric-guardados">Guardados</Label>
                <Input
                  id="metric-guardados"
                  type="number"
                  min="0"
                  value={metricas.guardados}
                  onChange={(e) => setMetrica('guardados', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric-compartidos">Compartidos</Label>
                <Input
                  id="metric-compartidos"
                  type="number"
                  min="0"
                  value={metricas.compartidos}
                  onChange={(e) => setMetrica('compartidos', e.target.value)}
                />
              </div>
            </div>
          </form>
        </Tabs>

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

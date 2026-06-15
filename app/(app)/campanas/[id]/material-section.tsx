'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { CampaignAsset, AssetCategoria } from '@/lib/types'
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
import { Badge } from '@/components/ui/badge'
import { ImageIcon, Video, Upload, Trash2, ExternalLink } from 'lucide-react'

const BUCKET = 'post-media'

const CATEGORIA_LABEL: Record<AssetCategoria, string> = {
  producto: 'Producto',
  proceso: 'Proceso',
  otro: 'Otro',
}

interface Props {
  campaignId: string
  userId: string
  initialAssets: CampaignAsset[]
}

export function MaterialSection({ campaignId, userId, initialAssets }: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [categoria, setCategoria] = useState<AssetCategoria>('producto')
  const [descripcion, setDescripcion] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9.\-_]/g, '_')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Elegí un archivo.')
      return
    }
    if (!descripcion.trim()) {
      toast.error('La descripción es obligatoria.')
      return
    }
    const tipo = file.type.startsWith('video') ? 'video' : 'imagen'
    setIsUploading(true)
    const supabase = createClient()

    try {
      const path = `${userId}/${campaignId}/${Date.now()}-${sanitize(file.name)}`
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false })
      if (upErr) throw upErr

      const { error: dbErr } = await supabase.from('campaign_assets').insert({
        campaign_id: campaignId,
        tipo,
        categoria,
        url: path,
        nombre_archivo: file.name,
        descripcion: descripcion.trim(),
      })
      if (dbErr) throw dbErr

      toast.success('Material agregado.')
      setFile(null)
      setFileKey((k) => k + 1)
      setDescripcion('')
      setCategoria('producto')
      router.refresh()
    } catch {
      toast.error('No se pudo subir el material.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleView = async (asset: CampaignAsset) => {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(asset.url, 3600)
    if (error || !data) {
      toast.error('No se pudo abrir el archivo.')
      return
    }
    window.open(data.signedUrl, '_blank')
  }

  const handleDelete = async (asset: CampaignAsset) => {
    const supabase = createClient()
    try {
      await supabase.storage.from(BUCKET).remove([asset.url])
      const { error } = await supabase
        .from('campaign_assets')
        .delete()
        .eq('id', asset.id)
      if (error) throw error
      toast.success('Material eliminado.')
      router.refresh()
    } catch {
      toast.error('No se pudo eliminar.')
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Material de la campaña</CardTitle>
        <CardDescription>
          Subí poco y lo justo: 📸 1-2 fotos lindas de tu producto estrella (buena luz) y 🎥 un video
          corto del local o el ambiente. La descripción de qué se ve es obligatoria.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {initialAssets.length > 0 && (
          <div className="flex flex-col gap-2">
            {initialAssets.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-md border p-3">
                <div className="mt-0.5 text-muted-foreground">
                  {a.tipo === 'video' ? (
                    <Video className="size-4" />
                  ) : (
                    <ImageIcon className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {a.nombre_archivo ?? 'Archivo'}
                    </span>
                    {a.categoria && (
                      <Badge variant="outline" className="text-xs">
                        {CATEGORIA_LABEL[a.categoria]}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.descripcion}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleView(a)}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => handleDelete(a)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleUpload}
          className="flex flex-col gap-4 rounded-md border border-dashed p-4"
        >
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            No hace falta que filmes el producto en movimiento — esos clips los generamos con IA.
            Sumá fotos lindas del producto y un video del ambiente.
          </p>
          <div className="grid gap-2">
            <Label htmlFor="asset-file">Archivo (imagen o video)</Label>
            <Input
              key={fileKey}
              id="asset-file"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="asset-categoria">Categoría</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as AssetCategoria)}>
              <SelectTrigger id="asset-categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="producto">Producto</SelectItem>
                <SelectItem value="proceso">Proceso</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="asset-desc">Descripción *</Label>
            <Textarea
              id="asset-desc"
              placeholder="¿Qué se ve en la foto/video? Ej: 'Taza de café con latte art sobre mesa de madera'."
              rows={2}
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" className="gap-2" disabled={isUploading}>
              <Upload className="size-4" />
              {isUploading ? 'Subiendo...' : 'Subir material'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

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
import { ImageIcon, Video, Upload, Trash2, ExternalLink, Sparkles, Camera, GripVertical } from 'lucide-react'

const BUCKET = 'post-media'

const CATEGORIA_LABEL: Record<AssetCategoria, string> = {
  producto: 'Producto',
  proceso: 'Proceso',
  otro: 'Otro',
}

const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
// El pedido se guarda con un prefijo interno; al cliente le mostramos el texto limpio.
const limpiarPedido = (d: string) => d.replace(/^\[A pedir al cliente\]\s*/i, '')

interface Props {
  campaignId: string
  userId: string
  initialAssets: CampaignAsset[]
}

export function MaterialSection({ campaignId, userId, initialAssets }: Props) {
  const cargados = initialAssets.filter((a) => a.url)
  const pedidos = initialAssets.filter((a) => !a.url && a.origen === 'a_pedir')
  const aGenerar = initialAssets.filter((a) => !a.url && a.origen === 'a_generar')

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Material de la campaña</CardTitle>
        <CardDescription>
          Subí poco y lo justo. Lo que la IA no puede hacer (tus manos, tu cara, tu local real) te lo
          pedimos abajo — eso es lo que da confianza. La descripción de qué se ve es obligatoria.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* 1) Lo que te pedimos — pendiente, con upload propio para cumplir cada pedido */}
        {pedidos.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Camera className="size-4 text-amber-600" />
              <h3 className="text-sm font-medium">Te pedimos esto</h3>
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-xs text-amber-700">
                {pedidos.length} pendiente{pedidos.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Clips cortos del celu (~10s) o fotos reales. Subí el archivo en el pedido que corresponda.
            </p>
            <div className="flex flex-col gap-2">
              {pedidos.map((a) => (
                <PedidoItem key={a.id} asset={a} campaignId={campaignId} userId={userId} />
              ))}
            </div>
          </section>
        )}

        {/* 2) Lo que genera la IA — informativo */}
        {aGenerar.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Lo genera la IA</h3>
            </div>
            <div className="flex flex-col gap-2">
              {aGenerar.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  <Sparkles className="mt-0.5 size-4 shrink-0" />
                  <span>{a.descripcion}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3) Material ya cargado */}
        {cargados.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Material cargado</h3>
            <p className="text-xs text-muted-foreground">
              Arrastrá un archivo a un post para usarlo ahí.
            </p>
            <div className="flex flex-col gap-2">
              {cargados.map((a) => (
                <CargadoItem key={a.id} asset={a} />
              ))}
            </div>
          </section>
        )}

        {/* 4) Sumar material extra (no pedido) */}
        <NuevoMaterialForm campaignId={campaignId} userId={userId} />
      </CardContent>
    </Card>
  )
}

// --- Un pedido pendiente: descripción + upload que CUMPLE el pedido (rellena ese slot) ---
function PedidoItem({ asset, campaignId, userId }: { asset: CampaignAsset; campaignId: string; userId: string }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const cumplir = async () => {
    if (!file) {
      toast.error('Elegí un archivo para este pedido.')
      return
    }
    const tipo = file.type.startsWith('video') ? 'video' : 'imagen'
    setIsUploading(true)
    const supabase = createClient()
    try {
      const path = `${userId}/${campaignId}/${Date.now()}-${sanitize(file.name)}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
      if (upErr) throw upErr
      // Rellenamos el MISMO slot del pedido en vez de crear otro asset suelto.
      const { error: dbErr } = await supabase
        .from('campaign_assets')
        .update({ url: path, nombre_archivo: file.name, tipo, origen: 'real' })
        .eq('id', asset.id)
      if (dbErr) throw dbErr
      toast.success('¡Listo! Material cargado.')
      setFile(null)
      setFileKey((k) => k + 1)
      router.refresh()
    } catch {
      toast.error('No se pudo subir el archivo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-amber-600">
          {asset.tipo === 'video' ? <Video className="size-4" /> : <ImageIcon className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {asset.tipo === 'video' ? 'Clip corto' : 'Foto'}
            </span>
            {asset.categoria && (
              <Badge variant="outline" className="text-xs">
                {CATEGORIA_LABEL[asset.categoria]}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{limpiarPedido(asset.descripcion)}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          key={fileKey}
          type="file"
          accept="image/*,video/*"
          className="text-xs"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button type="button" size="sm" className="shrink-0 gap-2" disabled={isUploading} onClick={cumplir}>
          <Upload className="size-4" />
          {isUploading ? 'Subiendo...' : 'Subir esto'}
        </Button>
      </div>
    </div>
  )
}

// --- Un asset ya cargado: arrastrable, ver, y quitar (deja el hueco como faltante) ---
function CargadoItem({ asset }: { asset: CampaignAsset }) {
  const router = useRouter()

  const handleView = async () => {
    if (!asset.url) return
    const supabase = createClient()
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(asset.url, 3600)
    if (error || !data) {
      toast.error('No se pudo abrir el archivo.')
      return
    }
    window.open(data.signedUrl, '_blank')
  }

  // Quitar = borra el archivo pero deja el slot como FALTANTE (a_pedir) con su descripción,
  // así no desaparece de los posts que lo usaban y se puede volver a cargar.
  const quitarArchivo = async () => {
    const supabase = createClient()
    try {
      if (asset.url) await supabase.storage.from(BUCKET).remove([asset.url])
      const { error } = await supabase
        .from('campaign_assets')
        .update({ url: null, nombre_archivo: null, origen: 'a_pedir' })
        .eq('id', asset.id)
      if (error) throw error
      toast.success('Archivo quitado — quedó marcado como faltante.')
      router.refresh()
    } catch {
      toast.error('No se pudo quitar el archivo.')
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', asset.id)
        e.dataTransfer.effectAllowed = 'copy'
      }}
      className="flex cursor-grab items-start gap-2 rounded-md border p-3 active:cursor-grabbing"
    >
      <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
      <div className="mt-0.5 text-muted-foreground">
        {asset.tipo === 'video' ? <Video className="size-4" /> : <ImageIcon className="size-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{asset.nombre_archivo ?? 'Archivo'}</span>
          {asset.categoria && (
            <Badge variant="outline" className="text-xs">
              {CATEGORIA_LABEL[asset.categoria]}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{asset.descripcion}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={handleView}>
          <ExternalLink className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-destructive"
          title="Quitar archivo (queda como faltante)"
          onClick={quitarArchivo}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// --- Sumar material extra (no pedido) ---
function NuevoMaterialForm({ campaignId, userId }: { campaignId: string; userId: string }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [categoria, setCategoria] = useState<AssetCategoria>('producto')
  const [descripcion, setDescripcion] = useState('')
  const [isUploading, setIsUploading] = useState(false)

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
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
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

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4 rounded-md border border-dashed p-4">
      <p className="text-sm font-medium">Sumar material extra</p>
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
  )
}

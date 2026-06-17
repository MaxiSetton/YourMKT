'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { CampaignAsset, AssetCategoria, Post } from '@/lib/types'
import { limpiarPedido, postTag } from './helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Camera, ExternalLink, ImageIcon, Sparkles, Trash2, Upload, Video } from 'lucide-react'

const BUCKET = 'post-media'

const CATEGORIA_LABEL: Record<AssetCategoria, string> = {
  producto: 'Producto',
  proceso: 'Proceso',
  otro: 'Otro',
}

const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9.\-_]/g, '_')

interface PostRef {
  id: string
  label: string
}

interface Props {
  campaignId: string
  userId: string
  initialAssets: CampaignAsset[]
  posts: Post[]
  dia: Map<string, number>
}

export function MaterialSection({ campaignId, userId, initialAssets, posts, dia }: Props) {
  // Para cada asset, qué posts lo usan (inverso de posts.asset_ids) → "para qué post es cada archivo".
  const postsForAsset = (assetId: string): PostRef[] =>
    posts
      .filter((p) => p.asset_ids?.includes(assetId))
      .map((p) => ({ id: p.id, label: postTag(p, dia.get(p.id) ?? 0) }))

  const pedidos = initialAssets.filter((a) => !a.url && a.origen === 'a_pedir')
  const aGenerar = initialAssets.filter((a) => !a.url && a.origen === 'a_generar')
  const cargados = initialAssets.filter((a) => a.url)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Subí poco y lo justo. Lo que la IA no puede inventar —tus manos, tu cara, tu local real— te lo
        pedimos abajo: eso es lo que da confianza. Cada archivo dice para qué post es.
      </p>

      {/* 1) Lo que te pedimos — pendiente */}
      {pedidos.length > 0 && (
        <Card className="bg-spark-surface/50 ring-spark/35">
          <CardHeader className="gap-1">
            <CardTitle className="flex items-center gap-2 text-base text-spark-foreground">
              <Camera className="size-4" />
              Necesitamos que subas esto
              <Badge className="bg-spark text-spark-foreground">
                {pedidos.length} pendiente{pedidos.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            <CardDescription>
              Clips cortos del celu (~10s, vertical) o fotos reales. Subí el archivo en el pedido que
              corresponda y listo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {pedidos.map((a) => (
              <PedidoItem
                key={a.id}
                asset={a}
                campaignId={campaignId}
                userId={userId}
                paraPosts={postsForAsset(a.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* 2) Lo que genera la IA — informativo */}
      {aGenerar.length > 0 && (
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" />
              Lo genera la IA
            </CardTitle>
            <CardDescription>No tenés que hacer nada con esto.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {aGenerar.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-1.5 rounded-lg border border-dashed p-3 text-sm"
              >
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{limpiarPedido(a.descripcion)}</span>
                </div>
                <ParaPosts posts={postsForAsset(a.id)} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 3) Material ya cargado */}
      {cargados.length > 0 && (
        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-base">Material cargado</CardTitle>
            <CardDescription>Lo que ya está subido y se va a usar en los posts.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {cargados.map((a) => (
              <CargadoItem key={a.id} asset={a} paraPosts={postsForAsset(a.id)} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* 4) Sumar material extra (no pedido) */}
      <NuevoMaterialForm campaignId={campaignId} userId={userId} />
    </div>
  )
}

// --- "Para qué post es" ---
function ParaPosts({ posts }: { posts: PostRef[] }) {
  if (posts.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground">Para:</span>
      {posts.map((p) => (
        <span
          key={p.id}
          className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium"
        >
          {p.label}
        </span>
      ))}
    </div>
  )
}

// --- Un pedido pendiente: descripción + upload que CUMPLE el pedido (rellena ese slot) ---
function PedidoItem({
  asset,
  campaignId,
  userId,
  paraPosts,
}: {
  asset: CampaignAsset
  campaignId: string
  userId: string
  paraPosts: PostRef[]
}) {
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

  const esVideo = asset.tipo === 'video'

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-spark/40 bg-background p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-spark-foreground">
          {esVideo ? <Video className="size-4" /> : <Camera className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{esVideo ? 'Clip corto' : 'Foto'}</span>
            {asset.categoria && (
              <Badge variant="outline" className="text-xs">
                {CATEGORIA_LABEL[asset.categoria]}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{limpiarPedido(asset.descripcion)}</p>
          <div className="mt-1.5">
            <ParaPosts posts={paraPosts} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          key={fileKey}
          type="file"
          accept={esVideo ? 'video/*' : 'image/*'}
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

// --- Un asset ya cargado: ver y quitar (deja el hueco como faltante) ---
function CargadoItem({ asset, paraPosts }: { asset: CampaignAsset; paraPosts: PostRef[] }) {
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
    <div className="flex items-start gap-2.5 rounded-lg border p-3">
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
        <p className="mt-0.5 text-sm text-muted-foreground">{limpiarPedido(asset.descripcion)}</p>
        <div className="mt-1.5">
          <ParaPosts posts={paraPosts} />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleView}
          aria-label="Abrir archivo"
        >
          <ExternalLink className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive"
          title="Quitar archivo (queda como faltante)"
          aria-label="Quitar archivo"
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
    <form onSubmit={handleUpload} className="flex flex-col gap-4 rounded-xl border border-dashed p-4">
      <div>
        <p className="text-sm font-medium">Sumar material extra</p>
        <p className="text-xs text-muted-foreground">¿Tenés algo más para aportar? Subilo acá.</p>
      </div>
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

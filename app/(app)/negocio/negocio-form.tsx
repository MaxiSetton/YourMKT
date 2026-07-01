'use client'

import { useEffect, useState } from 'react'
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

const VIBES = [
  { value: 'clasica', label: 'Clásica / cálida' },
  { value: 'moderna', label: 'Moderna / limpia' },
  { value: 'editorial', label: 'Editorial / con carácter' },
  { value: 'divertida', label: 'Divertida / informal' },
]

const BUSINESS_BUCKET = 'business-docs'

// voz_preferencia guarda el PATH del audio de referencia (voz clonada por OmniVoice).
// Los valores viejos eran IDs de EdgeTTS ('es-AR-ElenaNeural') sin '/', que ya no se usan.
const esPathDeAudio = (v: string | null | undefined) => !!v && v.includes('/')

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 cursor-pointer rounded border bg-transparent p-0.5"
        aria-label={label}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

interface Props {
  business: Business | null
  userId: string
}

export function NegocioForm({ business, userId }: Props) {
  const router = useRouter()
  const [nombre, setNombre] = useState(business?.nombre ?? '')
  const [rubro, setRubro] = useState(business?.rubro ?? '')
  const [descripcion, setDescripcion] = useState(business?.descripcion ?? '')
  const [propuestaValor, setPropuestaValor] = useState(business?.propuesta_valor ?? '')
  const [publicoObjetivo, setPublicoObjetivo] = useState(business?.publico_objetivo ?? '')
  const [tono, setTono] = useState(business?.tono_marca ?? '')
  const [tonoDetalle, setTonoDetalle] = useState(business?.tono_detalle ?? '')
  const [esteticaVisual, setEsteticaVisual] = useState(business?.estetica_visual ?? '')
  const [ejemplosPosts, setEjemplosPosts] = useState(business?.ejemplos_posts ?? '')
  const [evitar, setEvitar] = useState(business?.evitar ?? '')
  const [sitioWeb, setSitioWeb] = useState(business?.sitio_web ?? '')
  const [instagram, setInstagram] = useState(business?.instagram ?? '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState(business?.logo_url ?? '')
  const [colorPrimario, setColorPrimario] = useState(business?.color_primario ?? '#7A1F1F')
  const [colorAcento, setColorAcento] = useState(business?.color_acento ?? '#E8C66A')
  const [colorFondo, setColorFondo] = useState(business?.color_fondo ?? '#F4E9D8')
  const [vibe, setVibe] = useState(business?.vibe_tipografico ?? '')
  const [vozFile, setVozFile] = useState<File | null>(null)
  const [vozPath, setVozPath] = useState(
    esPathDeAudio(business?.voz_preferencia) ? (business!.voz_preferencia as string) : '',
  )
  const [isLoading, setIsLoading] = useState(false)
  // Previews firmados (buckets privados): logo y audio de referencia ya cargados.
  const [logoPreview, setLogoPreview] = useState('')
  const [vozPreview, setVozPreview] = useState('')

  useEffect(() => {
    const supabase = createClient()
    const sign = async (path: string, set: (u: string) => void) => {
      const { data } = await supabase.storage.from(BUSINESS_BUCKET).createSignedUrl(path, 3600)
      if (data?.signedUrl) set(data.signedUrl)
    }
    if (logoUrl) sign(logoUrl, setLogoPreview)
    if (vozPath) sign(vozPath, setVozPreview)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()

    let nuevoLogoUrl = logoUrl
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${userId}/brand/logo-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from(BUSINESS_BUCKET)
        .upload(path, logoFile, { upsert: true })
      if (upErr) {
        toast.error('No se pudo subir el logo.')
        setIsLoading(false)
        return
      }
      nuevoLogoUrl = path
    }

    let nuevoVozPath = vozPath
    if (vozFile) {
      const ext = vozFile.name.split('.').pop()?.toLowerCase()
      const path = `${userId}/brand/voz-ref-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from(BUSINESS_BUCKET)
        .upload(path, vozFile, { upsert: true })
      if (upErr) {
        toast.error('No se pudo subir el audio de referencia.')
        setIsLoading(false)
        return
      }
      nuevoVozPath = path
    }

    const payload = {
      nombre,
      rubro: rubro || null,
      descripcion: descripcion || null,
      propuesta_valor: propuestaValor || null,
      publico_objetivo: publicoObjetivo || null,
      tono_marca: tono || null,
      tono_detalle: tonoDetalle || null,
      estetica_visual: esteticaVisual || null,
      ejemplos_posts: ejemplosPosts || null,
      evitar: evitar || null,
      sitio_web: sitioWeb || null,
      instagram: instagram || null,
      logo_url: nuevoLogoUrl || null,
      color_primario: colorPrimario || null,
      color_acento: colorAcento || null,
      color_fondo: colorFondo || null,
      vibe_tipografico: vibe || null,
      voz_preferencia: nuevoVozPath || null,
    }

    try {
      if (business?.id) {
        const { error } = await supabase
          .from('businesses')
          .update(payload)
          .eq('id', business.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('businesses')
          .insert({ user_id: userId, ...payload })
        if (error) throw error
      }
      setLogoUrl(nuevoLogoUrl)
      setLogoFile(null)
      setVozPath(nuevoVozPath)
      setVozFile(null)
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
          Cuanto más completes, mejores son las campañas que genera la IA. Solo el nombre es obligatorio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre del negocio *</Label>
            <Input
              id="nombre"
              placeholder="Ej: Café del Centro"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rubro">Rubro</Label>
            <Input
              id="rubro"
              placeholder="Ej: Cafetería de especialidad"
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="¿A qué se dedica el negocio? ¿Qué ofrece?"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="propuesta">Propuesta de valor</Label>
            <Textarea
              id="propuesta"
              placeholder="¿Qué te diferencia de la competencia?"
              rows={2}
              value={propuestaValor}
              onChange={(e) => setPropuestaValor(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="publico">Público objetivo</Label>
            <Textarea
              id="publico"
              placeholder="¿A quién le hablás? Edad, intereses, perfil..."
              rows={2}
              value={publicoObjetivo}
              onChange={(e) => setPublicoObjetivo(e.target.value)}
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

          <div className="grid gap-2">
            <Label htmlFor="tono-detalle">Detalle del tono (opcional)</Label>
            <Textarea
              id="tono-detalle"
              placeholder="Matices de la voz: ej. 'cercano, tutea, argentino coloquial, emojis con moderación'."
              rows={2}
              value={tonoDetalle}
              onChange={(e) => setTonoDetalle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="estetica">Estética visual</Label>
            <Textarea
              id="estetica"
              placeholder="Colores, estilo de fotos, clima visual. Ej. 'tonos tierra, luz cálida, madera'."
              rows={2}
              value={esteticaVisual}
              onChange={(e) => setEsteticaVisual(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ejemplos">Ejemplos de posts buenos (opcional)</Label>
            <Textarea
              id="ejemplos"
              placeholder="Pegá 2 o 3 posts reales que representen bien la voz de la marca."
              rows={3}
              value={ejemplosPosts}
              onChange={(e) => setEjemplosPosts(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="evitar">Qué evitar</Label>
            <Textarea
              id="evitar"
              placeholder="Cosas que la marca NO hace. Ej. 'lenguaje corporativo, promesas exageradas'."
              rows={2}
              value={evitar}
              onChange={(e) => setEvitar(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sitio">Sitio web</Label>
              <Input
                id="sitio"
                placeholder="https://tunegocio.com"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="@tunegocio"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-5">
            <h3 className="text-sm font-medium">Identidad visual</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Define cómo se ven los reels: logo, colores, tipografía y voz.
            </p>

            <div className="mb-4 grid gap-2">
              <Label htmlFor="logo">Logo (PNG con fondo transparente)</Label>
              <div className="flex items-center gap-3">
                {(logoFile || logoPreview) && (
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : logoPreview}
                    alt="Logo de la marca"
                    className="h-14 w-14 shrink-0 rounded-md border bg-[repeating-conic-gradient(#e5e5e5_0_25%,transparent_0_50%)] bg-[length:12px_12px] object-contain p-1"
                  />
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {(logoFile || logoUrl) && (
                <p className="text-xs text-muted-foreground">
                  {logoFile ? `Nuevo: ${logoFile.name}` : 'Logo cargado ✓'}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Usá un PNG con fondo transparente para que el sello quede limpio sobre el video.
              </p>
            </div>

            <div className="mb-4 grid gap-2">
              <Label>Colores de marca</Label>
              <div className="flex gap-4">
                <ColorField label="Primario" value={colorPrimario} onChange={setColorPrimario} />
                <ColorField label="Acento" value={colorAcento} onChange={setColorAcento} />
                <ColorField label="Fondo" value={colorFondo} onChange={setColorFondo} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="vibe">Estilo tipográfico</Label>
                <Select value={vibe} onValueChange={setVibe}>
                  <SelectTrigger id="vibe">
                    <SelectValue placeholder="Elegí un estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIBES.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="voz">Voz de los videos (audio de referencia)</Label>
                <Input
                  id="voz"
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav"
                  onChange={(e) => setVozFile(e.target.files?.[0] ?? null)}
                />
                {(vozFile || vozPath) && (
                  <p className="text-xs text-muted-foreground">
                    {vozFile ? `Nuevo: ${vozFile.name}` : 'Audio de referencia cargado ✓'}
                  </p>
                )}
                {(vozFile || vozPreview) && (
                  <audio
                    controls
                    src={vozFile ? URL.createObjectURL(vozFile) : vozPreview}
                    className="mt-1 h-9 w-full"
                  />
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Subí 15–30s de una voz hablando claro (.mp3 o .wav). La IA la clona para narrar los reels;
              cuanto más limpia la grabación, mejor la imitación.
            </p>
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

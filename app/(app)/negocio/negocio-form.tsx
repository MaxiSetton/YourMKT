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

const VIBES = [
  { value: 'clasica', label: 'Clásica / cálida' },
  { value: 'moderna', label: 'Moderna / limpia' },
  { value: 'editorial', label: 'Editorial / con carácter' },
  { value: 'divertida', label: 'Divertida / informal' },
]

const VOCES = [
  { value: 'es-AR-ElenaNeural', label: 'Femenina (argentina)' },
  { value: 'es-AR-TomasNeural', label: 'Masculina (argentina)' },
]

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
  const [voz, setVoz] = useState(business?.voz_preferencia ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()

    let nuevoLogoUrl = logoUrl
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${userId}/brand/logo-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('business-docs')
        .upload(path, logoFile, { upsert: true })
      if (upErr) {
        toast.error('No se pudo subir el logo.')
        setIsLoading(false)
        return
      }
      nuevoLogoUrl = path
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
      voz_preferencia: voz || null,
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
              <Input
                id="logo"
                type="file"
                accept="image/png,image/svg+xml,image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              />
              {(logoFile || logoUrl) && (
                <p className="text-xs text-muted-foreground">
                  {logoFile ? `Nuevo: ${logoFile.name}` : 'Logo cargado ✓'}
                </p>
              )}
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
                <Label htmlFor="voz">Voz de los videos</Label>
                <Select value={voz} onValueChange={setVoz}>
                  <SelectTrigger id="voz">
                    <SelectValue placeholder="Elegí una voz" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOCES.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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

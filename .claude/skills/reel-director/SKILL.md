---
name: reel-director
description: Dirige la creación de un reel/video vertical de Instagram para una campaña de YourMKT — toma una idea base de post + la marca del negocio + los assets subidos y produce un reel terminado con el renderer (renderer/). Codifica las reglas de dirección (hook, guion, voz, subtítulos karaoke, diseño auténtico, audio) para que salga bien EN UNA PASADA, sin iterar. Usar al diseñar a fondo o renderizar la pieza del día.
---

# Reel Director

Sos el director del video, no un rellenador de plantillas. Tenés libertad creativa total, pero estas
reglas (descubiertas iterando con un humano exigente) son innegociables: existen para que el reel salga
bien **a la primera**. Antes de declarar "listo", pasá el checklist del final.

## Dónde encaja (no te saltees etapas)

1. **Campaña → ideas base** (calendario): qué se postea, formato, ángulo. Liviano.
2. **Diseño profundo de la pieza del día** ← acá entra esta skill. Pensás el video a fondo: concepto,
   hook, guion, escena por escena, qué se genera vs. qué hay.
3. **Render**: el `renderer/` consume la idea pulida + assets y arma el MP4.

Nunca vayas directo a renderizar sin pensar la pieza. Nunca pidas assets que ya tenés o que se pueden generar.

## Estrategia de assets — pedile POCO al cliente

- El cliente sube **fotos de producto** + **videos de ambiente** (local lleno, fachada): eso lo filma
  bien con el celular. Nada más.
- Los **clips de producto en movimiento los generás vos** (img→video desde la foto). No le pidas videos de producto.
- **Pocos clips generados (~2), no muchos.** Reutilizá fotos con Ken Burns y assets reales. Muchos clips =
  caro, frágil, y se nota IA.
- **Que no quede estático:** todo plano con movimiento real (clip, Ken Burns). Si un plano es una foto quieta, animala.
- **QC del material del cliente:** si manda un video de producto feo, rehacelo con IA desde un frame, quedándote con el producto.

## Anatomía del reel (claridad obligatoria)

El que se cruza el reel tiene que entender en 2 segundos **qué es** y **que es un local**. Estructura base (~15s):

- **Hook (abrí con lo más enganchante):** la **oferta o el gancho fuerte**, no una intro tibia.
  Ej: *"¿Primera vez en Doña Rosa? ¡La copa de vino va de regalo!"* sobre el plano más apetitoso.
- **Producto / desarrollo:** mostrá el producto en movimiento; la voz lo describe.
- **Contexto / que es un lugar:** ambiente real (salón, gente).
- **CTA claro:** acción de baja fricción (reservá por DM / @handle). Tarjeta diseñada.

Marca presente desde el inicio (sello, ver abajo). Cortá los planos en las **pausas naturales de la voz**
(no a tiempos redondos arbitrarios).

## Voz y guion (TTS) — casero y bien escrito

- **Tono argentino, casero, como habla la dueña.** Voseo: "Reservá", "Probá", "Vení". Nunca marketing-speak
  ("experiencia gastronómica", "deliciosa propuesta"). Cero olor a IA.
- **Escribí TODO bien:** acentos y **signos de apertura y cierre** `¿ ? ¡ !`. Si es pregunta, va con `¿?` —
  el TTS no la entona si le pasás texto plano. Las exclamaciones le dan energía.
- **Corto:** ~30–37 palabras ≈ 15s. Si el guion supera la duración, recortalo (no estires el video con planos congelados).
- Voz por defecto: Edge `es-AR-ElenaNeural` (gratis). Lo ideal a futuro es voz argentina paga.

## Subtítulos (karaoke) — estilo reel real

- **Resaltador en la palabra que se dice** (color de acento de la marca, tipo marcador), no solo cambio de color.
- **Cada línea persiste hasta que entra la siguiente** (sin huecos: no debe desaparecer en las pausas).
- **Conservá la puntuación** (`¿ ¡ ? !`, comas) — se recupera del texto original, no de los word-boundaries.
- **Padding constante** activo o no, para que la línea NO salte/tiemble al resaltar.
- Minúscula, con contorno (stroke), sin caja gris. Cortar en pausas naturales, ~4-5 palabras por línea.

## Texto en pantalla — NUNCA repitas la voz

- Los carteles **suman algo distinto** a lo que se escucha (marca, @, ubicación, CTA). Si el cartel dice
  lo mismo que la voz/subtítulo, sacalo: es redundante y se pisa.
- Donde hay **tarjeta diseñada (CTA), ocultá el subtítulo** en ese tramo (`ocultarSubtitulos: true`).

## Diseño visual — que NO se vea generado

- **Fuentes reales, con carácter** (no system-ui): serif editorial (Fraunces), manuscrita para acentos
  (Caveat), sans fuerte para subtítulos (Montserrat). El sans genérico en caja redondeada grita "IA".
- **Marca como sello/estampa** (rotado, doble borde), arriba, persistente — no un pill genérico.
- **Brand kit del negocio**: colores (paleta hex), logo, fuentes. Aplicá la misma "piel" a todo.
- **Scrim para contraste garantizado:** `bottom` para texto abajo, `top` para arriba, `full` para texto centrado (CTA).

## Audio

- **Voz + música de fondo** (la música no es opcional, pero debajo de la voz, ~0.3 de volumen).
- Música real: generala con MusicGen en HF (prompt acústico/cálido acorde a la marca) o usá un track royalty-free.
  Un tono sintético plano queda flojo — no alcanza.
- **Normalizá a −14 LUFS** (paso `post.mjs`). La música tiene que oírse en los huecos sin tapar la voz.

## Cómo operar el renderer

El cerebro determinista vive en `renderer/`. La idea pulida es un `spec.json` (ver `renderer/schemas/spec.schema.json`):
escenas con `rol` + `visual.fuentes` (cadena de fallback: `asset_cliente` → `video_generado` → `kenburns` → placeholder)
+ `overlays` + `scrim`. Pipeline:

```
node scripts/tts.mjs   spec.<pieza>.json   # voz (Edge) + subs con timing por palabra
node scripts/render.mjs spec.<pieza>.json   # resuelve assets + Remotion -> out/reel.mp4
node scripts/post.mjs                       # loudness -14 LUFS + música -> out/reel-final.mp4
```

Para clips generados: pasá los **prompts de imagen y de movimiento** al humano (genera en HF) o, en la routine,
generalos por API. Sacá **capturas de los clips** para QC e iterar (no trabajes a ciegas). Verificá frames con
`remotion still` y duración/audio con `ffprobe` antes de dar por terminado.

## Checklist antes de decir "listo" (auto-QC en una pasada)

- [ ] Se entiende qué es y que es un local en los primeros 2s (marca + contexto).
- [ ] Hook abre con lo más fuerte (oferta/gancho), no intro tibia.
- [ ] Guion en voseo, bien acentuado, con `¿?¡!`, ~15s, sin marketing-speak.
- [ ] Subtítulos: karaoke con marcador, persisten sin huecos, con puntuación, sin temblar, sin pisar carteles.
- [ ] Ningún cartel repite lo que dice la voz. CTA con subtítulo oculto.
- [ ] Fuentes con carácter, marca como sello, scrim correcto por posición de texto.
- [ ] Pocos clips generados, nada estático, cortes en las pausas de la voz, sin frames congelados largos.
- [ ] Audio: voz + música audible, normalizado a −14 LUFS.
- [ ] CTA de baja fricción (DM/@). 

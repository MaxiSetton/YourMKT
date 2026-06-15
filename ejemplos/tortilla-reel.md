# Etapa 2 — Deep design del reel: "La tortilla de Doña Rosa"

Pieza específica, pensada a fondo. Objetivo de campaña: captar nuevos clientes. Producto: tortilla de papa.
Foto base del cliente: `ejemplos/tortilla.jpg` (tortilla en tabla, porción levantada).

## Decisiones de dirección

- **Duración: ~15s.** Corto pero que se entienda.
- **Con voz en off**, corta y casera — como habla la dueña, no un narrador de publicidad. La voz es la que
  hace que el que se cruza el reel entienda **qué es** y **que es un local**. (Edge es-AR por ahora; ideal
  voz argentina paga más adelante.) + música cálida de fondo bajita + sonido del corte/fritura.
- **Solo 4 planos**, y **2 generados** nada más. El resto es contenido real: tu foto animada y el video del
  salón. Menos planos = menos IA, menos costo de generación, menos errores.
- **Claridad obligatoria:** en el primer plano ya se lee **"Doña Rosa · Villa Crespo"** y se nombra en la voz.
  Cierra con **CTA fuerte** (reservá por DM + copa de regalo la primera vez).
- **Tono del texto/voz: casero, de barrio.** Nada de "experiencia gastronómica".

## Guion visual (4 planos)

| t | plano | fuente | movimiento | voz (lo que se escucha) | texto en pantalla |
|---|---|---|---|---|---|
| 0–4 | **Hook + qué es** | foto cliente `tortilla.jpg` (img2video) | espátula levanta la porción, sube vapor, leve push-in | "¿Tortilla de papa como la de tu abuela? En Doña Rosa la hacemos así." | `Doña Rosa · cantina` <br> `Villa Crespo` |
| 4–8 | **El producto / la baba** | generado (macro del interior) | tenedor abre un pedazo, centro jugoso, vapor | "Papa, huevo y paciencia. Doradita por fuera, jugosa en el medio." | `recién hecha` |
| 8–11.5 | **Ambiente (es un local)** | **video real del salón** (cliente) | tal cual, paneo del salón lleno | "Te la servimos acá nomás, con un vino natural al lado." | — |
| 11.5–15 | **CTA** | foto/plato + logo (cierre de marca) | leve push-in | "¿Primera vez? La copa va de regalo. Reservá por mensaje, te esperamos." | `1ª vez = copa de regalo 🍷` <br> `reservá por DM · @donarosa.cantina` |

> El salón real en el plano 3 es clave: muestra que es un lugar con gente, no solo comida suelta.

## Guion de voz completo (para el TTS / subtítulos)

> "¿Tortilla de papa como la de tu abuela? En Doña Rosa la hacemos así: papa, huevo y paciencia.
> Doradita por fuera, jugosa en el medio. Te la servimos acá nomás, en Villa Crespo, con un vino
> natural al lado. ¿Primera vez? La copa va de regalo. Reservá por mensaje, te esperamos."

(~14s hablado. Casero, tutea, sin marketing. Los subtítulos se queman de acá, con timing por palabra.)

## Shot list para HF (solo 2 generados)

**Plano 1 — Hook (img2video desde `tortilla.jpg`)**
`motion: a metal spatula gently lifts one slice of spanish potato omelette off a wooden board, soft steam rising, very slight camera push-in, warm cozy restaurant lighting, appetizing, photorealistic`

**Plano 2 — La baba (txt2img → img2video)**
`image: extreme close-up of a slice of spanish potato omelette (tortilla de papa) cut open, soft slightly runny golden center, gentle steam, warm rustic lighting, shallow depth of field, photorealistic, no text`
`motion: a fork breaks a piece of the soft potato omelette, the tender juicy center pulls apart, gentle steam, slow motion macro food shot`

**Plano 3 — Ambiente:** NO se genera. Va el **video real del salón** que sube el cliente.
**Plano 4 — CTA:** NO se genera. Reusa la foto/un frame cálido + logo de Doña Rosa sobreimpreso.

## Copy del posteo (caption — tono Doña Rosa)

> Tortilla de papa como la de antes. Papa, huevo y tiempo, nada raro. Doradita por fuera, jugosa en el
> medio. Si todavía no caíste por Doña Rosa, esta es la excusa 🥔🍳
> La primera vez, la copa de vino natural va de regalo. Reservá por DM. Villa Crespo, te esperamos.

**Hashtags:** #tortilladepapa #comidacasera #villacrespo #bodegon #buenosairesfood #cocinaargentina

## Mapeo a la cadena de resolución (para el renderer)

- Plano **producto** (1): `asset_cliente` foto `tortilla.jpg` → **video_generado** (img2video).
- Plano **b-roll** (2): `imagen_generada` → `video_generado`.
- Plano **ambiente** (3): `asset_cliente` **video real** del salón → tal cual.
- Plano **CTA** (4): foto/frame + overlay de logo y CTA (texto HTML).

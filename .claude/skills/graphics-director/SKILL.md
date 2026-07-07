---
name: graphics-director
description: Dirige la capa GRÁFICA y de edición de un reel/short de YourMKT — texto cinético, pop-ups/stickers/callouts, lower-thirds, contadores y FX de edición (whip/zoom-punch, speed-ramp, transiciones) — para que el clip no se vea crudo y para DIRIGIR EL OJO, sin sobre-animar. Codifica el catálogo de elementos, cómo animarlos (enter/hold/exit, easing, timing al beat y a la palabra de subs.json) y cómo implementarlos 100% en CPU y gratis: Remotion (React/CSS/spring, el renderer del proyecto) primero, Lottie gratis (LottieFiles/IconScout) vía @remotion/lottie, y ffmpeg (drawtext/ASS/overlay/zoompan/xfade) como secundario. Usar junto a reel-director (que decide QUÉ/CUÁNDO) y a audio-director (cada pop visual tiene su pop sonoro). No reemplaza la dirección: implementa la capa visual.
---

# Graphics / Motion Director

La capa gráfica es lo que hace que un clip **no se vea crudo** (footage + subtítulo plano) y, sobre todo, lo que
**dirige el ojo**: dice dónde mirar, qué importa y cuándo cambia el punto. Todo lo de acá se hace en **CPU y
gratis**: Remotion (el renderer), Lottie libre, y ffmpeg. Esta skill es el **cómo se ve y cómo se mueve**;
`reel-director` decide qué elemento va y en qué beat, y `audio-director` le pone el sonido al movimiento.

## Regla 0 — dirigí el ojo, NO decores. No sobre-animes.
- **El error #1 es sobre-animar: si todo se mueve, nada importa.** Una cosa animándose por vez, y que sea la
  clave (la palabra del beat, el dato, la flecha que señala el paso).
- **Todo elemento tiene enter → hold → exit.** Nada aparece y se queda plano para siempre, y nada tiembla
  (padding constante, posición fija en el hold).
- **Sincronía triple:** al **beat**/corte, a la **palabra** (timing exacto en `subs.json`) y al **SFX** — el
  *pop* visual cae en el mismo frame que el *pop* sonoro (ver `audio-director`). Movimiento sin sonido (o al revés) se siente pegado.
- **La palabra clave de cada escena es UN dato compartido: `escena.enfasis` (fuente única, anti-drift).** El
  guionista la marca (`enfasis.texto`) y `retime` fija su `word_idx`. El **render ya le da pop EXTRA** a esa
  palabra en el karaoke (escala/color de marca) y `audio-director` le ancla el SFX al MISMO `word_idx`. **No
  elijas otra palabra ni dupliques el dato**: si querés un callout/pop-up de apoyo, alinealo a esa misma palabra.

## Catálogo de elementos
- **Subtítulos cinéticos (karaoke):** marcador/resaltador que **salta palabra a palabra** con spring; la
  palabra clave hace **pop de escala** en su beat. Máx 2 líneas, una sola "piel" en toda la campaña (`Subtitles.tsx`).
- **Pop-ups / stickers / callouts:** chip de **dato/precio** que entra con **pop + escala + bounce**; **flecha /
  círculo / check** para señalar el paso en tutoriales; **badge de oferta**; **contador** (01·02·03). Colores de
  marca fuertes, formas simples, animación suave (no recargada).
- **Lower-thirds / sello de marca:** @handle + ubicación; sello/estampa persistente arriba (logo real).
- **FX de edición:** **corte seco al beat** (lo principal), **whip-pan / zoom-punch** en el golpe, **speed-ramp**,
  **match-cut**, `xfade` puntual. *El ritmo sale del CORTE, no del zoom* (ver `reel-director` › Movimiento).

## Cómo animar (timing + easing)
- **Enter (≈0.2–0.4s):** **scale-pop con overshoot** (spring) para energía social; **ease-out** para algo más
  elegante; **mask-reveal** o **typewriter** para un texto destacado. Nunca lineal.
- **Hold:** legible y quieto.
- **Exit (≈0.15–0.3s):** rápido. Un fade-out lento roba ritmo.
- **Énfasis:** una palabra/elemento por beat (la primera vez que aparece). Más de uno a la vez = ruido.

## Implementación — CPU y gratis, por orden de preferencia
1. **Remotion (primario).** Componentes React/CSS con `spring()`/`interpolate()`/`Easing`. Es el renderer del
   proyecto: los overlays viven en `renderer/src/overlays.tsx` y el karaoke en `src/Subtitles.tsx`. Un elemento
   nuevo = un componente nuevo ahí + entrada en el enum `overlays.componente` del `spec.schema.json`. Todo CPU,
   sin costo. Paquetes: `@remotion/lottie`, `remotion-animated`.
2. **Lottie (gratis).** Animaciones vectoriales listas — **pop-ups, notificaciones, flechas, checks, emoji,
   stickers** — de **LottieFiles** e **IconScout** (filtrá *free*). Bajás el **Lottie JSON** a `public/` (mismo
   patrón que los assets) y lo montás con `@remotion/lottie`. Livianas, escalan sin pixelar, corren en CPU.
3. **ffmpeg (secundario / fuera de Remotion).** `drawtext` (anima `alpha`/`x`/`y`/`fontsize` por expresión, fade);
   **ASS/libass** (`-vf subtitles=…`) para tipografía y karaoke potentes; `overlay` de PNG/secuencia con
   `enable='between(t,a,b)'`; `zoompan` (punch/ken burns); `xfade` (transición entre clips). **Ojo:** muchos
   nodos `drawtext` hacen el grafo lento y chocan con límites → **fusioná** palabras o **pre-renderizá** el texto
   a PNG/secuencia y hacé un solo `overlay`.

## Safe zones y piel (consistente con reel-director)
- Texto crítico en el **70–80% central**. Márgenes ≈ **108 arriba / 320 abajo / 60 izq / 120 der** (px). **Nunca**
  en el 25–30% inferior ni en la columna derecha (~120px) — ahí van UI y caption.
- **Fuentes con carácter** (Fraunces / Caveat / Montserrat), no system-ui. **Una sola piel** y mismo color grade
  en toda la campaña. Colores de marca del `spec.marca`.

## Orquestación (lo que el orquestrador tiene que saber)
- Los elementos se declaran como **`overlays` por escena** en el spec (`{ componente, props }`), como ya funciona.
  Esta skill define el **catálogo + la animación**; implementar uno nuevo = componente en `overlays.tsx` + enum
  en el schema (trabajo de render, no de spec).
- **Se diseña JUNTO con `audio-director`:** cada pop/cartel tiene su SFX en el mismo segundo; cada corte, su
  whoosh. Y JUNTO con `reel-director`, que ordena qué elemento va en qué beat. Mismo spec, tres directores.

## Checklist antes de decir "listo"
- [ ] Cada beat tiene una capa gráfica que **SUMA** (no clip desnudo) pero **NO está sobre-animada**.
- [ ] **enter + hold + exit** en todo; nada plano permanente; nada que tiemble.
- [ ] **una cosa animada por vez**; jerarquía clara; la palabra/elemento clave cae **al beat**.
- [ ] **pop visual = pop sonoro** (mismo frame); corte = whoosh (coordinado con `audio-director`).
- [ ] safe zones respetadas; **una sola piel** tipográfica; colores de marca.
- [ ] **todo CPU y gratis**: Remotion + Lottie (LottieFiles/IconScout) + ffmpeg. Nada pago.

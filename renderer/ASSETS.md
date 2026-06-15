# Assets del demo — dejá los archivos en `renderer/public/`

El renderer toma lo que encuentre en `public/`. Lo que falte sale como **placeholder**
(gradiente para imágenes, slot negro para el clip), así el reel renderiza igual y vas
reemplazando de a uno.

| Archivo | Qué es | Cómo conseguirlo |
|---|---|---|
| `bg-intro.png` | Fondo escena intro (3.5s) | Generar en HF con el prompt 1 |
| `bg-cta.png` | Fondo escena CTA (final) | Generar en HF con el prompt 2 |
| `clip_pour.mp4` | Clip del cliente (latte sirviéndose) | Cualquier video vertical de prueba; lo recorta a 9:16 |
| `music.mp3` | Música de fondo | Cualquier MP3 royalty-free |
| `voice.mp3` + `subs.json` | Voz + subtítulos | **Se generan solos** con `npm run tts` (Edge TTS, gratis) |

## Prompts de imagen (FLUX.1-schnell, formato vertical 9:16, **sin texto**)

**Regla:** el modelo NO escribe texto. Pedí solo imagen; el copy lo pone el renderer en HTML.

**Prompt 1 — `bg-intro.png`**
```
Cinematic close-up of a Spanish latte in a glass cup on a wooden cafe counter,
warm golden morning light, soft steam rising, condensed milk swirl, cozy specialty
coffee shop background softly blurred, shallow depth of field, moody warm tones,
vertical 9:16 composition, no text, photorealistic
```

**Prompt 2 — `bg-cta.png`**
```
Warm inviting specialty coffee shop interior at golden hour, empty wooden table in
foreground, plants and soft bokeh lights in background, cozy welcoming atmosphere,
warm brown and amber palette, vertical 9:16 composition, generous empty space in the
center for text overlay, no text, photorealistic
```

Guardá ambas como PNG/JPG con esos nombres exactos en `public/`.

## Correr

```
npm run tts      # genera voz + subtítulos
npm run render   # arma el reel -> out/reel.mp4
# o las dos juntas:
npm run build
```

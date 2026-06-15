# Proyecto: Pipeline automatizado de campañas de contenido en redes

> **Documento maestro del MVP.** Guardalo en la raíz del repo Git del proyecto (ej: `PROYECTO.md`).
> Así también sirve como contexto que las routines de Claude leen en cada corrida.
> Última actualización: 2026-06-12

---

## 1. Resumen

Pipeline que toma los datos del negocio de un cliente (ofertas, multimedia grabado, piezas gráficas,
restricciones) y produce una campaña de contenido para redes: ideas generales → specs detalladas por
pieza → producción automática de posts y videos → QC → publicación manual.

**Alcance MVP:** 1 solo negocio, 1-2 piezas por día, aprobación humana en specs y en renders,
publicación manual. Velocidad de render NO importa (corre de madrugada). Regenerabilidad fácil NO
es requisito.

---

## 2. Decisiones tomadas (log)

| # | Decisión | Motivo |
|---|----------|--------|
| 1 | **Sin Canva.** Posts e identidad gráfica se generan con HTML/CSS propio renderizado a imagen. | Autofill API de Canva es solo Enterprise y solo rellena texto/imagen. HTML/CSS da libertad creativa total. |
| 2 | **Toda la IA corre en Claude Routines.** n8n NO usa nodos de IA. | No gastar créditos de IA de n8n. El "pensar" queda incluido en la suscripción de Claude. |
| 3 | **Scraping con Apify**, orquestado desde n8n. | Scraping crudo desde n8n se bloquea y viola ToS de IG/TikTok. |
| 4 | **Generación con HF Inference API** (TTS, música si falta, imágenes, Whisper p/ subtítulos). | Sin GPU propia. Cold starts aceptables porque corre de noche. |
| 5 | **Audios horneados en el render: solo propios / del cliente.** | Audios en tendencia están licenciados solo dentro de las apps. Evita strikes. (Ver decisión 11 para usarlos igual.) |
| 6 | **BDD con máquina de estados** (Supabase). | Batch nocturno necesita retomar fallas sin duplicar. |
| 7 | **Aprobación humana** en specs y en render final (al menos los primeros meses). | Evitar publicar errores (precios mal, texto cortado, audio desincronizado). |
| 8 | **Slot negro como placeholder** cuando falta el video del cliente; al subirlo se **re-renderiza la pieza completa** con el mismo renderer. | El "merge posterior" es ffmpeg determinístico, no un modelo de HF. Idempotente: mismo spec + mismos assets = mismo output. |
| 9 | **Publicación manual en el MVP.** | Evita el app review de Meta. Última red de seguridad. |
| 10 | **Triggers event-driven:** apenas el cliente sube algo, n8n dispara la routine por API (con debounce + guardia de presupuesto). El schedule nocturno queda como barrido. | Resultados el mismo día. Las corridas por API cuentan contra el tope diario igual que las programadas — por eso las salvaguardas. |
| 11 | **Modo `audio_nativo_ig`:** para usar audios en tendencia, el render sale SIN el audio horneado (solo voz propia o mudo) + overlay "🔊 Ver con audio"; quien publica agrega el audio nativamente en la app de IG siguiendo instrucciones generadas (link + segundo de inicio). | El audio nativo dentro de IG está licenciado → vía legal. El audio solo se usa internamente como referencia para sincronizar cortes (zona gris de ToS, pero la pieza publicada queda limpia). |

**Modelo de costos resultante:** Apify (scraping) + HF Inference (generación) + VPS de n8n + Supabase.
Nota: las routines son "gratis" en el sentido de que van contra la suscripción de Claude, pero
**consumen los límites del plan** (tope diario de corridas + ventana de uso compartida con chat/Cowork).

---

## 3. Arquitectura — quién hace qué

### Repo Git (el cerebro determinístico)
- `PROYECTO.md` — este documento (contexto para las routines).
- `renderer/` — código que convierte spec JSON → pieza final:
  - Posts: HTML/CSS → Chromium headless (Puppeteer) → captura 1080×1350 → PNG/JPG.
  - Videos: Remotion (componentes React+CSS, captura frame a frame) para overlays y escenas
    gráficas + **ffmpeg** para ensamblar clips del cliente, imágenes generadas, voz, música y subtítulos.
- `schemas/` — JSON Schema de la spec de pieza (sección 6).
- `validador/` — script que valida cada spec contra las restricciones del negocio. **Es código, no
  memoria del modelo.** Rechaza specs que violen lo que marcó el cliente.
- `prompts/` — instrucciones de cada routine, versionadas.

### Supabase (estado + archivos)
- Postgres: todas las tablas (sección 5).
- Storage: assets del cliente, assets generados, renders versionados.
- Acceso desde routines vía conector MCP de Supabase (sin API intermedia).

### n8n self-hosted en VPS (orquestación SIN IA)
- Dispara actors de Apify según calendario (intake 1 vez + snapshot semanal de tendencias).
- Webhook de subida de assets del cliente → valida con **ffprobe** (codec, resolución, orientación,
  duración) → normaliza → guarda en Storage → marca estado en BDD.
- **Dispara routines por API (event-driven)**: apenas el cliente sube assets o completa el intake.
  Con tres salvaguardas porque las corridas por API consumen el tope diario:
  1. **Debounce:** espera ~15 min desde el último upload y agrupa todo lo pendiente en UNA corrida,
     pasando los IDs de las piezas a procesar.
  2. **Guardia de presupuesto:** contador de corridas del día en BDD; si se superó el tope definido
     (ej: máx 3 por API/día), la pieza queda pendiente para el barrido nocturno.
  3. El **barrido nocturno programado** procesa todo lo diferido. Si no hay nada pendiente, la
     routine lee la BDD y sale barata.
- Recordatorios al cliente (asset faltante) por WhatsApp/email.
- Aprobación humana por Telegram/Slack con botones (aprueba/rechaza specs y renders).
- Alertas de fallas (lee `run_log`).

### Claude Routines (todo lo que piensa)
Tres routines, presupuestadas contra el tope diario de corridas:

| Routine | Frecuencia | Qué hace |
|---------|-----------|----------|
| **Ideación** | Semanal | Lee snapshot de tendencias + contexto del negocio + métricas previas. Genera 7-14 ideas con spec JSON completa cada una. Corre el validador. Deja todo en estado `spec_generada`. |
| **Producción** | API (event-driven) + barrido nocturno | Toma specs `aprobadas` con assets ok o placeholder permitido. Genera assets en HF (TTS, imágenes, música si falta). Renderiza con el código del repo. Auto-QC. Sube a Storage. Estado → `qc_humano`. Notifica vía n8n. |
| **Re-render** | API (disparada por n8n con debounce) | Cuando el cliente sube el asset de un slot: re-corre el renderer con la spec original y el slot lleno. Procesa en lote todos los IDs que n8n le pasa. |

Presupuesto: ~1-2 corridas/día + 1 semanal + re-renders esporádicos. Entra en cualquier plan pago.

### Apify (scraping)
- **Intake (1 vez por cliente, refresh mensual):** presencia del cliente + competidores + nicho →
  "pack de contexto" en BDD.
- **Snapshot de tendencias (semanal):** qué funciona AHORA en el nicho (formatos, ganchos,
  engagement). Se guarda con fecha y vencimiento (~7 días).
- **NO se scrapea por post.** Cada pieza lee el snapshot cacheado. Excepción: pieza explícitamente
  reactiva a una tendencia puntual o snapshot vencido.
- **Feedback loop (post-MVP):** métricas de los posts publicados del propio cliente vía API oficial
  de insights de Meta/TikTok (no scraping). Es lo único que responde "qué funciona" para ESTA cuenta.

### HF Inference API (generación)
- TTS para voz en off (si el cliente no graba), música solo si no hay propia, imágenes
  (FLUX/SDXL u otro), Whisper para subtítulos automáticos.
- **Retries con backoff obligatorios**: los modelos serverless tienen cold starts de minutos.
- Guardar `modelo + parámetros + seed` en la spec para reproducibilidad razonable.
- Si se clona la voz del cliente: **consentimiento escrito previo, sí o sí.**

---

## 4. Flujo de una pieza (de punta a punta)

1. *(semanal)* Apify corre → n8n guarda crudo → Routine Ideación destila tendencias y genera ideas + specs → validador OK → `spec_generada`.
2. Humano aprueba/rechaza por Telegram → `spec_aprobada`.
3. *(madrugada)* Routine Producción: genera assets HF → renderiza → auto-QC → `qc_humano`.
   - Si falta el video del cliente: renderiza con **slot negro**, flag `render_parcial`, n8n recuerda al cliente.
4. Humano revisa el render → `aprobada_final` (o rechaza con nota → vuelve a producción).
5. Humano publica a mano → `publicada`.
6. Cliente sube asset faltante → n8n valida (ffprobe) → dispara Routine Re-render → nueva versión → `qc_humano` de nuevo.
7. *(post-MVP)* Métricas → BDD → alimentan la próxima ideación.

---

## 5. Schema de BDD (mínimo viable)

- **negocio** — perfil, brand kit (colores, fuentes, logo), **restricciones como campos duros**
  (`aparece_en_camara: bool`, `que_se_puede_pedir: []`, tono, temas prohibidos), ofertas/objetivos.
- **snapshot_tendencias** — insights destilados (JSON), fecha, `vence_a`.
- **idea** — campaign/negocio_id, título, **hipótesis de por qué funcionaría**, formato, estado.
- **pieza** — idea_id, tipo (post/video/carrusel), `spec` (JSON, sección 6), estado, flag
  `render_parcial`, `hash_version` (hash de spec + asset_ids → clave de idempotencia), path del render.
- **asset** — pieza_id (nullable: hay assets a nivel negocio), tipo, path en Storage, metadata
  ffprobe, estado (`pendiente` / `validado` / `rechazado`).
- **run_log** — routine, timestamp, resultado, error, costo estimado (Apify + HF).

**Estados de pieza:** `idea → spec_generada → spec_aprobada → en_produccion → render_listo →
qc_humano → aprobada_final → publicada → medida`

---

## 6. Contrato: spec JSON de pieza

Campos mínimos (el schema formal vive en `schemas/`):

```
id, formato (reel|post|carrusel), aspect, duracion_seg
escenas[]: { t_in, t_out, capas[]: {
    tipo: video_cliente | imagen_generada | overlay_html | color,
    src | slot_id | prompt_imagen | componente_remotion, posicion } }
audio: { modo: propio | audio_nativo_ig,
         voz: { texto, modelo_tts, params },
         musica: { src_propio | generar_hf },          ← prohibida si modo = audio_nativo_ig
         nativo_ig: { link_audio, segundo_inicio },     ← solo referencia de sync; NO se hornea
         niveles_mezcla }
overlays_obligatorios: [ "ver_con_audio" ]               ← si modo = audio_nativo_ig
subtitulos: { auto_whisper: bool, estilo }
copy: { caption, hashtags[] }
slots_requeridos[]: { id, aspect, duracion_min, descripcion_de_lo_esperado, fallback: negro }
restricciones_validadas: bool
generacion: { modelos_usados, seeds }  ← para reproducibilidad
```

Regla de oro: **la "idea recontra pulida" ES este JSON**, no prosa. Claude lo llena; el renderer
fijo del repo lo consume. Claude nunca improvisa comandos ffmpeg ad-hoc por corrida.

---

## 7. QC

**Automático (dentro de Routine Producción):** duración correcta, resolución/aspect, loudness
(target ~-14 LUFS), Claude revisa 3-5 screenshots del render (texto cortado, contraste, elementos
superpuestos), spec validada contra restricciones.

**Humano:** revisión del render final antes de `aprobada_final`. Publicación siempre manual en MVP.
Si la pieza es modo `audio_nativo_ig`, n8n adjunta a la notificación el **paquete de publicación**:
qué audio agregar (link), en qué segundo arrancarlo, y cómo mezclar niveles voz/música en la app.

**Regla del validador:** pieza con `audio.modo = audio_nativo_ig` NO puede tener música horneada
(propia ni generada) — son excluyentes. El render exportado lleva solo el sonido original del clip
o sale mudo, más el overlay "ver con audio".

---

## 8. Estabilidad

- **Idempotencia:** output key = `hash(spec_version + asset_ids)`. Re-correr no duplica.
- **Errores:** toda llamada externa (HF, Apify, Storage) con retry + backoff; falla persistente →
  `run_log` + alerta Telegram. El batch retoma desde el estado en BDD.
- **Versionado:** renders nunca se sobreescriben; renderer y prompts en Git.
- **Observabilidad:** `run_log` con costo por corrida → permite vigilar el gasto Apify + HF.

---

## 9. Pendiente de verificar (asumido, sin confirmar)

1. **Tope exacto de corridas de routines** del plan contratado → `claude.ai/settings/usage`.
2. **Egress de red del sandbox de routines** hacia HF Inference y Supabase (¿allowlist configurable?).
3. **Runtime máximo por corrida** (render de 60s + cold starts de HF puede tomar largo).
4. **Licencia de Remotion** para el caso concreto (gratis individuos/empresas chicas — confirmar términos).
5. Disponibilidad serverless en HF de los modelos elegidos (no todos están; algunos requieren
   endpoint dedicado = costo fijo).

**Día 1 del proyecto:** routine de prueba que clona el repo, lee/escribe en Supabase, llama a un
modelo de HF y hace un render dummy con ffmpeg. Despeja los puntos 1-3 en una tarde, antes de
escribir nada más.

---

## 10. Costos recurrentes esperados

| Rubro | Naturaleza |
|-------|-----------|
| Apify | Por corrida de actor (intake mensual + snapshot semanal) |
| HF Inference | Por pieza generada (TTS + imágenes + Whisper) — bajo a 1-2 piezas/día |
| VPS n8n | Fijo mensual (chico alcanza) |
| Supabase | Free tier probablemente alcanza para 1 negocio |
| Claude | Suscripción ya existente — routines consumen límites del plan, no plata extra |
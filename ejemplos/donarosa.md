# Ejemplo rico — "Doña Rosa" (cantina de barrio, Villa Crespo)

Caso real simulado con TODA la info que un usuario carga en la web. Sirve de fixture para Ideación
y para probar el renderer end-to-end. Rubro: gastronomía. Objetivo de campaña: captar clientes nuevos.

---

## 1. Negocio (tabla `businesses`)

| Campo | Valor |
|---|---|
| **nombre** | Doña Rosa |
| **rubro** | Restaurante / cantina de barrio — cocina argentina de bodegón renovada |
| **descripcion** | Cantina de Villa Crespo. Cocina de bodegón hecha con producto fresco: milanesas napolitanas XL, pastas amasadas a mano todos los días y una carta corta de vinos naturales. Ambiente cálido, manteles a cuadros, mucha madera y luz tenue. Recetas de la abuela, bien hechas. |
| **propuesta_valor** | El bodegón de siempre pero bien hecho: producto fresco, porciones generosas, precio honesto y vinos naturales curados. Comés como en casa de la abuela, pero con un Malbec natural al lado. |
| **publico_objetivo** | 28–50 años, vecinos de Villa Crespo, Chacarita y Caballito. Foodies de barrio, parejas, after-office y grupos de amigos. Valoran autenticidad, buen precio y lugares con onda, no pretenciosos. |
| **tono_marca** | `cercano` (cercano y amigable) |
| **tono_detalle** | Argentino coloquial, tutea, cálido y con humor de barrio. Habla como un anfitrión que te conoce de toda la vida. Emojis con moderación. Nada solemne ni acartonado. |
| **estetica_visual** | Tonos cálidos, madera, luz tungsteno dorada, manteles a cuadros rojo y crema. Mucha textura: pan, vino, vapor, queso. Fotos apetitosas, poco saturadas, estilo "comida real" — no de revista fría. |
| **ejemplos_posts** | 1) "Hoy hay sorrentinos de osobuco y se van a terminar temprano. Vos sabrás. 🍝" · 2) "Llegó el frío. Llegó la napo XL. Coincidencia? No lo creemos." · 3) "Reservá que los viernes volamos. Link en bio o mandanos un DM." |
| **evitar** | Lenguaje corporativo, "experiencia gastronómica", "propuesta gourmet", promesas exageradas, fotos de stock frías, signos de exclamación de más. |
| **sitio_web** | (no tiene, trabaja por IG) |
| **instagram** | @donarosa.cantina |

### Brand kit (campos nuevos propuestos — hoy parte van en `estetica_visual`)

| Campo | Valor |
|---|---|
| **logo** | `logo-donarosa.png` (versión crema sobre transparente + versión bordó) |
| **colores** | primario `#7A1F1F` (bordó), secundario `#2E4034` (verde botella), acento `#E8C66A` (dorado), fondo `#F4E9D8` (crema), texto `#2B1B14` |
| **fuenteTitulo** | serif con carácter (ej. Playfair / Bricolage) |
| **fuenteTexto** | sans humanista |
| **voz_tts** | es-AR femenina, cálida (placeholder Edge; ideal voz argentina paga) |
| **imágenes de referencia** | 2-3 fotos del local para anclar img2img (ambiente, mesa servida) |

---

## 2. Campaña (tabla `campaigns`)

| Campo | Valor |
|---|---|
| **nombre** | Conocé Doña Rosa |
| **que_promociona** | Dar a conocer la cantina a vecinos que todavía no la probaron. Plato estrella: milanesa napolitana XL. Gancho de bienvenida: copa de vino natural de cortesía la primera vez. |
| **objetivo** | Captar clientes nuevos del barrio y llenar de miércoles a viernes en temporada de frío. |
| **fecha_inicio** | 2026-06-17 |
| **duracion_dias** | 14 |
| **elementos_especificos** | Mencionar la **copa de vino natural de regalo la primera vez**. Destacar la **milanesa napo XL**. Mostrar el **ambiente del salón lleno**. Reservas por **DM/WhatsApp**. Que se note que es en **Villa Crespo**. |
| **brief** | Invierno en Buenos Aires. Competimos con cadenas y delivery; nuestra carta es autenticidad + precio justo + vinos naturales. Queremos que el de la otra cuadra que nunca entró, entre. |
| **estado** | borrador |

---

## 3. Material — qué pide al cliente vs. qué genera la IA

**Principio: pedirle poco al cliente.** Lo que un negocio filma/fotografía bien y sin esfuerzo, se pide.
Lo que necesita producción (producto en movimiento, b-roll) se genera con IA.

**Lo que sube el cliente (poco y fácil):**

| # | tipo | categoría | descripción |
|---|---|---|---|
| a | imagen | producto | Foto de la milanesa napolitana XL, apetitosa, sobre la mesa con el queso a la vista. |
| b | imagen | producto | Foto del plato de sorrentinos con salsa fileto, cenital sobre el mantel a cuadros. |
| c | imagen | producto | Foto de la copa de vino natural tinto, contraluz dorado. |
| d | video | otro (ambiente) | Salón lleno un viernes, paneo lento del lugar con gente charlando. ~8s. **Esto lo filma bien con el celular.** |
| e | video | otro (ambiente) | Fachada de noche con el cartel iluminado, leve movimiento. ~5s. |

**Lo que genera la IA (a partir de lo anterior):**
- **Clips de producto en movimiento:** img→video desde las fotos a/b/c (push-in, vapor, queso estirándose).
- **B-roll y fondos** que no existan (texturas, detalles, transiciones).

**QC del material del cliente:** si igual manda un video de producto, se chequea calidad. Si no está bueno,
se **rehace con IA** sacándole un frame y quedándonos solo con el producto. Los videos de **ambiente**
(local lleno, fachada) casi siempre se usan tal cual: son fáciles y quedan bien.

---

## 4. Etapa 1 — Calendario de ideas base (objetivo: captar nuevos clientes)

Ideas **base** (livianas), 9 piezas en 14 días, mezcla de formatos. Cada una se "deep-designea"
recién cuando le toca el día. Formatos según la web: `reel` · `feed` (imagen/carrusel) · `story`.

| Día | Formato | Idea base / ángulo | Gancho | Para qué (captar) | Assets |
|---|---|---|---|---|---|
| 1 (17/6) | **reel** | El plato que tenés que probar la primera vez: la napo XL | "Si nunca viniste, empezá por acá 👇" | Enganchar con el hero apetitoso | foto milanesa (a) → **clip generado** + b-roll generado |
| 2 (18/6) | story | Encuesta "¿Milanesa o pasta?" + reservá | interacción | Awareness + tráfico a reservas | fotos a, b |
| 3 (19/6) | **feed** (carrusel) | 4 razones por las que el barrio ya nos elige | "No es solo la milanesa…" | Prueba social + diferenciales | video salón (d), fotos c, b, video fachada (e) |
| 5 (21/6) | **reel** | Detrás de escena: así amasamos la pasta cada mañana | "Esto pasa antes de que abramos" | Autenticidad, confianza | **todo generado** (o pedir un videíto corto del amasado, opcional) |
| 6 (22/6) | story | Beneficio de bienvenida: 1ª vez = copa de vino natural 🍷 | regalo | Conversión directa, CTA reservá | foto copa (c) |
| 8 (24/6) | **reel** | Mini-guía: cómo elegir un vino natural (y por qué te va a gustar) | educativo | Posiciona la carta, atrae curiosos | foto copa (c) → clip generado + generado |
| 10 (26/6) | **feed** | Un viernes cualquiera en Doña Rosa | FOMO | Mostrar ambiente, "quiero ir" | video salón (d) |
| 12 (28/6) | **reel** | Testimonio: la primera vez de un vecino + b-roll de platos | prueba social | Confianza de nuevos | video salón (d), fotos a, b → clips generados |
| 14 (30/6) | story | Cierre: "Te esperamos esta semana, reservá por DM" + recordá el beneficio | urgencia suave | Última conversión | video fachada (e) |

> Regla del ángulo "captar nuevos": cada pieza asume que **el que mira nunca vino**. Hook explícito a
> primerizos, prueba social, y CTA de baja fricción (DM/WhatsApp) + el beneficio de bienvenida repetido.

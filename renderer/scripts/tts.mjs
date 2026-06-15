// Genera public/voice.mp3 + public/subs.json desde spec.audio.voz usando Edge TTS (gratis, sin key).
// Los subtitulos salen de los word-boundaries del servicio: timing exacto, sin Whisper.
import { EdgeTTS } from "@andresaya/edge-tts";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");
const specFile = process.argv[2] ?? "spec.promo.json";

const spec = JSON.parse(await readFile(path.join(root, specFile), "utf8"));
const { texto, voz_tts, rate } = spec.audio.voz;
const maxPalabras = spec.subtitulos?.maxPalabras ?? 4;

await mkdir(publicDir, { recursive: true });

const tts = new EdgeTTS();
await tts.synthesize(texto, voz_tts, rate ? { rate } : {});
await tts.toFile(path.join(publicDir, "voice")); // -> public/voice.mp3

// word-boundaries en ticks de 100ns -> segundos.
// Los boundaries vienen SIN puntuacion -> realineo con los tokens del texto original
// para que el subtitulo conserve ¿ ? ¡ ! y comas (si era pregunta, que se vea como pregunta).
const boundary = tts.getWordBoundaries();
const tokens = texto.split(/\s+/).filter(Boolean);
const aligned = boundary.length === tokens.length;
if (!aligned) console.log(`(aviso: ${boundary.length} palabras de voz vs ${tokens.length} tokens -> subtitulos sin puntuacion)`);
const words = boundary.map((b, i) => ({
  w: aligned ? tokens[i] : b.text,
  from: b.offset / 1e7,
  to: (b.offset + b.duration) / 1e7,
}));

// Agrupar en lineas cortando por PAUSAS naturales (la voz pausa en comas/puntos),
// con un tope de palabras. Asi no se parten las frases. Cada linea guarda sus palabras
// con timing -> el subtitulo resalta la palabra que se esta diciendo (karaoke).
const PAUSA = 0.3; // seg de silencio que dispara corte de linea
const cap = Math.max(maxPalabras, 5);
const subs = [];
let cur = [];
for (let i = 0; i < words.length; i++) {
  cur.push(words[i]);
  const next = words[i + 1];
  const gap = next ? next.from - words[i].to : Infinity;
  if (cur.length >= cap || gap > PAUSA || !next) {
    subs.push({ from: cur[0].from, to: cur[cur.length - 1].to, words: cur });
    cur = [];
  }
}

await writeFile(path.join(publicDir, "subs.json"), JSON.stringify(subs, null, 2));
console.log(`TTS ok: voice.mp3 (~${tts.getDuration().toFixed(1)}s) + ${subs.length} bloques de subtitulos (${words.length} palabras).`);

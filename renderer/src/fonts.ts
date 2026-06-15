// Fuentes reales (no system) — clave para que NO se vea generado/IA.
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";

export const fontTitulo = loadFraunces("normal", { weights: ["600", "900"] }).fontFamily; // serif cálida, editorial
export const fontMano = loadCaveat("normal", { weights: ["700"] }).fontFamily; // manuscrita, toque humano
export const fontTexto = loadMontserrat("normal", { weights: ["700", "800"] }).fontFamily; // sans fuerte p/ subtitulos

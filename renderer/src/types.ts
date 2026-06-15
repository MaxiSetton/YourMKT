// Spec v2 — la escena declara ROL + INTENCION + una CADENA DE FUENTES.
// El render resuelve la cadena contra lo que existe ("lo que hay es lo que hay").

export type FuenteTipo = "asset_cliente" | "video_generado" | "imagen_generada" | "kenburns";

export interface Fuente {
  tipo: FuenteTipo;
  // Prototipo: nombre de archivo candidato en public/. Futuro: match contra el pool de Supabase.
  archivo?: string;
  // Para matchear el pool real del cliente (futuro, lo usa Ideacion/resolver).
  match?: { categoria?: string; palabras?: string[] };
  // Para generar en HF (hoy informativo; el humano genera con este prompt).
  prompt?: string;
  // img2img / img2video: de dónde sale la imagen base.
  base?: "asset_cliente" | "logo" | "referencia_marca" | "imagen_generada";
  prompt_movimiento?: string; // solo video_generado
}

export interface OverlaySpec {
  componente: string;
  props?: Record<string, unknown>;
}

export type ScrimModo = "none" | "bottom" | "top" | "full";

export interface Escena {
  id: string;
  rol: string; // hook | producto | paso | beneficios | resultado | cta ...
  t_in: number;
  t_out: number;
  visual: { intencion: string; fuentes: Fuente[] };
  overlays?: OverlaySpec[];
  scrim?: ScrimModo;
  ocultarSubtitulos?: boolean; // true en escenas con tarjeta propia (ej. CTA) para no pisar el subtitulo
}

// Lo que produce render.mjs por escena tras resolver la cadena. Lo consume el componente.
export interface VisualResuelto {
  kind: "image" | "video" | "placeholder";
  src?: string;
  fit?: "cover" | "contain";
  kenburns?: boolean;
  intencion: string;
  via?: string; // qué fuente resolvió (debug / QC)
}

export interface Marca {
  nombre: string;
  colores: {
    primario: string;
    secundario: string;
    acento: string;
    fondo: string;
    texto: string;
    textoInverso: string;
  };
  fuenteTitulo: string;
  fuenteTexto: string;
}

export interface SubWord {
  w: string;
  from: number;
  to: number;
}

export interface Sub {
  from: number;
  to: number;
  words: SubWord[];
}

export interface Spec {
  id: string;
  arquetipo: string;
  formato: string;
  aspect: string;
  fps: number;
  duracion_seg: number;
  marca: Marca;
  escenas: (Escena & { resuelto?: VisualResuelto })[];
  audio: {
    modo: string;
    voz: { texto: string; voz_tts: string; rate?: string };
    musica?: { src: string; volumen: number; exists?: boolean };
  };
  subtitulos: { auto: boolean; estilo: string; maxPalabras: number };
  copy: { caption: string; hashtags: string[] };
}

export interface ReelProps {
  spec: Spec;
  subs: Sub[];
  voiceExists: boolean;
  hideRanges: [number, number][]; // rangos [from,to] en seg donde NO se muestran subtitulos
}

import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Marca, Sub } from "./types";
import { fontTexto } from "./fonts";

export const Subtitles: React.FC<{ subs: Sub[]; marca: Marca; hideRanges?: [number, number][] }> = ({
  subs,
  marca,
  hideRanges = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (hideRanges.some(([a, b]) => t >= a && t < b)) return null;

  // Cada linea persiste hasta que ARRANCA la siguiente (sin huecos: no desaparece a mitad).
  const idx = subs.findIndex((s, i) => t >= s.from && (i + 1 >= subs.length || t < subs[i + 1].from));
  if (idx < 0) return null;
  const active = subs[idx];

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", padding: 70, paddingBottom: 240 }}>
      <div style={{ maxWidth: "92%", textAlign: "center", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 2px" }}>
        {active.words.map((wd, i) => {
          const on = t >= wd.from && t < wd.to;
          return (
            <span
              key={i}
              style={{
                fontFamily: fontTexto,
                fontWeight: 800,
                fontSize: 60,
                lineHeight: 1.1,
                letterSpacing: -0.5,
                textTransform: "lowercase",
                color: on ? marca.colores.texto : "#fff",
                background: on ? marca.colores.acento : "transparent",
                padding: "4px 12px",
                borderRadius: on ? 8 : 0,
                transform: on ? "rotate(-1.5deg)" : "none",
                WebkitTextStrokeWidth: on ? "0" : "7px",
                WebkitTextStrokeColor: marca.colores.texto,
                paintOrder: "stroke",
                boxShadow: on ? "0 6px 18px rgba(0,0,0,0.35)" : "none",
                display: "inline-block",
              }}
            >
              {wd.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

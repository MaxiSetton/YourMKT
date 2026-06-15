import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { Escena, Marca, ReelProps, ScrimModo, VisualResuelto } from "./types";
import { OVERLAYS } from "./overlays";
import { Subtitles } from "./Subtitles";

const KenBurns: React.FC<{ src: string; fit?: "cover" | "contain"; durationInFrames: number }> = ({
  src,
  fit = "cover",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.12], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{ width: "100%", height: "100%", objectFit: fit, transform: `scale(${scale})` }}
      />
    </AbsoluteFill>
  );
};

const Background: React.FC<{ vis: VisualResuelto; marca: Marca; durationInFrames: number }> = ({
  vis,
  marca,
  durationInFrames,
}) => {
  if (vis.kind === "image" && vis.src) {
    return vis.kenburns ? (
      <KenBurns src={vis.src} fit={vis.fit} durationInFrames={durationInFrames} />
    ) : (
      <AbsoluteFill>
        <Img src={staticFile(vis.src)} style={{ width: "100%", height: "100%", objectFit: vis.fit ?? "cover" }} />
      </AbsoluteFill>
    );
  }
  if (vis.kind === "video" && vis.src) {
    return (
      <AbsoluteFill>
        <OffthreadVideo src={staticFile(vis.src)} muted style={{ width: "100%", height: "100%", objectFit: vis.fit ?? "cover" }} />
      </AbsoluteFill>
    );
  }
  // placeholder (dev): solo cuando ninguna fuente resolvio
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${marca.colores.primario} 0%, ${marca.colores.texto} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.45)", fontFamily: "monospace", fontSize: 26, textAlign: "center" }}>
        [pendiente]
        <br />
        {vis.intencion}
      </span>
    </AbsoluteFill>
  );
};

const Scrim: React.FC<{ modo: ScrimModo }> = ({ modo }) => {
  if (modo === "none") return null;
  const bg =
    modo === "bottom"
      ? "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0) 60%)"
      : modo === "top"
        ? "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0) 60%)"
        : "rgba(0,0,0,0.42)"; // full
  return <AbsoluteFill style={{ background: bg }} />;
};

const EscenaView: React.FC<{ escena: Escena & { resuelto?: VisualResuelto }; marca: Marca; fps: number }> = ({
  escena,
  marca,
  fps,
}) => {
  const dur = Math.round((escena.t_out - escena.t_in) * fps);
  const vis = escena.resuelto ?? { kind: "placeholder", intencion: escena.visual.intencion };
  return (
    <AbsoluteFill>
      <Background vis={vis} marca={marca} durationInFrames={dur} />
      <Scrim modo={escena.scrim ?? "bottom"} />
      {(escena.overlays ?? []).map((ov, i) => {
        const Comp = OVERLAYS[ov.componente];
        return Comp ? <Comp key={i} {...(ov.props ?? {})} marca={marca} /> : null;
      })}
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({ spec, subs, voiceExists, hideRanges }) => {
  const fps = spec.fps;
  const musica = spec.audio.musica;
  return (
    <AbsoluteFill style={{ backgroundColor: spec.marca.colores.fondo }}>
      {spec.escenas.map((escena) => (
        <Sequence
          key={escena.id}
          from={Math.round(escena.t_in * fps)}
          durationInFrames={Math.round((escena.t_out - escena.t_in) * fps)}
        >
          <EscenaView escena={escena} marca={spec.marca} fps={fps} />
        </Sequence>
      ))}

      <Subtitles subs={subs} marca={spec.marca} hideRanges={hideRanges} />

      {voiceExists && <Audio src={staticFile("voice.mp3")} />}
      {musica?.exists && <Audio src={staticFile(musica.src)} volume={musica.volumen} loop />}
    </AbsoluteFill>
  );
};

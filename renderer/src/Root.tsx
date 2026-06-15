import { Composition } from "remotion";
import { Reel } from "./Reel";
import type { ReelProps, Spec } from "./types";
import specJson from "../spec.promo.json";

const spec = specJson as unknown as Spec;

const ASPECT_DIMS: Record<string, { width: number; height: number }> = {
  "9:16": { width: 1080, height: 1920 },
  "4:5": { width: 1080, height: 1350 },
  "1:1": { width: 1080, height: 1080 },
  "16:9": { width: 1920, height: 1080 },
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={Math.round(spec.duracion_seg * spec.fps)}
      fps={spec.fps}
      width={ASPECT_DIMS[spec.aspect]?.width ?? 1080}
      height={ASPECT_DIMS[spec.aspect]?.height ?? 1920}
      defaultProps={{ spec, subs: [], voiceExists: false, hideRanges: [] } as ReelProps}
      calculateMetadata={({ props }) => {
        const s = props.spec;
        const dims = ASPECT_DIMS[s.aspect] ?? { width: 1080, height: 1920 };
        return {
          durationInFrames: Math.round(s.duracion_seg * s.fps),
          fps: s.fps,
          width: dims.width,
          height: dims.height,
        };
      }}
    />
  );
};

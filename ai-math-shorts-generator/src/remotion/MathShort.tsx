import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame
} from "remotion";
import type {Storyboard, VideoScene} from "../core/types";

type Props = {
  storyboard: Storyboard;
};

function sceneStartFrame(storyboard: Storyboard, scene: VideoScene): number {
  const index = storyboard.scenes.findIndex((item) => item.id === scene.id);
  return storyboard.scenes.slice(0, index).reduce((total, item) => total + item.durationSeconds * storyboard.fps, 0);
}

export const MathShort: React.FC<Props> = ({storyboard}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: storyboard.visualIdentity.background}}>
      {storyboard.scenes.map((scene) => {
        const from = sceneStartFrame(storyboard, scene);
        const duration = scene.durationSeconds * storyboard.fps;
        const opacity = interpolate(frame - from, [0, 8, duration - 8, duration], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp"
        });

        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration}>
            <AbsoluteFill style={{opacity}}>
              <OffthreadVideo
                src={staticFile(scene.publicPath)}
                muted
                style={{width: "100%", height: "100%", objectFit: "cover"}}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

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

// Frames of overlap between consecutive chapters. Long form cross-dissolves
// (default 15); shorts set crossfadeFrames: 0 for hard cuts.
const DEFAULT_CROSSFADE = 15;

function chapterStarts(storyboard: Storyboard): number[] {
  const starts: number[] = [];
  let acc = 0;
  for (const scene of storyboard.scenes) {
    starts.push(acc);
    acc += Math.round(scene.durationSeconds * storyboard.fps);
  }
  return starts;
}

export const MathLong: React.FC<Props> = ({storyboard}) => {
  const frame = useCurrentFrame();
  const starts = chapterStarts(storyboard);
  const CROSSFADE = storyboard.crossfadeFrames ?? DEFAULT_CROSSFADE;

  return (
    <AbsoluteFill style={{backgroundColor: storyboard.visualIdentity.background}}>
      {storyboard.scenes.map((scene: VideoScene, index: number) => {
        const isFirst = index === 0;
        const isLast = index === storyboard.scenes.length - 1;
        const nominal = Math.round(scene.durationSeconds * storyboard.fps);

        // Hard cut: no overlap, no fade.
        if (CROSSFADE <= 0) {
          return (
            <Sequence key={scene.id} from={starts[index]} durationInFrames={nominal}>
              <AbsoluteFill>
                <OffthreadVideo
                  src={staticFile(scene.publicPath)}
                  muted
                  style={{width: "100%", height: "100%", objectFit: "cover"}}
                />
              </AbsoluteFill>
            </Sequence>
          );
        }

        // Every non-first chapter starts CROSSFADE frames early and lingers
        // CROSSFADE frames past its clip; the neighbours' fades cover the seam.
        const from = isFirst ? 0 : starts[index] - CROSSFADE;
        const durationInFrames = isLast ? nominal : nominal + CROSSFADE;

        const local = frame - from;
        const fadeIn = interpolate(local, [0, CROSSFADE], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp"
        });
        const fadeOut = isLast
          ? interpolate(local, [nominal - CROSSFADE, nominal], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp"
            })
          : 1;
        const opacity = Math.min(fadeIn, fadeOut);

        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
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

import React from "react";
import {Composition} from "remotion";
import storyboard from "../../generated/storyboard.json";
import {MathLong} from "./MathLong";

const totalFrames = storyboard.scenes.reduce(
  (total: number, scene: {durationSeconds: number}) =>
    total + Math.round(scene.durationSeconds * storyboard.fps),
  0
);

export const Root: React.FC = () => {
  return (
    <Composition
      id="MathLong"
      component={MathLong}
      durationInFrames={totalFrames}
      fps={storyboard.fps}
      width={storyboard.width}
      height={storyboard.height}
      defaultProps={{storyboard}}
    />
  );
};

import React from "react";
import {Composition} from "remotion";
import storyboard from "../../generated/storyboard.json";
import {MathShort} from "./MathShort";

export const Root: React.FC = () => {
  return (
    <Composition
      id="MathShort"
      component={MathShort}
      durationInFrames={storyboard.durationSeconds * storyboard.fps}
      fps={storyboard.fps}
      width={storyboard.width}
      height={storyboard.height}
      defaultProps={{storyboard}}
    />
  );
};

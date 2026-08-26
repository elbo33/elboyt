export type VideoScene = {
  id: string;
  title: string;
  className: string;
  durationSeconds: number;
  purpose: string;
  mathematicalConcept: string;
  objects: string[];
  animation: string;
  camera: string;
  text: string;
  transition: string;
  sourcePath: string;
  renderPath: string;
  publicPath: string;
};

export type Storyboard = {
  topic: string;
  slug: string;
  fps: number;
  width: number;
  height: number;
  durationSeconds: number;
  visualIdentity: {
    background: string;
    foreground: string;
    accent: string;
    secondaryAccent: string;
    font: string;
  };
  scenes: VideoScene[];
};

export type RenderManifest = {
  generatedAt: string;
  topic: string;
  outputVideo: string;
  storyboard: string;
  scenes: VideoScene[];
  previewFrames: string[];
};

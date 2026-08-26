// A chapter is one segment of the repetitive long-form structure.
// Every long-form video is assembled from the same ordered skeleton:
//   intro -> roadmap -> concept -> example (repeated) -> principle -> algebra -> recap -> outro
export type ChapterKind =
  | "intro"
  | "roadmap"
  | "concept"
  | "example"
  | "principle"
  | "algebra"
  | "recap"
  | "outro";

export type VideoScene = {
  id: string;
  title: string;
  className: string;
  durationSeconds: number;
  // Repetitive-structure metadata.
  chapterKind: ChapterKind;
  chapterLabel: string; // e.g. "EXAMPLE 2 / 3", shown as a consistent on-scene tag
  chapterIndex: number; // 1-based position in the running order
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
  format: "longform-16x9";
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
  durationSeconds: number;
  scenes: VideoScene[];
  previewFrames: string[];
};

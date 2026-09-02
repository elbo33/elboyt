// Every ZasPro teaching section (62 of them) gets four videos, in this order:
//   THEORY -> EXERCISES -> COMMON_MISTAKES -> CHALLENGE
// Each episode type has its own fixed, deliberately repetitive scene skeleton.
// "EXPLAINER" covers the two free-form long-form videos that predate the course.
export type EpisodeType =
  | "THEORY"
  | "EXERCISES"
  | "COMMON_MISTAKES"
  | "CHALLENGE"
  | "EXPLAINER";

// THEORY: hook -> intuition -> definition -> why_it_works -> example x3
//         -> matura_connection -> summary
export type TheoryScene =
  | "hook"
  | "intuition"
  | "definition"
  | "why_it_works"
  | "example"
  | "matura_connection"
  | "summary";

// EXERCISES: quick_recall -> exercise x5 -> solution_pattern
export type ExercisesScene = "quick_recall" | "exercise" | "solution_pattern";

// COMMON_MISTAKES: hook -> mistake x5 -> checklist
export type MistakesScene = "hook" | "mistake" | "checklist";

// CHALLENGE: rules -> challenge x3 -> score
export type ChallengeScene = "rules" | "challenge" | "score";

// The free-form skeleton of the two legacy explainer videos. Kept so their
// planners type-check; not used by the ZasPro-course episode types.
export type LegacyExplainerScene =
  | "intro"
  | "roadmap"
  | "concept"
  | "example"
  | "principle"
  | "algebra"
  | "recap"
  | "outro";

export type SceneType =
  | TheoryScene
  | ExercisesScene
  | MistakesScene
  | ChallengeScene
  | LegacyExplainerScene;

export type VideoScene = {
  id: string;
  title: string;
  className: string;
  durationSeconds: number;
  // Repetitive-structure metadata.
  sceneType: SceneType;
  sceneLabel: string; // e.g. "PRZYKŁAD 2 / 3", shown as a consistent on-scene tag
  sceneIndex: number; // 1-based position in the running order
  // Traceability: when a scene stages one approved ZasPro problem, its id
  // (e.g. "g-th-02"). Omitted for scenes that stage no single problem.
  sourceExerciseId?: string;
  // Reuse fields — the ZasPro-course planners populate these from the start so a
  // scene can later be re-cut as a standalone vertical short or a captioned
  // still. Optional so the two legacy explainer planners keep compiling; the
  // long-form renderer does not act on them yet.
  standalone?: boolean; // works with no prior context
  shortHook?: string; // its own opening beat, for an extractable scene
  stillMoment?: string; // short label for the frame that carries the idea alone
  // Word-for-word spoken narration for this scene — the source of truth for
  // script.md, which is generated (not hand-written) from the storyboard once
  // ffprobe has re-measured durations. Describes only what is on screen.
  narration?: string;
  // For a short scene derived from a long-form episode: the long-form scene id
  // it compresses (empty for a short's own hook scene).
  derivedFromScene?: string;
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
  // Which ZasPro teaching section this episode covers, and which of its four
  // videos this is.
  sectionSlug: string;
  episodeType: EpisodeType;
  format: "longform-16x9" | "short-9x16";
  fps: number;
  width: number;
  height: number;
  durationSeconds: number;
  // 0 = hard cuts (shorts). Omitted / >0 = cross-dissolve of that many frames
  // between scenes (long form defaults to 15).
  crossfadeFrames?: number;
  // Set on shorts: which long-form episode and scenes this was re-cut from.
  derivedFrom?: {episode: string; scenes: string[]};
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
  scenePreviewFrames?: string[];
  sceneContactSheet?: string;
};

// A short is a re-render, not a crop. 16:9 frames cannot become 9:16, so what
// carries over from a long-form episode is: each scene's Manim source, its
// content decisions, its beat structure, and its script text — re-staged at
// vertical dimensions with fast pacing and hard cuts.

export type ShortSceneSpec = {
  id: string;
  className: string;
  title: string;
  durationSeconds: number; // estimate; ffprobe re-measures
  narration: string; // word-for-word, compressed from the long-form section
  derivedFromScene?: string; // long-form scene id ("" for the short's own hook)
  py: string; // full Manim scene file body (imports + one LessonScene subclass)
};

export type ShortSpec = {
  slug: string; // library/shorts/<slug>/
  title: string;
  topic: string;
  fromEpisode: string; // long-form episode slug this is cut from
  derivedScenes: string[]; // long-form scene ids this short compresses
  scenes: ShortSceneSpec[]; // scenes[0] is always the retention hook
};

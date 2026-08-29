// The fixed scene-type skeletons for the four episode types. Counts and
// per-band granularity are what vary between episode types; the ORDER and the
// tags never do (uniformity of grammar, not of length).

export type BandType =
  | "hook"
  | "intuition"
  | "definition"
  | "why_it_works"
  | "example"
  | "matura_connection"
  | "summary"
  | "quick_recall"
  | "exercise"
  | "solution_pattern"
  | "mistake"
  | "checklist"
  | "rules"
  | "challenge"
  | "score";

export type Band = {type: BandType; count: number};

// THEORY — target 22-28 min, ~46 scenes.
export const THEORY_SKELETON: Band[] = [
  {type: "hook", count: 2},
  {type: "intuition", count: 4},
  {type: "definition", count: 5},
  {type: "why_it_works", count: 6},
  {type: "example", count: 3}, // each expands to its beat block
  {type: "matura_connection", count: 4},
  {type: "summary", count: 3}
];

export const EXERCISES_SKELETON: Band[] = [
  {type: "quick_recall", count: 4},
  {type: "exercise", count: 5}, // each expands to its beat block
  {type: "solution_pattern", count: 4}
];

export const MISTAKES_SKELETON: Band[] = [
  {type: "hook", count: 2},
  {type: "mistake", count: 5}, // each expands to its beat block
  {type: "checklist", count: 3}
];

export const CHALLENGE_SKELETON: Band[] = [
  {type: "rules", count: 2},
  {type: "challenge", count: 3}, // each expands to its beat block
  {type: "score", count: 3}
];

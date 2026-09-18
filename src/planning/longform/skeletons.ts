// The fixed scene-type skeletons for the four episode types. Counts and
// per-band granularity are what vary between episode types; the ORDER and the
// tags never do (uniformity of grammar, not of length).

export type BandType =
  | "hook"
  // Historical only: already-published longforms may contain these bands in
  // their library storyboards/render sources, but new theory episodes do not.
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

// THEORY — active skeleton from 2026-09-14 onward.
// `intuition` and `why_it_works` are no longer production bands. Their old
// source/storyboard metadata is kept only so previously published videos remain
// understandable and reproducible from their library render folders.
export const THEORY_SKELETON: Band[] = [
  {type: "hook", count: 2},
  {type: "definition", count: 5},
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

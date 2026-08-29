import type {BandType} from "../skeletons";

// One authored (non-worked-example) scene: the section author writes the Manim
// body (an archetype call plus the figure/derivation content — the irreducible
// part). The archetype owns layout, timing and the 16:9 / 9:16 branch.
export type AuthoredScene = {
  band: BandType;
  index: number; // 1-based position within its band
  title: string;
  sceneLabel: string; // top-left tag text, e.g. "DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  3 / 6"
  standalone: boolean;
  stillMoment: string;
  shortHook?: string;
  py: string; // full Manim scene file body (imports + one LessonScene subclass)
};

// One worked example, staged by the theory_example template. `ex` is the dict
// the template consumes; `ex.beats` lists the beats so the planner knows how
// many scenes to emit (single source of truth, shared with Python).
export type ExampleAuthoring = {
  sourceId: string; // ZasPro exercise id, e.g. "g-th-00"
  className: string; // base class name; beats append a suffix
  sceneLabel: string; // "PRZYKŁAD 1 / 3"
  ex: Record<string, unknown> & {beats: string[]};
};

export type SectionAuthoring = {
  slug: string;
  topic: string; // human episode title
  authored: AuthoredScene[]; // hook / intuition / definition / why_it_works / summary
  examples: ExampleAuthoring[]; // THEORY_SUPPORT problems, easy -> hard
};

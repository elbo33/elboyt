// Read-only access to the verified ZasPro curriculum. We read its committed
// YAML; we never write to it, and we never invent content — a missing section
// file is a hard error.
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import {resolveZasproDir} from "../core/config";

export type Concept = {
  name: string;
  description: string;
  explanation: string;
  difficulty: number;
};

export type Formula = {
  name: string;
  latex_raw: string;
  conditions?: string;
  description?: string;
};

export type Method = {
  name: string;
  when_to_use: string;
  steps: string[];
};

export type KnowledgeExample = {
  statement: string;
  worked_solution: string;
  difficulty: number;
};

export type Objective = {statement: string; bloom_level: string};

export type Misconception = {
  name: string;
  incorrect_reasoning: string;
  correct_reasoning: string;
  severity: number;
};

export type SectionKnowledge = {
  section: string;
  name: string;
  scope: string;
  concepts: Concept[];
  formulas: Formula[];
  methods: Method[];
  examples: KnowledgeExample[];
  objectives: Objective[];
  misconceptions: Misconception[];
};

export type ExerciseSlot =
  | "THEORY_SUPPORT"
  | "EXERCISE"
  | "COMMON_MISTAKE"
  | "CHALLENGE";

export type Answer = {
  kind: string;
  value?: number;
  latex?: string;
  truth?: boolean;
  items?: string[];
  parts?: {name: string; answer: Answer}[];
};

export type Exercise = {
  id: string;
  slot: ExerciseSlot;
  ramp_index: number;
  difficulty: number;
  exercise_type: string;
  statement: string;
  statement_latex?: string;
  solution: string;
  solution_steps: string[];
  answer: Answer;
  skills?: string[];
};

export type SectionExercises = {
  section: string;
  name: string;
  exercises: Exercise[];
};

export type Section = {
  slug: string;
  name: string;
  scope: string;
  knowledge: SectionKnowledge;
  exercises: SectionExercises;
};

function readYaml<T>(file: string): T {
  return yaml.load(fs.readFileSync(file, "utf8")) as T;
}

export function loadSection(slug: string): Section {
  const root = resolveZasproDir();
  const knowledgePath = path.join(root, "knowledge", "sections", `${slug}.yaml`);
  const exercisesPath = path.join(root, "exercises", `${slug}.yaml`);
  for (const p of [knowledgePath, exercisesPath]) {
    if (!fs.existsSync(p)) {
      throw new Error(`ZasPro: expected ${p} for section "${slug}" — not found.`);
    }
  }
  const knowledge = readYaml<SectionKnowledge>(knowledgePath);
  const exercises = readYaml<SectionExercises>(exercisesPath);
  return {
    slug,
    name: knowledge.name,
    scope: knowledge.scope,
    knowledge,
    exercises
  };
}

/**
 * Problems for one slot, in the order a video should stage them: by difficulty
 * for the theory-support set, otherwise by ramp_index (the authored ramp).
 */
export function exercisesForSlot(section: Section, slot: ExerciseSlot): Exercise[] {
  const items = section.exercises.exercises.filter((e) => e.slot === slot);
  const byRamp = (a: Exercise, b: Exercise) =>
    a.ramp_index - b.ramp_index || a.difficulty - b.difficulty;
  const byDifficulty = (a: Exercise, b: Exercise) =>
    a.difficulty - b.difficulty || a.ramp_index - b.ramp_index;
  return [...items].sort(slot === "THEORY_SUPPORT" ? byDifficulty : byRamp);
}

/** The "SZUKANE" labels for a problem: the names of its answer parts, or []. */
export function soughtLabels(ex: Exercise): string[] {
  return ex.answer?.parts?.map((p) => p.name) ?? [];
}

/** The final answer as a display string: prefer LaTeX, then a plain value. */
export function answerText(ex: Exercise): string {
  const a = ex.answer;
  if (a?.parts?.length) {
    return a.parts
      .map((p) => {
        const label = p.name.replace(/^czy\s+/i, "").replace(/\?$/, "").trim();
        const sep = p.answer.kind === "BOOLEAN" ? ": " : " = ";
        return `${label}${sep}${answerLeaf(p.answer)}`;
      })
      .join(",   ");
  }
  return answerLeaf(a);
}

function answerLeaf(a: Answer | undefined): string {
  if (!a) return "";
  if (a.latex) return a.latex;
  if (typeof a.value === "number") return String(a.value);
  if (typeof a.truth === "boolean") return a.truth ? "Tak" : "Nie";
  if (a.items?.length) return `(${a.items.join(", ")})`;
  return "";
}

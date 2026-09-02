import type {EpisodeType} from "../../core/library";
import {slugify} from "../../core/slug";
import {
  answerText,
  exercisesForSlot,
  loadSection,
  type Exercise,
  type ExerciseSlot
} from "../zaspro";

export type StillSpec = {
  slug: string;
  tag: string;
  statement: string;
  options: [string, string][];
  answer: string;
  cta: string;
  description: string;
};

const SLOT_BY_TYPE: Record<EpisodeType, ExerciseSlot> = {
  theory: "THEORY_SUPPORT",
  exercises: "EXERCISE",
  mistakes: "COMMON_MISTAKE",
  challenge: "CHALLENGE"
};

const TYPE_LABEL: Record<EpisodeType, string> = {
  theory: "Teoria",
  exercises: "Zadanie",
  mistakes: "Błąd",
  challenge: "Wyzwanie"
};

function cleanText(value: string | undefined, fallback = ""): string {
  return (value ?? fallback).replace(/\s+/g, " ").replace(/[—–]/g, ",").trim();
}

function shortAnswer(exercise: Exercise): string {
  const answer = cleanText(answerText(exercise));
  if (!answer) return "zobacz rozwiązanie";
  return answer.length > 34 ? `${answer.slice(0, 31)}...` : answer;
}

function distractors(correct: string): string[] {
  if (/^-?\d+([,.]\d+)?$/.test(correct)) {
    const n = Number(correct.replace(",", "."));
    if (Number.isFinite(n)) {
      return [n + 1, n - 1, -n].map((value) => String(value).replace(".", ","));
    }
  }
  return ["brak założenia", "odwrotny znak", "inny przedział"];
}

function cardFor(sectionSlug: string, type: EpisodeType, exercise: Exercise, index: number): StillSpec {
  const correct = shortAnswer(exercise);
  const wrong = distractors(correct).filter((value) => value !== correct).slice(0, 3);
  const values = [correct, ...wrong];
  while (values.length < 4) values.push(`wariant ${values.length + 1}`);
  const labels = ["A", "B", "C", "D"] as const;
  const correctIndex = (index - 1) % 4;
  const ordered = values.slice(0, 4);
  const [right] = ordered.splice(0, 1);
  ordered.splice(correctIndex, 0, right);

  return {
    slug: slugify(`${sectionSlug}-${type}-quiz-${index}`),
    tag: `${TYPE_LABEL[type]} · ${sectionSlug}`,
    statement: cleanText(exercise.statement),
    options: labels.map((label, i) => [label, ordered[i]]),
    answer: labels[correctIndex],
    cta: "Napisz odpowiedź w komentarzu.",
    description:
      `${TYPE_LABEL[type]} z działu ${sectionSlug}. ` +
      "Spróbuj rozwiązać przed sprawdzeniem odpowiedzi i zapisz pierwszy krok."
  };
}

export function buildGenericStillSpecs(sectionSlug: string, type: EpisodeType): StillSpec[] {
  const section = loadSection(sectionSlug);
  const exercises = exercisesForSlot(section, SLOT_BY_TYPE[type]).slice(0, 4);
  if (exercises.length === 0) {
    throw new Error(`No ${SLOT_BY_TYPE[type]} exercises for generic stills in ${sectionSlug}.`);
  }
  return exercises.map((exercise, index) => cardFor(sectionSlug, type, exercise, index + 1));
}

import type {SectionAuthoring} from "./types";

// THEORY authoring for `ciag-arytmetyczny`.
//
// Status: WHY_IT_WORKS fully authored (the four-scene column build + two
// symbolic scenes). HOOK / INTUITION / DEFINITION / SUMMARY and examples 2-3
// are authored in a later pass; the planner emits only what is present here.

const WHY_HEADER = String.raw`from manim import *
from support.style import LessonScene
from support.archetypes import stage_derivation
`;

const FWD = ['"2"', '"5"', '"8"', '"11"', '"14"'].join(", ");
const REV = ['"14"', '"11"', '"8"', '"5"', '"2"'].join(", ");
const SUMS = Array(5).fill('"16"').join(", ");

function whyScene(index: number, body: string): string {
  return (
    WHY_HEADER +
    String.raw`

class WhyItWorks${index}(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  ${index} / 6")
${body}
`
  );
}

const whyBodies: {label: string; still: string; short?: string; py: string}[] = [
  {
    label: "the concrete sum to add",
    still: "S₅ = 2 + 5 + 8 + 11 + 14, laid out as a row",
    short: "Dodaj 2 + 5 + 8 + 11 + 14 w pięć sekund.",
    py: whyScene(
      1,
      String.raw`        stage_derivation(self, columns={
            "rows": [("od przodu", [${FWD}])],
            "static_rows": 0,
        }, caption="Bierzemy sumę pięciu wyrazów: 2, 5, 8, 11, 14.")`
    )
  },
  {
    label: "the same sum written backwards",
    still: "forwards row over backwards row, column-aligned",
    py: whyScene(
      2,
      String.raw`        stage_derivation(self, columns={
            "rows": [("od przodu", [${FWD}]), ("od tyłu", [${REV}])],
            "static_rows": 1,
        }, caption="Zapisujemy tę samą sumę jeszcze raz — od końca.")`
    )
  },
  {
    label: "columns collapse to a constant",
    still: "every column sums to 16",
    py: whyScene(
      3,
      String.raw`        stage_derivation(self, columns={
            "rows": [("od przodu", [${FWD}]), ("od tyłu", [${REV}]), ("suma", [${SUMS}])],
            "static_rows": 2,
        }, caption="Dodajemy kolumnami: każda para daje 16.")`
    )
  },
  {
    label: "n equal pairs -> 2 S_n = n (a_1 + a_n)",
    still: "the boxed identity 2 S_n = n (a_1 + a_n)",
    short: "Cała suma z jednego triku: dodaj ją od przodu i od tyłu.",
    py: whyScene(
      4,
      String.raw`        stage_derivation(self, columns={
            "rows": [("od przodu", [${FWD}]), ("od tyłu", [${REV}]), ("suma", [${SUMS}])],
            "static_rows": 3,
            "combine": r"2\,S_n = n\,(a_1 + a_n)",
        }, caption="n par, każda równa: pierwszy + ostatni wyraz. Tutaj: 2·S₅ = 5·16 = 80.")`
    )
  },
  {
    label: "divide by two",
    still: "S_n = n (a_1 + a_n) / 2",
    py: whyScene(
      5,
      String.raw`        stage_derivation(self, symbolic=[
            r"2\,S_n = n\,(a_1 + a_n)",
            r"S_n = \dfrac{n\,(a_1 + a_n)}{2}",
        ], caption="Dzielimy obie strony przez 2 — gotowy wzór na sumę.")`
    )
  },
  {
    label: "the a_1, r form",
    still: "S_n = (2 a_1 + (n-1) r) / 2 · n",
    py: whyScene(
      6,
      String.raw`        stage_derivation(self, symbolic=[
            r"S_n = \dfrac{a_1 + a_n}{2}\cdot n",
            r"a_n = a_1 + (n-1)\,r",
            r"S_n = \dfrac{2a_1 + (n-1)\,r}{2}\cdot n",
        ], caption="Nie znasz ostatniego wyrazu? Wstaw wzór na n-ty wyraz.")`
    )
  }
];

// --- example 1: ZasPro g-th-00 (a_1 = 7, r = -4, find a_10) ---------------
const gTh00Ex = {
  label: "PRZYKŁAD 1 / 3",
  source_id: "g-th-00",
  beats: [
    "present",
    "restate",
    "plan",
    "substitute",
    "compute-1",
    "compute-2",
    "compute-3",
    "result",
    "check",
    "insight"
  ],
  statement:
    "Ciąg arytmetyczny (a_n) jest określony dla każdej liczby naturalnej " +
    "n ≥ 1. W tym ciągu a₁ = 7, a różnica r = −4. Oblicz dziesiąty wyraz " +
    "tego ciągu.",
  highlights: ["a₁ = 7", "r = −4", "dziesiąty wyraz"],
  sought: ["a_{10}"],
  plan_formula: "a_{n} = a_{1} + (n-1)\\cdot r",
  plan_note: "Znamy pierwszy wyraz i różnicę — wystarczy wzór na n-ty wyraz.",
  sub_filled: "a_{10} = 7 + (10-1)\\cdot(-4)",
  sub_note: "Wstawiamy a₁ = 7, r = −4 oraz n = 10 w miejsce liter.",
  computes: [
    {
      kind: "arith",
      line: "a_{10} = 7 + 9\\cdot(-4)",
      note: "Najpierw nawias: 10 − 1 = 9 kroków."
    },
    {
      kind: "mul_repeat",
      args: [9, -4],
      line: "a_{10} = 7 + (-36)",
      note: "9 · (−4): dodajemy −4 dziewięć razy."
    },
    {
      kind: "add_signed",
      args: [7, -36],
      line: "a_{10} = -29",
      note: "7 + (−36): ruszamy w lewo, przez zero."
    }
  ],
  answer_tex: "a_{10} = -29",
  answer_sentence: "Dziesiąty wyraz ciągu jest równy −29.",
  check: {
    kind: "list",
    terms: [7, 3, -1, -5, -9, -13, -17, -21, -25, -29],
    note: "Dziesiąty wypisany wyraz to −29 — zgadza się."
  },
  insight:
    "Do n-tego wyrazu dochodzimy w n − 1 krokach po r — stąd nawias (n − 1), nie n.",
  include_insight: true
};

export const ciagArytmetyczny: SectionAuthoring = {
  slug: "ciag-arytmetyczny",
  topic: "Ciąg arytmetyczny: n-ty wyraz i suma",
  authored: whyBodies.map((w, i) => ({
    band: "why_it_works" as const,
    index: i + 1,
    title: `Dlaczego działa wzór na sumę — ${w.label}`,
    sceneLabel: `DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  ${i + 1} / 6`,
    standalone: i === 0 || i === 3,
    stillMoment: w.still,
    shortHook: w.short,
    py: w.py
  })),
  examples: [
    {
      sourceId: "g-th-00",
      className: "Example1",
      sceneLabel: "PRZYKŁAD 1 / 3",
      ex: gTh00Ex
    }
  ]
};

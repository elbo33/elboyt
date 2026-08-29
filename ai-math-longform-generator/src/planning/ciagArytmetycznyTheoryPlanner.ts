import path from "node:path";
import {FPS, HEIGHT, SCENE_RENDER_DIR, SCENE_SOURCE_DIR, WIDTH} from "../core/config";
import {slugify} from "../core/slug";
import type {SceneType, Storyboard, VideoScene} from "../core/types";
import {prettifyMath} from "./prettifyMath";
import {
  answerText,
  exercisesForSlot,
  loadSection,
  soughtLabels,
  type Exercise
} from "./zaspro";

// ---------------------------------------------------------------------------
// THEORY episode for the ZasPro section `ciag-arytmetyczny`
// ("Ciąg arytmetyczny: n-ty wyraz i suma").
//
// Fixed THEORY skeleton (same for all 62 sections):
//   hook -> intuition -> definition -> why_it_works -> example x3
//   -> matura_connection -> summary
//
// The three EXAMPLE scenes are one call each to build_theory_example, staged
// from the section's approved THEORY_SUPPORT problems. The other six scenes are
// authored Manim, same house visual language. On-screen language: Polish.
// ---------------------------------------------------------------------------

const SECTION_SLUG = "ciag-arytmetyczny";

const COMMON_IMPORTS = String.raw`from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
from support.template import build_theory_example
import numpy as np
`;

type ScenePlan = Omit<
  VideoScene,
  "sourcePath" | "renderPath" | "publicPath" | "sceneIndex"
> & {code: string};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function pyList(items: string[]): string {
  return `[${items.map((s) => JSON.stringify(s)).join(", ")}]`;
}

// --- EXAMPLE scenes -------------------------------------------------------

// The only per-problem authoring: a one-line takeaway and the exact data
// tokens to tint in the statement. Each highlight is asserted to be a verbatim
// substring of the prettified statement, so an authoring slip fails the build
// instead of shipping a confidently-wrong rail.
const EXAMPLE_EXTRAS: Record<
  string,
  {insight: string; highlights: string[]; sought?: string[]}
> = {
  "g-th-00": {
    insight:
      "Do n-tego wyrazu dochodzimy w n − 1 krokach po r — dlatego we wzorze jest nawias (n − 1), a nie n.",
    highlights: ["a₁ = 7", "r = -4", "dziesiąty wyraz"],
    sought: ["a₁₀"]
  },
  "g-th-01": {
    insight:
      "Różnicę liczymy zawsze jako następny minus poprzedni; znak r od razu mówi, czy ciąg rośnie, czy maleje.",
    highlights: ["13, 9, 5, 1, -3", "różnicę r", "malejący"]
  },
  "g-th-02": {
    insight:
      "Znając pierwszy i ostatni wyraz, sumę liczymy jednym wzorem: ich średnia razy liczba wyrazów.",
    highlights: ["a₁ = 3", "a₁₂ = 36", "sumę dwunastu"],
    sought: ["S₁₂"]
  }
};

function assertHighlights(id: string, prettyStatement: string, hs: string[]): void {
  for (const h of hs) {
    if (!prettyStatement.includes(h)) {
      throw new Error(
        `ciagArytmetyczny THEORY planner: highlight ${JSON.stringify(h)} for ${id} ` +
          `is not a verbatim substring of the prettified statement:\n  ${prettyStatement}`
      );
    }
  }
}

function exampleChapter(orderIndex: number, exampleNumber: number, ex: Exercise): ScenePlan {
  const total = 3;
  const NN = pad2(orderIndex);
  const className = `Chapter${NN}Example${exampleNumber}`;
  const label = `PRZYKŁAD ${exampleNumber} / ${total}`;

  const stmt = prettifyMath(ex.statement);
  const steps = ex.solution_steps.map(prettifyMath);
  const answerTex = prettifyMath(answerText(ex));

  const extras = EXAMPLE_EXTRAS[ex.id];
  if (!extras) {
    throw new Error(`ciagArytmetyczny THEORY planner: no authored extras for ${ex.id}`);
  }
  assertHighlights(ex.id, stmt, extras.highlights);

  const sought = extras.sought ?? soughtLabels(ex);
  const soughtForPy = sought.length > 0 ? sought : [ex.exercise_type];

  const code =
    COMMON_IMPORTS +
    String.raw`

class ${className}(LongScene):
    chapter_tag_text = ${JSON.stringify(label)}

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        build_theory_example(
            self,
            index=${exampleNumber},
            total=${total},
            statement=${JSON.stringify(stmt)},
            steps=${pyList(steps)},
            sought=${pyList(soughtForPy)},
            answer_tex=${JSON.stringify(answerTex)},
            insight=${JSON.stringify(extras.insight)},
            highlights=${pyList(extras.highlights)},
        )
        self.wait(2.0)
`;

  return {
    code,
    id: `chapter-${NN}-example-${exampleNumber}`,
    title: `Przykład ${exampleNumber} — ${ex.exercise_type}`,
    className,
    durationSeconds: 40,
    sceneType: "example" as SceneType,
    sceneLabel: label,
    sourceExerciseId: ex.id,
    standalone: true,
    stillMoment: "numbered steps with the boxed final answer",
    purpose: `Worked THEORY_SUPPORT case ${exampleNumber} of ${total} (ZasPro ${ex.id}), identical template.`,
    mathematicalConcept: prettifyMath(ex.statement),
    objects: ["statement with tinted data", "SZUKANE chip", "numbered steps", "answer box", "insight caption"],
    animation:
      "Shared THEORY example template: statement in, data tinted, SZUKANE chip, steps cascade one by one, answer boxed, insight caption.",
    camera: "Static landscape frame; statement top-left, steps below, answer box lower-centre, SZUKANE chip right.",
    text: answerTex,
    transition: "Cut to the next example, same layout."
  };
}

// --- Authored (non-example) scenes -------------------------------------------

const hook: ScenePlan = {
  id: "chapter-01-hook",
  title: "Wprowadzenie",
  className: "Chapter01Hook",
  durationSeconds: 30,
  sceneType: "hook" as SceneType,
  sceneLabel: "WPROWADZENIE",
  standalone: true,
  shortHook: "Którym wyrazem ciągu 3, 7, 11, 15, … jest liczba 403?",
  stillMoment: "tile ladder 3 · 7 · 11 · 15 with +4 arcs and the two questions",
  purpose: "Open on a concrete arithmetic-sequence question, not filler.",
  mathematicalConcept:
    "The sequence 3, 7, 11, 15, … rises by a constant 4; questions about a distant term and a long sum motivate the formulas.",
  objects: ["tile ladder of values", "+4 arcs", "two questions"],
  animation: "Tiles land left to right, +4 arcs pop between them, then the two questions fade in.",
  camera: "Static landscape frame.",
  text: "JEDEN KROK, CIĄGLE TEN SAM",
  transition: "Cut to the intuition.",
  code:
    COMMON_IMPORTS +
    String.raw`

class Chapter01Hook(LongScene):
    chapter_tag_text = "WPROWADZENIE"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JEDEN KROK, CIĄGLE TEN SAM", 0.6)

        vals = [3, 7, 11, 15, 19]
        tiles = VGroup()
        for v in vals:
            box = RoundedRectangle(corner_radius=0.12, width=1.25, height=1.05,
                                   stroke_color=MUTED, stroke_width=2,
                                   fill_color=ACCENT, fill_opacity=0.16)
            num = Text(str(v), font=FONT, weight=BOLD, color=FOREGROUND).scale(0.62)
            num.move_to(box.get_center())
            tiles.add(VGroup(box, num))
        tiles.arrange(RIGHT, buff=0.95).move_to([0, 0.7, 0])
        dots = Text("…", font=FONT, color=MUTED).scale(0.8).next_to(tiles, RIGHT, buff=0.4)

        arcs = VGroup()
        for i in range(len(vals) - 1):
            a = CurvedArrow(tiles[i][0].get_top() + 0.06 * UP,
                            tiles[i + 1][0].get_top() + 0.06 * UP,
                            angle=-TAU / 6, color=SECONDARY, stroke_width=3)
            lbl = small_label("+4", 0.36, SECONDARY).next_to(a, UP, buff=0.04)
            arcs.add(VGroup(a, lbl))

        q1 = body("Którym wyrazem tego ciągu jest liczba 403?", 0.46, FOREGROUND)
        q2 = body("Ile wynosi suma stu początkowych wyrazów?", 0.46, FOREGROUND)
        qs = VGroup(q1, q2).arrange(DOWN, aligned_edge=LEFT, buff=0.42).move_to([0, -2.2, 0])

        self.play(Write(title), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(t, shift=0.25 * UP) for t in tiles], lag_ratio=0.35), run_time=2.6)
        self.play(FadeIn(dots), run_time=0.4)
        self.play(LaggedStart(*[FadeIn(a) for a in arcs], lag_ratio=0.35), run_time=2.2)
        self.wait(2.2)
        self.play(FadeIn(q1, shift=0.2 * UP), run_time=0.9)
        self.wait(3.0)
        self.play(FadeIn(q2, shift=0.2 * UP), run_time=0.9)
        self.wait(2.8)
        self.play(Indicate(tiles, color=ACCENT, scale_factor=1.03), run_time=1.4)
        self.wait(6.5)
`
};

const intuition: ScenePlan = {
  id: "chapter-02-intuition",
  title: "Intuicja",
  className: "Chapter02Intuition",
  durationSeconds: 34,
  sceneType: "intuition" as SceneType,
  sceneLabel: "INTUICJA",
  standalone: true,
  stillMoment: "number line with equal +r hops and the 'n − 1 skoków' brace",
  purpose: "Carry the idea visually before any notation: equal jumps along a line.",
  mathematicalConcept:
    "Each term is the previous one plus the same r; reaching aₙ from a₁ takes n − 1 jumps.",
  objects: ["number line", "dots a₁…a₅", "+r hop arcs", "n − 1 brace"],
  animation: "Dots and +r hops appear one at a time along the line; a brace counts the n − 1 jumps.",
  camera: "Static landscape frame.",
  text: "RÓWNE SKOKI PO OSI",
  transition: "Cut to the definition.",
  code:
    COMMON_IMPORTS +
    String.raw`

class Chapter02Intuition(LongScene):
    chapter_tag_text = "INTUICJA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("RÓWNE SKOKI PO OSI", 0.6)

        axis = NumberLine(x_range=[0, 24, 4], length=11.0, include_numbers=False,
                          include_ticks=False, color=MUTED)
        axis.move_to([0, -0.4, 0])
        a1, r = 4, 4
        pts = [a1 + i * r for i in range(5)]
        dots = VGroup(*[Dot(axis.n2p(p), radius=0.1, color=ACCENT) for p in pts])
        labels = VGroup(*[
            mtex(rf"a_{{{i + 1}}}", 0.5, FOREGROUND).next_to(axis.n2p(p), DOWN, buff=0.32)
            for i, p in enumerate(pts)
        ])
        hops = VGroup()
        for i in range(4):
            arc = CurvedArrow(axis.n2p(pts[i]) + 0.12 * UP, axis.n2p(pts[i + 1]) + 0.12 * UP,
                              angle=-TAU / 7, color=SECONDARY, stroke_width=3, tip_length=0.18)
            lbl = small_label("+ r", 0.38, SECONDARY).next_to(arc, UP, buff=0.06)
            hops.add(VGroup(arc, lbl))

        note = caption("Kolejny wyraz to poprzedni plus ta sama liczba r. Od pierwszego do n-tego wyrazu jest n − 1 takich skoków.")

        self.play(Write(title), run_time=1.3)
        self.play(Create(axis), run_time=1.2)
        self.play(FadeIn(dots[0], scale=0.5), FadeIn(labels[0]), run_time=0.7)
        for i in range(4):
            self.play(FadeIn(hops[i][0]), FadeIn(hops[i][1]), run_time=0.8)
            self.play(FadeIn(dots[i + 1], scale=0.5), FadeIn(labels[i + 1]), run_time=0.6)
            self.wait(1.0)
        self.wait(1.6)
        brace = Brace(VGroup(*hops), UP, color=MUTED).shift(0.15 * UP)
        blab = small_label("n − 1 skoków   (tutaj 4)", 0.38, MUTED).next_to(brace, UP, buff=0.12)
        self.play(GrowFromCenter(brace), FadeIn(blab), run_time=1.0)
        self.wait(3.0)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(6.5)
`
};

const definition: ScenePlan = {
  id: "chapter-03-definition",
  title: "Definicja",
  className: "Chapter03Definition",
  durationSeconds: 38,
  sceneType: "definition" as SceneType,
  sceneLabel: "DEFINICJA",
  standalone: true,
  stillMoment: "two formula cards: r = aₙ₊₁ − aₙ and aₙ = a₁ + (n − 1)r",
  purpose: "Introduce the formal statement and notation.",
  mathematicalConcept:
    "r is the constant difference aₙ₊₁ − aₙ; the nth term is a₁ + (n − 1)r, a linear function of n.",
  objects: ["difference card", "nth-term card", "(n − 1) annotation", "numeric strip"],
  animation: "Each formula card writes on; the (n − 1) factor is arrowed as 'liczba skoków'; a numeric strip checks a₁₀ = 40.",
  camera: "Static landscape frame.",
  text: "aₙ = a₁ + (n − 1)·r",
  transition: "Cut to why the sum formula works.",
  code:
    COMMON_IMPORTS +
    String.raw`

class Chapter03Definition(LongScene):
    chapter_tag_text = "DEFINICJA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("DWA WZORY, KTÓRE WYSTARCZĄ", 0.58)

        card1 = mtex(r"r \;=\; a_{n+1} - a_{n}", 0.8, ACCENT).move_to([0, 1.9, 0])
        c1n = small_label("różnica: następny wyraz minus poprzedni", 0.34, MUTED).next_to(card1, DOWN, buff=0.25)

        card2 = MathTex(r"a_{n}", r"=", r"a_{1}", r"+", r"(n-1)", r"\,r", color=SECONDARY).scale(0.85)
        card2.move_to([0, 0.2, 0])
        nm1 = card2[4]
        nbox = SurroundingRectangle(nm1, color=ACCENT, buff=0.12, corner_radius=0.08)
        nlab = small_label("to liczba skoków", 0.34, ACCENT).next_to(nbox, DOWN, buff=0.25)
        c2n = small_label("n-ty wyraz: start a₁, potem n − 1 kroków po r", 0.34, MUTED)
        c2n.next_to(card2, UP, buff=0.35)

        strip = mtex(r"a_{1}=4,\ r=4:\quad 4,\ 8,\ 12,\ 16,\ 20,\ \dots\qquad a_{10}=4+9\cdot 4=40",
                     0.5, FOREGROUND).move_to([0, -2.1, 0])
        sbox = SurroundingRectangle(strip[0][-3:], color=SECONDARY, buff=0.12, corner_radius=0.08)

        self.play(Write(title), run_time=1.4)
        self.play(Write(card1), run_time=1.3)
        self.play(FadeIn(c1n, shift=0.15 * UP), run_time=0.7)
        self.wait(3.0)
        self.play(FadeIn(c2n, shift=0.15 * DOWN), Write(card2), run_time=1.6)
        self.wait(1.6)
        self.play(Create(nbox), FadeIn(nlab, shift=0.15 * UP), run_time=1.0)
        self.wait(3.0)
        self.play(FadeIn(strip, shift=0.2 * UP), run_time=1.0)
        self.wait(1.4)
        self.play(Create(sbox), run_time=1.0)
        self.wait(7.5)
`
};

const whyItWorks: ScenePlan = {
  id: "chapter-04-why-it-works",
  title: "Dlaczego wzór na sumę działa",
  className: "Chapter04WhyItWorks",
  durationSeconds: 46,
  sceneType: "why_it_works" as SceneType,
  sceneLabel: "DLACZEGO WZÓR NA SUMĘ DZIAŁA",
  standalone: true,
  shortHook: "Dlaczego suma ciągu arytmetycznego to n razy (a₁ + aₙ), podzielone przez 2?",
  stillMoment: "sum written forwards over backwards, n columns each equal to a₁ + aₙ",
  purpose: "Derive the sum formula, the way Gauss did.",
  mathematicalConcept:
    "Write the sum forwards and backwards; each of the n columns sums to a₁ + aₙ, so 2Sₙ = n(a₁ + aₙ).",
  objects: ["forwards row", "backwards row", "column sums", "n-pairs brace", "2Sₙ = n(a₁ + aₙ)"],
  animation: "The backwards row slides under the forwards row; each column collapses to the same value; the identity lands.",
  camera: "Static landscape frame.",
  text: "2·Sₙ = n·(a₁ + aₙ)",
  transition: "Cut to Example 1.",
  code:
    COMMON_IMPORTS +
    String.raw`

class Chapter04WhyItWorks(LongScene):
    chapter_tag_text = "DLACZEGO WZÓR NA SUMĘ DZIAŁA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("SUMA OD PRZODU I OD TYŁU", 0.58)

        vals = [2, 5, 8, 11, 14]
        rev = list(reversed(vals))
        top = VGroup(*[mtex(str(v), 0.62, FOREGROUND) for v in vals]).arrange(RIGHT, buff=1.2)
        top.move_to([0.7, 1.7, 0])
        bot = VGroup(*[mtex(str(v), 0.62, ACCENT) for v in rev]).arrange(RIGHT, buff=1.2)
        bot.move_to([0.7, 0.55, 0])
        for i in range(5):
            bot[i].set_x(top[i].get_x())

        s_lbl = small_label("od przodu", 0.34, MUTED).next_to(top, LEFT, buff=0.7)
        s_lbl2 = small_label("od tyłu", 0.34, ACCENT).next_to(bot, LEFT, buff=0.7)
        s_lbl2.set_x(s_lbl.get_x())

        rule = Line([top.get_left()[0] - 0.4, -0.05, 0], [top.get_right()[0] + 0.4, -0.05, 0], color=MUTED)
        sums = VGroup(*[mtex("16", 0.62, SECONDARY).move_to([top[i].get_x(), -0.8, 0]) for i in range(5)])
        brace = Brace(sums, DOWN, color=MUTED)
        blab = small_label("n identycznych par — każda równa: pierwszy + ostatni wyraz", 0.36, MUTED)
        blab.next_to(brace, DOWN, buff=0.16)

        eq = mtex(r"2\,S_n = n\,(a_1 + a_n)\;\Rightarrow\; S_n = \frac{n\,(a_1 + a_n)}{2}",
                  0.56, SECONDARY).move_to([0, -2.35, 0])
        num = caption("Tutaj: 2·S₅ = 5·16 = 80, więc S₅ = 40.")

        self.play(Write(title), run_time=1.4)
        self.play(FadeIn(top, shift=0.2 * UP), FadeIn(s_lbl), run_time=1.1)
        self.wait(1.8)
        self.play(FadeIn(bot, shift=0.2 * UP), FadeIn(s_lbl2), run_time=1.1)
        self.wait(2.2)
        self.play(Create(rule), run_time=0.6)
        self.play(LaggedStart(*[TransformFromCopy(VGroup(top[i], bot[i]), sums[i]) for i in range(5)],
                              lag_ratio=0.3), run_time=3.4)
        self.wait(2.0)
        self.play(GrowFromCenter(brace), FadeIn(blab), run_time=1.0)
        self.wait(3.0)
        self.play(Write(eq), run_time=1.8)
        self.play(Circumscribe(eq, color=ACCENT), run_time=1.5)
        self.wait(2.2)
        self.play(FadeIn(num, shift=0.2 * UP), run_time=0.9)
        self.wait(7.0)
`
};

const maturaConnection: ScenePlan = {
  id: "chapter-08-matura-connection",
  title: "Na maturze",
  className: "Chapter08MaturaConnection",
  durationSeconds: 40,
  sceneType: "matura_connection" as SceneType,
  sceneLabel: "NA MATURZE",
  standalone: false,
  stillMoment: "the three-line solve ending in S₁₅ = 330 boxed",
  purpose: "Show how the section appears on the exam.",
  mathematicalConcept:
    "Two given terms fix r and a₁ via aₙ = aₖ + (n − k)r; then the sum formula gives S₁₅ = 330.",
  objects: ["task box", "three solve lines", "S₁₅ box"],
  animation: "The task appears, then r, then a₁, then S₁₅, boxed.",
  camera: "Static landscape frame.",
  text: "a₃ = 7, a₈ = 22 → r = 3, a₁ = 1, S₁₅ = 330",
  transition: "Cut to the summary.",
  code:
    COMMON_IMPORTS +
    String.raw`

class Chapter08MaturaConnection(LongScene):
    chapter_tag_text = "NA MATURZE"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JAK TO WYGLĄDA W ARKUSZU", 0.58)

        task = body("W ciągu arytmetycznym a₃ = 7 oraz a₈ = 22.\nWyznacz r, a₁ oraz sumę S₁₅.",
                    0.44, FOREGROUND)
        task.move_to([0, 2.0, 0])
        tbox = SurroundingRectangle(task, color=MUTED, buff=0.3, corner_radius=0.1)
        tbox.set_stroke(opacity=0.6)

        l1 = mtex(r"a_8 - a_3 = (8-3)\,r \;\Rightarrow\; 22 - 7 = 5r \;\Rightarrow\; r = 3", 0.5, FOREGROUND)
        l2 = mtex(r"a_3 = a_1 + 2r \;\Rightarrow\; 7 = a_1 + 6 \;\Rightarrow\; a_1 = 1", 0.5, FOREGROUND)
        l3 = mtex(r"S_{15} = \frac{2a_1 + 14r}{2}\cdot 15 = \frac{2 + 42}{2}\cdot 15 = 330", 0.5, SECONDARY)
        lines = VGroup(l1, l2, l3).arrange(DOWN, aligned_edge=LEFT, buff=0.55).move_to([0, -0.7, 0])
        l3box = SurroundingRectangle(l3, color=SECONDARY, buff=0.2, corner_radius=0.1)

        note = caption("Te same dwa wzory — na wyraz i na sumę — wracają w niemal każdym arkuszu.")

        self.play(Write(title), run_time=1.4)
        self.play(FadeIn(task, shift=0.2 * UP), Create(tbox), run_time=1.1)
        self.wait(3.0)
        self.play(FadeIn(l1, shift=0.2 * RIGHT), run_time=0.9)
        self.wait(3.2)
        self.play(FadeIn(l2, shift=0.2 * RIGHT), run_time=0.9)
        self.wait(3.2)
        self.play(FadeIn(l3, shift=0.2 * RIGHT), run_time=0.9)
        self.play(Create(l3box), run_time=0.8)
        self.wait(2.6)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.9)
        self.wait(6.5)
`
};

const summary: ScenePlan = {
  id: "chapter-09-summary",
  title: "Podsumowanie",
  className: "Chapter09Summary",
  durationSeconds: 26,
  sceneType: "summary" as SceneType,
  sceneLabel: "PODSUMOWANIE",
  standalone: true,
  stillMoment: "hops + folded pair + the two formulas on one card",
  purpose: "Leave a compact visual mental model.",
  mathematicalConcept:
    "Constant step r; term = start plus n − 1 steps; sum = n pairs of a₁ + aₙ over 2.",
  objects: ["mini hop line", "folded pair", "two formula lines"],
  animation: "The hop line and the folded pair rebuild small; the two formulas settle beneath.",
  camera: "Quiet final landscape frame.",
  text: "STAŁY KROK r",
  transition: "End of the THEORY episode.",
  code:
    COMMON_IMPORTS +
    String.raw`

class Chapter09Summary(LongScene):
    chapter_tag_text = "PODSUMOWANIE"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("CO ZAPAMIĘTAĆ", 0.6)

        axis = NumberLine(x_range=[0, 12, 4], length=4.6, include_numbers=False,
                          include_ticks=False, color=MUTED)
        axis.move_to([-3.4, 1.3, 0])
        d = VGroup(*[Dot(axis.n2p(4 * i), radius=0.08, color=ACCENT) for i in range(4)])
        hop_lbls = VGroup(*[small_label("+r", 0.3, SECONDARY).next_to(axis.n2p(4 * i + 2), UP, buff=0.15)
                            for i in range(3)])
        f_term = mtex(r"a_n = a_1 + (n-1)\,r", 0.58, SECONDARY)
        f_term.next_to(axis, DOWN, buff=0.9)

        top = VGroup(*[mtex(str(v), 0.5, FOREGROUND) for v in [2, 5, 8]]).arrange(RIGHT, buff=0.7)
        bot = VGroup(*[mtex(str(v), 0.5, ACCENT) for v in [8, 5, 2]]).arrange(RIGHT, buff=0.7)
        VGroup(top, bot).arrange(DOWN, buff=0.28)
        pline = Line(LEFT, RIGHT, color=MUTED).match_width(top).next_to(bot, DOWN, buff=0.16)
        sums = mtex(r"10 \quad 10 \quad 10", 0.44, SECONDARY).next_to(pline, DOWN, buff=0.16)
        pair = VGroup(top, bot, pline, sums).move_to([3.4, 1.35, 0])
        f_sum = mtex(r"S_n = \frac{n\,(a_1 + a_n)}{2}", 0.58, SECONDARY)
        f_sum.next_to(pair, DOWN, buff=0.7).set_x(3.4)

        tag = caption("Stały skok r. Wyraz: start plus n − 1 skoków. Suma: n par (pierwszy + ostatni), przez 2.")

        self.play(Write(title), run_time=1.3)
        self.play(Create(axis), LaggedStart(*[FadeIn(x, scale=0.5) for x in d], lag_ratio=0.2),
                  FadeIn(hop_lbls), run_time=1.6)
        self.play(Write(f_term), run_time=1.2)
        self.wait(2.0)
        self.play(FadeIn(VGroup(top, bot), shift=0.2 * UP), run_time=1.1)
        self.play(Create(pline), FadeIn(sums), run_time=0.8)
        self.wait(1.2)
        self.play(Write(f_sum), run_time=1.2)
        self.wait(2.2)
        self.play(FadeIn(tag, shift=0.2 * UP), run_time=0.9)
        self.wait(6.0)
`
};

// --- assembly --------------------------------------------------------------

function buildScenePlans(): ScenePlan[] {
  const section = loadSection(SECTION_SLUG);
  const theorySupport = exercisesForSlot(section, "THEORY_SUPPORT");
  if (theorySupport.length < 3) {
    throw new Error(
      `ciagArytmetyczny THEORY planner: expected 3 THEORY_SUPPORT problems, got ${theorySupport.length}.`
    );
  }
  const [e1, e2, e3] = theorySupport;
  return [
    hook,
    intuition,
    definition,
    whyItWorks,
    exampleChapter(5, 1, e1),
    exampleChapter(6, 2, e2),
    exampleChapter(7, 3, e3),
    maturaConnection,
    summary
  ];
}

export function createStoryboard(topic: string): Storyboard {
  const slug = slugify(topic);
  const scenePlans = buildScenePlans();
  const scenes: VideoScene[] = scenePlans.map(({code: _code, ...scene}, index) => ({
    ...scene,
    sceneIndex: index + 1,
    sourcePath: path.join(SCENE_SOURCE_DIR, `${scene.id.replace(/-/g, "_")}.py`),
    renderPath: path.join(SCENE_RENDER_DIR, `${scene.id}.mp4`),
    publicPath: `generated/scenes/${scene.id}.mp4`
  }));

  return {
    topic,
    slug,
    sectionSlug: SECTION_SLUG,
    episodeType: "THEORY",
    format: "longform-16x9",
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    durationSeconds: scenes.reduce((total, s) => total + s.durationSeconds, 0),
    visualIdentity: {
      background: "#081018",
      foreground: "#F7FAFF",
      accent: "#22D3EE",
      secondaryAccent: "#F59E0B",
      font: "Avenir Next"
    },
    scenes
  };
}

const scenePlansForCode = buildScenePlans();

export function getSceneCode(sceneId: string): string {
  const scene = scenePlansForCode.find((item) => item.id === sceneId);
  if (!scene) {
    throw new Error(`Unknown scene ${sceneId}`);
  }
  return `${scene.code}\n`;
}

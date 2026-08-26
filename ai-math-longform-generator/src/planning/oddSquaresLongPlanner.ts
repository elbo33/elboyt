import path from "node:path";
import {FPS, HEIGHT, SCENE_RENDER_DIR, SCENE_SOURCE_DIR, WIDTH} from "../core/config";
import {slugify} from "../core/slug";
import type {ChapterKind, Storyboard, VideoScene} from "../core/types";

type ScenePlan = Omit<
  VideoScene,
  "sourcePath" | "renderPath" | "publicPath" | "chapterIndex"
> & {
  code: string;
};

// ---------------------------------------------------------------------------
// The repetitive long-form skeleton. Every video the planner emits follows the
// same ordered chapters; only the mathematical content changes.
//
//   intro      -> hook + the raw pattern
//   roadmap    -> literally lists the chapters that follow
//   concept    -> define the terms
//   master     -> one slow uninterrupted build of the whole idea
//   example x7 -> the SAME worked-case template, seven times
//   pattern    -> read the pattern back off the results
//   example    -> one deliberately large case (stress test)
//   principle  -> why the step can never fail
//   principle  -> the same fact from three angles
//   algebra    -> the symbolic confirmation
//   recap      -> restate every example + the one-line reason
//   outro      -> final formula, end card
// ---------------------------------------------------------------------------

const COMMON_IMPORTS = String.raw`from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np
`;

const EXAMPLE_SPECS: {k: number; cell: number; words: string}[] = [
  {k: 1, cell: 1.0, words: "One L-shaped layer of 3 cells wraps the start cell into a perfect 2 x 2 block."},
  {k: 2, cell: 0.95, words: "Same move, bigger square: a 5-cell L turns the 2 x 2 block into a 3 x 3 block."},
  {k: 3, cell: 0.82, words: "A 7-cell L turns 3 x 3 into 4 x 4. Notice the beats never change."},
  {k: 4, cell: 0.72, words: "Nine more cells, and the 4 x 4 square becomes a 5 x 5 square."},
  {k: 5, cell: 0.64, words: "Eleven cells this time. The L is bigger; the idea is not."},
  {k: 6, cell: 0.58, words: "Thirteen cells wrap the 6 x 6 square into a 7 x 7 square. Still one move."},
  {k: 7, cell: 0.52, words: "Fifteen cells: 7 x 7 becomes 8 x 8. The template has not changed once."},
  {k: 8, cell: 0.48, words: "Seventeen cells turn 8 x 8 into 9 x 9. You can predict every beat by now."},
  {k: 9, cell: 0.44, words: "Nineteen cells: 9 x 9 becomes 10 x 10. Nine cases, zero new ideas."}
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function exampleChapter(orderIndex: number, exampleNumber: number): ScenePlan {
  const spec = EXAMPLE_SPECS[exampleNumber - 1];
  const m = spec.k + 1;
  const terms = Array.from({length: m}, (_, j) => 2 * j + 1).join(" + ");
  const titleText =
    m >= 6
      ? `EXAMPLE ${exampleNumber}   —   sum up to ${m}²`
      : `EXAMPLE ${exampleNumber}   —   ${terms}  =  ${m}²`;
  const titleScale = m >= 6 ? 0.56 : 0.54;
  const NN = pad2(orderIndex);
  const className = `Chapter${NN}ExampleM${m}`;
  const label = `EXAMPLE ${exampleNumber} / ${EXAMPLE_SPECS.length}`;

  const code =
    COMMON_IMPORTS +
    String.raw`
from support.template import build_example


class ${className}(LongScene):
    chapter_tag_text = ${JSON.stringify(label)}

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline(${JSON.stringify(titleText)}, ${titleScale})
        self.play(Write(title), run_time=1.4)
        build_example(self, k=${spec.k}, cell=${spec.cell}, step_words=${JSON.stringify(spec.words)})
        self.wait(7.0)
`;

  return {
    code,
    id: `chapter-${NN}-example-${m}`,
    title: `Example ${exampleNumber} — ${m}²`,
    className,
    durationSeconds: 24 + spec.k,
    chapterKind: "example" as ChapterKind,
    chapterLabel: label,
    purpose: `Worked case ${exampleNumber} of ${EXAMPLE_SPECS.length}, identical template: ${terms} = ${m}².`,
    mathematicalConcept: `Wrapping a ${spec.k}x${spec.k} square in an L of ${2 * spec.k + 1} cells yields a ${m}x${m} square.`,
    objects: [`${spec.k}x${spec.k} block`, `L-layer of ${2 * spec.k + 1}`, `${m}x${m} outline`, "cumulative ledger"],
    animation: "The shared example template: start square, count the L, transform the outline, log the ledger row.",
    camera: "Static landscape frame, grid on the left, ledger on the right.",
    text: `${terms} = ${m * m} = ${m}²`,
    transition: "Cut to the next example, same layout."
  };
}

const scenePlans: ScenePlan[] = [
  {
    id: "chapter-01-intro",
    title: "Intro",
    className: "Chapter01Intro",
    durationSeconds: 20,
    chapterKind: "intro" as ChapterKind,
    chapterLabel: "INTRO",
    purpose: "Hook with the raw pattern and promise an explanation.",
    mathematicalConcept: "Partial sums of consecutive odd numbers appear to be exactly the perfect squares.",
    objects: ["title", "stacked pattern rows", "square labels"],
    animation: "Title writes on, then four sum rows fade in and their results are shown to be squares.",
    camera: "Static landscape frame.",
    text: "WHY IS EVERY RUN OF ODD NUMBERS A PERFECT SQUARE?",
    transition: "Cut to the roadmap.",
    code:
      COMMON_IMPORTS +
      String.raw`

def teaser_row(sum_text, val, sq):
    return VGroup(
        body(sum_text, 0.46, FOREGROUND),
        body("=", 0.46, MUTED),
        subhead(val, 0.5, FOREGROUND),
        body("=", 0.46, MUTED),
        subhead(sq, 0.5, SECONDARY),
    ).arrange(RIGHT, buff=0.28)


class Chapter01Intro(LongScene):
    chapter_tag_text = "INTRO"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = statement("WHY IS EVERY RUN\nOF ODD NUMBERS\nA PERFECT SQUARE?", 0.6)
        title.to_edge(UP, buff=1.0)
        rows = VGroup(
            teaser_row("1", "1", "1²"),
            teaser_row("1 + 3", "4", "2²"),
            teaser_row("1 + 3 + 5", "9", "3²"),
            teaser_row("1 + 3 + 5 + 7", "16", "4²"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4)
        rows.move_to([0, -1.1, 0])
        sub = caption("Every partial sum lands exactly on a square. This whole video is why.")

        self.play(Write(title), run_time=2.4)
        self.wait(0.8)
        self.play(LaggedStart(*[FadeIn(r, shift=0.35 * RIGHT) for r in rows], lag_ratio=0.5), run_time=3.6)
        self.wait(0.8)
        squares_col = VGroup(*[r[4] for r in rows])
        self.play(LaggedStart(*[Indicate(s, color=SECONDARY, scale_factor=1.2) for s in squares_col], lag_ratio=0.3), run_time=2.4)
        self.play(FadeIn(sub, shift=0.2 * UP), run_time=0.9)
        self.wait(2.0)
        self.play(rows.animate.set_opacity(0.5), run_time=1.0)
        self.wait(5.5)
`
  },
  {
    id: "chapter-02-roadmap",
    title: "Roadmap",
    className: "Chapter02Roadmap",
    durationSeconds: 24,
    chapterKind: "roadmap" as ChapterKind,
    chapterLabel: "ROADMAP",
    purpose: "Expose the repetitive structure of the video up front.",
    mathematicalConcept: "The argument is: observe, verify on many cases, then prove the general step.",
    objects: ["title", "ordered list of chapters"],
    animation: "Chapter list fades in row by row; the block of worked-example chapters is boxed.",
    camera: "Static landscape frame.",
    text: "HOW THIS VIDEO IS BUILT",
    transition: "Cut to the setup.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter02Roadmap(LongScene):
    chapter_tag_text = "ROADMAP"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("HOW THIS VIDEO IS BUILT", 0.66)
        items = [
            "Setup  —  what “odd” and “partial sum” mean",
            "Master build  —  1 up to 6² in one go",
            "Nine worked cases  —  2² through 10², one template",
            "Pattern check  —  the gaps are 3, 5, 7, 9, …",
            "Big jump  —  n = 12  (does it still hold?)",
            "The reason  —  L-shaped layers (gnomons)",
            "2n + 1, three ways",
            "The algebra  —  telescoping to n²",
            "Recap",
        ]
        rows = bullet_list(items, 0.38, buff=0.32)
        rows.move_to([0, -0.35, 0])
        note = caption("The same shape every time: show the case, then explain why it can’t fail.")

        self.play(Write(title), run_time=1.6)
        self.play(LaggedStart(*[FadeIn(r, shift=0.3 * RIGHT) for r in rows], lag_ratio=0.35), run_time=5.5)
        self.wait(0.8)
        box = SurroundingRectangle(rows[2], color=ACCENT, buff=0.18)
        self.play(Create(box), run_time=1.0)
        self.play(Indicate(rows[2], color=ACCENT, scale_factor=1.04), run_time=1.4)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.9)
        self.wait(1.6)
        self.play(FadeOut(box), run_time=0.8)
        self.wait(6.0)
`
  },
  {
    id: "chapter-03-concept",
    title: "The Setup",
    className: "Chapter03Concept",
    durationSeconds: 38,
    chapterKind: "concept" as ChapterKind,
    chapterLabel: "THE SETUP",
    purpose: "Pin down the two ideas: odd numbers and the running partial sum.",
    mathematicalConcept: "Odd numbers are 1,3,5,7,...; a partial sum adds the first few of them in order.",
    objects: ["number line", "odd markers", "unit square", "running total counter"],
    animation: "Odd numbers are marked on a line; a running total ticks 1, 4, 9 as unit squares are added.",
    camera: "Static landscape frame.",
    text: "ODD NUMBERS AND PARTIAL SUMS",
    transition: "Cut to the master build.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter03Concept(LongScene):
    chapter_tag_text = "THE SETUP"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("TWO WORDS FIRST", 0.66)

        line = Line([-5.5, 1.6, 0], [5.5, 1.6, 0], color=MUTED, stroke_width=3)
        ticks = VGroup()
        tick_labels = VGroup()
        for k in range(0, 13):
            x = -5.5 + k * (11.0 / 12.0)
            ticks.add(Line([x, 1.45, 0], [x, 1.75, 0], color=MUTED, stroke_width=2))
            if k % 2 == 0:
                tick_labels.add(small_label(str(k), 0.28, MUTED).move_to([x, 2.05, 0]))
        odds = [1, 3, 5, 7, 9, 11]
        odd_dots = VGroup()
        odd_tags = VGroup()
        for o in odds:
            x = -5.5 + o * (11.0 / 12.0)
            odd_dots.add(Dot([x, 1.6, 0], radius=0.1, color=ACCENT))
            odd_tags.add(small_label("odd", 0.24, ACCENT).move_to([x, 1.15, 0]))

        text1 = body("“Odd numbers” :  1, 3, 5, 7, 9, …   — skip every second whole number.", 0.4)
        text1.move_to([0, 0.1, 0])
        text2 = body("“Partial sum” :  add them left to right and watch the running total.", 0.4)
        text2.move_to([0, -0.7, 0])

        unit = Square(side_length=0.7, stroke_color=MUTED, stroke_width=2, fill_color=ACCENT, fill_opacity=0.55)
        unit.move_to([-4.6, -2.5, 0])
        unit_label = small_label("one cell  =  1", 0.32, MUTED).next_to(unit, RIGHT, buff=0.3)

        total_label = small_label("running total", 0.3, MUTED).move_to([3.1, -1.9, 0])
        total = DecimalNumber(0, num_decimal_places=0, color=FOREGROUND).scale(0.9)
        total.move_to([3.1, -2.6, 0])
        squares_hint = small_label("1, 4, 9, 16, …", 0.32, SECONDARY).next_to(total, RIGHT, buff=0.5)

        self.play(Write(title), run_time=1.5)
        self.play(Create(line), Create(ticks), FadeIn(tick_labels), run_time=1.8)
        self.play(LaggedStart(*[GrowFromCenter(d) for d in odd_dots], lag_ratio=0.25), FadeIn(odd_tags), run_time=2.4)
        self.wait(0.6)
        self.play(FadeIn(text1, shift=0.2 * UP), run_time=1.0)
        self.wait(1.6)
        self.play(FadeIn(text2, shift=0.2 * UP), run_time=1.0)
        self.wait(1.4)
        self.play(FadeIn(unit, scale=0.7), FadeIn(unit_label), run_time=1.0)
        self.play(FadeIn(total_label), FadeIn(total), run_time=0.8)
        for value in [1, 4, 9]:
            self.play(ChangeDecimalToValue(total, value), run_time=0.9)
            self.play(Flash(total, color=SECONDARY, line_length=0.2), run_time=0.5)
            self.wait(0.5)
        self.play(FadeIn(squares_hint, shift=0.2 * RIGHT), run_time=0.8)
        self.wait(1.0)
        q = caption("Question:  why does that running total keep landing on 1, 4, 9, 16, … ?")
        self.play(FadeIn(q, shift=0.2 * UP), run_time=1.0)
        self.wait(1.6)
        self.play(Indicate(odd_dots, color=ACCENT, scale_factor=1.1), run_time=1.6)
        self.wait(5.0)
`
  },
  {
    id: "chapter-04-master-build",
    title: "Master Build",
    className: "Chapter04MasterBuild",
    durationSeconds: 52,
    chapterKind: "principle" as ChapterKind,
    chapterLabel: "MASTER BUILD",
    purpose: "Show the entire idea once, slowly and without interruption, from 1 to 6 squared.",
    mathematicalConcept: "Six successive odd-sized L-layers stack into a 6x6 square while the running total tracks 1,4,9,16,25,36.",
    objects: ["6x6 layered grid", "odd-number counter", "running-total counter", "square label"],
    animation: "Layers 1,3,5,7,9,11 fade on one at a time; two counters track the odd number and the running total.",
    camera: "Static landscape frame.",
    text: "1+3+5+7+9+11 = 36 = 6²",
    transition: "Cut to Example 1.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter04MasterBuild(LongScene):
    chapter_tag_text = "MASTER BUILD"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("WATCH IT GROW, ONCE", 0.64)

        N = 6
        cell = 0.72
        grid, layers = odd_square_grid(N, cell)
        grid.move_to([-3.4, -0.4, 0])

        odd_lbl = small_label("odd number added", 0.3, ACCENT).move_to([3.2, 2.0, 0])
        odd_val = DecimalNumber(0, num_decimal_places=0, color=ACCENT).scale(0.95).move_to([3.2, 1.3, 0])
        tot_lbl = small_label("running total", 0.3, MUTED).move_to([3.2, 0.2, 0])
        tot_val = DecimalNumber(0, num_decimal_places=0, color=FOREGROUND).scale(1.3).move_to([3.2, -0.6, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(VGroup(odd_lbl, odd_val, tot_lbl, tot_val)), run_time=0.9)

        running = 0
        sq_val = None
        for k in range(N):
            running += 2 * k + 1
            self.play(
                FadeIn(layers[k], lag_ratio=0.08),
                ChangeDecimalToValue(odd_val, 2 * k + 1),
                ChangeDecimalToValue(tot_val, running),
                run_time=1.2 if k < 3 else 0.85,
            )
            target = subhead(f"=  {k+1}²", 0.5, SECONDARY).move_to([3.2, -1.7, 0])
            if sq_val is None:
                sq_val = target
                self.play(FadeIn(sq_val), run_time=0.4)
            else:
                self.play(Transform(sq_val, target), run_time=0.4)
            self.wait(0.35)

        outline = Square(side_length=N * cell, color=SECONDARY, stroke_width=6).move_to(grid.get_center())
        self.play(Create(outline), run_time=1.2)
        note = caption("Six odd numbers, six L-shaped layers, one 6 × 6 square. Nothing else happened.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.play(Circumscribe(VGroup(tot_val, sq_val), color=SECONDARY), run_time=1.5)
        self.wait(7.0)
`
  },
  exampleChapter(5, 1),
  exampleChapter(6, 2),
  exampleChapter(7, 3),
  exampleChapter(8, 4),
  exampleChapter(9, 5),
  exampleChapter(10, 6),
  exampleChapter(11, 7),
  exampleChapter(12, 8),
  exampleChapter(13, 9),
  {
    id: "chapter-14-pattern-check",
    title: "Pattern Check",
    className: "Chapter14PatternCheck",
    durationSeconds: 34,
    chapterKind: "recap" as ChapterKind,
    chapterLabel: "PATTERN CHECK",
    purpose: "Read the pattern back off the list of squares: the gaps are the odd numbers.",
    mathematicalConcept: "Consecutive perfect squares differ by consecutive odd numbers.",
    objects: ["list of squares 1..64", "gap arrows", "conclusion line"],
    animation: "Squares 1²..8² stack up; curved arrows between them are labelled with the differences 3,5,7,...",
    camera: "Static landscape frame.",
    text: "gaps between squares = 3, 5, 7, 9, 11, 13, ...",
    transition: "Cut to the big-jump stress test.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter14PatternCheck(LongScene):
    chapter_tag_text = "PATTERN CHECK"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("LOOK AT THE GAPS", 0.62)

        squares = [t * t for t in range(1, 9)]
        rows = VGroup()
        for i, s in enumerate(squares):
            t = i + 1
            row = VGroup(
                body(f"{t}²", 0.42, FOREGROUND),
                body("=", 0.38, MUTED),
                subhead(str(s), 0.42, SECONDARY),
            ).arrange(RIGHT, buff=0.28)
            rows.add(row)
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.34)
        rows.move_to([-3.0, -0.1, 0])

        self.play(Write(title), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(r, shift=0.2 * RIGHT) for r in rows], lag_ratio=0.25), run_time=3.4)
        self.wait(0.6)

        anchor_x = rows.get_right()[0] + 0.35
        gaps = VGroup()
        for i in range(len(squares) - 1):
            y0 = rows[i].get_center()[1]
            y1 = rows[i + 1].get_center()[1]
            arc = CurvedArrow([anchor_x, y0 - 0.08, 0], [anchor_x, y1 + 0.08, 0], angle=-TAU / 5, color=ACCENT, stroke_width=2, tip_length=0.16)
            tag = small_label(f"+ {squares[i + 1] - squares[i]}", 0.32, ACCENT)
            tag.move_to([anchor_x + 0.95, (y0 + y1) / 2, 0])
            gaps.add(VGroup(arc, tag))
        self.play(LaggedStart(*[FadeIn(g) for g in gaps], lag_ratio=0.2), run_time=3.0)
        self.wait(0.8)

        concl = body("the gaps are  3, 5, 7, 9, 11, 13, 15  —  the odd numbers, in order.", 0.4, SECONDARY)
        concl.move_to([0, -3.3, 0])
        self.play(FadeIn(concl, shift=0.2 * UP), run_time=1.0)
        self.play(Circumscribe(concl, color=ACCENT), run_time=1.6)
        self.wait(7.0)
`
  },
  {
    id: "chapter-15-big-jump",
    title: "Big Jump — n = 12",
    className: "Chapter15BigJump",
    durationSeconds: 30,
    chapterKind: "example" as ChapterKind,
    chapterLabel: "BIG JUMP · n = 12",
    purpose: "Stress-test the pattern far from the small cases.",
    mathematicalConcept: "The first twelve odd numbers sum to 144 = 12^2.",
    objects: ["12x12 layered grid", "running total counter", "odd-number ticker"],
    animation: "Twelve L-layers snap on in sequence while a counter runs 1, 4, 9, ..., 144.",
    camera: "Static landscape frame.",
    text: "1 + 3 + 5 + … + 23 = 144 = 12²",
    transition: "Cut to the general reason.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter15BigJump(LongScene):
    chapter_tag_text = "BIG JUMP · n = 12"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("BIG JUMP   —   n = 12", 0.62)

        n = 12
        cell = 0.4
        grid, layers = odd_square_grid(n, cell)
        grid.move_to([-3.0, -0.3, 0])
        outline = Square(side_length=n * cell, color=SECONDARY, stroke_width=5).move_to(grid.get_center())

        odd_label = small_label("odd number just added", 0.3, ACCENT).move_to([3.3, 1.8, 0])
        odd_val = DecimalNumber(1, num_decimal_places=0, color=ACCENT).scale(0.95).move_to([3.3, 1.1, 0])
        tot_label = small_label("running total", 0.3, MUTED).move_to([3.3, -0.1, 0])
        tot_val = DecimalNumber(0, num_decimal_places=0, color=FOREGROUND).scale(1.2).move_to([3.3, -0.9, 0])
        sq_note = subhead("= 12²", 0.5, SECONDARY).next_to(tot_val, DOWN, buff=0.35).set_opacity(0)

        self.play(Write(title), run_time=1.4)
        self.play(FadeIn(VGroup(odd_label, odd_val, tot_label, tot_val)), run_time=0.9)
        running = 0
        for k in range(n):
            running += 2 * k + 1
            self.play(
                FadeIn(layers[k], lag_ratio=0.05),
                ChangeDecimalToValue(odd_val, 2 * k + 1),
                ChangeDecimalToValue(tot_val, running),
                run_time=0.85 if k < 3 else 0.5,
            )
        self.play(Create(outline), run_time=1.0)
        self.play(sq_note.animate.set_opacity(1), Flash(tot_val, color=SECONDARY), run_time=0.9)
        self.wait(0.8)
        note = caption("No new idea — twelve copies of the same L-wrapping move. Still a square.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(6.0)
`
  },
  {
    id: "chapter-16-principle",
    title: "The Reason",
    className: "Chapter16Principle",
    durationSeconds: 44,
    chapterKind: "principle" as ChapterKind,
    chapterLabel: "THE REASON",
    purpose: "Show, for a generic n, that wrapping an n x n square in an L of 2n+1 gives (n+1) x (n+1).",
    mathematicalConcept: "The next gnomon of a square grid has exactly 2n+1 cells, so n^2 + (2n+1) = (n+1)^2.",
    objects: ["generic n x n square", "gnomon L polygon", "dimension labels", "identity line"],
    animation: "A generic square is drawn, an L of 2n+1 is wrapped around it, and the outline becomes (n+1) x (n+1).",
    camera: "Static landscape frame.",
    text: "n² + (2n + 1) = (n + 1)²",
    transition: "Cut to the three-ways view.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter16Principle(LongScene):
    chapter_tag_text = "THE REASON"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("WHY IT CAN’T FAIL", 0.66)

        ox, oy = -6.3, -2.0
        S = 2.7
        th = 0.7
        inner = Square(side_length=S, stroke_color=MUTED, stroke_width=3, fill_color=ACCENT, fill_opacity=0.28)
        inner.move_to([ox + S / 2, oy + S / 2, 0])
        gnomon = Polygon(
            [ox + S, oy, 0],
            [ox + S + th, oy, 0],
            [ox + S + th, oy + S + th, 0],
            [ox, oy + S + th, 0],
            [ox, oy + S, 0],
            [ox + S, oy + S, 0],
            stroke_color=SECONDARY, stroke_width=3, fill_color=SECONDARY, fill_opacity=0.4,
        )
        outer = Square(side_length=S + th, stroke_color=FOREGROUND, stroke_width=5)
        outer.move_to([ox + (S + th) / 2, oy + (S + th) / 2, 0])

        n_bottom = small_label("n", 0.4, MUTED).move_to([ox + S / 2, oy - 0.4, 0])
        n_left = small_label("n", 0.4, MUTED).move_to([ox - 0.42, oy + S / 2, 0])
        np1_bottom = small_label("n + 1", 0.36, FOREGROUND).move_to([ox + (S + th) / 2, oy - 0.9, 0])
        l_label = subhead("the L  =  2n + 1", 0.42, SECONDARY).move_to([-1.7, 1.4, 0])
        l_arrow = Arrow([-2.5, 1.2, 0], [ox + S + th - 0.2, oy + S - 0.1, 0], color=SECONDARY, buff=0.15, stroke_width=3)

        line1 = body("Take any n × n square.", 0.4)
        line2 = body("Its next L is one row on top,", 0.38)
        line3 = body("one column on the side,", 0.38)
        line4 = body("one shared corner:", 0.38)
        line5 = subhead("n + n + 1  =  2n + 1", 0.4, ACCENT)
        line6 = subhead("n²  +  (2n + 1)  =  (n + 1)²", 0.44, SECONDARY)
        line7 = small_label("and 2n + 1 is the next odd number.", 0.32, ACCENT)
        text_col = VGroup(line1, line2, line3, line4, line5, line6, line7).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        text_col.move_to([3.4, -0.2, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(inner, scale=0.9), FadeIn(n_bottom), FadeIn(n_left), run_time=1.2)
        self.play(FadeIn(line1, shift=0.2 * UP), run_time=1.0)
        self.wait(1.2)
        self.play(DrawBorderThenFill(gnomon), run_time=1.6)
        self.play(GrowArrow(l_arrow), FadeIn(l_label), run_time=1.0)
        self.wait(0.8)
        top_row = Rectangle(width=S + th, height=th, stroke_color=ACCENT, stroke_width=4).move_to([ox + (S + th) / 2, oy + S + th / 2, 0])
        side_col = Rectangle(width=th, height=S, stroke_color=GREEN, stroke_width=4).move_to([ox + S + th / 2, oy + S / 2, 0])
        self.play(Create(top_row), FadeIn(line2, shift=0.2 * UP), run_time=1.0)
        self.play(Create(side_col), FadeIn(line3, shift=0.2 * UP), run_time=1.0)
        self.play(FadeIn(line4, shift=0.2 * UP), run_time=0.8)
        self.wait(1.0)
        self.play(FadeIn(line5, shift=0.2 * UP), run_time=0.9)
        self.wait(1.2)
        self.play(FadeOut(top_row), FadeOut(side_col), run_time=0.8)
        self.play(Create(outer), FadeIn(np1_bottom), run_time=1.2)
        self.wait(0.6)
        self.play(FadeIn(line6, shift=0.2 * UP), run_time=1.0)
        self.play(Indicate(line6, color=SECONDARY, scale_factor=1.05), run_time=1.4)
        self.play(FadeIn(line7, shift=0.2 * UP), run_time=1.0)
        self.wait(1.5)
        closing = caption("So each odd number is precisely the gap between one square and the next.")
        self.play(FadeIn(closing, shift=0.2 * UP), run_time=1.0)
        self.wait(6.0)
`
  },
  {
    id: "chapter-17-three-ways",
    title: "2n + 1, Three Ways",
    className: "Chapter17ThreeWays",
    durationSeconds: 34,
    chapterKind: "principle" as ChapterKind,
    chapterLabel: "2n + 1, THREE WAYS",
    purpose: "Confirm the L-count 2n+1 from three independent directions.",
    mathematicalConcept: "2n+1 as a cell count, as a difference of squares, and as the step between odd numbers.",
    objects: ["three stacked statements"],
    animation: "Three short arguments fade in one at a time; their conclusions are all 2n+1.",
    camera: "Static landscape frame.",
    text: "count it / subtract squares / walk the odds",
    transition: "Cut to the algebra.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter17ThreeWays(LongScene):
    chapter_tag_text = "2n+1, THREE WAYS"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("WHY THE L HAS 2n + 1 CELLS", 0.56)

        v1 = VGroup(
            subhead("1  ·  count the L", 0.42, ACCENT),
            body("n cells along the top,  n down the side,  1 in the shared corner.", 0.36),
            body("n + n + 1  =  2n + 1", 0.42, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        v2 = VGroup(
            subhead("2  ·  subtract the squares", 0.42, ACCENT),
            body("(n + 1)²  −  n²  =  (n² + 2n + 1)  −  n²  =  2n + 1", 0.36, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        v3 = VGroup(
            subhead("3  ·  walk the odd numbers", 0.42, ACCENT),
            body("the n-th odd number is 2n − 1,  so the next one is 2n + 1.", 0.36, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        col = VGroup(v1, v2, v3).arrange(DOWN, aligned_edge=LEFT, buff=0.55).move_to([0, -0.3, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(v1, shift=0.2 * UP), run_time=1.0)
        self.wait(1.8)
        self.play(FadeIn(v2, shift=0.2 * UP), run_time=1.0)
        self.wait(1.8)
        self.play(FadeIn(v3, shift=0.2 * UP), run_time=1.0)
        self.wait(1.6)
        note = caption("Three routes, one number.  That is why the pattern is forced.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.play(LaggedStart(*[Indicate(v[-1], color=SECONDARY) for v in (v1, v2, v3)], lag_ratio=0.3), run_time=2.2)
        self.wait(6.0)
`
  },
  {
    id: "chapter-18-algebra",
    title: "The Algebra",
    className: "Chapter18Algebra",
    durationSeconds: 40,
    chapterKind: "algebra" as ChapterKind,
    chapterLabel: "THE ALGEBRA",
    purpose: "Chain the single step into the full identity by telescoping.",
    mathematicalConcept: "(n+1)^2 - n^2 = 2n+1, so 1+3+...+(2n-1) = n^2.",
    objects: ["expansion of (n+1)^2", "telescoping ladder of identities", "linking arrows"],
    animation: "Expand (n+1)^2, isolate 2n+1, then stack 1=1^2, 1+3=2^2, ... with linking + (2k+1) arrows.",
    camera: "Static landscape frame.",
    text: "1 + 3 + 5 + … + (2n − 1) = n²",
    transition: "Cut to the recap.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter18Algebra(LongScene):
    chapter_tag_text = "THE ALGEBRA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("THE SAME THING IN SYMBOLS", 0.58)

        e1 = subhead("(n + 1)²  =  n² + 2n + 1", 0.46, FOREGROUND)
        e2 = subhead("(n + 1)²  −  n²  =  2n + 1", 0.46, ACCENT)
        e3 = small_label("the jump from one square to the next is always an odd number", 0.32, MUTED)
        top = VGroup(e1, e2, e3).arrange(DOWN, aligned_edge=LEFT, buff=0.26).move_to([0, 1.85, 0])

        ladder_rows = [
            ("1", "1²"),
            ("1 + 3", "2²"),
            ("1 + 3 + 5", "3²"),
            ("1 + 3 + 5 + 7", "4²"),
            ("⋮", "⋮"),
            ("1 + 3 + 5 + … + (2n − 1)", "n²"),
        ]
        ladder = running_total_panel(ladder_rows).scale(0.82)
        ladder.move_to([0.4, -0.9, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(e1, shift=0.2 * UP), run_time=1.0)
        self.wait(1.4)
        self.play(TransformFromCopy(e1, e2), run_time=1.2)
        self.play(FadeIn(e3, shift=0.2 * UP), run_time=0.9)
        self.wait(1.6)
        self.play(LaggedStart(*[FadeIn(r, shift=0.25 * RIGHT) for r in ladder], lag_ratio=0.4), run_time=4.0)
        self.wait(0.6)
        arrow_x = ladder.get_left()[0] - 0.55
        arrows = VGroup()
        for i in range(3):
            y0 = ladder[i].get_center()[1]
            y1 = ladder[i + 1].get_center()[1]
            a = Arrow([arrow_x, y0 - 0.04, 0], [arrow_x, y1 + 0.04, 0], color=SECONDARY, buff=0.05, stroke_width=3, tip_length=0.16)
            tag = small_label(f"+ {2 * (i + 1) + 1}", 0.3, SECONDARY).move_to([arrow_x - 0.7, (y0 + y1) / 2, 0])
            arrows.add(VGroup(a, tag))
        self.play(LaggedStart(*[GrowArrow(g[0]) for g in arrows], lag_ratio=0.3), LaggedStart(*[FadeIn(g[1]) for g in arrows], lag_ratio=0.3), run_time=2.4)
        self.wait(1.0)
        self.play(Indicate(ladder[-1], color=SECONDARY, scale_factor=1.06), run_time=1.5)
        concl = caption("Each row is the row above plus the next odd number — so every row is a square.")
        self.play(FadeIn(concl, shift=0.2 * UP), run_time=1.0)
        self.wait(6.0)
`
  },
  {
    id: "chapter-19-recap",
    title: "Recap",
    className: "Chapter19Recap",
    durationSeconds: 40,
    chapterKind: "recap" as ChapterKind,
    chapterLabel: "RECAP",
    purpose: "Restate every example and the single reason behind them.",
    mathematicalConcept: "Every worked case is one instance of n^2 + (2n+1) = (n+1)^2.",
    objects: ["ledger of all examples", "miniature L diagram", "one-line reason"],
    animation: "The example ledger rebuilds, the L diagram reappears small, and the reason line lands.",
    camera: "Static landscape frame.",
    text: "ONE MOVE, REPEATED",
    transition: "Cut to the outro.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter19Recap(LongScene):
    chapter_tag_text = "RECAP"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("ONE MOVE, REPEATED", 0.64)

        ledger = running_total_panel([
            ("1 + 3", "4  =  2²"),
            ("1 + 3 + 5", "9  =  3²"),
            ("1 + 3 + 5 + 7", "16  =  4²"),
            ("1 + 3 + … + (2n − 1)", "n²"),
        ])
        ledger.move_to([-3.3, 0.4, 0])

        ox, oy = 2.2, -1.6
        S, th = 1.7, 0.5
        inner = Square(side_length=S, stroke_color=MUTED, stroke_width=2, fill_color=ACCENT, fill_opacity=0.3).move_to([ox + S / 2, oy + S / 2, 0])
        gnomon = Polygon(
            [ox + S, oy, 0], [ox + S + th, oy, 0], [ox + S + th, oy + S + th, 0],
            [ox, oy + S + th, 0], [ox, oy + S, 0], [ox + S, oy + S, 0],
            stroke_color=SECONDARY, stroke_width=2, fill_color=SECONDARY, fill_opacity=0.45,
        )
        mini_eq = subhead("n² + (2n + 1) = (n + 1)²", 0.4, SECONDARY).next_to(VGroup(inner, gnomon), UP, buff=0.5)

        reason = statement("Every odd number is the L-shaped gap\nbetween one square and the next.", 0.46)
        reason.move_to([0, -3.0, 0])

        self.play(Write(title), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(r, shift=0.25 * RIGHT) for r in ledger], lag_ratio=0.4), run_time=3.2)
        self.wait(0.8)
        self.play(FadeIn(inner, scale=0.9), run_time=0.8)
        self.play(DrawBorderThenFill(gnomon), run_time=1.2)
        self.play(FadeIn(mini_eq, shift=0.2 * UP), run_time=0.9)
        self.wait(1.0)
        self.play(Indicate(VGroup(inner, gnomon), color=SECONDARY, scale_factor=1.05), run_time=1.4)
        self.play(Write(reason), run_time=2.0)
        self.wait(1.2)
        self.play(Circumscribe(reason, color=ACCENT, buff=0.3), run_time=1.6)
        self.wait(6.0)
`
  },
  {
    id: "chapter-20-outro",
    title: "Outro",
    className: "Chapter20Outro",
    durationSeconds: 22,
    chapterKind: "outro" as ChapterKind,
    chapterLabel: "OUTRO",
    purpose: "Hold the final identity and the intuition.",
    mathematicalConcept: "The sum of the first n odd numbers equals n^2.",
    objects: ["final formula", "growing squares 1,4,9,16", "tagline"],
    animation: "Squares 1, 4, 9, 16 grow in sequence under the final identity.",
    camera: "Quiet final landscape frame.",
    text: "1 + 3 + 5 + … + (2n − 1) = n²",
    transition: "End card.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter20Outro(LongScene):
    chapter_tag_text = "OUTRO"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        final = statement("1 + 3 + 5 + … + (2n − 1)  =  n²", 0.58)
        final.move_to([0, 1.4, 0])

        cell = 0.32
        squares = VGroup()
        base_x = -4.2
        for n in [1, 2, 3, 4]:
            g = VGroup()
            for r in range(n):
                for c in range(n):
                    g.add(Square(side_length=cell, stroke_color=MUTED, stroke_width=1.5,
                                 fill_color=SECONDARY, fill_opacity=0.5).move_to([base_x + c * cell, -1.0 + r * cell, 0]))
            lbl = small_label(f"{n}² = {n*n}", 0.3, MUTED).next_to(g, DOWN, buff=0.35)
            squares.add(VGroup(g, lbl))
            base_x += n * cell + 1.1

        tag = caption("Odd numbers are the seams between consecutive squares.")

        self.play(Write(final), run_time=2.0)
        self.wait(0.6)
        self.play(LaggedStart(*[FadeIn(s, scale=0.8) for s in squares], lag_ratio=0.5), run_time=3.2)
        self.play(FadeIn(tag, shift=0.2 * UP), run_time=1.0)
        self.wait(1.2)
        self.play(Indicate(final, color=SECONDARY, scale_factor=1.04), run_time=1.6)
        self.wait(3.2)
`
  }
];

export function createStoryboard(topic: string): Storyboard {
  const slug = slugify(topic);
  const scenes: VideoScene[] = scenePlans.map(({code: _code, ...scene}, index) => ({
    ...scene,
    chapterIndex: index + 1,
    sourcePath: path.join(SCENE_SOURCE_DIR, `${scene.id.replace(/-/g, "_")}.py`),
    renderPath: path.join(SCENE_RENDER_DIR, `${scene.id}.mp4`),
    publicPath: `generated/scenes/${scene.id}.mp4`
  }));

  return {
    topic,
    slug,
    format: "longform-16x9",
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    durationSeconds: scenes.reduce((total, scene) => total + scene.durationSeconds, 0),
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

export function getSceneCode(sceneId: string): string {
  const scene = scenePlans.find((item) => item.id === sceneId);
  if (!scene) {
    throw new Error(`Unknown scene ${sceneId}`);
  }
  return `${scene.code}\n`;
}

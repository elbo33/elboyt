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
// "Potęgi i pierwiastki" — every exponent rule from one idea.
//
// The one idea: a^n counts how many times a is written as a factor. So when you
// multiply a^m · a^n you are just writing m factors, then n more — m + n
// factors. "Wykładniki się dodają przy mnożeniu." Every other rule ((a^m)^n,
// a^0, a^-n, a^(1/n), a^m / a^n) is forced by demanding that one law keeps
// holding.
//
// Fixed repetitive skeleton (same order as every long-form video):
//   intro -> roadmap -> setup -> master build -> example x8 (one template) ->
//   pattern check -> big case -> the reason -> one law / three rules ->
//   roots as 1/n -> algebra -> recap -> outro
//
// On-screen language: Polish. Mathematical notation stays as notation (MathTex).
// ---------------------------------------------------------------------------

const COMMON_IMPORTS = String.raw`from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np
`;

const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

function sup(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUP[Number(d)])
    .join("");
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ---------------------------------------------------------------------------
// The shared worked-example spec. Every PRZYKŁAD chapter is one entry here and
// one call to build_exponent_example — identical beats, only a, m, n change.
// ---------------------------------------------------------------------------
const EXAMPLE_SPECS: {a: number; m: number; n: number; words: string}[] = [
  {a: 2, m: 2, n: 3, words: "Dwa czynniki, potem trzy. Razem pięć dwójek w jednym pasku — czyli dwa do piątej."},
  {a: 3, m: 2, n: 2, words: "Zmieniamy podstawę na trójkę. Ruch bez zmian: wykładniki dwa i dwa dają cztery."},
  {a: 5, m: 1, n: 3, words: "Jedynka w wykładniku to po prostu jeden czynnik. Jeden i trzy to cztery piątki."},
  {a: 10, m: 2, n: 1, words: "Dziesiątki liczą się tak samo: dwa czynniki i jeszcze jeden to trzy."},
  {a: 2, m: 3, n: 3, words: "Trzy i trzy. Sześć dwójek naraz — dwa do szóstej."},
  {a: 7, m: 2, n: 1, words: "Siódemki, wykładniki dwa i jeden. Trzy czynniki, wynik trzysta czterdzieści trzy."},
  {a: 3, m: 1, n: 4, words: "Znowu jedynka z lewej. Jeden plus cztery to pięć — trzy do piątej."},
  {a: 2, m: 4, n: 4, words: "Cztery i cztery. Osiem dwójek w pasku, a pomysł ani drgnął."}
];

function ledgerTeX(spec: {a: number; m: number; n: number}): string {
  const t = spec.m + spec.n;
  return `${spec.a}^{${spec.m}}\\cdot ${spec.a}^{${spec.n}} = ${spec.a}^{${t}} = ${Math.pow(spec.a, t)}`;
}

function pyStrList(items: string[]): string {
  return `[${items.map((s) => JSON.stringify(s)).join(", ")}]`;
}

function exampleChapter(orderIndex: number, exampleNumber: number): ScenePlan {
  const spec = EXAMPLE_SPECS[exampleNumber - 1];
  const {a, m, n, words} = spec;
  const total = m + n;
  const NN = pad2(orderIndex);
  const className = `Chapter${NN}ExampleE${exampleNumber}`;
  const label = `PRZYKŁAD ${exampleNumber} / ${EXAMPLE_SPECS.length}`;

  const priorRows = EXAMPLE_SPECS.slice(0, exampleNumber).map(ledgerTeX);
  const shownRows = priorRows.length > 4 ? priorRows.slice(-4) : priorRows;

  const titleText = `PRZYKŁAD ${exampleNumber}   —   ${a}${sup(m)} · ${a}${sup(n)}`;

  const code =
    COMMON_IMPORTS +
    String.raw`
from support.template import build_exponent_example


class ${className}(LongScene):
    chapter_tag_text = ${JSON.stringify(label)}

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline(${JSON.stringify(titleText)}, 0.58)
        self.play(Write(title), run_time=1.3)
        ledger_rows = ${pyStrList(shownRows)}
        build_exponent_example(
            self, a=${a}, m=${m}, n=${n},
            ledger_rows=ledger_rows,
            step_words=${JSON.stringify(words)},
        )
        self.wait(8.5)
`;

  return {
    code,
    id: `chapter-${NN}-example-${exampleNumber}`,
    title: `Przykład ${exampleNumber} — ${a}^${m} · ${a}^${n}`,
    className,
    durationSeconds: 30,
    chapterKind: "example" as ChapterKind,
    chapterLabel: label,
    purpose: `Worked case ${exampleNumber} of ${EXAMPLE_SPECS.length}, identical template: ${a}^${m} · ${a}^${n} = ${a}^${total}.`,
    mathematicalConcept: `Multiplying ${a}^${m} by ${a}^${n} lays m factors then n more: ${m} + ${n} = ${total} factors, so the product is ${a}^${total}.`,
    objects: [`strip of ${m} factors`, `strip of ${n} factors`, "merged strip", "exponent-sum line", "numeric check", "cumulative ledger"],
    animation: "The shared example template: two factor strips, slide them together, brace the total, exponents add, check the plain number, log the ledger row.",
    camera: "Static landscape frame, strips on the left, worked lines and ledger on the right.",
    text: `${a}^${m} · ${a}^${n} = ${a}^(${m}+${n}) = ${a}^${total} = ${Math.pow(a, total)}`,
    transition: "Cut to the next example, same layout."
  };
}

const scenePlans: ScenePlan[] = [
  {
    id: "chapter-01-intro",
    title: "Wstęp",
    className: "Chapter01Intro",
    durationSeconds: 22,
    chapterKind: "intro" as ChapterKind,
    chapterLabel: "WSTĘP",
    purpose: "Hook with five familiar exponent rules and promise a single reason.",
    mathematicalConcept: "a^m·a^n, (a^m)^n, a^0, a^-n and a^(1/n) look like five separate rules.",
    objects: ["title", "five rule lines", "subtitle"],
    animation: "Title writes on, five rules fade in, each is pulsed, subtitle lands.",
    camera: "Static landscape frame.",
    text: "SKĄD SIĘ BIORĄ WSZYSTKIE REGUŁY POTĘG?",
    transition: "Cut to the roadmap.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter01Intro(LongScene):
    chapter_tag_text = "WSTĘP"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = statement("SKĄD SIĘ BIORĄ\nWSZYSTKIE REGUŁY POTĘG?", 0.6)
        title.to_edge(UP, buff=0.9)

        rows = VGroup(
            mtex(r"2^{3}\cdot 2^{2} \;=\; 2^{5}", 0.62),
            mtex(r"\left(2^{3}\right)^{2} \;=\; 2^{6}", 0.62),
            mtex(r"2^{0} \;=\; 1", 0.62),
            mtex(r"2^{-1} \;=\; \tfrac{1}{2}", 0.62),
            mtex(r"9^{\frac{1}{2}} \;=\; 3", 0.62),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.44)
        rows.move_to([0, -1.1, 0])
        sub = caption("Pięć reguł, które zwykle trzeba zapamiętać. Wszystkie wynikają z jednego zdania.")

        self.play(Write(title), run_time=2.4)
        self.wait(0.6)
        self.play(LaggedStart(*[FadeIn(r, shift=0.35 * RIGHT) for r in rows], lag_ratio=0.5), run_time=3.8)
        self.wait(0.8)
        self.play(LaggedStart(*[Indicate(r, color=SECONDARY, scale_factor=1.12) for r in rows], lag_ratio=0.45), run_time=3.4)
        self.wait(1.2)
        self.play(FadeIn(sub, shift=0.2 * UP), run_time=0.9)
        self.wait(3.2)
        self.play(rows.animate.set_opacity(0.45), run_time=1.0)
        self.wait(6.5)
`
  },
  {
    id: "chapter-02-roadmap",
    title: "Plan",
    className: "Chapter02Roadmap",
    durationSeconds: 24,
    chapterKind: "roadmap" as ChapterKind,
    chapterLabel: "PLAN",
    purpose: "Expose the repetitive structure of the video up front.",
    mathematicalConcept: "Observe one law, run it on many cases, then show why it can never fail.",
    objects: ["title", "ordered chapter list", "box around the worked-examples row"],
    animation: "Chapter list fades in row by row; the worked-examples entry is boxed and pulsed.",
    camera: "Static landscape frame.",
    text: "JAK ZBUDOWANY JEST TEN FILM",
    transition: "Cut to the setup.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter02Roadmap(LongScene):
    chapter_tag_text = "PLAN"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JAK ZBUDOWANY JEST TEN FILM", 0.6)
        items = [
            "Podstawy  —  czym jest wykładnik",
            "Główna budowa  —  mnożenie potęg w jednym ujęciu",
            "Osiem przykładów  —  ten sam schemat, inne liczby",
            "Sprawdzenie wzoru  —  wykładniki się dodają",
            "Duży przypadek  —  wykładniki 10 i 15",
            "Dlaczego to działa  —  liczenie czynników",
            "Jedno prawo  —  potęga potęgi, zero, wykładnik ujemny",
            "Pierwiastek jako wykładnik  1/n",
            "Algebra  —  wszystkie reguły z jednej",
        ]
        rows = bullet_list(items, 0.34, buff=0.26)
        rows.move_to([0, -0.25, 0])
        note = caption("Za każdym razem tak samo: pokaż przypadek, potem pokaż, dlaczego nie może zawieść.")

        self.play(Write(title), run_time=1.6)
        self.play(LaggedStart(*[FadeIn(r, shift=0.3 * RIGHT) for r in rows], lag_ratio=0.3), run_time=5.5)
        self.wait(0.8)
        box = SurroundingRectangle(rows[2], color=ACCENT, buff=0.18)
        self.play(Create(box), run_time=1.0)
        self.play(Indicate(rows[2], color=ACCENT, scale_factor=1.04), run_time=1.4)
        self.wait(1.0)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.9)
        self.wait(2.6)
        self.play(FadeOut(box), run_time=0.8)
        self.wait(8.0)
`
  },
  {
    id: "chapter-03-setup",
    title: "Podstawy",
    className: "Chapter03Setup",
    durationSeconds: 40,
    chapterKind: "concept" as ChapterKind,
    chapterLabel: "PODSTAWY",
    purpose: "Pin down: base, exponent as a factor count, and the running product.",
    mathematicalConcept: "a^n means a written as a factor n times; the running product of 2^4 ticks 2, 4, 8, 16.",
    objects: ["definition lines", "factor strip of 2s", "running product counter"],
    animation: "2^4 unfolds into 2·2·2·2; a counter runs 2, 4, 8, 16 as each factor lands; base and exponent are labelled.",
    camera: "Static landscape frame.",
    text: "WYKŁADNIK LICZY CZYNNIKI",
    transition: "Cut to the master build.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter03Setup(LongScene):
    chapter_tag_text = "PODSTAWY"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JEDNO SŁOWO NAJPIERW", 0.62)

        expr = mtex(r"2^{4} \;=\; 2\cdot 2\cdot 2\cdot 2", 0.8, FOREGROUND).move_to([0, 1.9, 0])
        base_tag = small_label("podstawa", 0.32, ACCENT)
        exp_tag = small_label("wykładnik  =  ile czynników", 0.32, SECONDARY)
        base_tag.next_to(expr[0][0], DOWN, buff=0.45)
        exp_tag.next_to(expr[0][1], UP, buff=0.4)
        base_arrow = Arrow(base_tag.get_top(), expr[0][0].get_bottom(), color=ACCENT, buff=0.1, stroke_width=3)
        exp_arrow = Arrow(exp_tag.get_bottom(), expr[0][1].get_top(), color=SECONDARY, buff=0.1, stroke_width=3)

        strip = factor_strip(4, "2", 0.72, ACCENT).move_to([-3.2, -0.6, 0])

        prod_lbl = small_label("iloczyn częściowy", 0.3, MUTED).move_to([3.2, 0.1, 0])
        prod = DecimalNumber(1, num_decimal_places=0, color=FOREGROUND).scale(1.2).move_to([3.2, -0.7, 0])

        self.play(Write(title), run_time=1.5)
        self.play(Write(expr), run_time=1.6)
        self.play(FadeIn(base_tag), GrowArrow(base_arrow), run_time=0.9)
        self.play(FadeIn(exp_tag), GrowArrow(exp_arrow), run_time=0.9)
        self.wait(2.6)
        self.play(FadeIn(prod_lbl), FadeIn(prod), run_time=0.7)
        running = 1
        for i in range(4):
            running *= 2
            self.play(FadeIn(strip[i], scale=0.6), ChangeDecimalToValue(prod, running), run_time=0.9)
            self.play(Flash(prod, color=SECONDARY, line_length=0.18), run_time=0.4)
            self.wait(0.7)
        self.wait(2.0)
        line = body("Potęga aⁿ  to  a  zapisane jako czynnik  n  razy.", 0.42, FOREGROUND).move_to([0, -2.2, 0])
        self.play(FadeIn(line, shift=0.2 * UP), run_time=1.0)
        self.wait(2.6)
        q = caption("Pytanie: co dzieje się z wykładnikami, gdy potęgi mnożymy przez siebie?")
        self.play(FadeIn(q, shift=0.2 * UP), run_time=1.0)
        self.wait(7.5)
`
  },
  {
    id: "chapter-04-master-build",
    title: "Główna budowa",
    className: "Chapter04MasterBuild",
    durationSeconds: 52,
    chapterKind: "principle" as ChapterKind,
    chapterLabel: "GŁÓWNA BUDOWA",
    purpose: "Show the whole idea once, slowly: 2^3 · 2^2 is three 2s then two more, five factors.",
    mathematicalConcept: "2^3·2^2 = 2^(3+2) = 2^5; exponents add because factors are appended.",
    objects: ["strip of 3", "strip of 2", "merged strip of 5", "brace", "law card"],
    animation: "Two strips slide together into one strip of five; the exponent line and the numeric check land; the law a^m·a^n = a^(m+n) is stated.",
    camera: "Static landscape frame.",
    text: "2³ · 2² = 2³⁺² = 2⁵",
    transition: "Cut to Example 1.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter04MasterBuild(LongScene):
    chapter_tag_text = "GŁÓWNA BUDOWA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("ZOBACZ TO RAZ, POWOLI", 0.62)

        cell = 0.74
        strip_a = factor_strip(3, "2", cell, ACCENT)
        strip_b = factor_strip(2, "2", cell, SECONDARY)
        VGroup(strip_a, strip_b).arrange(RIGHT, buff=1.1).move_to([-2.4, 1.55, 0])

        cap_a = small_label("2³  to  trzy dwójki", 0.32, ACCENT).next_to(strip_a, UP, buff=0.3)
        cap_b = small_label("2²  to  dwie dwójki", 0.32, SECONDARY).next_to(strip_b, UP, buff=0.3)

        step = mtex(r"2^{3}\cdot 2^{2} \;=\; 2^{\,3+2} \;=\; 2^{5}", 0.78, SECONDARY).move_to([0, -0.4, 0])
        check = mtex(r"8 \cdot 4 \;=\; 32", 0.64, FOREGROUND).move_to([0, -1.5, 0])

        law = mtex(r"a^{m}\cdot a^{n} \;=\; a^{m+n}", 0.86, ACCENT)
        law_note = small_label("wykładniki się dodają przy mnożeniu", 0.34, MUTED)
        law_group = VGroup(law, law_note).arrange(DOWN, buff=0.28).move_to([0, -3.0, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(strip_a, lag_ratio=0.15), FadeIn(cap_a), run_time=1.2)
        self.wait(1.2)
        self.play(FadeIn(strip_b, lag_ratio=0.15), FadeIn(cap_b), run_time=1.0)
        self.wait(2.4)

        merged_pos = strip_a.get_right() + RIGHT * (strip_b.width / 2)
        brace = Brace(VGroup(strip_a.copy(), strip_b.copy().move_to(merged_pos)), DOWN, color=FOREGROUND)
        brace_lbl = small_label("pięć dwójek", 0.34, FOREGROUND).next_to(brace, DOWN, buff=0.14)
        self.play(strip_b.animate.move_to(merged_pos), FadeOut(cap_a), FadeOut(cap_b), run_time=1.4)
        self.play(GrowFromCenter(brace), FadeIn(brace_lbl), run_time=0.9)
        self.wait(2.4)

        self.play(TransformFromCopy(VGroup(strip_a, strip_b, brace_lbl), step), run_time=1.5)
        self.play(Circumscribe(step, color=SECONDARY), run_time=1.4)
        self.wait(2.2)
        self.play(FadeIn(check, shift=0.2 * UP), run_time=0.9)
        self.wait(2.4)
        self.play(FadeIn(law_group, shift=0.2 * UP), run_time=1.1)
        self.play(Indicate(law, color=ACCENT, scale_factor=1.06), run_time=1.6)
        self.wait(8.0)
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
  {
    id: "chapter-13-pattern-check",
    title: "Sprawdzenie wzoru",
    className: "Chapter13PatternCheck",
    durationSeconds: 34,
    chapterKind: "recap" as ChapterKind,
    chapterLabel: "SPRAWDZENIE WZORU",
    purpose: "Read the pattern back off the eight results: the answer's exponent is the sum of the two.",
    mathematicalConcept: "In every worked line, the exponent on the right equals the sum of the two exponents on the left.",
    objects: ["stacked list of the eight products", "highlighted exponents", "conclusion line"],
    animation: "The eight products stack up; the two left exponents and the right exponent are boxed and shown to satisfy m + n = result.",
    camera: "Static landscape frame.",
    text: "wykładnik wyniku = suma wykładników",
    transition: "Cut to the big case.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter13PatternCheck(LongScene):
    chapter_tag_text = "SPRAWDZENIE WZORU"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("SPÓJRZ NA WYKŁADNIKI", 0.62)

        specs = [(2, 2, 3), (3, 2, 2), (5, 1, 3), (10, 2, 1), (2, 3, 3), (7, 2, 1), (3, 1, 4), (2, 4, 4)]
        rows = VGroup(*[
            mtex(rf"{a}^{{{m}}}\cdot {a}^{{{n}}} \;=\; {a}^{{{m}+{n}}} \;=\; {a}^{{{m+n}}}", 0.5, FOREGROUND)
            for (a, m, n) in specs
        ])
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.32)
        rows.move_to([0, -0.2, 0])

        self.play(Write(title), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(r, shift=0.2 * RIGHT) for r in rows], lag_ratio=0.35), run_time=4.8)
        self.wait(1.8)
        self.play(LaggedStart(*[Indicate(r[-1], color=SECONDARY, scale_factor=1.2) for r in rows], lag_ratio=0.25), run_time=3.4)
        self.wait(2.2)

        concl = body("Za każdym razem: wykładnik po prawej  =  suma dwóch wykładników po lewej.", 0.4, SECONDARY)
        concl.move_to([0, -3.3, 0])
        self.play(FadeIn(concl, shift=0.2 * UP), run_time=1.0)
        self.play(Circumscribe(concl, color=ACCENT), run_time=1.6)
        self.wait(9.0)
`
  },
  {
    id: "chapter-14-big-case",
    title: "Duży przypadek",
    className: "Chapter14BigCase",
    durationSeconds: 32,
    chapterKind: "example" as ChapterKind,
    chapterLabel: "DUŻY PRZYPADEK",
    purpose: "Stress-test the law far from the small cases: 2^10 · 2^15 = 2^25.",
    mathematicalConcept: "Ten factors then fifteen more is twenty-five factors; 1024 · 32768 = 33 554 432 = 2^25.",
    objects: ["strip of 10", "strip of 15", "merged strip of 25", "braces 10 / 15 / 25", "numeric check"],
    animation: "A strip of ten and a strip of fifteen slide together into twenty-five; braces count 10, 15, 25; the plain number checks out.",
    camera: "Static landscape frame.",
    text: "2¹⁰ · 2¹⁵ = 2²⁵ = 33 554 432",
    transition: "Cut to the reason.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter14BigCase(LongScene):
    chapter_tag_text = "DUŻY PRZYPADEK"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("DUŻY PRZYPADEK   —   2¹⁰ · 2¹⁵", 0.58)

        cell = 0.34
        strip_a = factor_strip(10, "2", cell, ACCENT)
        strip_b = factor_strip(15, "2", cell, SECONDARY)
        VGroup(strip_a, strip_b).arrange(RIGHT, buff=0.7).move_to([0, 1.4, 0])

        br_a = Brace(strip_a, DOWN, color=ACCENT)
        br_b = Brace(strip_b, DOWN, color=SECONDARY)
        la = small_label("10 czynników", 0.3, ACCENT).next_to(br_a, DOWN, buff=0.1)
        lb = small_label("15 czynników", 0.3, SECONDARY).next_to(br_b, DOWN, buff=0.1)

        prod = mtex(r"2^{10}\cdot 2^{15}", 0.72, FOREGROUND).move_to([0, -0.7, 0])
        step = mtex(r"= 2^{\,10+15} = 2^{25}", 0.72, SECONDARY).next_to(prod, DOWN, buff=0.4)
        check = mtex(r"1024 \cdot 32768 = 33\,554\,432", 0.6, FOREGROUND).next_to(step, DOWN, buff=0.4)

        self.play(Write(title), run_time=1.4)
        self.play(FadeIn(strip_a, lag_ratio=0.05), GrowFromCenter(br_a), FadeIn(la), run_time=1.2)
        self.play(FadeIn(strip_b, lag_ratio=0.05), GrowFromCenter(br_b), FadeIn(lb), run_time=1.2)
        self.play(Write(prod), run_time=1.0)
        self.wait(1.8)

        merged_pos = strip_a.get_right() + RIGHT * (strip_b.width / 2)
        big = Brace(VGroup(strip_a.copy(), strip_b.copy().move_to(merged_pos)), DOWN, color=FOREGROUND)
        big_l = small_label("25 czynników", 0.32, FOREGROUND).next_to(big, DOWN, buff=0.12)
        self.play(
            strip_b.animate.move_to(merged_pos),
            FadeOut(br_a), FadeOut(br_b), FadeOut(la), FadeOut(lb),
            run_time=1.4,
        )
        self.play(GrowFromCenter(big), FadeIn(big_l), run_time=0.9)
        self.wait(2.2)
        self.play(TransformFromCopy(VGroup(prod, big_l), step), run_time=1.4)
        self.play(Circumscribe(step, color=SECONDARY), run_time=1.3)
        self.wait(1.6)
        self.play(FadeIn(check, shift=0.2 * UP), run_time=0.9)
        self.wait(2.4)
        note = caption("Bez nowego pomysłu — dwadzieścia pięć dwójek dopisanych do jednego paska.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(8.0)
`
  },
  {
    id: "chapter-15-the-reason",
    title: "Dlaczego to działa",
    className: "Chapter15Reason",
    durationSeconds: 42,
    chapterKind: "principle" as ChapterKind,
    chapterLabel: "DLACZEGO TO DZIAŁA",
    purpose: "Show, generically, that the step can never fail: m factors and n factors are m + n factors by definition.",
    mathematicalConcept: "a^m is m factors, a^n is n factors; concatenation gives m + n factors, so a^m·a^n = a^(m+n).",
    objects: ["generic factor strip m", "generic factor strip n", "merged strip", "braces m / n / m+n", "identity line"],
    animation: "A generic a-strip of m and one of n slide together; braces read m, n, then m+n; the identity is written and circled.",
    camera: "Static landscape frame.",
    text: "m czynników + n czynników = (m + n) czynników",
    transition: "Cut to the one-law view.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter15Reason(LongScene):
    chapter_tag_text = "DLACZEGO TO DZIAŁA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("DLACZEGO KROK NIE MOŻE ZAWIEŚĆ", 0.56)

        cell = 0.66
        strip_a = factor_strip(3, "a", cell, ACCENT)
        strip_b = factor_strip(4, "a", cell, SECONDARY)
        VGroup(strip_a, strip_b).arrange(RIGHT, buff=1.1).move_to([-2.4, 1.4, 0])
        dots_a = small_label("(m czynników)", 0.3, ACCENT).next_to(strip_a, UP, buff=0.25)
        dots_b = small_label("(n czynników)", 0.3, SECONDARY).next_to(strip_b, UP, buff=0.25)

        e1 = mtex(r"a^{m} = \underbrace{a\cdot a\cdots a}_{m}", 0.6, FOREGROUND).move_to([2.7, 1.9, 0])
        e2 = mtex(r"a^{n} = \underbrace{a\cdot a\cdots a}_{n}", 0.6, FOREGROUND).move_to([2.7, 0.7, 0])
        e3 = mtex(r"a^{m}\cdot a^{n} = \underbrace{a\cdot a\cdots a}_{m+n} = a^{m+n}", 0.62, SECONDARY).move_to([0, -1.6, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(strip_a, lag_ratio=0.1), FadeIn(dots_a), run_time=1.1)
        self.play(Write(e1), run_time=1.1)
        self.play(FadeIn(strip_b, lag_ratio=0.1), FadeIn(dots_b), run_time=1.1)
        self.play(Write(e2), run_time=1.1)
        self.wait(2.4)

        merged_pos = strip_a.get_right() + RIGHT * (strip_b.width / 2)
        brace = Brace(VGroup(strip_a.copy(), strip_b.copy().move_to(merged_pos)), DOWN, color=FOREGROUND)
        brace_l = small_label("m + n czynników", 0.32, FOREGROUND).next_to(brace, DOWN, buff=0.14)
        self.play(strip_b.animate.move_to(merged_pos), FadeOut(dots_a), FadeOut(dots_b), run_time=1.4)
        self.play(GrowFromCenter(brace), FadeIn(brace_l), run_time=0.9)
        self.wait(2.2)
        self.play(Write(e3), run_time=1.8)
        self.play(Circumscribe(e3, color=SECONDARY), run_time=1.5)
        self.wait(2.6)
        note = caption("Dopisanie n czynników do m czynników zawsze daje m + n. To sama definicja wykładnika.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(8.5)
`
  },
  {
    id: "chapter-16-one-law",
    title: "Jedno prawo, każda reguła",
    className: "Chapter16OneLaw",
    durationSeconds: 46,
    chapterKind: "principle" as ChapterKind,
    chapterLabel: "JEDNO PRAWO",
    purpose: "Derive (a^m)^n, a^0 and a^-n as the only choices that keep 'exponents add' true.",
    mathematicalConcept: "(a^m)^n = a^(mn); a^0 = 1 forced by a^m·a^0 = a^m; a^-n = 1/a^n forced by a^n·a^-n = 1.",
    objects: ["three stacked derivations", "numeric check under each"],
    animation: "Three panels fade in one at a time; each states the requirement, then the forced value, then a numeric check.",
    camera: "Static landscape frame.",
    text: "(aᵐ)ⁿ = aᵐⁿ   ·   a⁰ = 1   ·   a⁻ⁿ = 1/aⁿ",
    transition: "Cut to roots.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter16OneLaw(LongScene):
    chapter_tag_text = "JEDNO PRAWO"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JEDNO PRAWO, KAŻDA REGUŁA", 0.58)

        p1 = VGroup(
            subhead("1  ·  potęga potęgi", 0.42, ACCENT),
            mtex(r"\left(a^{m}\right)^{n} = \underbrace{a^{m}\cdot a^{m}\cdots a^{m}}_{n} = a^{m+m+\cdots+m} = a^{mn}", 0.5, FOREGROUND),
            mtex(r"\left(2^{3}\right)^{2} = 2^{6} = 64", 0.46, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        p2 = VGroup(
            subhead("2  ·  wykładnik zero", 0.42, ACCENT),
            mtex(r"a^{m}\cdot a^{0} = a^{m+0} = a^{m} \quad\Rightarrow\quad a^{0} = 1", 0.5, FOREGROUND),
            mtex(r"2^{3}\cdot 2^{0} = 2^{3} \quad\Rightarrow\quad 2^{0} = 1", 0.46, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        p3 = VGroup(
            subhead("3  ·  wykładnik ujemny", 0.42, ACCENT),
            mtex(r"a^{n}\cdot a^{-n} = a^{0} = 1 \quad\Rightarrow\quad a^{-n} = \tfrac{1}{a^{n}}", 0.5, FOREGROUND),
            mtex(r"2^{3}\cdot 2^{-3} = 2^{0} = 1 \quad\Rightarrow\quad 2^{-3} = \tfrac{1}{8}", 0.46, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        col = VGroup(p1, p2, p3).arrange(DOWN, aligned_edge=LEFT, buff=0.5).move_to([0, -0.3, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(p1, shift=0.2 * UP), run_time=1.1)
        self.wait(3.6)
        self.play(FadeIn(p2, shift=0.2 * UP), run_time=1.1)
        self.wait(3.6)
        self.play(FadeIn(p3, shift=0.2 * UP), run_time=1.1)
        self.wait(3.0)
        note = caption("Nic nie zakładamy. Każda reguła to jedyny wybór, przy którym dodawanie wykładników dalej działa.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.play(LaggedStart(*[Indicate(p[-2], color=SECONDARY) for p in (p1, p2, p3)], lag_ratio=0.3), run_time=2.6)
        self.wait(7.5)
`
  },
  {
    id: "chapter-17-roots",
    title: "Pierwiastek jako wykładnik 1/n",
    className: "Chapter17Roots",
    durationSeconds: 40,
    chapterKind: "principle" as ChapterKind,
    chapterLabel: "PIERWIASTEK = 1/n",
    purpose: "Force a^(1/n) to be the n-th root by the power-of-a-power law.",
    mathematicalConcept: "(a^(1/n))^n = a^(n·1/n) = a^1 = a, so a^(1/n) is the number whose n-th power is a.",
    objects: ["requirement line", "forced conclusion", "three numeric roots"],
    animation: "The requirement (a^(1/n))^n = a is written, the conclusion 'n-th root' lands, three cases check out.",
    camera: "Static landscape frame.",
    text: "a^(1/n) = ⁿ√a",
    transition: "Cut to the algebra.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter17Roots(LongScene):
    chapter_tag_text = "PIERWIASTEK = 1/n"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("PIERWIASTEK TO WYKŁADNIK  1/n", 0.56)

        req = mtex(r"\left(a^{\frac{1}{n}}\right)^{n} = a^{\,n\cdot \frac{1}{n}} = a^{1} = a", 0.7, FOREGROUND).move_to([0, 1.7, 0])
        concl = mtex(r"a^{\frac{1}{n}} \;=\; \sqrt[n]{a}", 0.8, SECONDARY).move_to([0, 0.4, 0])
        concl_note = small_label("liczba, której n-ta potęga daje a", 0.32, MUTED).next_to(concl, DOWN, buff=0.3)

        cases = VGroup(
            mtex(r"9^{\frac{1}{2}} = \sqrt{9} = 3 \quad\text{bo}\quad 3^{2} = 9", 0.5, FOREGROUND),
            mtex(r"8^{\frac{1}{3}} = \sqrt[3]{8} = 2 \quad\text{bo}\quad 2^{3} = 8", 0.5, FOREGROUND),
            mtex(r"2^{\frac{1}{2}} = \sqrt{2} \approx 1{,}41", 0.5, FOREGROUND),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.34)
        cases.move_to([0, -2.0, 0])

        self.play(Write(title), run_time=1.5)
        self.play(Write(req), run_time=1.8)
        self.wait(2.8)
        self.play(TransformFromCopy(req, concl), run_time=1.4)
        self.play(FadeIn(concl_note, shift=0.2 * UP), run_time=0.8)
        self.play(Circumscribe(concl, color=ACCENT), run_time=1.4)
        self.wait(2.4)
        self.play(LaggedStart(*[FadeIn(c, shift=0.2 * RIGHT) for c in cases], lag_ratio=0.55), run_time=3.8)
        self.wait(2.6)
        note = caption("Ten sam wzór na potęgę potęgi. Ułamek w wykładniku jest wymuszony, nie wymyślony.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(8.0)
`
  },
  {
    id: "chapter-18-algebra",
    title: "Algebra",
    className: "Chapter18Algebra",
    durationSeconds: 40,
    chapterKind: "algebra" as ChapterKind,
    chapterLabel: "ALGEBRA",
    purpose: "Collect every rule as a one-line consequence of a^m·a^n = a^(m+n).",
    mathematicalConcept: "From the additive law: (a^m)^n = a^mn, a^0 = 1, a^-n = 1/a^n, a^(1/n) = n-th root, a^m/a^n = a^(m-n).",
    objects: ["central law", "table of five derived rules", "one-line closing"],
    animation: "The law is written large; five derived rules fade in beneath, each tagged 'from adding exponents'.",
    camera: "Static landscape frame.",
    text: "aᵐ · aⁿ = aᵐ⁺ⁿ  →  every other rule",
    transition: "Cut to the recap.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter18Algebra(LongScene):
    chapter_tag_text = "ALGEBRA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("WSZYSTKO Z JEDNEJ LINIJKI", 0.58)

        law = mtex(r"a^{m}\cdot a^{n} \;=\; a^{m+n}", 0.9, ACCENT).move_to([0, 2.0, 0])
        header = small_label("każda reguła — z tego jednego prawa:", 0.34, MUTED).move_to([0, 0.95, 0])

        rules = VGroup(
            mtex(r"\left(a^{m}\right)^{n} = a^{mn}", 0.52, FOREGROUND),
            mtex(r"a^{0} = 1", 0.52, FOREGROUND),
            mtex(r"a^{-n} = \dfrac{1}{a^{n}}", 0.52, FOREGROUND),
            mtex(r"a^{\frac{1}{n}} = \sqrt[n]{a}", 0.52, FOREGROUND),
            mtex(r"\dfrac{a^{m}}{a^{n}} = a^{m-n}", 0.52, FOREGROUND),
        ).arrange_in_grid(rows=3, cols=2, buff=(1.7, 0.55))
        rules.move_to([0, -1.15, 0])

        self.play(Write(title), run_time=1.5)
        self.play(Write(law), run_time=1.6)
        self.play(Indicate(law, color=ACCENT, scale_factor=1.06), run_time=1.4)
        self.play(FadeIn(header, shift=0.2 * UP), run_time=0.8)
        self.wait(1.2)
        for r in rules:
            self.play(FadeIn(r, shift=0.2 * RIGHT), run_time=0.9)
            self.wait(0.4)
        self.wait(2.2)
        self.play(LaggedStart(*[Indicate(r, color=SECONDARY) for r in rules], lag_ratio=0.3), run_time=2.8)
        note = caption("Jedno prawo u podstaw. Wszystko inne jest jego konsekwencją.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(8.5)
`
  },
  {
    id: "chapter-19-recap",
    title: "Podsumowanie",
    className: "Chapter19Recap",
    durationSeconds: 38,
    chapterKind: "recap" as ChapterKind,
    chapterLabel: "PODSUMOWANIE",
    purpose: "Restate the worked cases and the single reason behind them.",
    mathematicalConcept: "Every worked case is one instance of a^m·a^n = a^(m+n); every rule follows from it.",
    objects: ["ledger of the eight cases", "mini merged strip", "one-line reason"],
    animation: "The case ledger rebuilds, the strip merges once more, and the reason line lands.",
    camera: "Static landscape frame.",
    text: "JEDEN RUCH, CIĄGLE TEN SAM",
    transition: "Cut to the outro.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter19Recap(LongScene):
    chapter_tag_text = "PODSUMOWANIE"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JEDEN RUCH, CIĄGLE TEN SAM", 0.6)

        specs = [(2, 2, 3), (3, 2, 2), (5, 1, 3), (10, 2, 1), (2, 3, 3), (7, 2, 1), (3, 1, 4), (2, 4, 4)]
        ledger = VGroup(*[
            mtex(rf"{a}^{{{m}}}\cdot {a}^{{{n}}} = {a}^{{{m+n}}}", 0.46, FOREGROUND)
            for (a, m, n) in specs
        ]).arrange_in_grid(rows=4, cols=2, buff=(1.2, 0.3), flow_order="dr")
        ledger.move_to([0, 1.15, 0])

        cell = 0.5
        strip_a = factor_strip(2, "a", cell, ACCENT)
        strip_b = factor_strip(3, "a", cell, SECONDARY)
        VGroup(strip_a, strip_b).arrange(RIGHT, buff=0).move_to([-2.4, -1.35, 0])
        mini = mtex(r"a^{m}\cdot a^{n} = a^{m+n}", 0.58, SECONDARY).move_to([2.2, -1.35, 0])

        reason = statement("Wykładnik liczy czynniki.\nPrzy mnożeniu czynniki się sumują.", 0.44)
        reason.move_to([0, -2.9, 0])

        self.play(Write(title), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(r, shift=0.2 * RIGHT) for r in ledger], lag_ratio=0.35), run_time=4.4)
        self.wait(2.6)
        self.play(FadeIn(strip_a, lag_ratio=0.1), FadeIn(strip_b, lag_ratio=0.1), run_time=0.9)
        self.play(TransformFromCopy(VGroup(strip_a, strip_b), mini), run_time=1.2)
        self.wait(2.0)
        self.play(Write(reason), run_time=1.8)
        self.play(Circumscribe(reason, color=ACCENT, buff=0.3), run_time=1.6)
        self.wait(8.5)
`
  },
  {
    id: "chapter-20-outro",
    title: "Koniec",
    className: "Chapter20Outro",
    durationSeconds: 22,
    chapterKind: "outro" as ChapterKind,
    chapterLabel: "KONIEC",
    purpose: "Hold the one law and the five rules it produces.",
    mathematicalConcept: "a^m·a^n = a^(m+n) is the whole content; the rest is reading it in different directions.",
    objects: ["final law", "five rules", "tagline"],
    animation: "The law holds; the five rules fade in small beneath it; the tagline lands.",
    camera: "Quiet final landscape frame.",
    text: "aᵐ · aⁿ = aᵐ⁺ⁿ",
    transition: "End card.",
    code:
      COMMON_IMPORTS +
      String.raw`

class Chapter20Outro(LongScene):
    chapter_tag_text = "KONIEC"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        law = mtex(r"a^{m}\cdot a^{n} \;=\; a^{m+n}", 0.95, FOREGROUND).move_to([0, 1.6, 0])

        rules = VGroup(
            mtex(r"\left(a^{m}\right)^{n} = a^{mn}", 0.5, MUTED),
            mtex(r"a^{0} = 1", 0.5, MUTED),
            mtex(r"a^{-n} = \tfrac{1}{a^{n}}", 0.5, MUTED),
            mtex(r"a^{\frac{1}{n}} = \sqrt[n]{a}", 0.5, MUTED),
            mtex(r"\dfrac{a^{m}}{a^{n}} = a^{m-n}", 0.5, MUTED),
        ).arrange(DOWN, buff=0.3).move_to([0, -0.9, 0])

        tag = caption("Każda reguła potęg to jedno zdanie, czytane w różne strony.")

        self.play(Write(law), run_time=2.0)
        self.wait(1.5)
        self.play(LaggedStart(*[FadeIn(r, shift=0.15 * UP) for r in rules], lag_ratio=0.5), run_time=3.6)
        self.play(FadeIn(tag, shift=0.2 * UP), run_time=1.0)
        self.wait(2.6)
        self.play(Indicate(law, color=SECONDARY, scale_factor=1.04), run_time=1.6)
        self.wait(6.0)
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

import type {AuthoredScene, ExampleAuthoring, SectionAuthoring} from "./types";
import type {BandType} from "../skeletons";

// THEORY authoring for `ciag-arytmetyczny` — full episode.
// Every authored scene is one archetype call plus its content; no custom staging.

const HDR = `from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
`;

function scene(
  band: BandType,
  index: number,
  total: number,
  className: string,
  tag: string,
  archImport: string,
  body: string,
  meta: {title: string; still: string; standalone?: boolean; short?: string}
): AuthoredScene {
  const py =
    HDR +
    `from support.archetypes import ${archImport}\n\n\n` +
    `class ${className}(LessonScene):\n` +
    `    def construct(self):\n` +
    `        self.add_texture()\n` +
    `        self.add_scene_tag(${JSON.stringify(`${tag}  ·  ${index} / ${total}`)})\n` +
    body +
    `\n`;
  return {
    band,
    index,
    title: meta.title,
    sceneLabel: `${tag}  ·  ${index} / ${total}`,
    standalone: meta.standalone ?? false,
    stillMoment: meta.still,
    shortHook: meta.short,
    py
  };
}

// ---------------------------------------------------------------------------
// HOOK x2
// ---------------------------------------------------------------------------
const hook: AuthoredScene[] = [
  scene("hook", 1, 2, "Hook1", "WPROWADZENIE", "stage_figure",
    `        vals = [3, 7, 11, 15, 19]
        tiles = VGroup()
        for v in vals:
            box = RoundedRectangle(corner_radius=0.12, width=1.2, height=1.0,
                                   stroke_color=MUTED, stroke_width=2,
                                   fill_color=ACCENT, fill_opacity=0.14)
            tiles.add(VGroup(box, Text(str(v), font=FONT, weight=BOLD, color=FOREGROUND).scale(0.58).move_to(box)))
        tiles.arrange(RIGHT, buff=0.85)
        dots = Text("...", font=FONT, color=MUTED).scale(0.8).next_to(tiles, RIGHT, buff=0.35)
        arcs = VGroup()
        for i in range(len(vals) - 1):
            a = CurvedArrow(tiles[i][0].get_top() + 0.05 * UP, tiles[i + 1][0].get_top() + 0.05 * UP,
                            angle=-TAU / 7, color=SECONDARY, stroke_width=3, tip_length=0.15)
            arcs.add(VGroup(a, small_label("+4", 0.32, SECONDARY).next_to(a, UP, buff=0.03)))
        stage_figure(self, VGroup(tiles, dots, arcs),
            question="Ten ciąg rośnie o 4. Którym z kolei wyrazem jest liczba 403?",
            caption="Bez wzoru trzeba by wypisać setki wyrazów. Ze wzorem — jedno działanie.")`,
    {title: "Hook — the ladder", still: "tile ladder 3·7·11·15 with +4 arcs", standalone: true,
     short: "To zadanie z ciągów wraca na maturze co roku."}),

  scene("hook", 2, 2, "Hook2", "WPROWADZENIE", "stage_figure",
    `        s = MathTex(r"1 + 2 + 3 + 4 + \\cdots + 99 + 100", color=FOREGROUND).scale(0.85)
        stage_figure(self, s,
            question="Ile to jest 1 + 2 + 3 + ... + 100?",
            caption="Gauss policzył to w pamięci jako dziecko. Za chwilę Ty też.")`,
    {title: "Hook — the long sum", still: "1 + 2 + ... + 100 written out", standalone: true,
     short: "Dodasz sto liczb w pięć sekund — bez kalkulatora."})
];

// ---------------------------------------------------------------------------
// INTUITION x4
// ---------------------------------------------------------------------------
const intuition: AuthoredScene[] = [
  scene("intuition", 1, 4, "Intuition1", "INTUICJA", "stage_figure",
    `        axis = NumberLine(x_range=[0, 16, 4], length=8.0, include_numbers=False,
                          include_ticks=False, color=MUTED)
        d1 = Dot(axis.n2p(2), radius=0.1, color=ACCENT)
        d2 = Dot(axis.n2p(6), radius=0.1, color=ACCENT)
        l1 = mtex("a_1", 0.5).next_to(axis.n2p(2), DOWN, buff=0.3)
        l2 = mtex("a_2", 0.5).next_to(axis.n2p(6), DOWN, buff=0.3)
        arc = CurvedArrow(axis.n2p(2) + 0.12 * UP, axis.n2p(6) + 0.12 * UP,
                          angle=-TAU / 7, color=SECONDARY, stroke_width=3, tip_length=0.18)
        rl = small_label("+ r", 0.42, SECONDARY).next_to(arc, UP, buff=0.05)
        stage_figure(self, VGroup(axis, d1, d2, l1, l2, arc, rl),
            question="Każdy następny wyraz to poprzedni plus ta sama liczba r.",
            caption="Tę stałą liczbę r nazywamy różnicą ciągu.")`,
    {title: "Intuition — one step of r", still: "number line, one +r hop a_1 to a_2", standalone: true}),

  scene("intuition", 2, 4, "Intuition2", "INTUICJA", "stage_figure",
    `        axis = NumberLine(x_range=[0, 20, 4], length=9.5, include_numbers=False,
                          include_ticks=False, color=MUTED)
        pts = [0, 4, 8, 12, 16]
        dots = VGroup(*[Dot(axis.n2p(p), radius=0.09, color=ACCENT) for p in pts])
        labs = VGroup(*[mtex(f"a_{{{i+1}}}", 0.46).next_to(axis.n2p(p), DOWN, buff=0.3)
                        for i, p in enumerate(pts)])
        hops = VGroup()
        for i in range(4):
            a = CurvedArrow(axis.n2p(pts[i]) + 0.12 * UP, axis.n2p(pts[i + 1]) + 0.12 * UP,
                            angle=-TAU / 7, color=SECONDARY, stroke_width=3, tip_length=0.16)
            hops.add(VGroup(a, small_label("+ r", 0.34, SECONDARY).next_to(a, UP, buff=0.04)))
        stage_figure(self, VGroup(axis, dots, labs, hops),
            question="Ten sam krok r powtarza się, wyraz po wyrazie.",
            caption="Kroki są równe — to właśnie znaczy 'arytmetyczny'.")`,
    {title: "Intuition — equal steps", still: "number line, four equal +r hops"}),

  scene("intuition", 3, 4, "Intuition3", "INTUICJA", "stage_figure",
    `        axis = NumberLine(x_range=[0, 20, 4], length=9.5, include_numbers=False,
                          include_ticks=False, color=MUTED)
        pts = [0, 4, 8, 12, 16]
        dots = VGroup(*[Dot(axis.n2p(p), radius=0.09, color=ACCENT) for p in pts])
        labs = VGroup(*[mtex(f"a_{{{i+1}}}", 0.46).next_to(axis.n2p(p), DOWN, buff=0.3)
                        for i, p in enumerate(pts)])
        hops = VGroup()
        for i in range(4):
            a = CurvedArrow(axis.n2p(pts[i]) + 0.12 * UP, axis.n2p(pts[i + 1]) + 0.12 * UP,
                            angle=-TAU / 7, color=SECONDARY, stroke_width=3, tip_length=0.16)
            hops.add(a)
        brace = Brace(hops, UP, color=MUTED)
        blab = small_label("n - 1 skoków  (tu 4)", 0.36, MUTED).next_to(brace, UP, buff=0.12)
        stage_figure(self, VGroup(axis, dots, labs, hops, brace, blab),
            question="Od pierwszego wyrazu do n-tego robimy n - 1 skoków.",
            caption="O jeden mniej niż numer wyrazu — stąd nawias (n - 1) we wzorze.")`,
    {title: "Intuition — n minus 1 steps", still: "brace over the hops: n - 1 skoków", standalone: true}),

  scene("intuition", 4, 4, "Intuition4", "INTUICJA", "stage_figure",
    `        def mini(vals, col, label):
            ax = NumberLine(x_range=[min(vals) - 2, max(vals) + 2, 100], length=3.2,
                            include_numbers=False, include_ticks=False, color=MUTED)
            ds = VGroup(*[Dot(ax.n2p(v), radius=0.07, color=col) for v in vals])
            return VGroup(ax, ds, small_label(label, 0.3, MUTED).next_to(ax, DOWN, buff=0.3))
        m1 = mini([1, 3, 5, 7], GREEN, "r > 0 : rośnie")
        m2 = mini([7, 5, 3, 1], RED, "r < 0 : maleje")
        m3 = mini([4, 4, 4, 4], MUTED, "r = 0 : stały")
        stage_figure(self, VGroup(m1, m2, m3).arrange(RIGHT, buff=0.9),
            question="Znak różnicy r od razu mówi, jak zachowuje się ciąg.",
            caption="Nie trzeba nic liczyć — wystarczy spojrzeć na r.")`,
    {title: "Intuition — monotonicity from r", still: "three mini number lines: up / down / flat"})
];

// ---------------------------------------------------------------------------
// DEFINITION x5
// ---------------------------------------------------------------------------
const definition: AuthoredScene[] = [
  scene("definition", 1, 5, "Definition1", "DEFINICJA", "stage_figure",
    `        slots = VGroup()
        for i in range(1, 6):
            box = Square(side_length=1.0, stroke_color=MUTED, stroke_width=2, fill_opacity=0)
            slots.add(VGroup(box, mtex(f"a_{i}", 0.42, ACCENT).next_to(box, DOWN, buff=0.2)))
        slots.arrange(RIGHT, buff=0.35)
        dots = Text("...", font=FONT, color=MUTED).scale(0.8).next_to(slots, RIGHT, buff=0.3)
        stage_figure(self, VGroup(slots, dots),
            question="Ciąg to ponumerowana lista: na miejscu numer n stoi n-ty wyraz.",
            caption="Wzór ogólny to przepis: podajesz numer, dostajesz wyraz.")`,
    {title: "Definition — a sequence is a numbered list", still: "row of indexed slots a_1..a_5"}),

  scene("definition", 2, 5, "Definition2", "DEFINICJA", "stage_card",
    `        stage_card(self,
            centerpiece=r"r = a_{n+1} - a_{n}",
            annotations=[("a_{n+1}", "wyraz następny")],
            strip=r"13,\\ 9,\\ 5,\\ 1 : \\quad r = 9 - 13 = -4",
            caption="Zawsze następny minus poprzedni — nie odwrotnie.")`,
    {title: "Definition — the difference r", still: "r = a_(n+1) - a_n with a numeric strip"}),

  scene("definition", 3, 5, "Definition3", "DEFINICJA", "stage_card",
    `        stage_card(self,
            centerpiece=r"a_n = a_1 + (n-1)\\cdot r",
            annotations=[("(n-1)", "liczba skoków po r")],
            strip=r"a_1=4,\\ r=4 : \\quad a_{10} = 4 + 9\\cdot 4 = 40",
            caption="Znasz a_1 i r — policzysz dowolny wyraz bez wypisywania poprzednich.")`,
    {title: "Definition — the nth-term formula", still: "a_n = a_1 + (n-1) r with (n-1) called out",
     standalone: true}),

  scene("definition", 4, 5, "Definition4", "DEFINICJA", "stage_derivation",
    `        stage_derivation(self, symbolic=[
            r"a_n = a_1 + (n-1)\\cdot r",
            r"a_n = a_1 + rn - r",
            r"a_n = rn + (a_1 - r)",
        ], caption="To funkcja liniowa zmiennej n: współczynnik przy n to różnica r.")`,
    {title: "Definition — a_n is linear in n", still: "a_n = rn + (a_1 - r)"}),

  scene("definition", 5, 5, "Definition5", "DEFINICJA", "stage_card",
    `        stage_card(self,
            centerpiece=r"2\\,a_n = a_{n-1} + a_{n+1}",
            annotations=[("a_n", "wyraz środkowy")],
            strip=r"2\\cdot 8 = 5 + 11 \\quad (\\text{dla } 5,\\ 8,\\ 11)",
            caption="Środkowy z trzech kolejnych wyrazów to średnia sąsiadów.")`,
    {title: "Definition — the middle-term condition", still: "2 a_n = a_(n-1) + a_(n+1)"})
];

// ---------------------------------------------------------------------------
// WHY_IT_WORKS x6  (the four-scene column build + two symbolic scenes)
// ---------------------------------------------------------------------------
const FWD = '["2", "5", "8", "11", "14"]';
const REV = '["14", "11", "8", "5", "2"]';
const SUMS = '["16", "16", "16", "16", "16"]';

function whyScene(index: number, body: string): string {
  return (
    `from manim import *\nfrom support.style import LessonScene\n` +
    `from support.archetypes import stage_derivation\n\n\n` +
    `class WhyItWorks${index}(LessonScene):\n` +
    `    def construct(self):\n` +
    `        self.add_texture()\n` +
    `        self.add_scene_tag("DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  ${index} / 6")\n` +
    body +
    `\n`
  );
}

const why: AuthoredScene[] = [
  {
    band: "why_it_works", index: 1, title: "Why — the concrete sum",
    sceneLabel: "DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  1 / 6", standalone: true,
    stillMoment: "S_5 = 2 + 5 + 8 + 11 + 14 as a row",
    shortHook: "Dodaj 2 + 5 + 8 + 11 + 14 w pięć sekund.",
    py: whyScene(1,
      `        stage_derivation(self, columns={
            "rows": [("od przodu", ${FWD})],
            "static_rows": 0,
        }, caption="Bierzemy sumę pięciu wyrazów: 2, 5, 8, 11, 14.")`)
  },
  {
    band: "why_it_works", index: 2, title: "Why — write it backwards",
    sceneLabel: "DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  2 / 6", standalone: false,
    stillMoment: "forwards row over backwards row",
    py: whyScene(2,
      `        stage_derivation(self, columns={
            "rows": [("od przodu", ${FWD}), ("od tyłu", ${REV})],
            "static_rows": 1,
        }, caption="Zapisujemy tę samą sumę jeszcze raz — od końca.")`)
  },
  {
    band: "why_it_works", index: 3, title: "Why — columns collapse",
    sceneLabel: "DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  3 / 6", standalone: false,
    stillMoment: "every column sums to 16",
    py: whyScene(3,
      `        stage_derivation(self, columns={
            "rows": [("od przodu", ${FWD}), ("od tyłu", ${REV}), ("suma", ${SUMS})],
            "static_rows": 2,
        }, caption="Dodajemy kolumnami: każda para daje 16.")`)
  },
  {
    band: "why_it_works", index: 4, title: "Why — the identity",
    sceneLabel: "DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  4 / 6", standalone: true,
    stillMoment: "boxed 2 S_n = n (a_1 + a_n)",
    shortHook: "Cała suma z jednego triku: dodaj ją od przodu i od tyłu.",
    py: whyScene(4,
      `        stage_derivation(self, columns={
            "rows": [("od przodu", ${FWD}), ("od tyłu", ${REV}), ("suma", ${SUMS})],
            "static_rows": 3,
            "combine": r"2\\,S_n = n\\,(a_1 + a_n)",
        }, caption="n par, każda równa: pierwszy + ostatni wyraz. Tutaj: 2·S₅ = 5·16 = 80.")`)
  },
  {
    band: "why_it_works", index: 5, title: "Why — divide by two",
    sceneLabel: "DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  5 / 6", standalone: false,
    stillMoment: "S_n = n (a_1 + a_n) / 2",
    py: whyScene(5,
      `        stage_derivation(self, symbolic=[
            r"2\\,S_n = n\\,(a_1 + a_n)",
            r"S_n = \\dfrac{n\\,(a_1 + a_n)}{2}",
        ], caption="Dzielimy obie strony przez 2 — gotowy wzór na sumę.")`)
  },
  {
    band: "why_it_works", index: 6, title: "Why — the a_1, r form",
    sceneLabel: "DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  6 / 6", standalone: false,
    stillMoment: "S_n = (2 a_1 + (n-1) r) / 2 · n",
    py: whyScene(6,
      `        stage_derivation(self, symbolic=[
            r"S_n = \\dfrac{a_1 + a_n}{2}\\cdot n",
            r"a_n = a_1 + (n-1)\\,r",
            r"S_n = \\dfrac{2a_1 + (n-1)\\,r}{2}\\cdot n",
        ], caption="Nie znasz ostatniego wyrazu? Wstaw wzór na n-ty wyraz.")`)
  }
];

// ---------------------------------------------------------------------------
// SUMMARY x3
// ---------------------------------------------------------------------------
const summary: AuthoredScene[] = [
  scene("summary", 1, 3, "Summary1", "PODSUMOWANIE", "stage_model",
    `        ax = NumberLine(x_range=[0, 9, 3], length=3.2, include_numbers=False,
                        include_ticks=False, color=MUTED)
        ds = VGroup(*[Dot(ax.n2p(3 * i), radius=0.07, color=ACCENT) for i in range(4)])
        hs = VGroup(*[small_label("+r", 0.28, SECONDARY).next_to(ax.n2p(3 * i + 1.5), UP, buff=0.12)
                      for i in range(3)])
        c1 = VGroup(small_label("stały krok", 0.32, MUTED), VGroup(ax, ds, hs)).arrange(DOWN, buff=0.35)
        t = VGroup(*[mtex(str(v), 0.44, FOREGROUND) for v in [2, 5, 8]]).arrange(RIGHT, buff=0.5)
        b = VGroup(*[mtex(str(v), 0.44, ACCENT) for v in [8, 5, 2]]).arrange(RIGHT, buff=0.5)
        VGroup(t, b).arrange(DOWN, buff=0.22)
        pl = Line(LEFT, RIGHT, color=MUTED).match_width(t).next_to(b, DOWN, buff=0.14)
        ss = mtex(r"10 \\quad 10 \\quad 10", 0.4, SECONDARY).next_to(pl, DOWN, buff=0.14)
        c2 = VGroup(small_label("suma: jednakowe pary", 0.32, MUTED),
                    VGroup(t, b, pl, ss)).arrange(DOWN, buff=0.35)
        stage_model(self, cards=[c1, c2],
            tagline="Dwie idee: równe skoki po r, i suma złożona z jednakowych par.")`,
    {title: "Summary — the mental model", still: "hop line + folded pair, two cards", standalone: true}),

  scene("summary", 2, 3, "Summary2", "PODSUMOWANIE", "stage_model",
    `        c1 = VGroup(small_label("n-ty wyraz", 0.34, MUTED),
                    mtex(r"a_n = a_1 + (n-1)\\,r", 0.58, SECONDARY)).arrange(DOWN, buff=0.3)
        c2 = VGroup(small_label("suma n wyrazów", 0.34, MUTED),
                    mtex(r"S_n = \\dfrac{a_1 + a_n}{2}\\cdot n", 0.58, SECONDARY)).arrange(DOWN, buff=0.3)
        stage_model(self, cards=[c1, c2],
            tagline="Dwa wzory, które wystarczą na każde zadanie z tego działu.")`,
    {title: "Summary — the two formulas", still: "a_n and S_n formulas on cards", standalone: true}),

  scene("summary", 3, 3, "Summary3", "PODSUMOWANIE", "stage_figure",
    `        l1 = statement("Wyraz: start plus n - 1 skoków po r.", 0.5, FOREGROUND)
        l2 = statement("Suma: n par (pierwszy + ostatni), przez 2.", 0.5, FOREGROUND)
        stage_figure(self, VGroup(l1, l2).arrange(DOWN, buff=0.6),
            question="Jeśli masz zapamiętać jedno:",
            caption="Ciąg arytmetyczny to jeden stały krok r — cała reszta z niego wynika.")`,
    {title: "Summary — the one takeaway", still: "the two one-line rules", standalone: true,
     short: "Cały dział z jednego zdania."})
];

// ---------------------------------------------------------------------------
// worked examples (THEORY_SUPPORT, easy -> hard) + the matura block
// ---------------------------------------------------------------------------
const exGth00: ExampleAuthoring = {
  sourceId: "g-th-00", className: "Example1", sceneLabel: "PRZYKŁAD 1 / 3",
  ex: {
    label: "PRZYKŁAD 1 / 3", source_id: "g-th-00",
    beats: ["present", "restate", "plan", "substitute", "compute-1", "compute-2", "compute-3", "result", "check", "insight"],
    statement:
      "Ciąg arytmetyczny (a_n) jest określony dla każdej liczby naturalnej n ≥ 1. " +
      "W tym ciągu a₁ = 7, a różnica r = −4. Oblicz dziesiąty wyraz tego ciągu.",
    highlights: ["a₁ = 7", "r = −4", "dziesiąty wyraz"],
    sought: ["a_{10}"],
    plan_formula: "a_{n} = a_{1} + (n-1)\\cdot r",
    plan_note: "Znamy pierwszy wyraz i różnicę — wystarczy wzór na n-ty wyraz.",
    sub_filled: "a_{10} = 7 + (10-1)\\cdot(-4)",
    sub_note: "Wstawiamy a₁ = 7, r = −4 oraz n = 10 w miejsce liter.",
    computes: [
      {kind: "arith", line: "a_{10} = 7 + 9\\cdot(-4)", note: "Najpierw nawias: 10 − 1 = 9 kroków."},
      {kind: "mul_repeat", args: [9, -4], line: "a_{10} = 7 + (-36)", note: "9 · (−4): dodajemy −4 dziewięć razy."},
      {kind: "add_signed", args: [7, -36], line: "a_{10} = -29", note: "7 + (−36): ruszamy w lewo, przez zero."}
    ],
    answer_tex: "a_{10} = -29",
    answer_sentence: "Dziesiąty wyraz ciągu jest równy −29.",
    check: {kind: "list", terms: [7, 3, -1, -5, -9, -13, -17, -21, -25, -29], note: "Dziesiąty wypisany wyraz to −29 — zgadza się."},
    insight: "Do n-tego wyrazu dochodzimy w n − 1 krokach po r — stąd nawias (n − 1), nie n.",
    include_insight: true
  }
};

const exGth01: ExampleAuthoring = {
  sourceId: "g-th-01", className: "Example2", sceneLabel: "PRZYKŁAD 2 / 3",
  ex: {
    label: "PRZYKŁAD 2 / 3", source_id: "g-th-01",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "result", "insight"],
    statement:
      "Dany jest skończony ciąg arytmetyczny: 13, 9, 5, 1, −3. Wyznacz różnicę r tego ciągu " +
      "oraz rozstrzygnij, czy ciąg jest malejący.",
    highlights: ["13, 9, 5, 1, −3", "różnicę r", "malejący"],
    sought: ["r", "monotoniczność"],
    plan_formula: "r = a_{n+1} - a_{n}",
    plan_note: "Różnica to następny wyraz minus poprzedni.",
    computes: [
      {kind: "add_signed", args: [9, -13], line: "r = 9 - 13 = -4", note: "9 − 13: dwie liczby, wynik ujemny."},
      {kind: "arith", line: "5-9 = -4,\\quad 1-5 = -4,\\quad -3-1 = -4", note: "Sprawdzamy pozostałe pary — wszystkie dają −4."}
    ],
    answer_tex: "r = -4,\\ \\text{ciąg malejący}",
    answer_sentence: "Różnica wynosi −4; ponieważ r < 0, ciąg jest malejący.",
    insight: "Znak różnicy rozstrzyga monotoniczność: r < 0 znaczy malejący, bez liczenia wyrazów.",
    include_insight: true
  }
};

const exGth02: ExampleAuthoring = {
  sourceId: "g-th-02", className: "Example3", sceneLabel: "PRZYKŁAD 3 / 3",
  ex: {
    label: "PRZYKŁAD 3 / 3", source_id: "g-th-02",
    beats: ["present", "restate", "plan", "substitute", "compute-1", "compute-2", "result", "check", "insight"],
    statement:
      "Ciąg arytmetyczny (a_n) jest określony dla każdej liczby naturalnej n ≥ 1. " +
      "W tym ciągu a₁ = 3 oraz a₁₂ = 36. Oblicz sumę dwunastu początkowych wyrazów tego ciągu.",
    highlights: ["a₁ = 3", "a₁₂ = 36", "sumę dwunastu"],
    sought: ["S_{12}"],
    plan_formula: "S_{n} = \\dfrac{a_{1} + a_{n}}{2}\\cdot n",
    plan_note: "Znamy pierwszy i ostatni wyraz — używamy wzoru ze średnią.",
    sub_filled: "S_{12} = \\dfrac{3 + 36}{2}\\cdot 12",
    sub_note: "Wstawiamy a₁ = 3, a₁₂ = 36 oraz n = 12.",
    computes: [
      {kind: "arith", line: "S_{12} = \\dfrac{39}{2}\\cdot 12", note: "Licznik ułamka: 3 + 36 = 39."},
      {kind: "frac_cancel", args: [39, 2, 12], line: "S_{12} = 234", note: "12 = 6 · 2 — dwójka skraca się z mianownikiem."}
    ],
    answer_tex: "S_{12} = 234",
    answer_sentence: "Suma dwunastu początkowych wyrazów wynosi 234.",
    check: {kind: "line", line: "234 : 12 = 19{,}5 = \\dfrac{3 + 36}{2}", note: "Średnia wyrazów skrajnych to 19,5 — zgadza się."},
    insight: "Gdy znasz a₁ i aₙ, suma to średnia wyrazów skrajnych razy ich liczba.",
    include_insight: true
  }
};

const exMatura: ExampleAuthoring = {
  sourceId: "matura-a3-a8", className: "Matura", sceneLabel: "NA MATURZE",
  ex: {
    label: "NA MATURZE", source_id: "matura-a3-a8",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "compute-3", "result", "insight"],
    statement:
      "W ciągu arytmetycznym a₃ = 7 oraz a₈ = 22. Wyznacz różnicę r, pierwszy wyraz a₁ " +
      "oraz sumę piętnastu początkowych wyrazów.",
    highlights: ["a₃ = 7", "a₈ = 22", "sumę piętnastu"],
    sought: ["r", "a_1", "S_{15}"],
    plan_formula: "a_{n} = a_{k} + (n-k)\\cdot r",
    plan_note: "Dwa wyrazy o różnych numerach dają jedno równanie na r.",
    computes: [
      {kind: "arith", line: "22 - 7 = (8 - 3)\\,r \\;\\Rightarrow\\; r = 3", note: "a₈ − a₃ = 5r, więc r = 15 : 5 = 3."},
      {kind: "arith", line: "7 = a_1 + 2\\cdot 3 \\;\\Rightarrow\\; a_1 = 1", note: "a₃ = a₁ + 2r, stąd a₁ = 1."},
      {kind: "frac_cancel", args: [44, 2, 30], line: "S_{15} = \\dfrac{2 + 42}{2}\\cdot 15 = 330", note: "S₁₅ = (2a₁ + 14r)/2 · 15 = 44/2 · 15."}
    ],
    answer_tex: "r = 3,\\ a_1 = 1,\\ S_{15} = 330",
    answer_sentence: "Różnica wynosi 3, pierwszy wyraz 1, a suma piętnastu wyrazów to 330.",
    insight: "Te same dwa wzory — na wyraz i na sumę — wracają w niemal każdym arkuszu.",
    include_insight: true
  }
};

export const ciagArytmetyczny: SectionAuthoring = {
  slug: "ciag-arytmetyczny",
  topic: "Ciąg arytmetyczny: n-ty wyraz i suma",
  authored: [...hook, ...intuition, ...definition, ...why, ...summary],
  examples: [exGth00, exGth01, exGth02],
  maturaExample: exMatura
};

import type {ShortSpec} from "./types";

// Short 1: "Punkt na maturze, ktory tracisz przez (n-1)".
// Cut from ciag-arytmetyczny-teoria: intuition-3 (hops + brace), definition-3
// (the boxed (n-1)), and the compute-1 beat of Przykład 1 (9 kroków, nie 10).
// Opens on the actual mistake: a wrong formula that flips to the right one,
// under a matura-framed line. Fast cuts, big content in the vertical middle.

const HDR = `from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, RED
`;

export const ciagArytmetycznyN1: ShortSpec = {
  slug: "ciag-arytmetyczny-punkt-na-maturze",
  title: "Punkt na maturze, który tracisz przez (n − 1)",
  topic: "Ciąg arytmetyczny: punkt na maturze, który tracisz przez (n − 1)",
  fromEpisode: "ciag-arytmetyczny-teoria",
  derivedScenes: ["intuition-3", "definition-3", "example-g-th-00-04-compute-1"],
  scenes: [
    {
      id: "hook",
      className: "Hook",
      title: "Hook",
      durationSeconds: 5,
      derivedFromScene: "",
      narration:
        "Przez ten jeden błąd maturzyści tracą punkt. We wzorze na n-ty wyraz nie ma samego n, jest n minus jeden.",
      py:
        HDR +
        `

class Hook(LessonScene):
    def construct(self):
        self.add_texture()
        head = Text("TRACISZ TU PUNKT\\nNA MATURZE", font=FONT, weight=BOLD,
                    color=FOREGROUND, line_spacing=1.05).scale(0.92)
        head.move_to([0, 4.0, 0])
        if head.width > 8.4:
            head.scale(8.4 / head.width)

        wrong = MathTex(r"a_n", r"=", r"a_1", r"+", r"n", r"\\cdot r").scale(1.5)
        wrong.set_color(FOREGROUND).move_to([0, -0.6, 0])
        right = MathTex(r"a_n", r"=", r"a_1", r"+", r"(n-1)", r"\\cdot r").scale(1.5)
        right.set_color(FOREGROUND).move_to([0, -0.6, 0])
        strike = Line(wrong[4].get_left() + 0.12 * LEFT, wrong[4].get_right() + 0.12 * RIGHT,
                      color=RED, stroke_width=7)

        self.play(FadeIn(head, scale=1.08), run_time=0.4)
        self.play(Write(wrong), run_time=0.5)
        self.wait(0.45)
        self.play(wrong[4].animate.set_color(RED), Create(strike), run_time=0.4)
        self.wait(0.4)
        self.play(FadeOut(strike), ReplacementTransform(wrong, right), run_time=0.55)
        self.play(right[4].animate.set_color(ACCENT),
                  Flash(right[4], color=ACCENT, line_length=0.35), run_time=0.4)
        self.wait(1.4)
`
    },
    {
      id: "hops",
      className: "Hops",
      title: "Cztery skoki do piątego wyrazu",
      durationSeconds: 12,
      derivedFromScene: "intuition-3",
      narration:
        "Ile skoków od pierwszego wyrazu do piątego? Cztery. Do n-tego wyrazu, n minus jeden. Zawsze o jeden mniej niż numer wyrazu.",
      py:
        HDR +
        `from support.style import mtex, small_label
from support.archetypes import stage_figure


class Hops(LessonScene):
    def construct(self):
        self.add_texture()
        axis = NumberLine(x_range=[0, 16, 4], length=6.8, include_numbers=False,
                          include_ticks=False, color=MUTED)
        pts = [0, 4, 8, 12, 16]
        dots = VGroup(*[Dot(axis.n2p(p), radius=0.14, color=ACCENT) for p in pts])
        labs = VGroup(*[mtex(f"a_{{{i+1}}}", 0.62).next_to(axis.n2p(p), DOWN, buff=0.34)
                        for i, p in enumerate(pts)])
        hops = VGroup()
        for i in range(4):
            hops.add(CurvedArrow(axis.n2p(pts[i]) + 0.16 * UP, axis.n2p(pts[i + 1]) + 0.16 * UP,
                                 angle=-TAU / 7, color=SECONDARY, stroke_width=4, tip_length=0.22))
        brace = Brace(hops, UP, color=MUTED)
        blab = small_label("4 skoki  =  n − 1", 0.56, MUTED).next_to(brace, UP, buff=0.16)
        figure = VGroup(axis, dots, labs, hops, brace, blab)
        stage_figure(self, figure,
            question="Ile skoków do piątego wyrazu?",
            caption="Do n-tego wyrazu: n minus jeden skoków.",
            reveal=[
                [Create(axis), *[FadeIn(d, scale=0.5) for d in dots], FadeIn(labs)],
                [LaggedStart(*[Create(h) for h in hops], lag_ratio=0.5)],
                [GrowFromCenter(brace), FadeIn(blab)],
            ],
            pace="fast")
`
    },
    {
      id: "formula",
      className: "Formula",
      title: "We wzorze: (n − 1)",
      durationSeconds: 11,
      derivedFromScene: "definition-3",
      narration:
        "Dlatego we wzorze: a n równa się a jeden plus, w nawiasie n minus jeden, razy r. Ten nawias to liczba skoków, nie numer wyrazu.",
      py:
        HDR +
        `from support.archetypes import stage_card


class Formula(LessonScene):
    def construct(self):
        self.add_texture()
        stage_card(self,
            centerpiece=r"a_n = a_1 + (n-1)\\cdot r",
            annotations=[("(n-1)", "liczba skoków, nie numer wyrazu")],
            caption="Nie n. O jeden mniej.", pace="fast")
`
    },
    {
      id: "instance",
      className: "Instance",
      title: "Dziesiąty wyraz: dziewięć skoków",
      durationSeconds: 11,
      derivedFromScene: "example-g-th-00-04-compute-1",
      narration:
        "Dziesiąty wyraz? Dziewięć skoków, nie dziesięć. A dziesiąte równa się siedem plus dziewięć razy minus cztery, czyli minus dwadzieścia dziewięć.",
      py:
        HDR +
        `from support.archetypes import stage_derivation


class Instance(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, symbolic=[
            r"a_{10} = a_1 + (10-1)\\cdot r",
            r"a_{10} = 7 + 9\\cdot(-4) = -29",
        ], caption="Dziesiąty wyraz: dziewięć skoków, nie dziesięć.", pace="fast")
`
    }
  ]
};

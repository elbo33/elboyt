import type {ShortSpec} from "./types";

// Short 4: the whole idea in one pass. Cut from ciag-arytmetyczny-teoria
// intuition 1..4, compressed to one hop, equal hops, sign of r.

const HDR = `from manim import *
from support.style import LessonScene, FONT, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.archetypes import stage_figure
`;

export const ciagArytmetycznyIntuicja: ShortSpec = {
  slug: "ciag-arytmetyczny-w-30-sekund",
  title: "Ciąg arytmetyczny w trzydzieści sekund",
  topic: "Ciąg arytmetyczny: cała intuicja w trzydzieści sekund",
  fromEpisode: "ciag-arytmetyczny-teoria",
  derivedScenes: ["intuition-1", "intuition-2", "intuition-4"],
  scenes: [
    {
      id: "hook",
      className: "Hook",
      title: "Hook",
      durationSeconds: 4.5,
      derivedFromScene: "",
      narration:
        "Cały ciąg arytmetyczny w trzydzieści sekund. Wszystko sprowadza się do jednego kroku.",
      py:
        HDR +
        `

class Hook(LessonScene):
    def construct(self):
        self.add_texture()
        head = Text("CAŁY CIĄG ARYTMETYCZNY\\nW 30 SEKUND", font=FONT, weight=BOLD,
                    color=FOREGROUND, line_spacing=1.05).scale(0.82)
        if head.width > 8.4:
            head.scale(8.4 / head.width)
        head.move_to([0, 3.8, 0])
        ax = NumberLine(x_range=[0, 8, 4], length=5.4, include_numbers=False,
                        include_ticks=False, color=MUTED).move_to([0, -0.6, 0])
        d1 = Dot(ax.n2p(0), radius=0.16, color=ACCENT)
        d2 = Dot(ax.n2p(4), radius=0.16, color=ACCENT)
        arc = CurvedArrow(ax.n2p(0) + 0.2 * UP, ax.n2p(4) + 0.2 * UP,
                          angle=-TAU / 7, color=SECONDARY, stroke_width=4, tip_length=0.24)
        rl = small_label("+ r", 0.6, SECONDARY).next_to(arc, UP, buff=0.08)
        self.play(FadeIn(head, scale=1.06), run_time=0.4)
        self.play(Create(ax), FadeIn(d1, scale=0.5), run_time=0.4)
        self.play(Create(arc), FadeIn(d2, scale=0.5), FadeIn(rl), run_time=0.5)
        self.wait(1.5)
`
    },
    {
      id: "onestep",
      className: "OneStep",
      title: "Jeden krok",
      durationSeconds: 9,
      derivedFromScene: "intuition-1",
      narration:
        "Każdy następny wyraz to poprzedni plus ta sama liczba r.",
      py:
        HDR +
        `

class OneStep(LessonScene):
    def construct(self):
        self.add_texture()
        ax = NumberLine(x_range=[0, 8, 4], length=6.4, include_numbers=False,
                        include_ticks=False, color=MUTED)
        d1 = Dot(ax.n2p(0), radius=0.15, color=ACCENT)
        d2 = Dot(ax.n2p(4), radius=0.15, color=ACCENT)
        l1 = mtex("a_1", 0.66).next_to(ax.n2p(0), DOWN, buff=0.34)
        l2 = mtex("a_2", 0.66).next_to(ax.n2p(4), DOWN, buff=0.34)
        arc = CurvedArrow(ax.n2p(0) + 0.18 * UP, ax.n2p(4) + 0.18 * UP,
                          angle=-TAU / 7, color=SECONDARY, stroke_width=4, tip_length=0.26)
        rl = small_label("+ r", 0.66, SECONDARY).next_to(arc, UP, buff=0.08)
        stage_figure(self, VGroup(ax, d1, d2, l1, l2, arc, rl),
            question="Poprzedni wyraz plus r.",
            caption="Tę stałą liczbę r nazywamy różnicą.", pace="fast")
`
    },
    {
      id: "equal",
      className: "Equal",
      title: "Równe kroki",
      durationSeconds: 9,
      derivedFromScene: "intuition-2",
      narration:
        "Ten sam krok r, wyraz po wyrazie. Równe skoki, to znaczy arytmetyczny.",
      py:
        HDR +
        `

class Equal(LessonScene):
    def construct(self):
        self.add_texture()
        ax = NumberLine(x_range=[0, 16, 4], length=6.8, include_numbers=False,
                        include_ticks=False, color=MUTED)
        pts = [0, 4, 8, 12, 16]
        dots = VGroup(*[Dot(ax.n2p(p), radius=0.13, color=ACCENT) for p in pts])
        labs = VGroup(*[mtex(f"a_{{{i+1}}}", 0.56).next_to(ax.n2p(p), DOWN, buff=0.32)
                        for i, p in enumerate(pts)])
        hops = VGroup(*[CurvedArrow(ax.n2p(pts[i]) + 0.15 * UP, ax.n2p(pts[i+1]) + 0.15 * UP,
                                    angle=-TAU / 7, color=SECONDARY, stroke_width=4, tip_length=0.2)
                       for i in range(4)])
        stage_figure(self, VGroup(ax, dots, labs, hops),
            question="Ten sam krok, wciąż od nowa.",
            caption="Równe skoki: to znaczy arytmetyczny.",
            reveal=[
                [Create(ax), *[FadeIn(d, scale=0.5) for d in dots], FadeIn(labs)],
                [LaggedStart(*[Create(h) for h in hops], lag_ratio=0.5)],
            ],
            pace="fast")
`
    },
    {
      id: "sign",
      className: "Sign",
      title: "Znak różnicy",
      durationSeconds: 10,
      derivedFromScene: "intuition-4",
      narration:
        "Znak r decyduje. Dodatnie r, ciąg rośnie. Ujemne, maleje. Zero, ciąg stały.",
      py:
        HDR +
        `

class Sign(LessonScene):
    def construct(self):
        self.add_texture()
        def mini(vals, col, label):
            a = NumberLine(x_range=[min(vals) - 2, max(vals) + 2, 100], length=5.4,
                           include_numbers=False, include_ticks=False, color=MUTED)
            ds = VGroup(*[Dot(a.n2p(v), radius=0.1, color=col) for v in vals])
            return VGroup(a, ds, small_label(label, 0.5, MUTED).next_to(a, DOWN, buff=0.34))
        m1 = mini([1, 3, 5, 7], GREEN, "r > 0 : rośnie")
        m2 = mini([7, 5, 3, 1], RED, "r < 0 : maleje")
        m3 = mini([4, 4, 4, 4], MUTED, "r = 0 : stały")
        stage_figure(self, VGroup(m1, m2, m3).arrange(DOWN, buff=0.55),
            question="Sam znak r wystarczy.",
            caption="Nie trzeba nic liczyć.", pace="fast")
`
    }
  ]
};

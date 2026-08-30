from manim import *
from support.style import LessonScene, FONT, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.archetypes import stage_figure


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


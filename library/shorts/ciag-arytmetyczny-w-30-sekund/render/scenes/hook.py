from manim import *
from support.style import LessonScene, FONT, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.archetypes import stage_figure


class Hook(LessonScene):
    def construct(self):
        self.add_texture()
        head = Text("CAŁY CIĄG ARYTMETYCZNY\nW 30 SEKUND", font=FONT, weight=BOLD,
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


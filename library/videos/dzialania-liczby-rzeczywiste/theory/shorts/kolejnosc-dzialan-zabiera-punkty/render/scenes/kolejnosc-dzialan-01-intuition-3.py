import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class Short_kolejnosc_dzialan_01_intuition_3(LessonScene):
    def construct(self):
        self.add_texture()
        steps = [("()", ACCENT), (r"x^n,\sqrt{x},\log", SECONDARY), (r"\times\ : ", ACCENT), ("+  -", SECONDARY)]
        blocks = VGroup()
        for i, (tex, col) in enumerate(steps):
            box = RoundedRectangle(width=2.15, height=0.9, corner_radius=0.1, color=col, stroke_width=4, fill_color=col, fill_opacity=0.12)
            label = MathTex(tex, color=FOREGROUND).scale(0.48).move_to(box)
            blocks.add(VGroup(box, label))
        blocks.arrange(RIGHT, buff=0.55)
        arrows = VGroup(*[Arrow(blocks[i].get_right(), blocks[i+1].get_left(), color=MUTED, buff=0.12, tip_length=0.15) for i in range(3)])
        stage_figure(self, VGroup(blocks, arrows),
            question="Ten temat oblewa połowę maturzystów",
            caption="Każde wyrażenie przepuszczamy przez te same bramki.",
            reveal=[
                [LaggedStart(*[FadeIn(b, shift=0.15*UP) for b in blocks], lag_ratio=0.18)],
                [LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.15)],
            ])
        hold(self, 1.2)

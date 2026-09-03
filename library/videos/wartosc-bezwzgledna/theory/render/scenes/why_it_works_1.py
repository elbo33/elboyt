import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class AbsWhyTwoSolutions(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  1 / 4")
        axis = NumberLine(x_range=[-1, 9, 1], length=10.4, include_numbers=True, color=MUTED)
        center = Dot(axis.n2p(4), radius=0.12, color=FOREGROUND)
        left = Dot(axis.n2p(1), radius=0.12, color=SECONDARY)
        right = Dot(axis.n2p(7), radius=0.12, color=ACCENT)
        left_arrow = Arrow(axis.n2p(4), axis.n2p(1), buff=0, color=SECONDARY, stroke_width=4, tip_length=0.18)
        right_arrow = Arrow(axis.n2p(4), axis.n2p(7), buff=0, color=ACCENT, stroke_width=4, tip_length=0.18)
        lab = mtex(r"|x-4|=3", 0.76, FOREGROUND).next_to(axis, DOWN, buff=0.72)
        stage_figure(self, VGroup(axis, center, left, right, left_arrow, right_arrow, lab),
            question="Dwie strony osi robią dwa przypadki.",
            caption="Od środka idziemy raz w lewo, raz w prawo.",
            reveal=[
                [Create(axis), FadeIn(center)],
                [GrowArrow(left_arrow), FadeIn(left)],
                [GrowArrow(right_arrow), FadeIn(right)],
                [Write(lab)],
            ])
        hold(self, 1.2)



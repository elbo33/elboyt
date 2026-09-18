import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RealIntervalAxis(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  4 / 4")
        axis = NumberLine(x_range=[-5, 9, 1], length=10.2, include_numbers=True, color=MUTED)
        seg = Line(axis.n2p(-3), axis.n2p(7), color=ACCENT, stroke_width=12).set_opacity(0.75)
        left = Dot(axis.n2p(-3), radius=0.12, color=SECONDARY)
        right = Circle(radius=0.13, color=SECONDARY, stroke_width=5).move_to(axis.n2p(7))
        label = mtex(r"[-3,\ 7)", 0.82, FOREGROUND).next_to(axis, UP, buff=0.55)
        stage_figure(self, VGroup(axis, seg, left, right, label),
            question="Przedział to nie wzór. To fragment osi.",
            caption="Pełny koniec należy, pusty koniec nie należy.",
            reveal=[
                [Create(axis)],
                [Create(seg)],
                [FadeIn(left), FadeIn(right)],
                [Write(label)],
            ])
        hold(self, 1.2)

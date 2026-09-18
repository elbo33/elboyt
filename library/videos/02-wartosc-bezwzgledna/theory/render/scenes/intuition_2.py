import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class AbsFromPoint(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  2 / 4")
        axis = NumberLine(x_range=[-2, 11, 1], length=10.4, include_numbers=False, color=MUTED)
        center = Dot(axis.n2p(6), radius=0.11, color=FOREGROUND)
        left = Dot(axis.n2p(4), radius=0.11, color=SECONDARY)
        right = Dot(axis.n2p(8), radius=0.11, color=ACCENT)
        brace_l = Brace(Line(axis.n2p(4), axis.n2p(6)), UP, color=SECONDARY)
        brace_r = Brace(Line(axis.n2p(6), axis.n2p(8)), UP, color=ACCENT)
        lab_c = small_label("środek: 6", 0.34, FOREGROUND).next_to(center, DOWN, buff=0.56)
        lab_l = small_label("x = 4", 0.34, SECONDARY).next_to(left, DOWN, buff=0.38)
        lab_r = small_label("x = 8", 0.34, ACCENT).next_to(right, DOWN, buff=0.38)
        d_l = small_label("2", 0.34, SECONDARY).next_to(brace_l, UP, buff=0.12)
        d_r = small_label("2", 0.34, ACCENT).next_to(brace_r, UP, buff=0.12)
        formula = mtex(r"|x-6|=2", 0.82, FOREGROUND).next_to(axis, DOWN, buff=0.75)
        stage_figure(self, VGroup(axis, center, left, right, brace_l, brace_r, lab_c, lab_l, lab_r, d_l, d_r, formula),
            question="|x - a| czytamy jako odległość x od a.",
            caption="Tutaj szukamy punktów odległych od 6 o 2.",
            reveal=[
                [Create(axis), FadeIn(center), FadeIn(lab_c)],
                [FadeIn(left), FadeIn(right), FadeIn(lab_l), FadeIn(lab_r)],
                [GrowFromCenter(brace_l), GrowFromCenter(brace_r), FadeIn(d_l), FadeIn(d_r)],
                [Write(formula)],
            ])
        hold(self, 1.2)



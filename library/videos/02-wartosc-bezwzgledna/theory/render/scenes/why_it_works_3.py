import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class AbsWhyOneSolution(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  3 / 4")
        axis = NumberLine(x_range=[-2, 8, 1], length=10, include_numbers=True, color=MUTED)
        center = Dot(axis.n2p(3), radius=0.14, color=SECONDARY)
        pulse = Circle(radius=0.34, color=SECONDARY, stroke_width=5).move_to(center)
        formula = mtex(r"|x-3|=0\Rightarrow x=3", 0.78, FOREGROUND).next_to(axis, DOWN, buff=0.75)
        stage_figure(self, VGroup(axis, center, pulse, formula),
            question="Promień zero zostawia tylko środek.",
            caption="Nie ma lewego i prawego punktu, bo nie wykonujemy żadnego kroku.",
            reveal=[
                [Create(axis), FadeIn(center)],
                [Create(pulse)],
                [Write(formula)],
            ])
        hold(self, 1.2)



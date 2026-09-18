import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RealFinalTakeaway(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("PODSUMOWANIE  ·  2 / 2")
        axis = NumberLine(x_range=[-10, 10, 5], length=10.5, include_numbers=True, color=MUTED)
        dot = Dot(axis.n2p(-4), radius=0.1, color=ACCENT)
        seg = Line(axis.n2p(-3), axis.n2p(7), color=SECONDARY, stroke_width=10).set_opacity(0.7)
        marker = Circle(radius=0.13, color=SECONDARY, stroke_width=4).move_to(axis.n2p(7))
        stage_figure(self, VGroup(axis, dot, seg, marker),
            question="Wynik ma miejsce na osi.",
            caption="Jeśli umiesz go zobaczyć, łatwiej sprawdzić, czy ma sens.",
            reveal=[
                [Create(axis)],
                [FadeIn(dot)],
                [Create(seg), FadeIn(marker)],
                [Circumscribe(VGroup(dot, seg), color=ACCENT)],
            ])
        hold(self, 1.2)

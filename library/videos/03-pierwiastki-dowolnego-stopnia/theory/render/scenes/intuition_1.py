import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RootsEvenPowerMirror(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  1 / 4")
        axis = NumberLine(x_range=[-4, 4, 1], length=9.8, include_numbers=True, color=MUTED)
        left = Dot(axis.n2p(-2), radius=0.11, color=SECONDARY)
        right = Dot(axis.n2p(2), radius=0.11, color=ACCENT)
        lab_l = small_label("-2", 0.34, SECONDARY).next_to(left, DOWN, buff=0.24)
        lab_r = small_label("2", 0.34, ACCENT).next_to(right, DOWN, buff=0.24)
        top = mtex(r"(-2)^4=16\quad\text{i}\quad 2^4=16", 0.68, FOREGROUND).next_to(axis, UP, buff=0.72)
        arcs = VGroup(
            CurvedArrow(left.get_top()+UP*0.12, top.get_left()+DOWN*0.18, angle=-TAU/9, color=SECONDARY, stroke_width=3, tip_length=0.14),
            CurvedArrow(right.get_top()+UP*0.12, top.get_right()+DOWN*0.18, angle=TAU/9, color=ACCENT, stroke_width=3, tip_length=0.14),
        )
        result = mtex(r"\sqrt[4]{16}=2", 0.72, ACCENT).next_to(axis, DOWN, buff=0.72)
        stage_figure(self, VGroup(axis, left, right, lab_l, lab_r, top, arcs, result),
            question="Parzysta potęga gubi znak.",
            caption="Dlatego pierwiastek parzystego stopnia wybiera wynik nieujemny.",
            reveal=[
                [Create(axis), FadeIn(left), FadeIn(right), FadeIn(lab_l), FadeIn(lab_r)],
                [Write(top), Create(arcs)],
                [Write(result)],
            ])
        hold(self, 1.2)



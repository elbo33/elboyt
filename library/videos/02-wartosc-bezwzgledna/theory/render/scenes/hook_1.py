import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class AbsHookDistance(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("WPROWADZENIE  ·  1 / 2")
        axis = NumberLine(x_range=[-8, 8, 2], length=10.5, include_numbers=True, color=MUTED)
        zero = Dot(axis.n2p(0), radius=0.10, color=FOREGROUND)
        left = Dot(axis.n2p(-5), radius=0.12, color=SECONDARY)
        right = Dot(axis.n2p(5), radius=0.12, color=ACCENT)
        lab_left = small_label("-5", 0.38, SECONDARY).next_to(left, UP, buff=0.2)
        lab_zero = small_label("0", 0.34, FOREGROUND).next_to(zero, DOWN, buff=0.25)
        lab_right = small_label("5", 0.38, ACCENT).next_to(right, UP, buff=0.2)
        left_arc = CurvedArrow(axis.n2p(0)+UP*0.35, axis.n2p(-5)+UP*0.35, angle=TAU/8, color=SECONDARY, stroke_width=4, tip_length=0.16)
        right_arc = CurvedArrow(axis.n2p(0)+UP*0.35, axis.n2p(5)+UP*0.35, angle=-TAU/8, color=ACCENT, stroke_width=4, tip_length=0.16)
        distance = mtex(r"|{-5}|=5\quad\text{i}\quad |5|=5", 0.62, FOREGROUND).next_to(axis, DOWN, buff=0.75)
        stage_figure(self, VGroup(axis, zero, left, right, lab_left, lab_zero, lab_right, left_arc, right_arc, distance),
            question="Wartość bezwzględna to odległość od zera.",
            caption="Znak liczby może być inny, ale odległość jest taka sama.",
            reveal=[
                [Create(axis), FadeIn(zero), FadeIn(lab_zero)],
                [FadeIn(left), FadeIn(right), FadeIn(lab_left), FadeIn(lab_right)],
                [Create(left_arc), Create(right_arc)],
                [Write(distance)],
            ])
        hold(self, 1.2)



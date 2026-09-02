import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RealRootAbs(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  2 / 4")
        axis = NumberLine(x_range=[-8, 8, 2], length=10, include_numbers=True, color=MUTED)
        left = Dot(axis.n2p(-7), radius=0.1, color=RED)
        right = Dot(axis.n2p(7), radius=0.1, color=GREEN)
        sq_left = MathTex(r"(-7)^2=49", color=RED).scale(0.55).next_to(left, UP, buff=0.45)
        sq_right = MathTex(r"7^2=49", color=GREEN).scale(0.55).next_to(right, UP, buff=0.45)
        root = MathTex(r"\sqrt{49}=7", color=SECONDARY).scale(0.8).move_to([0, -1.65, 0])
        stage_figure(self, VGroup(axis, left, right, sq_left, sq_right, root),
            question="Dwie liczby mają ten sam kwadrat, ale pierwiastek wybiera nieujemną.",
            caption="Dlatego \sqrt{a^2} daje |a|.",
            reveal=[
                [Create(axis)],
                [FadeIn(left), Write(sq_left)],
                [FadeIn(right), Write(sq_right)],
                [Write(root), Circumscribe(root, color=SECONDARY)],
            ])
        hold(self, 1.2)

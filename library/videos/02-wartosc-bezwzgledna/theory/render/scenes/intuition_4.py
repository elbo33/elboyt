import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class AbsWholeExpression(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  4 / 4")
        expr = mtex(r"|x-5|", 1.05, FOREGROUND)
        whole = SurroundingRectangle(expr, color=ACCENT, buff=0.2, corner_radius=0.1)
        wrong = VGroup(mtex(r"x+5", 0.72, RED), Cross(mtex(r"x+5", 0.72, RED), stroke_color=RED, stroke_width=5)).arrange(RIGHT, buff=0.45)
        right = mtex(r"\begin{cases}x-5,&x\ge 5\\5-x,&x<5\end{cases}", 0.62, SECONDARY)
        group = VGroup(VGroup(expr, whole), wrong, right).arrange(DOWN, buff=0.65)
        stage_figure(self, group,
            question="Jeśli zmieniasz znak, zmieniasz całe wyrażenie.",
            caption="Moduł nie zmienia pojedynczych minusów na plusy.",
            reveal=[
                [Write(expr), Create(whole)],
                [FadeIn(wrong)],
                [Write(right)],
            ])
        hold(self, 1.2)



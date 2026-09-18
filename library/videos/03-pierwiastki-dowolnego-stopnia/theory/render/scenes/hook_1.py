import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RootsHookQuestion(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("WPROWADZENIE  ·  1 / 2")
        root = mtex(r"\sqrt[n]{a}=b", 0.98, ACCENT)
        power = mtex(r"b^n=a", 0.98, SECONDARY)
        VGroup(root, power).arrange(RIGHT, buff=1.1)
        arrow = Arrow(root.get_right(), power.get_left(), color=MUTED, buff=0.22, stroke_width=4, tip_length=0.18)
        ask = small_label("szukamy liczby b", 0.36, MUTED).next_to(root, DOWN, buff=0.38)
        check = small_label("sprawdzamy potęgą", 0.36, MUTED).next_to(power, DOWN, buff=0.38)
        stage_figure(self, VGroup(root, arrow, power, ask, check),
            question="Pierwiastek pyta o podstawę potęgi.",
            caption="Nie zgadujemy symbolu. Pytamy, jaka liczba po potędze daje a.",
            reveal=[
                [Write(root)],
                [Create(arrow), Write(power)],
                [FadeIn(ask, shift=0.12*UP), FadeIn(check, shift=0.12*UP)],
            ])
        hold(self, 1.2)



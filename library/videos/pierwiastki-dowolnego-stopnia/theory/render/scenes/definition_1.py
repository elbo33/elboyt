import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RootsAnatomy(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  1 / 5")
        expr = mtex(r"\sqrt[n]{a}=b", 1.08, FOREGROUND)
        degree = small_label("stopień", 0.34, ACCENT).move_to([-1.58, 1.1, 0])
        radicand = small_label("liczba pod pierwiastkiem", 0.34, SECONDARY).move_to([0.1, -1.06, 0])
        result = small_label("wynik", 0.34, GREEN).move_to([2.0, 1.03, 0])
        a1 = Arrow(degree.get_bottom(), expr.get_center()+LEFT*1.08+UP*0.34, color=ACCENT, buff=0.12, stroke_width=3, tip_length=0.14)
        a2 = Arrow(radicand.get_top(), expr.get_center()+LEFT*0.05+DOWN*0.10, color=SECONDARY, buff=0.12, stroke_width=3, tip_length=0.14)
        a3 = Arrow(result.get_bottom(), expr.get_center()+RIGHT*1.66+UP*0.02, color=GREEN, buff=0.12, stroke_width=3, tip_length=0.14)
        check = mtex(r"b^n=a", 0.78, SECONDARY).next_to(expr, DOWN, buff=1.15)
        stage_figure(self, VGroup(expr, degree, radicand, result, a1, a2, a3, check),
            question="Pierwiastek ma trzy role do rozpoznania.",
            caption="Czytamy zapis od stopnia, przez liczbę podpierwiastkową, do sprawdzenia potęgą.",
            reveal=[
                [Write(expr)],
                [FadeIn(degree), Create(a1)],
                [FadeIn(radicand), Create(a2)],
                [FadeIn(result), Create(a3)],
                [Write(check)],
            ])
        hold(self, 1.2)



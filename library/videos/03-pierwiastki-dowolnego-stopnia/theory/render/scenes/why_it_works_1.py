import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RootsWhyEvenNoNegative(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  1 / 4")
        axis = NumberLine(x_range=[-4, 4, 1], length=9.2, include_numbers=True, color=MUTED)
        dots = VGroup()
        arrows = VGroup()
        for x, col in [(-3, SECONDARY), (-2, SECONDARY), (-1, SECONDARY), (1, ACCENT), (2, ACCENT), (3, ACCENT)]:
            dot = Dot(axis.n2p(x), radius=0.075, color=col)
            target = [axis.n2p(x)[0], 1.45, 0]
            arrows.add(Arrow(dot.get_top()+UP*0.05, target, color=col, stroke_width=2.8, tip_length=0.12))
            dots.add(dot)
        floor = NumberLine(x_range=[0, 10, 2], length=8.0, include_numbers=True, color=MUTED).shift(UP*1.45)
        zero_wall = Line(floor.n2p(0)+DOWN*0.35, floor.n2p(0)+UP*0.7, color=RED, stroke_width=5)
        label = mtex(r"x^2\ge0", 0.76, FOREGROUND).next_to(floor, UP, buff=0.42)
        bad = mtex(r"\sqrt[4]{-16}", 0.66, RED).next_to(axis, DOWN, buff=0.62)
        stage_figure(self, VGroup(axis, dots, arrows, floor, zero_wall, label, bad),
            question="Parzysta potęga nigdy nie ląduje poniżej zera.",
            caption="Dlatego parzysty pierwiastek z liczby ujemnej nie istnieje w R.",
            reveal=[
                [Create(axis), FadeIn(dots)],
                [LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.08), Create(floor), Create(zero_wall)],
                [Write(label)],
                [Write(bad)],
            ])
        hold(self, 1.2)



import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RealClosedOps(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  2 / 4")
        center = Circle(radius=1.05, color=ACCENT, stroke_width=5)
        rlabel = mtex(r"R", 1.0, FOREGROUND).move_to(center)
        ops = VGroup()
        for angle, op in [(0, "+"), (PI/2, "\\cdot"), (PI, "-"), (3*PI/2, ":")]:
            pos = 2.45*np.array([np.cos(angle), np.sin(angle), 0])
            token = VGroup(Circle(radius=0.36, color=SECONDARY, stroke_width=3), mtex(op, 0.58, SECONDARY)).move_to(pos)
            arrow = Arrow(token.get_center(), center.get_center(), color=MUTED, buff=0.48, stroke_width=3, tip_length=0.16)
            ops.add(token, arrow)
        warn = small_label(": przez zero odpada", 0.35, RED).next_to(ops[-2], DOWN, buff=0.2)
        stage_figure(self, VGroup(center, rlabel, ops, warn),
            question="Działanie bierze liczby z osi i zwraca liczbę z osi.",
            caption="Wyjątek, który trzeba widzieć od razu: dzielenie przez zero.",
            reveal=[
                [Create(center), FadeIn(rlabel)],
                [LaggedStart(*[FadeIn(ops[i], shift=0.12*IN) for i in range(0, len(ops), 2)], lag_ratio=0.18)],
                [LaggedStart(*[Create(ops[i]) for i in range(1, len(ops), 2)], lag_ratio=0.12)],
                [FadeIn(warn)],
            ])
        hold(self, 1.2)

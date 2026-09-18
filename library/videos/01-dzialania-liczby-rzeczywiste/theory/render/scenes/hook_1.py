import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RealHookAxis(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("WPROWADZENIE  ·  1 / 2")
        axis = NumberLine(x_range=[-8, 8, 2], length=10.5, include_numbers=True, color=MUTED)
        points = VGroup()
        labels = VGroup()
        for x, lab, col in [(-4, "-4", SECONDARY), (-2, "-2", ACCENT), (0, "0", FOREGROUND), (2.65, "√7", SECONDARY), (5, "5", ACCENT)]:
            dot = Dot(axis.n2p(x), radius=0.09, color=col)
            text = small_label(lab, 0.34, col).next_to(dot, UP, buff=0.18)
            points.add(dot)
            labels.add(text)
        sweep = Line(axis.n2p(-6.5), axis.n2p(6.5), color=ACCENT, stroke_width=10).set_opacity(0.28)
        stage_figure(self, VGroup(axis, sweep, points, labels),
            question="Jedna oś, wiele rodzajów liczb.",
            caption="Najpierw obraz osi, potem rachunek i przedziały.",
            reveal=[
                [Create(axis)],
                [Create(sweep)],
                [LaggedStart(*[FadeIn(m, shift=0.12*UP) for m in points], lag_ratio=0.18)],
                [LaggedStart(*[FadeIn(m) for m in labels], lag_ratio=0.12)],
            ])
        hold(self, 1.2)

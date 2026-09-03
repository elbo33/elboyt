import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class AbsMirrorAxis(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  1 / 4")
        axis = NumberLine(x_range=[-7, 7, 1], length=10.6, include_numbers=True, color=MUTED)
        pairs = VGroup()
        for x, col in [(-6, SECONDARY), (-3, SECONDARY), (3, ACCENT), (6, ACCENT)]:
            dot = Dot(axis.n2p(x), radius=0.08, color=col)
            lab = small_label(str(x), 0.28, col).next_to(dot, UP if x in [-6, 3] else DOWN, buff=0.18)
            pairs.add(dot, lab)
        mirror = DashedLine(axis.n2p(0)+DOWN*0.85, axis.n2p(0)+UP*1.25, color=FOREGROUND, stroke_width=3)
        label = mtex(r"|{-3}|=|3|=3", 0.66, FOREGROUND).next_to(axis, DOWN, buff=0.8)
        stage_figure(self, VGroup(axis, pairs, mirror, label),
            question="Moduł składa oś jak lustro.",
            caption="Punkty symetryczne względem zera mają ten sam moduł.",
            reveal=[
                [Create(axis), Create(mirror)],
                [LaggedStart(*[FadeIn(m, shift=0.10*UP) for m in pairs], lag_ratio=0.12)],
                [Write(label)],
            ])
        hold(self, 1.2)



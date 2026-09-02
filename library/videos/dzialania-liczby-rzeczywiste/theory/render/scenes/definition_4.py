import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RealEndpointRule(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  4 / 4")
        def marker(tex, filled):
            axis = Line(LEFT*1.2, RIGHT*1.2, color=MUTED, stroke_width=4)
            mark = Dot(ORIGIN, color=SECONDARY, radius=0.1) if filled else Circle(radius=0.11, color=SECONDARY, stroke_width=4)
            lab = mtex(tex, 0.46, FOREGROUND).next_to(axis, DOWN, buff=0.25)
            return VGroup(axis, mark, lab)
        c1 = marker(r"x<7", False)
        c2 = marker(r"x\le 7", True)
        c3 = marker(r"x>-3", False)
        stage_model(self, cards=[c1, c2, c3], tagline="Ostry znak daje pusty koniec. Nieostry znak daje pełny koniec.")
        hold(self, 1.2)

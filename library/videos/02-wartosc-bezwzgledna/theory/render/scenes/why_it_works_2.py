import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class AbsWhyNoNegative(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  2 / 4")
        gauge = NumberLine(x_range=[0, 8, 1], length=8.2, include_numbers=True, color=MUTED)
        zero_wall = Line(gauge.n2p(0)+DOWN*0.45, gauge.n2p(0)+UP*0.9, color=RED, stroke_width=6)
        bad = mtex(r"|x+2|=-6", 0.82, RED).next_to(gauge, UP, buff=0.7)
        note = small_label("odległość zaczyna się od 0", 0.38, FOREGROUND).next_to(gauge, DOWN, buff=0.55)
        stage_figure(self, VGroup(gauge, zero_wall, bad, note),
            question="Moduł nie może dać wyniku ujemnego.",
            caption="Jeśli prawa strona jest ujemna, kończymy od razu.",
            reveal=[
                [Create(gauge), Create(zero_wall)],
                [Write(bad)],
                [FadeIn(note)],
            ])
        hold(self, 1.2)



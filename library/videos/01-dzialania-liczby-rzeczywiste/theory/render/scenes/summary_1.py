import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RealSummary(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("PODSUMOWANIE  ·  1 / 2")
        c1 = VGroup(mtex(r"()", 0.8, ACCENT), small_label("ukryte nawiasy", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        c2 = VGroup(mtex(r"\sqrt{x^2}=|x|", 0.52, SECONDARY), small_label("znak wyniku", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        c3 = VGroup(mtex(r"[a,b)", 0.72, GREEN), small_label("końce na osi", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Najpierw obraz. Potem rachunek. Na końcu kontrola.")
        hold(self, 1.2)

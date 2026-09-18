import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RealMaturaBridge(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  3 / 3")
        c1 = VGroup(mtex(r"(-2)^3", 0.62, ACCENT), small_label("znak i nawias", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        c2 = VGroup(mtex(r"\log_2(1/16)", 0.56, SECONDARY), small_label("pytanie o wykładnik", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        c3 = VGroup(mtex(r"[-3,7)", 0.7, GREEN), small_label("fragment osi", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Matura miesza te trzy obrazy w jednym poleceniu.")
        hold(self, 1.2)

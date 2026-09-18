import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RootsEvenDefinition(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  2 / 5")
        c1 = VGroup(small_label("stopień parzysty", 0.34, ACCENT), mtex(r"n=2,4,6,\ldots", 0.50, FOREGROUND)).arrange(DOWN, buff=0.22)
        c2 = VGroup(small_label("wejście", 0.34, MUTED), mtex(r"a\ge0", 0.72, SECONDARY)).arrange(DOWN, buff=0.22)
        c3 = VGroup(small_label("wynik", 0.34, MUTED), mtex(r"b\ge0", 0.72, GREEN)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Przy parzystym stopniu kontrolujemy znak przed liczeniem i po liczeniu.")
        hold(self, 1.2)



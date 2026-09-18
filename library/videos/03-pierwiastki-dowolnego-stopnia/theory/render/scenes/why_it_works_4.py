import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RootsWhyCommonDegree(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  4 / 4")
        c1 = VGroup(small_label("pierwiastek 3 stopnia", 0.32, ACCENT), mtex(r"\sqrt[3]{3}=\sqrt[12]{3^4}", 0.48, FOREGROUND)).arrange(DOWN, buff=0.22)
        c2 = VGroup(small_label("pierwiastek 4 stopnia", 0.32, SECONDARY), mtex(r"\sqrt[4]{5}=\sqrt[12]{5^3}", 0.48, FOREGROUND)).arrange(DOWN, buff=0.22)
        c3 = VGroup(small_label("wspólny stopień", 0.32, MUTED), mtex(r"NWW(3,4)=12", 0.56, GREEN)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Porównywanie różnych stopni działa jak wspólny mianownik.")
        hold(self, 1.2)



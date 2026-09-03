import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class AbsSummaryImages(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("PODSUMOWANIE  ·  1 / 3")
        c1 = VGroup(small_label("obraz", 0.34, MUTED), mtex(r"|x|=d(x,0)", 0.56, ACCENT)).arrange(DOWN, buff=0.25)
        c2 = VGroup(small_label("środek", 0.34, MUTED), mtex(r"|x-a|=r", 0.66, SECONDARY)).arrange(DOWN, buff=0.25)
        c3 = VGroup(small_label("przypadki", 0.34, MUTED), mtex(r"r<0,\ r=0,\ r>0", 0.48, FOREGROUND)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Jeśli widzisz odległość, widzisz też liczbę rozwiązań.")
        hold(self, 1.2)



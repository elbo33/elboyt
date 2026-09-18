import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RootsDomainSwitch(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  3 / 4")
        c1 = VGroup(small_label("n parzyste", 0.34, ACCENT), mtex(r"\sqrt[n]{a}", 0.58, FOREGROUND), small_label("a ≥ 0", 0.34, MUTED)).arrange(DOWN, buff=0.18)
        c2 = VGroup(small_label("n nieparzyste", 0.34, SECONDARY), mtex(r"\sqrt[n]{a}", 0.58, FOREGROUND), small_label("a dowolne", 0.34, MUTED)).arrange(DOWN, buff=0.18)
        stage_model(self, cards=[c1, c2], tagline="Stopień pierwiastka decyduje, czy liczba ujemna jest dozwolona.")
        hold(self, 1.2)



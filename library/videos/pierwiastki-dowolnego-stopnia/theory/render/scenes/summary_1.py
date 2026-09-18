import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RootsSummaryChecks(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("PODSUMOWANIE  ·  1 / 3")
        c1 = VGroup(small_label("1", 0.34, ACCENT), mtex(r"n\ \text{parzyste?}", 0.48, FOREGROUND)).arrange(DOWN, buff=0.22)
        c2 = VGroup(small_label("2", 0.34, SECONDARY), mtex(r"a<0?", 0.64, FOREGROUND)).arrange(DOWN, buff=0.22)
        c3 = VGroup(small_label("3", 0.34, GREEN), mtex(r"k\sqrt[n]{b}", 0.54, FOREGROUND)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Każde zadanie zaczyna się od stopnia, znaku i pełnych potęg.")
        hold(self, 1.2)



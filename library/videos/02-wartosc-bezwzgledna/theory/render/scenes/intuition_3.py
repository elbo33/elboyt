import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class AbsRadiusCases(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  3 / 4")
        c1 = VGroup(small_label("r < 0", 0.34, RED), mtex(r"|x-a|=-2", 0.52, FOREGROUND), small_label("brak punktów", 0.30, MUTED)).arrange(DOWN, buff=0.18)
        c2 = VGroup(small_label("r = 0", 0.34, SECONDARY), mtex(r"|x-a|=0", 0.52, FOREGROUND), small_label("jeden punkt", 0.30, MUTED)).arrange(DOWN, buff=0.18)
        c3 = VGroup(small_label("r > 0", 0.34, GREEN), mtex(r"|x-a|=r", 0.52, FOREGROUND), small_label("dwa punkty", 0.30, MUTED)).arrange(DOWN, buff=0.18)
        stage_model(self, cards=[c1, c2, c3], tagline="O liczbie rozwiązań decyduje znak prawej strony.")
        hold(self, 1.2)



import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_derivation


class RealLogQuestion(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  3 / 4")
        stage_derivation(self, symbolic=[
            r"\log_a b = c",
            r"a^c = b",
            r"\log_2\left(\frac{1}{16}\right)=?",
            r"2^{?}=\frac{1}{16}",
        ], caption="Logarytm pyta o brakujący wykładnik.")
        hold(self, 1.2)

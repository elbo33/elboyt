import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_derivation


class RealExpressionFlow(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  1 / 3")
        stage_derivation(self, symbolic=[
            r"(-2)^3 + 3\cdot(-4) - \sqrt{49}",
            r"-8 + 3\cdot(-4) - 7",
            r"-8 + (-12) - 7",
            r"-27",
        ], caption="Każda linia robi tylko jeden typ ruchu.")
        hold(self, 1.2)

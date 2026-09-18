import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_derivation


class RealMinusPower(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  1 / 4")
        stage_derivation(self, symbolic=[
            r"(-2)^4 = (-2)(-2)(-2)(-2) = 16",
            r"-2^4 = -(2^4) = -16",
        ], caption="Nawias decyduje, co jest podstawą potęgi.")
        hold(self, 1.2)

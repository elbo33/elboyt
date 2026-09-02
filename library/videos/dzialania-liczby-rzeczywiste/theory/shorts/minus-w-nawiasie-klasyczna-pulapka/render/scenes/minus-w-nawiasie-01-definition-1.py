import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_derivation


class Short_minus_w_nawiasie_01_definition_1(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, question="90% zdających maturę o tym nie wie", symbolic=[
            r"(-2)^4 = (-2)(-2)(-2)(-2) = 16",
            r"-2^4 = -(2^4) = -16",
        ], caption="Nawias decyduje, co jest podstawą potęgi.")
        hold(self, 1.2)

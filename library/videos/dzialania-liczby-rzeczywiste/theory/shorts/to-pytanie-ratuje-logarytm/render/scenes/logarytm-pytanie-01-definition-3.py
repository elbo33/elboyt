import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_derivation


class Short_logarytm_pytanie_01_definition_3(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, question="To pytanie jest na KAŻDEJ maturze", symbolic=[
            r"\log_a b = c",
            r"a^c = b",
            r"\log_2\left(\frac{1}{16}\right)=?",
            r"2^{?}=\frac{1}{16}",
        ], caption="Logarytm pyta o brakujący wykładnik.")
        hold(self, 1.2)

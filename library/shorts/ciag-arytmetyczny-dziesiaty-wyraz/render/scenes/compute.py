from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED
from support.archetypes import stage_derivation


class Compute(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, symbolic=[
            r"a_{10} = 7 + 9\cdot(-4)",
            r"a_{10} = 7 + (-36)",
        ], caption="Dziewięć skoków po minus cztery.", pace="fast")


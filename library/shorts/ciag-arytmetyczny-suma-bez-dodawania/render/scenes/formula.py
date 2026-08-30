from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED
from support.archetypes import stage_derivation


class Formula(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, symbolic=[
            r"2\,S_n = n\,(a_1 + a_n)",
            r"S_n = \dfrac{n\,(a_1 + a_n)}{2}",
        ], caption="Gotowy wzór na sumę n wyrazów.", pace="fast")


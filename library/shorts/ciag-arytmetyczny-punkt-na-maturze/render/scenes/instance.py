from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, RED
from support.archetypes import stage_derivation


class Instance(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, symbolic=[
            r"a_{10} = a_1 + (10-1)\cdot r",
            r"a_{10} = 7 + 9\cdot(-4) = -29",
        ], caption="Dziesiąty wyraz: dziewięć skoków, nie dziesięć.", pace="fast")


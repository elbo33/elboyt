from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED
from support.archetypes import stage_derivation


class Substitute(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, symbolic=[
            r"a_n = a_1 + (n-1)\cdot r",
            r"a_{10} = 7 + (10-1)\cdot(-4)",
        ], caption="Same litery zamienione na dane.", pace="fast")


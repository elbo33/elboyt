from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, RED
from support.archetypes import stage_card


class Formula(LessonScene):
    def construct(self):
        self.add_texture()
        stage_card(self,
            centerpiece=r"a_n = a_1 + (n-1)\cdot r",
            annotations=[("(n-1)", "liczba skoków, nie numer wyrazu")],
            caption="Nie n. O jeden mniej.", pace="fast")


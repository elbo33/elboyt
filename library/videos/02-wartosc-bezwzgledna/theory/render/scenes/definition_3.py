import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_card


class AbsEquationBasic(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  3 / 5")
        stage_card(self,
            centerpiece=r"|x|=c\iff x=c\ \lor\ x=-c",
            annotations=[(r"c", "odległość od zera")],
            strip=r"c>0:\ 2\quad c=0:\ 1\quad c<0:\ 0",
            caption="Zawsze najpierw sprawdź, czy prawa strona może być odległością.")
        hold(self, 1.2)



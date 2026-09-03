import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_derivation


class AbsDistanceFormula(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  2 / 5")
        stage_derivation(self, symbolic=[
            r"|x|=d(x,0)",
            r"|x-a|=d(x,a)",
            r"d(a,b)=|a-b|=|b-a|",
        ], caption="Kolejność odejmowania w odległości nie zmienia wyniku.")
        hold(self, 1.2)



import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_derivation


class AbsWhyCenterRadius(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  4 / 4")
        stage_derivation(self, symbolic=[
            r"p=-5,\quad q=11",
            r"a=\frac{p+q}{2}=\frac{-5+11}{2}=3",
            r"r=\frac{|q-p|}{2}=\frac{|11-(-5)|}{2}=8",
            r"|x-3|=8",
        ], caption="Dwa rozwiązania wyznaczają środek i promień równania.")
        hold(self, 1.2)



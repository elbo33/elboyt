import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_card


class AbsDefinitionPiecewise(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  1 / 5")
        stage_card(self,
            centerpiece=r"|x|=\begin{cases}x,&x\ge 0\\-x,&x<0\end{cases}",
            strip=r"|7|=7\quad\text{ale}\quad |{-7}|=7",
            caption="Wynik modułu nigdy nie jest ujemny.")
        hold(self, 1.2)



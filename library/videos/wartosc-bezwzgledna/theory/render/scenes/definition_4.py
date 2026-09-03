import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_card


class AbsEquationShifted(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  4 / 5")
        stage_card(self,
            centerpiece=r"|x-a|=r\iff x=a-r\ \lor\ x=a+r",
            strip=r"|x-6|=2\Rightarrow x=4\ \lor\ x=8",
            caption="Dwa rozwiązania są symetryczne względem środka a.")
        hold(self, 1.2)



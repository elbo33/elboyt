import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_card


class RootsSummaryMatura(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("PODSUMOWANIE  ·  3 / 3")
        stage_card(self,
            centerpiece=r"\sqrt[n]{a}=b\iff b^n=a",
            strip=r"n\ \text{parzyste}:\ b\ge0\qquad n\ \text{nieparzyste}:\ znak\ zostaje",
            caption="Na maturze najpierw sprawdź sens pierwiastka, dopiero potem licz.")
        hold(self, 1.2)



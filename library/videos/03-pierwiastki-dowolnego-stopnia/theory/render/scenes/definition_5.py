import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_card


class RootsProductQuotientRules(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  5 / 5")
        stage_card(self,
            centerpiece=r"\sqrt[n]{a\cdot b}=\sqrt[n]{a}\cdot\sqrt[n]{b}",
            strip=r"\sqrt[3]{2}\cdot\sqrt[3]{128}=\sqrt[3]{256}=4",
            caption="Wzory na iloczyn i iloraz stosujemy dopiero po sprawdzeniu warunków.")
        hold(self, 1.2)



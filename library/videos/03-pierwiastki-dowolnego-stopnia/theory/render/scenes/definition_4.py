import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RootsPowerRule(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  4 / 5")
        c1 = VGroup(small_label("n parzyste", 0.34, ACCENT), mtex(r"\sqrt[n]{a^n}=|a|", 0.56, FOREGROUND), mtex(r"\sqrt[4]{(-3)^4}=3", 0.46, SECONDARY)).arrange(DOWN, buff=0.18)
        c2 = VGroup(small_label("n nieparzyste", 0.34, SECONDARY), mtex(r"\sqrt[n]{a^n}=a", 0.56, FOREGROUND), mtex(r"\sqrt[5]{(-3)^5}=-3", 0.46, ACCENT)).arrange(DOWN, buff=0.18)
        stage_model(self, cards=[c1, c2], tagline="Pierwiastek parzysty potrzebuje wartości bezwzględnej. Nieparzysty zachowuje znak.")
        hold(self, 1.2)



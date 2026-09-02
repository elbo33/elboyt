import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RealHookPipeline(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("WPROWADZENIE  ·  2 / 2")
        c1 = VGroup(small_label("zapis", 0.34, MUTED), mtex(r"(-2)^3 + 3(-4) - \sqrt{49}", 0.48, SECONDARY)).arrange(DOWN, buff=0.25)
        c2 = VGroup(small_label("oś", 0.34, MUTED), NumberLine(x_range=[-30, 5, 5], length=4.2, include_numbers=False, color=MUTED)).arrange(DOWN, buff=0.25)
        c3 = VGroup(small_label("przedział", 0.34, MUTED), mtex(r"[-3,\ 7)", 0.7, ACCENT)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Rachunek ma prowadzić do sensownego miejsca na osi.")
        hold(self, 1.2)

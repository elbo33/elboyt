import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RootsHookPipeline(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("WPROWADZENIE  ·  2 / 2")
        c1 = VGroup(small_label("stopień", 0.34, MUTED), mtex(r"n", 0.82, ACCENT)).arrange(DOWN, buff=0.22)
        c2 = VGroup(small_label("znak", 0.34, MUTED), mtex(r"a<0?", 0.66, SECONDARY)).arrange(DOWN, buff=0.22)
        c3 = VGroup(small_label("postać", 0.34, MUTED), mtex(r"k\sqrt[n]{b}", 0.58, FOREGROUND)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Najpierw stopień. Potem znak. Na końcu uproszczenie.")
        hold(self, 1.2)



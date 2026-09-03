import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class AbsHookPipeline(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("WPROWADZENIE  ·  2 / 2")
        c1 = VGroup(small_label("obraz", 0.34, MUTED), mtex(r"|x|=d(x,0)", 0.58, ACCENT)).arrange(DOWN, buff=0.25)
        c2 = VGroup(small_label("definicja", 0.34, MUTED), mtex(r"|x|=x\ \text{albo}\ -x", 0.50, FOREGROUND)).arrange(DOWN, buff=0.25)
        c3 = VGroup(small_label("równanie", 0.34, MUTED), mtex(r"|x-a|=r", 0.72, SECONDARY)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Najpierw widzimy odległość, potem dopiero rozbijamy przypadki.")
        hold(self, 1.2)



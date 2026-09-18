import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RealSets(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  1 / 4")
        rings = VGroup()
        specs = [(5.6, 3.2, "R", FOREGROUND), (4.4, 2.35, "W", ACCENT), (3.1, 1.55, "C", SECONDARY), (1.75, 0.85, "N", GREEN)]
        for w, h, lab, col in specs:
            e = Ellipse(width=w, height=h, color=col, stroke_width=4)
            t = small_label(lab, 0.44, col).move_to(e.get_right() + LEFT*0.45 + UP*0.18)
            rings.add(e, t)
        nw = small_label("NW", 0.42, MUTED).move_to([-2.0, -0.95, 0])
        stage_figure(self, VGroup(rings, nw),
            question="Rodziny liczb są zagnieżdżone.",
            caption="Naturalne, całkowite i wymierne siedzą w R; niewymierne wypełniają resztę osi.",
            reveal=[
                [Create(rings[0]), FadeIn(rings[1])],
                [Create(rings[2]), FadeIn(rings[3])],
                [Create(rings[4]), FadeIn(rings[5])],
                [Create(rings[6]), FadeIn(rings[7]), FadeIn(nw)],
            ])
        hold(self, 1.2)

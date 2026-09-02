import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RealIntervalOps(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  2 / 3")
        base = NumberLine(x_range=[-5, 8, 1], length=9.6, include_numbers=True, color=MUTED)
        a = base.copy().shift(UP*0.85)
        b = base.copy().shift(DOWN*0.55)
        seg_a = Line(a.n2p(-4), a.n2p(3), color=ACCENT, stroke_width=10)
        seg_b = Line(b.n2p(-1), b.n2p(7), color=SECONDARY, stroke_width=10)
        overlap = Line(base.n2p(-1), base.n2p(3), color=GREEN, stroke_width=14).shift(DOWN*1.9)
        lab_a = small_label("A", 0.4, ACCENT).next_to(a, LEFT, buff=0.3)
        lab_b = small_label("B", 0.4, SECONDARY).next_to(b, LEFT, buff=0.3)
        lab_o = small_label("A ∩ B", 0.4, GREEN).next_to(overlap, LEFT, buff=0.3)
        stage_figure(self, VGroup(a, b, seg_a, seg_b, overlap, lab_a, lab_b, lab_o),
            question="Część wspólna to miejsce zamalowane dwa razy.",
            caption="Dlatego przedziały rysujemy jeden pod drugim w tej samej skali.",
            reveal=[
                [Create(a), Create(b), FadeIn(lab_a), FadeIn(lab_b)],
                [Create(seg_a)],
                [Create(seg_b)],
                [Create(overlap), FadeIn(lab_o)],
            ])
        hold(self, 1.2)

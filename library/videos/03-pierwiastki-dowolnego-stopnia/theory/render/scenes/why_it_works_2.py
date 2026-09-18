import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RootsWhySimilarTerms(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  2 / 4")
        left = VGroup(mtex(r"\sqrt[3]{54}", 0.58, FOREGROUND), mtex(r"=3\sqrt[3]{2}", 0.58, ACCENT)).arrange(DOWN, buff=0.25)
        mid = VGroup(mtex(r"\sqrt[3]{16}", 0.58, FOREGROUND), mtex(r"=2\sqrt[3]{2}", 0.58, ACCENT)).arrange(DOWN, buff=0.25)
        right = VGroup(mtex(r"\sqrt[3]{250}", 0.58, FOREGROUND), mtex(r"=5\sqrt[3]{2}", 0.58, ACCENT)).arrange(DOWN, buff=0.25)
        blocks = VGroup(left, mid, right).arrange(RIGHT, buff=1.0)
        common = mtex(r"\sqrt[3]{2}", 0.82, SECONDARY).next_to(blocks, DOWN, buff=0.75)
        brace = Brace(blocks, DOWN, color=SECONDARY)
        stage_figure(self, VGroup(blocks, brace, common),
            question="Pierwiastki podobne trzeba najpierw odsłonić.",
            caption="Dopiero po uproszczeniu widać, które składniki mają ten sam rdzeń.",
            reveal=[
                [FadeIn(left, shift=0.12*UP)],
                [FadeIn(mid, shift=0.12*UP)],
                [FadeIn(right, shift=0.12*UP)],
                [GrowFromCenter(brace), Write(common)],
            ])
        hold(self, 1.2)



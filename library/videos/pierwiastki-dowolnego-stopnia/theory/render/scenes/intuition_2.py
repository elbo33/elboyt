import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RootsOddPowerSign(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  2 / 4")
        axis = NumberLine(x_range=[-9, 9, 3], length=10.4, include_numbers=True, color=MUTED)
        neg = Dot(axis.n2p(-8), radius=0.11, color=SECONDARY)
        pos = Dot(axis.n2p(8), radius=0.11, color=ACCENT)
        lab_neg = mtex(r"(-2)^3=-8", 0.54, SECONDARY).next_to(neg, UP, buff=0.32)
        lab_pos = mtex(r"2^3=8", 0.54, ACCENT).next_to(pos, UP, buff=0.32)
        root_neg = mtex(r"\sqrt[3]{-8}=-2", 0.72, SECONDARY).next_to(axis, DOWN, buff=0.76)
        root_pos = mtex(r"\sqrt[3]{8}=2", 0.72, ACCENT).next_to(root_neg, RIGHT, buff=1.0)
        stage_figure(self, VGroup(axis, neg, pos, lab_neg, lab_pos, root_neg, root_pos),
            question="Nieparzysta potęga zachowuje stronę osi.",
            caption="Dlatego pierwiastek nieparzystego stopnia może mieć wynik ujemny.",
            reveal=[
                [Create(axis)],
                [FadeIn(neg), Write(lab_neg)],
                [FadeIn(pos), Write(lab_pos)],
                [Write(root_neg), Write(root_pos)],
            ])
        hold(self, 1.2)



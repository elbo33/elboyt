import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RootsOddDefinition(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  3 / 5")
        axis = NumberLine(x_range=[-5, 5, 1], length=9.8, include_numbers=True, color=MUTED)
        left = Dot(axis.n2p(-3), radius=0.1, color=SECONDARY)
        right = Dot(axis.n2p(3), radius=0.1, color=ACCENT)
        left_tex = mtex(r"(-3)^5=-243", 0.54, SECONDARY).next_to(left, UP, buff=0.34)
        right_tex = mtex(r"3^5=243", 0.54, ACCENT).next_to(right, UP, buff=0.34)
        neg_root = mtex(r"\sqrt[5]{-243}=-3", 0.62, SECONDARY).next_to(axis, DOWN, buff=0.62)
        pos_root = mtex(r"\sqrt[5]{243}=3", 0.62, ACCENT).next_to(neg_root, RIGHT, buff=0.8)
        stage_figure(self, VGroup(axis, left, right, left_tex, right_tex, neg_root, pos_root),
            question="Nieparzysty stopień działa po obu stronach osi.",
            caption="Liczba ujemna pod pierwiastkiem nieparzystym daje ujemny wynik.",
            reveal=[
                [Create(axis)],
                [FadeIn(left), Write(left_tex)],
                [FadeIn(right), Write(right_tex)],
                [Write(neg_root), Write(pos_root)],
            ])
        hold(self, 1.2)



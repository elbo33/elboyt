import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_model


class RootsSummaryRules(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("PODSUMOWANIE  ·  2 / 3")
        c1 = VGroup(mtex(r"\sqrt[2k]{a^{2k}}=|a|", 0.50, ACCENT), small_label("parzysty stopień", 0.30, MUTED)).arrange(DOWN, buff=0.22)
        c2 = VGroup(mtex(r"\sqrt[2k+1]{a^{2k+1}}=a", 0.46, SECONDARY), small_label("nieparzysty stopień", 0.30, MUTED)).arrange(DOWN, buff=0.22)
        c3 = VGroup(mtex(r"\sqrt[n]{k^n b}=k\sqrt[n]{b}", 0.44, GREEN), small_label("pełne paczki", 0.30, MUTED)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Nie zapamiętuj wszystkiego osobno. Pilnuj, co robi stopień.")
        hold(self, 1.2)



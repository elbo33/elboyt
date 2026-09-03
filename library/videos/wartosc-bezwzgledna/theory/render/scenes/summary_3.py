import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_card


class AbsSummaryNext(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("PODSUMOWANIE  ·  3 / 3")
        stage_card(self,
            centerpiece=r"|x-a|=r",
            strip=r"x=a-r\quad\text{lub}\quad x=a+r",
            caption="Na maturze najpierw rysuj w głowie oś, potem licz.")
        hold(self, 1.2)



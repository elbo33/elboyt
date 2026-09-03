import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_derivation


class AbsTwoModules(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  5 / 5")
        stage_derivation(self, symbolic=[
            r"|f(x)|=|g(x)|",
            r"f(x)=g(x)\quad\text{lub}\quad f(x)=-g(x)",
            r"\text{minus przed }g(x)\text{ wymaga nawiasu}",
        ], caption="Dwa moduły po dwóch stronach dają dwie alternatywy.")
        hold(self, 1.2)



import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_derivation


class AbsSummaryMistakes(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("PODSUMOWANIE  ·  2 / 3")
        stage_derivation(self, symbolic=[
            r"|x-4|=3\Rightarrow x=7\ \text{lub}\ x=1",
            r"|x+2|=-6\Rightarrow \varnothing",
            r"|x-5|\neq x+5",
        ], caption="Te trzy kontrole chronią większość punktów w zadaniach z modułem.")
        hold(self, 1.2)



from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED
from support.archetypes import stage_derivation


class Forwards(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, columns={
            "rows": [("od przodu", ["2", "5", "8"])],
            "static_rows": 0,
        }, caption="Dodajemy dwa, pięć, osiem.", pace="fast")


from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED
from support.archetypes import stage_derivation


class Fold(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, columns={
            "rows": [("od przodu", ["2", "5", "8"]), ("od tyłu", ["8", "5", "2"]),
                     ("suma", ["10", "10", "10"])],
            "static_rows": 1,
        }, caption="Każda kolumna: pierwszy plus ostatni wyraz.", pace="fast")


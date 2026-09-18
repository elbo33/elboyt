from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class ThumbnailScene(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA",
            headline="MATURA\nNIE WYBACZA\nTEGO BŁĘDU",
            formula=r"\sqrt[4]{81}=3\quad\text{nie}\quad \pm3",
        )


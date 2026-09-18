from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class ThumbnailScene(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA",
            headline="PIERWIASTKI\nDOWOLNEGO STOPNIA",
            formula=r"\sqrt[4]{(-3)^4}=3\neq -3",
        )


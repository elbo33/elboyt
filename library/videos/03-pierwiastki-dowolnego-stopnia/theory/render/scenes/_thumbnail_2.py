from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class ThumbnailScene(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA",
            headline="BEZ TEGO\nMATURA TO\nLOTERIA",
            formula=r"\sqrt[n]{a^n}=|a|\ ?",
        )


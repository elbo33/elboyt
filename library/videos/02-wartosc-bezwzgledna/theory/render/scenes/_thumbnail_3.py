from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class ThumbnailScene(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA",
            headline="EGZAMINATOR\nLICZY, ŻE\nTEGO NIE ZNASZ",
            formula=r"|x-6|=2\Rightarrow x=4\ \lor\ x=8",
        )


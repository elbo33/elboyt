from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class GenericPowerRootsThumbnailTwo(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="POTĘGI I PIERWIASTKI",
            headline="MATURA: JEDEN WYKŁADNIK\nZERO ZGADYWANIA",
            formula="a^m\\cdot a^n=a^{m+n}",
        )

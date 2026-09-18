from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class GenericMonotonicityThumbnailThree(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA: PORÓWNYWANIE POTĘG",
            headline="TEN ZNAK\nMYLI WSZYSTKICH",
            formula="\\left(\\frac25\\right)^4>\\left(\\frac25\\right)^7",
        )

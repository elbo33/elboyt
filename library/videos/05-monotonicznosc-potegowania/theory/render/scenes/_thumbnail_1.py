from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class GenericMonotonicityThumbnailOne(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA PODSTAWOWA",
            headline="POTĘGI: KIEDY\nODWRÓCIĆ ZNAK?",
            formula="\\left(\\frac12\\right)^2>\\left(\\frac12\\right)^3",
        )

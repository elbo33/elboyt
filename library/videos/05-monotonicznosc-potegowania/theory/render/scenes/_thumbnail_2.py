from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class GenericMonotonicityThumbnailTwo(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MONOTONICZNOŚĆ POTĘGOWANIA",
            headline="JEDYNKA ZMIENIA\nWSZYSTKO",
            formula="2^2<2^3",
        )

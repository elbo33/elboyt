from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class GenericPowerRootsThumbnailThree(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="POTĘGI I PIERWIASTKI",
            headline="MATURA: PIERWIASTKI\nWRESZCIE MAJĄ SENS",
            formula="\\sqrt[4]{5^3}=5^{\\frac{3}{4}}",
        )

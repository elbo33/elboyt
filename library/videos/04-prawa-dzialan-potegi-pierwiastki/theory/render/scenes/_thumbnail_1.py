from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class GenericPowerRootsThumbnailOne(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA PODSTAWOWA",
            headline="POTĘGI I\nPIERWIASTKI",
            formula="a^{\\frac{m}{n}}=\\sqrt[n]{a^m}",
        )

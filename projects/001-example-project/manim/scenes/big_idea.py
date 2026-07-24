"""Section 04: Base Case & Recursive Case. Fixture scene showing two
translated labels stacked — stands in for a real animated diagram.
"""

import importlib
import os

from manim import DOWN, UP, FadeIn, Scene

from theme import PALETTE, styled_body, styled_title

LANG = os.environ.get("SCENE_LANG", "en")
LABELS = importlib.import_module(f"labels.labels_{LANG}").LABELS


class BigIdea(Scene):
    def construct(self):
        base = styled_body(LABELS["base_case"], color=PALETTE["highlight"]).shift(UP)
        recursive = styled_body(LABELS["recursive_case"], color=PALETTE["accent"]).shift(DOWN)
        self.play(FadeIn(base))
        self.play(FadeIn(recursive))
        self.wait(1)

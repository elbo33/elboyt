"""Section 09: Thousands of Games Later. Fixture scene — stands in for a
real animated win-rate-vs-training-games line graph; for now lands the
title and the punchline caption.
"""

import importlib
import os

from manim import DOWN, FadeIn, Scene

from theme import PALETTE, styled_body, styled_title

LANG = os.environ.get("SCENE_LANG", "en")
LABELS = importlib.import_module(f"labels.labels_{LANG}").LABELS


class WinrateGraph(Scene):
    def construct(self):
        title = styled_title(LABELS["winrate_title"])
        caption = styled_body(LABELS["winrate_caption"], color=PALETTE["highlight"]).shift(DOWN * 1.2)
        self.play(FadeIn(title))
        self.play(FadeIn(caption))
        self.wait(1)

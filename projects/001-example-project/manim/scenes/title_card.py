"""Section 02: Title Card. Simple fixture scene — just the translated title."""

import importlib
import os

from manim import FadeIn, FadeOut, Scene

from theme import styled_title

LANG = os.environ.get("SCENE_LANG", "en")
LABELS = importlib.import_module(f"labels.labels_{LANG}").LABELS


class TitleCard(Scene):
    def construct(self):
        title = styled_title(LABELS["title"])
        self.play(FadeIn(title))
        self.wait(1)
        self.play(FadeOut(title))

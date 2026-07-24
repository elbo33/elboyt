"""Example scene: displays one translated title. Copy this pattern for new
scenes — the only per-scene boilerplate is the SCENE_LANG/LABELS import at
the top; everything else is normal Manim code that must never hardcode
on-screen text.
"""

import importlib
import os

from manim import FadeIn, FadeOut, Scene

from theme import styled_title

LANG = os.environ.get("SCENE_LANG", "en")
LABELS = importlib.import_module(f"labels.labels_{LANG}").LABELS


class IntroHello(Scene):
    def construct(self):
        title = styled_title(LABELS["title"])
        self.play(FadeIn(title))
        self.wait(1)
        self.play(FadeOut(title))

"""Section 05: How Q-Values Get Nudged. Fixture scene — stands in for a real
animated play -> result -> nudge loop; for now shows the win/lose nudge
directions in words.
"""

import importlib
import os

from manim import DOWN, UP, FadeIn, Scene

from theme import PALETTE, styled_body, styled_title

LANG = os.environ.get("SCENE_LANG", "en")
LABELS = importlib.import_module(f"labels.labels_{LANG}").LABELS


class RewardLoop(Scene):
    def construct(self):
        title = styled_title(LABELS["reward_loop_title"])
        self.play(FadeIn(title))
        self.play(title.animate.to_edge(UP))

        win = styled_body(LABELS["reward_loop_win"], color=PALETTE["highlight"]).shift(UP * 0.5)
        lose = styled_body(LABELS["reward_loop_lose"], color=PALETTE["accent"]).shift(DOWN * 0.5)
        self.play(FadeIn(win))
        self.play(FadeIn(lose))
        self.wait(1)

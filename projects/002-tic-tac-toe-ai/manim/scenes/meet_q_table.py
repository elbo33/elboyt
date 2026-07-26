"""Section 04: Meet the Q-Table. Fixture scene — stands in for a real
animated lookup-table diagram (a grid of board states x moves); for now it
just lands the two ideas that matter (one row per board, starts at zero) in
words, styled consistently with the rest of the channel.
"""

import importlib
import os

from manim import DOWN, UP, FadeIn, Scene

from theme import PALETTE, styled_body, styled_title

LANG = os.environ.get("SCENE_LANG", "en")
LABELS = importlib.import_module(f"labels.labels_{LANG}").LABELS


class MeetQTable(Scene):
    def construct(self):
        title = styled_title(LABELS["q_table_title"])
        self.play(FadeIn(title))
        self.play(title.animate.to_edge(UP))

        row = styled_body(LABELS["q_table_row"]).shift(UP * 0.5)
        allzero = styled_body(LABELS["q_table_allzero"], color=PALETTE["highlight"]).shift(DOWN * 0.5)
        self.play(FadeIn(row))
        self.play(FadeIn(allzero))
        self.wait(1)

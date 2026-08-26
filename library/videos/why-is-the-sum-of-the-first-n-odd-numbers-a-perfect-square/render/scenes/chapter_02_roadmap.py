from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter02Roadmap(LongScene):
    chapter_tag_text = "ROADMAP"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("HOW THIS VIDEO IS BUILT", 0.66)
        items = [
            "Setup  —  what “odd” and “partial sum” mean",
            "Master build  —  1 up to 6² in one go",
            "Nine worked cases  —  2² through 10², one template",
            "Pattern check  —  the gaps are 3, 5, 7, 9, …",
            "Big jump  —  n = 12  (does it still hold?)",
            "The reason  —  L-shaped layers (gnomons)",
            "2n + 1, three ways",
            "The algebra  —  telescoping to n²",
            "Recap",
        ]
        rows = bullet_list(items, 0.38, buff=0.32)
        rows.move_to([0, -0.35, 0])
        note = caption("The same shape every time: show the case, then explain why it can’t fail.")

        self.play(Write(title), run_time=1.6)
        self.play(LaggedStart(*[FadeIn(r, shift=0.3 * RIGHT) for r in rows], lag_ratio=0.35), run_time=5.5)
        self.wait(0.8)
        box = SurroundingRectangle(rows[2], color=ACCENT, buff=0.18)
        self.play(Create(box), run_time=1.0)
        self.play(Indicate(rows[2], color=ACCENT, scale_factor=1.04), run_time=1.4)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.9)
        self.wait(1.6)
        self.play(FadeOut(box), run_time=0.8)
        self.wait(6.0)


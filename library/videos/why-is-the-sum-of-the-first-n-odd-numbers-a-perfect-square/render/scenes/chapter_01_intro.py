from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


def teaser_row(sum_text, val, sq):
    return VGroup(
        body(sum_text, 0.46, FOREGROUND),
        body("=", 0.46, MUTED),
        subhead(val, 0.5, FOREGROUND),
        body("=", 0.46, MUTED),
        subhead(sq, 0.5, SECONDARY),
    ).arrange(RIGHT, buff=0.28)


class Chapter01Intro(LongScene):
    chapter_tag_text = "INTRO"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = statement("WHY IS EVERY RUN\nOF ODD NUMBERS\nA PERFECT SQUARE?", 0.6)
        title.to_edge(UP, buff=1.0)
        rows = VGroup(
            teaser_row("1", "1", "1²"),
            teaser_row("1 + 3", "4", "2²"),
            teaser_row("1 + 3 + 5", "9", "3²"),
            teaser_row("1 + 3 + 5 + 7", "16", "4²"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4)
        rows.move_to([0, -1.1, 0])
        sub = caption("Every partial sum lands exactly on a square. This whole video is why.")

        self.play(Write(title), run_time=2.4)
        self.wait(0.8)
        self.play(LaggedStart(*[FadeIn(r, shift=0.35 * RIGHT) for r in rows], lag_ratio=0.5), run_time=3.6)
        self.wait(0.8)
        squares_col = VGroup(*[r[4] for r in rows])
        self.play(LaggedStart(*[Indicate(s, color=SECONDARY, scale_factor=1.2) for s in squares_col], lag_ratio=0.3), run_time=2.4)
        self.play(FadeIn(sub, shift=0.2 * UP), run_time=0.9)
        self.wait(2.0)
        self.play(rows.animate.set_opacity(0.5), run_time=1.0)
        self.wait(5.5)


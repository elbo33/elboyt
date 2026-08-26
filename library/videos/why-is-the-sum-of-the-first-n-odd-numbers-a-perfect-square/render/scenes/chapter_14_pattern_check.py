from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter14PatternCheck(LongScene):
    chapter_tag_text = "PATTERN CHECK"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("LOOK AT THE GAPS", 0.62)

        squares = [t * t for t in range(1, 9)]
        rows = VGroup()
        for i, s in enumerate(squares):
            t = i + 1
            row = VGroup(
                body(f"{t}²", 0.42, FOREGROUND),
                body("=", 0.38, MUTED),
                subhead(str(s), 0.42, SECONDARY),
            ).arrange(RIGHT, buff=0.28)
            rows.add(row)
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.34)
        rows.move_to([-3.0, -0.1, 0])

        self.play(Write(title), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(r, shift=0.2 * RIGHT) for r in rows], lag_ratio=0.25), run_time=3.4)
        self.wait(0.6)

        anchor_x = rows.get_right()[0] + 0.35
        gaps = VGroup()
        for i in range(len(squares) - 1):
            y0 = rows[i].get_center()[1]
            y1 = rows[i + 1].get_center()[1]
            arc = CurvedArrow([anchor_x, y0 - 0.08, 0], [anchor_x, y1 + 0.08, 0], angle=-TAU / 5, color=ACCENT, stroke_width=2, tip_length=0.16)
            tag = small_label(f"+ {squares[i + 1] - squares[i]}", 0.32, ACCENT)
            tag.move_to([anchor_x + 0.95, (y0 + y1) / 2, 0])
            gaps.add(VGroup(arc, tag))
        self.play(LaggedStart(*[FadeIn(g) for g in gaps], lag_ratio=0.2), run_time=3.0)
        self.wait(0.8)

        concl = body("the gaps are  3, 5, 7, 9, 11, 13, 15  —  the odd numbers, in order.", 0.4, SECONDARY)
        concl.move_to([0, -3.3, 0])
        self.play(FadeIn(concl, shift=0.2 * UP), run_time=1.0)
        self.play(Circumscribe(concl, color=ACCENT), run_time=1.6)
        self.wait(7.0)


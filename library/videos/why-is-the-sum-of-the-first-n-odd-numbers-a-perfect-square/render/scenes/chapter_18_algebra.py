from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter18Algebra(LongScene):
    chapter_tag_text = "THE ALGEBRA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("THE SAME THING IN SYMBOLS", 0.58)

        e1 = subhead("(n + 1)²  =  n² + 2n + 1", 0.46, FOREGROUND)
        e2 = subhead("(n + 1)²  −  n²  =  2n + 1", 0.46, ACCENT)
        e3 = small_label("the jump from one square to the next is always an odd number", 0.32, MUTED)
        top = VGroup(e1, e2, e3).arrange(DOWN, aligned_edge=LEFT, buff=0.26).move_to([0, 1.85, 0])

        ladder_rows = [
            ("1", "1²"),
            ("1 + 3", "2²"),
            ("1 + 3 + 5", "3²"),
            ("1 + 3 + 5 + 7", "4²"),
            ("⋮", "⋮"),
            ("1 + 3 + 5 + … + (2n − 1)", "n²"),
        ]
        ladder = running_total_panel(ladder_rows).scale(0.82)
        ladder.move_to([0.4, -0.9, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(e1, shift=0.2 * UP), run_time=1.0)
        self.wait(1.4)
        self.play(TransformFromCopy(e1, e2), run_time=1.2)
        self.play(FadeIn(e3, shift=0.2 * UP), run_time=0.9)
        self.wait(1.6)
        self.play(LaggedStart(*[FadeIn(r, shift=0.25 * RIGHT) for r in ladder], lag_ratio=0.4), run_time=4.0)
        self.wait(0.6)
        arrow_x = ladder.get_left()[0] - 0.55
        arrows = VGroup()
        for i in range(3):
            y0 = ladder[i].get_center()[1]
            y1 = ladder[i + 1].get_center()[1]
            a = Arrow([arrow_x, y0 - 0.04, 0], [arrow_x, y1 + 0.04, 0], color=SECONDARY, buff=0.05, stroke_width=3, tip_length=0.16)
            tag = small_label(f"+ {2 * (i + 1) + 1}", 0.3, SECONDARY).move_to([arrow_x - 0.7, (y0 + y1) / 2, 0])
            arrows.add(VGroup(a, tag))
        self.play(LaggedStart(*[GrowArrow(g[0]) for g in arrows], lag_ratio=0.3), LaggedStart(*[FadeIn(g[1]) for g in arrows], lag_ratio=0.3), run_time=2.4)
        self.wait(1.0)
        self.play(Indicate(ladder[-1], color=SECONDARY, scale_factor=1.06), run_time=1.5)
        concl = caption("Each row is the row above plus the next odd number — so every row is a square.")
        self.play(FadeIn(concl, shift=0.2 * UP), run_time=1.0)
        self.wait(6.0)


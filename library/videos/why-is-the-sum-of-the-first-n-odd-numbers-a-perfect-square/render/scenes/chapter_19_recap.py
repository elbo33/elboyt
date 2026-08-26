from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter19Recap(LongScene):
    chapter_tag_text = "RECAP"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("ONE MOVE, REPEATED", 0.64)

        ledger = running_total_panel([
            ("1 + 3", "4  =  2²"),
            ("1 + 3 + 5", "9  =  3²"),
            ("1 + 3 + 5 + 7", "16  =  4²"),
            ("1 + 3 + … + (2n − 1)", "n²"),
        ])
        ledger.move_to([-3.3, 0.4, 0])

        ox, oy = 2.2, -1.6
        S, th = 1.7, 0.5
        inner = Square(side_length=S, stroke_color=MUTED, stroke_width=2, fill_color=ACCENT, fill_opacity=0.3).move_to([ox + S / 2, oy + S / 2, 0])
        gnomon = Polygon(
            [ox + S, oy, 0], [ox + S + th, oy, 0], [ox + S + th, oy + S + th, 0],
            [ox, oy + S + th, 0], [ox, oy + S, 0], [ox + S, oy + S, 0],
            stroke_color=SECONDARY, stroke_width=2, fill_color=SECONDARY, fill_opacity=0.45,
        )
        mini_eq = subhead("n² + (2n + 1) = (n + 1)²", 0.4, SECONDARY).next_to(VGroup(inner, gnomon), UP, buff=0.5)

        reason = statement("Every odd number is the L-shaped gap\nbetween one square and the next.", 0.46)
        reason.move_to([0, -3.0, 0])

        self.play(Write(title), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(r, shift=0.25 * RIGHT) for r in ledger], lag_ratio=0.4), run_time=3.2)
        self.wait(0.8)
        self.play(FadeIn(inner, scale=0.9), run_time=0.8)
        self.play(DrawBorderThenFill(gnomon), run_time=1.2)
        self.play(FadeIn(mini_eq, shift=0.2 * UP), run_time=0.9)
        self.wait(1.0)
        self.play(Indicate(VGroup(inner, gnomon), color=SECONDARY, scale_factor=1.05), run_time=1.4)
        self.play(Write(reason), run_time=2.0)
        self.wait(1.2)
        self.play(Circumscribe(reason, color=ACCENT, buff=0.3), run_time=1.6)
        self.wait(6.0)


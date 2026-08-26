from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter20Outro(LongScene):
    chapter_tag_text = "OUTRO"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        final = statement("1 + 3 + 5 + … + (2n − 1)  =  n²", 0.58)
        final.move_to([0, 1.4, 0])

        cell = 0.32
        squares = VGroup()
        base_x = -4.2
        for n in [1, 2, 3, 4]:
            g = VGroup()
            for r in range(n):
                for c in range(n):
                    g.add(Square(side_length=cell, stroke_color=MUTED, stroke_width=1.5,
                                 fill_color=SECONDARY, fill_opacity=0.5).move_to([base_x + c * cell, -1.0 + r * cell, 0]))
            lbl = small_label(f"{n}² = {n*n}", 0.3, MUTED).next_to(g, DOWN, buff=0.35)
            squares.add(VGroup(g, lbl))
            base_x += n * cell + 1.1

        tag = caption("Odd numbers are the seams between consecutive squares.")

        self.play(Write(final), run_time=2.0)
        self.wait(0.6)
        self.play(LaggedStart(*[FadeIn(s, scale=0.8) for s in squares], lag_ratio=0.5), run_time=3.2)
        self.play(FadeIn(tag, shift=0.2 * UP), run_time=1.0)
        self.wait(1.2)
        self.play(Indicate(final, color=SECONDARY, scale_factor=1.04), run_time=1.6)
        self.wait(3.2)


from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter04MasterBuild(LongScene):
    chapter_tag_text = "MASTER BUILD"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("WATCH IT GROW, ONCE", 0.64)

        N = 6
        cell = 0.72
        grid, layers = odd_square_grid(N, cell)
        grid.move_to([-3.4, -0.4, 0])

        odd_lbl = small_label("odd number added", 0.3, ACCENT).move_to([3.2, 2.0, 0])
        odd_val = DecimalNumber(0, num_decimal_places=0, color=ACCENT).scale(0.95).move_to([3.2, 1.3, 0])
        tot_lbl = small_label("running total", 0.3, MUTED).move_to([3.2, 0.2, 0])
        tot_val = DecimalNumber(0, num_decimal_places=0, color=FOREGROUND).scale(1.3).move_to([3.2, -0.6, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(VGroup(odd_lbl, odd_val, tot_lbl, tot_val)), run_time=0.9)

        running = 0
        sq_val = None
        for k in range(N):
            running += 2 * k + 1
            self.play(
                FadeIn(layers[k], lag_ratio=0.08),
                ChangeDecimalToValue(odd_val, 2 * k + 1),
                ChangeDecimalToValue(tot_val, running),
                run_time=1.2 if k < 3 else 0.85,
            )
            target = subhead(f"=  {k+1}²", 0.5, SECONDARY).move_to([3.2, -1.7, 0])
            if sq_val is None:
                sq_val = target
                self.play(FadeIn(sq_val), run_time=0.4)
            else:
                self.play(Transform(sq_val, target), run_time=0.4)
            self.wait(0.35)

        outline = Square(side_length=N * cell, color=SECONDARY, stroke_width=6).move_to(grid.get_center())
        self.play(Create(outline), run_time=1.2)
        note = caption("Six odd numbers, six L-shaped layers, one 6 × 6 square. Nothing else happened.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.play(Circumscribe(VGroup(tot_val, sq_val), color=SECONDARY), run_time=1.5)
        self.wait(7.0)


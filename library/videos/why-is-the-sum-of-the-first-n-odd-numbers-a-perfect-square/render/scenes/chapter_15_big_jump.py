from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter15BigJump(LongScene):
    chapter_tag_text = "BIG JUMP · n = 12"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("BIG JUMP   —   n = 12", 0.62)

        n = 12
        cell = 0.4
        grid, layers = odd_square_grid(n, cell)
        grid.move_to([-3.0, -0.3, 0])
        outline = Square(side_length=n * cell, color=SECONDARY, stroke_width=5).move_to(grid.get_center())

        odd_label = small_label("odd number just added", 0.3, ACCENT).move_to([3.3, 1.8, 0])
        odd_val = DecimalNumber(1, num_decimal_places=0, color=ACCENT).scale(0.95).move_to([3.3, 1.1, 0])
        tot_label = small_label("running total", 0.3, MUTED).move_to([3.3, -0.1, 0])
        tot_val = DecimalNumber(0, num_decimal_places=0, color=FOREGROUND).scale(1.2).move_to([3.3, -0.9, 0])
        sq_note = subhead("= 12²", 0.5, SECONDARY).next_to(tot_val, DOWN, buff=0.35).set_opacity(0)

        self.play(Write(title), run_time=1.4)
        self.play(FadeIn(VGroup(odd_label, odd_val, tot_label, tot_val)), run_time=0.9)
        running = 0
        for k in range(n):
            running += 2 * k + 1
            self.play(
                FadeIn(layers[k], lag_ratio=0.05),
                ChangeDecimalToValue(odd_val, 2 * k + 1),
                ChangeDecimalToValue(tot_val, running),
                run_time=0.85 if k < 3 else 0.5,
            )
        self.play(Create(outline), run_time=1.0)
        self.play(sq_note.animate.set_opacity(1), Flash(tot_val, color=SECONDARY), run_time=0.9)
        self.wait(0.8)
        note = caption("No new idea — twelve copies of the same L-wrapping move. Still a square.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(6.0)


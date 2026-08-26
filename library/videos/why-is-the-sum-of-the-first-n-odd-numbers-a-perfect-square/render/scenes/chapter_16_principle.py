from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter16Principle(LongScene):
    chapter_tag_text = "THE REASON"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("WHY IT CAN’T FAIL", 0.66)

        ox, oy = -6.3, -2.0
        S = 2.7
        th = 0.7
        inner = Square(side_length=S, stroke_color=MUTED, stroke_width=3, fill_color=ACCENT, fill_opacity=0.28)
        inner.move_to([ox + S / 2, oy + S / 2, 0])
        gnomon = Polygon(
            [ox + S, oy, 0],
            [ox + S + th, oy, 0],
            [ox + S + th, oy + S + th, 0],
            [ox, oy + S + th, 0],
            [ox, oy + S, 0],
            [ox + S, oy + S, 0],
            stroke_color=SECONDARY, stroke_width=3, fill_color=SECONDARY, fill_opacity=0.4,
        )
        outer = Square(side_length=S + th, stroke_color=FOREGROUND, stroke_width=5)
        outer.move_to([ox + (S + th) / 2, oy + (S + th) / 2, 0])

        n_bottom = small_label("n", 0.4, MUTED).move_to([ox + S / 2, oy - 0.4, 0])
        n_left = small_label("n", 0.4, MUTED).move_to([ox - 0.42, oy + S / 2, 0])
        np1_bottom = small_label("n + 1", 0.36, FOREGROUND).move_to([ox + (S + th) / 2, oy - 0.9, 0])
        l_label = subhead("the L  =  2n + 1", 0.42, SECONDARY).move_to([-1.7, 1.4, 0])
        l_arrow = Arrow([-2.5, 1.2, 0], [ox + S + th - 0.2, oy + S - 0.1, 0], color=SECONDARY, buff=0.15, stroke_width=3)

        line1 = body("Take any n × n square.", 0.4)
        line2 = body("Its next L is one row on top,", 0.38)
        line3 = body("one column on the side,", 0.38)
        line4 = body("one shared corner:", 0.38)
        line5 = subhead("n + n + 1  =  2n + 1", 0.4, ACCENT)
        line6 = subhead("n²  +  (2n + 1)  =  (n + 1)²", 0.44, SECONDARY)
        line7 = small_label("and 2n + 1 is the next odd number.", 0.32, ACCENT)
        text_col = VGroup(line1, line2, line3, line4, line5, line6, line7).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        text_col.move_to([3.4, -0.2, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(inner, scale=0.9), FadeIn(n_bottom), FadeIn(n_left), run_time=1.2)
        self.play(FadeIn(line1, shift=0.2 * UP), run_time=1.0)
        self.wait(1.2)
        self.play(DrawBorderThenFill(gnomon), run_time=1.6)
        self.play(GrowArrow(l_arrow), FadeIn(l_label), run_time=1.0)
        self.wait(0.8)
        top_row = Rectangle(width=S + th, height=th, stroke_color=ACCENT, stroke_width=4).move_to([ox + (S + th) / 2, oy + S + th / 2, 0])
        side_col = Rectangle(width=th, height=S, stroke_color=GREEN, stroke_width=4).move_to([ox + S + th / 2, oy + S / 2, 0])
        self.play(Create(top_row), FadeIn(line2, shift=0.2 * UP), run_time=1.0)
        self.play(Create(side_col), FadeIn(line3, shift=0.2 * UP), run_time=1.0)
        self.play(FadeIn(line4, shift=0.2 * UP), run_time=0.8)
        self.wait(1.0)
        self.play(FadeIn(line5, shift=0.2 * UP), run_time=0.9)
        self.wait(1.2)
        self.play(FadeOut(top_row), FadeOut(side_col), run_time=0.8)
        self.play(Create(outer), FadeIn(np1_bottom), run_time=1.2)
        self.wait(0.6)
        self.play(FadeIn(line6, shift=0.2 * UP), run_time=1.0)
        self.play(Indicate(line6, color=SECONDARY, scale_factor=1.05), run_time=1.4)
        self.play(FadeIn(line7, shift=0.2 * UP), run_time=1.0)
        self.wait(1.5)
        closing = caption("So each odd number is precisely the gap between one square and the next.")
        self.play(FadeIn(closing, shift=0.2 * UP), run_time=1.0)
        self.wait(6.0)


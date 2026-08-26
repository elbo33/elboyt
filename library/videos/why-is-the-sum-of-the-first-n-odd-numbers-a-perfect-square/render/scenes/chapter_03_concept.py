from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter03Concept(LongScene):
    chapter_tag_text = "THE SETUP"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("TWO WORDS FIRST", 0.66)

        line = Line([-5.5, 1.6, 0], [5.5, 1.6, 0], color=MUTED, stroke_width=3)
        ticks = VGroup()
        tick_labels = VGroup()
        for k in range(0, 13):
            x = -5.5 + k * (11.0 / 12.0)
            ticks.add(Line([x, 1.45, 0], [x, 1.75, 0], color=MUTED, stroke_width=2))
            if k % 2 == 0:
                tick_labels.add(small_label(str(k), 0.28, MUTED).move_to([x, 2.05, 0]))
        odds = [1, 3, 5, 7, 9, 11]
        odd_dots = VGroup()
        odd_tags = VGroup()
        for o in odds:
            x = -5.5 + o * (11.0 / 12.0)
            odd_dots.add(Dot([x, 1.6, 0], radius=0.1, color=ACCENT))
            odd_tags.add(small_label("odd", 0.24, ACCENT).move_to([x, 1.15, 0]))

        text1 = body("“Odd numbers” :  1, 3, 5, 7, 9, …   — skip every second whole number.", 0.4)
        text1.move_to([0, 0.1, 0])
        text2 = body("“Partial sum” :  add them left to right and watch the running total.", 0.4)
        text2.move_to([0, -0.7, 0])

        unit = Square(side_length=0.7, stroke_color=MUTED, stroke_width=2, fill_color=ACCENT, fill_opacity=0.55)
        unit.move_to([-4.6, -2.5, 0])
        unit_label = small_label("one cell  =  1", 0.32, MUTED).next_to(unit, RIGHT, buff=0.3)

        total_label = small_label("running total", 0.3, MUTED).move_to([3.1, -1.9, 0])
        total = DecimalNumber(0, num_decimal_places=0, color=FOREGROUND).scale(0.9)
        total.move_to([3.1, -2.6, 0])
        squares_hint = small_label("1, 4, 9, 16, …", 0.32, SECONDARY).next_to(total, RIGHT, buff=0.5)

        self.play(Write(title), run_time=1.5)
        self.play(Create(line), Create(ticks), FadeIn(tick_labels), run_time=1.8)
        self.play(LaggedStart(*[GrowFromCenter(d) for d in odd_dots], lag_ratio=0.25), FadeIn(odd_tags), run_time=2.4)
        self.wait(0.6)
        self.play(FadeIn(text1, shift=0.2 * UP), run_time=1.0)
        self.wait(1.6)
        self.play(FadeIn(text2, shift=0.2 * UP), run_time=1.0)
        self.wait(1.4)
        self.play(FadeIn(unit, scale=0.7), FadeIn(unit_label), run_time=1.0)
        self.play(FadeIn(total_label), FadeIn(total), run_time=0.8)
        for value in [1, 4, 9]:
            self.play(ChangeDecimalToValue(total, value), run_time=0.9)
            self.play(Flash(total, color=SECONDARY, line_length=0.2), run_time=0.5)
            self.wait(0.5)
        self.play(FadeIn(squares_hint, shift=0.2 * RIGHT), run_time=0.8)
        self.wait(1.0)
        q = caption("Question:  why does that running total keep landing on 1, 4, 9, 16, … ?")
        self.play(FadeIn(q, shift=0.2 * UP), run_time=1.0)
        self.wait(1.6)
        self.play(Indicate(odd_dots, color=ACCENT, scale_factor=1.1), run_time=1.6)
        self.wait(5.0)


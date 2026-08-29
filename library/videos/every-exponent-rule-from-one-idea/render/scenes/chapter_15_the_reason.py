from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter15Reason(LongScene):
    chapter_tag_text = "DLACZEGO TO DZIAŁA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("DLACZEGO KROK NIE MOŻE ZAWIEŚĆ", 0.56)

        cell = 0.66
        strip_a = factor_strip(3, "a", cell, ACCENT)
        strip_b = factor_strip(4, "a", cell, SECONDARY)
        VGroup(strip_a, strip_b).arrange(RIGHT, buff=1.1).move_to([-2.4, 1.4, 0])
        dots_a = small_label("(m czynników)", 0.3, ACCENT).next_to(strip_a, UP, buff=0.25)
        dots_b = small_label("(n czynników)", 0.3, SECONDARY).next_to(strip_b, UP, buff=0.25)

        e1 = mtex(r"a^{m} = \underbrace{a\cdot a\cdots a}_{m}", 0.6, FOREGROUND).move_to([2.7, 1.9, 0])
        e2 = mtex(r"a^{n} = \underbrace{a\cdot a\cdots a}_{n}", 0.6, FOREGROUND).move_to([2.7, 0.7, 0])
        e3 = mtex(r"a^{m}\cdot a^{n} = \underbrace{a\cdot a\cdots a}_{m+n} = a^{m+n}", 0.62, SECONDARY).move_to([0, -1.6, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(strip_a, lag_ratio=0.1), FadeIn(dots_a), run_time=1.1)
        self.play(Write(e1), run_time=1.1)
        self.play(FadeIn(strip_b, lag_ratio=0.1), FadeIn(dots_b), run_time=1.1)
        self.play(Write(e2), run_time=1.1)
        self.wait(2.4)

        merged_pos = strip_a.get_right() + RIGHT * (strip_b.width / 2)
        brace = Brace(VGroup(strip_a.copy(), strip_b.copy().move_to(merged_pos)), DOWN, color=FOREGROUND)
        brace_l = small_label("m + n czynników", 0.32, FOREGROUND).next_to(brace, DOWN, buff=0.14)
        self.play(strip_b.animate.move_to(merged_pos), FadeOut(dots_a), FadeOut(dots_b), run_time=1.4)
        self.play(GrowFromCenter(brace), FadeIn(brace_l), run_time=0.9)
        self.wait(2.2)
        self.play(Write(e3), run_time=1.8)
        self.play(Circumscribe(e3, color=SECONDARY), run_time=1.5)
        self.wait(2.6)
        note = caption("Dopisanie n czynników do m czynników zawsze daje m + n. To sama definicja wykładnika.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(8.5)


from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter14BigCase(LongScene):
    chapter_tag_text = "DUŻY PRZYPADEK"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("DUŻY PRZYPADEK   —   2¹⁰ · 2¹⁵", 0.58)

        cell = 0.34
        strip_a = factor_strip(10, "2", cell, ACCENT)
        strip_b = factor_strip(15, "2", cell, SECONDARY)
        VGroup(strip_a, strip_b).arrange(RIGHT, buff=0.7).move_to([0, 1.4, 0])

        br_a = Brace(strip_a, DOWN, color=ACCENT)
        br_b = Brace(strip_b, DOWN, color=SECONDARY)
        la = small_label("10 czynników", 0.3, ACCENT).next_to(br_a, DOWN, buff=0.1)
        lb = small_label("15 czynników", 0.3, SECONDARY).next_to(br_b, DOWN, buff=0.1)

        prod = mtex(r"2^{10}\cdot 2^{15}", 0.72, FOREGROUND).move_to([0, -0.7, 0])
        step = mtex(r"= 2^{\,10+15} = 2^{25}", 0.72, SECONDARY).next_to(prod, DOWN, buff=0.4)
        check = mtex(r"1024 \cdot 32768 = 33\,554\,432", 0.6, FOREGROUND).next_to(step, DOWN, buff=0.4)

        self.play(Write(title), run_time=1.4)
        self.play(FadeIn(strip_a, lag_ratio=0.05), GrowFromCenter(br_a), FadeIn(la), run_time=1.2)
        self.play(FadeIn(strip_b, lag_ratio=0.05), GrowFromCenter(br_b), FadeIn(lb), run_time=1.2)
        self.play(Write(prod), run_time=1.0)
        self.wait(1.8)

        merged_pos = strip_a.get_right() + RIGHT * (strip_b.width / 2)
        big = Brace(VGroup(strip_a.copy(), strip_b.copy().move_to(merged_pos)), DOWN, color=FOREGROUND)
        big_l = small_label("25 czynników", 0.32, FOREGROUND).next_to(big, DOWN, buff=0.12)
        self.play(
            strip_b.animate.move_to(merged_pos),
            FadeOut(br_a), FadeOut(br_b), FadeOut(la), FadeOut(lb),
            run_time=1.4,
        )
        self.play(GrowFromCenter(big), FadeIn(big_l), run_time=0.9)
        self.wait(2.2)
        self.play(TransformFromCopy(VGroup(prod, big_l), step), run_time=1.4)
        self.play(Circumscribe(step, color=SECONDARY), run_time=1.3)
        self.wait(1.6)
        self.play(FadeIn(check, shift=0.2 * UP), run_time=0.9)
        self.wait(2.4)
        note = caption("Bez nowego pomysłu — dwadzieścia pięć dwójek dopisanych do jednego paska.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(8.0)


from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter03Setup(LongScene):
    chapter_tag_text = "PODSTAWY"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JEDNO SŁOWO NAJPIERW", 0.62)

        expr = mtex(r"2^{4} \;=\; 2\cdot 2\cdot 2\cdot 2", 0.8, FOREGROUND).move_to([0, 1.9, 0])
        base_tag = small_label("podstawa", 0.32, ACCENT)
        exp_tag = small_label("wykładnik  =  ile czynników", 0.32, SECONDARY)
        base_tag.next_to(expr[0][0], DOWN, buff=0.45)
        exp_tag.next_to(expr[0][1], UP, buff=0.4)
        base_arrow = Arrow(base_tag.get_top(), expr[0][0].get_bottom(), color=ACCENT, buff=0.1, stroke_width=3)
        exp_arrow = Arrow(exp_tag.get_bottom(), expr[0][1].get_top(), color=SECONDARY, buff=0.1, stroke_width=3)

        strip = factor_strip(4, "2", 0.72, ACCENT).move_to([-3.2, -0.6, 0])

        prod_lbl = small_label("iloczyn częściowy", 0.3, MUTED).move_to([3.2, 0.1, 0])
        prod = DecimalNumber(1, num_decimal_places=0, color=FOREGROUND).scale(1.2).move_to([3.2, -0.7, 0])

        self.play(Write(title), run_time=1.5)
        self.play(Write(expr), run_time=1.6)
        self.play(FadeIn(base_tag), GrowArrow(base_arrow), run_time=0.9)
        self.play(FadeIn(exp_tag), GrowArrow(exp_arrow), run_time=0.9)
        self.wait(2.6)
        self.play(FadeIn(prod_lbl), FadeIn(prod), run_time=0.7)
        running = 1
        for i in range(4):
            running *= 2
            self.play(FadeIn(strip[i], scale=0.6), ChangeDecimalToValue(prod, running), run_time=0.9)
            self.play(Flash(prod, color=SECONDARY, line_length=0.18), run_time=0.4)
            self.wait(0.7)
        self.wait(2.0)
        line = body("Potęga aⁿ  to  a  zapisane jako czynnik  n  razy.", 0.42, FOREGROUND).move_to([0, -2.2, 0])
        self.play(FadeIn(line, shift=0.2 * UP), run_time=1.0)
        self.wait(2.6)
        q = caption("Pytanie: co dzieje się z wykładnikami, gdy potęgi mnożymy przez siebie?")
        self.play(FadeIn(q, shift=0.2 * UP), run_time=1.0)
        self.wait(7.5)


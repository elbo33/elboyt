from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter04MasterBuild(LongScene):
    chapter_tag_text = "GŁÓWNA BUDOWA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("ZOBACZ TO RAZ, POWOLI", 0.62)

        cell = 0.74
        strip_a = factor_strip(3, "2", cell, ACCENT)
        strip_b = factor_strip(2, "2", cell, SECONDARY)
        VGroup(strip_a, strip_b).arrange(RIGHT, buff=1.1).move_to([-2.4, 1.55, 0])

        cap_a = small_label("2³  to  trzy dwójki", 0.32, ACCENT).next_to(strip_a, UP, buff=0.3)
        cap_b = small_label("2²  to  dwie dwójki", 0.32, SECONDARY).next_to(strip_b, UP, buff=0.3)

        step = mtex(r"2^{3}\cdot 2^{2} \;=\; 2^{\,3+2} \;=\; 2^{5}", 0.78, SECONDARY).move_to([0, -0.4, 0])
        check = mtex(r"8 \cdot 4 \;=\; 32", 0.64, FOREGROUND).move_to([0, -1.5, 0])

        law = mtex(r"a^{m}\cdot a^{n} \;=\; a^{m+n}", 0.86, ACCENT)
        law_note = small_label("wykładniki się dodają przy mnożeniu", 0.34, MUTED)
        law_group = VGroup(law, law_note).arrange(DOWN, buff=0.28).move_to([0, -3.0, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(strip_a, lag_ratio=0.15), FadeIn(cap_a), run_time=1.2)
        self.wait(1.2)
        self.play(FadeIn(strip_b, lag_ratio=0.15), FadeIn(cap_b), run_time=1.0)
        self.wait(2.4)

        merged_pos = strip_a.get_right() + RIGHT * (strip_b.width / 2)
        brace = Brace(VGroup(strip_a.copy(), strip_b.copy().move_to(merged_pos)), DOWN, color=FOREGROUND)
        brace_lbl = small_label("pięć dwójek", 0.34, FOREGROUND).next_to(brace, DOWN, buff=0.14)
        self.play(strip_b.animate.move_to(merged_pos), FadeOut(cap_a), FadeOut(cap_b), run_time=1.4)
        self.play(GrowFromCenter(brace), FadeIn(brace_lbl), run_time=0.9)
        self.wait(2.4)

        self.play(TransformFromCopy(VGroup(strip_a, strip_b, brace_lbl), step), run_time=1.5)
        self.play(Circumscribe(step, color=SECONDARY), run_time=1.4)
        self.wait(2.2)
        self.play(FadeIn(check, shift=0.2 * UP), run_time=0.9)
        self.wait(2.4)
        self.play(FadeIn(law_group, shift=0.2 * UP), run_time=1.1)
        self.play(Indicate(law, color=ACCENT, scale_factor=1.06), run_time=1.6)
        self.wait(8.0)


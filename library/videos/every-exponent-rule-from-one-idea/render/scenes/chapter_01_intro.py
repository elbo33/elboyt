from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter01Intro(LongScene):
    chapter_tag_text = "WSTĘP"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = statement("SKĄD SIĘ BIORĄ\nWSZYSTKIE REGUŁY POTĘG?", 0.6)
        title.to_edge(UP, buff=0.9)

        rows = VGroup(
            mtex(r"2^{3}\cdot 2^{2} \;=\; 2^{5}", 0.62),
            mtex(r"\left(2^{3}\right)^{2} \;=\; 2^{6}", 0.62),
            mtex(r"2^{0} \;=\; 1", 0.62),
            mtex(r"2^{-1} \;=\; \tfrac{1}{2}", 0.62),
            mtex(r"9^{\frac{1}{2}} \;=\; 3", 0.62),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.44)
        rows.move_to([0, -1.1, 0])
        sub = caption("Pięć reguł, które zwykle trzeba zapamiętać. Wszystkie wynikają z jednego zdania.")

        self.play(Write(title), run_time=2.4)
        self.wait(0.6)
        self.play(LaggedStart(*[FadeIn(r, shift=0.35 * RIGHT) for r in rows], lag_ratio=0.5), run_time=3.8)
        self.wait(0.8)
        self.play(LaggedStart(*[Indicate(r, color=SECONDARY, scale_factor=1.12) for r in rows], lag_ratio=0.45), run_time=3.4)
        self.wait(1.2)
        self.play(FadeIn(sub, shift=0.2 * UP), run_time=0.9)
        self.wait(3.2)
        self.play(rows.animate.set_opacity(0.45), run_time=1.0)
        self.wait(6.5)


from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter13PatternCheck(LongScene):
    chapter_tag_text = "SPRAWDZENIE WZORU"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("SPÓJRZ NA WYKŁADNIKI", 0.62)

        specs = [(2, 2, 3), (3, 2, 2), (5, 1, 3), (10, 2, 1), (2, 3, 3), (7, 2, 1), (3, 1, 4), (2, 4, 4)]
        rows = VGroup(*[
            mtex(rf"{a}^{{{m}}}\cdot {a}^{{{n}}} \;=\; {a}^{{{m}+{n}}} \;=\; {a}^{{{m+n}}}", 0.5, FOREGROUND)
            for (a, m, n) in specs
        ])
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.32)
        rows.move_to([0, -0.2, 0])

        self.play(Write(title), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(r, shift=0.2 * RIGHT) for r in rows], lag_ratio=0.35), run_time=4.8)
        self.wait(1.8)
        self.play(LaggedStart(*[Indicate(r[-1], color=SECONDARY, scale_factor=1.2) for r in rows], lag_ratio=0.25), run_time=3.4)
        self.wait(2.2)

        concl = body("Za każdym razem: wykładnik po prawej  =  suma dwóch wykładników po lewej.", 0.4, SECONDARY)
        concl.move_to([0, -3.3, 0])
        self.play(FadeIn(concl, shift=0.2 * UP), run_time=1.0)
        self.play(Circumscribe(concl, color=ACCENT), run_time=1.6)
        self.wait(9.0)


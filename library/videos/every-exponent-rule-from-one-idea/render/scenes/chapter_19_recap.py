from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter19Recap(LongScene):
    chapter_tag_text = "PODSUMOWANIE"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JEDEN RUCH, CIĄGLE TEN SAM", 0.6)

        specs = [(2, 2, 3), (3, 2, 2), (5, 1, 3), (10, 2, 1), (2, 3, 3), (7, 2, 1), (3, 1, 4), (2, 4, 4)]
        ledger = VGroup(*[
            mtex(rf"{a}^{{{m}}}\cdot {a}^{{{n}}} = {a}^{{{m+n}}}", 0.46, FOREGROUND)
            for (a, m, n) in specs
        ]).arrange_in_grid(rows=4, cols=2, buff=(1.2, 0.3), flow_order="dr")
        ledger.move_to([0, 1.15, 0])

        cell = 0.5
        strip_a = factor_strip(2, "a", cell, ACCENT)
        strip_b = factor_strip(3, "a", cell, SECONDARY)
        VGroup(strip_a, strip_b).arrange(RIGHT, buff=0).move_to([-2.4, -1.35, 0])
        mini = mtex(r"a^{m}\cdot a^{n} = a^{m+n}", 0.58, SECONDARY).move_to([2.2, -1.35, 0])

        reason = statement("Wykładnik liczy czynniki.\nPrzy mnożeniu czynniki się sumują.", 0.44)
        reason.move_to([0, -2.9, 0])

        self.play(Write(title), run_time=1.4)
        self.play(LaggedStart(*[FadeIn(r, shift=0.2 * RIGHT) for r in ledger], lag_ratio=0.35), run_time=4.4)
        self.wait(2.6)
        self.play(FadeIn(strip_a, lag_ratio=0.1), FadeIn(strip_b, lag_ratio=0.1), run_time=0.9)
        self.play(TransformFromCopy(VGroup(strip_a, strip_b), mini), run_time=1.2)
        self.wait(2.0)
        self.play(Write(reason), run_time=1.8)
        self.play(Circumscribe(reason, color=ACCENT, buff=0.3), run_time=1.6)
        self.wait(8.5)


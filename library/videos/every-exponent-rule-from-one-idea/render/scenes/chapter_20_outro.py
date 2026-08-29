from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter20Outro(LongScene):
    chapter_tag_text = "KONIEC"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        law = mtex(r"a^{m}\cdot a^{n} \;=\; a^{m+n}", 0.95, FOREGROUND).move_to([0, 1.6, 0])

        rules = VGroup(
            mtex(r"\left(a^{m}\right)^{n} = a^{mn}", 0.5, MUTED),
            mtex(r"a^{0} = 1", 0.5, MUTED),
            mtex(r"a^{-n} = \tfrac{1}{a^{n}}", 0.5, MUTED),
            mtex(r"a^{\frac{1}{n}} = \sqrt[n]{a}", 0.5, MUTED),
            mtex(r"\dfrac{a^{m}}{a^{n}} = a^{m-n}", 0.5, MUTED),
        ).arrange(DOWN, buff=0.3).move_to([0, -0.9, 0])

        tag = caption("Każda reguła potęg to jedno zdanie, czytane w różne strony.")

        self.play(Write(law), run_time=2.0)
        self.wait(1.5)
        self.play(LaggedStart(*[FadeIn(r, shift=0.15 * UP) for r in rules], lag_ratio=0.5), run_time=3.6)
        self.play(FadeIn(tag, shift=0.2 * UP), run_time=1.0)
        self.wait(2.6)
        self.play(Indicate(law, color=SECONDARY, scale_factor=1.04), run_time=1.6)
        self.wait(6.0)


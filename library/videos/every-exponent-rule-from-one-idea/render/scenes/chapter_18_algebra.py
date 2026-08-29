from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter18Algebra(LongScene):
    chapter_tag_text = "ALGEBRA"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("WSZYSTKO Z JEDNEJ LINIJKI", 0.58)

        law = mtex(r"a^{m}\cdot a^{n} \;=\; a^{m+n}", 0.9, ACCENT).move_to([0, 2.0, 0])
        header = small_label("każda reguła — z tego jednego prawa:", 0.34, MUTED).move_to([0, 0.95, 0])

        rules = VGroup(
            mtex(r"\left(a^{m}\right)^{n} = a^{mn}", 0.52, FOREGROUND),
            mtex(r"a^{0} = 1", 0.52, FOREGROUND),
            mtex(r"a^{-n} = \dfrac{1}{a^{n}}", 0.52, FOREGROUND),
            mtex(r"a^{\frac{1}{n}} = \sqrt[n]{a}", 0.52, FOREGROUND),
            mtex(r"\dfrac{a^{m}}{a^{n}} = a^{m-n}", 0.52, FOREGROUND),
        ).arrange_in_grid(rows=3, cols=2, buff=(1.7, 0.55))
        rules.move_to([0, -1.15, 0])

        self.play(Write(title), run_time=1.5)
        self.play(Write(law), run_time=1.6)
        self.play(Indicate(law, color=ACCENT, scale_factor=1.06), run_time=1.4)
        self.play(FadeIn(header, shift=0.2 * UP), run_time=0.8)
        self.wait(1.2)
        for r in rules:
            self.play(FadeIn(r, shift=0.2 * RIGHT), run_time=0.9)
            self.wait(0.4)
        self.wait(2.2)
        self.play(LaggedStart(*[Indicate(r, color=SECONDARY) for r in rules], lag_ratio=0.3), run_time=2.8)
        note = caption("Jedno prawo u podstaw. Wszystko inne jest jego konsekwencją.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(8.5)


from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter16OneLaw(LongScene):
    chapter_tag_text = "JEDNO PRAWO"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JEDNO PRAWO, KAŻDA REGUŁA", 0.58)

        p1 = VGroup(
            subhead("1  ·  potęga potęgi", 0.42, ACCENT),
            mtex(r"\left(a^{m}\right)^{n} = \underbrace{a^{m}\cdot a^{m}\cdots a^{m}}_{n} = a^{m+m+\cdots+m} = a^{mn}", 0.5, FOREGROUND),
            mtex(r"\left(2^{3}\right)^{2} = 2^{6} = 64", 0.46, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        p2 = VGroup(
            subhead("2  ·  wykładnik zero", 0.42, ACCENT),
            mtex(r"a^{m}\cdot a^{0} = a^{m+0} = a^{m} \quad\Rightarrow\quad a^{0} = 1", 0.5, FOREGROUND),
            mtex(r"2^{3}\cdot 2^{0} = 2^{3} \quad\Rightarrow\quad 2^{0} = 1", 0.46, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        p3 = VGroup(
            subhead("3  ·  wykładnik ujemny", 0.42, ACCENT),
            mtex(r"a^{n}\cdot a^{-n} = a^{0} = 1 \quad\Rightarrow\quad a^{-n} = \tfrac{1}{a^{n}}", 0.5, FOREGROUND),
            mtex(r"2^{3}\cdot 2^{-3} = 2^{0} = 1 \quad\Rightarrow\quad 2^{-3} = \tfrac{1}{8}", 0.46, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        col = VGroup(p1, p2, p3).arrange(DOWN, aligned_edge=LEFT, buff=0.5).move_to([0, -0.3, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(p1, shift=0.2 * UP), run_time=1.1)
        self.wait(3.6)
        self.play(FadeIn(p2, shift=0.2 * UP), run_time=1.1)
        self.wait(3.6)
        self.play(FadeIn(p3, shift=0.2 * UP), run_time=1.1)
        self.wait(3.0)
        note = caption("Nic nie zakładamy. Każda reguła to jedyny wybór, przy którym dodawanie wykładników dalej działa.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.play(LaggedStart(*[Indicate(p[-2], color=SECONDARY) for p in (p1, p2, p3)], lag_ratio=0.3), run_time=2.6)
        self.wait(7.5)


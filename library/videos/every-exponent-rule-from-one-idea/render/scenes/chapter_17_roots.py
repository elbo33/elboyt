from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter17Roots(LongScene):
    chapter_tag_text = "PIERWIASTEK = 1/n"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("PIERWIASTEK TO WYKŁADNIK  1/n", 0.56)

        req = mtex(r"\left(a^{\frac{1}{n}}\right)^{n} = a^{\,n\cdot \frac{1}{n}} = a^{1} = a", 0.7, FOREGROUND).move_to([0, 1.7, 0])
        concl = mtex(r"a^{\frac{1}{n}} \;=\; \sqrt[n]{a}", 0.8, SECONDARY).move_to([0, 0.4, 0])
        concl_note = small_label("liczba, której n-ta potęga daje a", 0.32, MUTED).next_to(concl, DOWN, buff=0.3)

        cases = VGroup(
            mtex(r"9^{\frac{1}{2}} = \sqrt{9} = 3 \quad\text{bo}\quad 3^{2} = 9", 0.5, FOREGROUND),
            mtex(r"8^{\frac{1}{3}} = \sqrt[3]{8} = 2 \quad\text{bo}\quad 2^{3} = 8", 0.5, FOREGROUND),
            mtex(r"2^{\frac{1}{2}} = \sqrt{2} \approx 1{,}41", 0.5, FOREGROUND),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.34)
        cases.move_to([0, -2.0, 0])

        self.play(Write(title), run_time=1.5)
        self.play(Write(req), run_time=1.8)
        self.wait(2.8)
        self.play(TransformFromCopy(req, concl), run_time=1.4)
        self.play(FadeIn(concl_note, shift=0.2 * UP), run_time=0.8)
        self.play(Circumscribe(concl, color=ACCENT), run_time=1.4)
        self.wait(2.4)
        self.play(LaggedStart(*[FadeIn(c, shift=0.2 * RIGHT) for c in cases], lag_ratio=0.55), run_time=3.8)
        self.wait(2.6)
        note = caption("Ten sam wzór na potęgę potęgi. Ułamek w wykładniku jest wymuszony, nie wymyślony.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.wait(8.0)


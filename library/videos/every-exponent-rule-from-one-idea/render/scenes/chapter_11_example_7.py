from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_exponent_example


class Chapter11ExampleE7(LongScene):
    chapter_tag_text = "PRZYKŁAD 7 / 8"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("PRZYKŁAD 7   —   3¹ · 3⁴", 0.58)
        self.play(Write(title), run_time=1.3)
        ledger_rows = ["10^{2}\\cdot 10^{1} = 10^{3} = 1000", "2^{3}\\cdot 2^{3} = 2^{6} = 64", "7^{2}\\cdot 7^{1} = 7^{3} = 343", "3^{1}\\cdot 3^{4} = 3^{5} = 243"]
        build_exponent_example(
            self, a=3, m=1, n=4,
            ledger_rows=ledger_rows,
            step_words="Znowu jedynka z lewej. Jeden plus cztery to pięć — trzy do piątej.",
        )
        self.wait(8.5)


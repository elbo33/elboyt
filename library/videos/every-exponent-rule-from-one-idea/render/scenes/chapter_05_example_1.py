from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_exponent_example


class Chapter05ExampleE1(LongScene):
    chapter_tag_text = "PRZYKŁAD 1 / 8"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("PRZYKŁAD 1   —   2² · 2³", 0.58)
        self.play(Write(title), run_time=1.3)
        ledger_rows = ["2^{2}\\cdot 2^{3} = 2^{5} = 32"]
        build_exponent_example(
            self, a=2, m=2, n=3,
            ledger_rows=ledger_rows,
            step_words="Dwa czynniki, potem trzy. Razem pięć dwójek w jednym pasku — czyli dwa do piątej.",
        )
        self.wait(8.5)


from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_exponent_example


class Chapter10ExampleE6(LongScene):
    chapter_tag_text = "PRZYKŁAD 6 / 8"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("PRZYKŁAD 6   —   7² · 7¹", 0.58)
        self.play(Write(title), run_time=1.3)
        ledger_rows = ["5^{1}\\cdot 5^{3} = 5^{4} = 625", "10^{2}\\cdot 10^{1} = 10^{3} = 1000", "2^{3}\\cdot 2^{3} = 2^{6} = 64", "7^{2}\\cdot 7^{1} = 7^{3} = 343"]
        build_exponent_example(
            self, a=7, m=2, n=1,
            ledger_rows=ledger_rows,
            step_words="Siódemki, wykładniki dwa i jeden. Trzy czynniki, wynik trzysta czterdzieści trzy.",
        )
        self.wait(8.5)


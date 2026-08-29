from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_exponent_example


class Chapter07ExampleE3(LongScene):
    chapter_tag_text = "PRZYKŁAD 3 / 8"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("PRZYKŁAD 3   —   5¹ · 5³", 0.58)
        self.play(Write(title), run_time=1.3)
        ledger_rows = ["2^{2}\\cdot 2^{3} = 2^{5} = 32", "3^{2}\\cdot 3^{2} = 3^{4} = 81", "5^{1}\\cdot 5^{3} = 5^{4} = 625"]
        build_exponent_example(
            self, a=5, m=1, n=3,
            ledger_rows=ledger_rows,
            step_words="Jedynka w wykładniku to po prostu jeden czynnik. Jeden i trzy to cztery piątki.",
        )
        self.wait(8.5)


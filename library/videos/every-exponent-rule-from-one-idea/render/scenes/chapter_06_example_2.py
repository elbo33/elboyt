from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_exponent_example


class Chapter06ExampleE2(LongScene):
    chapter_tag_text = "PRZYKŁAD 2 / 8"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("PRZYKŁAD 2   —   3² · 3²", 0.58)
        self.play(Write(title), run_time=1.3)
        ledger_rows = ["2^{2}\\cdot 2^{3} = 2^{5} = 32", "3^{2}\\cdot 3^{2} = 3^{4} = 81"]
        build_exponent_example(
            self, a=3, m=2, n=2,
            ledger_rows=ledger_rows,
            step_words="Zmieniamy podstawę na trójkę. Ruch bez zmian: wykładniki dwa i dwa dają cztery.",
        )
        self.wait(8.5)


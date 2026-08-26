from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_example


class Chapter13ExampleM10(LongScene):
    chapter_tag_text = "EXAMPLE 9 / 9"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("EXAMPLE 9   —   sum up to 10²", 0.56)
        self.play(Write(title), run_time=1.4)
        build_example(self, k=9, cell=0.44, step_words="Nineteen cells: 9 x 9 becomes 10 x 10. Nine cases, zero new ideas.")
        self.wait(7.0)


from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_example


class Chapter08ExampleM5(LongScene):
    chapter_tag_text = "EXAMPLE 4 / 9"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("EXAMPLE 4   —   1 + 3 + 5 + 7 + 9  =  5²", 0.54)
        self.play(Write(title), run_time=1.4)
        build_example(self, k=4, cell=0.72, step_words="Nine more cells, and the 4 x 4 square becomes a 5 x 5 square.")
        self.wait(7.0)


from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_example


class Chapter05ExampleM2(LongScene):
    chapter_tag_text = "EXAMPLE 1 / 9"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("EXAMPLE 1   —   1 + 3  =  2²", 0.54)
        self.play(Write(title), run_time=1.4)
        build_example(self, k=1, cell=1, step_words="One L-shaped layer of 3 cells wraps the start cell into a perfect 2 x 2 block.")
        self.wait(7.0)


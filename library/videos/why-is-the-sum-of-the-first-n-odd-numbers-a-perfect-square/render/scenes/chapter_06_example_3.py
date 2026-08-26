from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_example


class Chapter06ExampleM3(LongScene):
    chapter_tag_text = "EXAMPLE 2 / 9"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("EXAMPLE 2   —   1 + 3 + 5  =  3²", 0.54)
        self.play(Write(title), run_time=1.4)
        build_example(self, k=2, cell=0.95, step_words="Same move, bigger square: a 5-cell L turns the 2 x 2 block into a 3 x 3 block.")
        self.wait(7.0)


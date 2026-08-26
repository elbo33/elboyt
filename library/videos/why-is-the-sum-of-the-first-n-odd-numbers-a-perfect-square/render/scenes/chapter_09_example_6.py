from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_example


class Chapter09ExampleM6(LongScene):
    chapter_tag_text = "EXAMPLE 5 / 9"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("EXAMPLE 5   —   sum up to 6²", 0.56)
        self.play(Write(title), run_time=1.4)
        build_example(self, k=5, cell=0.64, step_words="Eleven cells this time. The L is bigger; the idea is not.")
        self.wait(7.0)


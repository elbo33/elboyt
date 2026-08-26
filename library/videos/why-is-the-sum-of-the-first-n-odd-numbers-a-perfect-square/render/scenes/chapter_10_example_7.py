from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_example


class Chapter10ExampleM7(LongScene):
    chapter_tag_text = "EXAMPLE 6 / 9"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("EXAMPLE 6   —   sum up to 7²", 0.56)
        self.play(Write(title), run_time=1.4)
        build_example(self, k=6, cell=0.58, step_words="Thirteen cells wrap the 6 x 6 square into a 7 x 7 square. Still one move.")
        self.wait(7.0)


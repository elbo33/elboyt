from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_example


class Chapter11ExampleM8(LongScene):
    chapter_tag_text = "EXAMPLE 7 / 9"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("EXAMPLE 7   —   sum up to 8²", 0.56)
        self.play(Write(title), run_time=1.4)
        build_example(self, k=7, cell=0.52, step_words="Fifteen cells: 7 x 7 becomes 8 x 8. The template has not changed once.")
        self.wait(7.0)


from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

from support.template import build_example


class Chapter12ExampleM9(LongScene):
    chapter_tag_text = "EXAMPLE 8 / 9"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("EXAMPLE 8   —   sum up to 9²", 0.56)
        self.play(Write(title), run_time=1.4)
        build_example(self, k=8, cell=0.48, step_words="Seventeen cells turn 8 x 8 into 9 x 9. You can predict every beat by now.")
        self.wait(7.0)


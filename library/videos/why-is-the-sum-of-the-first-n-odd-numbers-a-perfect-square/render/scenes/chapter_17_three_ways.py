from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, odd_square_grid, running_total_panel,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter17ThreeWays(LongScene):
    chapter_tag_text = "2n+1, THREE WAYS"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("WHY THE L HAS 2n + 1 CELLS", 0.56)

        v1 = VGroup(
            subhead("1  ·  count the L", 0.42, ACCENT),
            body("n cells along the top,  n down the side,  1 in the shared corner.", 0.36),
            body("n + n + 1  =  2n + 1", 0.42, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        v2 = VGroup(
            subhead("2  ·  subtract the squares", 0.42, ACCENT),
            body("(n + 1)²  −  n²  =  (n² + 2n + 1)  −  n²  =  2n + 1", 0.36, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        v3 = VGroup(
            subhead("3  ·  walk the odd numbers", 0.42, ACCENT),
            body("the n-th odd number is 2n − 1,  so the next one is 2n + 1.", 0.36, SECONDARY),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        col = VGroup(v1, v2, v3).arrange(DOWN, aligned_edge=LEFT, buff=0.55).move_to([0, -0.3, 0])

        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(v1, shift=0.2 * UP), run_time=1.0)
        self.wait(1.8)
        self.play(FadeIn(v2, shift=0.2 * UP), run_time=1.0)
        self.wait(1.8)
        self.play(FadeIn(v3, shift=0.2 * UP), run_time=1.0)
        self.wait(1.6)
        note = caption("Three routes, one number.  That is why the pattern is forced.")
        self.play(FadeIn(note, shift=0.2 * UP), run_time=1.0)
        self.play(LaggedStart(*[Indicate(v[-1], color=SECONDARY) for v in (v1, v2, v3)], lag_ratio=0.3), run_time=2.2)
        self.wait(6.0)


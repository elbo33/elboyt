import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RootsCubeGroups(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  4 / 4")
        cells = VGroup()
        for txt, col in [("2", ACCENT), ("2", ACCENT), ("2", ACCENT), ("5", SECONDARY)]:
            box = Square(side_length=0.62, stroke_width=2.5, stroke_color=MUTED, fill_color=col, fill_opacity=0.28)
            lab = small_label(txt, 0.34, FOREGROUND).move_to(box)
            cells.add(VGroup(box, lab))
        cells.arrange(RIGHT, buff=0)
        triplet = VGroup(cells[0], cells[1], cells[2])
        brace = Brace(triplet, UP, color=ACCENT)
        out = mtex(r"2", 0.7, ACCENT).next_to(brace, UP, buff=0.16)
        start = mtex(r"\sqrt[3]{40}=\sqrt[3]{2^3\cdot5}", 0.62, FOREGROUND).next_to(cells, UP, buff=1.0)
        finish = mtex(r"2\sqrt[3]{5}", 0.78, SECONDARY).next_to(cells, DOWN, buff=0.65)
        stage_figure(self, VGroup(start, cells, brace, out, finish),
            question="Uproszczenie to grupowanie pełnych paczek.",
            caption="Przy pierwiastku trzeciego stopnia trzy takie same czynniki wychodzą jako jeden.",
            reveal=[
                [Write(start)],
                [LaggedStart(*[FadeIn(c, shift=0.10*UP) for c in cells], lag_ratio=0.16)],
                [GrowFromCenter(brace), FadeIn(out)],
                [Write(finish)],
            ])
        hold(self, 1.2)



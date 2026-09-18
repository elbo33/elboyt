import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
from support.archetypes import stage_figure


class RootsWhyRationalize(LessonScene):
    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO TO DZIAŁA  ·  3 / 4")
        slots = VGroup()
        for txt, col in [("2", ACCENT), ("_", MUTED), ("_", MUTED)]:
            box = Square(side_length=0.68, stroke_width=2.5, stroke_color=MUTED, fill_color=col, fill_opacity=0.24)
            lab = small_label(txt, 0.36, FOREGROUND if txt != "_" else MUTED).move_to(box)
            slots.add(VGroup(box, lab))
        slots.arrange(RIGHT, buff=0)
        need = mtex(r"\sqrt[3]{2}\cdot\sqrt[3]{2^2}=\sqrt[3]{2^3}=2", 0.62, FOREGROUND).next_to(slots, UP, buff=0.85)
        fill = VGroup(small_label("2", 0.36, ACCENT), small_label("2", 0.36, ACCENT)).arrange(RIGHT, buff=0.38).move_to(slots[1:].get_center())
        frac = mtex(r"\frac{12}{\sqrt[3]{2}}\cdot\frac{\sqrt[3]{4}}{\sqrt[3]{4}}", 0.62, SECONDARY).next_to(slots, DOWN, buff=0.7)
        stage_figure(self, VGroup(need, slots, fill, frac),
            question="Usuwanie niewymierności to dopełnianie paczki.",
            caption="W mianowniku ma powstać pełna potęga stopnia n.",
            reveal=[
                [Write(need)],
                [FadeIn(slots)],
                [FadeIn(fill, shift=0.12*UP)],
                [Write(frac)],
            ])
        hold(self, 1.2)



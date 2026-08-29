from manim import *
from support.style import (
    LongScene, FONT, headline, subhead, small_label, body, statement, caption,
    bullet_list, mtex, factor_strip,
)
from support.colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np


class Chapter02Roadmap(LongScene):
    chapter_tag_text = "PLAN"

    def construct(self):
        self.add_texture()
        self.add_chapter_tag()
        title = headline("JAK ZBUDOWANY JEST TEN FILM", 0.6)
        items = [
            "Podstawy  —  czym jest wykładnik",
            "Główna budowa  —  mnożenie potęg w jednym ujęciu",
            "Osiem przykładów  —  ten sam schemat, inne liczby",
            "Sprawdzenie wzoru  —  wykładniki się dodają",
            "Duży przypadek  —  wykładniki 10 i 15",
            "Dlaczego to działa  —  liczenie czynników",
            "Jedno prawo  —  potęga potęgi, zero, wykładnik ujemny",
            "Pierwiastek jako wykładnik  1/n",
            "Algebra  —  wszystkie reguły z jednej",
        ]
        rows = bullet_list(items, 0.34, buff=0.26)
        rows.move_to([0, -0.25, 0])
        note = caption("Za każdym razem tak samo: pokaż przypadek, potem pokaż, dlaczego nie może zawieść.")

        self.play(Write(title), run_time=1.6)
        self.play(LaggedStart(*[FadeIn(r, shift=0.3 * RIGHT) for r in rows], lag_ratio=0.3), run_time=5.5)
        self.wait(0.8)
        box = SurroundingRectangle(rows[2], color=ACCENT, buff=0.18)
        self.play(Create(box), run_time=1.0)
        self.play(Indicate(rows[2], color=ACCENT, scale_factor=1.04), run_time=1.4)
        self.wait(1.0)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.9)
        self.wait(2.6)
        self.play(FadeOut(box), run_time=0.8)
        self.wait(8.0)


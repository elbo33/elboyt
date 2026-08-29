"""Render one scene per archetype, using ciag-arytmetyczny content so the frames
double as previews of real authored scenes."""
import numpy as np
from manim import *

from support.archetypes import stage_card, stage_derivation, stage_figure, stage_model
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY
from support.style import LessonScene, mtex, small_label


class A1_Figure(LessonScene):
    """INTUITION I3 — number line, equal +r hops, brace over n-1 of them."""

    def construct(self):
        self.add_texture()
        self.add_scene_tag("INTUICJA  ·  3 / 4")
        axis = NumberLine(x_range=[0, 20, 4], length=9.5, include_numbers=False,
                          include_ticks=False, color=MUTED)
        pts = [0, 4, 8, 12, 16]
        dots = VGroup(*[Dot(axis.n2p(p), radius=0.09, color=ACCENT) for p in pts])
        labels = VGroup(*[mtex(f"a_{{{i+1}}}", 0.5, FOREGROUND).next_to(axis.n2p(p), DOWN, buff=0.3)
                          for i, p in enumerate(pts)])
        hops = VGroup()
        for i in range(4):
            a = CurvedArrow(axis.n2p(pts[i]) + 0.12 * UP, axis.n2p(pts[i + 1]) + 0.12 * UP,
                            angle=-TAU / 7, color=SECONDARY, stroke_width=3, tip_length=0.16)
            hops.add(VGroup(a, small_label("+ r", 0.34, SECONDARY).next_to(a, UP, buff=0.05)))
        brace = Brace(hops, UP, color=MUTED)
        blab = small_label("n − 1 skoków  (tu 4)", 0.36, MUTED).next_to(brace, UP, buff=0.12)
        figure = VGroup(axis, dots, labels, hops, brace, blab)
        stage_figure(
            self, figure,
            question="Od pierwszego wyrazu do n-tego robimy równe skoki po r.",
            caption="Ile skoków? O jeden mniej niż numer wyrazu: n − 1.",
        )


class A2_DerivationSymbolic(LessonScene):
    """DEFINITION D4 — the nth term is a linear function of n."""

    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  4 / 5")
        stage_derivation(
            self,
            symbolic=[
                r"a_n = a_1 + (n-1)\cdot r",
                r"a_n = a_1 + rn - r",
                r"a_n = rn + (a_1 - r)",
            ],
            caption="To funkcja liniowa zmiennej n: współczynnik przy n to różnica r.",
        )


class A2_DerivationColumns(LessonScene):
    """WHY_IT_WORKS W2-W4 — the forwards/backwards pairing (the risky archetype fit)."""

    def construct(self):
        self.add_texture()
        self.add_scene_tag("DLACZEGO DZIAŁA WZÓR NA SUMĘ  ·  3 / 6")
        stage_derivation(
            self,
            columns={
                "rows": [
                    ("od przodu", ["2", "5", "8", "11", "14"]),
                    ("od tyłu", ["14", "11", "8", "5", "2"]),
                    ("suma", ["16", "16", "16", "16", "16"]),
                ],
                "combine": r"2\,S_n = n\,(a_1 + a_n)",
            },
            caption="Każda z n par ma tę samą sumę: pierwszy + ostatni wyraz.",
        )


class A3_Card(LessonScene):
    """DEFINITION D3 — the nth-term formula with (n-1) called out."""

    def construct(self):
        self.add_texture()
        self.add_scene_tag("DEFINICJA  ·  3 / 5")
        stage_card(
            self,
            centerpiece=r"a_n = a_1 + (n-1)\cdot r",
            annotations=[("(n-1)", "liczba skoków po r")],
            strip=r"a_1=4,\ r=4:\quad a_{10}=4+9\cdot 4=40",
            caption="Znasz a_1 i r — policzysz dowolny wyraz bez wypisywania poprzednich.",
        )


class A4_Model(LessonScene):
    """SUMMARY S2 — the two formulas on cards."""

    def construct(self):
        self.add_texture()
        self.add_scene_tag("PODSUMOWANIE  ·  2 / 3")
        c1 = VGroup(
            small_label("n-ty wyraz", 0.34, MUTED),
            mtex(r"a_n = a_1 + (n-1)\,r", 0.6, SECONDARY),
        ).arrange(DOWN, buff=0.3)
        c2 = VGroup(
            small_label("suma n wyrazów", 0.34, MUTED),
            mtex(r"S_n = \frac{a_1 + a_n}{2}\cdot n", 0.6, SECONDARY),
        ).arrange(DOWN, buff=0.3)
        stage_model(
            self, cards=[c1, c2],
            tagline="Stały skok r. Wyraz: start plus n − 1 skoków. Suma: n par przez 2.",
        )

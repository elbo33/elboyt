from manim import *
from support.style import LessonScene, FONT, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.archetypes import stage_figure


class Equal(LessonScene):
    def construct(self):
        self.add_texture()
        ax = NumberLine(x_range=[0, 16, 4], length=6.8, include_numbers=False,
                        include_ticks=False, color=MUTED)
        pts = [0, 4, 8, 12, 16]
        dots = VGroup(*[Dot(ax.n2p(p), radius=0.13, color=ACCENT) for p in pts])
        labs = VGroup(*[mtex(f"a_{{{i+1}}}", 0.56).next_to(ax.n2p(p), DOWN, buff=0.32)
                        for i, p in enumerate(pts)])
        hops = VGroup(*[CurvedArrow(ax.n2p(pts[i]) + 0.15 * UP, ax.n2p(pts[i+1]) + 0.15 * UP,
                                    angle=-TAU / 7, color=SECONDARY, stroke_width=4, tip_length=0.2)
                       for i in range(4)])
        stage_figure(self, VGroup(ax, dots, labs, hops),
            question="Ten sam krok, wciąż od nowa.",
            caption="Równe skoki: to znaczy arytmetyczny.",
            reveal=[
                [Create(ax), *[FadeIn(d, scale=0.5) for d in dots], FadeIn(labs)],
                [LaggedStart(*[Create(h) for h in hops], lag_ratio=0.5)],
            ],
            pace="fast")


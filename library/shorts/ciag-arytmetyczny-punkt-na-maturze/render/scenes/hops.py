from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, RED
from support.style import mtex, small_label
from support.archetypes import stage_figure


class Hops(LessonScene):
    def construct(self):
        self.add_texture()
        axis = NumberLine(x_range=[0, 16, 4], length=6.8, include_numbers=False,
                          include_ticks=False, color=MUTED)
        pts = [0, 4, 8, 12, 16]
        dots = VGroup(*[Dot(axis.n2p(p), radius=0.14, color=ACCENT) for p in pts])
        labs = VGroup(*[mtex(f"a_{{{i+1}}}", 0.62).next_to(axis.n2p(p), DOWN, buff=0.34)
                        for i, p in enumerate(pts)])
        hops = VGroup()
        for i in range(4):
            hops.add(CurvedArrow(axis.n2p(pts[i]) + 0.16 * UP, axis.n2p(pts[i + 1]) + 0.16 * UP,
                                 angle=-TAU / 7, color=SECONDARY, stroke_width=4, tip_length=0.22))
        brace = Brace(hops, UP, color=MUTED)
        blab = small_label("4 skoki  =  n − 1", 0.56, MUTED).next_to(brace, UP, buff=0.16)
        figure = VGroup(axis, dots, labs, hops, brace, blab)
        stage_figure(self, figure,
            question="Ile skoków do piątego wyrazu?",
            caption="Do n-tego wyrazu: n minus jeden skoków.",
            reveal=[
                [Create(axis), *[FadeIn(d, scale=0.5) for d in dots], FadeIn(labs)],
                [LaggedStart(*[Create(h) for h in hops], lag_ratio=0.5)],
                [GrowFromCenter(brace), FadeIn(blab)],
            ],
            pace="fast")


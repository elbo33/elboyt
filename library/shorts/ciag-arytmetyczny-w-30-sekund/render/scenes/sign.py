from manim import *
from support.style import LessonScene, FONT, mtex, small_label
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.archetypes import stage_figure


class Sign(LessonScene):
    def construct(self):
        self.add_texture()
        def mini(vals, col, label):
            a = NumberLine(x_range=[min(vals) - 2, max(vals) + 2, 100], length=5.4,
                           include_numbers=False, include_ticks=False, color=MUTED)
            ds = VGroup(*[Dot(a.n2p(v), radius=0.1, color=col) for v in vals])
            return VGroup(a, ds, small_label(label, 0.5, MUTED).next_to(a, DOWN, buff=0.34))
        m1 = mini([1, 3, 5, 7], GREEN, "r > 0 : rośnie")
        m2 = mini([7, 5, 3, 1], RED, "r < 0 : maleje")
        m3 = mini([4, 4, 4, 4], MUTED, "r = 0 : stały")
        stage_figure(self, VGroup(m1, m2, m3).arrange(DOWN, buff=0.55),
            question="Sam znak r wystarczy.",
            caption="Nie trzeba nic liczyć.", pace="fast")


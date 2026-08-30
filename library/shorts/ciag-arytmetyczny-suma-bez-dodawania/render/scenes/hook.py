from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED


class Hook(LessonScene):
    def construct(self):
        self.add_texture()
        head = Text("SUMA STU WYRAZÓW\nW GŁOWIE", font=FONT, weight=BOLD,
                    color=FOREGROUND, line_spacing=1.05).scale(0.92)
        head.move_to([0, 4.0, 0])
        s = MathTex(r"1 + 2 + 3 + \cdots + 99 + 100").scale(1.15).set_color(FOREGROUND)
        s.move_to([0, -0.4, 0])
        arc = CurvedArrow(s[0][0].get_top() + 0.2 * UP, s[0][-1].get_top() + 0.2 * UP,
                          angle=-TAU / 8, color=ACCENT, stroke_width=4)
        self.play(FadeIn(head, scale=1.08), run_time=0.4)
        self.play(Write(s), run_time=0.6)
        self.wait(0.4)
        self.play(Create(arc), run_time=0.5)
        self.wait(1.4)


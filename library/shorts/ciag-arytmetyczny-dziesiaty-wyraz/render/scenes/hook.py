from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED


class Hook(LessonScene):
    def construct(self):
        self.add_texture()
        head = Text("DZIESIĄTY WYRAZ\nW 20 SEKUND", font=FONT, weight=BOLD,
                    color=FOREGROUND, line_spacing=1.05).scale(0.92)
        head.move_to([0, 4.0, 0])
        chips = VGroup(
            MathTex(r"a_1 = 7", color=ACCENT).scale(1.25),
            MathTex(r"r = -4", color=ACCENT).scale(1.25),
        ).arrange(RIGHT, buff=1.1).move_to([0, -0.4, 0])
        self.play(FadeIn(head, scale=1.08), run_time=0.4)
        self.play(LaggedStart(*[FadeIn(c, shift=0.15 * UP) for c in chips], lag_ratio=0.4),
                  run_time=0.6)
        self.wait(1.6)


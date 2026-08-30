from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED


class Answer(LessonScene):
    def construct(self):
        self.add_texture()
        ans = MathTex(r"a_{10} = -29", color=SECONDARY).scale(1.7).move_to([0, 0.3, 0])
        box = SurroundingRectangle(ans, color=SECONDARY, buff=0.35, corner_radius=0.14)
        cap = Text("Bez wypisywania wyrazów.", font=FONT, weight=MEDIUM, color=MUTED).scale(0.5)
        cap.move_to([0, ans.get_bottom()[1] - 1.0, 0])
        self.play(Write(ans), run_time=0.5)
        self.play(Create(box), Flash(ans, color=SECONDARY, line_length=0.4), run_time=0.5)
        self.play(FadeIn(cap, shift=0.15 * UP), run_time=0.4)
        self.wait(2.2)


from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, RED


class Hook(LessonScene):
    def construct(self):
        self.add_texture()
        head = Text("TRACISZ TU PUNKT\nNA MATURZE", font=FONT, weight=BOLD,
                    color=FOREGROUND, line_spacing=1.05).scale(0.92)
        head.move_to([0, 4.0, 0])
        if head.width > 8.4:
            head.scale(8.4 / head.width)

        wrong = MathTex(r"a_n", r"=", r"a_1", r"+", r"n", r"\cdot r").scale(1.5)
        wrong.set_color(FOREGROUND).move_to([0, -0.6, 0])
        right = MathTex(r"a_n", r"=", r"a_1", r"+", r"(n-1)", r"\cdot r").scale(1.5)
        right.set_color(FOREGROUND).move_to([0, -0.6, 0])
        strike = Line(wrong[4].get_left() + 0.12 * LEFT, wrong[4].get_right() + 0.12 * RIGHT,
                      color=RED, stroke_width=7)

        self.play(FadeIn(head, scale=1.08), run_time=0.4)
        self.play(Write(wrong), run_time=0.5)
        self.wait(0.45)
        self.play(wrong[4].animate.set_color(RED), Create(strike), run_time=0.4)
        self.wait(0.4)
        self.play(FadeOut(strike), ReplacementTransform(wrong, right), run_time=0.55)
        self.play(right[4].animate.set_color(ACCENT),
                  Flash(right[4], color=ACCENT, line_length=0.35), run_time=0.4)
        self.wait(1.4)


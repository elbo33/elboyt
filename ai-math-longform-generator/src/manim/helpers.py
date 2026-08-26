from manim import *
from .colors import ACCENT, FOREGROUND, MUTED, SECONDARY
from .style import FONT, small_label


def draw_path(scene, path, run_time=1.1):
    scene.play(Create(path), run_time=run_time, rate_func=smooth)


def pulse(scene, mob, color=ACCENT):
    scene.play(Indicate(mob, color=color, scale_factor=1.08), run_time=0.8)


def fade_caption(scene, text_obj, hold=0.8):
    scene.play(FadeIn(text_obj, shift=0.2 * UP), run_time=0.45)
    scene.wait(hold)
    scene.play(FadeOut(text_obj, shift=0.15 * UP), run_time=0.35)


def meter(label, value_text, color=SECONDARY):
    title = Text(label, font=FONT, weight=MEDIUM, color=MUTED).scale(0.26)
    value = Text(value_text, font=FONT, weight=BOLD, color=color).scale(0.42)
    value.next_to(title, DOWN, buff=0.12)
    return VGroup(title, value)


def section_wipe(scene, color=ACCENT, run_time=0.6):
    """A quick horizontal accent wipe used as a consistent chapter transition."""
    bar = Rectangle(width=16, height=9, fill_color=color, fill_opacity=1, stroke_width=0)
    bar.move_to([-18, 0, 0])
    scene.play(bar.animate.move_to([0, 0, 0]), run_time=run_time / 2, rate_func=rush_into)
    scene.play(bar.animate.move_to([18, 0, 0]), run_time=run_time / 2, rate_func=rush_from)
    scene.remove(bar)

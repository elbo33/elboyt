"""The episode thumbnail: one still, 1920x1080, in the house visual language of
`.thumbs-preview/ThumbA-flat.png`. Same ground, typography and layout every
time; the kicker, headline, figure and formula are specific to the episode.

The planner emits a `ThumbnailScene(LessonScene)` whose `construct` is a single
`stage_thumbnail(...)` call. It is rendered with `manim -s` (last frame only),
never as part of the video.
"""
from manim import *

from .colors import ACCENT, FOREGROUND, MUTED
from .config import FRAME_H, FRAME_W
from .style import FONT


def _fit_width(mob, max_w):
    if mob.width > max_w:
        mob.scale(max_w / mob.width)
    return mob


def stage_thumbnail(scene, kicker, headline, formula, figure=None):
    """kicker  - short section label, top-left, letter-spaced caps + accent rule
    headline  - 1-3 lines (``\\n`` separated), bold caps, centred, upper band
    formula   - a LaTeX string, rendered large in ACCENT along the lower band
    figure    - optional mobject (chip strip, number line, ...) for the middle
    """
    scene.add_texture()

    # --- kicker + accent rule (top-left) ---------------------------------
    tag = Text(kicker.upper(), font=FONT, weight=BOLD, color=MUTED).scale(0.52)
    tag.to_corner(UL, buff=0.9)
    rule = Line(
        tag.get_corner(DL) + [0, -0.18, 0],
        tag.get_corner(DR) + [0.35, -0.18, 0],
        color=ACCENT,
        stroke_width=5,
    )
    scene.add(tag, rule)

    # --- headline (bold caps, centred, upper band) ----------------------
    lines = VGroup(*[
        Text(part.strip().upper(), font=FONT, weight=BOLD, color=FOREGROUND).scale(1.42)
        for part in headline.split("\n")
    ])
    lines.arrange(DOWN, center=True, buff=0.26)
    _fit_width(lines, FRAME_W - 2.0)
    lines.move_to([0, FRAME_H / 2 - 1.05 - lines.height / 2, 0])
    scene.add(lines)

    # --- figure (optional, middle band) --------------------------------
    fig_bottom = -0.4
    if figure is not None:
        figure.scale_to_fit_height(min(2.2, figure.height))
        _fit_width(figure, FRAME_W - 3.6)
        figure.move_to([0, min(-0.15, lines.get_bottom()[1] - 0.55 - figure.height / 2), 0])
        scene.add(figure)
        fig_bottom = figure.get_bottom()[1]

    # --- formula (large, ACCENT, lower band) ---------------------------
    fx = MathTex(formula, color=ACCENT)
    fx.scale(2.1 if figure is not None else 2.5)
    _fit_width(fx, FRAME_W - 2.4)
    top = min(fig_bottom - 0.5 - fx.height / 2, -1.4)
    fx.move_to([0, max(top, -FRAME_H / 2 + 0.6 + fx.height / 2), 0])
    scene.add(fx)

    scene.wait(0.1)

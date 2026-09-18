"""Shorts-only helpers. The content scenes of a short reuse the same archetypes
and templates as the long form (with pace="fast"); this module holds the one
thing a short adds that the long form has no equivalent for — the retention
hook that opens every short."""
from manim import *

from .colors import ACCENT, BACKGROUND, FOREGROUND
from .config import FRAME_W, FRAME_H, SAFE_BOTTOM_Y
from .style import FONT


def hook_title(text, scale=0.92, y=None):
    """The retention-hook title for a short. Centred: horizontally, and as a
    block, every line centred under the previous one. `text` may contain `\\n`.
    Returns the VGroup, placed near the top of the frame (CLAUDE.md rule 9)."""
    lines = VGroup(*[
        Text(part.strip(), font=FONT, weight=BOLD, color=FOREGROUND).scale(scale)
        for part in text.split("\n")
    ])
    lines.arrange(DOWN, center=True, buff=0.18)
    if lines.width > FRAME_W - 1.0:
        lines.scale((FRAME_W - 1.0) / lines.width)
    lines.move_to([0, FRAME_H / 2 - 1.4 - lines.height / 2 if y is None else y, 0])
    return lines


def hook_card(scene, line, kicker=None):
    """The first ~3 seconds of a short. One blunt line slams in, holds briefly,
    hard cut. `kicker` is an optional one- or two-word accent tag under it
    (e.g. "(n - 1)", "-1 PKT"). Kept clear of the bottom 25% no-go zone."""
    words = line.split()
    txt = Text("\n".join(_wrap(words, 18)), font=FONT, weight=BOLD, color=FOREGROUND,
               line_spacing=1.05).scale(0.62)
    if txt.width > FRAME_W - 1.0:
        txt.scale((FRAME_W - 1.0) / txt.width)
    group = VGroup(txt)
    if kicker:
        k = Text(kicker, font=FONT, weight=BOLD, color=ACCENT).scale(0.7)
        k.next_to(txt, DOWN, buff=0.6)
        group.add(k)
    group.move_to([0, max(0.4, SAFE_BOTTOM_Y + group.height / 2 + 1.2), 0])

    scene.play(FadeIn(txt, scale=1.08), run_time=0.4)
    if kicker:
        scene.play(FadeIn(k, shift=0.15 * UP), run_time=0.3)
    scene.wait(1.5)


def _wrap(words, width):
    lines, cur = [], ""
    for w in words:
        t = w if not cur else f"{cur} {w}"
        if len(t) > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines

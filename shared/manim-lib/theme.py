"""Reusable Manim theme/helpers shared across all projects.

Import this after `shared/manim-lib` has been added to `sys.path` (the
render pipeline does this automatically before invoking Manim):

    from theme import PALETTE, styled_title

Keep anything project-specific OUT of this file — it's shared by every
project's scenes.
"""

from manim import Text

PALETTE = {
    "background": "#1E1E2E",
    "foreground": "#CDD6F4",
    "accent": "#89B4FA",
    "highlight": "#F9E2AF",
    "muted": "#6C7086",
}


def styled_title(text: str, color: str = PALETTE["accent"]) -> Text:
    """A consistently-styled title Text mobject used across scenes."""
    return Text(text, color=color, weight="BOLD").scale(1.1)


def styled_body(text: str, color: str = PALETTE["foreground"]) -> Text:
    """A consistently-styled body Text mobject used across scenes."""
    return Text(text, color=color).scale(0.7)

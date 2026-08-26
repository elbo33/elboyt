from manim import *
from .colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, SOFT

# Long-form YouTube: horizontal 16:9 at 1080p30.
config.pixel_width = 1920
config.pixel_height = 1080
config.frame_width = 14.222222
config.frame_height = 8
config.frame_rate = 30
config.background_color = BACKGROUND

FONT = "Avenir Next"


class LongScene(Scene):
    """Base scene for every chapter of a long-form video.

    Keeps one consistent visual language:
      - dark textured background
      - a small chapter tag pinned to the top-left of every scene
      - a thin baseline rule near the bottom for visual anchoring
    The chapter tag is what makes the repetitive structure legible: the same
    marker, in the same place, in every single chapter.
    """

    chapter_tag_text = ""

    def setup(self):
        self.camera.background_color = BACKGROUND

    def add_texture(self):
        lines = VGroup()
        for y in [i * 0.8 - 8 for i in range(21)]:
            line = Line([-8, y, 0], [8, y, 0], color=SOFT, stroke_width=1)
            line.set_opacity(0.16)
            lines.add(line)
        for x in [i * 0.8 - 8 for i in range(21)]:
            line = Line([x, -5, 0], [x, 5, 0], color=SOFT, stroke_width=1)
            line.set_opacity(0.10)
            lines.add(line)
        self.add(lines)

    def add_chapter_tag(self, text=None):
        label = text if text is not None else self.chapter_tag_text
        if not label:
            return None
        tag = Text(label, font=FONT, weight=BOLD, color=MUTED).scale(0.30)
        tag.to_corner(UL, buff=0.55)
        accent_bar = Line(
            tag.get_corner(DL) + [0, -0.14, 0],
            tag.get_corner(DR) + [0, -0.14, 0],
            color=ACCENT,
            stroke_width=3,
        )
        group = VGroup(tag, accent_bar)
        self.add(group)
        return group


def headline(text, scale=0.9):
    obj = Text(text, font=FONT, weight=BOLD, color=FOREGROUND, line_spacing=0.9)
    obj.scale(scale)
    obj.to_edge(UP, buff=0.9)
    return obj


def subhead(text, scale=0.5, color=ACCENT):
    return Text(text, font=FONT, weight=BOLD, color=color).scale(scale)


def small_label(text, scale=0.36, color=MUTED):
    return Text(text, font=FONT, weight=MEDIUM, color=color).scale(scale)


def body(text, scale=0.42, color=FOREGROUND):
    return Text(text, font=FONT, weight=MEDIUM, color=color, line_spacing=1.0).scale(scale)


def statement(text, scale=0.55, color=FOREGROUND):
    return Text(text, font=FONT, weight=BOLD, color=color, line_spacing=0.95).scale(scale)


def caption(text, scale=0.34, color=MUTED):
    """A bottom-of-frame caption. Landscape has no platform-UI dead zone,
    but we still keep the lowest sliver clear for breathing room."""
    obj = small_label(text, scale, color)
    obj.to_edge(DOWN, buff=0.7)
    return obj


def bullet_list(items, scale=0.42, color=FOREGROUND, dot_color=ACCENT, buff=0.5):
    rows = VGroup()
    for item in items:
        dot = Dot(radius=0.06, color=dot_color)
        label = body(item, scale, color)
        row = VGroup(dot, label).arrange(RIGHT, buff=0.35)
        rows.add(row)
    rows.arrange(DOWN, aligned_edge=LEFT, buff=buff)
    return rows


def odd_square_grid(n, cell=0.62, origin=None, colors=None):
    """An n x n grid of unit cells, each cell coloured by its L-shaped layer
    index max(row, col). Returns (grid_group, layers) where layers[k] is the
    VGroup of the k-th gnomon (which always has 2k+1 cells)."""
    import numpy as np

    if origin is None:
        origin = np.array([-n * cell / 2, -n * cell / 2, 0])
    if colors is None:
        colors = [ACCENT, SECONDARY, "#7CFFB2", "#FF6B6B", "#C4B5FD", "#F9A8D4"]

    grid = VGroup()
    layers = [VGroup() for _ in range(n)]
    for row in range(n):
        for col in range(n):
            k = max(row, col)
            sq = Square(
                side_length=cell,
                stroke_width=2,
                stroke_color=MUTED,
                fill_color=colors[k % len(colors)],
                fill_opacity=0.55,
            )
            sq.move_to(origin + np.array([(col + 0.5) * cell, (row + 0.5) * cell, 0]))
            grid.add(sq)
            layers[k].add(sq)
    return grid, layers


def running_total_panel(pairs, scale=0.42):
    """A tidy two-column ledger: left = the odd-number sum so far,
    right = the perfect square it lands on. `pairs` is a list of
    (sum_expression, result) string tuples."""
    rows = VGroup()
    for expr, result in pairs:
        left = body(expr, scale, FOREGROUND)
        eq = body("=", scale, MUTED)
        right = subhead(result, scale + 0.02, SECONDARY)
        rows.add(VGroup(left, eq, right).arrange(RIGHT, buff=0.28))
    rows.arrange(DOWN, aligned_edge=LEFT, buff=0.42)
    return rows

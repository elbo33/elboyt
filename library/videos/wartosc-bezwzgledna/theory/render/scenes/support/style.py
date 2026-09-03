import re

import numpy as np
from manim import *
from .config import FRAME_W, FRAME_H, IS_VERTICAL, SAFE_BOTTOM_Y, FORMAT_ID
from .colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, SOFT, GREEN, RED

FONT = "Avenir Next"


class LessonScene(Scene):
    """Base scene for every scene of every episode, in any format.

    One consistent visual language:
      - dark textured background sized to the current frame
      - a small scene tag pinned to the top-left, same place every time
    The tag is what makes the repetitive structure legible.
    """

    chapter_tag_text = ""

    def setup(self):
        self.camera.background_color = BACKGROUND

    def add_texture(self):
        lines = VGroup()
        step = 0.8
        half_w = FRAME_W / 2 + step
        half_h = FRAME_H / 2 + step
        horizontal_opacity = 0.22 if IS_VERTICAL else 0.20
        vertical_opacity = 0.16 if IS_VERTICAL else 0.14
        y = -half_h
        while y <= half_h:
            lines.add(
                Line(
                    [-half_w, y, 0],
                    [half_w, y, 0],
                    color=SOFT,
                    stroke_width=1.0,
                ).set_opacity(horizontal_opacity)
            )
            y += step
        x = -half_w
        while x <= half_w:
            lines.add(
                Line(
                    [x, -half_h, 0],
                    [x, half_h, 0],
                    color=SOFT,
                    stroke_width=1.0,
                ).set_opacity(vertical_opacity)
            )
            x += step
        self.add(lines)

    def add_chapter_tag(self, text=None):
        label = text if text is not None else self.chapter_tag_text
        if not label:
            return None
        tag = Text(label, font=FONT, weight=BOLD, color=MUTED).scale(0.24 if not IS_VERTICAL else 0.28)
        tag.to_corner(UL, buff=0.50 if not IS_VERTICAL else 0.55)
        accent_bar = Line(
            tag.get_corner(DL) + [0, -0.14, 0],
            tag.get_corner(DR) + [0, -0.14, 0],
            color=ACCENT,
            stroke_width=3,
        )
        group = VGroup(tag, accent_bar)
        self.add(group)
        return group

    # New name; same top-left marker in the same place every scene.
    def add_scene_tag(self, text=None):
        return self.add_chapter_tag(text)


# Back-compat: legacy planners import LongScene.
LongScene = LessonScene


def headline(text, scale=0.9):
    obj = Text(text, font=FONT, weight=BOLD, color=FOREGROUND, line_spacing=0.9)
    obj.scale(scale)
    obj.to_edge(UP, buff=0.9)
    return obj


def subhead(text, scale=0.5, color=ACCENT):
    return Text(text, font=FONT, weight=BOLD, color=color).scale(scale)


def mtex(tex, scale=0.6, color=FOREGROUND):
    """A LaTeX expression at the house scale. Used for the actual power / root
    notation; prose and labels stay in the sans `FONT`."""
    return MathTex(tex, color=color).scale(scale)


def factor_strip(count, symbol, cell=0.6, color=ACCENT):
    """A contiguous horizontal strip of `count` unit cells, each printed with
    `symbol` (the base). Every worked example builds one of these for each
    operand, then butts them together — one factor per cell."""
    strip = VGroup()
    for _ in range(count):
        box = Square(
            side_length=cell,
            stroke_width=2,
            stroke_color=MUTED,
            fill_color=color,
            fill_opacity=0.45,
        )
        glyph = Text(str(symbol), font=FONT, weight=BOLD, color=FOREGROUND).scale(cell * 0.62)
        glyph.move_to(box.get_center())
        strip.add(VGroup(box, glyph))
    strip.arrange(RIGHT, buff=0)
    return strip


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


def sought_chip(labels, scale=0.34):
    """A small boxed 'SZUKANE' marker listing what the problem asks for.
    `labels` are short strings (answer-part names) or a single fallback phrase.
    Reliable: it is built from structured answer data, never parsed prose.
    A label that looks like notation is rendered as MathTex."""
    head = small_label("SZUKANE", 0.28, MUTED)

    def one(t):
        t = str(t)
        if any(ch in t for ch in "_^\\{}") or t.startswith("$"):
            try:
                return MathTex(t.strip("$"), color=SECONDARY).scale(scale + 0.1)
            except Exception:
                pass
        return subhead(t, scale, SECONDARY)

    rows = VGroup(*[one(t) for t in labels])
    rows.arrange(DOWN, aligned_edge=LEFT, buff=0.18)
    inner = VGroup(head, rows).arrange(DOWN, aligned_edge=LEFT, buff=0.2)
    box = SurroundingRectangle(inner, color=MUTED, buff=0.28, corner_radius=0.1)
    box.set_stroke(opacity=0.6)
    return VGroup(box, inner)


def answer_box(text_mob, color=SECONDARY, buff=0.3):
    """A final-answer box: the pass we run at the end of every worked scene."""
    box = SurroundingRectangle(text_mob, color=color, buff=buff, corner_radius=0.12)
    return VGroup(box, text_mob)


# --- shared polish layer (every episode inherits these) --------------------

_MATH_HINT = re.compile(r"[=+\-·/^_√πΔ≤≥≠]|\\[a-zA-Z]+|\d\s*[a-z]")


def notation(s, scale=0.5, color=FOREGROUND):
    """A one-line step. If it is mostly mathematics, render it as MathTex so the
    kerning of things like a_{10} or S_{15} is right; otherwise plain Text. The
    caller passes a display-ready string (LaTeX or prettified prose)."""
    looks_mathy = bool(_MATH_HINT.search(s)) and len(re.findall(r"[a-zA-Z]{4,}", s)) <= 1
    if looks_mathy:
        try:
            return MathTex(s, color=color).scale(scale * 1.15)
        except Exception:
            pass
    return body(s, scale, color)


def tight_box(mob, color=SECONDARY, pad=0.18):
    """SurroundingRectangle with the house corner radius. If `mob` is an empty
    slice (a MathTex sub-range that did not resolve), there is nothing to box —
    return an empty VGroup rather than raising."""
    if mob is None or (hasattr(mob, "submobjects") and len(mob.submobjects) == 0
                       and getattr(mob, "has_points", lambda: False)() is False):
        return VGroup()
    return SurroundingRectangle(mob, color=color, buff=pad, corner_radius=0.1)


def two_col(left, right, gap=1.2, at=ORIGIN):
    """Place two blocks side by side (16:9) or stacked (9:16), the shorter one
    centred against the taller. Returns the VGroup, positioned at `at`."""
    if IS_VERTICAL:
        group = VGroup(left, right).arrange(DOWN, buff=gap)
    else:
        left.move_to(ORIGIN)
        right.move_to(ORIGIN)
        h = max(left.height, right.height)
        left.align_to(np.array([0, h / 2, 0]), UP).shift(LEFT * (gap / 2 + left.width / 2))
        right.align_to(np.array([0, h / 2, 0]), UP).shift(RIGHT * (gap / 2 + right.width / 2))
        left.set_y(0)
        right.set_y(0)
        group = VGroup(left, right)
    return group.move_to(at)


# Worked-problem regions, in Manim units, format-aware. The statement lives in
# a strip at the top across every beat of a worked example; the running
# expression builds down the middle; the answer sits on a fixed baseline just
# above the caption line, never floating with the step count.
STMT_STRIP_Y = FRAME_H / 2 - (2.36 if not IS_VERTICAL else 2.75)
WORK_TOP_Y = STMT_STRIP_Y - (1.52 if not IS_VERTICAL else 1.8)
ANSWER_Y = SAFE_BOTTOM_Y + (1.5 if not IS_VERTICAL else 2.4)
CAPTION_Y = SAFE_BOTTOM_Y + (0.55 if not IS_VERTICAL else 1.1)


def numbered_steps(lines, scale=0.4, color=FOREGROUND, buff=0.34, number_color=ACCENT):
    """A left-aligned, numbered stack of solution steps. One line per entry;
    entries are already display-ready strings (LaTeX prettified upstream)."""
    rows = VGroup()
    for i, line in enumerate(lines, start=1):
        num = subhead(f"{i}", scale, number_color)
        txt = body(line, scale, color)
        rows.add(VGroup(num, txt).arrange(RIGHT, buff=0.28, aligned_edge=UP))
    rows.arrange(DOWN, aligned_edge=LEFT, buff=buff)
    return rows


def pause_cue(scene, statement, kind="exercise"):
    """The one 'now you try' signal for the whole course. Identical everywhere:
    the problem statement stays fully lit, everything else is already cleared, a
    glyph and a verb appear bottom-centre, and a ring sweeps once around the
    glyph like a silent countdown. Then the statement dims and the solution
    begins.

    kind:
      "exercise"   - ACCENT ring, ~6.5 s, verb "SPRÓBUJ SAM"
      "challenge"  - SECONDARY ring, ~10 s, verb "SPRÓBUJ SAM" (meant to be hard)
      "find_error" - ACCENT ring, ~4 s,  verb "ZNAJDŹ BŁĄD"  (spot the wrong step)
    """
    color, hold, verb, glyph_kind = {
        "exercise": (ACCENT, 6.5, "SPRÓBUJ SAM", "pause"),
        "challenge": (SECONDARY, 10.0, "SPRÓBUJ SAM", "pause"),
        "find_error": (ACCENT, 4.0, "ZNAJDŹ BŁĄD", "lens"),
    }[kind]

    center = np.array([0.0, -2.15, 0.0])

    if glyph_kind == "pause":
        bar = RoundedRectangle(
            corner_radius=0.05, width=0.16, height=0.52,
            stroke_width=0, fill_color=color, fill_opacity=1.0,
        )
        glyph = VGroup(bar, bar.copy()).arrange(RIGHT, buff=0.16).move_to(center)
    else:
        lens = Circle(radius=0.24, color=color, stroke_width=6)
        handle = Line([0.15, -0.15, 0], [0.36, -0.36, 0], color=color, stroke_width=6)
        glyph = VGroup(lens, handle).move_to(center)

    ring = Arc(radius=0.62, start_angle=PI / 2, angle=-TAU, color=color, stroke_width=4)
    ring.move_to(center)
    label = small_label(verb, 0.34, color).next_to(ring, DOWN, buff=0.26)

    scene.play(FadeIn(glyph, scale=0.7), FadeIn(label), run_time=0.5)
    scene.play(Create(ring), run_time=hold, rate_func=linear)
    scene.play(
        statement.animate.set_opacity(0.55),
        FadeOut(glyph), FadeOut(ring), FadeOut(label),
        run_time=0.6,
    )


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

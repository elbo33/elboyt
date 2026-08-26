"""Shared chapter templates.

The whole point of the long-form format is that chapters of the same kind look
and move identically. `build_example` is that repeated unit: every worked
example in every video is one call to this function.
"""

from manim import *
from .colors import FOREGROUND, MUTED, ACCENT, SECONDARY
from .style import (
    odd_square_grid,
    running_total_panel,
    subhead,
    small_label,
    caption,
)

GRID_CENTER = [-3.5, -0.4, 0]
RIGHT_X = 3.0


def cumulative_ledger(upto_n, max_rows=3):
    """Ledger rows 'sum of first t odds = t²' for t = 2 .. upto_n, newest last,
    truncated to the last `max_rows` with a leading ellipsis when longer.
    Short-form so the block stays a fixed, frame-safe width for every t."""
    rows = []
    for t in range(2, upto_n + 1):
        rows.append((f"first {t} odd numbers", f"{t*t}  =  {t}²"))
    truncated = len(rows) > max_rows
    if truncated:
        rows = rows[-max_rows:]
    panel = running_total_panel(rows)
    if truncated:
        dots = small_label("⋮", 0.4, MUTED)
        panel = VGroup(dots, *panel).arrange(DOWN, aligned_edge=LEFT, buff=0.34)
    return panel


def build_example(scene, k, cell, step_words):
    """Grow a k x k square into (k+1) x (k+1) by wrapping it in an L of 2k+1
    cells, then log the result. Identical beats for every k."""
    m = k + 1
    grid, layers = odd_square_grid(m, cell)
    grid.move_to(GRID_CENTER)
    existing = VGroup(*[c for j in range(k) for c in layers[j]])
    new_layer = layers[k]

    start_outline = Square(side_length=k * cell, color=FOREGROUND, stroke_width=5)
    start_outline.move_to(existing.get_center())
    final_outline = Square(side_length=m * cell, color=SECONDARY, stroke_width=6)
    final_outline.move_to(grid.get_center())

    start_cap = subhead(f"start:  a {k} x {k} square  =  {k*k}", 0.42, FOREGROUND).move_to([RIGHT_X, 2.4, 0])
    add_cap = subhead(f"add the next odd number:  {2*k+1}", 0.42, ACCENT).move_to([RIGHT_X, 1.55, 0])
    count_lbl = small_label("cells in this L:", 0.32, MUTED)
    counter = DecimalNumber(0, num_decimal_places=0, color=ACCENT).scale(0.8)
    count_row = VGroup(count_lbl, counter).arrange(RIGHT, buff=0.3).move_to([RIGHT_X, 0.7, 0])
    sum_line = subhead(f"{k*k}  +  {2*k+1}  =  {m*m}", 0.46, SECONDARY).move_to([RIGHT_X, -0.35, 0])
    ledger = cumulative_ledger(m).scale(0.8).move_to([RIGHT_X, -1.95, 0])
    note = caption(step_words)

    scene.play(FadeIn(existing, lag_ratio=0.05), Create(start_outline), run_time=1.6)
    scene.play(FadeIn(start_cap, shift=0.2 * UP), run_time=0.8)
    scene.wait(1.0)
    scene.play(FadeIn(add_cap, shift=0.2 * UP), FadeIn(count_row), run_time=0.9)
    for i, cell_mob in enumerate(new_layer):
        scene.play(FadeIn(cell_mob, scale=0.6), ChangeDecimalToValue(counter, i + 1), run_time=0.4)
    scene.wait(0.6)
    scene.play(Indicate(new_layer, color=ACCENT, scale_factor=1.12), run_time=1.5)
    scene.wait(0.4)
    scene.play(ReplacementTransform(start_outline, final_outline), run_time=1.3)
    scene.play(FadeIn(sum_line, shift=0.2 * UP), run_time=0.9)
    scene.wait(0.8)
    scene.play(Circumscribe(sum_line, color=SECONDARY), run_time=1.4)
    scene.play(FadeIn(ledger, shift=0.2 * UP), run_time=1.0)
    scene.wait(0.6)
    scene.play(Indicate(ledger[-1], color=SECONDARY, scale_factor=1.06), run_time=1.2)
    scene.play(FadeIn(note, shift=0.2 * UP), run_time=0.9)
    scene.wait(1.0)

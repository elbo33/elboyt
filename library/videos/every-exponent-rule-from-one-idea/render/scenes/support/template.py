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
    mtex,
    factor_strip,
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


# ---------------------------------------------------------------------------
# build_exponent_example — the repeated worked-example unit for the
# "powers and roots" long-form video. Every PRZYKŁAD chapter is one call to it.
#
# Beats, identical for every (a, m, n):
#   1. a strip of m cells (base a) and a strip of n cells (base a), apart
#   2. the product aᵐ · aⁿ written on the right
#   3. the two strips slide together into one strip of m + n cells
#   4. one brace: "m + n factors"
#   5. aᵐ · aⁿ = a^(m+n) = a^(m+n value)
#   6. the plain-number check  A · B = C
#   7. a short cumulative ledger of the cases so far
# ---------------------------------------------------------------------------

def _pow(a, e):
    return a ** e


def _czynnik(k):
    """Polish count phrase: 1 czynnik / 2-4 czynniki / 5+ czynników."""
    if k == 1:
        return "1 czynnik"
    if 2 <= k <= 4:
        return f"{k} czynniki"
    return f"{k} czynników"


def build_exponent_example(scene, a, m, n, ledger_rows, step_words):
    """One PRZYKŁAD: aᵐ · aⁿ = a^(m+n), shown as 'm factors then n more'.

    `ledger_rows` is a list of LaTeX strings (the cases settled so far), newest
    last; the block stays a fixed width because only the last few are passed in.
    """
    total = m + n
    cell = 0.62 if total <= 6 else 0.5
    right_x = 3.2

    strip_m = factor_strip(m, a, cell, ACCENT)
    strip_n = factor_strip(n, a, cell, SECONDARY)
    pair = VGroup(strip_m, strip_n).arrange(RIGHT, buff=1.0)
    pair.move_to([-3.5, 0.9, 0])

    br_m = Brace(strip_m, DOWN, color=MUTED)
    br_n = Brace(strip_n, DOWN, color=MUTED)
    lab_m = small_label(_czynnik(m), 0.3, ACCENT).next_to(br_m, DOWN, buff=0.12)
    lab_n = small_label(_czynnik(n), 0.3, SECONDARY).next_to(br_n, DOWN, buff=0.12)

    prod = mtex(rf"{a}^{{{m}}} \cdot {a}^{{{n}}}", 0.62, FOREGROUND).move_to([right_x, 2.15, 0])
    add_line = mtex(rf"= {a}^{{{m}+{n}}} = {a}^{{{total}}}", 0.62, SECONDARY).move_to([right_x, 0.95, 0])
    num_line = mtex(
        rf"{_pow(a, m)} \cdot {_pow(a, n)} = {_pow(a, total)}", 0.6, FOREGROUND
    ).move_to([right_x, -0.2, 0])

    ledger_title = small_label("dotychczas", 0.3, MUTED)
    ledger = VGroup(*[mtex(t, 0.46, FOREGROUND) for t in ledger_rows])
    ledger.arrange(DOWN, aligned_edge=LEFT, buff=0.3)
    ledger_block = VGroup(ledger_title, ledger).arrange(DOWN, aligned_edge=LEFT, buff=0.24)
    ledger_block.move_to([right_x, -1.95, 0])
    note = caption(step_words)

    # 1. the two operands, apart
    scene.play(FadeIn(strip_m, lag_ratio=0.08), GrowFromCenter(br_m), FadeIn(lab_m), run_time=1.2)
    scene.play(FadeIn(strip_n, lag_ratio=0.08), GrowFromCenter(br_n), FadeIn(lab_n), run_time=1.0)
    scene.play(Write(prod), run_time=1.0)
    scene.wait(1.8)

    # 3-4. slide together, merge the braces
    merged_n_pos = strip_m.get_right() + RIGHT * (strip_n.width / 2)
    big_brace = Brace(VGroup(strip_m.copy(), strip_n.copy().move_to(merged_n_pos)), DOWN, color=FOREGROUND)
    big_lab = small_label(_czynnik(total), 0.32, FOREGROUND).next_to(big_brace, DOWN, buff=0.12)
    scene.play(
        strip_n.animate.move_to(merged_n_pos),
        FadeOut(br_m), FadeOut(br_n), FadeOut(lab_m), FadeOut(lab_n),
        run_time=1.2,
    )
    scene.play(GrowFromCenter(big_brace), FadeIn(big_lab), run_time=0.9)
    scene.wait(1.6)

    # 5. exponents add
    scene.play(TransformFromCopy(VGroup(prod, big_lab), add_line), run_time=1.3)
    scene.play(Circumscribe(add_line, color=SECONDARY), run_time=1.3)
    scene.wait(1.4)

    # 6. the plain-number check
    scene.play(FadeIn(num_line, shift=0.2 * UP), run_time=0.9)
    scene.wait(1.6)

    # 7. ledger
    scene.play(FadeIn(ledger_title), run_time=0.5)
    scene.play(LaggedStart(*[FadeIn(r, shift=0.2 * RIGHT) for r in ledger], lag_ratio=0.35), run_time=2.4)
    scene.play(Indicate(ledger[-1], color=SECONDARY, scale_factor=1.06), run_time=1.1)
    scene.play(FadeIn(note, shift=0.2 * UP), run_time=0.9)
    scene.wait(2.4)

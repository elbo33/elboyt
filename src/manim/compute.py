"""The compute primitives — the visual vocabulary for arithmetic.

Every worked step in every episode is one call to one of these. They are used
thousands of times across the course, so each is the plainest staging that still
shows the operation happening (not just its before/after). Shared grammar:

    ACCENT     the quantity being acted on right now
    SECONDARY  the result
    GREEN      the correct thing that is easy to miss
    MUTED      context / already-settled

Each returns the settled result mobject so steps can chain. `pace="fast"`
compresses every run_time / wait for the shorts cut.
"""
from manim import *

from .colors import ACCENT, FOREGROUND, GREEN, MUTED, RED, SECONDARY
from .config import FRAME_W
from .style import FONT, factor_strip, small_label

# Widest a horizontal primitive (number line, term row) may be, so it fits the
# narrower 9:16 frame without restaging.
MAX_W = FRAME_W - 1.2


def _t(pace, base):
    return base * (0.45 if pace == "fast" else 1.0)


def _num(x):
    """LaTeX for a signed number, parenthesised when negative."""
    return f"({x})" if x < 0 else f"{x}"


# ---------------------------------------------------------------------------
# 1 · substitute — putting numbers into a formula (replacement, shown)
# ---------------------------------------------------------------------------
def substitute(scene, general, substituted, values=None, at=ORIGIN, pace="slow"):
    """`general` and `substituted` are MathTex strings. The substituted line
    arrives in ACCENT ("these are the numbers I just put in") and settles to
    FOREGROUND. Negatives should already be written as (-4). `values` (optional)
    are substrings to keep lit a beat longer via set_color_by_tex."""
    gen = MathTex(general, color=MUTED).scale(0.75).move_to(at + UP * 0.9)
    sub = MathTex(substituted, color=ACCENT).scale(0.82).move_to(at + DOWN * 0.4)

    scene.play(Write(gen), run_time=_t(pace, 0.8))
    scene.wait(_t(pace, 0.6))
    scene.play(TransformFromCopy(gen, sub), run_time=_t(pace, 1.1))
    scene.wait(_t(pace, 0.7))
    settled = sub.copy().set_color(FOREGROUND)
    if values:
        for v in values:
            settled.set_color_by_tex(v, ACCENT)
    scene.play(Transform(sub, settled), run_time=_t(pace, 0.6))
    scene.wait(_t(pace, 0.6))
    return sub


# ---------------------------------------------------------------------------
# 2 · mul_repeat — multiplication as repeated addition
# ---------------------------------------------------------------------------
def mul_repeat(scene, count, addend, at=ORIGIN, pace="slow"):
    """count * addend, written out as addend + addend + ... + addend with the
    running total climbing underneath. Multiplication is repeated addition; the
    product's sign falls out of adding negatives."""
    head = MathTex(f"{count} \\cdot {_num(addend)}", color=FOREGROUND).scale(0.8)
    head.move_to(at + UP * 1.7)

    shown = min(count, 5)
    term = _num(addend)
    row = VGroup()
    term_mobs = []
    for i in range(shown):
        if i:
            row.add(MathTex("+", color=MUTED).scale(0.7))
        t = MathTex(term, color=FOREGROUND).scale(0.72)
        term_mobs.append(t)
        row.add(t)
    if count > shown:
        row.add(MathTex(r"+\ \cdots\ +", color=MUTED).scale(0.7))
        t = MathTex(term, color=FOREGROUND).scale(0.72)
        term_mobs.append(t)
        row.add(t)
    row.arrange(RIGHT, buff=0.2).move_to(at)
    if row.width > MAX_W:
        row.scale(MAX_W / row.width)

    brace = Brace(row, DOWN, color=MUTED)
    blab = small_label(f"{count} składników", 0.34, MUTED).next_to(brace, DOWN, buff=0.14)
    total = DecimalNumber(0, num_decimal_places=0, color=SECONDARY).scale(0.95)
    total.move_to(at + DOWN * 2.1)

    scene.play(Write(head), run_time=_t(pace, 0.7))
    scene.play(TransformFromCopy(head, row), run_time=_t(pace, 1.0))
    scene.play(GrowFromCenter(brace), FadeIn(blab), FadeIn(total), run_time=_t(pace, 0.6))

    steps = len(term_mobs)
    for i, t in enumerate(term_mobs):
        shown_total = ((i + 1) * addend if count <= shown
                       else round((i + 1) / steps * count) * addend)
        scene.play(t.animate.set_color(ACCENT), ChangeDecimalToValue(total, shown_total),
                   run_time=_t(pace, 0.45))
        scene.play(t.animate.set_color(FOREGROUND), run_time=_t(pace, 0.12))

    scene.play(ChangeDecimalToValue(total, count * addend), run_time=_t(pace, 0.4))
    box = SurroundingRectangle(total, color=SECONDARY, buff=0.18, corner_radius=0.1)
    scene.play(Create(box), run_time=_t(pace, 0.5))
    scene.wait(_t(pace, 0.9))
    return VGroup(total, box)


# ---------------------------------------------------------------------------
# 3 · add_signed — add / subtract as displacement on a number line
# ---------------------------------------------------------------------------
def add_signed(scene, a, b, at=ORIGIN, pace="slow"):
    result = a + b
    lo = min(a, result, 0)
    hi = max(a, result, 0)
    span = max(hi - lo, 1)
    pad = max(2, round(span * 0.25))
    tick = max(1, round((span + 2 * pad) / 10))
    line = NumberLine(x_range=[lo - pad, hi + pad, tick], length=min(10.5, MAX_W),
                      include_numbers=False, include_ticks=True, color=MUTED)
    line.move_to(at)
    zero = MathTex("0", color=MUTED).scale(0.42).next_to(line.n2p(0), DOWN, buff=0.28)

    dot = Dot(line.n2p(a), radius=0.1, color=ACCENT)
    a_lbl = MathTex(str(a), color=ACCENT).scale(0.55).next_to(dot, UP, buff=0.28)

    arrow = Arrow(line.n2p(a), line.n2p(result), buff=0, color=SECONDARY,
                  stroke_width=4, tip_length=0.2)
    op = small_label(f"+ {b}" if b >= 0 else f"− {abs(b)}", 0.38, SECONDARY)
    op.next_to(arrow, UP, buff=0.14)

    scene.play(Create(line), FadeIn(zero), run_time=_t(pace, 0.8))
    scene.play(FadeIn(dot, scale=0.5), FadeIn(a_lbl), run_time=_t(pace, 0.5))
    scene.play(GrowArrow(arrow), FadeIn(op),
               dot.animate.move_to(line.n2p(result)), run_time=_t(pace, 1.3))
    r_lbl = MathTex(str(result), color=SECONDARY).scale(0.6).next_to(dot, DOWN, buff=0.3)
    scene.play(FadeIn(r_lbl), run_time=_t(pace, 0.5))
    if (a > 0) != (result > 0) and result != 0:
        note = small_label("przez zero — wynik ujemny" if result < 0 else "przez zero",
                           0.32, MUTED).next_to(line, DOWN, buff=0.75)
        scene.play(FadeIn(note), run_time=_t(pace, 0.5))
    scene.wait(_t(pace, 0.9))
    return r_lbl


# ---------------------------------------------------------------------------
# 4 · sign_flip — distributing a minus over a bracket
# ---------------------------------------------------------------------------
def sign_flip(scene, terms, at=ORIGIN, pace="slow"):
    """`terms` = list of (sign, body) with sign in {"+","-"}, meaning
    -( t0 t1 t2 ... ). Shows the leading minus sweep across, toggling each sign,
    then the settled result with the flipped terms flashed green."""
    def render(flip):
        out = ""
        for i, (sg, bd) in enumerate(terms):
            eff = sg if not flip else ("+" if sg == "-" else "-")
            if i == 0:
                out += bd if eff == "+" else "-" + bd
            else:
                out += ("+" + bd) if eff == "+" else ("-" + bd)
        return out

    before = MathTex("-\\left(", render(False), "\\right)", color=FOREGROUND).scale(0.8)
    before.move_to(at + UP * 1.0)
    after = MathTex(render(True), color=FOREGROUND).scale(0.8).move_to(at + DOWN * 0.5)
    note = small_label("Każdy wyraz w nawiasie zmienia znak.", 0.36, MUTED)
    note.move_to(at + DOWN * 1.9)

    scene.play(Write(before), run_time=_t(pace, 0.9))
    scene.play(Indicate(before[0], color=ACCENT, scale_factor=1.5), run_time=_t(pace, 0.6))
    sweep = Line(before.get_corner(DL) + DOWN * 0.06, before.get_corner(DL) + DOWN * 0.06,
                 color=ACCENT, stroke_width=3)
    scene.play(sweep.animate.put_start_and_end_on(
        before.get_corner(DL) + DOWN * 0.06, before.get_corner(DR) + DOWN * 0.06),
        run_time=_t(pace, 0.9))
    scene.play(FadeOut(sweep), before.animate.set_color(MUTED),
               TransformFromCopy(before, after), run_time=_t(pace, 1.0))
    scene.play(Circumscribe(after, color=GREEN), FadeIn(note), run_time=_t(pace, 0.9))
    scene.wait(_t(pace, 0.9))
    return after


# ---------------------------------------------------------------------------
# 5 · frac_cancel — simplifying a fraction by cancelling equal factors
# ---------------------------------------------------------------------------
def frac_cancel(scene, num, den, mult, at=ORIGIN, pace="slow"):
    """num/den * mult, where den | mult. Splits mult = k*den, cancels the two
    den's, finishes num*k."""
    k = mult // den
    start = MathTex(r"\frac{%d}{%d}\cdot %d" % (num, den, mult), color=FOREGROUND).scale(0.85)
    start.move_to(at + UP * 1.7)
    scene.play(Write(start), run_time=_t(pace, 0.8))

    # rewrite mult as k*den, so the two den's are separate, matchable mobjects
    frac = MathTex(r"\frac{%d}{%d}" % (num, den), color=FOREGROUND).scale(0.85)
    rest = MathTex(r"\cdot", str(k), r"\cdot", str(den), color=FOREGROUND).scale(0.85)
    split = VGroup(frac, rest).arrange(RIGHT, buff=0.18).move_to(at)
    d2 = rest[3]
    scene.play(TransformFromCopy(start, split), run_time=_t(pace, 0.9))

    den_glyph = frac[0][-1]  # denominator digit of \frac{num}{den}
    scene.play(den_glyph.animate.set_color(ACCENT), d2.animate.set_color(ACCENT),
               run_time=_t(pace, 0.4))
    strikes = VGroup(
        Line(den_glyph.get_corner(DL), den_glyph.get_corner(UR), color=RED, stroke_width=3),
        Line(d2.get_corner(DL), d2.get_corner(UR), color=RED, stroke_width=3),
    )
    scene.play(Create(strikes), run_time=_t(pace, 0.5))

    bare = MathTex(str(num), r"\cdot", str(k), color=FOREGROUND).scale(0.85).move_to(at)
    scene.play(FadeOut(strikes), FadeOut(rest[2]), FadeOut(d2),
               ReplacementTransform(frac, bare[0]),
               ReplacementTransform(rest[0], bare[1]),
               ReplacementTransform(rest[1], bare[2]),
               run_time=_t(pace, 0.7))

    res = MathTex(r"%d\cdot %d = %d" % (num, k, num * k), color=SECONDARY).scale(0.85)
    res.move_to(at + DOWN * 1.7)
    scene.play(Write(res), run_time=_t(pace, 0.8))
    scene.wait(_t(pace, 0.9))
    return res


# ---------------------------------------------------------------------------
# 6 · solve_linear — one move at a time, the same to both sides
# ---------------------------------------------------------------------------
def solve_linear(scene, a, b, c, at=ORIGIN, pace="slow"):
    """a*x + b = c  ->  x. Shows +(-b) on both ends, then ÷a on both ends."""
    eq0 = MathTex("%dx %s %d = %d" % (a, "+" if b >= 0 else "-", abs(b), c),
                  color=FOREGROUND).scale(0.8).move_to(at + UP * 1.3)
    scene.play(Write(eq0), run_time=_t(pace, 0.8))

    opb = -b
    tag_txt = ("+%d" % opb) if opb >= 0 else ("-%d" % abs(opb))

    def both_ends(ref, txt):
        lhs = MathTex(txt, color=ACCENT).scale(0.55)
        rhs = lhs.copy()
        mid = ref.get_center()[0]
        lhs.next_to(ref, DOWN, buff=0.3).set_x((ref.get_left()[0] + mid) / 2)
        rhs.next_to(ref, DOWN, buff=0.3).set_x((mid + ref.get_right()[0]) / 2)
        return lhs, rhs

    tL, tR = both_ends(eq0, tag_txt)
    scene.play(FadeIn(tL, shift=0.15 * DOWN), FadeIn(tR, shift=0.15 * DOWN), run_time=_t(pace, 0.7))

    eq1 = MathTex("%dx = %d" % (a, c - b), color=FOREGROUND).scale(0.8).move_to(at)
    scene.play(TransformFromCopy(VGroup(eq0, tL, tR), eq1), run_time=_t(pace, 1.0))

    dL, dR = both_ends(eq1, r"\div %d" % a)
    scene.play(FadeIn(dL), FadeIn(dR), run_time=_t(pace, 0.6))

    val = (c - b) // a if (c - b) % a == 0 else round((c - b) / a, 3)
    eq2 = MathTex("x = %s" % val, color=SECONDARY).scale(0.85).move_to(at + DOWN * 1.4)
    scene.play(TransformFromCopy(VGroup(eq1, dL, dR), eq2), run_time=_t(pace, 1.0))
    scene.wait(_t(pace, 0.9))
    return eq2


# ---------------------------------------------------------------------------
# 7 · pow_expand — a^k as k copies multiplied, running product ticking
# ---------------------------------------------------------------------------
def pow_expand(scene, base, k, at=ORIGIN, pace="slow"):
    head = MathTex("%d^{%d}" % (base, k), color=FOREGROUND).scale(0.85).move_to(at + UP * 1.6)
    strip = factor_strip(k, str(base), 0.72, ACCENT).move_to(at)
    lbl = small_label("iloczyn kolejno:", 0.34, MUTED).move_to(at + DOWN * 1.5 + LEFT * 1.7)
    prod = DecimalNumber(1, num_decimal_places=0, color=SECONDARY).scale(0.9).next_to(lbl, RIGHT, buff=0.35)

    scene.play(Write(head), run_time=_t(pace, 0.6))
    scene.play(FadeIn(lbl), FadeIn(prod), run_time=_t(pace, 0.4))
    run = 1
    for i in range(k):
        run *= base
        scene.play(FadeIn(strip[i], scale=0.6), ChangeDecimalToValue(prod, run),
                   run_time=_t(pace, 0.5))
    box = SurroundingRectangle(prod, color=SECONDARY, buff=0.18, corner_radius=0.1)
    scene.play(Create(box), run_time=_t(pace, 0.5))
    scene.wait(_t(pace, 0.9))
    return VGroup(prod, box)


# ---------------------------------------------------------------------------
# 8 · root_ask — a root is an inverse question, not a button
# ---------------------------------------------------------------------------
def root_ask(scene, x, n=2, at=ORIGIN, pace="slow"):
    q = MathTex(r"\sqrt{%d}" % x if n == 2 else r"\sqrt[%d]{%d}" % (n, x),
                color=FOREGROUND).scale(0.9).move_to(at + UP * 1.5)
    ask = small_label(("co do kwadratu daje %d?" % x) if n == 2
                      else ("co do potęgi %d daje %d?" % (n, x)),
                      0.4, MUTED).move_to(at + UP * 0.5)
    slot = MathTex(r"?^{%d} = %d" % (n, x), color=MUTED).scale(0.65).move_to(at + DOWN * 0.3)

    root = round(x ** (1.0 / n))
    cands = sorted({max(1, root - 1), root, root + 1})
    row = VGroup(*[
        MathTex(r"%d^{%d} = %d" % (c, n, c ** n),
                color=GREEN if c ** n == x else MUTED).scale(0.55)
        for c in cands
    ]).arrange(RIGHT, buff=1.0).move_to(at + DOWN * 1.5)

    scene.play(Write(q), run_time=_t(pace, 0.6))
    scene.play(FadeIn(ask), FadeIn(slot), run_time=_t(pace, 0.6))
    for t in row:
        scene.play(FadeIn(t), run_time=_t(pace, 0.45))
    winner = row[[c ** n == x for c in cands].index(True)]
    scene.play(Circumscribe(winner, color=GREEN), run_time=_t(pace, 0.7))
    res = MathTex("= %d" % root, color=SECONDARY).scale(0.8).next_to(q, RIGHT, buff=0.35)
    scene.play(Write(res), run_time=_t(pace, 0.6))
    scene.wait(_t(pace, 0.9))
    return res


# ---------------------------------------------------------------------------
# 9 · compare_on_line — ordering values / inequalities on a number line
# ---------------------------------------------------------------------------
def compare_on_line(scene, values, at=ORIGIN, pace="slow"):
    lo, hi = min(values) - 1, max(values) + 1
    line = NumberLine(x_range=[lo, hi, 1], length=min(10.5, MAX_W), include_numbers=False,
                      include_ticks=False, color=MUTED).move_to(at)
    scene.play(Create(line), run_time=_t(pace, 0.7))
    for v in sorted(values):
        d = Dot(line.n2p(v), radius=0.09, color=ACCENT)
        l = MathTex(str(v), color=FOREGROUND).scale(0.5).next_to(d, UP, buff=0.22)
        scene.play(FadeIn(d, scale=0.5), FadeIn(l), run_time=_t(pace, 0.5))
    ordered = sorted(values)
    rels = VGroup(*[
        MathTex("<", color=SECONDARY).scale(0.6).move_to(line.n2p((p + q) / 2) + DOWN * 0.5)
        for p, q in zip(ordered, ordered[1:])
    ])
    scene.play(LaggedStart(*[FadeIn(r) for r in rels], lag_ratio=0.3), run_time=_t(pace, 1.0))
    scene.wait(_t(pace, 0.9))
    return line

"""The four layout archetypes for authored (non-worked-example) scenes.

Authored scenes are not raw Manim bodies — they are archetype calls. The scene
builds its own content (the figure VGroup, the derivation strings, the card
mobjects — that part is irreducible) and hands it to one of these, which owns
positioning, reading-time holds, and the 16:9 / 9:16 branch. Vertical staging is
written once, here, not per section.

    stage_figure      one central diagram + optional question band + caption
    stage_derivation  a sequence of steps (symbolic stack, or column-aligned)
    stage_card        a formula centrepiece + brace/arrow annotations + strip
    stage_model       2-3 compact cards + a tagline
"""
import numpy as np
from manim import *

from .colors import ACCENT, FOREGROUND, MUTED, SECONDARY
from .config import FRAME_H, FRAME_W, IS_VERTICAL, SAFE_BOTTOM_Y, hold, rt
from .style import CAPTION_Y, FONT, body, small_label, two_col


def _t(pace, base):
    return rt(base, pace)


def _fit(mob, max_w, max_h, min_fill=0.0):
    """Scale `mob` to fit within (max_w, max_h). If `min_fill` > 0 and the mob
    would otherwise sit well under that fraction of the box, scale it up so it
    reads at summary/hero weight instead of floating small."""
    s = min(max_w / max(mob.width, 1e-6), max_h / max(mob.height, 1e-6), 1.0)
    if s < 1.0:
        mob.scale(s)
    if min_fill > 0.0:
        grow = min(max_w / max(mob.width, 1e-6), max_h / max(mob.height, 1e-6))
        if grow > 1.05:
            mob.scale(1.0 + (grow - 1.0) * min_fill)
    return mob


def _caption(text):
    return small_label(text, 0.34, MUTED).move_to([0, CAPTION_Y, 0])


# ---------------------------------------------------------------------------
# 1 · stage_figure
# ---------------------------------------------------------------------------
def stage_figure(scene, figure, *, question=None, caption=None, reveal=None, pace="slow"):
    """`figure` is any mobject/VGroup. `reveal` is a list of animation-lists
    played in order (each entry is a list passed to scene.play); if None the
    whole figure fades in. `question` sits above, `caption` below."""
    q = None
    if question:
        q = body(question, 0.5 if not IS_VERTICAL else 0.52, FOREGROUND)
        q.to_edge(UP, buff=1.0 if not IS_VERTICAL else 2.6)
        _fit(q, FRAME_W - (1.4 if not IS_VERTICAL else 0.7), 1.8)

    if IS_VERTICAL:
        # Shorts: big content in the vertical middle band. Question up top,
        # figure filling most of the width around centre, caption just below.
        # The lowest ~25% stays clear (platform UI + thumb).
        band_top = (q.get_bottom()[1] - 0.6) if q is not None else (FRAME_H / 2 - 1.8)
        band_bottom = SAFE_BOTTOM_Y + 0.6
        _fit(figure, FRAME_W - 0.5, (band_top - band_bottom) * 0.9, min_fill=0.98)
        figure.move_to([0, 0.0, 0])
        cap_y = figure.get_bottom()[1] - 0.7
    else:
        top = (q.get_bottom()[1] - 0.5) if q is not None else (FRAME_H / 2 - 0.8)
        bottom = SAFE_BOTTOM_Y + 1.0
        _fit(figure, FRAME_W - 1.4, top - bottom, min_fill=0.5)
        figure.move_to([0, 0.58 * top + 0.42 * bottom, 0])
        cap_y = None

    if q is not None:
        scene.play(FadeIn(q, shift=0.15 * UP), run_time=_t(pace, 0.9))
        hold(scene, 1.0, pace)

    if reveal:
        for step in reveal:
            scene.play(*step, run_time=_t(pace, 0.9))
            hold(scene, 0.9, pace)
    else:
        scene.play(FadeIn(figure, shift=0.15 * UP), run_time=_t(pace, 1.2))
        hold(scene, 1.6, pace)

    if caption:
        cap = small_label(caption, 0.4 if IS_VERTICAL else 0.34, MUTED)
        if IS_VERTICAL:
            cap.move_to([0, cap_y, 0])
        else:
            cap.move_to([0, CAPTION_Y, 0])
        if cap.width > FRAME_W - 0.8:
            cap.scale((FRAME_W - 0.8) / cap.width)
        scene.play(FadeIn(cap, shift=0.15 * UP), run_time=_t(pace, 0.8))
    hold(scene, 1.9 if IS_VERTICAL else 3.5, pace)


# ---------------------------------------------------------------------------
# 2 · stage_derivation
# ---------------------------------------------------------------------------
def stage_derivation(scene, *, symbolic=None, columns=None, caption=None, pace="slow"):
    """One derivation.

    symbolic = ["tex", "tex", ...]  -> each line writes on below the previous,
        the previous dims to MUTED. Every algebraic move is its own reveal.

    columns  = {"rows": [(label, ["c0","c1",...]), ...], "combine": "tex"}
        rows are column-aligned (same number of entries); revealed row by row;
        then a rule and `combine` land beneath. This is the forwards/backwards
        pairing (16:9 stacked rows, 9:16 the same but tighter)."""
    if symbolic:
        lines = VGroup(*[MathTex(s, color=FOREGROUND).scale(0.72 if not IS_VERTICAL else 0.8)
                         for s in symbolic])
        lines.arrange(DOWN, aligned_edge=LEFT, buff=0.6 if not IS_VERTICAL else 0.7)
        if IS_VERTICAL:
            _fit(lines, FRAME_W - 0.5, FRAME_H * 0.4, min_fill=0.95)
            lines.move_to([0, -0.3, 0])  # frame centre; lowest quarter stays clear
        else:
            _fit(lines, FRAME_W - 1.6, FRAME_H - 2.6)
            lines.move_to([0, 0.2, 0])
        prev = None
        for ln in lines:
            if prev is not None:
                scene.play(prev.animate.set_color(MUTED),
                           TransformFromCopy(prev, ln), run_time=_t(pace, 1.1))
            else:
                scene.play(Write(ln), run_time=_t(pace, 1.1))
            hold(scene, 1.6, pace)
            prev = ln
        scene.play(lines[-1].animate.set_color(SECONDARY), run_time=_t(pace, 0.5))
        content_bottom = lines.get_bottom()[1]

    elif columns:
        # Column table, revealed incrementally across several scenes. `static_rows`
        # rows are already on screen (drawn, not animated) so a later scene resumes
        # exactly where the previous one left off; `combine` (optional) is the
        # 2*S_n = n*(a_1 + a_n) line that lands only on the last scene of the build.
        rows = columns["rows"]
        static_n = columns.get("static_rows", 0)
        combine_tex = columns.get("combine")
        ncol = len(rows[0][1])
        cell_s = 0.6 if not IS_VERTICAL else 1.15
        lab_s = 0.34 if not IS_VERTICAL else 0.42
        span = min(FRAME_W - (4.5 if not IS_VERTICAL else 3.4), (1.15 if not IS_VERTICAL else 1.3) * ncol)
        # in 9:16 nudge the numbers right so the left-hand row labels fit on frame
        cx0 = 0.0 if not IS_VERTICAL else 0.9
        col_x = np.linspace(cx0 - span / 2, cx0 + span / 2, ncol)
        lab_x = col_x[0] - (2.0 if not IS_VERTICAL else 1.25)
        dy = 1.1 if not IS_VERTICAL else 1.55
        nrows = len(rows) + (1 if combine_tex else 0)
        y = (1.6 if not IS_VERTICAL else (nrows - 1) * dy / 2 + 0.6)
        for k, (label, cells) in enumerate(rows):
            lab = small_label(label, lab_s, MUTED).move_to([lab_x, y, 0])
            cs = VGroup(*[MathTex(c, color=FOREGROUND).scale(cell_s).move_to([col_x[j], y, 0])
                          for j, c in enumerate(cells)])
            if k < static_n:
                scene.add(lab, cs)
            else:
                scene.play(FadeIn(lab),
                           LaggedStart(*[FadeIn(c, shift=0.1 * UP) for c in cs], lag_ratio=0.15),
                           run_time=_t(pace, 1.1))
                hold(scene, 1.2, pace)
            y -= dy

        content_bottom = y + dy - 0.5
        if combine_tex:
            rule = Line([col_x[0] - 0.5, y + dy - 0.55, 0], [col_x[-1] + 0.5, y + dy - 0.55, 0], color=MUTED)
            combine = MathTex(combine_tex, color=SECONDARY).scale(0.62 if not IS_VERTICAL else 0.8)
            combine.move_to([0, y, 0])
            _fit(combine, FRAME_W - (1.6 if not IS_VERTICAL else 0.6), 1.4)
            scene.play(Create(rule), run_time=_t(pace, 0.5))
            scene.play(Write(combine), run_time=_t(pace, 1.4))
            scene.play(Circumscribe(combine, color=ACCENT), run_time=_t(pace, 1.2))
            content_bottom = combine.get_bottom()[1]
    else:
        content_bottom = -1.0

    if caption:
        cap = small_label(caption, 0.4 if IS_VERTICAL else 0.34, MUTED)
        cap.move_to([0, content_bottom - 0.8, 0] if IS_VERTICAL else [0, CAPTION_Y, 0])
        if cap.width > FRAME_W - 0.8:
            cap.scale((FRAME_W - 0.8) / cap.width)
        scene.play(FadeIn(cap, shift=0.15 * UP), run_time=_t(pace, 0.8))
    hold(scene, 1.9 if IS_VERTICAL else 3.2, pace)


# ---------------------------------------------------------------------------
# 3 · stage_card
# ---------------------------------------------------------------------------
def stage_card(scene, *, centerpiece, annotations=None, strip=None, caption=None, pace="slow"):
    """`centerpiece` a MathTex string. `annotations` = list of (substring, label):
    a box + label pointing at that part (isolated via substrings_to_isolate).
    `strip` a MathTex string shown smaller beneath as a numeric example."""
    subs = [a[0] for a in (annotations or [])]
    card = MathTex(centerpiece, substrings_to_isolate=subs).scale(0.95 if not IS_VERTICAL else 1.0)
    card.set_color(FOREGROUND)
    if IS_VERTICAL:
        _fit(card, FRAME_W - 0.4, 3.0, min_fill=0.98)
        card.move_to([0, 0.6 if annotations else 0.0, 0])  # frame centre
    else:
        _fit(card, FRAME_W - 1.6, 2.2)
        card.move_to([0, 1.1 if annotations else 0.4, 0])

    scene.play(Write(card), run_time=_t(pace, 1.4))
    hold(scene, 1.4, pace)

    for sub, label in (annotations or []):
        part = card.get_part_by_tex(sub)
        if part is None:
            part = card
        box = SurroundingRectangle(part, color=ACCENT, buff=0.1, corner_radius=0.06)
        lab = small_label(label, 0.34, ACCENT).next_to(box, DOWN, buff=0.25)
        scene.play(Create(box), FadeIn(lab, shift=0.1 * UP), run_time=_t(pace, 0.9))
        hold(scene, 1.8, pace)

    strip_bottom = card.get_bottom()[1]
    if strip:
        s = MathTex(strip, color=FOREGROUND).scale(0.6 if not IS_VERTICAL else 0.62)
        _fit(s, FRAME_W - (1.6 if not IS_VERTICAL else 0.8), 1.2)
        s.move_to([0, card.get_bottom()[1] - 1.4 if IS_VERTICAL else -1.8, 0])
        scene.play(FadeIn(s, shift=0.15 * UP), run_time=_t(pace, 1.0))
        hold(scene, 2.0, pace)
        strip_bottom = s.get_bottom()[1]

    if caption:
        cap = small_label(caption, 0.4 if IS_VERTICAL else 0.34, MUTED)
        cap.move_to([0, strip_bottom - 0.8, 0] if IS_VERTICAL else [0, CAPTION_Y, 0])
        if cap.width > FRAME_W - 0.8:
            cap.scale((FRAME_W - 0.8) / cap.width)
        scene.play(FadeIn(cap, shift=0.15 * UP), run_time=_t(pace, 0.8))
    hold(scene, 1.9 if IS_VERTICAL else 3.0, pace)


# ---------------------------------------------------------------------------
# 4 · stage_model
# ---------------------------------------------------------------------------
def stage_model(scene, *, cards, tagline=None, pace="slow"):
    """`cards` = list of 2-3 mobjects (each already built by the caller).
    Laid across in 16:9, stacked in 9:16, shorter card centred against taller.
    `tagline` sits at the bottom."""
    boxed = []
    for c in cards:
        box = SurroundingRectangle(c, color=MUTED, buff=0.3, corner_radius=0.1)
        box.set_stroke(opacity=0.5)
        boxed.append(VGroup(box, c))

    if IS_VERTICAL:
        group = VGroup(*boxed).arrange(DOWN, buff=0.6)
    elif len(boxed) == 2:
        group = two_col(boxed[0], boxed[1], gap=1.2)
    else:
        group = VGroup(*boxed).arrange(RIGHT, buff=0.9)
    _fit(group, FRAME_W - 1.2, FRAME_H - 2.8, min_fill=0.62)
    group.move_to([0, 0.3, 0])

    for b in boxed:
        scene.play(FadeIn(b, shift=0.15 * UP), run_time=_t(pace, 0.9))
        hold(scene, 1.4, pace)

    if tagline:
        scene.play(FadeIn(_caption(tagline), shift=0.15 * UP), run_time=_t(pace, 0.9))
    hold(scene, 1.9 if IS_VERTICAL else 3.5, pace)

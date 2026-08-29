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
from .config import FRAME_H, FRAME_W, IS_VERTICAL, SAFE_BOTTOM_Y
from .style import CAPTION_Y, FONT, body, small_label, two_col


def _t(pace, base):
    return base * (0.45 if pace == "fast" else 1.0)


def _fit(mob, max_w, max_h):
    s = min(max_w / max(mob.width, 1e-6), max_h / max(mob.height, 1e-6), 1.0)
    if s < 1.0:
        mob.scale(s)
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
        q = body(question, 0.5 if not IS_VERTICAL else 0.46, FOREGROUND)
        q.to_edge(UP, buff=1.0 if not IS_VERTICAL else 1.4)
        _fit(q, FRAME_W - 1.4, 1.6)

    top = (q.get_bottom()[1] - 0.5) if q is not None else (FRAME_H / 2 - 0.8)
    bottom = (SAFE_BOTTOM_Y + (1.0 if not IS_VERTICAL else 1.3))
    _fit(figure, FRAME_W - (1.4 if not IS_VERTICAL else 0.8), top - bottom)
    figure.move_to([0, 0.58 * top + 0.42 * bottom, 0])  # bias toward the top of the band

    if q is not None:
        scene.play(FadeIn(q, shift=0.15 * UP), run_time=_t(pace, 0.9))
        scene.wait(_t(pace, 1.0))

    if reveal:
        for step in reveal:
            scene.play(*step, run_time=_t(pace, 0.9))
            scene.wait(_t(pace, 0.9))
    else:
        scene.play(FadeIn(figure, shift=0.15 * UP), run_time=_t(pace, 1.2))
        scene.wait(_t(pace, 1.6))

    if caption:
        scene.play(FadeIn(_caption(caption), shift=0.15 * UP), run_time=_t(pace, 0.8))
    scene.wait(_t(pace, 3.5))


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
        lines = VGroup(*[MathTex(s, color=FOREGROUND).scale(0.72 if not IS_VERTICAL else 0.6)
                         for s in symbolic])
        lines.arrange(DOWN, aligned_edge=LEFT, buff=0.6 if not IS_VERTICAL else 0.5)
        _fit(lines, FRAME_W - 1.6, FRAME_H - 2.6)
        lines.move_to([0, 0.2, 0])
        prev = None
        for ln in lines:
            if prev is not None:
                scene.play(prev.animate.set_color(MUTED),
                           TransformFromCopy(prev, ln), run_time=_t(pace, 1.1))
            else:
                scene.play(Write(ln), run_time=_t(pace, 1.1))
            scene.wait(_t(pace, 1.6))
            prev = ln
        scene.play(lines[-1].animate.set_color(SECONDARY), run_time=_t(pace, 0.5))

    elif columns:
        # Column table, revealed incrementally across several scenes. `static_rows`
        # rows are already on screen (drawn, not animated) so a later scene resumes
        # exactly where the previous one left off; `combine` (optional) is the
        # 2*S_n = n*(a_1 + a_n) line that lands only on the last scene of the build.
        rows = columns["rows"]
        static_n = columns.get("static_rows", 0)
        combine_tex = columns.get("combine")
        ncol = len(rows[0][1])
        span = min(FRAME_W - 4.5, 1.15 * ncol)
        col_x = np.linspace(-span / 2, span / 2, ncol)
        y = 1.6
        for k, (label, cells) in enumerate(rows):
            lab = small_label(label, 0.34, MUTED).move_to([col_x[0] - 2.0, y, 0])
            cs = VGroup(*[MathTex(c, color=FOREGROUND).scale(0.6).move_to([col_x[j], y, 0])
                          for j, c in enumerate(cells)])
            if k < static_n:
                scene.add(lab, cs)
            else:
                scene.play(FadeIn(lab),
                           LaggedStart(*[FadeIn(c, shift=0.1 * UP) for c in cs], lag_ratio=0.15),
                           run_time=_t(pace, 1.1))
                scene.wait(_t(pace, 1.2))
            y -= 1.1

        if combine_tex:
            rule = Line([col_x[0] - 0.5, y + 0.45, 0], [col_x[-1] + 0.5, y + 0.45, 0], color=MUTED)
            combine = MathTex(combine_tex, color=SECONDARY).scale(0.62 if not IS_VERTICAL else 0.52)
            combine.move_to([0, y - 0.4, 0])
            _fit(combine, FRAME_W - 1.6, 1.4)
            scene.play(Create(rule), run_time=_t(pace, 0.5))
            scene.play(Write(combine), run_time=_t(pace, 1.4))
            scene.play(Circumscribe(combine, color=ACCENT), run_time=_t(pace, 1.2))

    if caption:
        scene.play(FadeIn(_caption(caption), shift=0.15 * UP), run_time=_t(pace, 0.8))
    scene.wait(_t(pace, 3.2))


# ---------------------------------------------------------------------------
# 3 · stage_card
# ---------------------------------------------------------------------------
def stage_card(scene, *, centerpiece, annotations=None, strip=None, caption=None, pace="slow"):
    """`centerpiece` a MathTex string. `annotations` = list of (substring, label):
    a box + label pointing at that part (isolated via substrings_to_isolate).
    `strip` a MathTex string shown smaller beneath as a numeric example."""
    subs = [a[0] for a in (annotations or [])]
    card = MathTex(centerpiece, substrings_to_isolate=subs).scale(0.95 if not IS_VERTICAL else 0.8)
    card.set_color(FOREGROUND)
    _fit(card, FRAME_W - 1.6, 2.2)
    card.move_to([0, 1.1 if annotations else 0.4, 0])

    scene.play(Write(card), run_time=_t(pace, 1.4))
    scene.wait(_t(pace, 1.4))

    for sub, label in (annotations or []):
        part = card.get_part_by_tex(sub)
        if part is None:
            part = card
        box = SurroundingRectangle(part, color=ACCENT, buff=0.1, corner_radius=0.06)
        lab = small_label(label, 0.34, ACCENT).next_to(box, DOWN, buff=0.25)
        scene.play(Create(box), FadeIn(lab, shift=0.1 * UP), run_time=_t(pace, 0.9))
        scene.wait(_t(pace, 1.8))

    if strip:
        s = MathTex(strip, color=FOREGROUND).scale(0.55 if not IS_VERTICAL else 0.46)
        s.move_to([0, -1.8, 0])
        _fit(s, FRAME_W - 1.6, 1.0)
        scene.play(FadeIn(s, shift=0.15 * UP), run_time=_t(pace, 1.0))
        scene.wait(_t(pace, 2.0))

    if caption:
        scene.play(FadeIn(_caption(caption), shift=0.15 * UP), run_time=_t(pace, 0.8))
    scene.wait(_t(pace, 3.0))


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
    _fit(group, FRAME_W - 1.2, FRAME_H - 2.8)
    group.move_to([0, 0.3, 0])

    for b in boxed:
        scene.play(FadeIn(b, shift=0.15 * UP), run_time=_t(pace, 0.9))
        scene.wait(_t(pace, 1.4))

    if tagline:
        scene.play(FadeIn(_caption(tagline), shift=0.15 * UP), run_time=_t(pace, 0.9))
    scene.wait(_t(pace, 3.5))

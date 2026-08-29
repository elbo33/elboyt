"""THEORY worked-example template.

A worked example is NOT one scene — it is a block of 8-10 scenes, one per beat,
that share a persistent layout: the problem statement in a strip at the top, the
running expression building down the middle, the boxed answer on a fixed
baseline. Each beat renders the accumulated state statically, then animates only
its own step. The planner passes one `ex` dict; the block's scene files each call
`worked_beat(self, EX, beat=k)`.

The block repeats 26x in a THEORY episode and thousands of times across the
course, so every beat is the plainest staging that still shows the step. The
arithmetic beats hand off to the compute primitives.
"""
import numpy as np
from manim import *

from ..colors import ACCENT, FOREGROUND, MUTED, SECONDARY
from ..compute import add_signed, frac_cancel, mul_repeat, pow_expand, sign_flip
from ..config import IS_VERTICAL
from ..style import (
    ANSWER_Y,
    CAPTION_Y,
    FONT,
    STMT_STRIP_Y,
    WORK_TOP_Y,
    small_label,
    sought_chip,
    tight_box,
)

_PRIMITIVES = {
    "mul_repeat": mul_repeat,
    "add_signed": add_signed,
    "sign_flip": sign_flip,
    "frac_cancel": frac_cancel,
    "pow_expand": pow_expand,
}

BEAT_LABEL = {
    "present": "TREŚĆ",
    "restate": "CO DANE, CO SZUKANE",
    "plan": "WZÓR",
    "substitute": "PODSTAWIENIE",
    "result": "WYNIK",
    "check": "SPRAWDZENIE",
    "insight": "WNIOSEK",
}


def beat_seq(ex):
    """Data-driven: the beats present depend on what the example needs, but
    they are ALWAYS in this order with these tags. A geometric-construction or
    word-problem block may have no `plan` / `substitute` and few `compute-*`
    beats — six beats for one section, twelve for another, same grammar."""
    seq = ["present", "restate"]
    if ex.get("plan_formula"):
        seq.append("plan")
    if ex.get("sub_filled"):
        seq.append("substitute")
    seq += [f"compute-{i + 1}" for i in range(len(ex.get("computes", [])))]
    seq.append("result")
    if ex.get("check"):
        seq.append("check")
    if ex.get("include_insight"):
        seq.append("insight")
    return seq


def _wrap(text, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = w if not cur else f"{cur} {w}"
        if len(trial) > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return "\n".join(lines)


def _stmt_full(ex):
    w = 30 if IS_VERTICAL else 52
    t2c = {h: ACCENT for h in ex.get("highlights", [])}
    return Text(_wrap(ex["statement"], w), font=FONT, weight=MEDIUM, color=FOREGROUND,
                line_spacing=1.05, t2c=t2c).scale(0.5 if IS_VERTICAL else 0.46)


def _stmt_strip(ex):
    w = 34 if IS_VERTICAL else 62
    t2c = {h: ACCENT for h in ex.get("highlights", [])}
    s = Text(_wrap(ex["statement"], w), font=FONT, weight=MEDIUM, color=FOREGROUND,
             line_spacing=1.0, t2c=t2c).scale(0.36 if IS_VERTICAL else 0.34)
    s.to_edge(UP, buff=0.9).to_edge(LEFT, buff=1.0)
    return s


def _chip(ex):
    labels = ex.get("sought") or [ex.get("sought_fallback", "?")]
    c = sought_chip([f"${x}$" if any(ch in x for ch in "_^\\{") else x for x in labels])
    c.scale(0.85).to_edge(RIGHT, buff=0.8).set_y(STMT_STRIP_Y - 0.3)
    return c


def _stack_lines(ex, upto):
    """The expression stack after beat `upto` (a beat name). L0 = the formula,
    L1 = the substituted line, then one line per compute step done so far."""
    order = beat_seq(ex)
    idx = order.index(upto)
    out = []
    if "plan" in order and idx >= order.index("plan"):
        out.append(ex["plan_formula"])
    if "substitute" in order and idx >= order.index("substitute"):
        out.append(ex["sub_filled"])
    for i, comp in enumerate(ex.get("computes", [])):
        if idx >= order.index(f"compute-{i + 1}"):
            out.append(comp["line"])
    return out


def _place_stack(tex_list, scale=0.6, buff=0.44):
    g = VGroup(*[MathTex(t, color=FOREGROUND).scale(scale) for t in tex_list])
    g.arrange(DOWN, aligned_edge=LEFT, buff=buff)
    g.to_edge(LEFT, buff=1.2)
    g.align_to(np.array([0, WORK_TOP_Y, 0]), UP)  # anchor at the top of the work band
    return g


def _note(text):
    return small_label(text, 0.34, MUTED).move_to([0, CAPTION_Y, 0])


# ---------------------------------------------------------------------------
def worked_beat(scene, ex, beat):
    scene.add_texture()
    order = beat_seq(ex)
    name = order[beat]
    tag = BEAT_LABEL.get(name, "RACHUNEK " + name.split("-")[-1])
    scene.add_scene_tag(f'{ex["label"]}   ·   {tag}')

    # ---- beat 0: the problem, full, read it ----
    if name == "present":
        stmt = _stmt_full(ex).move_to([0, 0.3, 0])
        scene.play(FadeIn(stmt, shift=0.15 * UP), run_time=1.1)
        scene.wait(4.0)
        return

    # ---- every later beat: statement pinned in the strip ----
    strip = _stmt_strip(ex)
    chip = _chip(ex)

    if name == "restate":
        scene.play(FadeIn(strip, shift=0.1 * UP), run_time=1.0)
        scene.wait(1.0)
        scene.play(Circumscribe(strip, color=ACCENT, buff=0.15), run_time=1.4)
        scene.wait(0.6)
        scene.play(FadeIn(chip, shift=0.2 * LEFT), run_time=0.8)
        scene.wait(2.5)
        return

    scene.add(strip, chip)

    if name == "plan":
        formula = MathTex(ex["plan_formula"], color=FOREGROUND).scale(0.85)
        formula.set_y(WORK_TOP_Y - 0.6)
        scene.play(Write(formula), run_time=1.3)
        scene.play(FadeIn(_note(ex["plan_note"]), shift=0.15 * UP), run_time=0.8)
        scene.wait(3.5)
        return

    if name == "substitute":
        base = _place_stack(_stack_lines(ex, "plan"))  # [formula]
        scene.add(base)
        filled = MathTex(ex["sub_filled"], color=ACCENT).scale(0.6)
        filled.next_to(base[-1], DOWN, aligned_edge=LEFT, buff=0.44)
        scene.play(TransformFromCopy(base[-1], filled), run_time=1.2)
        scene.wait(0.6)
        scene.play(filled.animate.set_color(FOREGROUND), run_time=0.5)
        scene.play(FadeIn(_note(ex.get("sub_note", "Wstawiamy dane w miejsce liter.")),
                          shift=0.15 * UP), run_time=0.8)
        scene.wait(2.6)
        return

    if name.startswith("compute-"):
        i = int(name.split("-")[1]) - 1
        comp = ex["computes"][i]
        # one line of context: the expression we are about to transform, top-left
        cur_tex = _stack_lines(ex, order[beat - 1])[-1]
        cur = MathTex(cur_tex, color=FOREGROUND).scale(0.6)
        cur.to_edge(LEFT, buff=1.2).set_y(WORK_TOP_Y - 0.3)
        scene.add(cur)
        new_line = MathTex(comp["line"], color=FOREGROUND).scale(0.6)
        new_line.next_to(cur, DOWN, aligned_edge=LEFT, buff=0.5)

        if comp["kind"] == "arith":
            scene.play(FadeIn(_note(comp["note"]), shift=0.15 * UP), run_time=0.7)
            scene.play(TransformFromCopy(cur, new_line), run_time=1.1)
            scene.wait(2.6)
        else:
            fn = _PRIMITIVES[comp["kind"]]
            note = small_label(comp["note"], 0.34, MUTED).next_to(cur, DOWN, aligned_edge=LEFT, buff=0.5)
            scene.play(FadeIn(note, shift=0.15 * UP), run_time=0.7)
            pre = list(scene.mobjects)
            fn(scene, *comp["args"], at=[0.4, -1.15, 0], pace="slow")
            added = Group(*[m for m in scene.mobjects if m not in pre])
            scene.wait(0.6)
            scene.play(FadeOut(added), FadeOut(note),
                       TransformFromCopy(cur, new_line), run_time=1.0)
            scene.wait(1.8)
        return

    if name == "result":
        stack = _place_stack(_stack_lines(ex, "result"), scale=0.52, buff=0.4)
        scene.add(stack)
        box = tight_box(stack[-1], color=SECONDARY, pad=0.18)
        sentence = small_label(ex["answer_sentence"], 0.4, SECONDARY).move_to([0, ANSWER_Y, 0])
        scene.play(Create(box), run_time=0.8)
        scene.play(Circumscribe(VGroup(stack[-1], box), color=SECONDARY), run_time=1.2)
        scene.play(FadeIn(sentence, shift=0.2 * UP), run_time=0.9)
        scene.wait(3.5)
        return

    if name == "insight":
        ans = MathTex(ex["answer_tex"], color=FOREGROUND).scale(0.7).set_y(WORK_TOP_Y - 0.6)
        box = tight_box(ans, color=SECONDARY, pad=0.18)
        scene.add(ans, box)
        card = small_label(ex["insight"], 0.42, ACCENT).move_to([0, -1.4, 0])
        if card.width > 11:
            card.scale(11 / card.width)
        scene.play(Write(card), run_time=1.4)
        scene.play(Circumscribe(card, color=ACCENT, buff=0.3), run_time=1.4)
        scene.wait(4.0)
        return

    if name == "check":
        chk = ex["check"]
        if chk["kind"] == "list":
            terms = chk["terms"]
            row = VGroup(*[MathTex(str(v), color=FOREGROUND).scale(0.55) for v in terms])
            row.arrange(RIGHT, buff=0.5).set_y(-0.4)
            if row.width > 12:
                row.scale(12 / row.width)
            arcs = VGroup()
            for a, b in zip(row, row[1:]):
                arc = CurvedArrow(a.get_top() + 0.05 * UP, b.get_top() + 0.05 * UP,
                                  angle=-TAU / 8, color=SECONDARY, stroke_width=2, tip_length=0.12)
                arcs.add(arc)
            hdr = small_label("Wypisujemy wyrazy, odejmując 4:", 0.36, MUTED).next_to(row, UP, buff=0.7)
            scene.play(FadeIn(hdr), run_time=0.6)
            for i, t in enumerate(row):
                anims = [FadeIn(t, shift=0.15 * RIGHT)]
                if i:
                    anims.append(Create(arcs[i - 1]))
                scene.play(*anims, run_time=0.45)
            scene.play(Circumscribe(row[-1], color=SECONDARY), run_time=1.0)
        else:
            line = MathTex(chk.get("line", ""), color=FOREGROUND).scale(0.7).set_y(0.3)
            scene.play(Write(line), run_time=1.2)
        scene.play(FadeIn(_note(chk["note"]), shift=0.15 * UP), run_time=0.8)
        scene.wait(3.5)
        return

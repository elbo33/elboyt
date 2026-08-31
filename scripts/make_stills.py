"""Build 1:1 (1080x1080) quiz-card stills for social: a problem statement, four
A/B/C/D options, and a call to action. House palette + add_texture-style grid.
No Manim, no video frame. Each card also gets a `.md` post description.

Usage:  .venv/bin/python scripts/make_stills.py specs.json [--out-dir DIR]
specs.json: [{
  "slug": "quiz-a12",
  "tag": "Sprawdź się · ciąg arytmetyczny",
  "statement": "W ciągu arytmetycznym a₁ = -3 oraz r = 5. Oblicz a₁₂.",
  "options": [["A","47"],["B","52"],["C","55"],["D","57"]],
  "answer": "B",
  "cta": "Napisz odpowiedź w komentarzu.",
  "description": "Post caption text (Polish, no em dashes)."
}]

With --out-dir, each card is written to <out-dir>/<slug>.{png,md} (the pipeline
stages stills into generated/stills/). Without it, the spec's legacy "out" path
is used.
"""
import argparse
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BG = (8, 16, 24)
FG = (247, 250, 255)
MUTED = (145, 163, 183)
ACCENT = (34, 211, 238)
SECONDARY = (245, 158, 11)
SOFT = (35, 49, 66)
CARD = (16, 27, 40)

SIZE = 1080
FONT = "/System/Library/Fonts/Avenir Next.ttc"
F_TAG = ImageFont.truetype(FONT, 24, index=5)
F_STMT = ImageFont.truetype(FONT, 42, index=2)     # Demi Bold
F_STMT_SUB = ImageFont.truetype(FONT, 27, index=2)
F_OPT = ImageFont.truetype(FONT, 40, index=5)
F_OPT_SUB = ImageFont.truetype(FONT, 26, index=5)
F_BADGE = ImageFont.truetype(FONT, 40, index=0)
F_CTA = ImageFont.truetype(FONT, 34, index=0)


def grid(d):
    step = 55
    for x in range(0, SIZE + step, step):
        d.line([(x, 0), (x, SIZE)], fill=SOFT, width=1)
    for y in range(0, SIZE + step, step):
        d.line([(0, y), (SIZE, y)], fill=SOFT, width=1)


# Avenir Next has no subscript glyphs, so `X_1` / `X_{12}` / `a_n` are drawn as
# a small baseline-shifted run rather than a Unicode subscript (which tofus).
_SUB = re.compile(r"_\{([^}]*)\}|_([A-Za-z0-9])")


def _runs(s):
    out, i = [], 0
    for m in _SUB.finditer(s):
        if m.start() > i:
            out.append(("n", s[i:m.start()]))
        out.append(("s", m.group(1) if m.group(1) is not None else m.group(2)))
        i = m.end()
    if i < len(s):
        out.append(("n", s[i:]))
    return out


def math_width(d, s, font, subfont):
    return sum(d.textlength(t, font=(subfont if k == "s" else font)) for k, t in _runs(s))


def draw_math(d, xy, s, font, subfont, fill):
    # PIL draws from the top-left, so a smaller run at the same y reads as a
    # superscript. Drop it by the ascent gap plus a touch more so `a_1` sits as
    # a true subscript, not an exponent.
    x, y = xy
    drop = round((font.size - subfont.size) * 0.75 + font.size * 0.14)
    for k, t in _runs(s):
        f = subfont if k == "s" else font
        d.text((x, y + (drop if k == "s" else 0)), t, font=f, fill=fill)
        x += d.textlength(t, font=f)
    return x - xy[0]


def wrap(d, text, font, subfont, max_w):
    out = []
    for para in text.split("\n"):
        words, cur = para.split(), ""
        for w in words:
            t = (cur + " " + w).strip()
            if math_width(d, t, font, subfont) > max_w and cur:
                out.append(cur)
                cur = w
            else:
                cur = t
        out.append(cur)
    return out


def resolve_out(spec, out_dir):
    if out_dir:
        slug = spec.get("slug") or Path(spec["out"]).stem
        return Path(out_dir) / f"{slug}.png"
    return Path(spec["out"])


def build(spec, out_dir=None):
    im = Image.new("RGB", (SIZE, SIZE), BG)
    d = ImageDraw.Draw(im)
    grid(d)

    pad = 84
    y = 96

    # tag + rule
    d.text((pad, y), "  ".join(spec["tag"].upper()), font=F_TAG, fill=MUTED)
    d.line([(pad, y + 40), (pad + 46, y + 40)], fill=ACCENT, width=4)
    y += 96

    # statement
    for line in wrap(d, spec["statement"], F_STMT, F_STMT_SUB, SIZE - 2 * pad):
        draw_math(d, (pad, y), line, F_STMT, F_STMT_SUB, FG)
        y += 58
    y += 54

    # options 2x2
    ow = (SIZE - 2 * pad - 34) // 2
    oh = 118
    for i, (k, txt) in enumerate(spec["options"]):
        col, row = i % 2, i // 2
        x0 = pad + col * (ow + 34)
        y0 = y + row * (oh + 28)
        d.rounded_rectangle([x0, y0, x0 + ow, y0 + oh], radius=22,
                            fill=CARD, outline=SOFT, width=2)
        d.text((x0 + 34, y0 + oh / 2), k + ")", font=F_BADGE, fill=ACCENT, anchor="lm")
        draw_math(d, (x0 + 118, y0 + oh / 2 - F_OPT.size / 2), txt, F_OPT, F_OPT_SUB, FG)
    y += 2 * oh + 28 + 70

    # CTA
    d.text((pad, y), spec["cta"], font=F_CTA, fill=SECONDARY)

    out = resolve_out(spec, out_dir)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, quality=95)

    md = out.with_suffix(".md")
    md.write_text(
        f"# {spec['tag']}\n\n{spec['description'].strip()}\n\n"
        f"Poprawna odpowiedź: {spec['answer']}.\n", encoding="utf-8")
    print("wrote", out, "+", md.name)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("specs")
    ap.add_argument("--out-dir", default=None)
    args = ap.parse_args()
    for s in json.load(open(args.specs)):
        build(s, args.out_dir)

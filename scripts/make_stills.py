"""Build 1:1 (1080x1080) stills: a frame lifted from an existing render, placed
on a house-styled square with a caption panel. No Manim re-run.

Usage:  .venv/bin/python scripts/make_stills.py specs.json
specs.json: [{ "src": "<mp4>", "at": 0.6, "headline": "...", "tag": "...", "out": "<png>" }]
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BG = (8, 16, 24)
FG = (247, 250, 255)
MUTED = (145, 163, 183)
ACCENT = (34, 211, 238)
SOFT = (35, 49, 66)

SIZE = 1080
FRAME_H = 756  # the lifted frame occupies the top; caption panel is the rest
FONT = "/System/Library/Fonts/Avenir Next.ttc"
BOLD = ImageFont.truetype(FONT, 54, index=0)
MED = ImageFont.truetype(FONT, 25, index=5)


def grid(draw):
    step = 55
    for x in range(0, SIZE + step, step):
        draw.line([(x, 0), (x, SIZE)], fill=SOFT, width=1)
    for y in range(0, SIZE + step, step):
        draw.line([(0, y), (SIZE, y)], fill=SOFT, width=1)


def frame_at(src, at):
    dur = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", src]).strip())
    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False).name
    subprocess.run(["ffmpeg", "-v", "error", "-ss", str(dur * at), "-i", src,
                    "-frames:v", "1", tmp, "-y"], check=True)
    return Image.open(tmp).convert("RGB")


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) > max_w and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines


def build(spec):
    # square, house grid on the dark ground
    canvas = Image.new("RGB", (SIZE, SIZE), BG)
    d = ImageDraw.Draw(canvas)
    grid(d)

    # lift a frame; centre-crop (9:16 or 16:9) to 1080 x FRAME_H, keep the middle
    fr = frame_at(spec["src"], spec["at"])
    fr = fr.resize((SIZE, round(fr.height * SIZE / fr.width)))
    top = max(0, (fr.height - FRAME_H) // 2)
    fr = fr.crop((0, top, SIZE, top + FRAME_H))
    canvas.paste(fr, (0, 0))

    # hairline between frame and caption panel; grid already shows through below
    d.line([(0, FRAME_H), (SIZE, FRAME_H)], fill=SOFT, width=2)

    pad = 64
    y = FRAME_H + 48
    d.text((pad, y), "  ".join(spec["tag"].upper()), font=MED, fill=MUTED)
    d.line([(pad, y + 42), (pad + 44, y + 42)], fill=ACCENT, width=3)
    y += 70
    for line in wrap(d, spec["headline"], BOLD, SIZE - 2 * pad):
        d.text((pad, y), line, font=BOLD, fill=FG)
        y += 66

    out = Path(spec["out"])
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, quality=95)
    print("wrote", out)


if __name__ == "__main__":
    specs = json.load(open(sys.argv[1]))
    for s in specs:
        build(s)

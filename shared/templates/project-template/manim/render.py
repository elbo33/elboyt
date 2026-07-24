#!/usr/bin/env python3
"""Per-project render CLI.

This file is intentionally thin and identical across every project — all
real logic (rendering, cleanup, discovery) lives in the shared
`render_pipeline` module under `shared/manim-lib/`, so every project stays
in sync automatically.

Examples (run from inside this project's `manim/` directory, or anywhere
— paths are resolved relative to this file):

    python render.py                          # every scene, every language
    python render.py --lang en                 # every scene, English only
    python render.py --scene intro_hello        # one scene, every language
    python render.py --scene intro_hello --lang en,fr
    python render.py --scene intro_hello --lang en --quality h
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = PROJECT_DIR.parent.parent
sys.path.insert(0, str(REPO_ROOT / "shared" / "manim-lib"))

from render_pipeline import discover_languages, discover_scenes, render_all  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--scene",
        help="Scene name(s), comma-separated. Default: all scenes found under manim/scenes/.",
    )
    parser.add_argument(
        "--lang",
        help="Language code(s), comma-separated. Default: all languages found under manim/labels/.",
    )
    parser.add_argument(
        "--quality",
        choices=["l", "m", "h"],
        default="l",
        help="Manim render quality (l=low/fast, m=medium, h=high). Default: l.",
    )
    args = parser.parse_args()

    scenes = args.scene.split(",") if args.scene else discover_scenes(PROJECT_DIR)
    langs = args.lang.split(",") if args.lang else discover_languages(PROJECT_DIR)

    if not scenes:
        print("No scenes found under manim/scenes/.", file=sys.stderr)
        return 1
    if not langs:
        print("No languages found under manim/labels/.", file=sys.stderr)
        return 1

    ok = True
    for line in render_all(PROJECT_DIR, scenes=scenes, langs=langs, quality=args.quality):
        print(line)
        if line.startswith("FAILED"):
            ok = False

    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())

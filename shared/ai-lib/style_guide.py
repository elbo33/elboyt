"""Loads the master prompt every AI feature grounds its system prompt in."""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
STYLE_GUIDE_PATH = REPO_ROOT / "shared" / "prompts" / "video_style_guide.md"


def load_style_guide() -> str:
    return STYLE_GUIDE_PATH.read_text()

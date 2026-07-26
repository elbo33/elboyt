"""Mechanical read/write of a scene's source file.

Unlike `scenario_editor.py`'s line-level surgery, a scene revision replaces
the whole file — Milestone 6 always sends the model the full current
source and asks for a full replacement back, so there's no partial-section
concept to preserve here.
"""

from __future__ import annotations

from pathlib import Path


def _scene_file(project_dir: Path, scene: str) -> Path:
    return project_dir / "manim" / "scenes" / f"{scene}.py"


def get_scene_source(project_dir: Path, scene: str) -> str:
    return _scene_file(project_dir, scene).read_text()


def write_scene_source(project_dir: Path, scene: str, source: str) -> None:
    _scene_file(project_dir, scene).write_text(source)

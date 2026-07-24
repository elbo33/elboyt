"""Shared Manim render pipeline — the ONE place that renders a scene and
enforces the no-pile-up-on-disk rule.

Both the per-project CLI (`projects/<slug>/manim/render.py`) and the web
platform's re-render endpoint (`webapp/app.py`) import and call the
functions in this module directly. Neither reimplements rendering or
cleanup — if you need to change either, change it here.

Layout assumptions (see top-level README.md for the full convention):

    projects/<slug>/manim/scenes/<scene>.py    -- exactly one Scene subclass
    projects/<slug>/manim/labels/labels_<lang>.py
    projects/<slug>/assets/renders/<lang>/<scene>.mp4   -- final output

Language selection happens through the SCENE_LANG environment variable,
which scene files read themselves (see README + example scene) to pick the
right `labels_<lang>` module. This module never edits scene code — it only
sets up the environment/paths and invokes the `manim` CLI as a subprocess,
which lets us stream its stdout live and keeps us decoupled from Manim's
internal Python API.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator

REPO_ROOT = Path(__file__).resolve().parents[2]
SHARED_MANIM_LIB = Path(__file__).resolve().parent


@dataclass
class RenderResult:
    project_dir: Path
    scene: str
    lang: str
    ok: bool
    output_path: Path | None
    message: str


class RenderError(Exception):
    pass


def _scene_file(project_dir: Path, scene: str) -> Path:
    path = project_dir / "manim" / "scenes" / f"{scene}.py"
    if not path.exists():
        raise RenderError(f"no such scene file: {path}")
    return path


def _scene_class_name(scene_file: Path) -> str:
    """Find the single Manim Scene subclass defined in a scene file.

    Scene files are plain Python source that the `manim` CLI imports; we
    only need the class *name* here (to pass to the manim CLI), so we do a
    lightweight source scan rather than importing the module ourselves
    (importing would require Manim + the project's labels to already be
    resolvable in this process).
    """
    import ast

    tree = ast.parse(scene_file.read_text(), filename=str(scene_file))
    candidates = [
        node.name
        for node in ast.walk(tree)
        if isinstance(node, ast.ClassDef)
        and any(
            (isinstance(base, ast.Name) and "Scene" in base.id)
            or (isinstance(base, ast.Attribute) and "Scene" in base.attr)
            for base in node.bases
        )
    ]
    if not candidates:
        raise RenderError(f"no Scene subclass found in {scene_file}")
    if len(candidates) > 1:
        raise RenderError(
            f"expected exactly one Scene subclass in {scene_file}, found {candidates}"
        )
    return candidates[0]


def final_render_path(project_dir: Path, scene: str, lang: str) -> Path:
    """The single predictable path a scene's render lives at."""
    return project_dir / "assets" / "renders" / lang / f"{scene}.mp4"


def delete_existing_render(project_dir: Path, scene: str, lang: str) -> bool:
    """Delete a previous render of this exact scene+language, if present.

    Returns True if a file was actually deleted. This is the reusable
    cleanup primitive required by the brief: it is called by
    `render_scene_for_language` below, and may also be called directly
    (e.g. by a "delete render" UI action) without duplicating the logic.
    """
    path = final_render_path(project_dir, scene, lang)
    if path.exists():
        path.unlink()
        return True
    return False


def _cache_dir(project_dir: Path, scene: str, lang: str) -> Path:
    return project_dir / "manim" / ".render-cache" / f"{scene}__{lang}"


def render_scene_for_language(
    project_dir: Path,
    scene: str,
    lang: str,
    quality: str = "l",
) -> Iterator[str]:
    """Render one scene in one language, streaming log lines as it runs.

    This is a generator: consume it fully (e.g. `for line in ...: print
    (line)`) to actually drive the render to completion — the cleanup and
    final move happen after the subprocess finishes, right before the
    generator raises StopIteration.

    Disk-usage contract (see README "render cleanup requirement"):
      1. Render to an isolated, per-scene-per-lang cache directory (so a
         concurrent/previous render's cache never collides).
      2. On success: delete the previous final render for this exact
         scene+language, then move the new file into place. This way a
         *failed* render never destroys a previously-good render.
      3. Always delete the cache directory afterwards, success or failure
         — only the final mp4 under assets/renders/ survives.
    """
    scene_file = _scene_file(project_dir, scene)
    class_name = _scene_class_name(scene_file)
    cache_dir = _cache_dir(project_dir, scene, lang)
    cache_dir.mkdir(parents=True, exist_ok=True)

    quality_flag = {"l": "-ql", "m": "-qm", "h": "-qh"}.get(quality, "-ql")

    env = {
        **os.environ,
        "SCENE_LANG": lang,
        "PYTHONPATH": str(project_dir / "manim") + ":" + str(SHARED_MANIM_LIB),
        # Rich (Manim's console logger) wraps to a detected terminal width;
        # with no real tty attached (subprocess pipe) that can default to a
        # narrow width and garble log lines with mid-word wraps. Force wide.
        "COLUMNS": "200",
    }

    cmd = [
        sys.executable,
        "-m",
        "manim",
        "render",
        quality_flag,
        "--progress_bar",
        "none",
        "--media_dir",
        str(cache_dir),
        "-o",
        f"{scene}.mp4",
        str(scene_file),
        class_name,
    ]

    yield f"$ SCENE_LANG={lang} {' '.join(cmd)}"

    proc = subprocess.Popen(
        cmd,
        cwd=str(project_dir / "manim"),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    assert proc.stdout is not None
    for line in proc.stdout:
        yield line.rstrip("\n")
    returncode = proc.wait()

    if returncode != 0:
        shutil.rmtree(cache_dir, ignore_errors=True)
        yield f"FAILED: manim exited with code {returncode}"
        return

    produced = list(cache_dir.rglob(f"{scene}.mp4"))
    if not produced:
        shutil.rmtree(cache_dir, ignore_errors=True)
        yield "FAILED: manim reported success but no output file was found"
        return

    target = final_render_path(project_dir, scene, lang)
    target.parent.mkdir(parents=True, exist_ok=True)

    deleted = delete_existing_render(project_dir, scene, lang)
    shutil.move(str(produced[0]), str(target))
    shutil.rmtree(cache_dir, ignore_errors=True)

    if deleted:
        yield f"Removed previous render for {scene}/{lang}"
    yield f"OK: {target.relative_to(project_dir)}"


def discover_scenes(project_dir: Path) -> list[str]:
    scenes_dir = project_dir / "manim" / "scenes"
    if not scenes_dir.is_dir():
        return []
    return sorted(p.stem for p in scenes_dir.glob("*.py") if p.stem != "__init__")


def discover_languages(project_dir: Path) -> list[str]:
    """Languages a project has *some* labels for, across all its scenes."""
    labels_dir = project_dir / "manim" / "labels"
    if not labels_dir.is_dir():
        return []
    langs = set()
    for p in labels_dir.glob("labels_*.py"):
        langs.add(p.stem.removeprefix("labels_"))
    return sorted(langs)


def render_all(
    project_dir: Path,
    scenes: list[str] | None = None,
    langs: list[str] | None = None,
    quality: str = "l",
) -> Iterator[str]:
    """Render every (scene, lang) pair in the cartesian product of the given
    lists (or every discovered scene/lang if omitted), one after another.
    """
    scenes = scenes if scenes is not None else discover_scenes(project_dir)
    langs = langs if langs is not None else discover_languages(project_dir)
    for scene in scenes:
        for lang in langs:
            yield f"=== {scene} / {lang} ==="
            yield from render_scene_for_language(project_dir, scene, lang, quality)

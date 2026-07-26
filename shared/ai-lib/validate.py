"""Structural checks run on any AI-proposed edit before it's offered to a
human as "accept this". These enforce the two invariants the rest of the
platform depends on (see README.md and video_style_guide.md) — they are
not style opinions, they are things that will silently break `read_model.py`
or a render if violated.

Every check returns a list of human-readable error strings; an empty list
means the proposal passed.
"""

from __future__ import annotations

import ast
import sys
from pathlib import Path

TEXT_RENDERING_CALLEES = {"Text", "Tex", "MathTex", "MarkupText", "styled_title", "styled_body"}

# Every scene file resolves its language through this exact mechanism (see
# README.md "Manim scenes & labels") — a scene missing it can't ever show
# anything but whatever LANG happens to default to.
REQUIRED_SCENE_SNIPPETS = [
    'os.environ.get("SCENE_LANG"',
    "importlib.import_module(",
]


def _known_palette_keys() -> set[str]:
    """The real, current keys in shared/manim-lib/theme.py's PALETTE —
    read from that file itself (not duplicated here) so this never drifts
    out of sync with it. A model asked to use PALETTE[...] will
    confidently invent plausible-sounding keys ("blue", "warning") that
    don't exist; that's a KeyError at render time, not a Python error a
    plain ast.parse() would ever catch, which is why this needs its own
    check.
    """
    manim_lib = Path(__file__).resolve().parents[1] / "manim-lib"
    if str(manim_lib) not in sys.path:
        sys.path.insert(0, str(manim_lib))
    from theme import PALETTE

    return set(PALETTE.keys())


def validate_section_body(body: str) -> list[str]:
    """A proposed replacement for one scenario section's body.

    The body must never contain a line starting with "## " — that's the
    exact marker `read_model._split_sections` uses to find section
    boundaries, so a stray one would silently merge/split sections on next
    read.
    """
    errors = []
    for line in body.splitlines():
        if line.startswith("## "):
            errors.append(
                "proposed section body contains a '## ' line, which would be "
                "parsed as a new section header instead of narration text"
            )
    return errors


def validate_scene_source(source: str) -> list[str]:
    """A proposed full replacement for a manim/scenes/<scene>.py file."""
    errors: list[str] = []
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        return [f"not valid Python: {exc}"]

    scene_classes = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.ClassDef)
        and any(
            (isinstance(base, ast.Name) and "Scene" in base.id)
            or (isinstance(base, ast.Attribute) and "Scene" in base.attr)
            for base in node.bases
        )
    ]
    if not scene_classes:
        errors.append("no Scene subclass found")
    elif len(scene_classes) > 1:
        errors.append(
            f"expected exactly one Scene subclass, found {[c.name for c in scene_classes]}"
        )

    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not node.args:
            continue
        name = None
        if isinstance(node.func, ast.Name):
            name = node.func.id
        elif isinstance(node.func, ast.Attribute):
            name = node.func.attr
        if name not in TEXT_RENDERING_CALLEES:
            continue
        first_arg = node.args[0]
        if isinstance(first_arg, ast.Constant) and isinstance(first_arg.value, str):
            errors.append(
                f"{name}(...) at line {node.lineno} uses a hardcoded string "
                "instead of a LABELS[...] lookup"
            )

    for snippet in REQUIRED_SCENE_SNIPPETS:
        if snippet not in source:
            errors.append(
                f"scene source is missing the SCENE_LANG/LABELS boilerplate "
                f"(expected to find {snippet!r})"
            )

    known_palette_keys = _known_palette_keys()
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Subscript)
            and isinstance(node.value, ast.Name)
            and node.value.id == "PALETTE"
            and isinstance(node.slice, ast.Constant)
            and isinstance(node.slice.value, str)
            and node.slice.value not in known_palette_keys
        ):
            errors.append(
                f"PALETTE[{node.slice.value!r}] at line {node.lineno} is not a real "
                f"theme.py color (available: {sorted(known_palette_keys)})"
            )

    return errors


def labels_keys_used(source: str) -> set[str]:
    """Every `LABELS["key"]` lookup a scene's source performs, by static
    key. Used by `validate_new_project` to catch a Milestone 7 draft where
    a scene references a key that some language's labels file never
    defines — that would only surface as a `KeyError` the first time
    someone renders that language.
    """
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return set()
    keys = set()
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Subscript)
            and isinstance(node.value, ast.Name)
            and node.value.id == "LABELS"
            and isinstance(node.slice, ast.Constant)
            and isinstance(node.slice.value, str)
        ):
            keys.add(node.slice.value)
    return keys


def validate_new_project(
    sections: list[dict], scenes: list[dict], labels: list[dict]
) -> list[str]:
    """Structural checks on a freshly AI-scaffolded project draft (see
    `project_scaffolder.py`), before any of its files are written under
    `projects/<slug>/`. Doesn't know about JSON or the LLM — just the
    folder-convention invariants the rest of the platform depends on.
    """
    errors: list[str] = []
    if not sections:
        errors.append("draft has no sections")

    scene_names = {s.get("name") for s in scenes}
    referenced_scenes: set[str] = set()
    for section in sections:
        section_id = section.get("id", "?")
        if section.get("shot") not in ("facecam", "manim", "screen"):
            errors.append(f"section {section_id} has invalid shot type {section.get('shot')!r}")
        if section.get("shot") == "manim":
            scene_name = section.get("scene")
            if not scene_name:
                errors.append(f"section {section_id} is shot:manim but names no scene")
            elif scene_name not in scene_names:
                errors.append(f"section {section_id} references undefined scene {scene_name!r}")
            else:
                referenced_scenes.add(scene_name)

    for name in sorted(scene_names - referenced_scenes):
        errors.append(f"scene {name!r} is defined but no section references it")

    for scene in scenes:
        name = scene.get("name", "?")
        for err in validate_scene_source(scene.get("source", "")):
            errors.append(f"scene {name}: {err}")

    for scene in scenes:
        name = scene.get("name", "?")
        used_keys = labels_keys_used(scene.get("source", ""))
        for lang_entry in labels:
            lang = lang_entry.get("lang", "?")
            available = {e.get("key") for e in lang_entry.get("entries", [])}
            for key in sorted(used_keys - available):
                errors.append(f"scene {name} uses LABELS[{key!r}] but labels_{lang}.py has no such key")

    return errors

"""Assembles a validated Milestone 7 draft (see
shared/ai-lib/project_scaffolder.py) into a real projects/<NNN-slug>/
directory, following exactly the folder convention in the top-level
README — this is the only code that writes a scaffolded project's files,
so the convention is enforced in one place rather than re-derived by
whatever calls it.

Callers must run the draft through validate_new_project() first — this
module assumes the draft is already sound and just writes it out.
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
RENDER_CLI_TEMPLATE = REPO_ROOT / "shared" / "templates" / "project-template" / "manim" / "render.py"


def sanitize_slug(text: str, fallback: str = "untitled") -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or fallback


def next_project_slug(projects_dir: Path, idea_slug: str) -> str:
    """`<NNN>-<idea_slug>`, where NNN is one more than the highest existing
    project number under projects_dir (zero-padded to 3 digits, matching
    every hand-authored project's convention).
    """
    highest = 0
    if projects_dir.is_dir():
        for p in projects_dir.iterdir():
            if p.is_dir() and p.name[:3].isdigit():
                highest = max(highest, int(p.name[:3]))
    return f"{highest + 1:03d}-{idea_slug}"


def _title_for(draft: dict, lang: str) -> str:
    titles = {t["lang"]: t["text"] for t in draft.get("titles", [])}
    if lang in titles:
        return titles[lang]
    if "en" in titles:
        return titles["en"]
    return next(iter(titles.values()), draft.get("slug", "Untitled"))


def _write_project_yaml(project_dir: Path, slug: str, draft: dict) -> None:
    titles = {t["lang"]: t["text"] for t in draft.get("titles", [])}
    data = {
        "slug": slug,
        "title": titles,
        "status": {lang: "draft" for lang in titles},
    }
    (project_dir / "project.yaml").write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True))


def _write_outline(project_dir: Path, draft: dict) -> None:
    title = _title_for(draft, "en")
    lines = [f"# {title} — Outline", ""]
    for section in draft["sections"]:
        lines.append(f"## {section['id']}. {section['title']}")
        lines.append(f"- shot: {section['shot']}")
        if section["shot"] == "manim" and section.get("scene"):
            lines.append(f"- scene: {section['scene']}")
        lines.append(f"- duration: {section['duration_seconds']}s")
        lines.append("")
    (project_dir / "scenario" / "scenario-outline.md").write_text("\n".join(lines).rstrip("\n") + "\n")


def _write_scenario_lang(project_dir: Path, draft: dict, lang: str) -> None:
    title = _title_for(draft, lang)
    lines = [f"# {title} — Script ({lang.upper()})", ""]
    for section in draft["sections"]:
        narration = {n["lang"]: n["text"] for n in section.get("narration", [])}
        text = narration.get(lang, "").strip() or "(No narration written yet.)"
        lines.append(f"## {section['id']}. {section['title']}")
        lines.append(text)
        lines.append("")
    (project_dir / "scenario" / f"scenario.{lang}.md").write_text("\n".join(lines).rstrip("\n") + "\n")


def _write_labels(project_dir: Path, lang_entry: dict) -> None:
    lang = lang_entry["lang"]
    lines = [
        '"""On-screen text for this language. Imported dynamically by scene',
        'files based on the SCENE_LANG environment variable."""',
        "",
        "LABELS = {",
    ]
    for entry in lang_entry.get("entries", []):
        text = entry["text"].replace("\\", "\\\\").replace('"', '\\"')
        lines.append(f'    "{entry["key"]}": "{text}",')
    lines.append("}")
    lines.append("")
    (project_dir / "manim" / "labels" / f"labels_{lang}.py").write_text("\n".join(lines))


def write_project(projects_dir: Path, slug: str, draft: dict, languages: list[str]) -> Path:
    project_dir = projects_dir / slug
    if project_dir.exists():
        raise FileExistsError(f"project already exists: {slug}")

    (project_dir / "scenario").mkdir(parents=True)
    (project_dir / "manim" / "scenes").mkdir(parents=True)
    (project_dir / "manim" / "labels").mkdir(parents=True)
    (project_dir / "assets").mkdir(parents=True)

    _write_project_yaml(project_dir, slug, draft)
    _write_outline(project_dir, draft)
    for lang in languages:
        _write_scenario_lang(project_dir, draft, lang)

    for scene in draft["scenes"]:
        (project_dir / "manim" / "scenes" / f"{scene['name']}.py").write_text(scene["source"])

    (project_dir / "manim" / "labels" / "__init__.py").write_text("")
    for lang_entry in draft.get("labels", []):
        _write_labels(project_dir, lang_entry)

    shutil.copy(RENDER_CLI_TEMPLATE, project_dir / "manim" / "render.py")

    return project_dir

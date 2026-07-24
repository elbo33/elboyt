"""Read-only interface onto the projects/ folder convention.

Deliberately has zero dependency on the web layer (no FastAPI/Starlette
imports) so it can be unit-tested and reused from anywhere — a script, a
REPL, a different frontend. Every read here is either a cheap filesystem
stat or (for markdown/renders) cached and invalidated by mtime, so calling
these functions repeatedly (e.g. once per web request) doesn't re-scan or
re-parse anything that hasn't changed on disk.

Parsing rule for scenario files (see top-level README.md for the full
convention): both `scenario-outline.md` and each `scenario.<lang>.md` are
split into sections on lines starting with "## ". The outline's section
body is a small `- key: value` bullet list (shot/duration/scene); a
language file's section body is free-form narration markdown. Sections are
matched between the two files by exact header string equality.
"""

from __future__ import annotations

import html
import re
import subprocess
import sys
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
PROJECTS_DIR = REPO_ROOT / "projects"

sys.path.insert(0, str(REPO_ROOT / "shared" / "manim-lib"))
from render_pipeline import discover_scenes  # noqa: E402


class ProjectNotFoundError(Exception):
    def __init__(self, slug: str):
        super().__init__(f"no such project: {slug}")
        self.slug = slug


@dataclass
class ProjectSummary:
    slug: str
    titles: dict[str, str]
    statuses: dict[str, str]
    languages: list[str]


@dataclass
class ProjectDetail(ProjectSummary):
    scenes: list[str]


@dataclass
class ScenarioSection:
    section_id: str
    title: str
    shot_type: str | None
    scene: str | None
    duration: str | None
    narration_html: str | None  # None means this language has no such section


@dataclass
class Scenario:
    lang: str
    sections: list[ScenarioSection]


@dataclass
class RenderInfo:
    scene: str
    lang: str
    filename: str
    path: Path
    size_bytes: int
    duration_seconds: float | None


# --------------------------------------------------------------------------
# Tiny mtime-fingerprint cache. Not a general-purpose cache library — just
# enough to avoid re-parsing markdown / re-running ffprobe on every request
# when nothing on disk has changed.
# --------------------------------------------------------------------------

_cache_lock = threading.Lock()
_cache: dict[str, tuple[Any, Any]] = {}


def _mtime(path: Path) -> int:
    try:
        return path.stat().st_mtime_ns
    except FileNotFoundError:
        return -1


def _cached(key: str, fingerprint: Any, compute):
    with _cache_lock:
        entry = _cache.get(key)
        if entry is not None and entry[0] == fingerprint:
            return entry[1]
    result = compute()
    with _cache_lock:
        _cache[key] = (fingerprint, result)
    return result


def clear_cache() -> None:
    """Drop all cached reads. Mainly useful in tests."""
    with _cache_lock:
        _cache.clear()


# --------------------------------------------------------------------------
# Projects
# --------------------------------------------------------------------------


def _project_dir(slug: str) -> Path:
    path = PROJECTS_DIR / slug
    if not (path / "project.yaml").exists():
        raise ProjectNotFoundError(slug)
    return path


def _discover_project_languages(project_dir: Path) -> list[str]:
    """Union of languages with *any* content: scenario, labels, or renders."""
    langs: set[str] = set()

    scenario_dir = project_dir / "scenario"
    if scenario_dir.is_dir():
        for p in scenario_dir.glob("scenario.*.md"):
            langs.add(p.stem.split(".", 1)[1])

    labels_dir = project_dir / "manim" / "labels"
    if labels_dir.is_dir():
        for p in labels_dir.glob("labels_*.py"):
            langs.add(p.stem.removeprefix("labels_"))

    renders_dir = project_dir / "assets" / "renders"
    if renders_dir.is_dir():
        for p in renders_dir.iterdir():
            if p.is_dir():
                langs.add(p.name)

    return sorted(langs)


def _projects_fingerprint() -> tuple:
    if not PROJECTS_DIR.is_dir():
        return ()
    items = []
    for p in sorted(PROJECTS_DIR.iterdir()):
        yaml_path = p / "project.yaml"
        if yaml_path.exists():
            items.append((p.name, _mtime(yaml_path)))
    return tuple(items)


def list_projects() -> list[ProjectSummary]:
    def compute() -> list[ProjectSummary]:
        summaries = []
        if not PROJECTS_DIR.is_dir():
            return summaries
        for p in sorted(PROJECTS_DIR.iterdir()):
            if not p.is_dir() or not (p / "project.yaml").exists():
                continue
            summaries.append(_load_project_summary(p))
        return summaries

    return _cached("projects", _projects_fingerprint(), compute)


def _load_project_summary(project_dir: Path) -> ProjectSummary:
    data = yaml.safe_load((project_dir / "project.yaml").read_text()) or {}
    return ProjectSummary(
        slug=project_dir.name,
        titles=data.get("title") or {},
        statuses=data.get("status") or {},
        languages=_discover_project_languages(project_dir),
    )


def _project_fingerprint(project_dir: Path) -> tuple:
    return (
        _mtime(project_dir / "project.yaml"),
        _mtime(project_dir / "scenario"),
        _mtime(project_dir / "manim" / "scenes"),
        _mtime(project_dir / "manim" / "labels"),
        _mtime(project_dir / "assets" / "renders"),
    )


def get_project(slug: str) -> ProjectDetail:
    project_dir = _project_dir(slug)

    def compute() -> ProjectDetail:
        summary = _load_project_summary(project_dir)
        return ProjectDetail(
            slug=summary.slug,
            titles=summary.titles,
            statuses=summary.statuses,
            languages=summary.languages,
            scenes=discover_scenes(project_dir),
        )

    return _cached(f"project:{slug}", _project_fingerprint(project_dir), compute)


# --------------------------------------------------------------------------
# Scenario
# --------------------------------------------------------------------------


def _split_sections(text: str) -> list[tuple[str, str]]:
    """Split markdown on "## " headers into (header, body) pairs."""
    sections: list[tuple[str, str]] = []
    header: str | None = None
    body_lines: list[str] = []
    for line in text.splitlines():
        if line.startswith("## "):
            if header is not None:
                sections.append((header, "\n".join(body_lines).strip()))
            header = line[3:].strip()
            body_lines = []
        elif header is not None:
            body_lines.append(line)
    if header is not None:
        sections.append((header, "\n".join(body_lines).strip()))
    return sections


_HEADER_ID_RE = re.compile(r"^(\S+)\.\s*(.+)$")


def _split_header(header: str) -> tuple[str, str]:
    m = _HEADER_ID_RE.match(header)
    if m:
        return m.group(1), m.group(2)
    return header, header


def _parse_outline_meta(body: str) -> dict[str, str]:
    meta: dict[str, str] = {}
    for line in body.splitlines():
        line = line.strip()
        if line.startswith("- ") and ":" in line:
            key, value = line[2:].split(":", 1)
            meta[key.strip()] = value.strip()
    return meta


def _inline_markdown(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    return text


def _narration_to_html(text: str) -> str:
    paragraphs = re.split(r"\n\s*\n", text.strip())
    rendered = []
    for para in paragraphs:
        if not para.strip():
            continue
        collapsed = " ".join(line.strip() for line in para.splitlines())
        rendered.append(f"<p>{_inline_markdown(collapsed)}</p>")
    return "\n".join(rendered)


def get_scenario(slug: str, lang: str) -> Scenario:
    project_dir = _project_dir(slug)
    outline_path = project_dir / "scenario" / "scenario-outline.md"
    lang_path = project_dir / "scenario" / f"scenario.{lang}.md"

    if not outline_path.exists():
        raise FileNotFoundError(f"missing scenario-outline.md for project {slug}")

    def compute() -> Scenario:
        outline_sections = _split_sections(outline_path.read_text())
        lang_sections = dict(_split_sections(lang_path.read_text())) if lang_path.exists() else {}

        sections = []
        for header, body in outline_sections:
            section_id, title = _split_header(header)
            meta = _parse_outline_meta(body)
            narration_raw = lang_sections.get(header)
            sections.append(
                ScenarioSection(
                    section_id=section_id,
                    title=title,
                    shot_type=meta.get("shot"),
                    scene=meta.get("scene"),
                    duration=meta.get("duration"),
                    narration_html=_narration_to_html(narration_raw)
                    if narration_raw is not None
                    else None,
                )
            )
        return Scenario(lang=lang, sections=sections)

    fingerprint = (_mtime(outline_path), _mtime(lang_path))
    return _cached(f"scenario:{slug}:{lang}", fingerprint, compute)


# --------------------------------------------------------------------------
# Renders
# --------------------------------------------------------------------------

_duration_cache: dict[tuple[str, int, int], float | None] = {}


def _probe_duration_seconds(path: Path) -> float | None:
    stat = path.stat()
    key = (str(path), stat.st_size, stat.st_mtime_ns)
    if key in _duration_cache:
        return _duration_cache[key]
    duration: float | None
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(path),
            ],
            capture_output=True,
            text=True,
            timeout=10,
        )
        duration = float(result.stdout.strip()) if result.returncode == 0 and result.stdout.strip() else None
    except (FileNotFoundError, ValueError, subprocess.SubprocessError):
        duration = None
    _duration_cache[key] = duration
    return duration


def list_renders(slug: str, lang: str) -> list[RenderInfo]:
    project_dir = _project_dir(slug)
    renders_dir = project_dir / "assets" / "renders" / lang

    def compute() -> list[RenderInfo]:
        if not renders_dir.is_dir():
            return []
        infos = []
        for p in sorted(renders_dir.glob("*.mp4")):
            stat = p.stat()
            infos.append(
                RenderInfo(
                    scene=p.stem,
                    lang=lang,
                    filename=p.name,
                    path=p,
                    size_bytes=stat.st_size,
                    duration_seconds=_probe_duration_seconds(p),
                )
            )
        return infos

    return _cached(f"renders:{slug}:{lang}", _mtime(renders_dir), compute)

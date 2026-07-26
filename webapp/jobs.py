"""In-memory render job tracking.

A "job" wraps one call into the shared render pipeline
(`render_pipeline.render_scene_for_language` / `render_all`) and lets the
web layer stream its log lines live via SSE while it runs. This module
does not render anything itself and does not touch the filesystem cleanup
logic — it only drives the generator from `render_pipeline` on a
background thread and fans its output out to a queue.
"""

from __future__ import annotations

import queue
import sys
import threading
import uuid
from dataclasses import dataclass, field
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "shared" / "manim-lib"))
from render_pipeline import render_all, render_scene_preview  # noqa: E402

import read_model  # noqa: E402


@dataclass
class Job:
    id: str
    slug: str
    scenes: list[str]
    langs: list[str]
    status: str = "running"  # running | ok | failed
    lines: list[str] = field(default_factory=list)
    _queue: "queue.Queue" = field(default_factory=queue.Queue)


_jobs: dict[str, Job] = {}
_jobs_lock = threading.Lock()


def start_render_job(
    slug: str,
    project_dir: Path,
    scenes: list[str] | None,
    langs: list[str] | None,
    quality: str = "l",
) -> Job:
    job = Job(
        id=uuid.uuid4().hex,
        slug=slug,
        scenes=scenes or [],
        langs=langs or [],
    )
    with _jobs_lock:
        _jobs[job.id] = job

    def run() -> None:
        ok = True
        try:
            for line in render_all(project_dir, scenes=scenes, langs=langs, quality=quality):
                job.lines.append(line)
                job._queue.put(line)
                if line.startswith("FAILED"):
                    ok = False
        except Exception as exc:  # surfaced to the UI rather than crashing the thread silently
            ok = False
            message = f"FAILED: {exc}"
            job.lines.append(message)
            job._queue.put(message)
        finally:
            job.status = "ok" if ok else "failed"
            # Renders just changed on disk under this project; drop cached
            # reads so the gallery reflects the new file(s) immediately.
            read_model.clear_cache()
            job._queue.put(None)

    threading.Thread(target=run, daemon=True).start()
    return job


def start_preview_job(
    slug: str,
    project_dir: Path,
    scene: str,
    lang: str,
    source: str,
    quality: str = "l",
) -> Job:
    """Like start_render_job, but renders `source` (an AI-proposed scene
    that hasn't been accepted/written to manim/scenes/ yet) into its
    preview slot instead of the project's real assets/renders/ output.
    """
    job = Job(id=uuid.uuid4().hex, slug=slug, scenes=[scene], langs=[lang])
    with _jobs_lock:
        _jobs[job.id] = job

    def run() -> None:
        ok = True
        try:
            for line in render_scene_preview(project_dir, scene, lang, source, quality=quality):
                job.lines.append(line)
                job._queue.put(line)
                if line.startswith("FAILED"):
                    ok = False
        except Exception as exc:
            ok = False
            message = f"FAILED: {exc}"
            job.lines.append(message)
            job._queue.put(message)
        finally:
            job.status = "ok" if ok else "failed"
            job._queue.put(None)

    threading.Thread(target=run, daemon=True).start()
    return job


def get_job(job_id: str) -> Job | None:
    with _jobs_lock:
        return _jobs.get(job_id)


def stream_job_lines(job_id: str):
    """Yield log lines as they're produced; stops after the sentinel."""
    job = get_job(job_id)
    if job is None:
        return
    while True:
        item = job._queue.get()
        if item is None:
            return
        yield item

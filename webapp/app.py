"""Local web app for browsing scenarios/renders and triggering re-renders.

Stack: FastAPI + Jinja2 templates + vanilla JS (no frontend build step).
Chosen for a personal local tool because:
  - FastAPI/Starlette gives us range-request video serving (FileResponse),
    JSON request bodies, and streaming responses (for SSE render logs) for
    free, with almost no boilerplate.
  - Server-rendered Jinja2 + a little vanilla JS keeps the dependency count
    low (no npm/node toolchain at all) while still giving a re-render
    button with a live log pane.
  - Being Python lets this process import `read_model` and
    `render_pipeline` directly — the exact same functions the CLI uses —
    instead of shelling out and re-parsing text output.
"""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from starlette.requests import Request

WEBAPP_DIR = Path(__file__).resolve().parent
REPO_ROOT = WEBAPP_DIR.parent
sys.path.insert(0, str(WEBAPP_DIR))
sys.path.insert(0, str(REPO_ROOT / "shared" / "manim-lib"))

import jobs  # noqa: E402
import read_model  # noqa: E402

app = FastAPI(title="Video Scenario & Manim Review Platform")
app.mount("/static", StaticFiles(directory=str(WEBAPP_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(WEBAPP_DIR / "templates"))


def _project_dir(slug: str) -> Path:
    return read_model.PROJECTS_DIR / slug


def _get_project_or_404(slug: str) -> read_model.ProjectDetail:
    try:
        return read_model.get_project(slug)
    except read_model.ProjectNotFoundError:
        raise HTTPException(status_code=404, detail=f"No such project: {slug}")


@app.get("/")
def index(request: Request):
    projects = read_model.list_projects()
    return templates.TemplateResponse(
        request, "index.html", {"projects": projects}
    )


@app.get("/projects/{slug}")
def project_default_lang(slug: str):
    project = _get_project_or_404(slug)
    if not project.languages:
        raise HTTPException(status_code=404, detail=f"Project {slug} has no languages yet")
    from starlette.responses import RedirectResponse

    return RedirectResponse(url=f"/projects/{slug}/{project.languages[0]}")


@app.get("/projects/{slug}/{lang}")
def project_detail(request: Request, slug: str, lang: str):
    project = _get_project_or_404(slug)
    if lang not in project.languages:
        raise HTTPException(status_code=404, detail=f"Project {slug} has no language '{lang}'")
    scenario = read_model.get_scenario(slug, lang)
    renders = {r.scene: r for r in read_model.list_renders(slug, lang)}
    return templates.TemplateResponse(
        request,
        "project.html",
        {
            "project": project,
            "lang": lang,
            "scenario": scenario,
            "renders": renders,
        },
    )


@app.get("/media/{slug}/{lang}/{filename}")
def media(slug: str, lang: str, filename: str):
    _get_project_or_404(slug)
    path = _project_dir(slug) / "assets" / "renders" / lang / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="No such render")
    # Starlette's FileResponse handles Range headers itself, so scrubbing
    # in the <video> element works without loading the whole file.
    return FileResponse(
        str(path),
        media_type="video/mp4",
        filename=filename,
        content_disposition_type="inline",
    )


class RenderRequest(BaseModel):
    scene: str | None = None  # None or "all" => every scene
    lang: str | None = None  # None or "all" => every language
    quality: str = "l"


@app.post("/api/projects/{slug}/render")
def trigger_render(slug: str, payload: RenderRequest):
    project = _get_project_or_404(slug)

    scenes = None
    if payload.scene and payload.scene != "all":
        if payload.scene not in project.scenes:
            raise HTTPException(status_code=400, detail=f"No such scene: {payload.scene}")
        scenes = [payload.scene]

    langs = None
    if payload.lang and payload.lang != "all":
        langs = [payload.lang]

    job = jobs.start_render_job(
        slug, _project_dir(slug), scenes=scenes, langs=langs, quality=payload.quality
    )
    return {"job_id": job.id}


@app.get("/api/jobs/{job_id}")
def job_status(job_id: str):
    job = jobs.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="No such job")
    return {"id": job.id, "status": job.status, "lines": job.lines}


@app.get("/api/jobs/{job_id}/stream")
def job_stream(job_id: str):
    job = jobs.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="No such job")

    def event_source():
        for line in jobs.stream_job_lines(job_id):
            # SSE "data:" fields can't contain raw newlines; our lines are
            # already single physical lines from the subprocess.
            yield f"data: {line}\n\n"
        final = jobs.get_job(job_id)
        status = final.status if final else "failed"
        yield f"event: done\ndata: {status}\n\n"

    return StreamingResponse(event_source(), media_type="text/event-stream")

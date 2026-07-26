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
sys.path.insert(0, str(REPO_ROOT / "shared" / "ai-lib"))

import jobs  # noqa: E402
import project_scaffolder  # noqa: E402
import project_writer  # noqa: E402
import read_model  # noqa: E402
import render_pipeline  # noqa: E402
import scenario_editor  # noqa: E402
import scenario_reviser  # noqa: E402
import scene_editor  # noqa: E402
import scene_reviser  # noqa: E402
import validate  # noqa: E402

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


def _get_section_or_404(
    slug: str, lang: str, section_id: str
) -> tuple[read_model.ScenarioSection, str]:
    """Returns (section, header) where header is the exact "## " text the
    section's header line matches in scenario-outline.md /
    scenario.<lang>.md — reconstructed from section_id + title, which is
    exactly how read_model.get_scenario parsed it in the first place.
    """
    scenario = read_model.get_scenario(slug, lang)
    for section in scenario.sections:
        if section.section_id == section_id:
            return section, f"{section.section_id}. {section.title}"
    raise HTTPException(status_code=404, detail=f"No such section: {section_id}")


@app.get("/")
def index(request: Request):
    projects = read_model.list_projects()
    return templates.TemplateResponse(
        request, "index.html", {"projects": projects}
    )


class NewProjectRequest(BaseModel):
    idea: str
    target_length_seconds: int = 600
    languages: list[str] = ["en"]


@app.post("/api/projects/new")
def create_project(payload: NewProjectRequest):
    idea = payload.idea.strip()
    if not idea:
        raise HTTPException(status_code=400, detail="idea is required")
    languages = [lang.strip() for lang in payload.languages if lang.strip()]
    if not languages:
        raise HTTPException(status_code=400, detail="at least one language is required")

    try:
        draft, errors = project_scaffolder.propose_new_project(
            idea=idea, target_length_seconds=payload.target_length_seconds, languages=languages
        )
    except Exception as exc:  # e.g. missing API key/model, network failure
        raise HTTPException(status_code=502, detail=f"AI request failed: {exc}")

    if draft is None or errors:
        raise HTTPException(
            status_code=422,
            detail="Draft failed validation, even after one retry: " + "; ".join(errors),
        )

    idea_slug = project_writer.sanitize_slug(draft.get("slug", ""))
    slug = project_writer.next_project_slug(read_model.PROJECTS_DIR, idea_slug)
    project_writer.write_project(read_model.PROJECTS_DIR, slug, draft, languages)
    read_model.clear_cache()
    return {"slug": slug}


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


@app.get("/media/preview/{slug}/{lang}/{scene}")
def preview_media(slug: str, lang: str, scene: str):
    _get_project_or_404(slug)
    path = render_pipeline.preview_render_path(_project_dir(slug), scene, lang)
    if not path.is_file():
        raise HTTPException(status_code=404, detail="No preview render yet")
    return FileResponse(
        str(path),
        media_type="video/mp4",
        filename=path.name,
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


class ReviseSectionRequest(BaseModel):
    feedback: str


class AcceptSectionRequest(BaseModel):
    body: str


@app.post("/api/projects/{slug}/scenario/{lang}/{section_id}/revise")
def revise_section(slug: str, lang: str, section_id: str, payload: ReviseSectionRequest):
    project = _get_project_or_404(slug)
    if lang not in project.languages:
        raise HTTPException(status_code=404, detail=f"Project {slug} has no language '{lang}'")
    section, header = _get_section_or_404(slug, lang, section_id)
    if section.narration_html is None:
        raise HTTPException(
            status_code=400, detail="This section has no narration yet for this language."
        )

    project_dir = _project_dir(slug)
    outline_text = (project_dir / "scenario" / "scenario-outline.md").read_text()
    lang_path = project_dir / "scenario" / f"scenario.{lang}.md"
    current_body = scenario_editor.get_section_body(lang_path, header)

    try:
        proposed, errors = scenario_reviser.propose_section_revision(
            project_title=project.titles.get(lang, slug),
            outline_text=outline_text,
            lang_text=lang_path.read_text(),
            section_header=header,
            current_body=current_body,
            feedback=payload.feedback,
        )
    except Exception as exc:  # e.g. missing API key/model, network failure
        raise HTTPException(status_code=502, detail=f"AI request failed: {exc}")

    return {"current": current_body, "proposed": proposed, "errors": errors}


@app.post("/api/projects/{slug}/scenario/{lang}/{section_id}/accept")
def accept_section(slug: str, lang: str, section_id: str, payload: AcceptSectionRequest):
    project = _get_project_or_404(slug)
    if lang not in project.languages:
        raise HTTPException(status_code=404, detail=f"Project {slug} has no language '{lang}'")
    _, header = _get_section_or_404(slug, lang, section_id)

    errors = validate.validate_section_body(payload.body)
    if errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))

    project_dir = _project_dir(slug)
    lang_path = project_dir / "scenario" / f"scenario.{lang}.md"
    scenario_editor.replace_section_body(lang_path, header, payload.body)
    read_model.clear_cache()
    return {"ok": True}


class ReviseSceneRequest(BaseModel):
    lang: str
    feedback: str


class PreviewSceneRequest(BaseModel):
    lang: str
    source: str
    quality: str = "l"


class AcceptSceneRequest(BaseModel):
    source: str


@app.post("/api/projects/{slug}/scenes/{scene}/revise")
def revise_scene(slug: str, scene: str, payload: ReviseSceneRequest):
    project = _get_project_or_404(slug)
    if scene not in project.scenes:
        raise HTTPException(status_code=404, detail=f"No such scene: {scene}")
    if payload.lang not in project.languages:
        raise HTTPException(status_code=404, detail=f"Project {slug} has no language '{payload.lang}'")

    project_dir = _project_dir(slug)
    theme_source = (REPO_ROOT / "shared" / "manim-lib" / "theme.py").read_text()
    current_source = scene_editor.get_scene_source(project_dir, scene)

    try:
        proposed, errors = scene_reviser.propose_scene_revision(
            project_title=project.titles.get(payload.lang, slug),
            scene=scene,
            theme_source=theme_source,
            current_source=current_source,
            feedback=payload.feedback,
        )
    except Exception as exc:  # e.g. missing API key/model, network failure
        raise HTTPException(status_code=502, detail=f"AI request failed: {exc}")

    return {"current": current_source, "proposed": proposed, "errors": errors}


@app.post("/api/projects/{slug}/scenes/{scene}/preview")
def preview_scene(slug: str, scene: str, payload: PreviewSceneRequest):
    project = _get_project_or_404(slug)
    if scene not in project.scenes:
        raise HTTPException(status_code=404, detail=f"No such scene: {scene}")
    if payload.lang not in project.languages:
        raise HTTPException(status_code=404, detail=f"Project {slug} has no language '{payload.lang}'")

    errors = validate.validate_scene_source(payload.source)
    if errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))

    job = jobs.start_preview_job(
        slug, _project_dir(slug), scene, payload.lang, payload.source, payload.quality
    )
    return {"job_id": job.id}


@app.post("/api/projects/{slug}/scenes/{scene}/accept")
def accept_scene(slug: str, scene: str, payload: AcceptSceneRequest):
    project = _get_project_or_404(slug)
    if scene not in project.scenes:
        raise HTTPException(status_code=404, detail=f"No such scene: {scene}")

    errors = validate.validate_scene_source(payload.source)
    if errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))

    project_dir = _project_dir(slug)
    scene_editor.write_scene_source(project_dir, scene, payload.source)
    read_model.clear_cache()

    # The accepted source is now what's on disk under manim/scenes/ — kick
    # off a real re-render (every language) through the same job machinery
    # the "Re-render" buttons use, so assets/renders/ doesn't go stale
    # until someone happens to re-render manually.
    job = jobs.start_render_job(slug, project_dir, scenes=[scene], langs=None, quality="l")
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

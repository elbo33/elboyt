# Web app

FastAPI + Jinja2 + vanilla JS. No frontend build step — `static/` is served
as-is.

## Run

From the repo root, with the venv active:

```
python -m uvicorn webapp.app:app --app-dir webapp --reload
```

Then open http://127.0.0.1:8000. `--reload` is handy while developing the
platform itself; drop it for normal day-to-day use. The process is
stateless (all state lives on disk under `projects/`), so it's fine to
start it fresh each session and stop it with Ctrl-C when you're done — it
does not need to stay running in the background.

## Layout

- `read_model.py` — pure read-only access to `projects/` (Milestone 2). No
  FastAPI imports; safe to import and test standalone.
- `jobs.py` — in-memory render job tracking. Drives
  `shared/manim-lib/render_pipeline.render_all` on a background thread per
  request and fans its log lines out to an SSE stream. Owns no rendering or
  cleanup logic itself.
- `app.py` — routes. Renders templates, serves `/media/...` with byte-range
  support (via Starlette's `FileResponse`), and exposes the render-trigger +
  SSE endpoints that `static/app.js` calls into.
- `templates/`, `static/` — server-rendered pages + the vanilla JS that
  wires up the re-render buttons and log panel.

## Tests

```
python -m pytest webapp/tests
```

Only `read_model.py` is unit-tested — it's the part worth testing in
isolation. `app.py`/`jobs.py` are thin enough that manual/browser testing
covers them.

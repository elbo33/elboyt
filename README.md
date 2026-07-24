# Video Scenario & Manim Review Platform

A small local web app + CLI for browsing, reading, and re-rendering the source
material behind coding-concept YouTube videos: written **scenarios** (timed,
per-language narration scripts) and **Manim renders** (language-agnostic
animation logic with per-language on-screen text).

This is a personal production tool. It is deliberately generic: the platform
code never references a specific video's content. Any folder under
`projects/` that follows the convention below shows up automatically.

## Folder convention

```
projects/
  <NNN-project-slug>/
    project.yaml                 # title per language, status per language
    scenario/
      scenario-outline.md        # language-agnostic: sections, timing, shot types
      scenario.<lang>.md         # one file per language, following the outline
    manim/
      render.py                  # per-project render CLI (thin wrapper, see below)
      scenes/*.py                # animation logic, language-agnostic
      labels/labels_<lang>.py    # per-language text, imported by scenes
    assets/
      renders/<lang>/<scene>.mp4 # final rendered clips per language

shared/
  manim-lib/                     # reusable theme/helpers + the render pipeline
  templates/                     # blank template for scaffolding a new project

webapp/                          # the local web app (Milestone 3)
```

`<NNN-project-slug>` is a zero-padded number + kebab-case slug, e.g.
`001-example-project`. The number gives a stable browse order; the slug keeps
it human-readable. Neither the number nor the slug is parsed for meaning by
the platform — it's purely for humans.

Languages are **never hardcoded** anywhere in the platform. A project's
available languages are discovered at read time from whichever
`scenario.<lang>.md`, `labels_<lang>.py`, and `assets/renders/<lang>/` exist.
Adding a fourth language to a project is just adding those files — no code
change, in that project or the platform.

### `project.yaml`

```yaml
slug: 001-example-project
title:
  en: "Example Project"
  fr: "Projet Exemple"
  pl: "Przykładowy Projekt"
status:
  en: draft      # draft | scripting | recording | editing | published
  fr: draft
  pl: draft
```

`title` and `status` are keyed by language because a video's title translation
and production status can legitimately differ per language (e.g. English
published, French still in editing).

### Scenario files

`scenario/scenario-outline.md` is the **language-agnostic skeleton**: section
IDs, section titles, shot type, and rough timing only. **No narration text.**
Each `scenario/scenario.<lang>.md` follows the exact same section IDs/titles
and supplies the narration for that language. This is what keeps pacing
comparable across languages — a French section that runs much longer than its
English counterpart is immediately visible as a structural mismatch.

Format (parsed by `webapp/read_model.py`, see that file's docstring for the
exact parsing rule):

`scenario-outline.md`:
```markdown
# Example Project — Outline

## 01. Hook
- shot: facecam
- duration: 10s

## 02. Concept Animation
- shot: manim
- scene: intro_hello
- duration: 15s

## 03. Recap
- shot: facecam
- duration: 8s
```

`scenario.en.md`:
```markdown
# Example Project — Script (EN)

## 01. Hook
Hey everyone! Today we're exploring...

## 02. Concept Animation
(Animation carries this beat — see `intro_hello` scene)

## 03. Recap
So that's the idea in a nutshell...
```

Section headers (`## <id>. <Title>`) must match **exactly** (string-for-string
after the `## `) between the outline and every per-language file. That's the
only coupling — it's intentionally simple text matching, not a schema.

Valid `shot` values: `facecam`, `manim`, `screen`. When `shot: manim`, the
`scene:` key names the scene (matching a file under `manim/scenes/`) so the
platform can link the section directly to its render.

### Manim scenes & labels

* Scene files in `manim/scenes/*.py` contain **only animation logic** — never
  hardcoded on-screen strings. Text always comes from a `LABELS` dict.
* Each scene resolves its language at render time via the `SCENE_LANG`
  environment variable (set by the render pipeline) and dynamically imports
  `manim/labels/labels_<lang>.py`, e.g.:

  ```python
  import os, importlib
  LANG = os.environ.get("SCENE_LANG", "en")
  LABELS = importlib.import_module(f"labels.labels_{LANG}").LABELS
  ```
* `manim/labels/labels_<lang>.py` exports a single `LABELS` dict of string
  keys to translated strings. Adding a language to a scene means adding one
  `labels_<lang>.py` file — the scene code doesn't change.
* Reusable animation building blocks (color theme, common Mobject helpers)
  live in `shared/manim-lib/` and are imported the same way by every project
  (see "Python import wiring" below) — never copy-pasted per project.

### Renders

Final clips always land at the single predictable path
`projects/<slug>/assets/renders/<lang>/<scene>.mp4`. Nothing else is kept on
disk after a render — see the cleanup requirement below.

## ⚠️ Render cleanup requirement (critical)

Every time a scene is re-rendered for a given language, the **previous**
render of that exact scene+language is deleted, and Manim's intermediate
cache (partial movie files, tex cache, per-quality media folders) is deleted
after every render, success or failure. Disk usage stays flat as you iterate
on a scene — it never grows with re-renders.

This is implemented **once**, in `shared/manim-lib/render_pipeline.py`
(`render_scene_for_language`). Both entry points call into this exact same
function — neither reimplements the cleanup:

* the per-project CLI, `projects/<slug>/manim/render.py`
* the web app's re-render endpoint, `webapp/app.py`

Do not add a second implementation of this logic anywhere else.

## Python import wiring

`shared/manim-lib/` is a plain directory on `sys.path` (its name has a
hyphen, so it's never imported as a package — only the `.py` files inside it
are imported directly, e.g. `import render_pipeline`, `import theme`). The
render pipeline puts both `<project>/manim/` and `shared/manim-lib/` on
`PYTHONPATH` before invoking Manim, so scene files can do
`from theme import ...` and `from labels.labels_xx import LABELS` without any
path hacking of their own.

## Adding a new project

1. Copy `shared/templates/project-template/` to
   `projects/<NNN-project-slug>/`.
2. Fill in `project.yaml`.
3. Write `scenario/scenario-outline.md`, then one `scenario.<lang>.md` per
   language.
4. Add scene(s) under `manim/scenes/`, and one `labels/labels_<lang>.py` per
   language per scene's needs.
5. Run `python manim/render.py` inside the project (or use the web app) to
   render. Nothing else to register — the platform discovers the project the
   next time it scans `projects/`.

## What's intentionally NOT committed

Raw video/audio, rendered `assets/renders/**/*.mp4` clips, and Manim's
intermediate render cache are all excluded via `.gitignore` — see that file.
They're large and fully reproducible from the scenario/scene/label source
files, which are the things actually worth version-controlling.

## Running the platform

See `webapp/README.md` for day-to-day run instructions once Milestone 3 is
built.

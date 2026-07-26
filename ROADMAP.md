# Roadmap: AI-assisted authoring

Milestones 1–3 (data convention, read-only web app, re-render UI) are done.
This is the plan for the next stretch: using an LLM to help write and revise
scenarios and Manim scenes, instead of doing all of it by hand.

Everything here is grounded in two invariants the rest of the platform
already depends on and that AI-generated output must never break:

- Section headers (`## NN. Title`) must match **exactly**, character for
  character, between `scenario-outline.md` and every `scenario.<lang>.md` —
  that's how `read_model.py` links them.
- Scene files (`manim/scenes/*.py`) contain only animation logic; all
  on-screen text comes from `LABELS[...]`, imported from
  `manim/labels/labels_<lang>.py`. Never hardcode strings in a scene.

Any AI writer/editor has to be told these rules and validated against them
mechanically before its output is trusted — this is why Milestone 4 exists
before any generation happens.

## Milestone 4 — AI foundations (no UI yet) — done

Goal: one shared way to call an LLM, plus the "house style" document every
call is grounded in. Nothing user-facing changes yet.

- `shared/ai-lib/llm_client.py` — thin wrapper: `generate(system, user) ->
  str`, calling OpenAI's chat completions API. Reads `OPENAI_API_KEY` and
  `ELBOYT_LLM_MODEL` from the environment — no default model, so it never
  silently calls one you didn't choose. All OpenAI-specific code lives in
  this one file; swapping providers later means changing only this file.
- `shared/prompts/video_style_guide.md` — the master prompt (see below).
  Loaded via `shared/ai-lib/style_guide.py` and prepended to every system
  prompt the AI features send.
- `shared/ai-lib/validate.py` — structural checks reused by every milestone
  below instead of reimplemented per feature (same pattern as
  `render_pipeline.py`): `validate_section_body` (a proposed scenario
  section can't contain a `"## "` line — that's `read_model.py`'s section
  boundary marker) and `validate_scene_source` (must parse as Python,
  exactly one `Scene` subclass, no hardcoded strings passed to
  `Text`/`Tex`/`styled_title`/`styled_body`/etc. instead of a
  `LABELS[...]` lookup).
- `shared/ai-lib/try_prompt.py` — CLI smoke test:
  `OPENAI_API_KEY=... ELBOYT_LLM_MODEL=... python shared/ai-lib/try_prompt.py "..."`,
  to sanity-check the client against a real key without the webapp running.

**To actually use it:** set `OPENAI_API_KEY` and `ELBOYT_LLM_MODEL` (e.g.
`export OPENAI_API_KEY=sk-...` and `export ELBOYT_LLM_MODEL=gpt-4.1`, or
whichever model your account has access to) before Milestone 5/6/7 code
calls `llm_client.generate()`.

## Milestone 5 — AI-assisted scenario rewrite — done

Goal: select a section of a scenario, describe what's wrong in a free-text
prompt, get back a revised narration for that section/language.

- Webapp: "Improve with AI" action on each scenario section in
  `project.html`, wired up in `static/app.js`.
- `POST /api/projects/{slug}/scenario/{lang}/{section_id}/revise` — takes
  the user's feedback string, sends {style guide + full scenario context for
  pacing + the one section + the feedback} to the LLM via
  `shared/ai-lib/scenario_reviser.py`, gets back proposed replacement text
  for that section's body only, validated by Milestone 4's
  `validate_section_body`.
- `POST /api/projects/{slug}/scenario/{lang}/{section_id}/accept` — re-runs
  the same validator server-side (never trusts the client), then writes via
  `webapp/scenario_editor.py`, which does line-level text surgery so only
  the target section's body changes — verified to produce a minimal diff
  identical to a hand-edit, not a whole-file reformat.
- Diff view (current vs. proposed, proposed editable) in the UI; accept
  writes to `scenario.<lang>.md`, discard touches nothing. No auto-apply —
  every AI edit is a proposal until a human clicks accept.

Verified end to end: unit-tested `scenario_editor.py`'s read/write against
the real tic-tac-toe project (minimal diffs, EOF edge case, error path),
exercised the full revise→accept HTTP flow with FastAPI's `TestClient` and
a mocked model response (successful accept, rejected-proposal-blocks-accept,
unknown-section 404), and browser-tested the UI with Playwright in both
light and dark mode — caught and fixed a `[hidden]`-vs-CSS-specificity bug
where the diff/accept panel was visible before "Propose revision" was ever
clicked.

## Milestone 6 — AI-assisted Manim scene rewrite — done

Goal: same idea, for a scene's animation code. Higher risk than M5 because
it's editing code, so this milestone adds a render-to-preview step M5
didn't need.

- "Improve with AI" action on each scene card in the Renders section.
- `POST /api/projects/{slug}/scenes/{scene}/revise` sends {style guide +
  `theme.py` source + current scene source + feedback} to the LLM via
  `shared/ai-lib/scene_reviser.py`, gets back a full replacement scene
  file, validated by Milestone 4's `validate_scene_source` (parses as
  Python, exactly one `Scene` subclass, every on-screen string is a
  `LABELS[...]` lookup — new keys aren't allowed, to avoid the separate
  problem of syncing a new key across every language's labels file).
- `render_pipeline.py` gained `render_scene_preview()` / `preview_render_path()`,
  sharing its subprocess-running core (extracted into `_invoke_manim`, via
  `yield from` per PEP 380) with the original `render_scene_for_language` —
  one render implementation, two callers, exactly like the shared-pipeline
  principle the README already establishes. A preview renders the
  *proposed* source (written to a scratch file, never to
  `manim/scenes/`) into `.preview-cache/<lang>/<scene>.mp4`, completely
  outside `assets/renders/`.
- `POST /api/projects/{slug}/scenes/{scene}/preview` runs this as a
  background job (`jobs.start_preview_job`, same `Job`/SSE machinery as
  real renders) and the UI shows it in the same render-log panel the
  "Re-render" buttons use, ending with a playable preview `<video>`.
- `POST /api/projects/{slug}/scenes/{scene}/accept` re-validates
  server-side, writes to `manim/scenes/<scene>.py` via
  `webapp/scene_editor.py`, then immediately kicks off a real re-render
  (`jobs.start_render_job`) so `assets/renders/` doesn't go stale.
- Reject/discard touches nothing — a proposal only ever becomes a real
  file via the accept endpoint.

Verified end to end: re-ran the pre-refactor render smoke test to confirm
`_invoke_manim` extraction didn't change `render_scene_for_language`'s
behavior; ran a real `render_scene_preview()` call directly (proposed
source rendered, real `manim/scenes/` file untouched, scratch dir cleaned
up); drove the full revise→preview→accept HTTP flow with `TestClient`
including a real manim subprocess render triggered from the accept
endpoint; and browser-tested the actual buttons with Playwright — which
caught a real layout bug: a fixed `1fr 1fr` diff grid (fine in M5's wide
scenario cards) silently overflowed and hid the entire "proposed" column
in M6's much narrower scene cards. Fixed with `grid-template-columns:
repeat(auto-fit, minmax(200px, 1fr))` plus `min-width: 0` on the grid
items, which responds to the *container's* width instead of the
viewport's — verified both the narrow scene-card case (stacks to one
column) and the wide scenario-card case (still two columns, unchanged)
render correctly.

## Milestone 7 — AI project scaffolding from an idea — done

Goal: "New project" flow — type an idea + target length + languages, get a
full draft project written into `projects/<NNN-slug>/`, following the
folder convention exactly, ready to open in the webapp and iterate on with
M5/M6.

- Webapp: a "+ New project with AI" form on the project list page — idea
  text, target length (minutes), a comma-separated language list.
- The model replies with **one JSON object** describing every file at
  once (`shared/ai-lib/project_scaffolder.py`), not several independent
  free-text files — that's what guarantees the two things that actually
  matter (section headers matching exactly between the outline and every
  language's script; every `LABELS[...]` key a scene uses existing in
  every language's labels) *by construction*, instead of hoping several
  separate generations agree with each other. `llm_client.generate()`
  gained a `json_mode` flag (OpenAI's JSON mode: guarantees syntactically
  valid JSON, not any particular shape).
- `validate_new_project()` (Milestone 4's `validate.py`) checks the parsed
  draft: every `shot: manim` section names a defined scene and vice versa,
  every scene passes the same `validate_scene_source` checks M6 uses
  (now also requiring the SCENE_LANG/LABELS boilerplate to literally be
  present), and every `LABELS[...]` key a scene references exists in
  every requested language's labels. On failure, `propose_new_project()`
  retries once, feeding the previous attempt and its exact errors back to
  the model; if it still fails, the errors are surfaced to the human
  rather than writing something broken.
- `webapp/project_writer.py` assembles a validated draft into real files —
  `project.yaml`, `scenario-outline.md`, one `scenario.<lang>.md` per
  language, one `.py` per scene, one `labels_<lang>.py` per language, and
  the same identical `render.py` CLI every other project has (copied from
  `shared/templates/project-template/`, not regenerated) — under a
  `<NNN>-<slug>` directory numbered one past the highest existing project.
- This was the biggest milestone — it's doing M5+M6's job for an entire
  project in one shot — so it shipped last, after the smaller, safer
  edit-in-place flows had already proven the validator patterns out.

Verified end to end: hand-built a realistic two-language draft (matching
exactly what `propose_new_project()` asks the model for) and ran it
through the real writer — inspected every generated file for convention
correctness, confirmed `read_model.py` parses the result exactly like a
hand-authored project (right languages, right sections, right scene
list), and rendered the draft's stub scene for real in both languages.
Repeated the same check via the actual `POST /api/projects/new` endpoint
with a mocked model response (success path, and the malformed/empty-input/
no-language error paths — confirmed no stray project directories are ever
left behind on failure). Browser-tested the actual form with Playwright
in both light and dark mode: the real error path (no `ELBOYT_LLM_MODEL`
configured) surfaces cleanly and re-enables the form, and a
network-mocked success response correctly redirects to the new project's
page.

## Milestone 8 — stretch, not scheduled yet

Ideas to revisit once 4–7 are in daily use and their rough edges are known:
per-section prompt/revision history, token-usage/cost display in the UI,
a "balance pacing across languages" check (flag a language whose section
runs much longer/shorter than the others), regenerate-with-different-seed
for a second option instead of just accept/reject.

## How "test it" fits in

Milestones 4–7 are all built and tested end to end — but every real *test*
except one has used a mocked or hand-built model response, because a live
call needs `ELBOYT_LLM_MODEL` set (see Milestone 4). Two independent things
are still worth doing once that's set:

1. Sanity-check the master prompt itself. `projects/002-tic-tac-toe-ai/`
   was built by hand, exactly the way the style guide instructs an LLM to
   build one, as a way to validate the *style guide's* rules before ever
   spending a real API call on them. If a rule in
   [shared/prompts/video_style_guide.md](shared/prompts/video_style_guide.md)
   needs adding or loosening, it'll show up while writing a project like
   that one — fix the guide there rather than special-casing a project.
2. Confirm a real model actually follows the mechanical rules the
   validators enforce (exact header matching, LABELS-only text, valid
   Python, matching label keys) closely enough that Milestone 7's
   retry-once is rarely needed in practice — that's only observable with
   real generations, not mocked ones.

**Done, with `gpt-4.1`.** `try_prompt.py` and real M5/M6/M7 calls all
worked. M5 (revise `002-tic-tac-toe-ai`'s cold open) came back punchier,
on-brief, and valid on the first try. M6 (revise `title_card`'s animation)
came back with valid, correctly-styled Python that rendered clean on the
first try. M7 (scaffold a 90s hash-map explainer) passed structural
validation on the first attempt both times it was run — sections summed to
exactly the 90s target, and all 3 real scenes rendered.

But real generation surfaced something no amount of mocked testing could:
the model's first M7 attempt used `PALETTE["blue"]`, `PALETTE["yellow"]`,
`PALETTE["green"]` — plausible color names that don't exist in the real
`shared/manim-lib/theme.py` (only `background`/`foreground`/`accent`/
`highlight`/`muted`). `validate_scene_source` checked `LABELS[...]` key
existence but never checked `PALETTE[...]` the same way, so this passed
validation and only failed as a `KeyError` at actual render time — the
exact class of bug the validator exists to catch before a human ever sees
it. Fixed: `validate.py` now reads `theme.py`'s real `PALETTE` dict
directly (so it can never drift out of sync with it) and flags any
`PALETTE["unknown_key"]` the same way it already flags unknown `LABELS`
keys. Re-verified against the buggy scene (now caught) and every existing
real scene (still passes). A second, independent M7 run on the identical
idea never hit this at all — it defensively wrote
`PALETTE.get("accent") or ... or next(iter(PALETTE.values()))` instead of
a literal key.

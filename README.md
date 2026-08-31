# elboyt

Local math video production pipeline for the Polish Matura course.

elboyt now owns the committed curriculum data it renders from:

- `topics/teaching_sections.yaml` - ordered ZasPro teaching sections
- `topics/curriculum_matematyka.yaml` - source curriculum seed copy
- `knowledge/sections/*.yaml` - approved section knowledge specs
- `exercises/*.yaml` - approved generated exercise banks

The renderer reads those files directly. A sibling `ZasPro` checkout is no
longer required for normal generation, though `ZASPRO_DIR` can still point at an
external checkout for comparison or temporary overrides.

## Pipeline

```sh
npm run next
npm run generate:next
npm run publish:ready

npm run generate -- <section> <type> [stage]
npm run publish  -- <section> <type> [stage]
```

`type` is one of:

- `theory`
- `exercises`
- `mistakes`
- `challenge`

`stage` is one of:

- `longform` (default)
- `shorts`
- `stills`

Generation writes scratch output to `generated/` and stops for review. Publish
copies the approved output into `library/videos/<section>/<type>/`, writes the
reproducer files, then wipes scratch output.

`npm run next` reads the local teaching-section order and reports the next
missing section/type/stage. If `generated/.ready.json` exists, it stops on that
review gate instead of advancing.

## Current State

The production queue is implemented, but generic render planners are not built
yet. Old one-off topic authoring has been removed.

The next useful step is to build a generic planner layer that maps the local
ZasPro YAML into reusable longform, shorts, and still-card plans section by
section.

## Requirements

Node 18+, `ffmpeg`/`ffprobe`, a Python environment with Manim 0.21 + Pillow, and
LaTeX for `MathTex`.

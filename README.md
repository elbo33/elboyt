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

Operator model:

- Codex chat is the production operator. The user asks Codex for the next video,
  changes to a render, a retry, voiceover, shorts, stills, or publish.
- The local dashboard is the review surface. It shows generated artifacts,
  pipeline state, logs, and approval buttons, but the main creative direction
  still happens in Codex chat.
- Renders are created locally by the repo. The dashboard does not replace Codex;
  it lets the user see and accept what Codex generated.

```sh
npm run next
npm run generate:next
npm run voiceover:ready
npm run publish:ready
npm run dashboard

npm run generate -- <section> <type> [stage]
npm run publish  -- <section> <type> [stage]
npm run voiceover:test
npm run visual:review
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

Generation writes silent scratch output to `generated/` and stops for visual
review. After the render is accepted, `npm run voiceover:ready` sends the
generated narration to ElevenLabs, muxes it onto the approved longform/shorts
MP4, and stops for one more review. Publish copies the approved output into
`library/videos/<section>/<type>/`, writes the reproducer files, then wipes
scratch output.

`npm run next` reads the local teaching-section order and reports the next
missing section/type/stage. If `generated/.ready.json` exists, it stops on that
review gate instead of advancing.

`npm run voiceover:test` creates `voiceover-speed-test.mp3` and
`voiceover-speed-test.md` at the repo root so the ElevenLabs voice settings can
be checked before spending tokens on a full episode. The current accepted
Polish calibration is 53 words in 24.80 seconds, which is 128.2 WPM. Future
scripts should use that as the narration budget unless a new calibration report
replaces it.

`npm run visual:review` extracts three PNGs per rendered Manim scene into
`generated/scene-previews/`: early, middle and late. It also writes
`contact-sheet.jpg`. Use it before voiceover to check overlap, crowded formulas,
title/tag spacing and off-frame content. A render is not acceptable if the
top-left chapter tag touches or visually competes with the scene title,
problem statement, formula strip, or any other fixed text.

Long-form theory generation also renders three thumbnails: one clean topic
thumbnail and two centered matura-hook variants. `thumbnail.png` is the
canonical first thumbnail; `thumbnail-1.png`, `thumbnail-2.png`, and
`thumbnail-3.png` are published into the library for review.

`npm run dashboard` starts a local browser dashboard at
`http://localhost:4317`. It shows the next queue target, the generated review
artifacts, a visual pipeline state, job logs, and the full section/type/stage
progress grid. Its buttons call the same gated commands as the Codex-operated
terminal flow.

The intended production order is:

1. User asks Codex chat for the next long-form video.
2. Codex prepares or updates the plan, then runs the local render command.
3. User reviews the silent render in the dashboard.
4. If rejected, Codex iterates the plan/render.
5. If accepted, Codex runs `voiceover:ready`.
6. User reviews the voiced render in the dashboard.
7. If accepted, Codex publishes it.
8. Codex then moves to shorts and stills for the same topic, each with its own
   review gate.

Current operating mode:

- For now the production queue advances only through theory long-form videos:
  `type=theory`, `stage=longform`. Shorts, stills, exercises, mistakes and
  challenges can still be generated manually, but they are not selected by
  `npm run next` or `npm run generate:next`.

Long-form direction rules:

- Start narration with a natural greeting and a clear introduction to the
  episode.
- Keep on-screen text sparse. The narration complements the video and carries
  the explanation; the screen should show formulas, labels and graphics.
- Rewrite narration after the ffprobe timing pass so each section covers its
  measured scene duration at the saved Koras speed, 128.2 WPM. Underfilled
  narration is a hard render failure, because there must be no silent gaps
  before voiceover.
- Keep visuals active but not frantic: use purposeful reveals, highlights,
  traces and transforms, and avoid long stretches where nothing changes.
- Review `generated/scene-previews/contact-sheet.jpg` before approving a visual
  render for voiceover.

Short-format direction rules:

- Derivative shorts must inherit the approved longform visual language. Do not
  create a separate reel-only style; use the same dark grid, colors, math
  objects, scene archetypes, and worked-example template in vertical format.
- The rejected six-reel formula-stack/axis renderer must not be recreated.
- Every short reuses the exact extracted longform narration for its source
  scene(s), so the approved longform audio can be reused later.
- The only intentional visual difference from longform is the opening label
  text itself. Replace the existing first label, for example the
  `stage_figure(... question="...")` line; for `stage_derivation`, pass the
  same label through its `question` option. Every short must have this opening
  label. Do not add a second overlay label. The replacement should be
  controversial and matura-focused, for example:
  "Bez tego NIE ZDASZ matury. Kropka.", "Ten temat oblewa połowę
  maturzystów", "90% zdających maturę o tym nie wie", "To pytanie jest na
  KAŻDEJ maturze", "Egzaminator na maturze liczy, że tego nie znasz",
  "Robisz to źle na maturze i nawet nie wiesz". Do not change the rest of the
  short's longform-derived visual scene for the sake of the hook.
- Keep animation active but not chaotic: no irrelevant frozen frames, no
  constant pulsing, and no overlapping objects or labels.

## Current State

The production queue and generic render planners are implemented. They turn the
local ZasPro YAML into baseline longform storyboards, default shorts, and quiz
still specs. Old one-off topic authoring has been removed.

The next useful step is to run one full section through review and improve the
generic visual/narration grammar from that concrete output.

## Requirements

Node 18+, `ffmpeg`/`ffprobe`, a Python environment with Manim 0.21 + Pillow, and
LaTeX for `MathTex`.

# elboyt — AI math video pipeline

One local, AI-directed pipeline that turns a "why is this true?" question into a
premium **silent** mathematical video (Manim scenes → Remotion final cut →
FFmpeg), then cascades that episode into vertical shorts and 1:1 quiz stills.
The committed ZasPro YAML in this repo is the source of truth; `library/` is the
ledger of finished renders.

The course: every ZasPro teaching section (62 of them) gets four videos, in
order: **THEORY → EXERCISES → COMMON_MISTAKES → CHALLENGE**. Each type has its
own fixed, deliberately repetitive scene skeleton. The operator drives it one
step at a time: name a section and a type, the pipeline produces that piece.

| Path | What it is |
|---|---|
| `src/` | The whole pipeline: `planning/` (planners + section authoring), `manim/` (archetypes, templates, `stage_thumbnail`), `remotion/` (final cut), `rendering/`, `script/`, `cli/`. |
| `topics/` | Ordered teaching sections and the source curriculum seed copied from ZasPro. |
| `knowledge/sections/` | Approved ZasPro knowledge specs, one YAML file per teaching section. |
| `exercises/` | Approved ZasPro exercise banks, one YAML file per teaching section. |
| `src/manim/*.py` | Format-parameterised: one set of archetypes renders 16:9, 9:16 and the 1:1 still. `MANIM_FORMAT` selects. |
| `generated/`, `public/` | Scratch. Wiped on publish. Never source of truth. |
| `library/` | The ledger: what is on disk is what has been made. Layout below. |
| `prompts/director.md` | The creative brief. Read it before authoring scenes. |

## Library layout

Grouped by section, then type. The four episodes of a section live together.
Shorts and stills nest under the episode they derive from.

```
library/videos/<section>/<type>/          type = theory | exercises | mistakes | challenge
  <section>-<polish>.mp4                   teoria / zadania / bledy / wyzwanie
  script.md                               word-for-word narration, generated from the storyboard
  thumbnail.png                           1920x1080, ThumbA-flat style (see .thumbs-preview/)
  render/                                  planner + section source + storyboard.json + scenes/*.py (+ support/) + COMMAND.md
  shorts/<slug>/                          <slug>.mp4 + script.md + render/
  stills/                                 *.png + *.md + render/
```

`git` carries the reproducers under `render/` (planner, Manim sources,
storyboard, COMMAND.md). The `.mp4` / `.png` renders live on disk only
(`.gitignore` blocks them everywhere, `library/` included).

## Commands

Codex chat is the production operator for this repo. The user asks Codex to plan,
render, revise, voice, publish, and continue. The browser dashboard is the
review and approval surface where the user can inspect artifacts and see state;
it is not the primary creative chat interface.

```
npm run next
npm run generate:next
npm run voiceover:ready
npm run publish:ready
npm run dashboard

npm run generate -- <section> <type> [stage]     stage = longform (default) | shorts | stills
npm run publish  -- <section> <type> [stage]
npm run voiceover:test
```

- `next` reads `topics/teaching_sections.yaml`, scans the fixed order
  `theory → exercises → mistakes → challenge` and `longform → shorts → stills`,
  and reports the first missing approved artifact in `library/`.
- `generate:next` runs that target and stops at the review gate.
- `voiceover:ready` is run only after the visual render is accepted. It sends
  the generated storyboard narration to ElevenLabs, adds the returned audio to
  generated long-form videos or shorts, and stops for a second review.
- `publish:ready` reads `generated/.ready.json` and publishes exactly that
  staged target.
- `dashboard` starts the local browser dashboard at `http://localhost:4317`.
  It shows queue status, review artifacts, stage progress, job logs, and buttons
  that call the same gated commands. Treat dashboard approvals as user approval;
  do not bypass them.
- `voiceover:test` makes a short Polish calibration MP3 and root Markdown report
  with duration, word count, and WPM for the configured ElevenLabs voice.
- Polish narration budget is 128.2 WPM for the configured Koras voice, measured
  in `voiceover-speed-test.md` on 2026-08-31. Use
  `src/voiceover/timing.ts` as the code source for timing calculations.
- `generate` renders silent video into `generated/` and **stops**. It never
  writes to `library/`. The long-form stage renders the thumbnail as its last step.
- `publish` copies the approved render from `generated/` into `library/`, writes
  `render/COMMAND.md`, then wipes `generated/` and `public/`.
- `generate -- <section> <type> shorts` renders every short registered for that
  episode (`EPISODE_SHORTS` in `src/planning/shorts/shortsPlanner.ts`); add
  `--short <key>` to do just one.
- Stills specs: `src/planning/stills/<section>/<type>.json` (quiz cards:
  statement + A/B/C/D + comment CTA + `.md` caption). Distractors come from the
  ZasPro COMMON_MISTAKE bank.

No one-off section authoring is registered. The generic planner layer turns the
local ZasPro YAML into baseline theory, exercise, mistake, challenge, short, and
still plans. Treat it as the first systematic render grammar to improve after
reviewing actual output, not as the final authored creative layer.

Active long-form theory structure from 2026-09-14 onward:
`hook -> definition -> example -> matura_connection -> summary`.
The old `intuition` and `why_it_works` bands are no longer part of new project
authoring or generation. They may still appear inside already-published
`library/videos/.../render/storyboard.json` files and historical render sources;
leave those artifacts untouched so previous videos remain reproducible.

## Approval gates

Each stage is gated on the user's approval, in order. Nothing advances,
voices, or publishes without it. A failed approval means iterating on **that**
stage, not moving on.

1. User asks Codex chat for the next long-form video.
2. Codex prepares or revises the director plan and runs the local render command.
3. The silent render sits in `generated/`; user reviews it in the dashboard.
4. If rejected, Codex changes the plan/render and repeats the silent render.
5. If accepted, Codex runs `voiceover:ready`; ElevenLabs is called only here.
6. User reviews the voiced render in the dashboard.
7. If accepted, Codex publishes it into `library/`.
8. Codex then moves to shorts and stills for the same topic, each with its own
   review gate.
9. Only after longform, shorts, and stills are accepted/published is the topic
   done. Codex then asks for or selects the next queue target.

## Golden rules

1. **Renders never go into git.** `.gitignore` blocks every `*.mp4` / `*.mp3` /
   `*.png` / etc., anywhere, `library/` included. Git carries the *planner +
   Manim code + storyboard* that reproduces a piece, never the render itself.
2. **`generated/` and `public/` are scratch.** `publish` wipes them. Nothing in
   them is source of truth.
3. **Only the final render is kept**, and only under
   `library/videos/<section>/<type>/` (and its `shorts/` `stills/`). No
   per-scene clips, Manim `media/` caches, or preview frames — ever. `publish`
   copies `generated/scenes/manim/` (sources) into `render/scenes/`, nothing
   from `generated/scenes/renders/` or `generated/media/`.
4. **Every piece ships a `script.md`** next to its `.mp4`: the exact words a
   narrator would say, one section per scene with an approximate start time. The
   videos are silent; the script is their spoken counterpart and must never
   state anything not shown on screen. It is **generated** from the storyboard's
   per-scene `narration` after the ffprobe pass (`src/script/fromStoryboard.ts`),
   not hand-written.
5. **Narration fills the measured scene time.** Long-form narration starts with
   a natural greeting and episode intro, then complements the visuals for every
   scene. Use the measured Koras voice speed, 128.2 WPM, so there are no silent
   gaps after the voiceover is added. If the render duration changes, rewrite
   the scene narration before calling ElevenLabs.
6. **Visuals stay active but not frantic.** Use sparse on-screen text and
   purposeful visual motion: reveals, highlights, traces, transforms and
   circumscribes. Avoid long stretches where nothing changes unless narration
   is actively explaining a dense visual. Before voiceover, review
   `generated/scene-previews/contact-sheet.jpg` for overlap, crowded formulas,
   title/tag collisions and off-frame content. The review frames must cover
   early, middle and late moments in every scene. Any title, problem statement
   or formula strip that touches or visually competes with the top-left chapter
   tag is a hard rejection.
7. **Language: Polish (pl-PL) by default.** Every new piece — all on-screen text
   *and* its `script.md` — is authored in Polish unless the operator asks
   otherwise. File/folder slugs stay ASCII (`slugify` folds diacritics).
8. Read `prompts/director.md` (the creative brief) before authoring scenes.
9. **No em dashes.** The em dash (`—`) and en dash (`–`) are strictly banned in
   every piece of user-facing text: on-screen Manim strings, `script.md`
   narration, titles, captions, notes, thumbnails. Use a comma, a colon, the
   word "to", parentheses, or rewrite. Mathematical minus (`−` or `-`) is fine;
   it is not a dash.
10. **Numbers as words in `script.md`.** In every narration script, short and
   long, write numbers as Polish words, never digits: "dziesiąty wyraz",
   "równa się siedem", "minus dwadzieścia dziewięć"; never "10", "= 7", "-29".
   Narration only; on-screen math stays in digits. `fromStoryboard.ts` fails
   the render on a rule 7 or 8 violation, including underfilled narration.
11. **Shorts staging.** Derivative shorts must inherit the approved longform
   visual language: same dark grid, colors, math objects, scene archetypes, and
   worked-example template in vertical format. Do not create a separate
   reel-only style. The rejected six-reel formula-stack/axis renderer has been
   removed and should not be recreated. Each short reuses the exact extracted
   longform narration for its source scene(s), so the approved longform audio
   can be reused later. The only intentional visual difference from longform is
   the opening label text itself. Replace the existing first label, for example
   the `stage_figure(... question="...")` line; for `stage_derivation`, pass the
   same label through its `question` option. Every short must have this opening
   label. Do not add a second overlay label. The replacement should be
   controversial and matura-focused, for
   example: "Bez tego NIE ZDASZ matury. Kropka.", "Ten temat oblewa połowę
   maturzystów", "90% zdających maturę o tym nie wie", "To pytanie jest na
   KAŻDEJ maturze", "Egzaminator na maturze liczy, że tego nie znasz",
   "Robisz to źle na maturze i nawet nie wiesz". Do not change the rest of the
   longform-derived visual scene for the sake of the hook. Keep animation active
   but never chaotic: no irrelevant frozen frames, no constant pulsing, and no
   overlapping objects or labels.

## Thumbnail

Rendered as the last step of the long-form stage (`generate ... longform`) into
`generated/thumbnail.png` and `generated/thumbnail-1.png` through
`generated/thumbnail-3.png`, published alongside the `.mp4`. Same ground,
typography and layout as `.thumbs-preview/ThumbA-flat.png` (grid background,
letter-spaced kicker + accent rule, bold caps headline, big ACCENT `MathTex`
formula, optional middle figure); the kicker, headline, figure and formula are
authored per episode as `SectionAuthoring.thumbnail` and
`SectionAuthoring.thumbnailVariants`. The first thumbnail is the clean topic
thumbnail. The other two use centered, catchy or controversial matura hook
sentences; the headline itself must include the exact word `MATURA`, must read
like a real hook sentence rather than a label, and must stay short enough for a
thumbnail, usually 4-7 words split across two or three punchy lines. No em
dashes (rule 7).

## Requirements

Node 18+, `ffmpeg`/`ffprobe` on PATH, a Python env with `manim` 0.21 + Pillow
(`.venv/`, or set `MANIM_PYTHON`). LaTeX (MacTeX) for `MathTex`. The default
curriculum data lives in this repo under `topics/`, `knowledge/sections/`, and
`exercises/`. Set `ZASPRO_DIR` only when intentionally comparing against or
temporarily consuming an external ZasPro checkout.

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

```
npm run next
npm run generate:next
npm run publish:ready

npm run generate -- <section> <type> [stage]     stage = longform (default) | shorts | stills
npm run publish  -- <section> <type> [stage]
```

- `next` reads `topics/teaching_sections.yaml`, scans the fixed order
  `theory → exercises → mistakes → challenge` and `longform → shorts → stills`,
  and reports the first missing approved artifact in `library/`.
- `generate:next` runs that target and stops at the review gate.
- `publish:ready` reads `generated/.ready.json` and publishes exactly that
  staged target.
- `generate` renders into `generated/` and **stops**. It never writes to
  `library/`. The long-form stage renders the thumbnail as its last step.
- `publish` copies the approved render from `generated/` into `library/`, writes
  `render/COMMAND.md`, then wipes `generated/` and `public/`.
- `generate -- <section> <type> shorts` renders every short registered for that
  episode (`EPISODE_SHORTS` in `src/planning/shorts/shortsPlanner.ts`); add
  `--short <key>` to do just one.
- Stills specs: `src/planning/stills/<section>/<type>.json` (quiz cards:
  statement + A/B/C/D + comment CTA + `.md` caption). Distractors come from the
  ZasPro COMMON_MISTAKE bank.

No one-off section authoring is registered. The next production task is the
generic planner layer that turns the local ZasPro YAML into renderable theory,
exercise, mistake, challenge, short, and still plans.

## Approval gates

Each stage is gated on the operator's approval, in order. Nothing advances or
publishes without it. A failed approval means iterating on **that** stage, not
moving on.

1. `generate` long form → it sits in `generated/`. Report it is ready. Stop.
2. Operator approves → `publish` longform → stop. Do not continue to shorts.
3. Operator says go → `generate` shorts → stop.
4. Operator approves → `publish` shorts → stop.
5. Same for stills.
6. Only now is the episode done. Operator picks the next one.

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
5. **Language: Polish (pl-PL) by default.** Every new piece — all on-screen text
   *and* its `script.md` — is authored in Polish unless the operator asks
   otherwise. File/folder slugs stay ASCII (`slugify` folds diacritics).
6. Read `prompts/director.md` (the creative brief) before authoring scenes.
7. **No em dashes.** The em dash (`—`) and en dash (`–`) are strictly banned in
   every piece of user-facing text: on-screen Manim strings, `script.md`
   narration, titles, captions, notes, thumbnails. Use a comma, a colon, the
   word "to", parentheses, or rewrite. Mathematical minus (`−` or `-`) is fine;
   it is not a dash.
8. **Numbers as words in `script.md`.** In every narration script, short and
   long, write numbers as Polish words, never digits: "dziesiąty wyraz",
   "równa się siedem", "minus dwadzieścia dziewięć"; never "10", "= 7", "-29".
   Narration only; on-screen math stays in digits. `fromStoryboard.ts` warns
   loudly on a rule 7 or 8 violation.
9. **Shorts staging.** The retention-hook title is centred (horizontally and as
   a block, every line under the last) via `hook_title()` in
   `src/manim/shorts.py`, not free-placed `Text`. Background is the same
   `add_texture()` grid as the long form, nothing else. Content sits in the
   vertical middle; the bottom 25% stays clear (`ai_math_shorts_bottom_safe_zone`).

## Thumbnail

Rendered as the last step of the long-form stage (`generate ... longform`) into
`generated/thumbnail.png`, published alongside the `.mp4`. Same ground,
typography and layout as `.thumbs-preview/ThumbA-flat.png` (grid background,
letter-spaced kicker + accent rule, bold caps headline, big ACCENT `MathTex`
formula, optional middle figure); the kicker, headline, figure and formula are
authored per episode as `SectionAuthoring.thumbnail` — one `stage_thumbnail(...)`
call in `src/manim/thumbnail.py`. No em dashes (rule 7).

## Requirements

Node 18+, `ffmpeg`/`ffprobe` on PATH, a Python env with `manim` 0.21 + Pillow
(`.venv/`, or set `MANIM_PYTHON`). LaTeX (MacTeX) for `MathTex`. The default
curriculum data lives in this repo under `topics/`, `knowledge/sections/`, and
`exercises/`. Set `ZASPRO_DIR` only when intentionally comparing against or
temporarily consuming an external ZasPro checkout.

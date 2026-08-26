# ai-math-longform-generator — how to proceed

Long-form (8+ min) horizontal math videos. Same visual language as the Shorts
generator; landscape; a **fixed, deliberately repetitive** chapter structure.

**Language: Polish (pl-PL) by default** — all on-screen Manim text and the
`script.md` narration, unless the user asks for a specific video in another
language. Slugs stay ASCII. The existing English `why-is-the-sum-...` video in
`library/videos/` predates this and is not to be changed.

## One command

```bash
npm install
npm run generate -- --planner odd-squares-long \
  "Why is the sum of the first n odd numbers always a perfect square?"
```

Writes `generated/video.mp4` (1920×1080, 30 fps, audio stripped). Also writes
`generated/storyboard.json`, `generated/scenes/`, `generated/frames/`.

## Pipeline (src/cli/generate.ts)

1. Planner builds a `Storyboard` (ordered chapters) + the Manim source for each.
2. Each chapter is rendered with Manim at 1920×1080.
3. **Durations are re-measured from the rendered clips with `ffprobe`** and the
   storyboard is rewritten — planned `durationSeconds` are only estimates.
4. Remotion (`src/remotion/MathLong.tsx`) stitches the chapter clips with an
   overlapping cross-dissolve.
5. Audio track stripped; preview frames extracted.

## Where things live

| Path | Role |
|---|---|
| `src/planning/<name>Planner.ts` | one video: `createStoryboard(topic)` + `getSceneCode(id)`; scene Manim is embedded as `String.raw` strings. Register the planner in `src/cli/generate.ts`. |
| `src/manim/style.py` | `LongScene` base (textured bg + top-left chapter tag), text helpers, `odd_square_grid`, `running_total_panel` |
| `src/manim/template.py` | **`build_example()` — the repeated worked-example unit.** Every `example` chapter is one call to it. Reuse it; don't reinvent per video. |
| `src/manim/{colors,helpers}.py` | palette + small animation helpers |
| `src/core/config.ts` | 1920×1080/30; `resolveManimPython()` (falls back to `../ai-math-shorts-generator/.venv`) |
| `scripts/emit-sources.js` | dev helper: writes storyboard + scene `.py` **without rendering**, so you can `python -m manim generated/scenes/manim/<file>.py <Class> -ql` to smoke-test one chapter fast |

## Fixed chapter skeleton (keep this order)

intro → roadmap → setup → master build → **worked examples ×5–9 (one shared
template, numbers only change)** → pattern check → big case → the reason →
principle from 3 angles → algebra → recap → outro.

Rules: no chrome except the top-left chapter tag; no voiceover; all motion must
teach; every `example` chapter must be visually interchangeable with the others.
Full brief in `prompts/director.md`.

## Publish (then wipe)

Only `generated/video.mp4` is kept, in the repo-root library, together with a
narration script:

```
library/videos/<title-slug>/
  <title-slug>.mp4              # the final render (git-ignored — lives on disk only)
  script.md                     # word-for-word narration, one section per chapter
  storyboard.json
  render/
    <name>Planner.ts
    storyboard.json
    scenes/                     # generated Manim, one file per chapter, + support/
    COMMAND.md                  # exact reproduce command
```

`script.md` — the exact words a narrator would say to walk a viewer through the
whole video. One `## <n> · <Chapter> — m:ss` section per chapter, in order, timed
to the **final** `storyboard.json` (durations are re-synced from the renders, so
write this last). The video is silent; the script is its spoken counterpart and
must say only what is on screen. Template: see the recorded example's `script.md`.

Then: `rm -rf generated public`.

## What to build next

`matura-backlog.json` — one long-form video per Matura syllabus chapter, each with
`title` / `angle` / `covers`. Build any entry without `recorded: true`. Mark it
`recorded`, set `planner`, and add its `library/...` path when done.

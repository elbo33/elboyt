# ai-math-shorts-generator — how to proceed

Vertical (1080×1920) silent math Shorts, 45–60 s, 5–6 free-form scenes.

## One command

```bash
npm install
npm run generate -- --planner <planner-key> "Why is this true?"
```

Writes `generated/video.mp4` (audio stripped) plus `storyboard.json`,
`scenes/`, `frames/`. Planner keys are registered in `src/cli/generate.ts`
(`shortest-path`, `triangle-angles`, `circle-area`, `odd-squares`, …).

## Where things live

| Path | Role |
|---|---|
| `src/planning/<name>Planner.ts` | one short: `createStoryboard(topic)` + `getSceneCode(id)`; scene Manim embedded as `String.raw`. Add new planners to the `PLANNERS` map in `src/cli/generate.ts`. |
| `src/manim/{style,colors,helpers}.py` | `MathShortScene` base + palette + helpers (copied into `generated/scenes/manim/support/`) |
| `src/rendering/*.ts` | Manim invoke, Remotion invoke, audio strip, preview frames |
| `src/remotion/MathShort.tsx` | stitches the per-scene clips |
| `src/core/config.ts` | 1080×1920/30; `resolveManimPython()` |

## Creative rules (full brief: prompts/director.md)

- 45–60 s, no voiceover, dark bg, one strong accent + one restrained secondary.
- **Bottom 25% of the frame is a hard no-go zone** (platform UI). No text or
  graphics there, ever.
- No persistent chrome: no watermark, no seconds counter.
- Visual explanation first, text second; all motion must teach.

## Publish (then wipe)

Only `generated/video.mp4` is kept, in the repo-root library, together with a
narration script:

```
library/shorts/<title-slug>/
  <title-slug>.mp4              # final render (git-ignored — on disk only)
  script.md                     # word-for-word narration, one section per scene
  render/
    <name>Planner.ts
    storyboard.json
    scenes/                     # generated Manim + support/
    COMMAND.md
```

`script.md` — the exact words a narrator would say to explain the short. One
`## <n> · <Scene> — 0:ss` section per scene, timed to the final `storyboard.json`
(write it last). The short is silent; the script is its spoken counterpart and
must say only what is on screen. See a long-form example's `script.md` for the
shape, kept short here (a 45–60 s short is ~110–150 spoken words total).

Then: `rm -rf generated public`.

## What to build next

`matura-backlog.json` — one short per "why is this true?" idea, organised by
Matura syllabus chapter. Build any idea without `recorded: true`; then mark it
and record its `planner`.

# AI Mathematical Long-Form Generator

Sibling of `ai-math-shorts-generator`. Same visual language, same toolchain
(TypeScript orchestration → Manim chapters → Remotion final cut → FFmpeg), but
aimed at **regular horizontal YouTube videos, 8 minutes and up**, with a fixed
repetitive chapter structure: intro, roadmap, setup, a slow master build, a run
of interchangeable worked examples, a pattern check, a stress-test example, the
general reason, the algebra, a recap, and an outro.

## Run

```bash
npm install
npm run generate -- --planner odd-squares-long "Why is the sum of the first n odd numbers always a perfect square?"
```

Outputs are written to `generated/`:

- `video.mp4` — final 1920x1080 cut, audio stripped
- `storyboard.json` — chapter list (durations re-synced to the rendered Manim timelines)
- `manifest.json`
- `scenes/manim/` — generated Manim sources, one file per chapter
- `scenes/renders/` — per-chapter mp4s
- `frames/` — preview stills

## How it differs from the Shorts generator

| | Shorts | Long-form |
|---|---|---|
| Frame | 1080x1920 | 1920x1080 |
| Length | 45–60 s | 8+ min |
| Structure | free, 5–6 scenes | fixed 18-chapter skeleton |
| Repetition | avoided | required (shared `build_example` template) |
| Chrome | none | a small top-left chapter tag, everywhere |
| Durations | authored | re-measured from Manim with `ffprobe` before the cut |

## Backlog

- `matura-syllabus.md` — Polish Matura syllabus as a textbook table of contents.
  One 8+ minute chaptered video per syllabus chapter, in order.
- `matura-backlog.json` — every syllabus chapter mapped to one long-form video:
  `title`, `angle`, and the `covers` beats it walks through. `recorded: true`
  entries point at their planner and their folder in `library/`.

(The shorts generator has its own `matura-syllabus.md` / `matura-backlog.json`
with one *short* per "why is this true?" idea.)

## Adding a topic

Add `src/planning/<name>Planner.ts` exporting `createStoryboard(topic)` and
`getSceneCode(sceneId)`, then register it in `src/cli/generate.ts`. Reuse
`support/template.py::build_example` for the example chapters so every case stays
visually identical. See `prompts/director.md` for the full brief.

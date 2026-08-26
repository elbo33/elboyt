# elboyt — AI math video pipelines

Two local, AI-directed pipelines that turn a "why is this true?" question into a
premium **silent** mathematical video (Manim scenes → Remotion final cut →
FFmpeg), plus a `library/` of finished work.

| Folder | What it makes |
|---|---|
| `ai-math-shorts-generator/` | Vertical 1080×1920 Shorts, 45–60 s, 5–6 free-form scenes |
| `ai-math-longform-generator/` | Horizontal 1920×1080 videos, 8+ min, fixed repetitive chapter skeleton |
| `library/` | Finished renders: one folder per piece, `<slug>.mp4` + the code that made it |

## Golden rules

1. **Renders never go into git.** `.gitignore` blocks every `*.mp4` / `*.mp3` /
   etc., anywhere — including inside `library/`. Git carries the *planner + Manim
   code + storyboard* that reproduces a video, never the video file itself.
2. **`generated/` and `public/` are scratch.** They are wiped after a final is
   published. Nothing in them is source of truth.
3. **Only the final render is kept**, and only in
   `library/<shorts|videos>/<title-slug>/<title-slug>.mp4`. No per-scene clips,
   Manim `media/` caches, or preview frames — ever.
4. Each generator has a `prompts/director.md` (the creative brief) and its own
   `CLAUDE.md` (how the code fits together). Read those before working in it.

## To make a new video

1. Open `<folder>/CLAUDE.md` and `<folder>/prompts/director.md`.
2. Pick the next item from `<folder>/matura-backlog.json` (anything without
   `recorded: true`), or take the topic the user gave you.
3. Add / adjust a planner, run the generate command, review frames, iterate.
4. Publish per that folder's "Output & library" section, then `rm -rf generated public`.

## Requirements

Node 18+, `ffmpeg`/`ffprobe` on PATH, and a Python env with `manim` 0.21
(`ai-math-shorts-generator/.venv` — the long-form generator reuses it
automatically, or set `MANIM_PYTHON`). LaTeX (MacTeX) is used by Manim for
`DecimalNumber`/`MathTex`.

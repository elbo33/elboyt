# elboyt — AI math video pipelines

Two local, AI-directed pipelines that turn a "why is this true?" question into a
premium **silent** mathematical video (Manim scenes → Remotion final cut →
FFmpeg), plus a `library/` of finished work.

| Folder | What it makes |
|---|---|
| `ai-math-shorts-generator/` | Vertical 1080×1920 Shorts, 45–60 s, 5–6 free-form scenes |
| `ai-math-longform-generator/` | Horizontal 1920×1080 videos, 8+ min, fixed repetitive chapter skeleton |
| `library/` | Finished pieces: one folder per piece — `<slug>.mp4` + `script.md` (word-for-word narration) + the code that made it |

## Golden rules

1. **Renders never go into git.** `.gitignore` blocks every `*.mp4` / `*.mp3` /
   etc., anywhere — including inside `library/`. Git carries the *planner + Manim
   code + storyboard* that reproduces a video, never the video file itself.
2. **`generated/` and `public/` are scratch.** They are wiped after a final is
   published. Nothing in them is source of truth.
3. **Only the final render is kept**, and only in
   `library/<shorts|videos>/<title-slug>/<title-slug>.mp4`. No per-scene clips,
   Manim `media/` caches, or preview frames — ever.
4. **Every piece ships a `script.md`** next to its `.mp4`: the exact words a
   narrator would say to explain the whole video, one section per scene/chapter
   with an approximate start time. The videos are silent; the script is their
   spoken counterpart and must never state anything not shown on screen.
5. **Language: Polish (pl-PL) by default.** Every new video — all on-screen text
   *and* its `script.md` — is authored in Polish unless the user asks for a
   specific video in another language. Keep file/folder slugs ASCII. The one
   existing English video in `library/videos/` predates this rule; leave it as-is,
   do not translate or re-render it.
6. Each generator has a `prompts/director.md` (the creative brief) and its own
   `CLAUDE.md` (how the code fits together). Read those before working in it.
7. **No em dashes.** The em dash (`—`) and en dash (`–`) are strictly banned in
   every piece of user-facing text: on-screen Manim strings, `script.md`
   narration, titles, captions, notes. Use a comma, a colon, the word "to",
   parentheses, or rewrite. Mathematical minus (`−` or `-`) is fine; it is not a
   dash.
8. **Numbers as words in `script.md`.** In every narration script, short and
   long, write numbers as Polish words, never digits. Say "dziesiąty wyraz",
   "równa się siedem", "minus dwadzieścia dziewięć"; never "10", "= 7", "-29".
   This is the narration only; on-screen math stays in digits.
   `src/script/fromStoryboard.ts` warns loudly if a generated script breaks
   rule 7 or 8.
9. **Shorts staging.** The retention-hook title is centred (horizontally and as
   a block, every line centred under the last) via `hook_title()` in
   `src/manim/shorts.py`, not free-placed `Text`. The background is the same
   `add_texture()` grid as the long-form videos, nothing else. Content lives in
   the vertical middle; the bottom 25% stays clear (rule from
   `ai_math_shorts_bottom_safe_zone` memory).

## To make a new video

1. Open `<folder>/CLAUDE.md` and `<folder>/prompts/director.md`.
2. Pick the next item from `<folder>/matura-backlog.json` (anything without
   `recorded: true`), or take the topic the user gave you.
3. Add / adjust a planner, run the generate command, review frames, iterate.
4. Write `script.md` — the word-for-word narration, one section per scene, timed
   to the final `storyboard.json`. Say only what is on screen.
5. Publish per that folder's "Output & library" section (`.mp4` + `script.md` +
   `render/`), then `rm -rf generated public`.

## Requirements

Node 18+, `ffmpeg`/`ffprobe` on PATH, and a Python env with `manim` 0.21
(`ai-math-shorts-generator/.venv` — the long-form generator reuses it
automatically, or set `MANIM_PYTHON`). LaTeX (MacTeX) is used by Manim for
`DecimalNumber`/`MathTex`.

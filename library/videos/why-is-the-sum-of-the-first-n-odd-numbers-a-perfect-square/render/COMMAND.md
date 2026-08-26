# Render — "Why is the sum of the first n odd numbers a perfect square?"

Long-form, 1920x1080, 30 fps, no voiceover. 20 chapters, 8:15.

## Reproduce

From `ai-math-longform-generator/`:

```bash
npm install
MANIM_PYTHON=../ai-math-shorts-generator/.venv/bin/python \
  npm run generate -- --planner odd-squares-long \
  "Why is the sum of the first n odd numbers always a perfect square?"
```

This writes `generated/video.mp4`. Copy only that file back to
`library/videos/why-is-the-sum-of-the-first-n-odd-numbers-a-perfect-square/`
(overwriting the existing final), then delete `generated/` and `public/`.

## What's in this folder

- `oddSquaresLongPlanner.ts` — the planner: chapter list + embedded Manim per chapter.
- `storyboard.json` — the resolved plan (chapter titles, order, re-synced durations).
- `scenes/` — the Manim source the pipeline generated and rendered, one file per
  chapter, plus `support/` (shared style, colours, and the repeated
  `build_example` template).

## Chapter order

intro → roadmap → setup → master build → 9 worked examples (2² … 10², one shared
template) → pattern check → big jump (n = 12) → the reason (gnomons) → 2n+1 three
ways → algebra (telescoping) → recap → outro.

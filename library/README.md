# Library

Finished pieces only. One folder per piece, named by its title, holding the
**final video**, the **word-for-word narration script**, and the **code that
rendered it** — nothing else. No per-scene clips, no Manim `media/` caches, no
preview frames, no Remotion temp.

```
library/
  shorts/                     vertical 1080x1920 pieces (ai-math-shorts-generator)
  videos/                     horizontal 1920x1080, 8+ min (ai-math-longform-generator)
    <title-slug>/
      <title-slug>.mp4        the final render (audio stripped)
      script.md               word-for-word narrator script, section per scene, with timecodes
      render/
        <planner>.ts          the planner that produced the storyboard
        storyboard.json       the chapter/scene list (titles, order, durations)
        scenes/               the generated Manim code, one file per scene
          support/            shared style/colour/template modules
        COMMAND.md            exact command to reproduce this render
```

## Policy

- Only the **final** `.mp4` is kept here. Every intermediate render is deleted
  after the final is produced.
- Every piece ships a `script.md`: the exact words a narrator would say to
  explain the whole video, one section per scene/chapter with an approximate
  start time. The videos are silent — the script is the spoken counterpart, and
  it must not state anything that isn't shown on screen.
- The generators' own `generated/` and `public/` working directories are
  disposable and are wiped once the final lands in this library.
- To reproduce or revise a piece, run its `render/COMMAND.md` in the matching
  generator, then copy the new final back over the old one and update `script.md`
  if the visuals changed.

## Contents

### videos/

| Title | Slug | Length | Script |
|---|---|---|---|
| Why is the sum of the first n odd numbers a perfect square? | `why-is-the-sum-of-the-first-n-odd-numbers-a-perfect-square` | 8:15 | ✓ |

### shorts/

_None rendered yet._

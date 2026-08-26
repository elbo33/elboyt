# Library

Finished renders only. One folder per piece, named by its title, holding the
**final video** and the **code that rendered it** — nothing else. No per-scene
clips, no Manim `media/` caches, no preview frames, no Remotion temp.

```
library/
  shorts/                     vertical 1080x1920 pieces (ai-math-shorts-generator)
  videos/                     horizontal 1920x1080, 8+ min (ai-math-longform-generator)
    <title-slug>/
      <title-slug>.mp4        the final render (audio stripped)
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
- The generators' own `generated/` and `public/` working directories are
  disposable and are wiped once the final lands in this library.
- To reproduce or revise a piece, run its `render/COMMAND.md` in the matching
  generator, then copy the new final back over the old one.

## Contents

### videos/

| Title | Slug | Length |
|---|---|---|
| Why is the sum of the first n odd numbers a perfect square? | `why-is-the-sum-of-the-first-n-odd-numbers-a-perfect-square` | 8:15 |

### shorts/

_None rendered yet._

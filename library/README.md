# Library

Finished, approved production output lands here through `npm run publish`.

Expected layout:

```text
library/videos/<NN>-<section>/<type>/
  script.md
  render/
  shorts/
  stills/
```

`NN` is the section's one-based position in `topics/teaching_sections.yaml`,
zero-padded to two digits (`01` through `62`). The folder prefix makes all
episodes sort in curriculum order. CLI section arguments and media filenames
still use the unnumbered section slug. Apply this naming to existing and future
library section folders; never renumber individual episode types, shorts, or
stills independently.

Rendered media files are intentionally ignored by git. The repo should commit
the source data and reproducer files, not large video/image artifacts.

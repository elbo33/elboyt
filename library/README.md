# Library

Finished, approved production output lands here through `npm run publish`.

Expected layout:

```text
library/videos/<section>/<type>/
  script.md
  render/
  shorts/
  stills/
```

Rendered media files are intentionally ignored by git. The repo should commit
the source data and reproducer files, not large video/image artifacts.

# AI Mathematical Shorts Generator

Local first milestone for generating premium visual math Shorts with:

- TypeScript orchestration
- Manim scene animation
- Remotion final composition
- FFmpeg preview-frame extraction

Run:

```bash
npm install
npm run generate -- "Why is the shortest path between two points a straight line?"
```

Outputs are written to `generated/`:

- `video.mp4`
- `storyboard.json`
- `manifest.json`
- `scenes/manim/`
- `scenes/renders/`
- `remotion/`
- `frames/`

This version includes a deterministic director for the first target topic. The architecture is intentionally ready for a Claude/Claude Code adapter to replace the local planner while preserving deterministic render, retry, validation, and output paths.

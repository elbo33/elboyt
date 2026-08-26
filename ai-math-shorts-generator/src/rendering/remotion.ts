import {PROJECT_ROOT} from "../core/config";
import {run} from "../core/exec";

export async function renderRemotion(): Promise<void> {
  await run("npx", ["remotion", "render", "src/remotion/index.ts", "MathShort", "generated/video.mp4"], PROJECT_ROOT);
}

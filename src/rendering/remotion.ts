import fs from "node:fs/promises";
import path from "node:path";

import {FINAL_VIDEO_PATH, GENERATED_DIR, PROJECT_ROOT, STORYBOARD_PATH} from "../core/config";
import {run} from "../core/exec";
import type {Storyboard} from "../core/types";

function concatLine(file: string): string {
  return `file '${file.replace(/'/g, "'\\''")}'`;
}

export async function renderRemotion(): Promise<void> {
  const storyboard = JSON.parse(await fs.readFile(STORYBOARD_PATH, "utf8")) as Storyboard;
  const concatPath = path.join(GENERATED_DIR, "scene-concat.txt");
  const list = storyboard.scenes.map((scene) => concatLine(scene.renderPath)).join("\n") + "\n";
  await fs.writeFile(concatPath, list, "utf8");

  await run(
    "ffmpeg",
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatPath,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-an",
      FINAL_VIDEO_PATH
    ],
    PROJECT_ROOT
  );
}

import path from "node:path";
import fs from "node:fs/promises";
import {FINAL_VIDEO_PATH, FRAME_DIR, PROJECT_ROOT} from "../core/config";
import {ensureDir} from "../core/fs";
import {run} from "../core/exec";

export async function extractPreviewFrames(): Promise<string[]> {
  await ensureDir(FRAME_DIR);
  const pattern = path.join(FRAME_DIR, "frame-%02d.jpg");
  await run(
    "ffmpeg",
    [
      "-y",
      "-i",
      FINAL_VIDEO_PATH,
      "-vf",
      "fps=1/10,scale=360:640",
      "-frames:v",
      "6",
      pattern
    ],
    PROJECT_ROOT
  );

  await run(
    "ffmpeg",
    [
      "-y",
      "-sseof",
      "-1",
      "-i",
      FINAL_VIDEO_PATH,
      "-frames:v",
      "1",
      "-vf",
      "scale=360:640",
      path.join(FRAME_DIR, "frame-final.jpg")
    ],
    PROJECT_ROOT
  );

  const files = await fs.readdir(FRAME_DIR);
  return files
    .filter((file) => /^frame-(\d+|final)\.jpg$/.test(file))
    .sort()
    .map((file) => path.join(FRAME_DIR, file));
}

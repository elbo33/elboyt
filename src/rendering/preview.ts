import path from "node:path";
import fs from "node:fs/promises";
import {FINAL_VIDEO_PATH, FRAME_DIR, PROJECT_ROOT, SCENE_PREVIEW_DIR} from "../core/config";
import {ensureDir, resetDir} from "../core/fs";
import {run} from "../core/exec";
import type {Storyboard} from "../core/types";

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
      "fps=1/45,scale=640:360",
      "-frames:v",
      "12",
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
      "scale=640:360",
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

export async function extractScenePreviewFrames(storyboard: Storyboard): Promise<{
  frames: string[];
  contactSheet: string | null;
}> {
  await resetDir(SCENE_PREVIEW_DIR);
  const frames: string[] = [];
  const moments = [
    {key: "early", frac: 0.18},
    {key: "mid", frac: 0.52},
    {key: "late", frac: 0.82}
  ];

  for (const scene of storyboard.scenes) {
    for (const moment of moments) {
      const latestSafe = Math.max(0.35, scene.durationSeconds - 0.35);
      const at = Math.min(latestSafe, Math.max(0.35, scene.durationSeconds * moment.frac));
      const out = path.join(
        SCENE_PREVIEW_DIR,
        `${String(scene.sceneIndex).padStart(2, "0")}-${moment.key}-${scene.id}.png`
      );
      await run(
        "ffmpeg",
        [
          "-y",
          "-ss",
          at.toFixed(2),
          "-i",
          scene.renderPath,
          "-frames:v",
          "1",
          "-update",
          "1",
          out
        ],
        PROJECT_ROOT
      );
      frames.push(out);
    }
  }

  if (!frames.length) {
    return {frames, contactSheet: null};
  }

  // The Windows FFmpeg builds commonly omit glob support. A concat list works
  // on both Windows and Unix and preserves storyboard order.
  const fileList = path.join(SCENE_PREVIEW_DIR, "contact-sheet-files.txt");
  await fs.writeFile(
    fileList,
    frames.map((frame) => `file '${frame.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n") + "\n",
    "utf8"
  );
  const contactSheet = path.join(SCENE_PREVIEW_DIR, "contact-sheet.jpg");
  await run(
    "ffmpeg",
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      fileList,
      "-vf",
      `scale=320:180,tile=6x${Math.ceil(frames.length / 6)}:padding=10:margin=10:color=0x081018`,
      "-frames:v",
      "1",
      "-update",
      "1",
      contactSheet
    ],
    PROJECT_ROOT
  );

  return {frames, contactSheet};
}

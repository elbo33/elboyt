import path from "node:path";
import fs from "node:fs/promises";
import {FINAL_VIDEO_PATH, PROJECT_ROOT} from "../core/config";
import {run} from "../core/exec";

export async function stripAudioTrack(): Promise<void> {
  const tempPath = path.join(path.dirname(FINAL_VIDEO_PATH), "video.no-audio.mp4");
  await run(
    "ffmpeg",
    ["-y", "-i", FINAL_VIDEO_PATH, "-map", "0:v:0", "-c:v", "copy", "-an", tempPath],
    PROJECT_ROOT
  );
  await fs.rename(tempPath, FINAL_VIDEO_PATH);
}

export async function addAudioTrack(videoPath: string, audioPath: string, outPath: string): Promise<void> {
  await run(
    "ffmpeg",
    [
      "-y",
      "-i",
      videoPath,
      "-i",
      audioPath,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      outPath
    ],
    PROJECT_ROOT
  );
}

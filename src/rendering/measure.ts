import {spawn} from "node:child_process";

/**
 * Read a media file's exact duration in seconds with ffprobe.
 * Manim decides a scene's real length from its animation timeline, not from our
 * planned `durationSeconds`; we re-sync the storyboard to the truth after
 * rendering so the Remotion cut has no freezes or drift.
 */
export function probeDurationSeconds(file: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        file
      ],
      {stdio: ["ignore", "pipe", "pipe"]}
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      const value = Number.parseFloat(stdout.trim());
      if (code === 0 && Number.isFinite(value) && value > 0) {
        resolve(value);
        return;
      }
      reject(new Error(`ffprobe failed for ${file} (code ${code}): ${stderr.trim()}`));
    });
  });
}

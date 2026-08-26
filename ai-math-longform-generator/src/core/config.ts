import path from "node:path";
import fs from "node:fs";

export const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// Long-form YouTube: horizontal 16:9, 30 FPS.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const GENERATED_DIR = path.join(PROJECT_ROOT, "generated");
export const PUBLIC_GENERATED_DIR = path.join(PROJECT_ROOT, "public", "generated");
export const SCENE_SOURCE_DIR = path.join(GENERATED_DIR, "scenes", "manim");
export const SCENE_RENDER_DIR = path.join(GENERATED_DIR, "scenes", "renders");
export const REMOTION_EXPORT_DIR = path.join(GENERATED_DIR, "remotion");
export const FRAME_DIR = path.join(GENERATED_DIR, "frames");
export const STORYBOARD_PATH = path.join(GENERATED_DIR, "storyboard.json");
export const MANIFEST_PATH = path.join(GENERATED_DIR, "manifest.json");
export const FINAL_VIDEO_PATH = path.join(GENERATED_DIR, "video.mp4");

export function resolveManimPython(): string {
  if (process.env.MANIM_PYTHON) {
    return process.env.MANIM_PYTHON;
  }

  const localVenv = path.join(PROJECT_ROOT, ".venv", "bin", "python");
  if (fs.existsSync(localVenv)) {
    return localVenv;
  }

  // Reuse the sibling shorts generator's virtualenv if it already has Manim.
  const shortsVenv = path.resolve(PROJECT_ROOT, "..", "ai-math-shorts-generator", ".venv", "bin", "python");
  if (fs.existsSync(shortsVenv)) {
    return shortsVenv;
  }

  const siblingVenv = path.resolve(PROJECT_ROOT, "..", "current-project", ".venv", "bin", "python");
  if (fs.existsSync(siblingVenv)) {
    return siblingVenv;
  }

  return "python3";
}

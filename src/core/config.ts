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
export const SCENE_PREVIEW_DIR = path.join(GENERATED_DIR, "scene-previews");
export const REMOTION_EXPORT_DIR = path.join(GENERATED_DIR, "remotion");
export const FRAME_DIR = path.join(GENERATED_DIR, "frames");
export const STORYBOARD_PATH = path.join(GENERATED_DIR, "storyboard.json");
export const MANIFEST_PATH = path.join(GENERATED_DIR, "manifest.json");
export const FINAL_VIDEO_PATH = path.join(GENERATED_DIR, "video.mp4");
export const THUMBNAIL_PATH = path.join(GENERATED_DIR, "thumbnail.png");
export const SHORTS_OUT_DIR = path.join(GENERATED_DIR, "shorts");
export const STILLS_OUT_DIR = path.join(GENERATED_DIR, "stills");
export const STILLS_SPEC_PATH = path.join(GENERATED_DIR, "stills-specs.json");
// Written by `generate` at the end of a stage, checked by `publish` so a stale
// generated/ can never be published as if it were fresh.
export const READY_MARKER = path.join(GENERATED_DIR, ".ready.json");

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

/**
 * Locate the curriculum data root that holds the verified ZasPro exports:
 * knowledge/sections/*.yaml and exercises/*.yaml.
 *
 * elboyt now carries its own committed copy as the source of truth. ZASPRO_DIR
 * remains an explicit override for comparing against or temporarily consuming a
 * live ZasPro checkout.
 */
export function resolveZasproDir(): string {
  const candidates = process.env.ZASPRO_DIR
    ? [path.resolve(process.env.ZASPRO_DIR)]
    : [
        PROJECT_ROOT,
        path.resolve(PROJECT_ROOT, "..", "..", "ZasPro"),
        path.resolve(PROJECT_ROOT, "..", "ZasPro")
      ];

  for (const dir of candidates) {
    const hasKnowledge = fs.existsSync(path.join(dir, "knowledge", "sections"));
    const hasExercises = fs.existsSync(path.join(dir, "exercises"));
    if (hasKnowledge && hasExercises) {
      return dir;
    }
  }

  throw new Error(
    "ZasPro curriculum data not found. Looked in:\n  " +
      candidates.join("\n  ") +
      "\nExpected knowledge/sections/ and exercises/. Set ZASPRO_DIR to override."
  );
}

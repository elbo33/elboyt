import path from "node:path";
import fs from "node:fs/promises";
import {
  GENERATED_DIR,
  PROJECT_ROOT,
  PUBLIC_GENERATED_DIR,
  SCENE_RENDER_DIR,
  resolveManimPython
} from "../core/config";
import {copyFileEnsured, ensureDir} from "../core/fs";
import {run} from "../core/exec";
import type {VideoScene} from "../core/types";

async function findRenderedMovie(scene: VideoScene): Promise<string> {
  const stem = path.basename(scene.sourcePath, ".py");
  const sceneDir = path.join(GENERATED_DIR, "media", "videos", stem);
  const entries = await fs.readdir(sceneDir, {withFileTypes: true});

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const candidate = path.join(sceneDir, entry.name, `${scene.className}.mp4`);
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Continue searching Manim's quality-specific output folders.
    }
  }

  throw new Error(`Could not find rendered movie for ${scene.className} in ${sceneDir}`);
}

export async function copyManimSupport(): Promise<void> {
  const supportDir = path.join(GENERATED_DIR, "scenes", "manim", "support");
  await ensureDir(supportDir);
  for (const file of ["colors.py", "style.py", "helpers.py"]) {
    await copyFileEnsured(path.join(PROJECT_ROOT, "src", "manim", file), path.join(supportDir, file));
  }
  await fs.writeFile(path.join(supportDir, "__init__.py"), "", "utf8");
}

export async function renderManimScene(scene: VideoScene): Promise<void> {
  const python = resolveManimPython();
  await run(
    python,
    [
      "-m",
      "manim",
      scene.sourcePath,
      scene.className,
      "--quality",
      "m",
      "--resolution",
      "1080,1920",
      "--fps",
      "30",
      "--format",
      "mp4",
      "--media_dir",
      path.join(GENERATED_DIR, "media"),
      "--disable_caching",
      "--progress_bar",
      "none",
      "--verbosity",
      "warning"
    ],
    PROJECT_ROOT
  );

  const movie = await findRenderedMovie(scene);
  await copyFileEnsured(movie, scene.renderPath);
  await copyFileEnsured(movie, path.join(PUBLIC_GENERATED_DIR, "scenes", path.basename(scene.renderPath)));
  await ensureDir(SCENE_RENDER_DIR);
}

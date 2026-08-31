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
  const manimSrc = path.join(PROJECT_ROOT, "src", "manim");
  const supportDir = path.join(GENERATED_DIR, "scenes", "manim", "support");
  await ensureDir(supportDir);
  await ensureDir(path.join(supportDir, "templates"));
  for (const file of [
    "config.py",
    "colors.py",
    "style.py",
    "helpers.py",
    "compute.py",
    "archetypes.py",
    "shorts.py",
    "thumbnail.py",
    "template.py"
  ]) {
    await copyFileEnsured(path.join(manimSrc, file), path.join(supportDir, file));
  }
  for (const file of ["__init__.py", "theory_example.py"]) {
    await copyFileEnsured(
      path.join(manimSrc, "templates", file),
      path.join(supportDir, "templates", file)
    );
  }
  await fs.writeFile(path.join(supportDir, "__init__.py"), "", "utf8");
}

type RenderFormat = {width: number; height: number; formatId: string};

export async function renderManimScene(
  scene: VideoScene,
  fmt: RenderFormat = {width: 1920, height: 1080, formatId: "longform-16x9"}
): Promise<void> {
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
      `${fmt.width},${fmt.height}`,
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
    PROJECT_ROOT,
    {MANIM_FORMAT: fmt.formatId}
  );

  const movie = await findRenderedMovie(scene);
  await copyFileEnsured(movie, scene.renderPath);
  await copyFileEnsured(movie, path.join(PUBLIC_GENERATED_DIR, "scenes", path.basename(scene.renderPath)));
  await ensureDir(SCENE_RENDER_DIR);
}

/**
 * Render a single Manim scene's last frame to a PNG (the episode thumbnail).
 * `sourcePath` is a .py file with one `LessonScene` subclass; `outPath` is
 * where the finished 1920x1080 still is copied.
 */
export async function renderThumbnailFrame(
  sourcePath: string,
  className: string,
  outPath: string,
  formatId = "still-16x9",
  resolution: [number, number] = [1920, 1080]
): Promise<void> {
  const python = resolveManimPython();
  await run(
    python,
    [
      "-m",
      "manim",
      "-s",
      sourcePath,
      className,
      "--quality",
      "h",
      "--resolution",
      `${resolution[0]},${resolution[1]}`,
      "--format",
      "png",
      "-o",
      "thumbnail",
      "--media_dir",
      path.join(GENERATED_DIR, "media"),
      "--disable_caching",
      "--progress_bar",
      "none",
      "--verbosity",
      "warning"
    ],
    PROJECT_ROOT,
    {MANIM_FORMAT: formatId}
  );

  const stem = path.basename(sourcePath, ".py");
  const imageDir = path.join(GENERATED_DIR, "media", "images", stem);
  const entries = await fs.readdir(imageDir);
  const png =
    entries.find((f) => f === "thumbnail.png") ??
    entries.filter((f) => f.endsWith(".png")).sort().pop();
  if (!png) {
    throw new Error(`No thumbnail PNG produced in ${imageDir}`);
  }
  await copyFileEnsured(path.join(imageDir, png), outPath);
}

import path from "node:path";
import fs from "node:fs/promises";
import {
  FINAL_VIDEO_PATH,
  FPS,
  FRAME_DIR,
  GENERATED_DIR,
  MANIFEST_PATH,
  PROJECT_ROOT,
  PUBLIC_GENERATED_DIR,
  READY_MARKER,
  REMOTION_EXPORT_DIR,
  SCENE_RENDER_DIR,
  SCENE_PREVIEW_DIR,
  SCENE_SOURCE_DIR,
  SHORTS_OUT_DIR,
  STILLS_SPEC_PATH,
  STILLS_OUT_DIR,
  STORYBOARD_PATH,
  THUMBNAIL_PATH,
  resolveManimPython
} from "../core/config";
import {run} from "../core/exec";
import {copyFileEnsured, ensureDir, resetDir, writeJson} from "../core/fs";
import {EPISODE_TYPES, isEpisodeType} from "../core/library";
import {logStep} from "../core/logger";
import type {EpisodeType} from "../core/library";
import type {RenderManifest, Storyboard, VideoScene} from "../core/types";
import * as theoryPlanner from "../planning/longform/theoryPlanner";
import {genericLongformPlannerFor} from "../planning/generic/episode";
import {buildGenericStillSpecs} from "../planning/generic/stills";
import * as shortsPlanner from "../planning/shorts/shortsPlanner";
import {shortSlug, shortsForEpisode} from "../planning/shorts/shortsPlanner";
import {stripAudioTrack} from "../rendering/finalize";
import {copyManimSupport, renderManimScene, renderThumbnailFrame} from "../rendering/manim";
import {probeDurationSeconds} from "../rendering/measure";
import {extractPreviewFrames, extractScenePreviewFrames} from "../rendering/preview";
import {renderRemotion} from "../rendering/remotion";
import {fillNarrationBudget, writeScriptFromStoryboard} from "../script/fromStoryboard";

type Planner = {
  createStoryboard: (topic: string) => Storyboard;
  getSceneCode: (sceneId: string) => string;
};

type Stage = "longform" | "shorts" | "stills";

type Args = {
  section: string;
  type: EpisodeType;
  stage: Stage;
  topic: string | null;
  onlyShort: string | null;
  sceneLimit: number | null;
  sceneStart: number;
};

function usage(): never {
  console.error(
    [
      "Usage: npm run generate -- <section> <type> [stage]",
      "",
      `  <type>   one of: ${EPISODE_TYPES.join(", ")}`,
      "  [stage]  longform (default) | shorts | stills",
      "",
      "Options:",
      "  --topic <text>   override the episode title (defaults to the section's)",
      "  --short <key>     shorts stage only: render just this one short",
      "  --limit-scenes <n> longform stage only: render only the first n scenes as a sample",
      "  --scene-start <n>  longform stage only: start a sample at scene n (1-based)",
      "",
      "Nothing is published. Review generated/, then: npm run publish -- <section> <type> [stage]"
    ].join("\n")
  );
  process.exit(1);
}

function parseArgs(argv: string[]): Args {
  const flag = (name: string): string | null => {
    const i = argv.indexOf(name);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
  };
  const positional = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));

  const section = positional[0];
  const type = positional[1];
  const stage = (positional[2] ?? "longform") as Stage;
  const sceneLimitRaw = flag("--limit-scenes");
  const sceneLimit = sceneLimitRaw ? Number.parseInt(sceneLimitRaw, 10) : null;
  const sceneStartRaw = flag("--scene-start");
  const sceneStart = sceneStartRaw ? Number.parseInt(sceneStartRaw, 10) : 1;
  if (!section || !type) usage();
  if (!isEpisodeType(type)) {
    console.error(`Unknown type "${type}". Expected one of: ${EPISODE_TYPES.join(", ")}`);
    process.exit(1);
  }
  if (!["longform", "shorts", "stills"].includes(stage)) {
    console.error(`Unknown stage "${stage}". Expected: longform | shorts | stills`);
    process.exit(1);
  }
  if (sceneLimit !== null && (!Number.isFinite(sceneLimit) || sceneLimit < 1)) {
    console.error(`Invalid --limit-scenes value "${sceneLimitRaw}". Expected a positive integer.`);
    process.exit(1);
  }
  if (!Number.isFinite(sceneStart) || sceneStart < 1) {
    console.error(`Invalid --scene-start value "${sceneStartRaw}". Expected a positive integer.`);
    process.exit(1);
  }
  return {section, type, stage, topic: flag("--topic"), onlyShort: flag("--short"), sceneLimit, sceneStart};
}

async function markReady(section: string, type: EpisodeType, stage: Stage): Promise<void> {
  await fs.writeFile(
    READY_MARKER,
    JSON.stringify({section, type, stage, at: new Date().toISOString()}, null, 2) + "\n",
    "utf8"
  );
}

async function writeSceneSources(planner: Planner, storyboard: Storyboard): Promise<void> {
  await copyManimSupport();
  for (const scene of storyboard.scenes) {
    await ensureDir(path.dirname(scene.sourcePath));
    await fs.writeFile(scene.sourcePath, planner.getSceneCode(scene.id), "utf8");
  }
}

function preservesLongformVoiceTiming(storyboard: Storyboard, scene: VideoScene): boolean {
  return storyboard.format === "short-9x16" && Boolean(scene.derivedFromScene);
}

async function padSceneRenderToDuration(scene: VideoScene, targetSeconds: number): Promise<number> {
  const measured = await probeDurationSeconds(scene.renderPath);
  const padSeconds = targetSeconds - measured;
  if (padSeconds <= 0.05) {
    return Math.round(measured * FPS) / FPS;
  }

  const tempPath = scene.renderPath.replace(/\.mp4$/, ".padded.tmp.mp4");
  await run(
    "ffmpeg",
    [
      "-y",
      "-i",
      scene.renderPath,
      "-vf",
      `tpad=stop_mode=clone:stop_duration=${padSeconds.toFixed(3)}`,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-an",
      tempPath
    ],
    PROJECT_ROOT
  );
  await fs.rename(tempPath, scene.renderPath);
  await copyFileEnsured(scene.renderPath, path.join(PUBLIC_GENERATED_DIR, "scenes", path.basename(scene.renderPath)));

  const padded = await probeDurationSeconds(scene.renderPath);
  return Math.round(padded * FPS) / FPS;
}

/**
 * Render one piece (a long-form episode or one short) end to end, leaving the
 * result in generated/: video.mp4, script.md, storyboard.json, scene sources
 * and clips, preview frames, manifest.json. Never touches library/.
 *
 * `resetRoot` wipes all of generated/ first (long form); the shorts loop keeps
 * generated/shorts/ as its accumulator and resets only the work sub-dirs.
 */
async function renderPiece(
  planner: Planner,
  topic: string,
  resetRoot: boolean,
  sceneLimit: number | null = null,
  sceneStart = 1
): Promise<Storyboard> {
  const storyboard = planner.createStoryboard(topic);
  if (sceneLimit !== null || sceneStart > 1) {
    const startIndex = sceneStart - 1;
    const endIndex = sceneLimit === null ? undefined : startIndex + sceneLimit;
    storyboard.scenes = storyboard.scenes.slice(startIndex, endIndex).map((scene, index) => ({
      ...scene,
      sceneIndex: index + 1
    }));
    storyboard.durationSeconds = storyboard.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
  }
  const plannedMinutes = (storyboard.durationSeconds / 60).toFixed(1);
  logStep(
    `${storyboard.scenes.length} scenes, planned ${storyboard.durationSeconds}s ` +
      `(~${plannedMinutes} min), ${storyboard.format}`
  );

  if (resetRoot) {
    await resetDir(GENERATED_DIR);
  } else {
    await resetDir(SCENE_SOURCE_DIR);
    await resetDir(SCENE_RENDER_DIR);
    await resetDir(REMOTION_EXPORT_DIR);
    await resetDir(FRAME_DIR);
    await fs.rm(path.join(GENERATED_DIR, "media"), {recursive: true, force: true});
  }
  await resetDir(PUBLIC_GENERATED_DIR);
  await ensureDir(SCENE_SOURCE_DIR);
  await ensureDir(SCENE_RENDER_DIR);
  await ensureDir(REMOTION_EXPORT_DIR);
  await ensureDir(FRAME_DIR);

  logStep("Writing storyboard and Manim scene sources");
  await writeJson(STORYBOARD_PATH, storyboard);
  await writeJson(path.join(PUBLIC_GENERATED_DIR, "storyboard.json"), storyboard);
  await writeSceneSources(planner, storyboard);

  const renderFmt = {width: storyboard.width, height: storyboard.height, formatId: storyboard.format};
  for (const scene of storyboard.scenes) {
    logStep(`Rendering ${scene.id} [${scene.sceneLabel}] with Manim`);
    await renderManimScene(scene, renderFmt);
  }

  logStep("Re-syncing durations to the rendered Manim timelines");
  for (const scene of storyboard.scenes) {
    const target = scene.durationSeconds;
    let snapped = preservesLongformVoiceTiming(storyboard, scene)
      ? await padSceneRenderToDuration(scene, target)
      : Math.round((await probeDurationSeconds(scene.renderPath)) * FPS) / FPS;
    if (preservesLongformVoiceTiming(storyboard, scene) && snapped + 0.05 < target) {
      logStep(`  ${scene.id}: vertical render ${snapped.toFixed(2)}s, target ${target.toFixed(2)}s for voice reuse`);
    }
    if (Math.abs(snapped - scene.durationSeconds) > 0.05) {
      logStep(`  ${scene.id}: planned ${scene.durationSeconds}s -> actual ${snapped.toFixed(2)}s`);
    }
    scene.durationSeconds = snapped;
  }
  storyboard.durationSeconds = storyboard.scenes.reduce((t, s) => t + s.durationSeconds, 0);
  // This episode's spoken script is authored to the measured scenes. Automatic
  // repeated filler would break the approved human narration standard.
  if (storyboard.sectionSlug !== "prawa-dzialan-potegi-pierwiastki" &&
      storyboard.sectionSlug !== "monotonicznosc-potegowania") {
    fillNarrationBudget(storyboard);
  }
  await writeJson(STORYBOARD_PATH, storyboard);
  await writeJson(path.join(PUBLIC_GENERATED_DIR, "storyboard.json"), storyboard);

  logStep("Generating script.md from scene narration + measured timings");
  await writeScriptFromStoryboard(storyboard, path.join(GENERATED_DIR, "script.md"));

  logStep("Extracting early/mid/late visual-review PNGs per scene");
  const scenePreviews = await extractScenePreviewFrames(storyboard);

  logStep(`Composing final ${storyboard.format} video from rendered scene clips`);
  await renderRemotion();

  logStep("Removing audio track");
  await stripAudioTrack();

  logStep("Extracting preview frames");
  const previewFrames = await extractPreviewFrames();

  const manifest: RenderManifest = {
    generatedAt: new Date().toISOString(),
    topic: storyboard.topic,
    outputVideo: FINAL_VIDEO_PATH,
    storyboard: STORYBOARD_PATH,
    durationSeconds: storyboard.durationSeconds,
    scenes: storyboard.scenes,
    previewFrames,
    scenePreviewFrames: scenePreviews.frames,
    sceneContactSheet: scenePreviews.contactSheet ?? undefined
  };
  await writeJson(MANIFEST_PATH, manifest);
  return storyboard;
}

async function renderThumbnail(): Promise<boolean> {
  const plans = theoryPlanner.getThumbnailPlans();
  if (plans.length === 0) {
    logStep("No thumbnail authored for this section — skipping (add one before publish)");
    return false;
  }
  logStep(`Rendering ${plans.length} episode thumbnail(s) (1920x1080, ThumbA-flat style)`);
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    const src = path.join(SCENE_SOURCE_DIR, `_thumbnail_${i + 1}.py`);
    const out = path.join(GENERATED_DIR, plan.filename);
    await fs.writeFile(src, plan.code, "utf8");
    await renderThumbnailFrame(src, plan.className, out);
    if (i === 0) {
      await copyFileEnsured(out, THUMBNAIL_PATH);
    }
  }
  return true;
}

const STORYBOARD_EPISODE_TYPE: Record<EpisodeType, Storyboard["episodeType"]> = {
  theory: "THEORY",
  exercises: "EXERCISES",
  mistakes: "COMMON_MISTAKES",
  challenge: "CHALLENGE"
};

async function readStoryboardForReference(filePath: string): Promise<Storyboard | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as Storyboard;
  } catch {
    return null;
  }
}

function isMatchingLongformReference(storyboard: Storyboard | null, section: string, type: EpisodeType): boolean {
  return Boolean(
    storyboard &&
      storyboard.sectionSlug === section &&
      storyboard.episodeType === STORYBOARD_EPISODE_TYPE[type] &&
      storyboard.format === "longform-16x9" &&
      Array.isArray(storyboard.scenes) &&
      storyboard.scenes.length > 0
  );
}

async function preserveLongformReference(section: string, type: EpisodeType): Promise<void> {
  const temp = path.join(PROJECT_ROOT, ".tmp", "longform-reference");
  const currentReference = path.join(GENERATED_DIR, "longform-reference");
  const currentReferenceStoryboard = await readStoryboardForReference(path.join(currentReference, "storyboard.json"));
  if (isMatchingLongformReference(currentReferenceStoryboard, section, type)) {
    await resetDir(temp);
    await fs.cp(currentReference, temp, {recursive: true});
    return;
  }

  const rootStoryboard = await readStoryboardForReference(STORYBOARD_PATH);
  if (!isMatchingLongformReference(rootStoryboard, section, type)) {
    return;
  }

  try {
    await fs.access(FINAL_VIDEO_PATH);
  } catch {
    return;
  }

  await resetDir(temp);
  await copyFileEnsured(FINAL_VIDEO_PATH, path.join(temp, "video.mp4"));
  for (const file of ["script.md", "storyboard.json", "manifest.json"]) {
    const source = path.join(GENERATED_DIR, file);
    try {
      await copyFileEnsured(source, path.join(temp, file));
    } catch {
      // Missing optional reference artifact; keep the rest.
    }
  }
  try {
    await fs.cp(SCENE_PREVIEW_DIR, path.join(temp, "scene-previews"), {recursive: true});
  } catch {
    // Scene previews are useful but not required to render shorts.
  }
}

async function restoreLongformReference(): Promise<void> {
  const temp = path.join(PROJECT_ROOT, ".tmp", "longform-reference");
  try {
    await fs.access(path.join(temp, "video.mp4"));
  } catch {
    return;
  }

  const ref = path.join(GENERATED_DIR, "longform-reference");
  await resetDir(ref);
  await fs.cp(temp, ref, {recursive: true});
  await fs.rm(temp, {recursive: true, force: true});
}

const LONGFORM_PLANNERS: Record<EpisodeType, Planner> = {
  theory: theoryPlanner,
  exercises: genericLongformPlannerFor("exercises"),
  mistakes: genericLongformPlannerFor("mistakes"),
  challenge: genericLongformPlannerFor("challenge")
};

async function runLongform(args: Args): Promise<void> {
  const planner = LONGFORM_PLANNERS[args.type];
  process.env.SECTION = args.section;
  logStep(`LONG FORM — ${args.section} / ${args.type}`);
  const sb = await renderPiece(planner, args.topic ?? "", true, args.sceneLimit, args.sceneStart);
  const isSample = args.sceneLimit !== null || args.sceneStart > 1;
  const hasThumb = isSample ? false : await renderThumbnail();
  if (!isSample) {
    await markReady(args.section, args.type, "longform");
  }

  const mins = (sb.durationSeconds / 60).toFixed(1);
  logStep(isSample ? `SAMPLE READY (nothing published):` : `READY (nothing published):`);
  console.log(`  generated/video.mp4        ${mins} min, ${sb.scenes.length} scenes`);
  console.log(`  generated/script.md`);
  console.log(`  generated/storyboard.json`);
  if (!isSample) {
    console.log(hasThumb ? `  generated/thumbnail.png + thumbnail variants` : `  (no thumbnail — author section.thumbnail)`);
  }
  console.log(`  generated/frames/          preview stills`);
  console.log(
    isSample
      ? `\nReview this sample before rendering the full episode.`
      : `\nReview, then approve with:  npm run publish -- ${args.section} ${args.type}`
  );
}

async function runShorts(args: Args): Promise<void> {
  process.env.SECTION = args.section;
  let keys = shortsForEpisode(args.section, args.type);
  if (args.onlyShort) keys = keys.filter((k) => k === args.onlyShort);
  if (keys.length === 0) {
    throw new Error(
      `No shorts registered for ${args.section}/${args.type}` +
        (args.onlyShort ? ` matching "${args.onlyShort}"` : "") +
        `. See EPISODE_SHORTS in src/planning/shorts/shortsPlanner.ts.`
    );
  }

  await preserveLongformReference(args.section, args.type);
  await resetDir(GENERATED_DIR);
  await restoreLongformReference();
  await ensureDir(SHORTS_OUT_DIR);
  const done: string[] = [];

  for (const key of keys) {
    process.env.SHORT = key;
    const slug = shortSlug(key);
    logStep(`SHORT — ${key}  ->  ${slug}`);
    await renderPiece(shortsPlanner, "", false);

    const outDir = path.join(SHORTS_OUT_DIR, slug);
    await resetDir(outDir);
    await ensureDir(path.join(outDir, "render", "scenes"));
    await copyFileEnsured(FINAL_VIDEO_PATH, path.join(outDir, `${slug}.mp4`));
    await copyFileEnsured(path.join(GENERATED_DIR, "script.md"), path.join(outDir, "script.md"));
    await copyFileEnsured(STORYBOARD_PATH, path.join(outDir, "render", "storyboard.json"));
    await copyFileEnsured(MANIFEST_PATH, path.join(outDir, "render", "manifest.json"));
    await fs.cp(SCENE_SOURCE_DIR, path.join(outDir, "render", "scenes"), {recursive: true});
    await fs.cp(SCENE_PREVIEW_DIR, path.join(outDir, "render", "scene-previews"), {recursive: true});
    done.push(slug);
  }

  await markReady(args.section, args.type, "shorts");
  logStep(`READY (nothing published): ${done.length} short(s) in generated/shorts/`);
  for (const slug of done) console.log(`  generated/shorts/${slug}/{${slug}.mp4, script.md, render/}`);
  console.log(`\nReview, then approve with:  npm run publish -- ${args.section} ${args.type} shorts`);
}

async function runStills(args: Args): Promise<void> {
  const specs = path.join(
    PROJECT_ROOT,
    "src",
    "planning",
    "stills",
    args.section,
    `${args.type}.json`
  );
  let specsToRender = specs;
  try {
    await fs.access(specs);
  } catch {
    logStep(`No authored stills specs at ${path.relative(PROJECT_ROOT, specs)} — using generic ZasPro specs`);
    await ensureDir(GENERATED_DIR);
    await writeJson(STILLS_SPEC_PATH, buildGenericStillSpecs(args.section, args.type));
    specsToRender = STILLS_SPEC_PATH;
  }

  await resetDir(STILLS_OUT_DIR);
  logStep(`STILLS — ${args.section} / ${args.type}`);
  await run(
    resolveManimPython(),
    [path.join(PROJECT_ROOT, "scripts", "make_stills.py"), specsToRender, "--out-dir", STILLS_OUT_DIR],
    PROJECT_ROOT
  );

  const made = (await fs.readdir(STILLS_OUT_DIR)).filter((f) => f.endsWith(".png")).sort();
  await markReady(args.section, args.type, "stills");
  logStep(`READY (nothing published): ${made.length} still(s) in generated/stills/`);
  for (const f of made) console.log(`  generated/stills/${f}`);
  console.log(`\nReview, then approve with:  npm run publish -- ${args.section} ${args.type} stills`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.stage === "shorts") return runShorts(args);
  if (args.stage === "stills") return runStills(args);
  return runLongform(args);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

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
  SCENE_SOURCE_DIR,
  SHORTS_OUT_DIR,
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
import type {RenderManifest, Storyboard} from "../core/types";
import * as theoryPlanner from "../planning/longform/theoryPlanner";
import * as shortsPlanner from "../planning/shorts/shortsPlanner";
import {shortSlug, shortsForEpisode} from "../planning/shorts/shortsPlanner";
import {stripAudioTrack} from "../rendering/finalize";
import {copyManimSupport, renderManimScene, renderThumbnailFrame} from "../rendering/manim";
import {probeDurationSeconds} from "../rendering/measure";
import {extractPreviewFrames} from "../rendering/preview";
import {renderRemotion} from "../rendering/remotion";
import {writeScriptFromStoryboard} from "../script/fromStoryboard";

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
  if (!section || !type) usage();
  if (!isEpisodeType(type)) {
    console.error(`Unknown type "${type}". Expected one of: ${EPISODE_TYPES.join(", ")}`);
    process.exit(1);
  }
  if (!["longform", "shorts", "stills"].includes(stage)) {
    console.error(`Unknown stage "${stage}". Expected: longform | shorts | stills`);
    process.exit(1);
  }
  return {section, type, stage, topic: flag("--topic"), onlyShort: flag("--short")};
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

/**
 * Render one piece (a long-form episode or one short) end to end, leaving the
 * result in generated/: video.mp4, script.md, storyboard.json, scene sources
 * and clips, preview frames, manifest.json. Never touches library/.
 *
 * `resetRoot` wipes all of generated/ first (long form); the shorts loop keeps
 * generated/shorts/ as its accumulator and resets only the work sub-dirs.
 */
async function renderPiece(planner: Planner, topic: string, resetRoot: boolean): Promise<Storyboard> {
  const storyboard = planner.createStoryboard(topic);
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
    const measured = await probeDurationSeconds(scene.renderPath);
    const snapped = Math.round(measured * FPS) / FPS;
    if (Math.abs(snapped - scene.durationSeconds) > 0.05) {
      logStep(`  ${scene.id}: planned ${scene.durationSeconds}s -> actual ${snapped.toFixed(2)}s`);
    }
    scene.durationSeconds = snapped;
  }
  storyboard.durationSeconds = storyboard.scenes.reduce((t, s) => t + s.durationSeconds, 0);
  await writeJson(STORYBOARD_PATH, storyboard);
  await writeJson(path.join(PUBLIC_GENERATED_DIR, "storyboard.json"), storyboard);

  logStep("Generating script.md from scene narration + measured timings");
  await writeScriptFromStoryboard(storyboard, path.join(GENERATED_DIR, "script.md"));

  logStep(`Composing final ${storyboard.format} video with Remotion`);
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
    previewFrames
  };
  await writeJson(MANIFEST_PATH, manifest);
  return storyboard;
}

async function renderThumbnail(): Promise<boolean> {
  const code = theoryPlanner.getThumbnailCode();
  if (!code) {
    logStep("No thumbnail authored for this section — skipping (add one before publish)");
    return false;
  }
  logStep("Rendering episode thumbnail (1920x1080, ThumbA-flat style)");
  const src = path.join(SCENE_SOURCE_DIR, "_thumbnail.py");
  await fs.writeFile(src, code, "utf8");
  await renderThumbnailFrame(src, theoryPlanner.getThumbnailClassName(), THUMBNAIL_PATH);
  return true;
}

const LONGFORM_PLANNERS: Partial<Record<EpisodeType, Planner>> = {
  theory: theoryPlanner
  // exercises / mistakes / challenge: planners not built yet
};

async function runLongform(args: Args): Promise<void> {
  const planner = LONGFORM_PLANNERS[args.type];
  if (!planner) {
    throw new Error(
      `No long-form planner for type "${args.type}" yet. Only "theory" is built.`
    );
  }
  process.env.SECTION = args.section;
  logStep(`LONG FORM — ${args.section} / ${args.type}`);
  const sb = await renderPiece(planner, args.topic ?? "", true);
  const hasThumb = await renderThumbnail();
  await markReady(args.section, args.type, "longform");

  const mins = (sb.durationSeconds / 60).toFixed(1);
  logStep(`READY (nothing published):`);
  console.log(`  generated/video.mp4        ${mins} min, ${sb.scenes.length} scenes`);
  console.log(`  generated/script.md`);
  console.log(`  generated/storyboard.json`);
  console.log(hasThumb ? `  generated/thumbnail.png` : `  (no thumbnail — author section.thumbnail)`);
  console.log(`  generated/frames/          preview stills`);
  console.log(`\nReview, then approve with:  npm run publish -- ${args.section} ${args.type}`);
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

  await resetDir(GENERATED_DIR);
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
    await fs.cp(SCENE_SOURCE_DIR, path.join(outDir, "render", "scenes"), {recursive: true});
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
  try {
    await fs.access(specs);
  } catch {
    throw new Error(`No stills specs at ${path.relative(PROJECT_ROOT, specs)} — author it first.`);
  }

  await resetDir(STILLS_OUT_DIR);
  logStep(`STILLS — ${args.section} / ${args.type}`);
  await run(
    resolveManimPython(),
    [path.join(PROJECT_ROOT, "scripts", "make_stills.py"), specs, "--out-dir", STILLS_OUT_DIR],
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

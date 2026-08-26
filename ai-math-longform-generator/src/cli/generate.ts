import path from "node:path";
import fs from "node:fs/promises";
import {
  FINAL_VIDEO_PATH,
  FRAME_DIR,
  GENERATED_DIR,
  MANIFEST_PATH,
  PUBLIC_GENERATED_DIR,
  REMOTION_EXPORT_DIR,
  SCENE_RENDER_DIR,
  SCENE_SOURCE_DIR,
  STORYBOARD_PATH
} from "../core/config";
import {FPS} from "../core/config";
import {ensureDir, resetDir, writeJson} from "../core/fs";
import {logStep} from "../core/logger";
import type {RenderManifest, Storyboard} from "../core/types";
import * as oddSquaresLongPlanner from "../planning/oddSquaresLongPlanner";
import {stripAudioTrack} from "../rendering/finalize";
import {copyManimSupport, renderManimScene} from "../rendering/manim";
import {probeDurationSeconds} from "../rendering/measure";
import {extractPreviewFrames} from "../rendering/preview";
import {renderRemotion} from "../rendering/remotion";

type Planner = {
  createStoryboard: (topic: string) => Storyboard;
  getSceneCode: (sceneId: string) => string;
};

const PLANNERS: Record<string, Planner> = {
  "odd-squares-long": oddSquaresLongPlanner
};

const DEFAULT_PLANNER = "odd-squares-long";

function parseArgs(argv: string[]): {topic: string; plannerKey: string} {
  const plannerFlag = argv.indexOf("--planner");
  const plannerKey =
    plannerFlag >= 0 && argv[plannerFlag + 1] ? argv[plannerFlag + 1] : DEFAULT_PLANNER;

  const topicFlag = argv.indexOf("--topic");
  if (topicFlag >= 0 && argv[topicFlag + 1]) {
    return {topic: argv[topicFlag + 1], plannerKey};
  }

  const positional = argv.filter((arg, index) => {
    if (arg === "--") return false;
    if (arg === "--planner" || argv[index - 1] === "--planner") return false;
    return true;
  });
  const topic =
    positional.join(" ").trim() ||
    "Why is the sum of the first n odd numbers always a perfect square?";
  return {topic, plannerKey};
}

async function writeSceneSources(planner: Planner, storyboard: Storyboard): Promise<void> {
  await copyManimSupport();
  for (const scene of storyboard.scenes) {
    await ensureDir(path.dirname(scene.sourcePath));
    await fs.writeFile(scene.sourcePath, planner.getSceneCode(scene.id), "utf8");
  }
}

async function main(): Promise<void> {
  const {topic, plannerKey} = parseArgs(process.argv.slice(2));
  const planner = PLANNERS[plannerKey];
  if (!planner) {
    throw new Error(`Unknown planner "${plannerKey}". Available: ${Object.keys(PLANNERS).join(", ")}`);
  }

  const storyboard = planner.createStoryboard(topic);
  const plannedMinutes = (storyboard.durationSeconds / 60).toFixed(1);

  logStep(`Preparing long-form output for: ${topic} (planner: ${plannerKey})`);
  logStep(`${storyboard.scenes.length} chapters, planned ${storyboard.durationSeconds}s (~${plannedMinutes} min)`);
  await resetDir(GENERATED_DIR);
  await resetDir(PUBLIC_GENERATED_DIR);
  await ensureDir(SCENE_SOURCE_DIR);
  await ensureDir(SCENE_RENDER_DIR);
  await ensureDir(REMOTION_EXPORT_DIR);
  await ensureDir(FRAME_DIR);

  logStep("Writing storyboard and Manim chapter sources");
  await writeJson(STORYBOARD_PATH, storyboard);
  await writeJson(path.join(PUBLIC_GENERATED_DIR, "storyboard.json"), storyboard);
  await writeSceneSources(planner, storyboard);

  for (const scene of storyboard.scenes) {
    logStep(`Rendering ${scene.id} [${scene.chapterLabel}] with Manim`);
    await renderManimScene(scene);
  }

  logStep("Re-syncing chapter durations to the rendered Manim timelines");
  for (const scene of storyboard.scenes) {
    const measured = await probeDurationSeconds(scene.renderPath);
    const snapped = Math.round(measured * FPS) / FPS;
    if (Math.abs(snapped - scene.durationSeconds) > 0.05) {
      logStep(`  ${scene.id}: planned ${scene.durationSeconds}s -> actual ${snapped.toFixed(2)}s`);
    }
    scene.durationSeconds = snapped;
  }
  storyboard.durationSeconds = storyboard.scenes.reduce((total, s) => total + s.durationSeconds, 0);
  const syncedMinutes = (storyboard.durationSeconds / 60).toFixed(1);
  logStep(`Final runtime: ${storyboard.durationSeconds.toFixed(1)}s (~${syncedMinutes} min)`);
  await writeJson(STORYBOARD_PATH, storyboard);
  await writeJson(path.join(PUBLIC_GENERATED_DIR, "storyboard.json"), storyboard);

  logStep("Composing final 16:9 long-form video with Remotion");
  await renderRemotion();

  logStep("Removing audio track");
  await stripAudioTrack();

  logStep("Extracting preview frames");
  const previewFrames = await extractPreviewFrames();

  const manifest: RenderManifest = {
    generatedAt: new Date().toISOString(),
    topic,
    outputVideo: FINAL_VIDEO_PATH,
    storyboard: STORYBOARD_PATH,
    durationSeconds: storyboard.durationSeconds,
    scenes: storyboard.scenes,
    previewFrames
  };

  await writeJson(MANIFEST_PATH, manifest);
  logStep(`Done: ${FINAL_VIDEO_PATH} (${syncedMinutes} min)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

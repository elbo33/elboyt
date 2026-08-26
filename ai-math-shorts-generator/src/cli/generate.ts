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
import {ensureDir, resetDir, writeJson} from "../core/fs";
import {logStep} from "../core/logger";
import type {RenderManifest} from "../core/types";
import * as shortestPathPlanner from "../planning/shortestPathPlanner";
import * as triangleAnglesPlanner from "../planning/triangleAnglesPlanner";
import * as circleAreaPlanner from "../planning/circleAreaPlanner";
import * as geometricSeriesPlanner from "../planning/geometricSeriesPlanner";
import * as irrationalSqrt2Planner from "../planning/irrationalSqrt2Planner";
import * as chessboardDominoPlanner from "../planning/chessboardDominoPlanner";
import * as oddSquaresPlanner from "../planning/oddSquaresPlanner";
import * as montyHallPlanner from "../planning/montyHallPlanner";
import * as varignonPlanner from "../planning/varignonPlanner";
import * as fibonacciSpiralPlanner from "../planning/fibonacciSpiralPlanner";
import * as laddercurvePlanner from "../planning/ladderCurvePlanner";
import * as divisibilityByThreePlanner from "../planning/divisibilityByThreePlanner";
import {stripAudioTrack} from "../rendering/finalize";
import {copyManimSupport, renderManimScene} from "../rendering/manim";
import {extractPreviewFrames} from "../rendering/preview";
import {renderRemotion} from "../rendering/remotion";

type Planner = {
  createStoryboard: (topic: string) => ReturnType<typeof shortestPathPlanner.createStoryboard>;
  getSceneCode: (sceneId: string) => string;
};

const PLANNERS: Record<string, Planner> = {
  "shortest-path": shortestPathPlanner,
  "triangle-angles": triangleAnglesPlanner,
  "circle-area": circleAreaPlanner,
  "geometric-series": geometricSeriesPlanner,
  "irrational-sqrt2": irrationalSqrt2Planner,
  "chessboard-domino": chessboardDominoPlanner,
  "odd-squares": oddSquaresPlanner,
  "monty-hall": montyHallPlanner,
  varignon: varignonPlanner,
  "fibonacci-spiral": fibonacciSpiralPlanner,
  "ladder-curve": laddercurvePlanner,
  "divisibility-by-three": divisibilityByThreePlanner
};

function parseArgs(argv: string[]): {topic: string; plannerKey: string} {
  const plannerFlag = argv.indexOf("--planner");
  const plannerKey = plannerFlag >= 0 && argv[plannerFlag + 1] ? argv[plannerFlag + 1] : "shortest-path";

  const topicFlag = argv.indexOf("--topic");
  if (topicFlag >= 0 && argv[topicFlag + 1]) {
    return {topic: argv[topicFlag + 1], plannerKey};
  }

  const positional = argv.filter((arg, index) => {
    if (arg === "--") return false;
    if (arg === "--planner" || argv[index - 1] === "--planner") return false;
    return true;
  });
  const topic = positional.join(" ").trim() || "Why is the shortest path between two points a straight line?";
  return {topic, plannerKey};
}

async function writeSceneSources(planner: Planner, storyboard: ReturnType<Planner["createStoryboard"]>): Promise<void> {
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

  logStep(`Preparing output for: ${topic} (planner: ${plannerKey})`);
  await resetDir(GENERATED_DIR);
  await resetDir(PUBLIC_GENERATED_DIR);
  await ensureDir(SCENE_SOURCE_DIR);
  await ensureDir(SCENE_RENDER_DIR);
  await ensureDir(REMOTION_EXPORT_DIR);
  await ensureDir(FRAME_DIR);

  logStep("Writing storyboard and Manim scene sources");
  await writeJson(STORYBOARD_PATH, storyboard);
  await writeJson(path.join(PUBLIC_GENERATED_DIR, "storyboard.json"), storyboard);
  await writeSceneSources(planner, storyboard);

  for (const scene of storyboard.scenes) {
    logStep(`Rendering ${scene.id} with Manim`);
    await renderManimScene(scene);
  }

  logStep("Composing final vertical short with Remotion");
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
    scenes: storyboard.scenes,
    previewFrames
  };

  await writeJson(MANIFEST_PATH, manifest);
  logStep(`Done: ${FINAL_VIDEO_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Dev helper: write the storyboard + all Manim chapter sources without rendering.
const path = require("node:path");
const fs = require("node:fs");
const {GENERATED_DIR, SCENE_SOURCE_DIR, STORYBOARD_PATH} = require("../dist/core/config");
const planner = require("../dist/planning/oddSquaresLongPlanner");
const {copyManimSupport} = require("../dist/rendering/manim");

async function main() {
  const topic = process.argv[2] || "Why is the sum of the first n odd numbers always a perfect square?";
  const sb = planner.createStoryboard(topic);
  fs.mkdirSync(SCENE_SOURCE_DIR, {recursive: true});
  fs.writeFileSync(STORYBOARD_PATH, JSON.stringify(sb, null, 2));
  await copyManimSupport();
  for (const scene of sb.scenes) {
    fs.mkdirSync(path.dirname(scene.sourcePath), {recursive: true});
    fs.writeFileSync(scene.sourcePath, planner.getSceneCode(scene.id));
    console.log(scene.id, "->", path.relative(process.cwd(), scene.sourcePath), scene.className);
  }
  console.log("\nplanned total:", sb.durationSeconds, "s (~" + (sb.durationSeconds / 60).toFixed(1) + " min)");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import fs from "node:fs/promises";

import {MANIFEST_PATH, STORYBOARD_PATH} from "../core/config";
import type {RenderManifest, Storyboard} from "../core/types";
import {extractScenePreviewFrames} from "../rendering/preview";

async function main(): Promise<void> {
  const storyboard = JSON.parse(await fs.readFile(STORYBOARD_PATH, "utf8")) as Storyboard;
  const scenePreviews = await extractScenePreviewFrames(storyboard);

  try {
    const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8")) as RenderManifest;
    manifest.scenePreviewFrames = scenePreviews.frames;
    manifest.sceneContactSheet = scenePreviews.contactSheet ?? undefined;
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  } catch {
    // A render may have scene clips and storyboard before the final manifest.
  }

  console.log(`Wrote ${scenePreviews.frames.length} scene preview PNGs.`);
  if (scenePreviews.contactSheet) console.log(`Contact sheet: ${scenePreviews.contactSheet}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

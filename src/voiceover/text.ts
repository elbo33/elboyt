import fs from "node:fs/promises";

import type {Storyboard} from "../core/types";

export function voiceoverTextFromStoryboard(storyboard: Storyboard): string {
  const blocks = storyboard.scenes
    .map((scene) => scene.narration?.trim())
    .filter((text): text is string => Boolean(text));

  if (blocks.length === 0) {
    throw new Error("Storyboard has no narration blocks to send to ElevenLabs.");
  }

  return blocks.join("\n\n");
}

export async function readStoryboard(filePath: string): Promise<Storyboard> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as Storyboard;
}

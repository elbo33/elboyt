import path from "node:path";
import fs from "node:fs/promises";

import {
  FINAL_VIDEO_PATH,
  GENERATED_DIR,
  PROJECT_ROOT,
  READY_MARKER,
  SHORTS_OUT_DIR,
  STORYBOARD_PATH
} from "../core/config";
import {loadProjectEnv} from "../core/env";
import {copyFileEnsured, writeJson} from "../core/fs";
import {logStep} from "../core/logger";
import {addAudioTrack} from "../rendering/finalize";
import {probeMediaDurationSeconds} from "../rendering/measure";
import {generateElevenLabsSpeech} from "../voiceover/elevenlabs";
import {readStoryboard, voiceoverTextFromStoryboard} from "../voiceover/text";

type ReadyMarker = {
  section: string;
  type: string;
  stage: "longform" | "shorts" | "stills";
  at: string;
  voiceoverAt?: string;
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function requireReady(): Promise<ReadyMarker> {
  try {
    return JSON.parse(await fs.readFile(READY_MARKER, "utf8")) as ReadyMarker;
  } catch {
    throw new Error("generated/ has no .ready.json. Render and approve visuals before adding voiceover.");
  }
}

async function renderVoiceover(
  storyboardPath: string,
  videoPath: string,
  audioPath: string,
  force: boolean
): Promise<{words: number; audioSeconds: number; videoSeconds: number; wpm: number}> {
  const storyboard = await readStoryboard(storyboardPath);
  const text = voiceoverTextFromStoryboard(storyboard);

  let stats;
  if ((await exists(audioPath)) && !force) {
    logStep(`Reusing existing ${path.relative(PROJECT_ROOT, audioPath)} (use --force to regenerate)`);
    stats = {wordCount: text.trim().split(/\s+/).filter(Boolean).length};
  } else {
    logStep(`Generating ElevenLabs voiceover -> ${path.relative(PROJECT_ROOT, audioPath)}`);
    stats = await generateElevenLabsSpeech(text, audioPath);
  }

  const audioSeconds = await probeMediaDurationSeconds(audioPath);
  const videoSeconds = await probeMediaDurationSeconds(videoPath);
  const wpm = stats.wordCount / (audioSeconds / 60);

  const silentPath = videoPath.replace(/\.mp4$/, ".silent.mp4");
  if (!(await exists(silentPath))) {
    await copyFileEnsured(videoPath, silentPath);
  }

  const voicedPath = videoPath.replace(/\.mp4$/, ".voiced.tmp.mp4");
  await addAudioTrack(silentPath, audioPath, voicedPath);
  await fs.rename(voicedPath, videoPath);

  return {words: stats.wordCount, audioSeconds, videoSeconds, wpm};
}

async function voiceLongform(force: boolean): Promise<void> {
  const result = await renderVoiceover(
    STORYBOARD_PATH,
    FINAL_VIDEO_PATH,
    path.join(GENERATED_DIR, "voiceover.mp3"),
    force
  );
  logStep(
    `Voiceover applied: ${result.words} words, ${result.audioSeconds.toFixed(1)}s audio, ` +
      `${result.videoSeconds.toFixed(1)}s video, ${result.wpm.toFixed(0)} WPM`
  );
}

async function voiceShorts(force: boolean): Promise<void> {
  const entries = await fs.readdir(SHORTS_OUT_DIR, {withFileTypes: true});
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (dirs.length === 0) throw new Error("generated/shorts/ is empty.");

  for (const slug of dirs) {
    const dir = path.join(SHORTS_OUT_DIR, slug);
    const result = await renderVoiceover(
      path.join(dir, "render", "storyboard.json"),
      path.join(dir, `${slug}.mp4`),
      path.join(dir, "voiceover.mp3"),
      force
    );
    logStep(
      `${slug}: ${result.words} words, ${result.audioSeconds.toFixed(1)}s audio, ` +
        `${result.videoSeconds.toFixed(1)}s video, ${result.wpm.toFixed(0)} WPM`
    );
  }
}

async function main(): Promise<void> {
  loadProjectEnv();
  const force = process.argv.includes("--force");
  const ready = await requireReady();

  if (ready.stage === "stills") {
    throw new Error("Voiceover is only for longform and shorts, not stills.");
  }

  if (ready.stage === "shorts") {
    await voiceShorts(force);
  } else {
    await voiceLongform(force);
  }

  await writeJson(READY_MARKER, {...ready, voiceoverAt: new Date().toISOString()});
  console.log(`\nReview the voiced render, then publish with: npm run publish:ready`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

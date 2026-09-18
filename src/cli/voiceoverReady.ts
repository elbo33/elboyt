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
import {run} from "../core/exec";
import {logStep} from "../core/logger";
import {addAudioTrack} from "../rendering/finalize";
import {probeMediaDurationSeconds} from "../rendering/measure";
import {
  ELEVENLABS_MODEL_ID,
  ELEVENLABS_OUTPUT_FORMAT,
  ELEVENLABS_VOICE_ID,
  ELEVENLABS_VOICE_SETTINGS,
  generateElevenLabsSpeech
} from "../voiceover/elevenlabs";
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
  const rawDir = path.join(path.dirname(audioPath), "voiceover-scene-parts", "raw");
  const timedDir = path.join(path.dirname(audioPath), "voiceover-scene-parts", "timed");
  await fs.mkdir(rawDir, {recursive: true});
  await fs.mkdir(timedDir, {recursive: true});

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const sceneSync = [];
  const timedParts = [];

  for (let i = 0; i < storyboard.scenes.length; i++) {
    const scene = storyboard.scenes[i];
    const narration = scene.narration?.trim();
    if (!narration) continue;

    const nn = String(i + 1).padStart(2, "0");
    const rawPath = path.join(rawDir, `${nn}-${scene.id}.mp3`);
    const timedPath = path.join(timedDir, `${nn}-${scene.id}.mp3`);
    const targetSeconds = scene.durationSeconds;

    if ((await exists(rawPath)) && !force) {
      logStep(`Reusing ${path.relative(PROJECT_ROOT, rawPath)} (use --force to regenerate)`);
    } else {
      logStep(`ElevenLabs scene ${nn}/${storyboard.scenes.length} -> ${scene.id}`);
      await generateElevenLabsSpeech(narration, rawPath);
    }

    const rawSeconds = await probeMediaDurationSeconds(rawPath);
    const tempo = rawSeconds / targetSeconds;
    const filters = [...atempoFilters(tempo), "apad", `atrim=0:${targetSeconds.toFixed(3)}`, "asetpts=N/SR/TB"];
    await run(
      "ffmpeg",
      [
        "-y",
        "-i",
        rawPath,
        "-filter:a",
        filters.join(","),
        "-c:a",
        "libmp3lame",
        "-b:a",
        "128k",
        timedPath
      ],
      PROJECT_ROOT
    );
    const timedSeconds = await probeMediaDurationSeconds(timedPath);
    sceneSync.push({
      scene: scene.id,
      raw: path.relative(path.dirname(audioPath), rawPath),
      timed: path.relative(path.dirname(audioPath), timedPath),
      rawSeconds,
      targetSeconds,
      timedSeconds,
      tempoCorrection: tempo
    });
    timedParts.push(timedPath);
  }

  const concatList = path.join(path.dirname(audioPath), "voiceover-scenes.txt");
  await fs.writeFile(concatList, timedParts.map((file) => `file '${file}'`).join("\n") + "\n", "utf8");
  const rawCombinedPath = audioPath.replace(/\.mp3$/, ".scene-synced.raw.mp3");
  await run(
    "ffmpeg",
    ["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c:a", "libmp3lame", "-b:a", "128k", rawCombinedPath],
    PROJECT_ROOT
  );

  const videoSeconds = await probeMediaDurationSeconds(videoPath);
  await run(
    "ffmpeg",
    [
      "-y",
      "-i",
      rawCombinedPath,
      "-filter:a",
      `apad,atrim=0:${videoSeconds.toFixed(3)},asetpts=N/SR/TB`,
      "-c:a",
      "libmp3lame",
      "-b:a",
      "128k",
      audioPath
    ],
    PROJECT_ROOT
  );

  const audioSeconds = await probeMediaDurationSeconds(audioPath);
  const wpm = wordCount / (audioSeconds / 60);

  const silentPath = videoPath.replace(/\.mp4$/, ".silent.mp4");
  if (!(await exists(silentPath))) {
    await copyFileEnsured(videoPath, silentPath);
  }

  const voicedPath = videoPath.replace(/\.mp4$/, ".voiced.tmp.mp4");
  await addAudioTrack(silentPath, audioPath, voicedPath);
  await fs.rename(voicedPath, videoPath);

  await writeJson(path.join(path.dirname(audioPath), "voiceover.json"), {
    generatedAt: new Date().toISOString(),
    source: {
      storyboard: path.relative(path.dirname(audioPath), storyboardPath),
      silentVideo: path.relative(path.dirname(audioPath), silentPath),
      voiceover: path.basename(audioPath),
      sceneSyncedRaw: path.basename(rawCombinedPath),
      sceneParts: path.relative(path.dirname(audioPath), timedDir)
    },
    elevenLabs: {
      voiceId: ELEVENLABS_VOICE_ID,
      modelId: ELEVENLABS_MODEL_ID,
      outputFormat: ELEVENLABS_OUTPUT_FORMAT,
      voiceSettings: ELEVENLABS_VOICE_SETTINGS
    },
    text: {
      wordCount,
      characterCount: text.length,
      sceneCount: sceneSync.length
    },
    media: {
      audioSeconds,
      videoSeconds,
      measuredWpm: wpm,
      syncStrategy: "scene-by-scene ElevenLabs generation with per-scene atempo retime"
    },
    sceneSync
  });

  return {words: wordCount, audioSeconds, videoSeconds, wpm};
}

function atempoFilters(tempo: number): string[] {
  if (!Number.isFinite(tempo) || tempo <= 0) {
    throw new Error(`Invalid audio tempo correction: ${tempo}`);
  }
  const filters: string[] = [];
  let remaining = tempo;
  while (remaining > 2) {
    filters.push("atempo=2");
    remaining /= 2;
  }
  while (remaining < 0.5) {
    filters.push("atempo=0.5");
    remaining /= 0.5;
  }
  filters.push(`atempo=${remaining.toFixed(6)}`);
  return filters;
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

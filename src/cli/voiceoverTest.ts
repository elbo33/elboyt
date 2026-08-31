import path from "node:path";
import fs from "node:fs/promises";

import {PROJECT_ROOT} from "../core/config";
import {loadProjectEnv} from "../core/env";
import {logStep} from "../core/logger";
import {probeMediaDurationSeconds} from "../rendering/measure";
import {
  ELEVENLABS_MODEL_ID,
  ELEVENLABS_OUTPUT_FORMAT,
  ELEVENLABS_VOICE_ID,
  ELEVENLABS_VOICE_SETTINGS,
  generateElevenLabsSpeech
} from "../voiceover/elevenlabs";
import {countVoiceoverWords} from "../voiceover/timing";

const TEST_TEXT = [
  "Zróbmy szybki test tempa narracji.",
  "Wyobraź sobie, że na ekranie widzisz prosty przykład z funkcją liniową.",
  "Najpierw odczytujemy współczynnik kierunkowy, potem sprawdzamy punkt przecięcia z osią igrek.",
  "Jeżeli wykres rośnie, współczynnik jest dodatni.",
  "Jeżeli wykres maleje, współczynnik jest ujemny.",
  "Na maturze taka obserwacja często wystarczy, żeby odrzucić błędne odpowiedzi i spokojnie policzyć wynik."
].join(" ");

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  loadProjectEnv();

  const force = process.argv.includes("--force");
  const audioPath = path.join(PROJECT_ROOT, "voiceover-speed-test.mp3");
  const reportPath = path.join(PROJECT_ROOT, "voiceover-speed-test.md");

  let stats;
  if ((await exists(audioPath)) && !force) {
    logStep("Reusing existing voiceover-speed-test.mp3 (use --force to regenerate)");
    stats = {
      voiceId: ELEVENLABS_VOICE_ID,
      modelId: ELEVENLABS_MODEL_ID,
      outputFormat: ELEVENLABS_OUTPUT_FORMAT,
      settings: ELEVENLABS_VOICE_SETTINGS,
      characterCount: TEST_TEXT.length,
      wordCount: countVoiceoverWords(TEST_TEXT)
    };
  } else {
    logStep("Generating Polish ElevenLabs speed test -> voiceover-speed-test.mp3");
    stats = await generateElevenLabsSpeech(TEST_TEXT, audioPath);
  }

  const durationSeconds = await probeMediaDurationSeconds(audioPath);
  const wpm = stats.wordCount / (durationSeconds / 60);

  await fs.writeFile(
    reportPath,
    [
      "# Voiceover speed test",
      "",
      `Audio: \`voiceover-speed-test.mp3\``,
      `Duration: ${durationSeconds.toFixed(2)} seconds`,
      `Words: ${stats.wordCount}`,
      `Measured speed: ${wpm.toFixed(1)} WPM`,
      `Production script budget: ${wpm.toFixed(1)} WPM until a newer accepted calibration replaces this file.`,
      "",
      "## ElevenLabs settings",
      "",
      `Voice ID: \`${stats.voiceId}\``,
      `Model: \`${stats.modelId}\``,
      `Output format: \`${stats.outputFormat}\``,
      `Speed: ${stats.settings.speed}`,
      `Stability: ${stats.settings.stability}`,
      `Similarity boost: ${stats.settings.similarity_boost}`,
      `Style: ${stats.settings.style}`,
      `Speaker boost: ${stats.settings.use_speaker_boost ? "enabled" : "disabled"}`,
      "",
      "## Polish test script",
      "",
      TEST_TEXT,
      ""
    ].join("\n"),
    "utf8"
  );

  console.log(`\nWrote ${path.relative(PROJECT_ROOT, audioPath)}`);
  console.log(`Wrote ${path.relative(PROJECT_ROOT, reportPath)}`);
  console.log(`Measured: ${stats.wordCount} words / ${durationSeconds.toFixed(2)}s = ${wpm.toFixed(1)} WPM`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

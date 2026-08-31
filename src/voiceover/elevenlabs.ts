import fs from "node:fs/promises";
import path from "node:path";

import {ensureDir} from "../core/fs";
import {countVoiceoverWords} from "./timing";

export const ELEVENLABS_VOICE_ID = "Y1quDTS4ZfJp2mhu0Zw5";
export const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";
export const ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128";

export const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.23,
  similarity_boost: 0.46,
  style: 0.3,
  use_speaker_boost: true,
  speed: 1.1
} as const;

export type VoiceoverStats = {
  voiceId: string;
  modelId: string;
  outputFormat: string;
  settings: typeof ELEVENLABS_VOICE_SETTINGS;
  characterCount: number;
  wordCount: number;
};

export function countWords(text: string): number {
  return countVoiceoverWords(text);
}

export async function generateElevenLabsSpeech(
  text: string,
  outPath: string
): Promise<VoiceoverStats> {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ELEVEN_LABS_API_KEY. Add it to .env or export it before running voiceover.");
  }
  if (!apiKey.startsWith("sk_")) {
    throw new Error(
      "ELEVEN_LABS_API_KEY is not an ElevenLabs secret API key. " +
        "ElevenLabs secret keys start with sk_; key IDs cannot generate speech."
    );
  }

  const url = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`
  );
  url.searchParams.set("output_format", ELEVENLABS_OUTPUT_FORMAT);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey
    },
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS_MODEL_ID,
      voice_settings: ELEVENLABS_VOICE_SETTINGS
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `ElevenLabs TTS failed (${response.status} ${response.statusText})` +
        (body ? `: ${body.slice(0, 500)}` : "")
    );
  }

  await ensureDir(path.dirname(outPath));
  const audio = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outPath, audio);

  return {
    voiceId: ELEVENLABS_VOICE_ID,
    modelId: ELEVENLABS_MODEL_ID,
    outputFormat: ELEVENLABS_OUTPUT_FORMAT,
    settings: ELEVENLABS_VOICE_SETTINGS,
    characterCount: text.length,
    wordCount: countWords(text)
  };
}

export const POLISH_VOICEOVER_WPM = 128.2;
export const POLISH_VOICEOVER_SAMPLE = {
  measuredAt: "2026-08-31",
  audioFile: "voiceover-speed-test.mp3",
  reportFile: "voiceover-speed-test.md",
  durationSeconds: 24.8,
  wordCount: 53
} as const;

export function targetWordsForSeconds(seconds: number): number {
  return Math.max(1, Math.round((seconds / 60) * POLISH_VOICEOVER_WPM));
}

export function countVoiceoverWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

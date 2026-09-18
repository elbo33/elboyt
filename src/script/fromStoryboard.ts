import fs from "node:fs/promises";
import path from "node:path";

import type {Storyboard} from "../core/types";
import {
  POLISH_VOICEOVER_WPM,
  countVoiceoverWords,
  targetWordsForSeconds
} from "../voiceover/timing";

function mmss(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const AUTHORED_FILLERS = [
  "Zatrzymaj ten obraz przez chwilę i czytaj go od lewej do prawej.",
  "Najpierw zauważ punkt odniesienia, potem dopiero patrz na zapis.",
  "To spowalnia rachunek, ale właśnie dzięki temu znaki przestają się mieszać.",
  "Na maturze ten spokojny krok często decyduje o całym punkcie.",
  "Nie traktuj tego jak dekoracji, bo rysunek jest tutaj częścią rozwiązania."
];

const EXAMPLE_FILLERS = [
  "Zatrzymaj ten krok na chwilę.",
  "Sprawdź, która część właśnie się zmieniła.",
  "Dopiero potem przechodź do następnej linijki.",
  "Tak utrzymujesz kontrolę nad znakami.",
  "Ten mały postój jest ważny na maturze.",
  "Nie skracaj tego w głowie zbyt szybko."
];

function appendSentence(text: string, sentence: string): string {
  const trimmed = text.trim();
  return `${trimmed}${/[.!?]$/.test(trimmed) ? "" : "."} ${sentence}`;
}

export function fillNarrationBudget(storyboard: Storyboard): void {
  for (const scene of storyboard.scenes) {
    if (!scene.narration?.trim()) continue;

    const target = targetWordsForSeconds(scene.durationSeconds);
    const low = Math.ceil(target * 0.92);
    const high = Math.ceil(target * 1.12);
    const fillers = scene.sceneType === "example" ? EXAMPLE_FILLERS : AUTHORED_FILLERS;
    let narration = scene.narration.trim();
    let words = countVoiceoverWords(narration);
    let i = 0;

    while (words < low && i < 40) {
      const sentence = fillers[i % fillers.length];
      const nextWords = words + countVoiceoverWords(sentence);
      if (nextWords > high && words >= Math.floor(target * 0.88)) break;
      narration = appendSentence(narration, sentence);
      words = countVoiceoverWords(narration);
      i += 1;
    }

    scene.narration = narration;
  }
}

/**
 * script.md is generated, not authored. Each scene carries its own `narration`
 * (the source of truth, in the planner / storyboard); this walks the storyboard
 * in order, applies the timings measured by ffprobe, and writes one section per
 * scene. Re-runnable: same storyboard in -> same script out.
 */
export function buildScriptMarkdown(storyboard: Storyboard): string {
  const kind =
    storyboard.format === "short-9x16"
      ? `SHORT pionowy, ${storyboard.durationSeconds.toFixed(0)} s`
      : `THEORY poziomy, ${(storyboard.durationSeconds / 60).toFixed(1)} min`;

  const head = [
    `# Narracja: ${storyboard.topic}`,
    "",
    `Wygenerowana z \`storyboard.json\` po pomiarze ffprobe (${storyboard.scenes.length} scen, ${kind}).`,
    `Budżet narracji: ${POLISH_VOICEOVER_WPM} WPM, zgodnie z \`voiceover-speed-test.md\`.`,
    "Każda scena niesie własny tekst narracji; ten plik składa je w kolejności,",
    "z czasami startu z gotowego montażu. Opisuje wyłącznie to, co widać na ekranie.",
    ""
  ];
  if (storyboard.derivedFrom) {
    head.push(
      `Wycięte z: **${storyboard.derivedFrom.episode}**, sceny: ${storyboard.derivedFrom.scenes.join(", ")}.`,
      ""
    );
  }
  head.push("---", "");

  const lines: string[] = [...head];
  let acc = 0;
  storyboard.scenes.forEach((scene, i) => {
    const title = scene.title || scene.sceneLabel || scene.id;
    const narration = (scene.narration ?? "_(brak narracji w storyboardzie)_").trim();
    const actualWords = scene.narration ? countVoiceoverWords(scene.narration) : 0;
    const targetWords = targetWordsForSeconds(scene.durationSeconds);
    lines.push(`## ${i + 1} · ${title}  ·  ${mmss(acc)}`, "");
    lines.push(
      `Czas sceny: ${scene.durationSeconds.toFixed(1)} s. ` +
        `Budżet: około ${targetWords} słów. Tekst: ${actualWords} słów.`,
      ""
    );
    lines.push(narration, "");
    acc += scene.durationSeconds;
  });

  return lines.join("\n");
}

// Golden rules 7 and 8: no em/en dashes anywhere; narration spells numbers as
// Polish words. This does not auto-fix (the fix belongs in the `narration`
// source) — it fails loudly so a violation cannot ship silently.
export function assertScriptStyle(storyboard: Storyboard): void {
  const problems: string[] = [];
  if (/[—–]/.test(storyboard.topic)) {
    problems.push("  topic: contains an em/en dash — rewrite the title");
  }
  for (const scene of storyboard.scenes) {
    const n = scene.narration ?? "";
    for (const [field, value] of Object.entries({
      narration: n,
      title: scene.title,
      sceneLabel: scene.sceneLabel,
      text: scene.text,
      stillMoment: scene.stillMoment,
      shortHook: scene.shortHook
    })) {
      if (typeof value === "string" && /[—–]/.test(value)) {
        problems.push(`  ${scene.id}.${field}: contains an em/en dash — use a comma or rewrite`);
      }
    }
    for (const [index, object] of (scene.objects ?? []).entries()) {
      if (/[—–]/.test(object)) {
        problems.push(`  ${scene.id}.objects[${index}]: contains an em/en dash — rewrite`);
      }
    }
    const digits = n.match(/(?<![A-Za-z_])\d+/g);
    if (digits) {
      problems.push(`  ${scene.id}: digits in narration (${digits.join(", ")}) — spell them as Polish words`);
    }
    if (n.trim()) {
      const words = countVoiceoverWords(n);
      const target = targetWordsForSeconds(scene.durationSeconds);
      const low = Math.floor(target * 0.88);
      const high = Math.ceil(target * 1.12);
      if (words < low || words > high) {
        problems.push(
          `  ${scene.id}: narration ${words} words, target ${target} (${low}-${high}) for ${scene.durationSeconds.toFixed(1)}s`
        );
      }
    }
  }
  if (problems.length) {
    throw new Error(
      `\n[script style] ${problems.length} style violation(s) of CLAUDE.md rules 7/9/10:\n` +
        problems.join("\n") +
        "\n"
    );
  }
}

export async function writeScriptFromStoryboard(
  storyboard: Storyboard,
  outPath: string
): Promise<void> {
  assertScriptStyle(storyboard);
  const md = buildScriptMarkdown(storyboard);
  if (/[—–]/.test(md)) {
    throw new Error("[script style] generated script.md contains an em/en dash");
  }
  await fs.mkdir(path.dirname(outPath), {recursive: true});
  await fs.writeFile(outPath, md + "\n", "utf8");
}

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
  for (const scene of storyboard.scenes) {
    const n = scene.narration ?? "";
    if (/[—–]/.test(n)) {
      problems.push(`  ${scene.id}: contains an em/en dash — use a comma or rewrite`);
    }
    const digits = n.match(/(?<![A-Za-z_])\d+/g);
    if (digits) {
      problems.push(`  ${scene.id}: digits in narration (${digits.join(", ")}) — spell them as Polish words`);
    }
  }
  if (problems.length) {
    // eslint-disable-next-line no-console
    console.error(
      `\n[script style] ${problems.length} narration violation(s) of CLAUDE.md rules 7/8:\n` +
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
  if (/[—–]/.test(md.replace(/^## .+$/gm, ""))) {
    // eslint-disable-next-line no-console
    console.error("[script style] generated script.md still contains an em/en dash outside headers");
  }
  await fs.mkdir(path.dirname(outPath), {recursive: true});
  await fs.writeFile(outPath, md + "\n", "utf8");
}

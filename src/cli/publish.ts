import {execFile} from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

import {
  FINAL_VIDEO_PATH,
  GENERATED_DIR,
  PROJECT_ROOT,
  PUBLIC_GENERATED_DIR,
  READY_MARKER,
  SCENE_SOURCE_DIR,
  SHORTS_OUT_DIR,
  STILLS_SPEC_PATH,
  STILLS_OUT_DIR,
  STORYBOARD_PATH,
  THUMBNAIL_PATH
} from "../core/config";
import {copyFileEnsured, ensureDir, resetDir} from "../core/fs";
import {
  EPISODE_TYPES,
  episodeBasename,
  episodeDir,
  isEpisodeType,
  shortsDir,
  stillsDir
} from "../core/library";
import {logStep} from "../core/logger";
import type {EpisodeType} from "../core/library";

type Stage = "longform" | "shorts" | "stills";

function usage(): never {
  console.error(
    [
      "Usage: npm run publish -- <section> <type> [stage]",
      "",
      `  <type>   one of: ${EPISODE_TYPES.join(", ")}`,
      "  [stage]  longform (default) | shorts | stills",
      "",
      "Copies the approved render from generated/ into library/, then wipes",
      "generated/ and public/. Run the matching generate stage first."
    ].join("\n")
  );
  process.exit(1);
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// Refuse to publish anything other than what `generate` just staged.
async function requireReady(section: string, type: EpisodeType, stage: Stage): Promise<void> {
  let marker: {section?: string; type?: string; stage?: string; at?: string};
  try {
    marker = JSON.parse(await fs.readFile(READY_MARKER, "utf8"));
  } catch {
    throw new Error(
      `generated/ has no .ready.json — run: npm run generate -- ${section} ${type}` +
        (stage === "longform" ? "" : ` ${stage}`)
    );
  }
  if (marker.section !== section || marker.type !== type || marker.stage !== stage) {
    throw new Error(
      `generated/ holds ${marker.section}/${marker.type} (${marker.stage}), ` +
        `not ${section}/${type} (${stage}). Re-run generate for what you want to publish.`
    );
  }
}

async function wipeScratch(): Promise<void> {
  logStep("Wiping generated/ and public/ (scratch)");
  await resetDir(GENERATED_DIR);
  await resetDir(PUBLIC_GENERATED_DIR);
}

function currentCommit(): Promise<string> {
  return new Promise((resolve) => {
    execFile("git", ["rev-parse", "--short", "HEAD"], {cwd: PROJECT_ROOT}, (_e, out) =>
      resolve((out || "").toString().trim() || "unknown")
    );
  });
}

// Copy the section-authoring source (the "planner + section content" that
// reproduces this episode) by matching `slug: "<section>"` in the file body.
async function copySectionSource(section: string, destDir: string): Promise<void> {
  const dir = path.join(PROJECT_ROOT, "src", "planning", "longform", "sections");
  for (const name of await fs.readdir(dir)) {
    if (!name.endsWith(".ts")) continue;
    const body = await fs.readFile(path.join(dir, name), "utf8");
    if (body.includes(`slug: "${section}"`)) {
      await copyFileEnsured(path.join(dir, name), path.join(destDir, name));
      return;
    }
  }
  logStep(`  note: no section source matched slug "${section}" (planner code still in git)`);
}

async function publishLongform(section: string, type: EpisodeType): Promise<void> {
  await requireReady(section, type, "longform");
  if (!(await exists(FINAL_VIDEO_PATH))) {
    throw new Error(`No generated/video.mp4 — run: npm run generate -- ${section} ${type}`);
  }
  const dest = episodeDir(section, type);
  const base = episodeBasename(section, type);
  const renderDir = path.join(dest, "render");

  logStep(`Publishing long form -> ${path.relative(PROJECT_ROOT, dest)}`);
  await ensureDir(dest);
  await copyFileEnsured(FINAL_VIDEO_PATH, path.join(dest, `${base}.mp4`));
  await copyFileEnsured(path.join(GENERATED_DIR, "script.md"), path.join(dest, "script.md"));
  if (await exists(THUMBNAIL_PATH)) {
    await copyFileEnsured(THUMBNAIL_PATH, path.join(dest, "thumbnail.png"));
  } else {
    logStep("  WARNING: no generated/thumbnail.png — publishing without a thumbnail");
  }

  // render/: the reproducers only — storyboard, scene sources (+ support),
  // section authoring, COMMAND.md. Never the Manim cache or per-scene clips.
  await resetDir(renderDir);
  await copyFileEnsured(STORYBOARD_PATH, path.join(renderDir, "storyboard.json"));
  await fs.cp(SCENE_SOURCE_DIR, path.join(renderDir, "scenes"), {recursive: true});
  await copySectionSource(section, renderDir);
  await fs.writeFile(
    path.join(renderDir, "COMMAND.md"),
    `# Reproduce\n\n\`\`\`\nnpm run generate -- ${section} ${type}\nnpm run publish  -- ${section} ${type}\n\`\`\`\n\n` +
      `Built at commit ${await currentCommit()}. The thumbnail is rendered as the\n` +
      `last step of the long-form stage (ThumbA-flat style).\n`,
    "utf8"
  );

  await wipeScratch();
  logStep(`Done. library/videos/${section}/${type}/ now holds ${base}.mp4 + script.md + thumbnail.png + render/`);
}

async function publishShorts(section: string, type: EpisodeType): Promise<void> {
  await requireReady(section, type, "shorts");
  if (!(await exists(SHORTS_OUT_DIR))) {
    throw new Error(
      `No generated/shorts/ — run: npm run generate -- ${section} ${type} shorts`
    );
  }
  const slugs = (await fs.readdir(SHORTS_OUT_DIR, {withFileTypes: true}))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  if (slugs.length === 0) throw new Error("generated/shorts/ is empty");

  const dest = shortsDir(section, type);
  logStep(`Publishing ${slugs.length} short(s) -> ${path.relative(PROJECT_ROOT, dest)}/`);
  for (const slug of slugs) {
    const from = path.join(SHORTS_OUT_DIR, slug);
    const to = path.join(dest, slug);
    await resetDir(to);
    await fs.cp(from, to, {recursive: true});
    await fs.writeFile(
      path.join(to, "render", "COMMAND.md"),
      `# Reproduce\n\n\`\`\`\nnpm run generate -- ${section} ${type} shorts\nnpm run publish  -- ${section} ${type} shorts\n\`\`\`\n\n` +
        `Derived from the ${section}/${type} episode. Planner: src/planning/shorts/.\n`,
      "utf8"
    );
    logStep(`  ${slug}`);
  }

  await wipeScratch();
  logStep(`Done. ${slugs.length} short(s) under library/videos/${section}/${type}/shorts/`);
}

async function publishStills(section: string, type: EpisodeType): Promise<void> {
  await requireReady(section, type, "stills");
  if (!(await exists(STILLS_OUT_DIR))) {
    throw new Error(`No generated/stills/ — run: npm run generate -- ${section} ${type} stills`);
  }
  const files = (await fs.readdir(STILLS_OUT_DIR)).filter((f) => /\.(png|md)$/.test(f));
  if (files.length === 0) throw new Error("generated/stills/ has no .png/.md");

  const dest = stillsDir(section, type);
  const renderDir = path.join(dest, "render");
  logStep(`Publishing ${files.filter((f) => f.endsWith(".png")).length} still(s) -> ${path.relative(PROJECT_ROOT, dest)}/`);
  await resetDir(dest);
  for (const f of files) {
    await copyFileEnsured(path.join(STILLS_OUT_DIR, f), path.join(dest, f));
  }
  const specs = path.join(PROJECT_ROOT, "src", "planning", "stills", section, `${type}.json`);
  if (await exists(specs)) {
    await copyFileEnsured(specs, path.join(renderDir, `${type}.json`));
  } else if (await exists(STILLS_SPEC_PATH)) {
    await copyFileEnsured(STILLS_SPEC_PATH, path.join(renderDir, `${type}.json`));
  }
  await fs.writeFile(
    path.join(renderDir, "COMMAND.md"),
    `# Reproduce\n\n\`\`\`\nnpm run generate -- ${section} ${type} stills\nnpm run publish  -- ${section} ${type} stills\n\`\`\`\n\n` +
      `1:1 (1080x1080) quiz stills: statement + A/B/C/D + comment CTA, plus a\n` +
      `.md post caption per card. Specs: src/planning/stills/${section}/${type}.json.\n`,
    "utf8"
  );

  await wipeScratch();
  logStep(`Done. Stills under library/videos/${section}/${type}/stills/`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const section = argv[0];
  const type = argv[1];
  const stage = (argv[2] ?? "longform") as Stage;
  if (!section || !type) usage();
  if (!isEpisodeType(type)) {
    console.error(`Unknown type "${type}". Expected: ${EPISODE_TYPES.join(", ")}`);
    process.exit(1);
  }

  if (stage === "shorts") return publishShorts(section, type);
  if (stage === "stills") return publishStills(section, type);
  if (stage === "longform") return publishLongform(section, type);
  usage();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

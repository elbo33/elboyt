import fs from "node:fs";
import path from "node:path";

import {GENERATED_DIR, READY_MARKER} from "../core/config";
import {
  EPISODE_TYPES,
  episodeBasename,
  episodeDir,
  shortsDir,
  stillsDir
} from "../core/library";
import type {EpisodeType} from "../core/library";
import {loadTeachingSections} from "../planning/zaspro";

export const STAGES = ["longform", "shorts", "stills"] as const;
export type Stage = (typeof STAGES)[number];

export type ProductionTarget = {
  section: string;
  sectionName: string;
  type: EpisodeType;
  stage: Stage;
};

export type ReadyMarker = {
  section: string;
  type: EpisodeType;
  stage: Stage;
  at?: string;
};

export type ProductionStatus =
  | {kind: "ready"; ready: ReadyMarker}
  | {kind: "next"; target: ProductionTarget}
  | {kind: "complete"};

function exists(p: string): boolean {
  return fs.existsSync(p);
}

function hasPublishedLongform(section: string, type: EpisodeType): boolean {
  const dir = episodeDir(section, type);
  const base = episodeBasename(section, type);
  return (
    exists(path.join(dir, "script.md")) &&
    exists(path.join(dir, "render", "storyboard.json")) &&
    (exists(path.join(dir, `${base}.mp4`)) || exists(path.join(dir, "render", "COMMAND.md")))
  );
}

function hasPublishedShorts(section: string, type: EpisodeType): boolean {
  const dir = shortsDir(section, type);
  if (!exists(dir)) return false;
  return fs.readdirSync(dir, {withFileTypes: true}).some((entry) => {
    if (!entry.isDirectory()) return false;
    const child = path.join(dir, entry.name);
    return exists(path.join(child, "script.md")) && exists(path.join(child, "render", "storyboard.json"));
  });
}

function hasPublishedStills(section: string, type: EpisodeType): boolean {
  const dir = stillsDir(section, type);
  if (!exists(dir)) return false;
  const hasCaption = fs.readdirSync(dir).some((name) => name.endsWith(".md"));
  return hasCaption && exists(path.join(dir, "render", "COMMAND.md"));
}

export function isStageComplete(section: string, type: EpisodeType, stage: Stage): boolean {
  if (stage === "longform") return hasPublishedLongform(section, type);
  if (stage === "shorts") return hasPublishedShorts(section, type);
  return hasPublishedStills(section, type);
}

export function readReadyMarker(): ReadyMarker | null {
  if (!exists(READY_MARKER)) return null;
  const parsed = JSON.parse(fs.readFileSync(READY_MARKER, "utf8")) as ReadyMarker;
  if (!EPISODE_TYPES.includes(parsed.type) || !STAGES.includes(parsed.stage)) {
    throw new Error(`Invalid ${path.relative(process.cwd(), READY_MARKER)}.`);
  }
  return parsed;
}

export function nextProductionStatus(): ProductionStatus {
  const ready = readReadyMarker();
  if (ready) return {kind: "ready", ready};

  for (const section of loadTeachingSections()) {
    for (const type of EPISODE_TYPES) {
      for (const stage of STAGES) {
        if (!isStageComplete(section.slug, type, stage)) {
          return {
            kind: "next",
            target: {
              section: section.slug,
              sectionName: section.name,
              type,
              stage
            }
          };
        }
      }
    }
  }
  return {kind: "complete"};
}

export function generateCommand(target: ProductionTarget): string {
  const stage = target.stage === "longform" ? "" : ` ${target.stage}`;
  return `npm run generate -- ${target.section} ${target.type}${stage}`;
}

export function publishCommand(target: ProductionTarget | ReadyMarker): string {
  const stage = target.stage === "longform" ? "" : ` ${target.stage}`;
  return `npm run publish -- ${target.section} ${target.type}${stage}`;
}

export function generatedDirHasWork(): boolean {
  if (!exists(GENERATED_DIR)) return false;
  return fs.readdirSync(GENERATED_DIR).some((name) => name !== ".DS_Store");
}

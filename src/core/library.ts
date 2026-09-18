import path from "node:path";

import {PROJECT_ROOT} from "./config";
import {loadTeachingSections} from "../planning/zaspro";

// The library is the ledger: what is on disk is what has been made. It is
// grouped by ZasPro section, then by episode type, so the four videos of a
// section live together (that is how the pipeline is worked through). Shorts
// and stills nest under the episode they were derived from.
//
//   library/videos/<order>-<section>/<type>/
//     <section>-<polish>.mp4      final render (git-ignored; the render itself)
//     script.md                  word-for-word narration, generated from storyboard
//     thumbnail.png              1920x1080, ThumbA-flat style (git-ignored)
//     render/                    planner + section content + storyboard.json
//                                + scenes/*.py (+ support/) + COMMAND.md
//     shorts/<slug>/             mp4 + script.md + render/
//     stills/                    *.png + *.md + render/
//
// Nothing lands here except through `npm run publish`, and only after approval.

export const LIBRARY_DIR = path.join(PROJECT_ROOT, "library");

export const EPISODE_TYPES = ["theory", "exercises", "mistakes", "challenge"] as const;
export type EpisodeType = (typeof EPISODE_TYPES)[number];

// The mp4 / render-folder basename uses a Polish token, not the English folder
// name (folder: theory/ ... file: <section>-teoria.mp4).
export const POLISH_TOKEN: Record<EpisodeType, string> = {
  theory: "teoria",
  exercises: "zadania",
  mistakes: "bledy",
  challenge: "wyzwanie"
};

export function isEpisodeType(value: string): value is EpisodeType {
  return (EPISODE_TYPES as readonly string[]).includes(value);
}

export function episodeDir(section: string, type: EpisodeType): string {
  return path.join(LIBRARY_DIR, "videos", numberedSectionDir(section), type);
}

// The teaching-section YAML is the single source of truth for library order.
// Two digits sort all 62 sections in curriculum order in a file browser.
export function numberedSectionDir(section: string): string {
  const index = loadTeachingSections().findIndex((item) => item.slug === section);
  if (index < 0) {
    throw new Error(`Unknown teaching section "${section}"; cannot name library folder.`);
  }
  return `${String(index + 1).padStart(2, "0")}-${section}`;
}

export function episodeBasename(section: string, type: EpisodeType): string {
  return `${section}-${POLISH_TOKEN[type]}`;
}

export function shortsDir(section: string, type: EpisodeType): string {
  return path.join(episodeDir(section, type), "shorts");
}

export function stillsDir(section: string, type: EpisodeType): string {
  return path.join(episodeDir(section, type), "stills");
}

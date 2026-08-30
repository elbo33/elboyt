import path from "node:path";

import {FPS, SCENE_RENDER_DIR, SCENE_SOURCE_DIR} from "../../core/config";
import {slugify} from "../../core/slug";
import type {SceneType, Storyboard, VideoScene} from "../../core/types";
import {ciagArytmetycznyDziesiaty} from "./ciagArytmetycznyDziesiaty";
import {ciagArytmetycznyIntuicja} from "./ciagArytmetycznyIntuicja";
import {ciagArytmetycznyN1} from "./ciagArytmetycznyN1";
import {ciagArytmetycznySuma} from "./ciagArytmetycznySuma";
import type {ShortSpec} from "./types";

const SHORTS: Record<string, ShortSpec> = {
  "ciag-arytmetyczny-n1": ciagArytmetycznyN1,
  "ciag-arytmetyczny-suma": ciagArytmetycznySuma,
  "ciag-arytmetyczny-dziesiaty": ciagArytmetycznyDziesiaty,
  "ciag-arytmetyczny-intuicja": ciagArytmetycznyIntuicja
};

function currentKey(): string {
  return process.env.SHORT || "ciag-arytmetyczny-n1";
}

function spec(): ShortSpec {
  const s = SHORTS[currentKey()];
  if (!s) {
    throw new Error(
      `No short "${currentKey()}". Registered: ${Object.keys(SHORTS).join(", ")}`
    );
  }
  return s;
}

export function createStoryboard(topic: string): Storyboard {
  const s = spec();
  const scenes: VideoScene[] = s.scenes.map((sc, i) => ({
    id: sc.id,
    title: sc.title,
    className: sc.className,
    durationSeconds: sc.durationSeconds,
    sceneType: (i === 0 ? "hook" : "example") as SceneType,
    sceneLabel: sc.title,
    sceneIndex: i + 1,
    standalone: true,
    narration: sc.narration,
    derivedFromScene: sc.derivedFromScene,
    purpose: sc.title,
    mathematicalConcept: sc.narration,
    objects: [],
    animation: "Short: vertical, pace=fast, hard cuts.",
    camera: "Static 9:16 frame; bottom 25% kept clear.",
    text: sc.title,
    transition: "Hard cut.",
    sourcePath: path.join(SCENE_SOURCE_DIR, `${sc.id}.py`),
    renderPath: path.join(SCENE_RENDER_DIR, `${sc.id}.mp4`),
    publicPath: `generated/scenes/${sc.id}.mp4`
  }));

  void topic; // the short's title is fixed by its spec, not the CLI arg
  return {
    topic: s.topic,
    slug: slugify(s.slug),
    sectionSlug: "ciag-arytmetyczny",
    episodeType: "THEORY",
    format: "short-9x16",
    fps: FPS,
    width: 1080,
    height: 1920,
    durationSeconds: scenes.reduce((t, x) => t + x.durationSeconds, 0),
    crossfadeFrames: 0,
    derivedFrom: {episode: s.fromEpisode, scenes: s.derivedScenes},
    visualIdentity: {
      background: "#081018",
      foreground: "#F7FAFF",
      accent: "#22D3EE",
      secondaryAccent: "#F59E0B",
      font: "Avenir Next"
    },
    scenes
  };
}

export function getSceneCode(sceneId: string): string {
  const sc = spec().scenes.find((x) => x.id === sceneId);
  if (!sc) throw new Error(`Unknown short scene ${sceneId}`);
  return `${sc.py}\n`;
}

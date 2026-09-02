import path from "node:path";

import {
  FPS,
  HEIGHT,
  SCENE_RENDER_DIR,
  SCENE_SOURCE_DIR,
  WIDTH
} from "../../core/config";
import {slugify} from "../../core/slug";
import type {SceneType, Storyboard, VideoScene} from "../../core/types";
import {
  createGenericLongformStoryboard,
  getGenericLongformSceneCode
} from "../generic/episode";
import {loadSection} from "../zaspro";
import {THEORY_SKELETON} from "./skeletons";
import {dzialaniaLiczbyRzeczywiste} from "./sections/dzialaniaLiczbyRzeczywiste";
import type {AuthoredScene, ExampleAuthoring, SectionAuthoring} from "./sections/types";

// Per-section THEORY authoring. One entry per section as they are written.
const SECTIONS: Record<string, SectionAuthoring> = {
  "dzialania-liczby-rzeczywiste": dzialaniaLiczbyRzeczywiste
};

function currentSlug(): string {
  if (!process.env.SECTION) {
    throw new Error("SECTION is required. Use: npm run generate -- <section> theory");
  }
  return process.env.SECTION;
}

type ScenePlan = Omit<
  VideoScene,
  "sourcePath" | "renderPath" | "publicPath" | "sceneIndex"
> & {code: string};

const WORKED_HEADER = `import json

from manim import *
from support.style import LessonScene
from support.templates.theory_example import worked_beat
`;

const BEAT_TAG: Record<string, string> = {
  present: "TREŚĆ",
  restate: "CO DANE, CO SZUKANE",
  plan: "WZÓR",
  substitute: "PODSTAWIENIE",
  result: "WYNIK",
  check: "SPRAWDZENIE",
  insight: "WNIOSEK"
};

function beatTag(beat: string): string {
  if (beat.startsWith("compute-")) return `RACHUNEK ${beat.split("-")[1]}`;
  return BEAT_TAG[beat] ?? beat.toUpperCase();
}

function authoredPlan(a: AuthoredScene): ScenePlan {
  const id = `${a.band}-${a.index}`;
  const className = a.py.match(/class\s+(\w+)\s*\(/)?.[1] ?? `Scene_${id}`;
  return {
    code: `${a.py}\n`,
    id,
    title: a.title,
    className,
    durationSeconds: a.durationSeconds ?? 24,
    sceneType: a.band as SceneType,
    sceneLabel: a.sceneLabel,
    standalone: a.standalone,
    stillMoment: a.stillMoment,
    shortHook: a.shortHook,
    narration: a.narration,
    purpose: a.title,
    mathematicalConcept: a.title,
    objects: [],
    animation: `Authored scene via archetype (band ${a.band}).`,
    camera: "Static frame.",
    text: a.sceneLabel,
    transition: "Cross-dissolve."
  };
}

function exampleBeatPlan(ex: ExampleAuthoring, beatIndex: number): ScenePlan {
  const beat = ex.ex.beats[beatIndex];
  const nn = String(beatIndex).padStart(2, "0");
  const className = `${ex.className}_${nn}_${beat.replace(/-/g, "_")}`;
  const id = `example-${ex.sourceId}-${nn}-${beat}`;
  const narrations = ex.ex.narrations as Record<string, string> | undefined;
  const narration = narrations?.[beat];
  // Double-stringify: inner builds the JSON text, outer wraps it in a string
  // literal valid in both JSON and Python (handles backslashes, quotes,
  // unicode). json.loads then parses it back to a dict with True/False/None.
  const exLiteral = JSON.stringify(JSON.stringify(ex.ex));
  const code =
    WORKED_HEADER +
    `\nEX = json.loads(${exLiteral})\n\n` +
    `class ${className}(LessonScene):\n` +
    `    def construct(self):\n` +
    `        worked_beat(self, EX, beat=${beatIndex})\n`;
  return {
    code,
    id,
    title: `${ex.sceneLabel} — ${beatTag(beat)}`,
    className,
    durationSeconds: ex.durationSeconds ?? 18,
    sceneType: "example" as SceneType,
    sceneLabel: `${ex.sceneLabel}   ·   ${beatTag(beat)}`,
    sourceExerciseId: ex.sourceId,
    standalone: beat === "present",
    stillMoment: beat === "result" ? "the boxed answer with the full worked chain" : "",
    narration,
    purpose: `Worked example ${ex.sourceId}, beat ${beat}.`,
    mathematicalConcept: String(ex.ex.statement ?? ""),
    objects: [],
    animation: `theory_example template, beat "${beat}".`,
    camera: "Static frame; statement strip, running expression, answer baseline.",
    text: String(ex.ex.answer_tex ?? ""),
    transition: "Cross-dissolve."
  };
}

function buildScenePlans(section: SectionAuthoring): ScenePlan[] {
  const plans: ScenePlan[] = [];
  for (const band of THEORY_SKELETON) {
    if (band.type === "example") {
      for (const ex of section.examples) {
        for (let bi = 0; bi < ex.ex.beats.length; bi++) {
          plans.push(exampleBeatPlan(ex, bi));
        }
      }
      continue;
    }
    if (band.type === "matura_connection") {
      if (section.maturaExample) {
        const m = section.maturaExample;
        for (let bi = 0; bi < m.ex.beats.length; bi++) plans.push(exampleBeatPlan(m, bi));
      }
      continue;
    }
    const inBand = section.authored
      .filter((a) => a.band === band.type)
      .sort((a, b) => a.index - b.index);
    for (const a of inBand) plans.push(authoredPlan(a));
  }
  return plans;
}

export function createStoryboard(topic: string): Storyboard {
  const slug = currentSlug();
  const section = SECTIONS[slug];
  if (!section) {
    return createGenericLongformStoryboard("theory", topic);
  }
  loadSection(slug); // fail loudly if the ZasPro checkout is missing

  const scenePlans = buildScenePlans(section);
  if (scenePlans.length === 0) {
    throw new Error(`Section "${slug}" has no authored THEORY scenes yet.`);
  }

  const scenes: VideoScene[] = scenePlans.map(({code: _c, ...s}, i) => ({
    ...s,
    sceneIndex: i + 1,
    sourcePath: path.join(SCENE_SOURCE_DIR, `${s.id.replace(/[^a-z0-9]+/gi, "_")}.py`),
    renderPath: path.join(SCENE_RENDER_DIR, `${s.id}.mp4`),
    publicPath: `generated/scenes/${s.id}.mp4`
  }));

  return {
    topic: topic || section.topic,
    slug: slugify(topic || section.topic),
    sectionSlug: slug,
    episodeType: "THEORY",
    format: "longform-16x9",
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    durationSeconds: scenes.reduce((t, s) => t + s.durationSeconds, 0),
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

const _cache = new Map<string, ScenePlan[]>();
function plansForCurrent(): ScenePlan[] {
  const slug = currentSlug();
  const section = SECTIONS[slug];
  if (!section) {
    return [];
  }
  if (!_cache.has(slug)) _cache.set(slug, buildScenePlans(section));
  return _cache.get(slug)!;
}

export function getSceneCode(sceneId: string): string {
  const plan = plansForCurrent().find((p) => p.id === sceneId);
  if (!plan) return getGenericLongformSceneCode("theory", sceneId);
  return `${plan.code}\n`;
}

// The episode thumbnail: a single authored `stage_thumbnail(...)` scene,
// rendered as one still at the end of the long-form stage. `null` if the
// section has not authored a thumbnail yet (the stage warns and skips).
export function getThumbnailCode(): string | null {
  const t = SECTIONS[currentSlug()]?.thumbnail;
  return t ? `${t.py}\n` : null;
}

export function getThumbnailClassName(): string {
  const py = SECTIONS[currentSlug()]?.thumbnail?.py ?? "";
  return py.match(/class\s+(\w+)\s*\(/)?.[1] ?? "ThumbnailScene";
}

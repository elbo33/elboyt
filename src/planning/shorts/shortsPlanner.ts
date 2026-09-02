import path from "node:path";
import fs from "node:fs";

import {FPS, GENERATED_DIR, SCENE_RENDER_DIR, SCENE_SOURCE_DIR, STORYBOARD_PATH} from "../../core/config";
import {isEpisodeType, type EpisodeType} from "../../core/library";
import {slugify} from "../../core/slug";
import type {SceneType, Storyboard, VideoScene} from "../../core/types";
import {POLISH_VOICEOVER_WPM, countVoiceoverWords} from "../../voiceover/timing";
import {dzialaniaLiczbyRzeczywiste} from "../longform/sections/dzialaniaLiczbyRzeczywiste";
import type {ExampleAuthoring} from "../longform/sections/types";
import {answerText, exercisesForSlot, loadSection, type ExerciseSlot} from "../zaspro";
import type {ShortSpec} from "./types";

const SHORTS: Record<string, ShortSpec> = {};

type DerivedShortPlan = {
  key: string;
  slug: string;
  title: string;
  hookTitle: string;
  topic: string;
  sourceSceneIds: string[];
  mode: "number_universe" | "operation_machine" | "minus_power" | "log_ladder" | "arithmetic" | "interval";
};

const DZIALANIA_THEORY = "dzialania-liczby-rzeczywiste/theory";

const DERIVED_SHORTS: Record<string, DerivedShortPlan[]> = {
  [DZIALANIA_THEORY]: [
    {
      key: "os-liczbowa",
      slug: "bez-osi-nie-zdasz-matury",
      title: "Bez osi nie zdasz matury",
      hookTitle: "Bez tego NIE ZDASZ matury. Kropka.",
      topic: "Działania w R: oś liczbowa",
      sourceSceneIds: ["hook-1"],
      mode: "number_universe"
    },
    {
      key: "kolejnosc-dzialan",
      slug: "kolejnosc-dzialan-zabiera-punkty",
      title: "Kolejność działań zabiera punkty",
      hookTitle: "Ten temat oblewa połowę maturzystów",
      topic: "Działania w R: kolejność działań",
      sourceSceneIds: ["intuition-3"],
      mode: "operation_machine"
    },
    {
      key: "minus-w-nawiasie",
      slug: "minus-w-nawiasie-klasyczna-pulapka",
      title: "Minus w nawiasie: klasyczna pułapka",
      hookTitle: "90% zdających maturę o tym nie wie",
      topic: "Działania w R: minus przy potędze",
      sourceSceneIds: ["definition-1"],
      mode: "minus_power"
    },
    {
      key: "logarytm-pytanie",
      slug: "to-pytanie-ratuje-logarytm",
      title: "To pytanie ratuje logarytm",
      hookTitle: "To pytanie jest na KAŻDEJ maturze",
      topic: "Działania w R: logarytm z definicji",
      sourceSceneIds: ["definition-3"],
      mode: "log_ladder"
    },
    {
      key: "rachunek-wartosci",
      slug: "ten-rachunek-kasuje-bledy",
      title: "Ten rachunek kasuje błędy",
      hookTitle: "Egzaminator liczy, że tego nie znasz",
      topic: "Działania w R: obliczanie wartości",
      sourceSceneIds: [
        "example-g-th-00-00-present",
        "example-g-th-00-01-restate",
        "example-g-th-00-02-plan",
        "example-g-th-00-03-compute-1",
        "example-g-th-00-04-compute-2",
        "example-g-th-00-05-compute-3",
        "example-g-th-00-06-result",
        "example-g-th-00-07-insight"
      ],
      mode: "arithmetic"
    },
    {
      key: "przedzial",
      slug: "przedzial-punkt-ktory-decyduje",
      title: "Przedział: punkt, który decyduje",
      hookTitle: "Robisz to źle na maturze i nawet nie wiesz",
      topic: "Działania w R: przedział i długość",
      sourceSceneIds: [
        "example-g-th-02-00-present",
        "example-g-th-02-01-restate",
        "example-g-th-02-02-plan",
        "example-g-th-02-03-compute-1",
        "example-g-th-02-04-compute-2",
        "example-g-th-02-05-compute-3",
        "example-g-th-02-06-result",
        "example-g-th-02-07-insight"
      ],
      mode: "interval"
    }
  ]
};

// Which shorts belong to which episode. The shorts stage of an episode renders
// every key listed here, in order; publish nests them under
// library/videos/<section>/<type>/shorts/<slug>/.
const EPISODE_SHORTS: Record<string, string[]> = Object.fromEntries(
  Object.entries(DERIVED_SHORTS).map(([episode, plans]) => [
    episode,
    plans.map((plan) => derivedKey(episode, plan.key))
  ])
);

const STORYBOARD_TYPE: Record<EpisodeType, Storyboard["episodeType"]> = {
  theory: "THEORY",
  exercises: "EXERCISES",
  mistakes: "COMMON_MISTAKES",
  challenge: "CHALLENGE"
};

export function shortsForEpisode(section: string, type: string): string[] {
  const authored = EPISODE_SHORTS[`${section}/${type}`];
  if (authored) return authored;
  if (!isEpisodeType(type)) return [];
  return [genericKey(section, type, 1), genericKey(section, type, 2)];
}

export function shortSlug(key: string): string {
  const s = SHORTS[key];
  const d = derivedPlanForKey(key);
  if (!s && d) return slugify(d.slug);
  if (!s && isGenericKey(key)) return slugify(genericSpec(key).slug);
  if (!s) throw new Error(`No short "${key}". Registered: ${Object.keys(SHORTS).join(", ")}`);
  return slugify(s.slug);
}

function currentKey(): string {
  if (!process.env.SHORT) {
    throw new Error("SHORT is required. Use the shorts stage after registering shorts for an episode.");
  }
  return process.env.SHORT;
}

function spec(): ShortSpec {
  const s = SHORTS[currentKey()];
  const d = derivedPlanForKey(currentKey());
  if (!s && d) return derivedSpec(d);
  if (!s && isGenericKey(currentKey())) return genericSpec(currentKey());
  if (!s) {
    throw new Error(
      `No short "${currentKey()}". Registered: ${Object.keys(SHORTS).join(", ")}`
    );
  }
  return s;
}

function derivedKey(episode: string, key: string): string {
  return `derived/${episode}/${key}`;
}

function derivedPlanForKey(key: string): DerivedShortPlan | null {
  const parts = key.split("/");
  if (parts.length !== 4 || parts[0] !== "derived") return null;
  const episode = `${parts[1]}/${parts[2]}`;
  const itemKey = parts[3];
  return DERIVED_SHORTS[episode]?.find((plan) => plan.key === itemKey) ?? null;
}

function genericKey(section: string, type: EpisodeType, index: number): string {
  return `generic/${section}/${type}/${index}`;
}

function isGenericKey(key: string): boolean {
  const [, section, type, index] = key.split("/");
  return Boolean(section && isEpisodeType(type) && Number.parseInt(index, 10) > 0);
}

function cleanText(value: string | undefined, fallback = ""): string {
  return (value ?? fallback).replace(/\s+/g, " ").replace(/[—–]/g, ",").trim();
}

function wrapLine(text: string, maxChars: number): string[] {
  const words = cleanText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = `${line} ${word}`.trim();
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function visualLines(items: string[], maxLines = 7): string[] {
  return items.flatMap((item) => wrapLine(item, 32)).filter(Boolean).slice(0, maxLines);
}

function durationForNarration(text: string): number {
  const seconds = Math.ceil((countVoiceoverWords(text) / POLISH_VOICEOVER_WPM) * 60 + 2);
  return Math.max(5, Math.min(10, seconds));
}

function loadReferenceStoryboard(): Storyboard | null {
  const candidates = [
    path.join(GENERATED_DIR, "longform-reference", "storyboard.json"),
    STORYBOARD_PATH
  ];
  for (const file of candidates) {
    try {
      const storyboard = JSON.parse(fs.readFileSync(file, "utf8")) as Storyboard;
      if (storyboard.format === "longform-16x9" && Array.isArray(storyboard.scenes)) return storyboard;
    } catch {
      // Keep looking; the root generated/ may currently be a short stage.
    }
  }
  return null;
}

function sourceScenesFor(plan: DerivedShortPlan): VideoScene[] {
  const storyboard = loadReferenceStoryboard();
  if (!storyboard) {
    throw new Error(
      `Cannot build short "${plan.key}" without generated/storyboard.json or generated/longform-reference/storyboard.json from the approved longform.`
    );
  }
  const scenes = plan.sourceSceneIds.map((id) => {
    const scene = storyboard.scenes.find((s) => s.id === id);
    if (!scene) throw new Error(`Longform scene "${id}" not found for short "${plan.key}".`);
    return scene;
  });
  return scenes;
}

function beatFromSourceId(sourceId: string): string {
  const match = sourceId.match(/-(present|restate|plan|compute-1|compute-2|compute-3|result|insight)$/);
  return match?.[1] ?? sourceId;
}

function renamedClassCode(code: string, className: string): string {
  return code.replace(/class\s+\w+\s*\(LessonScene\):/, `class ${className}(LessonScene):`);
}

function removeTopLeftTags(code: string): string {
  return code.replace(/\n\s+self\.add_scene_tag\([^\n]*\)/g, "");
}

function replaceAuthoredOpeningLabel(code: string, title: string | null): string {
  if (!title) return code;
  const replacedQuestion = code.replace(/question="[^"]*"/, `question=${JSON.stringify(title)}`);
  if (replacedQuestion !== code) return replacedQuestion;
  const replacedDerivation = code.replace(
    /stage_derivation\(self,\s*symbolic=\[/,
    `stage_derivation(self, question=${JSON.stringify(title)}, symbolic=[`
  );
  if (replacedDerivation !== code) return replacedDerivation;
  return code;
}

function authoredLongformCode(sourceId: string, className: string, hookTitle: string | null): string | null {
  const match = sourceId.match(/^([a-z_]+)-(\d+)$/);
  if (!match) return null;
  const [, band, index] = match;
  const authored = dzialaniaLiczbyRzeczywiste.authored.find(
    (scene) => scene.band === band && scene.index === Number(index)
  );
  if (!authored) return null;
  return replaceAuthoredOpeningLabel(removeTopLeftTags(renamedClassCode(authored.py, className)), hookTitle);
}

function exampleBeatIndex(example: ExampleAuthoring, sourceId: string): number | null {
  const suffix = sourceId.replace(`example-${example.sourceId}-`, "");
  const match = suffix.match(/^\d+-(.+)$/);
  if (!match) return null;
  const beat = match[1];
  const index = example.ex.beats.indexOf(beat);
  return index >= 0 ? index : null;
}

function exampleLongformCode(sourceId: string, className: string, hookTitle: string | null): string | null {
  for (const example of dzialaniaLiczbyRzeczywiste.examples) {
    const beatIndex = exampleBeatIndex(example, sourceId);
    if (beatIndex === null) continue;
    const ex = hookTitle && beatIndex === 0 ? {...example.ex, statement: hookTitle, highlights: []} : example.ex;
    const exLiteral = JSON.stringify(JSON.stringify(ex));
    return `import json

from manim import *
from support.style import LessonScene
from support.templates.theory_example import worked_beat

EX = json.loads(${exLiteral})


class ${className}(LessonScene):
    def construct(self):
        self.add_scene_tag = lambda *args, **kwargs: None
        worked_beat(self, EX, beat=${beatIndex})
`;
  }
  return null;
}

function derivedShortSceneCode(className: string, sourceId: string, hookTitle: string | null): string {
  const authored = authoredLongformCode(sourceId, className, hookTitle);
  if (authored) return authored;
  const example = exampleLongformCode(sourceId, className, hookTitle);
  if (example) return example;
  throw new Error(`No longform-style source code found for short source scene "${sourceId}".`);
}

function shortSceneCode(className: string, tag: string, title: string, lines: string[], duration: number): string {
  const data = JSON.stringify({tag, title, lines, duration: Math.max(1.5, duration - 0.8)});
  return `import json

from manim import *
from support.colors import ACCENT, FOREGROUND, SECONDARY
from support.style import FONT, LessonScene

DATA = json.loads(${JSON.stringify(data)})


class ${className}(LessonScene):
    def construct(self):
        self.add_texture()
        title = Text(DATA["title"], font=FONT, weight=BOLD, color=FOREGROUND, line_spacing=0.9)
        title.scale(0.54)
        title.to_edge(UP, buff=1.7)
        if title.width > 6.6:
            title.scale_to_fit_width(6.6)
        rows = VGroup()
        for line in DATA["lines"]:
            row = Text(line, font=FONT, weight=MEDIUM, color=FOREGROUND, line_spacing=0.95)
            row.scale(0.34)
            rows.add(row)
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.24)
        rows.next_to(title, DOWN, buff=0.6)
        if rows.width > 6.7:
            rows.scale_to_fit_width(6.7)
        if rows.height > 8.4:
            rows.scale_to_fit_height(8.4)
        underline = Line(LEFT, RIGHT, color=SECONDARY, stroke_width=5).scale(0.9)
        underline.next_to(rows, DOWN, buff=0.45)
        self.play(FadeIn(title), FadeIn(rows), run_time=0.35)
        self.play(Create(underline), run_time=0.25)
        self.wait(DATA["duration"])
        self.play(FadeOut(title), FadeOut(rows), FadeOut(underline), run_time=0.25)
`;
}

function derivedSpec(plan: DerivedShortPlan): ShortSpec {
  const scenes = sourceScenesFor(plan);
  return {
    slug: plan.slug,
    title: plan.title,
    topic: plan.topic,
    fromEpisode: DZIALANIA_THEORY,
    derivedScenes: plan.sourceSceneIds,
    scenes: scenes.map((source, index) => {
      const id = `${plan.key}-${String(index + 1).padStart(2, "0")}-${source.id}`;
      const className = `Short_${id.replace(/[^A-Za-z0-9]+/g, "_")}`;
      return {
        id,
        className,
        title: index === 0 ? plan.title : source.title,
        durationSeconds: source.durationSeconds,
        narration: source.narration ?? "",
        derivedFromScene: source.id,
        py: derivedShortSceneCode(className, source.id, index === 0 ? plan.hookTitle : null)
      };
    })
  };
}

const SHORT_SLOT: Record<Exclude<EpisodeType, "theory">, ExerciseSlot> = {
  exercises: "EXERCISE",
  mistakes: "COMMON_MISTAKE",
  challenge: "CHALLENGE"
};

function genericSpec(key: string): ShortSpec {
  const [, sectionSlug, type, rawIndex] = key.split("/") as [string, string, EpisodeType, string];
  const index = Math.max(1, Number.parseInt(rawIndex, 10));
  const section = loadSection(sectionSlug);
  const item =
    type === "theory"
      ? exercisesForSlot(section, "THEORY_SUPPORT")[index - 1] ?? exercisesForSlot(section, "THEORY_SUPPORT")[0]
      : exercisesForSlot(section, SHORT_SLOT[type])[index - 1] ?? exercisesForSlot(section, SHORT_SLOT[type])[0];
  if (!item) throw new Error(`No source exercise for generic short ${key}.`);

  const answer = answerText(item);
  const concept = section.knowledge.concepts[index - 1] ?? section.knowledge.concepts[0];
  const slug = `${sectionSlug}-${type}-short-${index}`;
  const title =
    type === "theory"
      ? concept?.name ?? item.exercise_type
      : item.exercise_type;

  const parts = [
    {
      id: `${slug}-hook`,
      title: "Szybki haczyk",
      tag: "HAK",
      narration:
        type === "mistakes"
          ? "To jest miejsce, w którym łatwo zrobić błąd. Zanim policzysz, nazwij dokładnie, o co pyta zadanie."
          : "Zatrzymaj się na chwilę. To zadanie wygląda prosto, ale wynik zależy od jednego dobrego rozpoznania.",
      lines: visualLines([title, "Najpierw rozpoznaj typ zadania."])
    },
    {
      id: `${slug}-setup`,
      title: "Dane i metoda",
      tag: "METODA",
      narration:
        `Mamy zadanie typu ${cleanText(item.exercise_type)}. ` +
        `Pierwszy ruch to: ${cleanText(item.solution_steps[0] ?? "wypisać dane i wybrać metodę").toLowerCase()}.`,
      lines: visualLines([item.statement, item.solution_steps[0] ?? "Wypisz dane i szukane."])
    },
    {
      id: `${slug}-answer`,
      title: "Wynik",
      tag: "WYNIK",
      narration:
        `Po wykonaniu kroków dostajemy odpowiedź: ${answer || "zapisaną w rozwiązaniu"}. ` +
        "Najważniejsze jest to, żeby wynik odpowiadał dokładnie na pytanie z treści.",
      lines: visualLines([...(item.solution_steps.slice(1, 4)), answer ? `Odpowiedź: ${answer}` : "Sprawdź ostatni krok."])
    }
  ];

  return {
    slug,
    title,
    topic: `${section.name}: short ${index}`,
    fromEpisode: `${sectionSlug}/${type}`,
    derivedScenes: parts.map((part) => part.id),
    scenes: parts.map((part) => {
      const className = `Short_${part.id.replace(/[^A-Za-z0-9]+/g, "_")}`;
      const durationSeconds = durationForNarration(part.narration);
      return {
        id: part.id,
        className,
        title: part.title,
        durationSeconds,
        narration: part.narration,
        derivedFromScene: "",
        py: shortSceneCode(className, part.tag, part.title, part.lines, durationSeconds)
      };
    })
  };
}

export function createStoryboard(topic: string): Storyboard {
  const s = spec();
  const episodeType = s.fromEpisode.split("/")[1];
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
    sectionSlug: process.env.SECTION ?? "unknown",
    episodeType: isEpisodeType(episodeType) ? STORYBOARD_TYPE[episodeType] : "THEORY",
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

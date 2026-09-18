import path from "node:path";

import {
  FPS,
  HEIGHT,
  SCENE_RENDER_DIR,
  SCENE_SOURCE_DIR,
  WIDTH
} from "../../core/config";
import type {EpisodeType} from "../../core/library";
import {slugify} from "../../core/slug";
import type {SceneType, Storyboard, VideoScene} from "../../core/types";
import {
  POLISH_VOICEOVER_WPM,
  countVoiceoverWords,
  targetWordsForSeconds
} from "../../voiceover/timing";
import {
  answerText,
  exercisesForSlot,
  loadSection,
  soughtLabels,
  type Exercise,
  type ExerciseSlot,
  type Section
} from "../zaspro";

type GenericScenePlan = Omit<
  VideoScene,
  "sourcePath" | "renderPath" | "publicPath" | "sceneIndex"
> & {code: string};

type VisualKind =
  | "board"
  | "sets"
  | "number_line"
  | "operation_order"
  | "formula"
  | "interval"
  | "root_parity"
  | "root_balance"
  | "factor_tree"
  | "common_degree"
  | "rationalize"
  | "exercise"
  | "summary";

type GenericPlanner = {
  createStoryboard: (topic: string) => Storyboard;
  getSceneCode: (sceneId: string) => string;
};

const STORYBOARD_TYPE: Record<EpisodeType, Storyboard["episodeType"]> = {
  theory: "THEORY",
  exercises: "EXERCISES",
  mistakes: "COMMON_MISTAKES",
  challenge: "CHALLENGE"
};

const SLOT_BY_TYPE: Record<Exclude<EpisodeType, "theory">, ExerciseSlot> = {
  exercises: "EXERCISE",
  mistakes: "COMMON_MISTAKE",
  challenge: "CHALLENGE"
};

const POLISH_TYPE: Record<EpisodeType, string> = {
  theory: "teoria",
  exercises: "zadania",
  mistakes: "częste błędy",
  challenge: "wyzwanie"
};

const cache = new Map<string, GenericScenePlan[]>();

function currentSectionSlug(): string {
  const slug = process.env.SECTION;
  if (!slug) throw new Error("SECTION is required. Use: npm run generate -- <section> <type>");
  return slug;
}

function cleanText(value: string | undefined, fallback = ""): string {
  return (value ?? fallback)
    .replace(/\s+/g, " ")
    .replace(/[—–]/g, ",")
    .trim();
}

function firstSentence(value: string | undefined, fallback = ""): string {
  const text = cleanText(value, fallback);
  const match = text.match(/^(.+?[.!?])\s/);
  return match ? match[1] : text;
}

function takeWords(value: string, maxWords: number): string {
  const words = cleanText(value).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
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

function visualLines(items: string[], maxLines = 8, maxChars = 72): string[] {
  return items
    .flatMap((item) => wrapLine(item, maxChars))
    .filter(Boolean)
    .slice(0, maxLines);
}

function classNameFor(id: string): string {
  return `Generic_${id.replace(/[^A-Za-z0-9]+/g, "_")}`;
}

function durationForNarration(narration: string, minSeconds: number, maxSeconds: number): number {
  const words = countVoiceoverWords(narration);
  const spoken = Math.ceil((words / POLISH_VOICEOVER_WPM) * 60 + 5);
  return Math.max(minSeconds, Math.min(maxSeconds, spoken));
}

function sceneCode(
  className: string,
  tag: string,
  title: string,
  lines: string[],
  duration: number,
  visualKind: VisualKind
): string {
  const compactLines = lines
    .map((line) => cleanText(line))
    .filter(Boolean)
    .filter((line) => line.length <= 68)
    .slice(0, 3);
  const data = JSON.stringify({
    tag,
    title,
    lines: compactLines.length ? compactLines : visualLines([lines.find(Boolean) ?? ""], 1, 42),
    duration: Math.max(2, duration - 1.3),
    visualKind
  });

  return `import json

from manim import *
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY
from support.style import FONT, LessonScene

DATA = json.loads(${JSON.stringify(data)})


class ${className}(LessonScene):
    def make_visual(self, kind):
        if kind == "sets":
            labels = ["N", "C", "W", "R"]
            boxes = VGroup()
            for i, label in enumerate(labels):
                rect = RoundedRectangle(
                    width=1.6 + i * 0.72,
                    height=1.1 + i * 0.52,
                    corner_radius=0.12,
                    color=[ACCENT, SECONDARY, MUTED, FOREGROUND][i],
                    stroke_width=5 - i * 0.5,
                )
                txt = Text(label, font=FONT, weight=BOLD, color=FOREGROUND).scale(0.38)
                txt.move_to(rect.get_center() + (0.38 + i * 0.28) * RIGHT + (0.18 + i * 0.12) * UP)
                boxes.add(rect, txt)
            note = Text("NW = R \\\\ W", font=FONT, weight=MEDIUM, color=MUTED).scale(0.26)
            note.next_to(boxes, DOWN, buff=0.3)
            return VGroup(boxes, note)

        if kind == "number_line":
            axis = Line(3.6 * LEFT, 3.6 * RIGHT, color=FOREGROUND, stroke_width=5)
            ticks = VGroup()
            for x in range(-3, 4):
                tick = Line(0.11 * DOWN, 0.11 * UP, color=MUTED, stroke_width=3)
                tick.move_to(axis.point_from_proportion((x + 3) / 6))
                label = Text(str(x), font=FONT, color=MUTED).scale(0.18).next_to(tick, DOWN, buff=0.12)
                ticks.add(tick, label)
            dots = VGroup()
            for prop, color, label in [(0.18, SECONDARY, "-2"), (0.5, ACCENT, "0"), (0.83, SECONDARY, "√7")]:
                dot = Dot(axis.point_from_proportion(prop), color=color, radius=0.075)
                lab = Text(label, font=FONT, weight=BOLD, color=color).scale(0.22).next_to(dot, UP, buff=0.14)
                dots.add(dot, lab)
            return VGroup(axis, ticks, dots)

        if kind == "operation_order":
            steps = ["nawiasy", "potęgi / √ / log", "× i :", "+ i -", "kontrola"]
            ladder = VGroup()
            for i, step in enumerate(steps):
                box = RoundedRectangle(width=3.25, height=0.5, corner_radius=0.08, color=ACCENT if i == 0 else MUTED, stroke_width=3)
                text = Text(step, font=FONT, weight=MEDIUM, color=FOREGROUND).scale(0.21)
                text.move_to(box)
                row = VGroup(box, text)
                row.shift((2 - i) * 0.23 * RIGHT)
                ladder.add(row)
            ladder.arrange(DOWN, buff=0.16)
            arrow = Arrow(ladder[0].get_bottom(), ladder[-1].get_top(), color=SECONDARY, stroke_width=4, buff=0.18)
            arrow.next_to(ladder, LEFT, buff=0.18)
            return VGroup(arrow, ladder)

        if kind == "formula":
            frame = RoundedRectangle(width=4.1, height=3.0, corner_radius=0.1, color=ACCENT, stroke_width=4)
            top = Text("wzór", font=FONT, weight=BOLD, color=ACCENT).scale(0.34).next_to(frame.get_top(), DOWN, buff=0.28)
            mid = Line(frame.get_left() + 0.35 * RIGHT, frame.get_right() + 0.35 * LEFT, color=MUTED, stroke_width=3)
            mid.shift(0.16 * UP)
            bottom = Text("warunki przed rachunkiem", font=FONT, weight=MEDIUM, color=MUTED).scale(0.22)
            bottom.next_to(mid, DOWN, buff=0.36)
            return VGroup(frame, top, mid, bottom)

        if kind == "root_parity":
            even_box = RoundedRectangle(width=2.25, height=2.25, corner_radius=0.1, color=ACCENT, stroke_width=4)
            odd_box = RoundedRectangle(width=2.25, height=2.25, corner_radius=0.1, color=SECONDARY, stroke_width=4)
            even = VGroup(even_box, MathTex(r"x^4", color=FOREGROUND).scale(0.72), Text("parzysty", font=FONT, color=ACCENT).scale(0.24))
            odd = VGroup(odd_box, MathTex(r"x^3", color=FOREGROUND).scale(0.72), Text("nieparzysty", font=FONT, color=SECONDARY).scale(0.24))
            even[1].move_to(even_box.get_center() + 0.25 * UP)
            even[2].move_to(even_box.get_center() + 0.55 * DOWN)
            odd[1].move_to(odd_box.get_center() + 0.25 * UP)
            odd[2].move_to(odd_box.get_center() + 0.55 * DOWN)
            pair = VGroup(even, odd).arrange(RIGHT, buff=0.45)
            arrows = VGroup(
                Arrow(even_box.get_bottom(), even_box.get_bottom() + 0.65 * DOWN, color=MUTED, buff=0.05, tip_length=0.16),
                Arrow(odd_box.get_bottom(), odd_box.get_bottom() + 0.65 * DOWN, color=MUTED, buff=0.05, tip_length=0.16),
            )
            labels = VGroup(
                Text("wynik ≥ 0", font=FONT, color=FOREGROUND).scale(0.22).next_to(arrows[0], DOWN, buff=0.1),
                Text("znak zostaje", font=FONT, color=FOREGROUND).scale(0.22).next_to(arrows[1], DOWN, buff=0.1),
            )
            return VGroup(pair, arrows, labels)

        if kind == "root_balance":
            radical = MathTex(r"\\sqrt[n]{a}=b", color=ACCENT).scale(0.9)
            power = MathTex(r"b^n=a", color=SECONDARY).scale(0.85)
            arrow1 = Arrow(radical.get_right(), power.get_left(), color=MUTED, buff=0.25, tip_length=0.18)
            row = VGroup(radical, arrow1, power).arrange(RIGHT, buff=0.35)
            question = Text("pierwiastek pyta o podstawę potęgi", font=FONT, weight=MEDIUM, color=FOREGROUND).scale(0.24)
            question.next_to(row, DOWN, buff=0.42)
            return VGroup(row, question)

        if kind == "factor_tree":
            expr = MathTex(r"40=2^3\\cdot 5", color=FOREGROUND).scale(0.72)
            root = MathTex(r"\\sqrt[3]{40}=2\\sqrt[3]{5}", color=ACCENT).scale(0.72)
            cube = RoundedRectangle(width=1.15, height=0.78, corner_radius=0.08, color=SECONDARY, stroke_width=4)
            cube_label = MathTex(r"2^3", color=SECONDARY).scale(0.52).move_to(cube)
            rem = RoundedRectangle(width=1.15, height=0.78, corner_radius=0.08, color=MUTED, stroke_width=3)
            rem_label = MathTex(r"5", color=FOREGROUND).scale(0.52).move_to(rem)
            chips = VGroup(VGroup(cube, cube_label), VGroup(rem, rem_label)).arrange(RIGHT, buff=0.35)
            chips.next_to(expr, DOWN, buff=0.5)
            root.next_to(chips, DOWN, buff=0.52)
            return VGroup(expr, chips, root)

        if kind == "common_degree":
            left = MathTex(r"\\sqrt[3]{3}", color=ACCENT).scale(0.62)
            mid = MathTex(r"\\sqrt[4]{5}", color=SECONDARY).scale(0.62)
            right = MathTex(r"\\sqrt{2}", color=FOREGROUND).scale(0.62)
            top = VGroup(left, mid, right).arrange(RIGHT, buff=0.52)
            target = MathTex(r"\\sqrt[12]{\\phantom{000}}", color=MUTED).scale(0.9)
            target.next_to(top, DOWN, buff=0.65)
            arrows = VGroup(*[Arrow(m.get_bottom(), target.get_top(), color=MUTED, buff=0.12, tip_length=0.14) for m in top])
            label = Text("wspólny stopień", font=FONT, weight=BOLD, color=FOREGROUND).scale(0.26).next_to(target, DOWN, buff=0.3)
            return VGroup(top, arrows, target, label)

        if kind == "rationalize":
            frac1 = MathTex(r"\\frac{6}{\\sqrt[3]{3}}", color=FOREGROUND).scale(0.82)
            times = MathTex(r"\\cdot\\frac{\\sqrt[3]{9}}{\\sqrt[3]{9}}", color=SECONDARY).scale(0.72)
            frac2 = MathTex(r"=2\\sqrt[3]{9}", color=ACCENT).scale(0.8)
            row = VGroup(frac1, times, frac2).arrange(RIGHT, buff=0.28)
            note = Text("dopełnij wykładnik do stopnia pierwiastka", font=FONT, color=MUTED).scale(0.22)
            note.next_to(row, DOWN, buff=0.42)
            return VGroup(row, note)

        if kind == "interval":
            axis = Line(3.7 * LEFT, 3.7 * RIGHT, color=FOREGROUND, stroke_width=4)
            seg = Line(axis.point_from_proportion(0.22), axis.point_from_proportion(0.78), color=ACCENT, stroke_width=12)
            left = Circle(radius=0.11, color=SECONDARY, stroke_width=5).move_to(axis.point_from_proportion(0.22))
            right = Dot(axis.point_from_proportion(0.78), color=SECONDARY, radius=0.12)
            lab_l = Text("otwarty", font=FONT, color=MUTED).scale(0.2).next_to(left, DOWN, buff=0.16)
            lab_r = Text("domknięty", font=FONT, color=MUTED).scale(0.2).next_to(right, DOWN, buff=0.16)
            return VGroup(axis, seg, left, right, lab_l, lab_r)

        if kind == "exercise":
            board = RoundedRectangle(width=4.4, height=3.2, corner_radius=0.12, color=SECONDARY, stroke_width=4)
            strip = Rectangle(width=4.0, height=0.56, color=ACCENT, fill_opacity=0.16, stroke_width=0)
            strip.next_to(board.get_top(), DOWN, buff=0.35)
            txt = Text("dane → plan → rachunek → wynik", font=FONT, weight=BOLD, color=FOREGROUND).scale(0.19)
            txt.move_to(strip)
            return VGroup(board, strip, txt)

        if kind == "summary":
            checks = VGroup()
            for i, step in enumerate(["rozpoznaj", "wybierz", "policz", "sprawdź"]):
                dot = Dot(color=ACCENT if i < 3 else SECONDARY, radius=0.07)
                txt = Text(step, font=FONT, weight=MEDIUM, color=FOREGROUND).scale(0.24)
                row = VGroup(dot, txt).arrange(RIGHT, buff=0.18)
                checks.add(row)
            checks.arrange(DOWN, aligned_edge=LEFT, buff=0.28)
            return checks

        grid = VGroup()
        for i in range(4):
            card = RoundedRectangle(width=1.85, height=0.78, corner_radius=0.08, color=ACCENT if i % 2 == 0 else SECONDARY, stroke_width=3)
            card.shift((i % 2) * 2.05 * RIGHT + (1 - i // 2) * 0.95 * UP)
            grid.add(card)
        return grid

    def construct(self):
        self.add_texture()
        self.add_scene_tag(DATA["tag"])

        title = Text(DATA["title"], font=FONT, weight=BOLD, color=FOREGROUND, line_spacing=0.92)
        title.scale(0.56)
        title.to_edge(UP, buff=0.9)
        if title.width > 12.8:
            title.scale_to_fit_width(12.8)

        visual = self.make_visual(DATA.get("visualKind", "board"))
        visual.move_to([0, -0.2, 0])
        if visual.width > 8.2:
            visual.scale_to_fit_width(8.2)
        if visual.height > 4.45:
            visual.scale_to_fit_height(4.45)

        rows = VGroup()

        accent = Line(LEFT, RIGHT, color=SECONDARY, stroke_width=5).scale(1.2)
        accent.next_to(visual, DOWN, buff=0.45)
        if accent.get_bottom()[1] < -2.55:
            accent.move_to([0, -2.45, 0])

        self.play(FadeIn(title, shift=0.15 * DOWN), FadeIn(visual, shift=0.18 * UP), run_time=0.6)
        self.play(Create(accent), run_time=0.35)
        self.wait(DATA["duration"])
        self.play(FadeOut(title), FadeOut(visual), FadeOut(rows), FadeOut(accent), run_time=0.35)
`;
}

function makeScene(input: {
  id: string;
  title: string;
  sceneType: SceneType;
  sceneLabel: string;
  sourceExerciseId?: string;
  narration: string;
  lines: string[];
  visualKind?: VisualKind;
  minSeconds?: number;
  maxSeconds?: number;
  mathematicalConcept?: string;
}): GenericScenePlan {
  const durationSeconds = durationForNarration(
    input.narration,
    input.minSeconds ?? 18,
    input.maxSeconds ?? 44
  );
  const className = classNameFor(input.id);
  const targetWords = targetWordsForSeconds(durationSeconds);
  return {
    code: sceneCode(
      className,
      input.sceneLabel,
      input.title,
      input.lines,
      durationSeconds,
      input.visualKind ?? "board"
    ),
    id: input.id,
    title: input.title,
    className,
    durationSeconds,
    sceneType: input.sceneType,
    sceneLabel: input.sceneLabel,
    sourceExerciseId: input.sourceExerciseId,
    standalone: true,
    stillMoment: input.title,
    shortHook: input.narration,
    narration: input.narration,
    purpose: `${input.sceneLabel}. Narration target: about ${targetWords} words.`,
    mathematicalConcept: input.mathematicalConcept ?? input.title,
    objects: input.lines,
    animation: `Director-led visual scene with "${input.visualKind ?? "board"}" graphic plus structured text.`,
    camera: "Static 16:9 frame.",
    text: input.lines.join("\n"),
    transition: "Cross-dissolve."
  };
}

function exerciseById(section: Section, id: string): Exercise {
  const exercise = section.exercises.exercises.find((item) => item.id === id);
  if (!exercise) throw new Error(`Expected exercise "${id}" in section "${section.slug}".`);
  return exercise;
}

function directorScene(input: {
  id: string;
  title: string;
  sceneType: SceneType;
  sceneLabel: string;
  narration: string;
  lines: string[];
  visualKind: VisualKind;
  sourceExerciseId?: string;
  mathematicalConcept?: string;
  minSeconds?: number;
}): GenericScenePlan {
  return makeScene({
    ...input,
    minSeconds: input.minSeconds ?? 36,
    maxSeconds: 72
  });
}

function directedRealNumbersTheoryPlans(section: Section): GenericScenePlan[] {
  const exValue = exerciseById(section, "g-th-00");
  const exLog = exerciseById(section, "g-th-01");
  const exInterval = exerciseById(section, "g-th-02");
  const concepts = section.knowledge.concepts;
  const formulas = section.knowledge.formulas;
  const methods = section.knowledge.methods;
  const plans: GenericScenePlan[] = [];

  const add = (scene: Parameters<typeof directorScene>[0]) => plans.push(directorScene(scene));

  add({
    id: "director-00-hook",
    title: section.name,
    sceneType: "hook",
    sceneLabel: "LECTURE / MAPA",
    visualKind: "number_line",
    narration:
      "Zrobimy tę lekcję powoli, jak pełne przejście po tablicy. Nie chodzi tylko o wynik. Chodzi o to, żeby widzieć, co oznacza zapis, gdzie ukrywa się kolejność działań i jak później przenieść to na przedziały.",
    lines: visualLines([
      `Źródło wiedzy: ${section.name}`,
      "Cel lekcji: liczby rzeczywiste, działania, potęgi, pierwiastki, logarytmy i przedziały.",
      "Styl pracy: obraz najpierw, rachunek potem, kontrola wyniku na końcu."
    ])
  });

  add({
    id: "director-01-sets",
    title: "Najpierw ustawiamy mapę liczb",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / ZBIORY",
    visualKind: "sets",
    narration:
      "Zbiór liczb rzeczywistych traktujemy jak całą oś liczbową. W środku mamy coraz większe rodziny liczb: naturalne, całkowite, wymierne, a obok nich liczby niewymierne. Ten obraz jest ważny, bo zadanie często sprawdza, w jakim świecie wolno nam wykonać dany ruch.",
    lines: visualLines([
      concepts.find((c) => c.name.includes("podzbiory"))?.description ?? "",
      "N ⊂ C ⊂ W ⊂ R",
      "NW = R \\ W, czyli liczby niewymierne są częścią osi, ale nie są ułamkami."
    ])
  });

  add({
    id: "director-02-axis",
    title: "Oś liczbowa to model zbioru R",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / OŚ",
    visualKind: "number_line",
    narration:
      "Na osi nie widzimy tylko liczb całkowitych. Widzimy wszystkie punkty pomiędzy nimi. Dlatego porównywanie liczb, znaki nierówności i przedziały będą później jedną historią: liczba po lewej jest mniejsza, liczba po prawej jest większa.",
    lines: visualLines([
      "Każdy punkt osi ↔ dokładnie jedna liczba rzeczywista.",
      "Porządek: a < b wtedy, gdy a leży na lewo od b.",
      "Przedział będzie po prostu zamalowanym fragmentem tej samej osi."
    ])
  });

  add({
    id: "director-03-closure",
    title: "Które działania są zawsze wykonalne",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / DZIAŁANIA",
    visualKind: "formula",
    narration:
      "W liczbach rzeczywistych dodawanie, odejmowanie i mnożenie nie wyrzucają nas poza oś. Dzielenie też działa, ale tylko wtedy, gdy dzielnik nie jest zerem. To nie jest drobiazg: bardzo wiele błędów zaczyna się od wykonania działania, którego nie wolno wykonać.",
    lines: visualLines([
      concepts.find((c) => c.name.includes("wykonalność"))?.description ?? "",
      "a + b ∈ R, a - b ∈ R, ab ∈ R",
      "a : b ∈ R tylko dla b ≠ 0"
    ])
  });

  add({
    id: "director-04-laws",
    title: "Prawa działań pomagają, ale mają granice",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / PRAWA",
    visualKind: "formula",
    narration:
      "Przemienność, łączność i rozdzielność są narzędziami do porządkowania rachunku. Ale nie wszystkie działania mają te własności. Odejmowania i dzielenia nie można przestawiać bez konsekwencji, więc najpierw rozpoznajemy działanie, a dopiero potem używamy prawa.",
    lines: visualLines([
      concepts.find((c) => c.name.includes("Prawa działań"))?.description ?? "",
      "Można przestawiać składniki sumy i czynniki iloczynu.",
      "Nie przestawiamy bezmyślnie odejmowania ani dzielenia."
    ])
  });

  add({
    id: "director-05-order",
    title: "Kolejność działań jako drabina decyzji",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / KOLEJNOŚĆ",
    visualKind: "operation_order",
    narration:
      "Zamiast pamiętać kolejność jako hasło, używamy jej jak drabiny. Najpierw szukamy nawiasów, także tych ukrytych pod kreską ułamkową i pod pierwiastkiem. Potem potęgi, pierwiastki i logarytmy. Dopiero potem mnożenie z dzieleniem, a na końcu dodawanie z odejmowaniem.",
    lines: visualLines([
      methods.find((m) => m.name.includes("arytmetycznego"))?.steps.join(" | ") ?? "",
      "Równorzędne działania liczymy od lewej do prawej.",
      "Kreska ułamkowa i znak pierwiastka zachowują się jak nawias."
    ])
  });

  add({
    id: "director-06-signs",
    title: "Znak minus i nawias zmieniają sens potęgi",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / ZNAKI",
    visualKind: "formula",
    narration:
      "Najbardziej kosztowna pułapka w tym dziale to znak minus przy potędze. Gdy minus jest częścią podstawy, potęgujemy liczbę ujemną. Gdy minus stoi przed potęgą, najpierw powstaje potęga dodatniej liczby, a minus zostaje na zewnątrz.",
    lines: visualLines([
      "(-2)^4 = 16",
      "-2^4 = -16",
      "Nawias odpowiada na pytanie: co dokładnie jest podstawą potęgi?"
    ])
  });

  add({
    id: "director-07-roots",
    title: "Pierwiastek arytmetyczny nie oddaje dwóch znaków",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / PIERWIASTKI",
    visualKind: "formula",
    narration:
      "Pierwiastek kwadratowy w szkolnym zapisie jest nieujemny. To znaczy, że pierwiastek z kwadratu nie pamięta, czy przed podniesieniem do kwadratu liczba była dodatnia czy ujemna. Dlatego pojawia się wartość bezwzględna.",
    lines: visualLines([
      concepts.find((c) => c.name.includes("Pierwiastek arytmetyczny"))?.description ?? "",
      "√9 = 3, nie ±3",
      "√(a²) = |a|"
    ])
  });

  add({
    id: "director-08-rational-powers",
    title: "Potęga wymierna jest mostem do pierwiastka",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / POTĘGI",
    visualKind: "formula",
    narration:
      "Gdy widzimy wykładnik ułamkowy, czytamy go jak informację o pierwiastku i potędze. Mianownik mówi o stopniu pierwiastka, licznik mówi o potędze. Ten most pozwala zamieniać trudny zapis na wygodniejszy rachunek.",
    lines: visualLines([
      concepts.find((c) => c.name.includes("wykładniku wymiernym"))?.description ?? "",
      "8^(2/3) = (∛8)^2 = 4",
      formulas.find((f) => f.name.includes("Związek"))?.latex_raw ?? ""
    ])
  });

  add({
    id: "director-09-log",
    title: "Logarytm jako pytanie o wykładnik",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / LOGARYTM",
    visualKind: "formula",
    narration:
      "Logarytm nie jest nowym magicznym działaniem. To pytanie: do której potęgi trzeba podnieść podstawę, żeby otrzymać daną liczbę. Dlatego w zadaniach z definicji logarytmu zawsze szukamy zapisu liczby logarytmowanej jako potęgi podstawy.",
    lines: visualLines([
      concepts.find((c) => c.name === "Logarytm")?.description ?? "",
      "log_a b = c ⇔ a^c = b",
      "Założenia: a > 0, a ≠ 1, b > 0"
    ])
  });

  add({
    id: "director-10-estimate",
    title: "Szacowanie chroni przed wynikiem bez sensu",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / SZACOWANIE",
    visualKind: "number_line",
    narration:
      "Szacowanie nie jest dodatkiem dla ambitnych. To hamulec bezpieczeństwa. Jeśli wiemy, między jakimi pełnymi kwadratami leży liczba pod pierwiastkiem, to od razu wiemy, w jakim rejonie osi powinien znaleźć się wynik.",
    lines: visualLines([
      concepts.find((c) => c.name.includes("Zaokrąglanie"))?.explanation ?? "",
      "4 < 7 < 9, więc 2 < √7 < 3",
      "Przybliżenie sprawdza znak i rząd wielkości."
    ])
  });

  add({
    id: "director-11-interval-idea",
    title: "Przedział to zamalowany fragment osi",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / PRZEDZIAŁ",
    visualKind: "interval",
    narration:
      "Teraz przechodzimy z pojedynczych liczb do całych kawałków osi. Przedział zawiera wszystkie liczby pomiędzy końcami, czasem razem z końcami, a czasem bez nich. Dlatego rysunek osi jest tutaj najlepszym notatnikiem.",
    lines: visualLines([
      concepts.find((c) => c.name === "Przedział liczbowy")?.description ?? "",
      "(a, b), ⟨a, b⟩, ⟨a, b), (a, b⟩",
      "∞ nigdy nie jest końcem należącym do przedziału."
    ])
  });

  add({
    id: "director-12-endpoints",
    title: "Nawias mówi, czy koniec należy do zbioru",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / KOŃCE",
    visualKind: "interval",
    narration:
      "Kółko puste oznacza, że koniec jest tylko granicą. Kółko pełne oznacza, że koniec należy do zbioru. To samo mówią nawiasy w zapisie przedziału i znaki nierówności w opisie zbioru.",
    lines: visualLines([
      "x < a lub x > a → kółko puste → nawias okrągły",
      "x ≤ a lub x ≥ a → kółko pełne → nawias domknięty",
      "Każdy koniec sprawdzamy osobno."
    ])
  });

  add({
    id: "director-13-interval-operations",
    title: "Suma, część wspólna i różnica przedziałów",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / PRZEDZIAŁY",
    visualKind: "interval",
    narration:
      "Działania na przedziałach najlepiej robić oczami. Rysujemy oba zbiory pod sobą w tej samej skali. Część wspólna to miejsce zamalowane dwa razy. Suma to wszystko, co zamalowane chociaż raz. Różnica to to, co zostaje z pierwszego zbioru po wycięciu drugiego.",
    lines: visualLines([
      concepts.find((c) => c.name.includes("Suma"))?.description ?? "",
      "A ∩ B: fragment wspólny",
      "A ∪ B: wszystko z A lub B",
      "A \\ B: w A, ale nie w B"
    ])
  });

  add({
    id: "director-14-example-value-present",
    title: "Przykład pierwszy: ustawiamy całe wyrażenie",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / TREŚĆ",
    visualKind: "exercise",
    sourceExerciseId: exValue.id,
    narration:
      "W pierwszym przykładzie nie będziemy przeskakiwać do wyniku. Najpierw patrzymy na całe wyrażenie i zaznaczamy, które działania są wyżej na drabinie. Widzimy potęgę, pierwiastek, mnożenie oraz dodawanie z odejmowaniem.",
    lines: visualLines([exValue.statement, "Najpierw: potęga i pierwiastek.", "Potem: mnożenie.", "Na końcu: dodawanie i odejmowanie od lewej."])
  });

  add({
    id: "director-15-example-value-power",
    title: "Najpierw potęga z ujemną podstawą",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / POTĘGA",
    visualKind: "formula",
    sourceExerciseId: exValue.id,
    narration:
      "W potędze minus jest w nawiasie, więc należy do podstawy. Wykładnik jest nieparzysty, dlatego wynik zostaje ujemny. To jest dokładnie ten moment, w którym nawias decyduje o znaku.",
    lines: visualLines(["(-2)^3 = (-2) · (-2) · (-2)", "(-2) · (-2) = 4", "4 · (-2) = -8"])
  });

  add({
    id: "director-16-example-value-root",
    title: "Pierwiastek i mnożenie liczymy przed sumą",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / RACHUNEK",
    visualKind: "operation_order",
    sourceExerciseId: exValue.id,
    narration:
      "Pierwiastek z czterdziestu dziewięciu jest liczbą nieujemną. Mnożenie też wykonujemy przed dodawaniem. Dopiero po tych krokach wyrażenie staje się zwykłym rachunkiem na liczbach ze znakami.",
    lines: visualLines(["√49 = 7", "3 · (-4) = -12", "(-2)^3 + 3·(-4) - √49", "-8 + (-12) - 7"])
  });

  add({
    id: "director-17-example-value-result",
    title: "Końcowy rachunek prowadzimy od lewej",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / WYNIK",
    visualKind: "number_line",
    sourceExerciseId: exValue.id,
    narration:
      "Na końcu nie ma już potęg ani pierwiastków. Zostało dodawanie i odejmowanie liczb ujemnych. Idziemy od lewej do prawej i kontrolujemy kierunek na osi: każdy kolejny składnik przesuwa wynik w lewo.",
    lines: visualLines(["-8 - 12 - 7", "-8 - 12 = -20", "-20 - 7 = -27", "Odpowiedź: -27"])
  });

  add({
    id: "director-18-example-log-present",
    title: "Przykład drugi: logarytm z definicji",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / TREŚĆ",
    visualKind: "exercise",
    sourceExerciseId: exLog.id,
    narration:
      "Drugi przykład jest krótki, ale bardzo ważny. Logarytm z definicji rozwiązujemy przez zamianę pytania na potęgę. Nie zgadujemy wyniku. Najpierw sprawdzamy, czy logarytm w ogóle istnieje.",
    lines: visualLines([exLog.statement, "Sprawdź: podstawa dodatnia i różna od jedności.", "Sprawdź: liczba logarytmowana dodatnia.", "Potem szukaj potęgi tej samej podstawy."])
  });

  add({
    id: "director-19-example-log-power",
    title: "Liczbę logarytmowaną zapisujemy jako potęgę",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / POTĘGA",
    visualKind: "formula",
    sourceExerciseId: exLog.id,
    narration:
      "Ułamek jeden przez szesnaście traktujemy jako odwrotność potęgi dwójki. Odwrotność oznacza wykładnik ujemny. W tej chwili logarytm zaczyna wyglądać jak pytanie o brakujący wykładnik.",
    lines: visualLines(["1/16 = 1/(2^4)", "1/16 = 2^(-4)", "log_2(1/16) = log_2(2^(-4))"])
  });

  add({
    id: "director-20-example-log-result",
    title: "Wynikiem logarytmu jest wykładnik",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / WYNIK",
    visualKind: "formula",
    sourceExerciseId: exLog.id,
    narration:
      "Definicja mówi, że skoro liczba logarytmowana jest potęgą podstawy, to logarytm oddaje wykładnik. Znak minus w wyniku nie jest błędem, tylko informacją, że mówimy o odwrotności potęgi.",
    lines: visualLines(["log_a(a^k) = k", "log_2(2^(-4)) = -4", "Odpowiedź: -4"])
  });

  add({
    id: "director-21-example-interval-present",
    title: "Przykład trzeci: zbiór zapisany nierównością",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / TREŚĆ",
    visualKind: "exercise",
    sourceExerciseId: exInterval.id,
    narration:
      "Trzeci przykład przenosi nas na oś liczbową. Zapis z klamrą czytamy tak: bierzemy wszystkie liczby rzeczywiste, które spełniają dwa warunki naraz. Jeden warunek dotyczy lewego końca, drugi prawego końca.",
    lines: visualLines([exInterval.statement, "Warunek lewy: -3 ≤ x", "Warunek prawy: x < 7", "Szukamy zapisu przedziału i długości."])
  });

  add({
    id: "director-22-example-interval-left",
    title: "Lewy koniec należy do przedziału",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / LEWY KONIEC",
    visualKind: "interval",
    sourceExerciseId: exInterval.id,
    narration:
      "Znak nieostry po lewej stronie oznacza, że liczba graniczna należy do zbioru. Na osi rysujemy kółko pełne. W zapisie przedziału używamy nawiasu domkniętego.",
    lines: visualLines(["-3 ≤ x", "czyli x ≥ -3", "punkt -3 należy do A", "lewy nawias: ⟨"])
  });

  add({
    id: "director-23-example-interval-right",
    title: "Prawy koniec jest tylko granicą",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / PRAWY KONIEC",
    visualKind: "interval",
    sourceExerciseId: exInterval.id,
    narration:
      "Po prawej stronie mamy znak ostry. To znaczy, że liczby mogą zbliżać się do końca, ale sam koniec nie należy do zbioru. Na osi rysujemy kółko puste i zamykamy zapis nawiasem okrągłym.",
    lines: visualLines(["x < 7", "punkt 7 nie należy do A", "prawy nawias: )", "A = ⟨-3, 7)"])
  });

  add({
    id: "director-24-example-interval-length",
    title: "Długość przedziału liczymy z końców",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / DŁUGOŚĆ",
    visualKind: "number_line",
    sourceExerciseId: exInterval.id,
    narration:
      "Długość przedziału ograniczonego zależy od położenia końców, a nie od tego, czy końce są wypełnione. Liczymy prawy koniec minus lewy koniec. Odejmowanie liczby ujemnej zmienia się w dodawanie.",
    lines: visualLines(["d = b - a", "a = -3, b = 7", "d = 7 - (-3)", "d = 10"])
  });

  add({
    id: "director-25-bridge",
    title: "Jak te trzy przykłady składają się w zadanie maturalne",
    sceneType: "matura_connection",
    sceneLabel: "MATURA / STRATEGIA",
    visualKind: "summary",
    narration:
      "Na maturze te elementy rzadko żyją osobno. Jedno zadanie może wymagać kolejności działań, potęg, pierwiastków, logarytmu i na końcu decyzji, czy wynik należy do przedziału. Dlatego uczymy się procesu, a nie pojedynczej sztuczki.",
    lines: visualLines([
      "Część arytmetyczna: uporządkuj działania.",
      "Część logarytmiczna: zamień na pytanie o wykładnik.",
      "Część przedziałowa: przenieś wynik na oś."
    ])
  });

  add({
    id: "director-26-checklist",
    title: "Checklist przed samodzielnym zadaniem",
    sceneType: "summary",
    sceneLabel: "PODSUMOWANIE / CHECKLISTA",
    visualKind: "summary",
    narration:
      "Zanim policzysz podobne zadanie samodzielnie, przejdź przez krótką checklistę. Czy wiem, które działanie jest pierwsze. Czy sprawdziłem warunki logarytmu albo dzielenia. Czy rozumiem, który koniec przedziału należy do zbioru. Czy wynik ma sens na osi.",
    lines: visualLines([
      "1. Ukryte nawiasy: ułamek, pierwiastek, nawias zwykły.",
      "2. Znaki: podstawa potęgi i pierwiastek arytmetyczny.",
      "3. Warunki: dzielnik ≠ 0, logarytm istnieje.",
      "4. Przedziały: każdy koniec rozstrzygaj osobno."
    ])
  });

  add({
    id: "director-27-summary",
    title: "Co ma zostać po lekcji",
    sceneType: "summary",
    sceneLabel: "PODSUMOWANIE / WNIOSEK",
    visualKind: "summary",
    narration:
      "Najważniejszy wniosek jest prosty. Dobre rozwiązanie zaczyna się od rozpoznania struktury. Gdy struktura jest jasna, rachunek robi się spokojniejszy: widzisz kolejność, widzisz znaki, widzisz warunki i potrafisz narysować wynik na osi.",
    lines: visualLines([
      "Rozpoznaj strukturę.",
      "Narysuj obraz, jeśli pomaga.",
      "Policz małymi krokami.",
      "Sprawdź wynik z treścią i osią liczbową."
    ])
  });

  return plans;
}

function directedRootsTheoryPlans(section: Section): GenericScenePlan[] {
  const exBasic = exerciseById(section, "g-th-00");
  const exExtract = exerciseById(section, "g-th-01");
  const exProperties = exerciseById(section, "g-th-02");
  const c = (needle: string) => section.knowledge.concepts.find((item) => item.name.includes(needle));
  const f = (needle: string) => section.knowledge.formulas.find((item) => item.name.includes(needle));
  const plans: GenericScenePlan[] = [];
  const add = (scene: Parameters<typeof directorScene>[0]) => plans.push(directorScene(scene));

  add({
    id: "roots-00-hook",
    title: "Pierwiastki dowolnego stopnia",
    sceneType: "hook",
    sceneLabel: "LECTURE / MAPA",
    visualKind: "root_balance",
    narration:
      "Dzisiaj robimy pierwiastki dowolnego stopnia powoli, od obrazu do rachunku. Najważniejsze pytanie brzmi: jaka liczba po podniesieniu do danego stopnia daje liczbę pod pierwiastkiem. Od tej jednej myśli zbudujemy parzystość, znaki, upraszczanie i przykłady maturalne.",
    lines: visualLines([
      "Pytanie główne: jaka liczba po potędze daje liczbę pod pierwiastkiem?",
      "Mapa lekcji: stopień, znak, dziedzina, własności, upraszczanie.",
      `Źródło: ${section.scope}`
    ], 5)
  });

  add({
    id: "roots-01-anatomy",
    title: "Najpierw czytamy zapis pierwiastka",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / ZAPIS",
    visualKind: "root_balance",
    narration:
      "W zapisie pierwiastka mamy dwie informacje. Mała liczba przy znaku pierwiastka mówi o stopniu, czyli o tym, którą potęgę będziemy odwracać. Liczba pod znakiem pierwiastka mówi, jaki wynik tej potęgi chcemy otrzymać.",
    lines: visualLines([
      c("Stopień")?.description ?? "",
      "n: stopień pierwiastka",
      "a: liczba podpierwiastkowa",
      "√a to skrót dla pierwiastka stopnia drugiego"
    ], 5)
  });

  add({
    id: "roots-02-even-model",
    title: "Parzysty stopień daje wynik nieujemny",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / PARZYSTY",
    visualKind: "root_parity",
    narration:
      "Gdy stopień jest parzysty, wynik pierwiastka arytmetycznego jest z definicji nieujemny. To znaczy, że czwarty pierwiastek z szesnastu to dwa, a nie plus minus dwa. Symbol pierwiastka wybiera jedną konkretną liczbę.",
    lines: visualLines([
      c("parzystego")?.description ?? "",
      "⁴√16 = 2",
      "wynik parzystego pierwiastka: zawsze ≥ 0"
    ], 5)
  });

  add({
    id: "roots-03-even-negative",
    title: "Parzysty pierwiastek z liczby ujemnej nie istnieje w R",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / DZIEDZINA",
    visualKind: "root_parity",
    narration:
      "Ta sama zasada od razu blokuje liczby ujemne pod pierwiastkiem parzystego stopnia. Czwarta potęga liczby dodatniej jest dodatnia i czwarta potęga liczby ujemnej też jest dodatnia. Nie da się więc dostać liczby ujemnej.",
    lines: visualLines([
      "⁴√(-16) nie istnieje w R",
      "dla parzystego n wymagamy a ≥ 0",
      f("Definicja pierwiastka")?.conditions ?? ""
    ], 5)
  });

  add({
    id: "roots-04-odd-model",
    title: "Nieparzysty stopień zachowuje znak",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / NIEPARZYSTY",
    visualKind: "root_parity",
    narration:
      "Przy stopniu nieparzystym sytuacja jest inna. Liczba ujemna podniesiona do nieparzystej potęgi zostaje ujemna. Dlatego pierwiastek nieparzystego stopnia z liczby ujemnej istnieje i ma znak minus.",
    lines: visualLines([
      c("nieparzystego")?.description ?? "",
      "³√(-8) = -2, bo (-2)³ = -8",
      f("Znak pierwiastka")?.latex_raw ?? ""
    ], 5)
  });

  add({
    id: "roots-05-domain-switch",
    title: "Pierwsza decyzja: parzysty czy nieparzysty",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / DECYZJA",
    visualKind: "summary",
    narration:
      "Każde zadanie zaczynamy od przełącznika: stopień parzysty czy nieparzysty. Jeżeli jest nieparzysty, liczba pod pierwiastkiem może być dowolna. Jeżeli jest parzysty, najpierw musimy sprawdzić, czy liczba pod pierwiastkiem jest nieujemna.",
    lines: visualLines([
      c("Dziedzina")?.description ?? "",
      "n parzyste: W ≥ 0",
      "n nieparzyste: W dowolne",
      "Najpierw dziedzina, potem rachunek"
    ], 5)
  });

  add({
    id: "roots-06-root-vs-equation",
    title: "Pierwiastek to nie to samo co równanie",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / PUŁAPKA",
    visualKind: "formula",
    narration:
      "Bardzo ważna pułapka: pierwiastek arytmetyczny nie jest listą wszystkich rozwiązań równania. Równanie iks do kwadratu równa się dziewięć ma dwa rozwiązania. Ale pierwiastek z dziewięciu jako liczba ma wartość trzy.",
    lines: visualLines([
      "x² = 9  →  x = -3 lub x = 3",
      "√9 = 3",
      "pierwiastek wskazuje jedną wartość"
    ], 5)
  });

  add({
    id: "roots-07-nth-power",
    title: "Pierwiastek z n-tej potęgi pilnuje parzystości",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / POTĘGA",
    visualKind: "formula",
    narration:
      "Gdy pierwiastek spotyka potęgę tego samego stopnia, nie zawsze po prostu znika. Przy stopniu nieparzystym znak zostaje, więc wynik to pierwotna liczba. Przy stopniu parzystym znak może zniknąć, dlatego pojawia się wartość bezwzględna.",
    lines: visualLines([
      c("n-tego stopnia")?.description ?? "",
      f("Pierwiastek n-tego")?.latex_raw ?? "",
      "⁶√((-4)⁶) = |-4| = 4"
    ], 5)
  });

  add({
    id: "roots-08-exact-form",
    title: "Nie każdy pierwiastek trzeba zamieniać na przecinek",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / DOKŁADNOŚĆ",
    visualKind: "number_line",
    narration:
      "W matematyce maturalnej pierwiastek często jest odpowiedzią dokładną. Jeśli liczba pod pierwiastkiem nie jest odpowiednią potęgą, nie próbujemy zgadywać długiego rozwinięcia dziesiętnego. Zostawiamy zapis pierwiastkowy i upraszczamy go tyle, ile się da.",
    lines: visualLines([
      c("niewymierna")?.explanation ?? "",
      "³√8 = 2",
      "³√7 zostaje w postaci dokładnej",
      "celem jest prosty zapis, nie przybliżenie"
    ], 5)
  });

  add({
    id: "roots-09-simplest-form",
    title: "Co znaczy postać najprostsza",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / POSTAĆ",
    visualKind: "summary",
    narration:
      "Postać najprostsza ma trzy kontrole. Pod pierwiastkiem nie powinno zostać nic, co da się wyciągnąć przed znak. Stopień pierwiastka ma być możliwie najmniejszy. W mianowniku nie chcemy zostawiać pierwiastka.",
    lines: visualLines([
      c("Postać najprostsza")?.description ?? "",
      "bez ukrytych n-tych potęg pod pierwiastkiem",
      "bez niepotrzebnego stopnia",
      "bez pierwiastka w mianowniku"
    ], 5)
  });

  add({
    id: "roots-10-factor-grouping",
    title: "Wyłączanie czynnika to grupowanie potęg",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / CZYNNIKI",
    visualKind: "factor_tree",
    narration:
      "Najpewniejszy sposób upraszczania to rozkład na czynniki pierwsze. Przy pierwiastku stopnia trzeciego szukamy grup po trzy takie same czynniki. Pełna grupa wychodzi przed pierwiastek, a reszta zostaje pod znakiem.",
    lines: visualLines([
      c("Wyłączanie czynnika")?.explanation ?? "",
      "40 = 2³ · 5",
      "³√40 = 2³√5",
      "grupa trzech dwójek wychodzi jako jedna dwójka"
    ], 5)
  });

  add({
    id: "roots-11-product-property",
    title: "Kiedy można połączyć pierwiastki w jeden",
    sceneType: "definition",
    sceneLabel: "WZÓR / ILOCZYN",
    visualKind: "formula",
    narration:
      "Pierwiastki tego samego stopnia możemy mnożyć pod jednym znakiem, ale warunki nadal mają znaczenie. Przy stopniu parzystym liczby pod pierwiastkami muszą być nieujemne. Przy stopniu nieparzystym znak ujemny jest dopuszczalny.",
    lines: visualLines([
      f("Pierwiastek z iloczynu")?.latex_raw ?? "",
      f("Pierwiastek z iloczynu")?.conditions ?? "",
      "⁴√2 · ⁴√8 = ⁴√16 = 2"
    ], 5)
  });

  add({
    id: "roots-12-quotient-property",
    title: "Iloraz działa podobnie, ale mianownik nie może być zerem",
    sceneType: "definition",
    sceneLabel: "WZÓR / ILORAZ",
    visualKind: "formula",
    narration:
      "Przy ilorazie dochodzi jeszcze jeden warunek: mianownik nie może być zerem. To jest zwykła zasada dzielenia, ale w pierwiastkach łatwo ją przeoczyć, bo uwaga ucieka na stopień i znak liczby podpierwiastkowej.",
    lines: visualLines([
      f("Pierwiastek z ilorazu")?.latex_raw ?? "",
      f("Pierwiastek z ilorazu")?.conditions ?? "",
      "najpierw warunki, potem połączenie"
    ], 5)
  });

  add({
    id: "roots-13-root-of-root",
    title: "Pierwiastek z pierwiastka mnoży stopnie",
    sceneType: "definition",
    sceneLabel: "WZÓR / ZAGNIEŻDŻENIE",
    visualKind: "root_balance",
    narration:
      "Gdy pierwiastek siedzi w pierwiastku, patrzymy na stopnie jak na kolejne odwracane potęgi. Pierwiastek kwadratowy z pierwiastka trzeciego zamienia się w pierwiastek szóstego stopnia. Stopnie się mnożą.",
    lines: visualLines([
      f("Pierwiastek z pierwiastka")?.latex_raw ?? "",
      "√(³√64) = ⁶√64",
      "64 = 2⁶, więc wynik to 2"
    ], 5)
  });

  add({
    id: "roots-14-common-degree",
    title: "Wspólny stopień działa jak wspólny mianownik",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / WSPÓLNY STOPIEŃ",
    visualKind: "common_degree",
    narration:
      "Kiedy porównujemy pierwiastki różnych stopni, sprowadzamy je do wspólnego stopnia. To przypomina sprowadzanie ułamków do wspólnego mianownika. Mnożymy stopień i wykładnik liczby pod pierwiastkiem przez ten sam współczynnik.",
    lines: visualLines([
      c("Sprowadzanie")?.explanation ?? "",
      f("Zmiana stopnia")?.latex_raw ?? "",
      "³√3, ⁴√5, √2  →  stopień dwunasty"
    ], 5)
  });

  add({
    id: "roots-15-rational-exponent",
    title: "Wykładnik ułamkowy jest innym zapisem pierwiastka",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / POTĘGA WYMIERNA",
    visualKind: "formula",
    narration:
      "Wykładnik ułamkowy mówi to samo co pierwiastek. Mianownik wykładnika jest stopniem pierwiastka, a licznik zostaje potęgą. W tej lekcji trzymamy jednak w głowie ważne ograniczenie: ta definicja wprost dotyczy dodatniej podstawy.",
    lines: visualLines([
      c("wykładniku wymiernym")?.description ?? "",
      f("Potęga o wykładniku")?.latex_raw ?? "",
      "mianownik → stopień, licznik → potęga"
    ], 5)
  });

  add({
    id: "roots-16-similar-roots",
    title: "Dodajemy tylko pierwiastki podobne",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / PODOBNE",
    visualKind: "formula",
    narration:
      "Dodawanie pierwiastków działa jak redukcja wyrazów podobnych w algebrze. Jeżeli stopień i liczba pod pierwiastkiem są takie same, dodajemy tylko współczynniki. Jeżeli są różne, najpierw próbujemy uprościć składniki.",
    lines: visualLines([
      c("Wyrażenia podobne")?.explanation ?? "",
      f("Dodawanie pierwiastków")?.latex_raw ?? "",
      "3³√2 - 4³√2 + 5³√2 = 4³√2"
    ], 5)
  });

  add({
    id: "roots-17-rationalize",
    title: "Usuwanie pierwiastka z mianownika",
    sceneType: "definition",
    sceneLabel: "DEFINICJA / MIANOWNIK",
    visualKind: "rationalize",
    narration:
      "Jeżeli pierwiastek został w mianowniku, dopełniamy wykładnik pod pierwiastkiem do pełnego stopnia. Przy pierwiastku trzeciego stopnia z trójki brakuje jeszcze dwóch trójek. Dlatego mnożymy przez pierwiastek trzeciego stopnia z dziewięciu.",
    lines: visualLines([
      c("Usuwanie niewymierności")?.explanation ?? "",
      f("Usuwanie niewymierności")?.latex_raw ?? "",
      "³√3 · ³√9 = ³√27 = 3"
    ], 5)
  });

  add({
    id: "roots-18-example-basic-present",
    title: "Przykład pierwszy: dwa proste pierwiastki",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / TREŚĆ",
    visualKind: "exercise",
    sourceExerciseId: exBasic.id,
    narration:
      "Pierwszy przykład sprawdza dokładnie przełącznik parzystości. Mamy pierwiastek trzeciego stopnia z liczby ujemnej oraz pierwiastek czwartego stopnia z liczby dodatniej. Zanim policzymy, ustalamy, jaki znak wyniku jest w ogóle możliwy.",
    lines: visualLines([
      exBasic.statement,
      "a) stopień nieparzysty, liczba ujemna",
      "b) stopień parzysty, liczba dodatnia",
      "szukamy wartości pierwiastków"
    ], 5)
  });

  add({
    id: "roots-19-example-basic-odd",
    title: "Część a: pierwiastek nieparzysty z liczby ujemnej",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / A",
    visualKind: "root_parity",
    sourceExerciseId: exBasic.id,
    narration:
      "W części a stopień wynosi trzy, czyli jest nieparzysty. Minus może zostać pod pierwiastkiem i wyjdzie jako minus w wyniku. Szukamy liczby, której trzecia potęga daje minus sześćdziesiąt cztery. To jest minus cztery.",
    lines: visualLines([
      "³√(-64) = -³√64",
      "64 = 4³",
      "³√(-64) = -4",
      "sprawdzenie: (-4)³ = -64"
    ], 5)
  });

  add({
    id: "roots-20-example-basic-even",
    title: "Część b: pierwiastek parzysty wybiera wynik dodatni",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / B",
    visualKind: "root_parity",
    sourceExerciseId: exBasic.id,
    narration:
      "W części b stopień wynosi cztery. Liczba pod pierwiastkiem jest dodatnia, więc pierwiastek istnieje. Wynik musi być nieujemny. Ponieważ pięć do czwartej potęgi daje sześćset dwadzieścia pięć, odpowiedź to pięć.",
    lines: visualLines([
      "⁴√625",
      "625 = 5⁴",
      "⁴√625 = 5",
      "nie piszemy ±5"
    ], 5)
  });

  add({
    id: "roots-21-example-extract-present",
    title: "Przykład drugi: wyłączamy czynnik",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / TREŚĆ",
    visualKind: "exercise",
    sourceExerciseId: exExtract.id,
    narration:
      "Drugi przykład pokazuje typowy rachunek maturalny: uprościć pierwiastek trzeciego stopnia z czterdziestu. Nie szukamy przybliżenia. Szukamy sześcianu ukrytego pod pierwiastkiem, bo pełny sześcian może wyjść przed znak.",
    lines: visualLines([
      exExtract.statement,
      "stopień: 3",
      "szukamy sześcianów pod pierwiastkiem",
      "postać najprostsza, nie przybliżenie"
    ], 5)
  });

  add({
    id: "roots-22-example-extract-factor",
    title: "Rozkład czterdziestu ujawnia sześcian",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / ROZKŁAD",
    visualKind: "factor_tree",
    sourceExerciseId: exExtract.id,
    narration:
      "Rozkładamy czterdzieści na czynniki. Dostajemy dwa do trzeciej potęgi razy pięć. Trzy dwójki tworzą pełną grupę dla pierwiastka trzeciego stopnia, więc ta grupa wychodzi jako jedna dwójka.",
    lines: visualLines([
      "40 = 2 · 2 · 2 · 5",
      "40 = 2³ · 5",
      "pełna grupa: 2³",
      "reszta: 5"
    ], 5)
  });

  add({
    id: "roots-23-example-extract-result",
    title: "Zapisujemy postać najprostszą",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / WYNIK",
    visualKind: "factor_tree",
    sourceExerciseId: exExtract.id,
    narration:
      "Teraz zamieniamy rozkład na wynik. Pierwiastek trzeciego stopnia z dwa do trzeciej potęgi daje dwa. Piątka zostaje pod pierwiastkiem, bo nie ma już pełnej grupy trzech takich samych czynników.",
    lines: visualLines([
      "³√40 = ³√(2³ · 5)",
      "³√(2³ · 5) = 2³√5",
      "pod pierwiastkiem nie został żaden sześcian",
      "odpowiedź: 2³√5"
    ], 5)
  });

  add({
    id: "roots-24-example-properties-present",
    title: "Przykład trzeci: własności pierwiastków",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / TREŚĆ",
    visualKind: "exercise",
    sourceExerciseId: exProperties.id,
    narration:
      "Trzeci przykład łączy dwie własności. W części a mnożymy pierwiastki tego samego stopnia. W części b pierwiastek znajduje się w pierwiastku. W obu przypadkach najpierw rozpoznajemy strukturę, a dopiero potem liczymy.",
    lines: visualLines([
      exProperties.statement,
      "a) iloczyn pierwiastków czwartego stopnia",
      "b) pierwiastek z pierwiastka",
      "rozpoznaj strukturę przed rachunkiem"
    ], 5)
  });

  add({
    id: "roots-25-example-product-result",
    title: "Część a: łączymy iloczyn pod jednym pierwiastkiem",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / ILOCZYN",
    visualKind: "formula",
    sourceExerciseId: exProperties.id,
    narration:
      "W części a oba pierwiastki mają stopień czwarty i obie liczby podpierwiastkowe są dodatnie. Możemy więc połączyć je w jeden pierwiastek. Pod spodem powstaje dwieście pięćdziesiąt sześć, czyli cztery do czwartej potęgi.",
    lines: visualLines([
      "⁴√2 · ⁴√128 = ⁴√(2 · 128)",
      "2 · 128 = 256",
      "256 = 4⁴",
      "wynik: 4"
    ], 5)
  });

  add({
    id: "roots-26-example-nested-result",
    title: "Część b: pierwiastek z pierwiastka",
    sceneType: "example",
    sceneLabel: "PRZYKŁAD / ZAGNIEŻDŻENIE",
    visualKind: "root_balance",
    sourceExerciseId: exProperties.id,
    narration:
      "W części b mamy pierwiastek kwadratowy z pierwiastka trzeciego stopnia. Stopnie mnożą się, więc dostajemy pierwiastek szóstego stopnia z sześćdziesięciu czterech. A sześćdziesiąt cztery to dwa do szóstej potęgi.",
    lines: visualLines([
      "√(³√64) = ⁶√64",
      "64 = 2⁶",
      "⁶√64 = 2",
      "wynik: 2"
    ], 5)
  });

  add({
    id: "roots-27-summary",
    title: "Co ma zostać po tej lekcji",
    sceneType: "summary",
    sceneLabel: "PODSUMOWANIE / CHECKLISTA",
    visualKind: "summary",
    narration:
      "Zostawiamy sobie prostą checklistę. Najpierw sprawdź stopień pierwiastka. Potem zdecyduj, czy znak liczby podpierwiastkowej jest dozwolony. Następnie użyj odpowiedniej własności i na końcu uprość wynik, szukając pełnych grup pod pierwiastkiem.",
    lines: visualLines([
      "1. Stopień: parzysty czy nieparzysty?",
      "2. Dziedzina i znak.",
      "3. Własność: iloczyn, iloraz, zagnieżdżenie.",
      "4. Postać najprostsza i sprawdzenie."
    ], 5)
  });

  return plans;
}

function theoryPlans(section: Section): GenericScenePlan[] {
  if (section.slug === "dzialania-liczby-rzeczywiste") {
    return directedRealNumbersTheoryPlans(section);
  }
  if (section.slug === "pierwiastki-dowolnego-stopnia") {
    return directedRootsTheoryPlans(section);
  }

  const concepts = [...section.knowledge.concepts].sort((a, b) => a.difficulty - b.difficulty);
  const methods = section.knowledge.methods;
  const formulas = section.knowledge.formulas;
  const examples = exercisesForSlot(section, "THEORY_SUPPORT").slice(0, 3);

  const plans: GenericScenePlan[] = [];
  plans.push(
    makeScene({
      id: "theory-00-hook",
      title: section.name,
      sceneType: "hook",
      sceneLabel: "HAK",
      narration:
        `Dzisiaj porządkujemy temat ${section.name}. ` +
        "Celem jest zobaczyć, co trzeba rozpoznać na maturze, jakiego narzędzia użyć i gdzie zwykle pojawia się pułapka.",
      lines: visualLines([
        `Temat: ${section.name}`,
        `Zakres: ${takeWords(section.scope, 28)}`,
        `Cel: rozpoznać narzędzie, wykonać rachunek, sprawdzić odpowiedź.`
      ], 6)
    })
  );

  concepts.slice(0, 4).forEach((concept, index) => {
    plans.push(
      makeScene({
        id: `theory-concept-${index + 1}`,
        title: concept.name,
        sceneType: "definition",
        sceneLabel: "DEFINICJA",
        narration:
          `${concept.name}. ${firstSentence(concept.explanation, concept.description)} ` +
          "Zatrzymaj ten obraz, bo do niego wrócimy przy zadaniach.",
        lines: visualLines([concept.description, concept.explanation], 8),
        mathematicalConcept: concept.name
      })
    );
  });

  methods.slice(0, 2).forEach((method, index) => {
    plans.push(
      makeScene({
        id: `theory-method-${index + 1}`,
        title: method.name,
        sceneType: "definition",
        sceneLabel: "DEFINICJA",
        narration:
          `${method.name}. Używamy tej metody wtedy, gdy ${cleanText(method.when_to_use).toLowerCase()} ` +
          `Najważniejszy pierwszy krok to: ${cleanText(method.steps[0] ?? "nazwać dane i szukane").toLowerCase()}.`,
        lines: visualLines([`Kiedy: ${method.when_to_use}`, ...method.steps.map((s) => `• ${s}`)], 8),
        mathematicalConcept: method.name
      })
    );
  });

  formulas.slice(0, 2).forEach((formula, index) => {
    plans.push(
      makeScene({
        id: `theory-formula-${index + 1}`,
        title: formula.name,
        sceneType: "definition",
        sceneLabel: "WZÓR",
        narration:
          `${formula.name}. Ten wzór nie jest do ozdoby, tylko mówi, jak przekształcić zapis w rachunek. ` +
          `${formula.description ? firstSentence(formula.description) : "Przed użyciem zawsze sprawdzamy warunki."}`,
        lines: visualLines([formula.latex_raw, formula.conditions ?? "", formula.description ?? ""], 7),
        mathematicalConcept: formula.name
      })
    );
  });

  examples.forEach((exercise, index) => plans.push(problemScene(exercise, "example", `PRZYKŁAD ${index + 1}`)));

  plans.push(
    makeScene({
      id: "theory-summary",
      title: "Podsumowanie",
      sceneType: "summary",
      sceneLabel: "PODSUMOWANIE",
      narration:
        "Po tej lekcji najpierw nazywamy typ obiektu, potem wybieramy własność albo metodę, a dopiero na końcu liczymy. " +
        "Taka kolejność zmniejsza liczbę przypadkowych błędów.",
      lines: visualLines([
        "Najpierw: rozpoznaj typ zadania.",
        "Potem: wybierz wzór, własność albo metodę.",
        "Na końcu: policz i sprawdź sens wyniku."
      ], 6)
    })
  );

  return plans;
}

function problemScene(exercise: Exercise, sceneType: SceneType, label: string): GenericScenePlan {
  const sought = soughtLabels(exercise);
  const answer = answerText(exercise);
  const steps = exercise.solution_steps.slice(0, 5);
  const title = exercise.exercise_type || exercise.id;
  return makeScene({
    id: `${sceneType}-${exercise.id}`,
    title,
    sceneType,
    sceneLabel: label,
    sourceExerciseId: exercise.id,
    narration:
      `Zadanie typu ${title}. Najpierw czytamy polecenie i wypisujemy, czego szukamy. ` +
      `${sought.length ? `Tutaj szukamy: ${sought.join(", ")}. ` : ""}` +
      `Rozwiązanie prowadzi do odpowiedzi: ${answer || "zapisanej w ostatnim kroku"}.`,
    lines: visualLines([
      exercise.statement,
      sought.length ? `Szukane: ${sought.join(", ")}` : "",
      ...steps.map((step) => `• ${step}`),
      answer ? `Odpowiedź: ${answer}` : ""
    ], 9),
    minSeconds: 28,
    maxSeconds: 58,
    mathematicalConcept: exercise.skills?.join(", ") || title
  });
}

function exerciseEpisodePlans(section: Section, type: Exclude<EpisodeType, "theory">): GenericScenePlan[] {
  const slot = SLOT_BY_TYPE[type];
  const problems = exercisesForSlot(section, slot).slice(0, type === "challenge" ? 3 : 5);
  const introType: SceneType = type === "challenge" ? "rules" : type === "mistakes" ? "hook" : "quick_recall";
  const problemType: SceneType = type === "challenge" ? "challenge" : type === "mistakes" ? "mistake" : "exercise";
  const outroType: SceneType = type === "challenge" ? "score" : type === "mistakes" ? "checklist" : "solution_pattern";

  const plans: GenericScenePlan[] = [
    makeScene({
      id: `${type}-00-intro`,
      title: `${section.name}: ${POLISH_TYPE[type]}`,
      sceneType: introType,
      sceneLabel: type === "challenge" ? "ZASADY" : type === "mistakes" ? "HAK" : "PRZYPOMNIENIE",
      narration:
        `Teraz robimy część: ${POLISH_TYPE[type]}. Pracujemy na zatwierdzonych zadaniach z ZasPro i pilnujemy jednej rzeczy: każdy krok ma mieć powód.`,
      lines: visualLines([
        `Sekcja: ${section.name}`,
        `Tryb: ${POLISH_TYPE[type]}`,
        "Zasada: dane, metoda, rachunek, kontrola wyniku."
      ], 6)
    })
  ];

  problems.forEach((exercise, index) => {
    const label =
      type === "challenge"
        ? `WYZWANIE ${index + 1}`
        : type === "mistakes"
          ? `BŁĄD ${index + 1}`
          : `ZADANIE ${index + 1}`;
    plans.push(problemScene(exercise, problemType, label));
  });

  plans.push(
    makeScene({
      id: `${type}-summary`,
      title: "Wzorzec do zapamiętania",
      sceneType: outroType,
      sceneLabel: type === "challenge" ? "WYNIK" : type === "mistakes" ? "CHECKLISTA" : "SCHEMAT",
      narration:
        "Najważniejszy wzorzec jest prosty. Nie zaczynamy od liczenia na ślepo. Najpierw rozpoznajemy strukturę, potem wybieramy narzędzie, a wynik sprawdzamy z treścią.",
      lines: visualLines([
        "Rozpoznaj strukturę zadania.",
        "Wybierz jedno narzędzie.",
        "Prowadź rachunek w krótkich krokach.",
        "Sprawdź, czy odpowiedź pasuje do pytania."
      ], 6)
    })
  );

  return plans;
}

function buildPlans(section: Section, type: EpisodeType): GenericScenePlan[] {
  if (type === "theory") return theoryPlans(section);
  return exerciseEpisodePlans(section, type);
}

function plansFor(type: EpisodeType): GenericScenePlan[] {
  const sectionSlug = currentSectionSlug();
  const key = `${sectionSlug}/${type}`;
  if (!cache.has(key)) {
    cache.set(key, buildPlans(loadSection(sectionSlug), type));
  }
  return cache.get(key)!;
}

export function createGenericLongformStoryboard(type: EpisodeType, topic: string): Storyboard {
  const sectionSlug = currentSectionSlug();
  const section = loadSection(sectionSlug);
  const scenePlans = plansFor(type);
  const scenes: VideoScene[] = scenePlans.map(({code: _code, ...scene}, index) => ({
    ...scene,
    sceneIndex: index + 1,
    sourcePath: path.join(SCENE_SOURCE_DIR, `${scene.id.replace(/[^a-z0-9]+/gi, "_")}.py`),
    renderPath: path.join(SCENE_RENDER_DIR, `${scene.id}.mp4`),
    publicPath: `generated/scenes/${scene.id}.mp4`
  }));

  const title = topic || `${section.name}: ${POLISH_TYPE[type]}`;
  return {
    topic: title,
    slug: slugify(title),
    sectionSlug,
    episodeType: STORYBOARD_TYPE[type],
    format: "longform-16x9",
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    durationSeconds: scenes.reduce((total, scene) => total + scene.durationSeconds, 0),
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

export function getGenericLongformSceneCode(type: EpisodeType, sceneId: string): string {
  const plan = plansFor(type).find((scene) => scene.id === sceneId);
  if (!plan) throw new Error(`Unknown generic ${type} scene "${sceneId}".`);
  return `${plan.code}\n`;
}

export function getGenericLongformThumbnailPlans(): {
  filename: string;
  code: string;
  className: string;
}[] {
  const section = loadSection(currentSectionSlug());
  if (section.slug !== "pierwiastki-dowolnego-stopnia") return [];

  const variants = [
    {
      filename: "thumbnail-1.png",
      className: "GenericRootThumbnailOne",
      kicker: "MATURA PODSTAWOWA",
      headline: "PIERWIASTKI\nDOWOLNEGO STOPNIA",
      formula: String.raw`\sqrt[n]{a}=b`
    },
    {
      filename: "thumbnail-2.png",
      className: "GenericRootThumbnailTwo",
      kicker: "TEN TEMAT OBLEWA MATURZYSTÓW",
      headline: "TEN ZNAK\nDECYDUJE O WYNIKU",
      formula: String.raw`\sqrt[4]{(-3)^4}=3`
    },
    {
      filename: "thumbnail-3.png",
      className: "GenericRootThumbnailThree",
      kicker: "BEZ TEGO NIE ZDASZ MATURY",
      headline: "NIE ZGADUJ\nPIERWIASTKA",
      formula: String.raw`\sqrt[3]{-64}=-4`
    }
  ];

  return variants.map((variant) => ({
    filename: variant.filename,
    className: variant.className,
    code: `from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class ${variant.className}(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker=${JSON.stringify(variant.kicker)},
            headline=${JSON.stringify(variant.headline)},
            formula=${JSON.stringify(variant.formula)},
        )
`
  }));
}

export function genericLongformPlannerFor(type: EpisodeType): GenericPlanner {
  return {
    createStoryboard: (topic: string) => createGenericLongformStoryboard(type, topic),
    getSceneCode: (sceneId: string) => getGenericLongformSceneCode(type, sceneId)
  };
}

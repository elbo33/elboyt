import path from "node:path";
import {FPS, HEIGHT, SCENE_RENDER_DIR, SCENE_SOURCE_DIR, WIDTH} from "../core/config";
import {slugify} from "../core/slug";
import type {Storyboard, VideoScene} from "../core/types";

type ScenePlan = Omit<VideoScene, "sourcePath" | "renderPath" | "publicPath"> & {
  code: string;
};

const scenePlans: ScenePlan[] = [
  {
    id: "scene-01-hook",
    title: "Three Doors",
    className: "Scene01Hook",
    durationSeconds: 8,
    purpose: "Introduce the three-door setup.",
    mathematicalConcept: "One of three doors hides a prize; the other two do not.",
    objects: ["three doors"],
    animation: "Three numbered doors draw in.",
    camera: "Static vertical frame.",
    text: "SHOULD YOU SWITCH DOORS?",
    transition: "The choice is about to be made.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("SHOULD YOU\nSWITCH DOORS?", 0.56)
        doors = VGroup()
        for i in range(3):
            door = Rectangle(width=1.0, height=1.8, color=FOREGROUND, stroke_width=5)
            door.shift(RIGHT * i * 1.3)
            number = small_label(str(i + 1), 0.4, FOREGROUND).move_to(door.get_center())
            doors.add(VGroup(door, number))
        doors.move_to([0, 0.6, 0])
        caption = small_label("One door hides a car. Two hide goats.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[Create(d[0]) for d in doors], lag_ratio=0.25), *[FadeIn(d[1]) for d in doors], run_time=1.4)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.5)`
  },
  {
    id: "scene-02-setup",
    title: "The Host Reveals",
    className: "Scene02Setup",
    durationSeconds: 8,
    purpose: "Show the player picking a door and the host revealing a goat behind another.",
    mathematicalConcept: "The host always opens a door the player did not pick and that does not hide the prize.",
    objects: ["three doors", "pick marker", "revealed goat"],
    animation: "A marker points to the chosen door, then another door opens to reveal a goat.",
    camera: "Static, centered on the doors.",
    text: "PICK ONE. HOST REVEALS A GOAT.",
    transition: "Two doors remain: your pick and one other.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, ACCENT, RED

class Scene02Setup(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("PICK ONE. HOST REVEALS A GOAT.", 0.34)
        doors = VGroup()
        for i in range(3):
            door = Rectangle(width=1.0, height=1.8, color=FOREGROUND, stroke_width=5)
            door.shift(RIGHT * i * 1.3)
            number = small_label(str(i + 1), 0.4, FOREGROUND).move_to(door.get_center())
            doors.add(VGroup(door, number))
        doors.move_to([0, 0.6, 0])
        pick_arrow = Triangle(color=ACCENT, fill_color=ACCENT, fill_opacity=1).scale(0.18).rotate(PI).next_to(doors[0], DOWN, buff=0.15)
        pick_label = small_label("your pick", 0.26, ACCENT).next_to(pick_arrow, DOWN, buff=0.1)
        goat_label = small_label("goat", 0.32, RED).move_to(doors[2].get_center())
        caption = small_label("The host never opens your door or the car.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(doors), run_time=1.2)
        self.play(FadeIn(pick_arrow), FadeIn(pick_label), run_time=0.7)
        self.play(doors[2][0].animate.set_stroke(RED), FadeOut(doors[2][1]), FadeIn(goat_label), run_time=1.0)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.2)`
  },
  {
    id: "scene-03-case-analysis",
    title: "Every Case",
    className: "Scene03CaseAnalysis",
    durationSeconds: 10,
    purpose: "Enumerate all three equally likely placements of the car and the outcome of staying versus switching.",
    mathematicalConcept: "Across the three equally likely car placements, staying wins once and switching wins twice.",
    objects: ["three rows of mini doors", "stay and switch outcomes"],
    animation: "Three rows appear, each showing where the car could be and what staying or switching would win.",
    camera: "Static, centered on the three rows.",
    text: "EVERY POSSIBLE CASE",
    transition: "The pattern across all cases is now visible.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, GREEN, RED

class Scene03CaseAnalysis(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("EVERY POSSIBLE CASE", 0.42)
        rows_data = [
            (0, "WIN", "LOSE"),
            (1, "LOSE", "WIN"),
            (2, "LOSE", "WIN"),
        ]
        group = VGroup()
        for car_index, stay_result, switch_result in rows_data:
            doors = VGroup()
            for i in range(3):
                color = GREEN if i == car_index else MUTED
                door = Square(side_length=0.55, color=color, fill_color=color, fill_opacity=0.5 if i == car_index else 0.15, stroke_width=2)
                door.shift(RIGHT * i * 0.65)
                doors.add(door)
            doors.move_to([-3.0, 0, 0])
            stay_label = small_label(f"stay: {stay_result}", 0.28, GREEN if stay_result == "WIN" else RED).move_to([-0.3, 0, 0])
            switch_label = small_label(f"switch: {switch_result}", 0.28, GREEN if switch_result == "WIN" else RED).move_to([1.7, 0, 0])
            row = VGroup(doors, stay_label, switch_label)
            group.add(row)
        group.arrange(DOWN, buff=0.55).move_to([0, 0.6, 0])
        caption = small_label("You always pick door 1 first.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(row) for row in group], lag_ratio=0.4), run_time=2.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.5)`
  },
  {
    id: "scene-04-probabilities",
    title: "The Odds",
    className: "Scene04Probabilities",
    durationSeconds: 9,
    purpose: "Visualize the resulting win probabilities as growing bars.",
    mathematicalConcept: "Staying wins with probability one third; switching wins with probability two thirds.",
    objects: ["two growing bars"],
    animation: "A red bar grows to one third height while a green bar grows to two thirds height.",
    camera: "Centered on the two bars.",
    text: "SWITCHING WINS TWICE AS OFTEN",
    transition: "The gap between the bars settles.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, GREEN, RED

class Scene04Probabilities(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("SWITCHING WINS\nTWICE AS OFTEN", 0.38)
        baseline_y = -0.2
        stay_bar = Rectangle(width=1.2, height=0.05, color=RED, fill_color=RED, fill_opacity=0.8, stroke_width=0)
        switch_bar = Rectangle(width=1.2, height=0.05, color=GREEN, fill_color=GREEN, fill_opacity=0.8, stroke_width=0)
        stay_bar.move_to([-1.4, baseline_y, 0], aligned_edge=DOWN)
        switch_bar.move_to([1.4, baseline_y, 0], aligned_edge=DOWN)
        stay_label = small_label("stay: 1/3", 0.32, RED).next_to(stay_bar, DOWN, buff=0.3)
        switch_label = small_label("switch: 2/3", 0.32, GREEN).next_to(switch_bar, DOWN, buff=0.3)
        caption = small_label("Same doors. Very different odds.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(FadeIn(stay_label), FadeIn(switch_label), run_time=0.6)
        self.play(
            stay_bar.animate.stretch_to_fit_height(1.4, about_edge=DOWN),
            switch_bar.animate.stretch_to_fit_height(2.8, about_edge=DOWN),
            run_time=1.8,
        )
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.4)`
  },
  {
    id: "scene-05-conclusion",
    title: "Always Switch",
    className: "Scene05Conclusion",
    durationSeconds: 8,
    purpose: "State the conclusion plainly.",
    mathematicalConcept: "Switching doubles the probability of winning compared to staying.",
    objects: ["closing statement"],
    animation: "The final statement is written and held.",
    camera: "Quiet final frame.",
    text: "ALWAYS SWITCH.",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED

class Scene05Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        final = headline("ALWAYS SWITCH.", 0.56)
        note = small_label("Two out of three times, the other door has the car.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(final), run_time=1.2)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.7)
        self.wait(3.6)`
  }
];

export function createStoryboard(topic: string): Storyboard {
  const slug = slugify(topic);
  const scenes: VideoScene[] = scenePlans.map(({code: _code, ...scene}) => ({
    ...scene,
    sourcePath: path.join(SCENE_SOURCE_DIR, `${scene.id}.py`),
    renderPath: path.join(SCENE_RENDER_DIR, `${scene.id}.mp4`),
    publicPath: `generated/scenes/${scene.id}.mp4`
  }));

  return {
    topic,
    slug,
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

export function getSceneCode(sceneId: string): string {
  const scene = scenePlans.find((item) => item.id === sceneId);
  if (!scene) {
    throw new Error(`Unknown scene ${sceneId}`);
  }
  return `${scene.code}\n`;
}

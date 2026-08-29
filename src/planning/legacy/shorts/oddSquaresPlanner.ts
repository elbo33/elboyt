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
    title: "The Grid",
    className: "Scene01Hook",
    durationSeconds: 7,
    purpose: "Present the empty grid that will reveal the pattern.",
    mathematicalConcept: "A 4 by 4 grid has 16 cells, which is 4 squared.",
    objects: ["4x4 grid"],
    animation: "The grid draws in cell by cell.",
    camera: "Static vertical frame.",
    text: "WHY DOES 1 + 3 + 5 + 7 = 4²?",
    transition: "The hidden layering is about to be revealed.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED
import numpy as np

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WHY DOES\n1 + 3 + 5 + 7 = 4²?", 0.5)
        n = 4
        cell = 0.85
        origin = np.array([-n * cell / 2, 0.6 - n * cell / 2, 0])
        grid = VGroup()
        for row in range(n):
            for col in range(n):
                sq = Square(side_length=cell, stroke_width=2, stroke_color=MUTED)
                sq.move_to(origin + np.array([(col + 0.5) * cell, (row + 0.5) * cell, 0]))
                grid.add(sq)
        caption = small_label("Same 16 squares. A hidden layered pattern.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=1.0)
        self.play(Create(grid), run_time=1.3)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.3)`
  },
  {
    id: "scene-02-layers",
    title: "Peel Off Layers",
    className: "Scene02Layers",
    durationSeconds: 9,
    purpose: "Reveal that the grid is built from nested L-shaped layers of odd size.",
    mathematicalConcept: "The k-th L-shaped layer of a growing square always has 2k+1 cells.",
    objects: ["four colored L-shaped layers"],
    animation: "Layers of size 1, 3, 5, and 7 fade in one at a time, each wrapping the last.",
    camera: "Static, centered on the grid.",
    text: "EACH LAYER IS AN ODD NUMBER",
    transition: "Four layers, four odd numbers.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

class Scene02Layers(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("EACH LAYER IS\nAN ODD NUMBER", 0.4)
        n = 4
        cell = 0.85
        origin = np.array([-n * cell / 2, 0.6 - n * cell / 2, 0])
        colors = [ACCENT, SECONDARY, GREEN, RED]
        layers = [VGroup() for _ in range(n)]
        for row in range(n):
            for col in range(n):
                layer = max(row, col)
                sq = Square(side_length=cell, stroke_width=2, stroke_color=MUTED, fill_color=colors[layer], fill_opacity=0.5)
                sq.move_to(origin + np.array([(col + 0.5) * cell, (row + 0.5) * cell, 0]))
                layers[layer].add(sq)
        odd_labels = ["1", "3", "5", "7"]
        caption = small_label("1, then 3 more, then 5 more, then 7 more.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        for i, layer in enumerate(layers):
            corner = origin + np.array([(i + 1.0) * cell, (i + 1.0) * cell, 0])
            label = small_label(odd_labels[i], 0.32, colors[i]).move_to(corner)
            self.play(FadeIn(layer), FadeIn(label), run_time=1.0)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.4)`
  },
  {
    id: "scene-03-generalize",
    title: "Still A Square",
    className: "Scene03Generalize",
    durationSeconds: 8,
    purpose: "Confirm the total is a perfect square and generalize the pattern.",
    mathematicalConcept: "Adding each successive odd-sized layer always keeps the shape a perfect square.",
    objects: ["completed grid", "outline"],
    animation: "The full colored grid is outlined as one 4 by 4 square.",
    camera: "Static, centered on the grid.",
    text: "1 + 3 + 5 + 7 = 16 = 4²",
    transition: "The pattern is ready to generalize.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

class Scene03Generalize(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("1 + 3 + 5 + 7 = 16 = 4²", 0.38)
        n = 4
        cell = 0.85
        origin = np.array([-n * cell / 2, 0.6 - n * cell / 2, 0])
        colors = [ACCENT, SECONDARY, GREEN, RED]
        grid = VGroup()
        for row in range(n):
            for col in range(n):
                layer = max(row, col)
                sq = Square(side_length=cell, stroke_width=2, stroke_color=MUTED, fill_color=colors[layer], fill_opacity=0.5)
                sq.move_to(origin + np.array([(col + 0.5) * cell, (row + 0.5) * cell, 0]))
                grid.add(sq)
        outline = Square(side_length=n * cell, color=FOREGROUND, stroke_width=6).move_to([0, 0.6, 0])
        caption = small_label("Every new odd layer keeps it a perfect square.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), FadeIn(grid), run_time=1.1)
        self.play(Create(outline), run_time=1.0)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.5)`
  },
  {
    id: "scene-04-meter",
    title: "Running Total",
    className: "Scene04Meter",
    durationSeconds: 8,
    purpose: "Show the running total always landing on a perfect square.",
    mathematicalConcept: "Partial sums of consecutive odd numbers are exactly the perfect squares.",
    objects: ["running total counter"],
    animation: "A counter jumps through 1, 4, 9, 16, 25.",
    camera: "Centered on the counter.",
    text: "THE RUNNING TOTAL IS ALWAYS A SQUARE",
    transition: "The pattern is undeniable.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, GREEN

class Scene04Meter(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("THE RUNNING TOTAL\nIS ALWAYS A SQUARE", 0.38)
        tracker = ValueTracker(0)
        value = DecimalNumber(0, num_decimal_places=0, color=FOREGROUND).scale(0.7)
        value.add_updater(lambda m: m.set_value(tracker.get_value()))
        value.move_to([0, 0.8, 0])
        label = small_label("sum so far", 0.3, MUTED).next_to(value, UP, buff=0.25)
        squares_note = small_label("1, 4, 9, 16, 25, ...", 0.32, GREEN).next_to(value, DOWN, buff=0.35)
        caption = small_label("Every partial sum lands on a perfect square.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), FadeIn(label), FadeIn(value), run_time=0.9)
        for total in [1, 4, 9, 16, 25]:
            self.play(tracker.animate.set_value(total), run_time=0.9)
        self.play(FadeIn(squares_note), run_time=0.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.6)`
  },
  {
    id: "scene-05-conclusion",
    title: "The General Rule",
    className: "Scene05Conclusion",
    durationSeconds: 8,
    purpose: "State the general formula.",
    mathematicalConcept: "The sum of the first n odd numbers equals n squared.",
    objects: ["closing formula"],
    animation: "The final formula is written and held.",
    camera: "Quiet final frame.",
    text: "1 + 3 + 5 + ... + (2n-1) = n²",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED

class Scene05Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        final = headline("1 + 3 + 5 + ... + (2n-1) = n²", 0.36)
        note = small_label("Odd numbers build squares, one layer at a time.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(final), run_time=1.4)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.7)
        self.wait(3.4)`
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

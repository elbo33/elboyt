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
    title: "The Sequence",
    className: "Scene01Hook",
    durationSeconds: 7,
    purpose: "Introduce the Fibonacci sequence as the starting mystery.",
    mathematicalConcept: "Each Fibonacci number is the sum of the two before it.",
    objects: ["sequence of numbers"],
    animation: "The numbers appear one after another.",
    camera: "Static vertical frame.",
    text: "1, 1, 2, 3, 5, 8, 13...",
    transition: "The question of the hidden ratio is posed.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, ACCENT

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("1, 1, 2, 3, 5, 8, 13...", 0.52)
        numbers = VGroup(*[small_label(n, 0.4, ACCENT) for n in ["1", "1", "2", "3", "5", "8"]])
        numbers.arrange(RIGHT, buff=0.5).move_to([0, 0.8, 0])
        caption = small_label("Where is the golden ratio hiding in here?", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=1.0)
        self.play(LaggedStart(*[FadeIn(n, shift=0.2 * UP) for n in numbers], lag_ratio=0.2), run_time=1.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.0)`
  },
  {
    id: "scene-02-squares",
    title: "Build The Squares",
    className: "Scene02Squares",
    durationSeconds: 9,
    purpose: "Tile squares whose side lengths follow the Fibonacci sequence.",
    mathematicalConcept: "Squares sized by consecutive Fibonacci numbers tile perfectly into a growing rectangle.",
    objects: ["five spiraling squares"],
    animation: "Squares of size 1, 1, 2, 3, and 5 appear in sequence, spiraling outward.",
    camera: "Static, centered on the tiling.",
    text: "BUILD SQUARES FROM THE SEQUENCE",
    transition: "A rectangle of growing proportions takes shape.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, ACCENT, SECONDARY, GREEN, RED
import numpy as np

class Scene02Squares(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("BUILD SQUARES FROM\nTHE SEQUENCE", 0.38)
        k = 0.85
        raw_center = np.array([1.5, 2.0, 0])
        target_center = np.array([0, 1.2, 0])

        def T(x, y):
            p = np.array([x, y, 0.0]) - raw_center
            return p * k + target_center

        squares_data = [
            (0.5, 0.5, 1, ACCENT, "1"),
            (-0.5, 0.5, 1, SECONDARY, "1"),
            (0.0, -1.0, 2, GREEN, "2"),
            (2.5, -0.5, 3, RED, "3"),
            (1.5, 3.5, 5, ACCENT, "5"),
        ]
        group = VGroup()
        for cx, cy, size, color, label in squares_data:
            sq = Square(side_length=size * k, color=color, stroke_width=4)
            sq.move_to(T(cx, cy))
            num = small_label(label, 0.32, color).move_to(T(cx, cy))
            group.add(sq, num)
        caption = small_label("Each square's side is the next Fibonacci number.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(m) for m in group], lag_ratio=0.15), run_time=2.8)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.7)`
  },
  {
    id: "scene-03-spiral",
    title: "The Spiral",
    className: "Scene03Spiral",
    durationSeconds: 8,
    purpose: "Show the logarithmic spiral traced by the growing squares.",
    mathematicalConcept: "The growth pattern traces a logarithmic spiral that grows by the golden ratio each quarter turn.",
    objects: ["spiral curve"],
    animation: "A spiral curve draws outward from the center.",
    camera: "Static, centered on the spiral.",
    text: "THE GROWTH TRACES A SPIRAL",
    transition: "The spiral keeps opening outward.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, ACCENT
import numpy as np

class Scene03Spiral(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("THE GROWTH TRACES\nA SPIRAL", 0.42)
        phi = (1 + 5 ** 0.5) / 2
        center = np.array([0, 1.2, 0])

        def spiral_point(theta):
            r = 0.3 * phi ** (theta / (PI / 2))
            return center + np.array([r * np.cos(theta), r * np.sin(theta), 0])

        curve = ParametricFunction(spiral_point, t_range=[0, 2.5 * PI], color=ACCENT, stroke_width=5)
        caption = small_label("Each quarter turn grows by the same golden factor.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(Create(curve), run_time=3.0, rate_func=linear)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.5)`
  },
  {
    id: "scene-04-ratios",
    title: "The Ratios Converge",
    className: "Scene04Ratios",
    durationSeconds: 9,
    purpose: "Track the ratio of consecutive Fibonacci numbers converging to the golden ratio.",
    mathematicalConcept: "The ratio of consecutive Fibonacci numbers converges to the golden ratio, approximately 1.618.",
    objects: ["running ratio counter"],
    animation: "A counter steps through successive ratios, settling near 1.618.",
    camera: "Centered on the counter.",
    text: "DIVIDE EACH TERM BY THE ONE BEFORE",
    transition: "The counter locks onto the golden ratio.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, GREEN

class Scene04Ratios(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("DIVIDE EACH TERM\nBY THE ONE BEFORE", 0.36)
        tracker = ValueTracker(1.0)
        value = DecimalNumber(1.0, num_decimal_places=4, color=FOREGROUND).scale(0.7)
        value.add_updater(lambda m: m.set_value(tracker.get_value()))
        value.move_to([0, 0.8, 0])
        label = small_label("ratio so far", 0.3, MUTED).next_to(value, UP, buff=0.25)
        target_line = small_label("golden ratio ≈ 1.6180", 0.3, GREEN).next_to(value, DOWN, buff=0.35)
        caption = small_label("The ratios settle right on the golden ratio.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), FadeIn(label), FadeIn(value), run_time=0.9)
        ratios = [1.0, 2.0, 1.5, 1.6667, 1.6, 1.625, 1.6154, 1.6190, 1.6180]
        for r in ratios:
            self.play(tracker.animate.set_value(r), run_time=0.55)
        self.play(FadeIn(target_line), run_time=0.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.4)`
  },
  {
    id: "scene-05-conclusion",
    title: "The Golden Ratio",
    className: "Scene05Conclusion",
    durationSeconds: 8,
    purpose: "State the conclusion plainly.",
    mathematicalConcept: "The ratio of consecutive Fibonacci numbers converges to the golden ratio.",
    objects: ["closing statement"],
    animation: "The final statement is written and held.",
    camera: "Quiet final frame.",
    text: "THE RATIOS CONVERGE TO THE GOLDEN RATIO",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED

class Scene05Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        final = headline("THE RATIOS CONVERGE\nTO THE GOLDEN RATIO", 0.36)
        formula = small_label("φ ≈ 1.6180339887...", 0.36, MUTED).move_to([0, -1.9, 0])
        note = small_label("Hidden in a sequence built from simple addition.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(final), run_time=1.3)
        self.play(FadeIn(formula), run_time=0.7)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.6)
        self.wait(3.0)`
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

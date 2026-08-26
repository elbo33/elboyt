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
    title: "The Trimmed Board",
    className: "Scene01Hook",
    durationSeconds: 8,
    purpose: "Introduce a chessboard with two opposite corners removed.",
    mathematicalConcept: "A standard chessboard has 64 alternating light and dark squares.",
    objects: ["8x8 board", "two removed corners"],
    animation: "The board fades in, then both opposite corners are highlighted as removed.",
    camera: "Static, centered on the board.",
    text: "CAN DOMINOES COVER THIS BOARD?",
    transition: "The puzzle is posed.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, RED
import numpy as np

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("CAN DOMINOES COVER\nTHIS BOARD?", 0.5)
        n = 8
        cell = 0.5
        origin = np.array([-n * cell / 2, 0.8 - n * cell / 2, 0])
        board = VGroup()
        for row in range(n):
            for col in range(n):
                color = "#1B2836" if (row + col) % 2 == 0 else "#2C3E50"
                sq = Square(side_length=cell, stroke_width=0.5, stroke_color=MUTED, fill_color=color, fill_opacity=1)
                sq.move_to(origin + np.array([(col + 0.5) * cell, (row + 0.5) * cell, 0]))
                board.add(sq)
        corner_a = board[0]
        corner_b = board[n * n - 1]
        caption = small_label("Two opposite corners are removed.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(FadeIn(board), run_time=1.3)
        self.play(corner_a.animate.set_fill(RED, opacity=1), corner_b.animate.set_fill(RED, opacity=1), run_time=1.0)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.2)`
  },
  {
    id: "scene-02-domino-rule",
    title: "One Rule",
    className: "Scene02DominoRule",
    durationSeconds: 8,
    purpose: "Establish that every domino covers one light and one dark square.",
    mathematicalConcept: "A domino always covers two adjacent squares, which always differ in color.",
    objects: ["small board", "dominoes"],
    animation: "Dominoes are placed on a small board, each straddling one dark and one light square.",
    camera: "Static, centered on a small sample board.",
    text: "EVERY DOMINO COVERS ONE BLACK, ONE WHITE",
    transition: "The rule is set for the full board.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, ACCENT
import numpy as np

class Scene02DominoRule(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("EVERY DOMINO COVERS\nONE BLACK, ONE WHITE", 0.36)
        n_cols, n_rows = 4, 2
        cell = 0.9
        origin = np.array([-n_cols * cell / 2, 0.8 - n_rows * cell / 2, 0])
        board = VGroup()
        for row in range(n_rows):
            for col in range(n_cols):
                color = "#1B2836" if (row + col) % 2 == 0 else "#2C3E50"
                sq = Square(side_length=cell, stroke_width=1, stroke_color=MUTED, fill_color=color, fill_opacity=1)
                sq.move_to(origin + np.array([(col + 0.5) * cell, (row + 0.5) * cell, 0]))
                board.add(sq)
        dominoes = VGroup()
        for row in range(n_rows):
            for pair in range(n_cols // 2):
                col = pair * 2
                center = origin + np.array([(col + 1) * cell, (row + 0.5) * cell, 0])
                domino = Rectangle(width=cell * 1.8, height=cell * 0.85, color=ACCENT, stroke_width=4)
                domino.move_to(center)
                dominoes.add(domino)
        caption = small_label("Never two of the same color.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), FadeIn(board), run_time=1.1)
        self.play(LaggedStart(*[Create(d) for d in dominoes], lag_ratio=0.3), run_time=1.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.2)`
  },
  {
    id: "scene-03-count-colors",
    title: "Count The Colors",
    className: "Scene03CountColors",
    durationSeconds: 9,
    purpose: "Count remaining light and dark squares after the corners are removed.",
    mathematicalConcept: "Removing two same-colored squares breaks the original 32-32 balance.",
    objects: ["trimmed board", "two counts"],
    animation: "The trimmed board is shown alongside counts of remaining dark and light squares.",
    camera: "Static, centered on the board and counts.",
    text: "COUNT THE COLORS",
    transition: "The imbalance is now visible.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, RED, ACCENT, SECONDARY
import numpy as np

class Scene03CountColors(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("COUNT THE COLORS", 0.44)
        n = 8
        cell = 0.5
        origin = np.array([-n * cell / 2, 1.2 - n * cell / 2, 0])
        board = VGroup()
        for row in range(n):
            for col in range(n):
                color = "#1B2836" if (row + col) % 2 == 0 else "#2C3E50"
                sq = Square(side_length=cell, stroke_width=0.5, stroke_color=MUTED, fill_color=color, fill_opacity=1)
                sq.move_to(origin + np.array([(col + 0.5) * cell, (row + 0.5) * cell, 0]))
                board.add(sq)
        board[0].set_fill(RED, opacity=1)
        board[n * n - 1].set_fill(RED, opacity=1)
        dark_count = small_label("dark squares left: 30", 0.3, SECONDARY).move_to([0, -1.9, 0])
        light_count = small_label("light squares left: 32", 0.3, ACCENT).move_to([0, -2.45, 0])
        caption = small_label("Two colors. No longer equal.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), FadeIn(board), run_time=1.1)
        self.play(FadeIn(dark_count), run_time=0.7)
        self.play(FadeIn(light_count), run_time=0.7)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.5)`
  },
  {
    id: "scene-04-mismatch",
    title: "The Mismatch",
    className: "Scene04Mismatch",
    durationSeconds: 9,
    purpose: "Show that dominoes drain the smaller color group before the board is covered.",
    mathematicalConcept: "31 dominoes would need 31 dark and 31 light squares, but only 30 dark squares remain.",
    objects: ["two running counters"],
    animation: "Dark and light counters drain together, dark hits zero while light still has two left.",
    camera: "Centered on the two counters.",
    text: "31 DOMINOES NEED 31 OF EACH COLOR",
    transition: "Two light squares are left stranded.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import RED, ACCENT, SECONDARY

class Scene04Mismatch(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("31 DOMINOES NEED\n31 OF EACH COLOR", 0.34)
        dark_tracker = ValueTracker(30)
        light_tracker = ValueTracker(32)
        dark_value = DecimalNumber(30, num_decimal_places=0, color=SECONDARY).scale(0.6)
        light_value = DecimalNumber(32, num_decimal_places=0, color=ACCENT).scale(0.6)
        dark_value.add_updater(lambda m: m.set_value(dark_tracker.get_value()))
        light_value.add_updater(lambda m: m.set_value(light_tracker.get_value()))
        dark_label = small_label("dark remaining", 0.28, SECONDARY)
        light_label = small_label("light remaining", 0.28, ACCENT)
        dark_group = VGroup(dark_label, dark_value).arrange(DOWN, buff=0.15).move_to([-1.4, 0.8, 0])
        light_group = VGroup(light_label, light_value).arrange(DOWN, buff=0.15).move_to([1.4, 0.8, 0])
        caption = small_label("Dark runs out. Two light squares are stranded.", 0.3, SECONDARY).move_to([0, -2.9, 0])
        self.play(Write(title), FadeIn(dark_group), FadeIn(light_group), run_time=1.0)
        self.play(dark_tracker.animate.set_value(0), light_tracker.animate.set_value(2), run_time=2.6, rate_func=linear)
        self.play(Indicate(light_value, color=RED, scale_factor=1.3), run_time=0.9)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.0)`
  },
  {
    id: "scene-05-conclusion",
    title: "Never Tileable",
    className: "Scene05Conclusion",
    durationSeconds: 8,
    purpose: "State the conclusion plainly.",
    mathematicalConcept: "A color-counting argument proves the board cannot be tiled, without ever placing a domino.",
    objects: ["closing statement"],
    animation: "The final statement is written and held.",
    camera: "Quiet final frame.",
    text: "62 SQUARES. NEVER TILEABLE.",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED

class Scene05Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        final = headline("62 SQUARES.\nNEVER TILEABLE.", 0.44)
        note = small_label("Color counting proves it before you place a single tile.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(final), run_time=1.3)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.7)
        self.wait(3.5)`
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

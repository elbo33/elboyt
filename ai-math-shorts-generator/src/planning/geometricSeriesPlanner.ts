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
    title: "The Whole Square",
    className: "Scene01Hook",
    durationSeconds: 8,
    purpose: "Establish the whole square as the number 1.",
    mathematicalConcept: "A square of area 1 can be repeatedly halved forever.",
    objects: ["square"],
    animation: "The square draws in and is labeled as the whole.",
    camera: "Static vertical frame.",
    text: "WHY DOES 1/2 + 1/4 + 1/8 + ... = 1?",
    transition: "The question of infinite halving is posed.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WHY DOES\n1/2 + 1/4 + 1/8 + ... = 1?", 0.44)
        square = Square(side_length=4, color=FOREGROUND, stroke_width=6).move_to([0, 1, 0])
        whole_label = small_label("this whole square = 1", 0.3, MUTED).next_to(square, DOWN, buff=0.3)
        caption = small_label("Keep halving forever. Where does it end?", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=1.0)
        self.play(Create(square), run_time=1.1)
        self.play(FadeIn(whole_label), run_time=0.5)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.2)`
  },
  {
    id: "scene-02-first-steps",
    title: "Halve What Remains",
    className: "Scene02FirstSteps",
    durationSeconds: 9,
    purpose: "Show the first three halvings landing in a spiral of shrinking pieces.",
    mathematicalConcept: "Each new piece is exactly half of whatever area is left.",
    objects: ["three shaded rectangles"],
    animation: "The square is split in half, then the remainder is split in half again, and again.",
    camera: "Static, centered on the square.",
    text: "HALVE. THEN HALVE WHAT'S LEFT.",
    transition: "A spiral of shrinking pieces begins to form.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN

class Scene02FirstSteps(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("HALVE. THEN HALVE\nWHAT'S LEFT.", 0.38)
        colors = [ACCENT, SECONDARY, GREEN]
        labels = ["1/2", "1/4", "1/8"]
        x0, y0, w, h = -2.0, -1.0, 4.0, 4.0
        pieces = VGroup()
        piece_labels = VGroup()
        vertical = True
        for i in range(3):
            color = colors[i]
            if vertical:
                pw = w / 2
                piece = Rectangle(width=pw, height=h, color=color, fill_color=color, fill_opacity=0.45, stroke_width=3)
                piece.move_to([x0 + pw / 2, y0 + h / 2, 0])
                x0 += pw
                w = pw
            else:
                ph = h / 2
                piece = Rectangle(width=w, height=ph, color=color, fill_color=color, fill_opacity=0.45, stroke_width=3)
                piece.move_to([x0 + w / 2, y0 + h - ph / 2, 0])
                h = ph
            vertical = not vertical
            label = small_label(labels[i], 0.3, color).move_to(piece.get_center())
            pieces.add(piece)
            piece_labels.add(label)
        outline = Square(side_length=4, color=FOREGROUND, stroke_width=6).move_to([0, 1, 0])
        caption = small_label("Each piece is half of what remained.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(outline), run_time=1.0)
        for piece, label in zip(pieces, piece_labels):
            self.play(FadeIn(piece), FadeIn(label), run_time=1.0)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.6)`
  },
  {
    id: "scene-03-keep-going",
    title: "It Never Stops",
    className: "Scene03KeepGoing",
    durationSeconds: 9,
    purpose: "Continue the halving spiral rapidly to show it never terminates.",
    mathematicalConcept: "The remaining sliver shrinks without ever reaching zero after finitely many steps.",
    objects: ["seven shaded pieces", "shrinking remainder"],
    animation: "The spiral of pieces continues quickly, and the leftover sliver is highlighted, tiny.",
    camera: "Static, centered on the square.",
    text: "IT NEVER STOPS HALVING",
    transition: "The remainder becomes almost invisible.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN, RED

class Scene03KeepGoing(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("IT NEVER STOPS HALVING", 0.42)
        colors = [ACCENT, SECONDARY, GREEN, RED, ACCENT, SECONDARY, GREEN]
        x0, y0, w, h = -2.0, -1.0, 4.0, 4.0
        outline = Square(side_length=4, color=FOREGROUND, stroke_width=6).move_to([0, 1, 0])
        pieces = VGroup()
        vertical = True
        for i in range(7):
            color = colors[i % len(colors)]
            if vertical:
                pw = w / 2
                piece = Rectangle(width=pw, height=h, color=color, fill_color=color, fill_opacity=0.45, stroke_width=2)
                piece.move_to([x0 + pw / 2, y0 + h / 2, 0])
                x0 += pw
                w = pw
            else:
                ph = h / 2
                piece = Rectangle(width=w, height=ph, color=color, fill_color=color, fill_opacity=0.45, stroke_width=2)
                piece.move_to([x0 + w / 2, y0 + h - ph / 2, 0])
                h = ph
            vertical = not vertical
            pieces.add(piece)
        remaining = Rectangle(width=w, height=h, color=FOREGROUND, stroke_width=2).move_to([x0 + w / 2, y0 + h / 2, 0])
        caption = small_label("The leftover sliver keeps shrinking toward nothing.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Create(outline), Write(title), run_time=0.9)
        self.play(FadeIn(pieces[0]), FadeIn(pieces[1]), FadeIn(pieces[2]), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(p) for p in pieces[3:]], lag_ratio=0.25), run_time=2.0)
        self.play(Create(remaining), Indicate(remaining, scale_factor=1.4, color=FOREGROUND), run_time=1.0)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.2)`
  },
  {
    id: "scene-04-meter",
    title: "The Running Total",
    className: "Scene04Meter",
    durationSeconds: 10,
    purpose: "Track the running sum climbing toward 1 without ever passing it.",
    mathematicalConcept: "Partial sums of the series approach 1 as a limit.",
    objects: ["running total counter"],
    animation: "A counter steps through the partial sums 0.5, 0.75, 0.875, and beyond.",
    camera: "Centered on the counter.",
    text: "WATCH THE RUNNING TOTAL",
    transition: "The counter settles at 1.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, GREEN

class Scene04Meter(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WATCH THE RUNNING TOTAL", 0.42)
        tracker = ValueTracker(0)
        value = DecimalNumber(0, num_decimal_places=4, color=FOREGROUND).scale(0.7)
        value.add_updater(lambda m: m.set_value(tracker.get_value()))
        value.move_to([0, 0.8, 0])
        label = small_label("sum so far", 0.3, MUTED).next_to(value, UP, buff=0.25)
        caption = small_label("Every step gets closer. Never past it.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), FadeIn(label), FadeIn(value), run_time=0.9)
        partials = [0.5, 0.75, 0.875, 0.9375, 0.96875, 0.984375, 1.0]
        for p in partials:
            self.play(tracker.animate.set_value(p), run_time=0.75)
        self.play(value.animate.set_color(GREEN), run_time=0.4)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.8)`
  },
  {
    id: "scene-05-conclusion",
    title: "One Whole",
    className: "Scene05Conclusion",
    durationSeconds: 8,
    purpose: "Resolve the hook with the completed sum.",
    mathematicalConcept: "Infinitely many shrinking pieces sum to a single finite whole.",
    objects: ["filled square", "closing formula"],
    animation: "The square appears fully filled while the final equation is written.",
    camera: "Quiet final frame.",
    text: "1/2 + 1/4 + 1/8 + ... = 1",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import GREEN, MUTED

class Scene05Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        square = Square(side_length=3.2, color=GREEN, stroke_width=8, fill_color=GREEN, fill_opacity=0.35).move_to([0, 1, 0])
        final = headline("1/2 + 1/4 + 1/8 + ... = 1", 0.4)
        note = small_label("Infinitely many pieces. One finite whole.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Create(square), run_time=1.1)
        self.play(Write(final), run_time=1.2)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.6)
        self.wait(3.2)`
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

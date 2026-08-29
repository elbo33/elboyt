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
    title: "The Shortcut",
    className: "Scene01Hook",
    durationSeconds: 7,
    purpose: "Introduce the divisibility-by-3 digit sum trick with a concrete example.",
    mathematicalConcept: "141 is divisible by 3, and so is its digit sum, 6.",
    objects: ["number", "digit sum"],
    animation: "The number and its digit sum appear in turn.",
    camera: "Static vertical frame.",
    text: "WHY DOES 141 DIVIDE BY 3?",
    transition: "The question of why this shortcut works is posed.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, ACCENT

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WHY DOES 141\nDIVIDE BY 3?", 0.52)
        number = small_label("141", 0.7, FOREGROUND).move_to([0, 1.4, 0])
        digit_sum = small_label("1 + 4 + 1 = 6", 0.4, ACCENT).move_to([0, 0.2, 0])
        caption = small_label("6 divides by 3. Does that decide it for 141?", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(Write(number), run_time=1.0)
        self.play(FadeIn(digit_sum, shift=0.2 * UP), run_time=0.7)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.2)`
  },
  {
    id: "scene-02-place-value",
    title: "Split By Place",
    className: "Scene02PlaceValue",
    durationSeconds: 9,
    purpose: "Break the number into its place-value pieces.",
    mathematicalConcept: "Any whole number is a sum of digits times powers of ten.",
    objects: ["place value breakdown"],
    animation: "The number splits into hundreds, tens, and ones pieces.",
    camera: "Static, centered on the breakdown.",
    text: "SPLIT IT BY PLACE VALUE",
    transition: "Each piece is ready to be examined.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, ACCENT, SECONDARY, GREEN

class Scene02PlaceValue(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("SPLIT IT BY\nPLACE VALUE", 0.42)
        hundreds = small_label("1 × 100", 0.4, ACCENT)
        tens = small_label("4 × 10", 0.4, SECONDARY)
        ones = small_label("1 × 1", 0.4, GREEN)
        rows = VGroup(hundreds, tens, ones).arrange(DOWN, buff=0.4).move_to([0, 0.8, 0])
        caption = small_label("141 = 100 + 40 + 1.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(r, shift=0.2 * UP) for r in rows], lag_ratio=0.3), run_time=1.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.4)`
  },
  {
    id: "scene-03-remainder",
    title: "Always Remainder 1",
    className: "Scene03Remainder",
    durationSeconds: 9,
    purpose: "Show that every power of ten leaves remainder 1 when divided by 3.",
    mathematicalConcept: "Since 10 is one more than a multiple of 3, every power of ten is also one more than a multiple of 3.",
    objects: ["three remainder equations"],
    animation: "Each power of ten is rewritten as a multiple of three plus one.",
    camera: "Static, centered on the equations.",
    text: "EVERY PLACE VALUE LEAVES REMAINDER 1",
    transition: "The pattern applies to every digit's place.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, ACCENT, SECONDARY, GREEN, RED

class Scene03Remainder(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("EVERY PLACE VALUE\nLEAVES REMAINDER 1", 0.34)
        lines = [
            ("100 = 3 × 33", "+ 1", ACCENT),
            ("10 = 3 × 3", "+ 1", SECONDARY),
            ("1 = 3 × 0", "+ 1", GREEN),
        ]
        rows = VGroup()
        for main, rem, color in lines:
            main_label = small_label(main, 0.36, FOREGROUND)
            rem_label = small_label(rem, 0.36, RED)
            row = VGroup(main_label, rem_label).arrange(RIGHT, buff=0.25)
            rows.add(row)
        rows.arrange(DOWN, buff=0.35).move_to([0, 0.8, 0])
        caption = small_label("Powers of ten always leave a remainder of 1.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(r, shift=0.2 * UP) for r in rows], lag_ratio=0.3), run_time=1.8)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.2)`
  },
  {
    id: "scene-04-recombine",
    title: "The Leftovers Add Up",
    className: "Scene04Recombine",
    durationSeconds: 9,
    purpose: "Show the remainders recombine into exactly the digit sum.",
    mathematicalConcept: "The number equals a multiple of three plus the sum of its digits.",
    objects: ["two equations"],
    animation: "The place-value remainders combine into the digit sum.",
    camera: "Static, centered on the equations.",
    text: "SO THE LEFTOVERS ADD UP TO THE DIGITS",
    transition: "The digit sum decides everything.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, ACCENT, GREEN

class Scene04Recombine(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("SO THE LEFTOVERS\nADD UP TO THE DIGITS", 0.34)
        expr1 = small_label("141 = (multiples of 3) + 1 + 4 + 1", 0.3, FOREGROUND)
        expr2 = small_label("141 = (multiples of 3) + 6", 0.36, ACCENT)
        rows = VGroup(expr1, expr2).arrange(DOWN, buff=0.5).move_to([0, 0.8, 0])
        caption = small_label("If 6 divides by 3, so does 141.", 0.32, GREEN).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(FadeIn(expr1, shift=0.2 * UP), run_time=0.9)
        self.play(FadeIn(expr2, shift=0.2 * UP), run_time=0.9)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.4)`
  },
  {
    id: "scene-05-conclusion",
    title: "The General Rule",
    className: "Scene05Conclusion",
    durationSeconds: 8,
    purpose: "State the general rule plainly.",
    mathematicalConcept: "A whole number is divisible by three exactly when its digit sum is.",
    objects: ["closing statement"],
    animation: "The final statement is written and held.",
    camera: "Quiet final frame.",
    text: "DIGIT SUM DIVISIBLE BY 3 MEANS THE NUMBER IS TOO",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED

class Scene05Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        final = headline("DIGIT SUM DIVISIBLE BY 3\nMEANS THE NUMBER IS TOO", 0.32)
        note = small_label("True for every whole number, no matter how large.", 0.3, MUTED).move_to([0, -2.9, 0])
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

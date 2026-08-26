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
    title: "The Puzzle",
    className: "Scene01Hook",
    durationSeconds: 7,
    purpose: "Introduce the circle and its radius before revealing the mystery formula.",
    mathematicalConcept: "A circle's area is entirely determined by its radius.",
    objects: ["circle", "radius line"],
    animation: "Circle draws in, then the radius is marked from the center.",
    camera: "Static vertical frame, content kept clear of the bottom safe zone.",
    text: "WHY IS A CIRCLE'S AREA π × r²?",
    transition: "The radius lingers as the question is posed.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WHY IS A CIRCLE'S\nAREA π × r²?", 0.52)
        O = [0, 0.6, 0]
        R = 2.2
        circle = Circle(radius=R, color=FOREGROUND, stroke_width=6).move_to(O)
        radius_line = Line(O, [O[0] + R, O[1], 0], color=ACCENT, stroke_width=6)
        r_label = small_label("r", 0.38, ACCENT).next_to(radius_line, UP, buff=0.12)
        center_dot = Dot(O, radius=0.06, color=FOREGROUND)
        caption = small_label("One radius. One constant. Every circle.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(Create(circle), run_time=1.2)
        self.play(FadeIn(center_dot), Create(radius_line), FadeIn(r_label), run_time=0.9)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.4)`
  },
  {
    id: "scene-02-wedges",
    title: "Cut Into Wedges",
    className: "Scene02Wedges",
    durationSeconds: 7,
    purpose: "Slice the circle into equal wedges to prepare for rearrangement.",
    mathematicalConcept: "A circle can be partitioned into equal sectors without losing area.",
    objects: ["eight sectors"],
    animation: "Sectors fade in one after another around the circle, then nudge apart slightly.",
    camera: "Static, centered on the circle.",
    text: "CUT IT INTO WEDGES",
    transition: "The wedges are ready to be rearranged.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY
import numpy as np

class Scene02Wedges(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("CUT IT INTO WEDGES", 0.46)
        O = np.array([0, 0.6, 0])
        R = 2.2
        n = 8
        step = TAU / n
        wedges = VGroup()
        for i in range(n):
            color = ACCENT if i % 2 == 0 else SECONDARY
            sector = Sector(radius=R, start_angle=i * step, angle=step, color=color, fill_color=color, fill_opacity=0.32, stroke_width=3)
            sector.move_arc_center_to(O)
            wedges.add(sector)
        caption = small_label("Eight equal slices of the same circle.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(w, scale=0.9) for w in wedges], lag_ratio=0.12), run_time=1.6)
        self.play(*[
            w.animate.shift(0.16 * np.array([np.cos((i + 0.5) * step), np.sin((i + 0.5) * step), 0]))
            for i, w in enumerate(wedges)
        ], run_time=0.8)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.0)`
  },
  {
    id: "scene-03-unfold",
    title: "Lay Them In A Row",
    className: "Scene03Unfold",
    durationSeconds: 9,
    purpose: "Rearrange the wedges into a scalloped row without changing total area.",
    mathematicalConcept: "Cutting and rearranging pieces preserves total area.",
    objects: ["eight sectors", "row arrangement"],
    animation: "Each wedge slides to a new spot, alternating orientation, forming a zigzag strip.",
    camera: "Follows the wedges as they settle into a row.",
    text: "LAY THE WEDGES SIDE BY SIDE",
    transition: "The zigzag strip hints at a rectangle.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY
import numpy as np

class Scene03Unfold(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("LAY THE WEDGES\nSIDE BY SIDE", 0.42)
        O = np.array([0, 0.6, 0])
        R = 2.2
        n = 8
        step = TAU / n
        wedges = VGroup()
        for i in range(n):
            color = ACCENT if i % 2 == 0 else SECONDARY
            sector = Sector(radius=R, start_angle=i * step, angle=step, color=color, fill_color=color, fill_opacity=0.32, stroke_width=3)
            sector.move_arc_center_to(O)
            wedges.add(sector)
        caption = small_label("Same wedges. New arrangement.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(FadeIn(wedges), Write(title), run_time=1.0)
        self.wait(0.3)
        arc_len = R * step
        start_x = -arc_len * n / 2 + arc_len / 2
        anims = []
        for i, wedge in enumerate(wedges):
            x = start_x + i * arc_len
            y = 1.3 if i % 2 == 0 else -0.5
            rot = 0 if i % 2 == 0 else PI
            anims.append(wedge.animate.move_to([x, y, 0]).rotate(rot))
        self.play(*anims, run_time=2.3)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.3)`
  },
  {
    id: "scene-04-more-slices",
    title: "More Slices",
    className: "Scene04MoreSlices",
    durationSeconds: 8,
    purpose: "Show that finer slicing makes the scalloped edge flatter.",
    mathematicalConcept: "As the number of sectors grows, the arrangement approaches a true rectangle.",
    objects: ["two zigzag strips"],
    animation: "A coarse zigzag with 8 wedges is compared to a much finer one with 32.",
    camera: "Static, two strips stacked for comparison.",
    text: "MORE SLICES, STRAIGHTER EDGES",
    transition: "The bumps shrink toward a flat line.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY

class Scene04MoreSlices(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("MORE SLICES,\nSTRAIGHTER EDGES", 0.42)

        def zigzag(n, width, y_center, amplitude, color):
            points = []
            step = width / n
            for i in range(n + 1):
                x = -width / 2 + i * step
                y = y_center + (amplitude if i % 2 == 0 else -amplitude)
                points.append([x, y, 0])
            return VMobject(color=color, stroke_width=5).set_points_as_corners(points)

        row8 = zigzag(8, 7.0, 1.6, 0.35, SECONDARY)
        label8 = small_label("8 wedges", 0.3, SECONDARY).next_to(row8, DOWN, buff=0.3)
        row32 = zigzag(32, 7.0, -0.6, 0.1, ACCENT)
        label32 = small_label("32 wedges", 0.3, ACCENT).next_to(row32, DOWN, buff=0.3)
        caption = small_label("As slices multiply, the bumps vanish.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.8)
        self.play(Create(row8), FadeIn(label8), run_time=1.1)
        self.play(Create(row32), FadeIn(label32), run_time=1.3)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.2)`
  },
  {
    id: "scene-05-measure",
    title: "A Rectangle Appears",
    className: "Scene05Measure",
    durationSeconds: 9,
    purpose: "Reveal the limiting rectangle and measure its area.",
    mathematicalConcept: "The limiting shape is a rectangle with height r and width equal to half the circumference, pi times r.",
    objects: ["rectangle", "area meter"],
    animation: "A clean rectangle appears with labeled width and height, and a counter climbs to the final area.",
    camera: "Centered on the rectangle and meter.",
    text: "STRAIGHTEN IT INTO A RECTANGLE",
    transition: "The meter settles on the final area.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY
import numpy as np

class Scene05Measure(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("STRAIGHTEN IT INTO\nA RECTANGLE", 0.4)
        R = 2.2
        width = np.pi * R
        height = R
        rect = Rectangle(width=width, height=height, color=ACCENT, stroke_width=6).move_to([0, 1.0, 0])
        width_label = small_label("width = π × r", 0.32, ACCENT).next_to(rect, UP, buff=0.2)
        height_label = small_label("height = r", 0.3, SECONDARY).next_to(rect, DOWN, buff=0.2)
        tracker = ValueTracker(0)
        area_value = DecimalNumber(0, num_decimal_places=1, color=FOREGROUND).scale(0.6)
        area_value.add_updater(lambda m: m.set_value(tracker.get_value()))
        area_value.move_to([0, -1.7, 0])
        area_label = small_label("area so far", 0.3, MUTED).next_to(area_value, UP, buff=0.15)
        caption = small_label("Width times height. Nothing more.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(rect), run_time=1.1)
        self.play(FadeIn(width_label), FadeIn(height_label), run_time=0.7)
        self.play(FadeIn(area_label), FadeIn(area_value), run_time=0.5)
        self.play(tracker.animate.set_value(width * height), run_time=1.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.0)`
  },
  {
    id: "scene-06-conclusion",
    title: "One Formula",
    className: "Scene06Conclusion",
    durationSeconds: 8,
    purpose: "Resolve the hook with the final formula.",
    mathematicalConcept: "Every circle's area equals pi times its radius squared.",
    objects: ["circle", "radius", "closing formula"],
    animation: "The original circle and radius return with the final statement.",
    camera: "Quiet final frame.",
    text: "AREA = π × r²",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY

class Scene06Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        O = [0, 0.8, 0]
        R = 2.0
        circle = Circle(radius=R, color=ACCENT, stroke_width=8).move_to(O)
        radius_line = Line(O, [O[0] + R, O[1], 0], color=SECONDARY, stroke_width=6)
        r_label = small_label("r", 0.36, SECONDARY).next_to(radius_line, UP, buff=0.1)
        final = headline("AREA = π × r²", 0.5)
        note = small_label("True for every circle, every radius.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Create(circle), Create(radius_line), FadeIn(r_label), run_time=1.1)
        self.play(Write(final), run_time=1.1)
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

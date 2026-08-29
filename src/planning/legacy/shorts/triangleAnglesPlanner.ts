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
    purpose: "Create curiosity around the fixed angle sum of any triangle.",
    mathematicalConcept: "Every triangle has three interior angles that appear to total the same amount.",
    objects: ["triangle", "three angle arcs", "hook text"],
    animation: "Triangle draws in, then each angle is marked and labeled.",
    camera: "Static vertical frame, all content kept clear of the bottom safe zone.",
    text: "WHY DO A TRIANGLE'S ANGLES ADD TO 180°?",
    transition: "The three marked angles remain as the question lingers.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WHY DO A TRIANGLE'S\nANGLES ADD TO 180°?", 0.58)
        A = [-2.6, -1.0, 0]
        B = [2.6, -1.0, 0]
        C = [-0.5, 3.0, 0]
        triangle = VGroup(
            Line(A, B, color=FOREGROUND, stroke_width=6),
            Line(B, C, color=FOREGROUND, stroke_width=6),
            Line(C, A, color=FOREGROUND, stroke_width=6),
        )
        angle_a = Angle(Line(A, B), Line(A, C), radius=0.55, color=ACCENT)
        angle_b = Angle(Line(B, A), Line(B, C), radius=0.55, color=SECONDARY, other_angle=True)
        angle_c = Angle(Line(C, A), Line(C, B), radius=0.5, color=GREEN)
        label_a = small_label("a", 0.4, ACCENT).move_to([-2.05, -0.55, 0])
        label_b = small_label("b", 0.4, SECONDARY).move_to([1.95, -0.55, 0])
        label_c = small_label("g", 0.4, GREEN).move_to([-0.5, 2.35, 0])
        caption = small_label("Three corners. One mystery number.", 0.34, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(Create(triangle), run_time=1.1)
        self.play(FadeIn(angle_a), FadeIn(label_a), run_time=0.6)
        self.play(FadeIn(angle_b), FadeIn(label_b), run_time=0.6)
        self.play(FadeIn(angle_c), FadeIn(label_c), run_time=0.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.9)`
  },
  {
    id: "scene-02-different-triangles",
    title: "Same Sum, Every Time",
    className: "Scene02DifferentTriangles",
    durationSeconds: 8,
    purpose: "Show the invariance across differently shaped triangles.",
    mathematicalConcept: "The angle sum does not depend on the triangle's shape or size.",
    objects: ["three triangles", "180-degree badges"],
    animation: "Three distinct triangles appear one by one, each earning the same badge.",
    camera: "Stable comparison frame, upper two-thirds only.",
    text: "SAME SUM. EVERY TIME.",
    transition: "The pattern begs for a reason.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label, length_badge
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN

class Scene02DifferentTriangles(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("SAME SUM. EVERY TIME.", 0.5)
        t1 = Polygon([-3.4, 2.4, 0], [-1.9, 2.2, 0], [-2.7, 4.3, 0], color=ACCENT, stroke_width=5)
        t2 = Polygon([-1.1, 0.3, 0], [1.3, 0.5, 0], [0.0, 2.6, 0], color=SECONDARY, stroke_width=5)
        t3 = Polygon([1.9, 2.0, 0], [3.9, 1.7, 0], [2.6, 4.6, 0], color=GREEN, stroke_width=5)
        b1 = length_badge("180", [-2.7, 2.85, 0], ACCENT)
        b2 = length_badge("180", [0.05, 1.05, 0], SECONDARY)
        b3 = length_badge("180", [2.75, 2.55, 0], GREEN)
        caption = small_label("Different shapes. Same sum, every time.", 0.34, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.8)
        self.play(Create(t1), FadeIn(b1), run_time=1.1)
        self.play(Create(t2), FadeIn(b2), run_time=1.1)
        self.play(Create(t3), FadeIn(b3), run_time=1.1)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.play(VGroup(t1, t2, t3).animate.set_stroke(width=7), run_time=0.8)
        self.wait(1.8)`
  },
  {
    id: "scene-03-parallel-line",
    title: "One Parallel Line",
    className: "Scene03Parallel",
    durationSeconds: 7,
    purpose: "Introduce the key construction that reveals the two base angles at the top vertex.",
    mathematicalConcept: "Alternate interior angles formed by a transversal on parallel lines are equal.",
    objects: ["triangle", "parallel line through apex", "alternate angle marks"],
    animation: "A dashed parallel line appears through the top vertex, copying both base angles beside it.",
    camera: "Centered on the triangle and its new parallel line.",
    text: "DRAW ONE PARALLEL LINE",
    transition: "The copied angles sit ready beside the apex angle.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN

class Scene03Parallel(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("DRAW ONE PARALLEL LINE", 0.46)
        A = [-2.6, -1.0, 0]
        B = [2.6, -1.0, 0]
        C = [-0.5, 3.0, 0]
        Lp = [-3.6, 3.0, 0]
        Rp = [3.0, 3.0, 0]
        triangle = VGroup(
            Line(A, B, color=FOREGROUND, stroke_width=6),
            Line(B, C, color=FOREGROUND, stroke_width=6),
            Line(C, A, color=FOREGROUND, stroke_width=6),
        )
        parallel = DashedLine(Lp, Rp, color=MUTED, stroke_width=4)
        angle_a = Angle(Line(A, B), Line(A, C), radius=0.5, color=ACCENT)
        angle_b = Angle(Line(B, A), Line(B, C), radius=0.5, color=SECONDARY, other_angle=True)
        alt_a = Angle(Line(C, Lp), Line(C, A), radius=0.45, color=ACCENT)
        alt_b = Angle(Line(C, A), Line(C, B), radius=0.4, color=GREEN)
        alt_c = Angle(Line(C, B), Line(C, Rp), radius=0.45, color=SECONDARY)
        caption = small_label("The parallel line copies both base angles.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(triangle), run_time=1.0)
        self.play(Create(parallel), run_time=0.8)
        self.play(FadeIn(angle_a), FadeIn(angle_b), run_time=0.6)
        self.play(FadeIn(alt_a), FadeIn(alt_b), FadeIn(alt_c), run_time=0.9)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.0)`
  },
  {
    id: "scene-04-slide",
    title: "Slide The Angles",
    className: "Scene04Slide",
    durationSeconds: 8,
    purpose: "Visualize both base angles migrating up onto the parallel line beside the apex angle.",
    mathematicalConcept: "The three angles of the triangle are congruent to three angles that sit side by side on a line.",
    objects: ["triangle", "parallel line", "sliding angle copies"],
    animation: "Copies of the base angles slide upward until they sit adjacent to the apex angle on the line.",
    camera: "Slow drift following the sliding angles.",
    text: "SLIDE BOTH ONTO THE LINE",
    transition: "All three angles now sit side by side on a straight line.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN

class Scene04Slide(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("SLIDE BOTH ONTO THE LINE", 0.44)
        A = [-2.6, -1.0, 0]
        B = [2.6, -1.0, 0]
        C = [-0.5, 3.0, 0]
        Lp = [-3.6, 3.0, 0]
        Rp = [3.0, 3.0, 0]
        triangle = VGroup(
            Line(A, B, color=MUTED, stroke_width=4),
            Line(B, C, color=MUTED, stroke_width=4),
            Line(C, A, color=MUTED, stroke_width=4),
        )
        triangle.set_opacity(0.45)
        parallel = Line(Lp, Rp, color=FOREGROUND, stroke_width=6)
        angle_a = Angle(Line(A, B), Line(A, C), radius=0.5, color=ACCENT)
        angle_b = Angle(Line(B, A), Line(B, C), radius=0.5, color=SECONDARY, other_angle=True)
        angle_c = Angle(Line(C, A), Line(C, B), radius=0.42, color=GREEN)
        slide_a = angle_a.copy()
        slide_b = angle_b.copy()
        caption = small_label("Both base angles slide up to the top line.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.8)
        self.play(Create(triangle), Create(parallel), run_time=0.9)
        self.play(FadeIn(angle_a), FadeIn(angle_b), FadeIn(angle_c), run_time=0.7)
        self.play(FadeIn(slide_a), FadeIn(slide_b), run_time=0.3)
        self.play(
            slide_a.animate.scale(0.85).move_to([-1.3, 3.0, 0]),
            slide_b.animate.scale(0.85).move_to([0.5, 3.0, 0]),
            run_time=2.0,
        )
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.0)`
  },
  {
    id: "scene-05-fill",
    title: "A Straight Line",
    className: "Scene05Fill",
    durationSeconds: 9,
    purpose: "Show the three angles filling a straight line exactly, tying the sum to 180 degrees.",
    mathematicalConcept: "Angles on a straight line always sum to 180 degrees.",
    objects: ["straight line", "three fan angles", "running total meter"],
    animation: "Three colored arcs fan out from a single point on the line while a counter climbs to 180.",
    camera: "Centered on the line and the growing meter.",
    text: "TOGETHER THEY FILL A STRAIGHT LINE",
    transition: "The meter locks at 180 degrees.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN

class Scene05Fill(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("TOGETHER THEY FILL\nA STRAIGHT LINE", 0.42)
        C = [-0.5, 3.0, 0]
        Lp = [-3.6, 3.0, 0]
        Rp = [3.0, 3.0, 0]
        r1 = [-2.0, 1.2, 0]
        r2 = [1.0, 1.2, 0]
        parallel = Line(Lp, Rp, color=FOREGROUND, stroke_width=7)
        arc_left = Angle(Line(C, Lp), Line(C, r1), radius=0.55, color=ACCENT)
        arc_mid = Angle(Line(C, r1), Line(C, r2), radius=0.5, color=GREEN)
        arc_right = Angle(Line(C, r2), Line(C, Rp), radius=0.45, color=SECONDARY)
        tracker = ValueTracker(0)
        meter_value = DecimalNumber(0, num_decimal_places=0, color=FOREGROUND).scale(0.6)
        meter_value.add_updater(lambda m: m.set_value(tracker.get_value()))
        meter_value.move_to([0, -2.0, 0])
        meter_label = small_label("sum so far", 0.3, MUTED).next_to(meter_value, UP, buff=0.15)
        caption = small_label("A straight line always measures 180.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(parallel), run_time=1.0)
        self.play(FadeIn(meter_label), FadeIn(meter_value), run_time=0.5)
        self.play(FadeIn(arc_left), tracker.animate.set_value(60), run_time=1.1)
        self.play(FadeIn(arc_mid), tracker.animate.set_value(120), run_time=1.1)
        self.play(FadeIn(arc_right), tracker.animate.set_value(180), run_time=1.1)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.play(parallel.animate.set_stroke(width=10, color=GREEN), run_time=0.7)
        self.wait(2.0)`
  },
  {
    id: "scene-06-conclusion",
    title: "No Exceptions",
    className: "Scene06Conclusion",
    durationSeconds: 8,
    purpose: "Resolve the original question with a concise closing statement.",
    mathematicalConcept: "The interior angles of any triangle sum to 180 degrees.",
    objects: ["triangle", "three angle arcs", "closing formula"],
    animation: "The original triangle returns in the accent color with the final statement.",
    camera: "Quiet final frame.",
    text: "ANGLES ALWAYS COMPLETE A STRAIGHT LINE.",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN

class Scene06Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        A = [-2.6, -1.0, 0]
        B = [2.6, -1.0, 0]
        C = [-0.5, 3.0, 0]
        triangle = VGroup(
            Line(A, B, color=ACCENT, stroke_width=8),
            Line(B, C, color=ACCENT, stroke_width=8),
            Line(C, A, color=ACCENT, stroke_width=8),
        )
        angle_a = Angle(Line(A, B), Line(A, C), radius=0.5, color=ACCENT)
        angle_b = Angle(Line(B, A), Line(B, C), radius=0.5, color=SECONDARY, other_angle=True)
        angle_c = Angle(Line(C, A), Line(C, B), radius=0.42, color=GREEN)
        final = headline("ANGLES ALWAYS\nCOMPLETE A STRAIGHT LINE.", 0.4)
        formula = small_label("a + b + g = 180", 0.4, FOREGROUND).move_to([0, -1.9, 0])
        note = small_label("Every triangle. No exceptions.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Create(triangle), run_time=1.0)
        self.play(FadeIn(angle_a), FadeIn(angle_b), FadeIn(angle_c), run_time=0.7)
        self.play(Write(final), run_time=1.0)
        self.play(Write(formula), run_time=0.8)
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

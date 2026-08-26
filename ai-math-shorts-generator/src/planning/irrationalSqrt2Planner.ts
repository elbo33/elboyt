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
    title: "The Triangle",
    className: "Scene01Hook",
    durationSeconds: 7,
    purpose: "Introduce the isoceles right triangle whose hypotenuse-to-leg ratio is the square root of two.",
    mathematicalConcept: "In a right isoceles triangle, the hypotenuse over a leg equals the square root of two.",
    objects: ["right isoceles triangle"],
    animation: "The triangle draws in and its sides are labeled a and b.",
    camera: "Static vertical frame.",
    text: "WHY CAN'T √2 BE A FRACTION?",
    transition: "The question of whole-number sides is posed.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WHY CAN'T √2\nBE A FRACTION?", 0.52)
        C = [-1.6, -1.0, 0]
        leg = 2.6
        A = [C[0], C[1] + leg, 0]
        B = [C[0] + leg, C[1], 0]
        triangle = VGroup(
            Line(C, A, color=FOREGROUND, stroke_width=6),
            Line(C, B, color=FOREGROUND, stroke_width=6),
            Line(A, B, color=ACCENT, stroke_width=7),
        )
        leg_label = small_label("b", 0.36, FOREGROUND).next_to(Line(C, B), DOWN, buff=0.15)
        hyp_label = small_label("a", 0.36, ACCENT).move_to([0.1, 0.5, 0])
        caption = small_label("If √2 = a / b, both should be whole numbers.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(Create(triangle), run_time=1.2)
        self.play(FadeIn(leg_label), FadeIn(hyp_label), run_time=0.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.3)`
  },
  {
    id: "scene-02-assume",
    title: "Suppose It Were True",
    className: "Scene02Assume",
    durationSeconds: 8,
    purpose: "Pretend a whole-number pair almost works, to set up the contradiction.",
    mathematicalConcept: "No integer pair exactly satisfies a squared equals two b squared, only approximately.",
    objects: ["labeled triangle"],
    animation: "The triangle is labeled with a close but imperfect integer pair.",
    camera: "Static, centered on the triangle.",
    text: "SUPPOSE a = 7, b = 5",
    transition: "The near-miss invites a closer look.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED

class Scene02Assume(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("SUPPOSE a = 7, b = 5", 0.4)
        C = [-1.6, -1.0, 0]
        leg = 2.6
        A = [C[0], C[1] + leg, 0]
        B = [C[0] + leg, C[1], 0]
        triangle = VGroup(
            Line(C, A, color=FOREGROUND, stroke_width=6),
            Line(C, B, color=FOREGROUND, stroke_width=6),
            Line(A, B, color=ACCENT, stroke_width=7),
        )
        leg_label = small_label("5", 0.4, FOREGROUND).next_to(Line(C, B), DOWN, buff=0.15)
        hyp_label = small_label("7", 0.4, ACCENT).move_to([0.1, 0.5, 0])
        caption = small_label("Close, but 7² = 49 and 2 × 5² = 50.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(triangle), run_time=1.1)
        self.play(FadeIn(leg_label), FadeIn(hyp_label), run_time=0.7)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(3.3)`
  },
  {
    id: "scene-03-fold-once",
    title: "Fold Once",
    className: "Scene03FoldOnce",
    durationSeconds: 9,
    purpose: "Construct a smaller isoceles right triangle by folding the short side onto the hypotenuse.",
    mathematicalConcept: "Marking off a leg length along the hypotenuse and dropping a perpendicular produces a smaller similar right isoceles triangle.",
    objects: ["original triangle", "fold point", "smaller triangle"],
    animation: "A point marks off the leg length on the hypotenuse, a perpendicular drops, and a smaller triangle appears.",
    camera: "Centered on the fold.",
    text: "FOLD THE SHORT SIDE ONTO THE LONG ONE",
    transition: "A smaller version of the same shape survives.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN
import numpy as np
from manim.utils.space_ops import line_intersection

class Scene03FoldOnce(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("FOLD THE SHORT SIDE\nONTO THE LONG ONE", 0.36)
        C = np.array([-1.6, -1.0, 0.0])
        leg = 2.6
        A = C + np.array([0, leg, 0])
        B = C + np.array([leg, 0, 0])
        triangle = VGroup(
            Line(C, A, color=MUTED, stroke_width=4),
            Line(C, B, color=MUTED, stroke_width=4),
            Line(A, B, color=MUTED, stroke_width=4),
        )

        hyp = np.linalg.norm(B - A)
        D = A + (leg / hyp) * (B - A)
        direction = (B - A) / hyp
        perp = np.array([-direction[1], direction[0], 0.0])
        E = line_intersection([D, D + perp], [C, B])

        fold_line = Line(D, E, color=GREEN, stroke_width=5)
        new_triangle = VGroup(
            Line(D, E, color=ACCENT, stroke_width=6),
            Line(D, B, color=ACCENT, stroke_width=6),
            Line(E, B, color=ACCENT, stroke_width=6),
        )
        d_dot = Dot(D, radius=0.06, color=SECONDARY)
        e_dot = Dot(E, radius=0.06, color=GREEN)
        leg_label = small_label("2", 0.34, ACCENT).next_to(D, RIGHT, buff=0.15)
        hyp_label = small_label("3", 0.34, ACCENT).move_to((E + B) / 2 + np.array([0, -0.3, 0]))
        caption = small_label("A smaller right triangle appears inside.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(triangle), run_time=1.0)
        self.play(FadeIn(d_dot), run_time=0.6)
        self.play(Create(fold_line), FadeIn(e_dot), run_time=0.8)
        self.play(Create(new_triangle), run_time=1.0)
        self.play(FadeIn(leg_label), FadeIn(hyp_label), run_time=0.6)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.0)`
  },
  {
    id: "scene-04-fold-again",
    title: "Fold Forever",
    className: "Scene04FoldAgain",
    durationSeconds: 9,
    purpose: "Repeat the fold to show the shrinking never stops.",
    mathematicalConcept: "The folding construction can be repeated indefinitely, each time producing a smaller similar triangle.",
    objects: ["five nested triangles"],
    animation: "Nested triangles appear one after another, each smaller than the last.",
    camera: "Centered on the shrinking nest of triangles.",
    text: "FOLD IT AGAIN. AND AGAIN.",
    transition: "The triangles shrink toward nothing.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN, RED
import numpy as np
from manim.utils.space_ops import line_intersection

class Scene04FoldAgain(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("FOLD IT AGAIN. AND AGAIN.", 0.4)

        def fold(A, B, C):
            leg = np.linalg.norm(C - A)
            hyp = np.linalg.norm(B - A)
            D = A + (leg / hyp) * (B - A)
            direction = (B - A) / hyp
            perp = np.array([-direction[1], direction[0], 0.0])
            E = line_intersection([D, D + perp], [C, B])
            return D, E

        C0 = np.array([-1.6, -1.0, 0.0])
        leg0 = 2.6
        A0 = C0 + np.array([0, leg0, 0])
        B0 = C0 + np.array([leg0, 0, 0])
        colors = [MUTED, SECONDARY, ACCENT, GREEN, RED]
        tri_points = [(A0, B0, C0)]
        A, B, C = A0, B0, C0
        for _ in range(4):
            D, E = fold(A, B, C)
            tri_points.append((B, E, D))
            A, B, C = B, E, D

        triangles = VGroup()
        for i, (a, b, c) in enumerate(tri_points):
            color = colors[i % len(colors)]
            tri = VGroup(
                Line(a, c, color=color, stroke_width=5),
                Line(b, c, color=color, stroke_width=5),
                Line(a, b, color=color, stroke_width=3),
            )
            triangles.add(tri)

        caption = small_label("Each triangle is smaller than the last, forever.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.8)
        self.play(LaggedStart(*[Create(t) for t in triangles], lag_ratio=0.5), run_time=3.3)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.3)`
  },
  {
    id: "scene-05-impossible",
    title: "The Pattern Breaks",
    className: "Scene05Impossible",
    durationSeconds: 8,
    purpose: "Show that the integer version of the shrinking pattern cannot continue forever.",
    mathematicalConcept: "Positive integers cannot decrease forever, so no exact integer pair can start the descent.",
    objects: ["shrinking number pairs"],
    animation: "A list of shrinking integer pairs appears, ending in an impossible pair.",
    camera: "Centered list.",
    text: "BUT WHOLE NUMBERS CAN'T SHRINK FOREVER",
    transition: "The contradiction lands.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, RED

class Scene05Impossible(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("BUT WHOLE NUMBERS\nCAN'T SHRINK FOREVER", 0.36)
        sizes = ["7 , 5", "3 , 2", "1 , 1", "1 , 0", "?"]
        rows = VGroup()
        for i, s in enumerate(sizes):
            color = RED if i >= 3 else FOREGROUND
            rows.add(small_label(s, 0.34, color))
        rows.arrange(DOWN, buff=0.28).move_to([0, 0.8, 0])
        caption = small_label("The pattern breaks. No such pair ever existed.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        for row in rows:
            self.play(FadeIn(row, shift=0.15 * UP), run_time=0.6)
        self.play(Indicate(rows[3], color=RED, scale_factor=1.2), run_time=0.8)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.8)`
  },
  {
    id: "scene-06-conclusion",
    title: "Irrational",
    className: "Scene06Conclusion",
    durationSeconds: 8,
    purpose: "State the conclusion plainly.",
    mathematicalConcept: "The square root of two cannot be written as a ratio of whole numbers.",
    objects: ["closing statement"],
    animation: "The final statement is written and held.",
    camera: "Quiet final frame.",
    text: "√2 IS IRRATIONAL",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED

class Scene06Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        final = headline("√2 IS IRRATIONAL", 0.52)
        note = small_label("No fraction of whole numbers ever equals it.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(final), run_time=1.4)
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

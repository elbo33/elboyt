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
    purpose: "Create curiosity around two points and competing paths.",
    mathematicalConcept: "Distance between fixed endpoints depends on the path, not only the endpoints.",
    objects: ["two points", "curved path", "straight path", "large hook text"],
    animation: "A wandering path draws first, then the straight connection cuts through it.",
    camera: "Static vertical frame with a slight end emphasis on the straight segment.",
    text: "WHY IS THIS THE SHORTEST?",
    transition: "Straight line remains as the comparison begins.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, point, path_line, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WHY IS THIS\nTHE SHORTEST?", 0.66)
        a = [-3.2, -2.0, 0]
        b = [3.2, -2.0, 0]
        points = VGroup(point(a, "A"), point(b, "B"))
        curve = path_line([a, [-2.1, 1.5, 0], [-0.7, -0.3, 0], [1.4, 1.35, 0], b], SECONDARY, 7)
        straight = Line(a, b, color=ACCENT, stroke_width=8)
        question = small_label("Both arrive at B. Only one wastes no motion.", 0.34, MUTED).next_to(straight, DOWN, buff=0.85)
        self.play(FadeIn(points, scale=0.96), run_time=0.8)
        self.play(Write(title), run_time=0.9)
        self.play(Create(curve), run_time=1.3)
        self.wait(0.35)
        self.play(Create(straight), curve.animate.set_opacity(0.34), run_time=1.0)
        self.play(FadeIn(question, shift=0.2 * UP), run_time=0.6)
        self.wait(2.05)`
  },
  {
    id: "scene-02-detours",
    title: "Detours Add Distance",
    className: "Scene02Detours",
    durationSeconds: 8,
    purpose: "Compare several paths and make the excess distance visible.",
    mathematicalConcept: "A path with detours accumulates more length than the direct displacement.",
    objects: ["three paths", "length badges", "endpoint markers"],
    animation: "Longer paths appear one by one with approximate length labels.",
    camera: "Stable comparison frame.",
    text: "Every bend adds distance.",
    transition: "The comparison narrows into a triangle.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, point, path_line, length_badge, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, RED

class Scene02Detours(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("DETOURS HAVE A COST", 0.5)
        a = [-3.3, -2.7, 0]
        b = [3.3, -2.7, 0]
        points = VGroup(point(a, "A"), point(b, "B"))
        straight = Line(a, b, color=ACCENT, stroke_width=8)
        p1 = path_line([a, [-1.6, 0.1, 0], [1.2, -0.1, 0], b], FOREGROUND, 5, 0.72)
        p2 = path_line([a, [-2.3, 2.2, 0], [0.3, 1.3, 0], [2.6, 2.5, 0], b], SECONDARY, 5, 0.82)
        p3 = path_line([a, [-2.9, 1.0, 0], [-0.7, 3.0, 0], [0.9, 0.8, 0], [2.7, 1.7, 0], b], RED, 5, 0.78)
        badges = [
            length_badge("6.6", [0, -3.6, 0], ACCENT),
            length_badge("7.8", [-1.1, 0.4, 0], FOREGROUND),
            length_badge("9.4", [1.45, 2.45, 0], SECONDARY),
            length_badge("11.1", [-2.0, 2.75, 0], RED),
        ]
        caption = small_label("Same endpoints. Different journeys.", 0.34, MUTED).to_edge(DOWN, buff=1.1)
        self.play(FadeIn(points), Write(title), run_time=0.9)
        self.play(Create(straight), FadeIn(badges[0]), run_time=0.9)
        self.play(Create(p1), FadeIn(badges[1]), run_time=0.9)
        self.play(Create(p2), FadeIn(badges[2]), run_time=0.9)
        self.play(Create(p3), FadeIn(badges[3]), run_time=0.9)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.5)
        self.play(VGroup(p1, p2, p3).animate.set_opacity(0.28), straight.animate.set_stroke(width=11), run_time=1.0)
        self.wait(2.0)`
  },
  {
    id: "scene-03-triangle",
    title: "Triangle Inequality",
    className: "Scene03Triangle",
    durationSeconds: 8,
    purpose: "Introduce the triangle inequality as the local reason detours are longer.",
    mathematicalConcept: "For any triangle, a + b is greater than c.",
    objects: ["triangle", "side labels", "inequality"],
    animation: "Two detour sides fold toward the direct side while the inequality appears.",
    camera: "Centered triangle, no clutter.",
    text: "a + b > c",
    transition: "Triangle becomes a local corner in a longer path.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY

class Scene03Triangle(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("THE WHOLE SECRET\nIS IN ONE TRIANGLE", 0.46)
        A = [-2.8, -2.5, 0]
        B = [2.8, -2.5, 0]
        C = [-0.5, 1.5, 0]
        side_a = Line(A, C, color=SECONDARY, stroke_width=8)
        side_b = Line(C, B, color=SECONDARY, stroke_width=8)
        side_c = Line(A, B, color=ACCENT, stroke_width=9)
        labels = VGroup(
            small_label("a", 0.42, SECONDARY).move_to([-1.95, -0.35, 0]),
            small_label("b", 0.42, SECONDARY).move_to([1.3, -0.25, 0]),
            small_label("c", 0.42, ACCENT).move_to([0, -3.05, 0]),
        )
        inequality = Text("a + b > c", font="Avenir Next", weight=BOLD, color=FOREGROUND).scale(0.64).to_edge(DOWN, buff=1.45)
        note = small_label("The detour sides cannot beat the direct side.", 0.32, MUTED).next_to(inequality, DOWN, buff=0.28)
        self.play(Write(title), run_time=0.8)
        self.play(Create(side_a), Create(side_b), FadeIn(labels[0:2]), run_time=1.0)
        self.play(Create(side_c), FadeIn(labels[2]), run_time=0.8)
        self.play(Write(inequality), run_time=0.8)
        self.play(FadeIn(note, shift=0.2 * UP), run_time=0.5)
        self.play(side_a.animate.set_opacity(0.45), side_b.animate.set_opacity(0.45), side_c.animate.set_stroke(width=12), run_time=1.0)
        self.wait(3.1)`
  },
  {
    id: "scene-04-many-triangles",
    title: "Every Bend Repeats It",
    className: "Scene04ManyTriangles",
    durationSeconds: 9,
    purpose: "Generalize from one triangle to a multi-segment path.",
    mathematicalConcept: "A bent path is a stack of local detours, each dominated by a straight replacement.",
    objects: ["polyline path", "corner triangles", "replacement chords"],
    animation: "Each corner is replaced by a shorter straight segment.",
    camera: "Slowly follows the simplification across the path.",
    text: "Every corner is a tiny triangle.",
    transition: "The path keeps straightening.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, point, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY

class Scene04ManyTriangles(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("EVERY BEND REPEATS IT", 0.48)
        pts = [[-3.4, -3.2, 0], [-2.4, 0.6, 0], [-0.9, -1.2, 0], [0.8, 1.6, 0], [2.3, -0.3, 0], [3.4, -3.2, 0]]
        endpoints = VGroup(point(pts[0], "A"), point(pts[-1], "B"))
        segments = VGroup(*[Line(pts[i], pts[i+1], color=SECONDARY, stroke_width=7) for i in range(len(pts)-1)])
        chords = VGroup(
            Line(pts[0], pts[2], color=ACCENT, stroke_width=6),
            Line(pts[2], pts[4], color=ACCENT, stroke_width=6),
            Line(pts[4], pts[5], color=ACCENT, stroke_width=6),
        )
        corners = VGroup(*[Dot(p, radius=0.075, color=FOREGROUND) for p in pts[1:-1]])
        caption = small_label("Replace a corner. The path gets shorter.", 0.34, MUTED).to_edge(DOWN, buff=1.15)
        self.play(Write(title), FadeIn(endpoints), run_time=0.9)
        self.play(LaggedStart(*[Create(s) for s in segments], lag_ratio=0.18), FadeIn(corners), run_time=1.9)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.5)
        self.play(Create(chords[0]), segments[0].animate.set_opacity(0.25), segments[1].animate.set_opacity(0.25), run_time=1.0)
        self.play(Create(chords[1]), segments[2].animate.set_opacity(0.25), segments[3].animate.set_opacity(0.25), run_time=1.0)
        self.play(Create(chords[2]), segments[4].animate.set_opacity(0.25), run_time=0.8)
        self.play(chords.animate.set_stroke(width=9), run_time=0.7)
        self.wait(2.2)`
  },
  {
    id: "scene-05-straighten",
    title: "Remove The Detour",
    className: "Scene05Straighten",
    durationSeconds: 9,
    purpose: "Show the limiting process: removing detours leaves only the direct line.",
    mathematicalConcept: "Repeated shortening pushes every intermediate point onto the straight segment.",
    objects: ["movable bend point", "length meter", "direct line"],
    animation: "A bend point slides down to the direct segment as the total length decreases.",
    camera: "Centered on the moving bend and meter.",
    text: "The shortest path has no corner left to remove.",
    transition: "The direct line becomes the final answer.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, point, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY, GREEN

class Scene05Straighten(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("REMOVE THE DETOUR", 0.52)
        A = np.array([-3.25, -2.1, 0])
        B = np.array([3.25, -2.1, 0])
        tracker = ValueTracker(2.4)
        def mid():
            return np.array([0, tracker.get_value(), 0])
        direct = Line(A, B, color=ACCENT, stroke_width=7).set_opacity(0.45)
        left = always_redraw(lambda: Line(A, mid(), color=SECONDARY, stroke_width=8))
        right = always_redraw(lambda: Line(mid(), B, color=SECONDARY, stroke_width=8))
        bend = always_redraw(lambda: Dot(mid(), radius=0.1, color=FOREGROUND))
        length_value = DecimalNumber(8.7, num_decimal_places=1, color=SECONDARY).scale(0.62)
        length_value.to_edge(DOWN, buff=1.55)
        length_label = small_label("path length", 0.3, MUTED).next_to(length_value, UP, buff=0.16)
        length_value.add_updater(lambda m: m.set_value(6.5 + 2.2 * tracker.get_value() / 2.4))
        caption = small_label("When the bend disappears, so does the extra distance.", 0.32, MUTED).to_edge(DOWN, buff=0.85)
        self.play(Write(title), FadeIn(VGroup(point(A, "A"), point(B, "B"))), run_time=0.9)
        self.play(Create(direct), FadeIn(VGroup(left, right, bend)), run_time=1.1)
        self.play(FadeIn(VGroup(length_label, length_value)), run_time=0.5)
        self.play(tracker.animate.set_value(-2.1), run_time=3.0, rate_func=smooth)
        self.play(left.animate.set_color(GREEN), right.animate.set_color(GREEN), direct.animate.set_opacity(1).set_stroke(width=12), run_time=0.8)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.5)
        self.wait(2.2)`
  },
  {
    id: "scene-06-conclusion",
    title: "No Detour",
    className: "Scene06Conclusion",
    durationSeconds: 8,
    purpose: "Resolve the original question with a concise visual statement.",
    mathematicalConcept: "The shortest path between two points in Euclidean space is the straight line segment.",
    objects: ["two points", "straight segment", "final statement"],
    animation: "All detour ghosts fade away, leaving the clean segment.",
    camera: "Quiet final frame.",
    text: "The shortest path has no detour.",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, point, path_line, small_label
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY

class Scene06Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        A = [-3.3, -2.0, 0]
        B = [3.3, -2.0, 0]
        ghosts = VGroup(
            path_line([A, [-2.1, 1.4, 0], [0.8, -0.2, 0], B], SECONDARY, 4, 0.22),
            path_line([A, [-1.5, 2.4, 0], [1.6, 1.6, 0], B], FOREGROUND, 4, 0.18),
            path_line([A, [-2.8, 0.4, 0], [-0.4, 2.8, 0], [2.5, 0.1, 0], B], SECONDARY, 4, 0.16),
        )
        direct = Line(A, B, color=ACCENT, stroke_width=10)
        endpoints = VGroup(point(A, "A"), point(B, "B"))
        final = headline("THE SHORTEST PATH\nHAS NO DETOUR.", 0.5)
        final.to_edge(UP, buff=1.2)
        formula = small_label("A straight segment is the only path with no local shortcut.", 0.32, MUTED).to_edge(DOWN, buff=1.2)
        self.play(LaggedStart(*[Create(g) for g in ghosts], lag_ratio=0.2), FadeIn(endpoints), run_time=1.4)
        self.play(Create(direct), run_time=0.85)
        self.play(ghosts.animate.set_opacity(0.05), direct.animate.set_stroke(width=13), run_time=0.9)
        self.play(Write(final), FadeIn(formula, shift=0.2 * UP), run_time=1.0)
        self.wait(3.85)`
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

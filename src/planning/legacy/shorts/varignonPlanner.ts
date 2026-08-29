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
    title: "Any Quadrilateral",
    className: "Scene01Hook",
    durationSeconds: 7,
    purpose: "Introduce an irregular quadrilateral.",
    mathematicalConcept: "Any four-sided shape has four side midpoints.",
    objects: ["irregular quadrilateral"],
    animation: "The quadrilateral draws in.",
    camera: "Static vertical frame.",
    text: "WHAT DO THE MIDPOINTS MAKE?",
    transition: "The midpoints are about to be marked.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WHAT DO THE\nMIDPOINTS MAKE?", 0.52)
        quad = Polygon(
            [-2.2, 1.6, 0], [2.0, 2.4, 0], [2.4, -1.0, 0], [-1.8, -0.6, 0],
            color=FOREGROUND, stroke_width=6,
        )
        caption = small_label("Any four-sided shape. Any four midpoints.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(Create(quad), run_time=1.3)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.4)`
  },
  {
    id: "scene-02-midpoints",
    title: "Mark The Midpoints",
    className: "Scene02Midpoints",
    durationSeconds: 8,
    purpose: "Mark the midpoint of each of the four sides.",
    mathematicalConcept: "Each side of the quadrilateral contributes exactly one midpoint.",
    objects: ["quadrilateral", "four midpoints"],
    animation: "Dots fade in at the midpoint of each side.",
    camera: "Static, centered on the shape.",
    text: "MARK EACH SIDE'S MIDPOINT",
    transition: "Four new points are ready to connect.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, SECONDARY
import numpy as np

class Scene02Midpoints(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("MARK EACH\nSIDE'S MIDPOINT", 0.42)
        verts = [
            np.array([-2.2, 1.6, 0]), np.array([2.0, 2.4, 0]),
            np.array([2.4, -1.0, 0]), np.array([-1.8, -0.6, 0]),
        ]
        quad = Polygon(*verts, color=FOREGROUND, stroke_width=6)
        mids = VGroup()
        for i in range(4):
            m = (verts[i] + verts[(i + 1) % 4]) / 2
            mids.add(Dot(m, radius=0.09, color=SECONDARY))
        caption = small_label("Four sides. Four new points.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(quad), run_time=1.1)
        self.play(LaggedStart(*[FadeIn(m, scale=1.5) for m in mids], lag_ratio=0.25), run_time=1.4)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.2)`
  },
  {
    id: "scene-03-connect",
    title: "Connect Them",
    className: "Scene03Connect",
    durationSeconds: 9,
    purpose: "Connect the midpoints in order to reveal a parallelogram.",
    mathematicalConcept: "Joining the four midpoints in order produces a parallelogram, known as the Varignon parallelogram.",
    objects: ["quadrilateral", "midpoints", "inner parallelogram"],
    animation: "Lines connect the midpoints in order, revealing a shaded parallelogram.",
    camera: "Static, centered on the shape.",
    text: "CONNECT THEM IN ORDER",
    transition: "A parallelogram sits inside the quadrilateral.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, SECONDARY, ACCENT
import numpy as np

class Scene03Connect(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("CONNECT THEM IN ORDER", 0.4)
        verts = [
            np.array([-2.2, 1.6, 0]), np.array([2.0, 2.4, 0]),
            np.array([2.4, -1.0, 0]), np.array([-1.8, -0.6, 0]),
        ]
        quad = Polygon(*verts, color=MUTED, stroke_width=4)
        mids = [(verts[i] + verts[(i + 1) % 4]) / 2 for i in range(4)]
        dots = VGroup(*[Dot(m, radius=0.08, color=SECONDARY) for m in mids])
        parallelogram = Polygon(*mids, color=ACCENT, fill_color=ACCENT, fill_opacity=0.25, stroke_width=5)
        caption = small_label("A parallelogram, every single time.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(quad), FadeIn(dots), run_time=1.1)
        self.play(Create(parallelogram), run_time=1.4)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.4)`
  },
  {
    id: "scene-04-deform",
    title: "Deform It",
    className: "Scene04Deform",
    durationSeconds: 9,
    purpose: "Continuously deform the quadrilateral and show the midpoint shape stays a parallelogram.",
    mathematicalConcept: "The parallelogram property holds for every possible quadrilateral shape, not just the one drawn.",
    objects: ["deforming quadrilateral", "always-updating parallelogram"],
    animation: "The four vertices drift smoothly while the inner parallelogram continuously updates and never breaks shape.",
    camera: "Static, centered on the deforming shape.",
    text: "DEFORM IT. WATCH THE MIDPOINTS.",
    transition: "The parallelogram never breaks.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED, ACCENT
import numpy as np

class Scene04Deform(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("DEFORM IT. WATCH\nTHE MIDPOINTS.", 0.4)
        t = ValueTracker(0.0)
        base = [
            np.array([-2.2, 1.6, 0]),
            np.array([2.0, 2.4, 0]),
            np.array([2.4, -1.0, 0]),
            np.array([-1.8, -0.6, 0]),
        ]
        offsets = [
            np.array([0.5, 0.3, 0]),
            np.array([-0.4, 0.5, 0]),
            np.array([0.3, -0.4, 0]),
            np.array([-0.3, -0.3, 0]),
        ]
        freqs = [1.0, 1.3, 0.8, 1.6]

        def vertex(i):
            return base[i] + offsets[i] * np.sin(t.get_value() * freqs[i])

        quad = always_redraw(lambda: Polygon(*[vertex(i) for i in range(4)], color=MUTED, stroke_width=4))

        def midpoint(i, j):
            return (vertex(i) + vertex(j)) / 2

        parallelogram = always_redraw(lambda: Polygon(
            midpoint(0, 1), midpoint(1, 2), midpoint(2, 3), midpoint(3, 0),
            color=ACCENT, fill_color=ACCENT, fill_opacity=0.25, stroke_width=5,
        ))
        caption = small_label("The shape changes. The parallelogram never breaks.", 0.3, MUTED).move_to([0, -2.9, 0])
        self.add(quad, parallelogram)
        self.play(Write(title), run_time=1.0)
        self.play(t.animate.set_value(6.2), run_time=4.0, rate_func=linear)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(1.5)`
  },
  {
    id: "scene-05-conclusion",
    title: "Varignon's Theorem",
    className: "Scene05Conclusion",
    durationSeconds: 8,
    purpose: "State the conclusion plainly.",
    mathematicalConcept: "The midpoints of any quadrilateral's sides always form a parallelogram.",
    objects: ["closing statement"],
    animation: "The final statement is written and held.",
    camera: "Quiet final frame.",
    text: "MIDPOINTS ALWAYS FORM A PARALLELOGRAM",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED

class Scene05Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        final = headline("MIDPOINTS ALWAYS FORM\nA PARALLELOGRAM", 0.38)
        note = small_label("True for every quadrilateral, however irregular.", 0.32, MUTED).move_to([0, -2.9, 0])
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

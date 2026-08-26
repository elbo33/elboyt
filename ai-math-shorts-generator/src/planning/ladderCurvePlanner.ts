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
    title: "The Ladder",
    className: "Scene01Hook",
    durationSeconds: 7,
    purpose: "Introduce a ladder leaning against a wall with its midpoint marked.",
    mathematicalConcept: "A ladder sliding down a wall keeps its endpoints on two perpendicular lines.",
    objects: ["wall", "floor", "ladder", "midpoint"],
    animation: "The wall, floor, and ladder draw in, then the midpoint is marked.",
    camera: "Static vertical frame.",
    text: "WHAT PATH DOES THE MIDDLE TRACE?",
    transition: "The ladder is about to slide.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, ACCENT
import numpy as np

class Scene01Hook(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WHAT PATH DOES\nTHE MIDDLE TRACE?", 0.48)
        corner = np.array([-2.0, -1.0, 0])
        L = 4.0
        theta = 55 * DEGREES
        top = corner + np.array([0, L * np.sin(theta), 0])
        bottom = corner + np.array([L * np.cos(theta), 0, 0])
        wall = Line(corner, corner + np.array([0, 3.2, 0]), color=MUTED, stroke_width=4)
        floor = Line(corner, corner + np.array([3.2, 0, 0]), color=MUTED, stroke_width=4)
        ladder = Line(top, bottom, color=FOREGROUND, stroke_width=7)
        mid = (top + bottom) / 2
        mid_dot = Dot(mid, radius=0.08, color=ACCENT)
        caption = small_label("A ladder slides down a wall onto the floor.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(Create(wall), Create(floor), run_time=0.8)
        self.play(Create(ladder), run_time=0.9)
        self.play(FadeIn(mid_dot), run_time=0.5)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.0)`
  },
  {
    id: "scene-02-setup",
    title: "Mark The Middle",
    className: "Scene02Setup",
    durationSeconds: 8,
    purpose: "Clearly mark the exact midpoint before setting it in motion.",
    mathematicalConcept: "The midpoint is the average of the two sliding endpoints.",
    objects: ["ladder", "midpoint label"],
    animation: "The midpoint is highlighted and labeled.",
    camera: "Static, centered on the ladder.",
    text: "MARK THE EXACT MIDDLE",
    transition: "The ladder is ready to slide.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, ACCENT
import numpy as np

class Scene02Setup(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("MARK THE\nEXACT MIDDLE", 0.42)
        corner = np.array([-2.0, -1.0, 0])
        L = 4.0
        theta = 55 * DEGREES
        top = corner + np.array([0, L * np.sin(theta), 0])
        bottom = corner + np.array([L * np.cos(theta), 0, 0])
        wall = Line(corner, corner + np.array([0, 3.2, 0]), color=MUTED, stroke_width=4)
        floor = Line(corner, corner + np.array([3.2, 0, 0]), color=MUTED, stroke_width=4)
        ladder = Line(top, bottom, color=FOREGROUND, stroke_width=7)
        mid = (top + bottom) / 2
        mid_dot = Dot(mid, radius=0.09, color=ACCENT)
        mid_label = small_label("midpoint", 0.28, ACCENT).next_to(mid_dot, UP, buff=0.15)
        caption = small_label("Marked once. Now let it slide.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), Create(wall), Create(floor), Create(ladder), run_time=1.1)
        self.play(FadeIn(mid_dot), FadeIn(mid_label), run_time=0.7)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.3)`
  },
  {
    id: "scene-03-slide",
    title: "Let It Slide",
    className: "Scene03Slide",
    durationSeconds: 10,
    purpose: "Animate the ladder sliding and trace the midpoint's path.",
    mathematicalConcept: "As the ladder slides, its midpoint traces a smooth curve rather than a straight line.",
    objects: ["sliding ladder", "traced path"],
    animation: "The ladder slides from near-vertical to near-horizontal while the midpoint leaves a visible trail.",
    camera: "Static, centered on the sliding motion.",
    text: "WATCH THE MIDPOINT AS IT SLIDES",
    transition: "A curved trail is left behind.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, ACCENT, SECONDARY
import numpy as np

class Scene03Slide(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("WATCH THE MIDPOINT\nAS IT SLIDES", 0.38)
        corner = np.array([-2.0, -1.0, 0])
        L = 4.0
        theta = ValueTracker(80 * DEGREES)

        def top():
            return corner + np.array([0, L * np.sin(theta.get_value()), 0])

        def bottom():
            return corner + np.array([L * np.cos(theta.get_value()), 0, 0])

        def mid():
            return (top() + bottom()) / 2

        wall = Line(corner, corner + np.array([0, 3.2, 0]), color=MUTED, stroke_width=4)
        floor = Line(corner, corner + np.array([3.2, 0, 0]), color=MUTED, stroke_width=4)
        ladder = always_redraw(lambda: Line(top(), bottom(), color=FOREGROUND, stroke_width=7))
        mid_dot = always_redraw(lambda: Dot(mid(), radius=0.08, color=ACCENT))
        trace = TracedPath(mid, stroke_color=SECONDARY, stroke_width=4)
        caption = small_label("It never moves in a straight line.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.add(wall, floor, trace, ladder, mid_dot)
        self.play(Write(title), run_time=0.9)
        self.play(theta.animate.set_value(10 * DEGREES), run_time=4.5, rate_func=linear)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.0)`
  },
  {
    id: "scene-04-reveal",
    title: "A Perfect Arc",
    className: "Scene04Reveal",
    durationSeconds: 9,
    purpose: "Reveal that the traced curve is an exact quarter circle.",
    mathematicalConcept: "The midpoint's distance from the corner stays constant, equal to half the ladder's length, so it traces a circular arc.",
    objects: ["quarter-circle arc", "reference circle"],
    animation: "A full reference circle appears, then the traced quarter arc is highlighted on top of it.",
    camera: "Centered on the corner and the arc.",
    text: "IT'S A PERFECT QUARTER CIRCLE",
    transition: "The curve is now fully explained.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import FOREGROUND, MUTED, SECONDARY
import numpy as np

class Scene04Reveal(MathShortScene):
    def construct(self):
        self.add_texture()
        title = headline("IT'S A PERFECT\nQUARTER CIRCLE", 0.4)
        corner = np.array([-2.0, -1.0, 0])
        L = 4.0
        arc = Arc(radius=L / 2, start_angle=10 * DEGREES, angle=70 * DEGREES, arc_center=corner, color=SECONDARY, stroke_width=6)
        full_circle = Circle(radius=L / 2, color=MUTED, stroke_width=2).move_to(corner)
        corner_dot = Dot(corner, radius=0.06, color=FOREGROUND)
        caption = small_label("Radius equals half the ladder's length.", 0.32, MUTED).move_to([0, -2.9, 0])
        self.play(Write(title), run_time=0.9)
        self.play(Create(full_circle), run_time=1.0)
        self.play(Create(arc), FadeIn(corner_dot), run_time=1.3)
        self.play(FadeIn(caption, shift=0.2 * UP), run_time=0.6)
        self.wait(2.5)`
  },
  {
    id: "scene-05-conclusion",
    title: "Not A Straight Line",
    className: "Scene05Conclusion",
    durationSeconds: 8,
    purpose: "State the conclusion plainly.",
    mathematicalConcept: "The midpoint of a sliding ladder always traces a quarter circle.",
    objects: ["closing statement"],
    animation: "The final statement is written and held.",
    camera: "Quiet final frame.",
    text: "THE MIDPOINT TRACES A QUARTER CIRCLE",
    transition: "End card.",
    code: String.raw`from manim import *
from support.style import MathShortScene, headline, small_label
from support.colors import MUTED

class Scene05Conclusion(MathShortScene):
    def construct(self):
        self.add_texture()
        final = headline("THE MIDPOINT TRACES\nA QUARTER CIRCLE", 0.4)
        note = small_label("Not a straight line. A perfect arc, every time.", 0.32, MUTED).move_to([0, -2.9, 0])
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

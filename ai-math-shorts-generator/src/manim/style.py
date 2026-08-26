from manim import *
from .colors import BACKGROUND, FOREGROUND, MUTED, ACCENT, SECONDARY, SOFT

config.pixel_width = 1080
config.pixel_height = 1920
config.frame_width = 9
config.frame_height = 16
config.frame_rate = 30
config.background_color = BACKGROUND

class MathShortScene(Scene):
    def setup(self):
        self.camera.background_color = BACKGROUND

    def add_texture(self):
        lines = VGroup()
        for y in [i * 0.8 - 8 for i in range(21)]:
            line = Line([-4.5, y, 0], [4.5, y, 0], color=SOFT, stroke_width=1)
            line.set_opacity(0.18)
            lines.add(line)
        for x in [i * 0.8 - 4.8 for i in range(13)]:
            line = Line([x, -8, 0], [x, 8, 0], color=SOFT, stroke_width=1)
            line.set_opacity(0.12)
            lines.add(line)
        self.add(lines)

def headline(text, scale=0.72):
    obj = Text(text, font="Avenir Next", weight=BOLD, color=FOREGROUND)
    obj.scale(scale)
    obj.to_edge(UP, buff=0.75)
    return obj

def small_label(text, scale=0.34, color=MUTED):
    return Text(text, font="Avenir Next", weight=MEDIUM, color=color).scale(scale)

def statement(text, scale=0.46, color=FOREGROUND):
    obj = Text(text, font="Avenir Next", weight=MEDIUM, color=color, line_spacing=0.9)
    obj.scale(scale)
    return obj

def point(position, label_text, color=ACCENT):
    dot = Dot(position, radius=0.11, color=color)
    ring = Circle(radius=0.22, color=color, stroke_width=2).move_to(position)
    ring.set_opacity(0.45)
    label = small_label(label_text, 0.34, FOREGROUND).next_to(dot, DOWN, buff=0.18)
    return VGroup(ring, dot, label)

def path_line(points, color=FOREGROUND, width=6, opacity=1):
    line = VMobject(color=color, stroke_width=width)
    line.set_points_smoothly(points)
    line.set_opacity(opacity)
    return line

def length_badge(text, position, color=SECONDARY):
    bg = RoundedRectangle(width=1.7, height=0.58, corner_radius=0.12, color=color, fill_color=BACKGROUND, fill_opacity=0.88, stroke_width=2)
    bg.move_to(position)
    label = small_label(text, 0.3, color).move_to(position)
    return VGroup(bg, label)

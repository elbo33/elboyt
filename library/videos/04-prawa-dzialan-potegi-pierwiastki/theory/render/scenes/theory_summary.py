import json

from manim import *
from support.colors import ACCENT, FOREGROUND, MUTED, SECONDARY
from support.style import FONT, LessonScene

DATA = json.loads("{\"tag\":\"PODSUMOWANIE\",\"title\":\"Podsumowanie\",\"lines\":[\"Najpierw: rozpoznaj typ zadania.\",\"Potem: wybierz wzór, własność albo metodę.\",\"Na końcu: policz i sprawdź sens wyniku.\"],\"duration\":42.7,\"visualKind\":\"board\",\"steps\":[{\"formula\":\"a^m\\\\cdot a^n=a^{m+n}\",\"label\":\"Mnożenie: dodaj\"},{\"formula\":\"\\\\frac{a^m}{a^n}=a^{m-n}\",\"label\":\"Dzielenie: odejmij\"},{\"formula\":\"(a^m)^n=a^{mn}\",\"label\":\"Potęga potęgi: pomnóż\"},{\"formula\":\"\\\\sqrt[n]{a^m}=a^{\\\\frac{m}{n}}\",\"label\":\"Zasubskrybuj i napisz, jaki temat chcesz zobaczyć\"}]}")


class Generic_theory_summary(LessonScene):
    def make_visual(self, kind):
        if kind == "sets":
            labels = ["N", "C", "W", "R"]
            boxes = VGroup()
            for i, label in enumerate(labels):
                rect = RoundedRectangle(
                    width=1.6 + i * 0.72,
                    height=1.1 + i * 0.52,
                    corner_radius=0.12,
                    color=[ACCENT, SECONDARY, MUTED, FOREGROUND][i],
                    stroke_width=5 - i * 0.5,
                )
                txt = Text(label, font=FONT, weight=BOLD, color=FOREGROUND).scale(0.38)
                txt.move_to(rect.get_center() + (0.38 + i * 0.28) * RIGHT + (0.18 + i * 0.12) * UP)
                boxes.add(rect, txt)
            note = Text("NW = R \\ W", font=FONT, weight=MEDIUM, color=MUTED).scale(0.26)
            note.next_to(boxes, DOWN, buff=0.3)
            return VGroup(boxes, note)

        if kind == "number_line":
            axis = Line(3.6 * LEFT, 3.6 * RIGHT, color=FOREGROUND, stroke_width=5)
            ticks = VGroup()
            for x in range(-3, 4):
                tick = Line(0.11 * DOWN, 0.11 * UP, color=MUTED, stroke_width=3)
                tick.move_to(axis.point_from_proportion((x + 3) / 6))
                label = Text(str(x), font=FONT, color=MUTED).scale(0.18).next_to(tick, DOWN, buff=0.12)
                ticks.add(tick, label)
            dots = VGroup()
            for prop, color, label in [(0.18, SECONDARY, "-2"), (0.5, ACCENT, "0"), (0.83, SECONDARY, "√7")]:
                dot = Dot(axis.point_from_proportion(prop), color=color, radius=0.075)
                lab = Text(label, font=FONT, weight=BOLD, color=color).scale(0.22).next_to(dot, UP, buff=0.14)
                dots.add(dot, lab)
            return VGroup(axis, ticks, dots)

        if kind == "operation_order":
            steps = ["nawiasy", "potęgi / √ / log", "× i :", "+ i -", "kontrola"]
            ladder = VGroup()
            for i, step in enumerate(steps):
                box = RoundedRectangle(width=3.25, height=0.5, corner_radius=0.08, color=ACCENT if i == 0 else MUTED, stroke_width=3)
                text = Text(step, font=FONT, weight=MEDIUM, color=FOREGROUND).scale(0.21)
                text.move_to(box)
                row = VGroup(box, text)
                row.shift((2 - i) * 0.23 * RIGHT)
                ladder.add(row)
            ladder.arrange(DOWN, buff=0.16)
            arrow = Arrow(ladder[0].get_bottom(), ladder[-1].get_top(), color=SECONDARY, stroke_width=4, buff=0.18)
            arrow.next_to(ladder, LEFT, buff=0.18)
            return VGroup(arrow, ladder)

        if kind == "formula":
            frame = RoundedRectangle(width=4.1, height=3.0, corner_radius=0.1, color=ACCENT, stroke_width=4)
            top = Text("wzór", font=FONT, weight=BOLD, color=ACCENT).scale(0.34).next_to(frame.get_top(), DOWN, buff=0.28)
            mid = Line(frame.get_left() + 0.35 * RIGHT, frame.get_right() + 0.35 * LEFT, color=MUTED, stroke_width=3)
            mid.shift(0.16 * UP)
            bottom = Text("warunki przed rachunkiem", font=FONT, weight=MEDIUM, color=MUTED).scale(0.22)
            bottom.next_to(mid, DOWN, buff=0.36)
            return VGroup(frame, top, mid, bottom)

        if kind == "root_parity":
            even_box = RoundedRectangle(width=2.25, height=2.25, corner_radius=0.1, color=ACCENT, stroke_width=4)
            odd_box = RoundedRectangle(width=2.25, height=2.25, corner_radius=0.1, color=SECONDARY, stroke_width=4)
            even = VGroup(even_box, MathTex(r"x^4", color=FOREGROUND).scale(0.72), Text("parzysty", font=FONT, color=ACCENT).scale(0.24))
            odd = VGroup(odd_box, MathTex(r"x^3", color=FOREGROUND).scale(0.72), Text("nieparzysty", font=FONT, color=SECONDARY).scale(0.24))
            even[1].move_to(even_box.get_center() + 0.25 * UP)
            even[2].move_to(even_box.get_center() + 0.55 * DOWN)
            odd[1].move_to(odd_box.get_center() + 0.25 * UP)
            odd[2].move_to(odd_box.get_center() + 0.55 * DOWN)
            pair = VGroup(even, odd).arrange(RIGHT, buff=0.45)
            arrows = VGroup(
                Arrow(even_box.get_bottom(), even_box.get_bottom() + 0.65 * DOWN, color=MUTED, buff=0.05, tip_length=0.16),
                Arrow(odd_box.get_bottom(), odd_box.get_bottom() + 0.65 * DOWN, color=MUTED, buff=0.05, tip_length=0.16),
            )
            labels = VGroup(
                Text("wynik ≥ 0", font=FONT, color=FOREGROUND).scale(0.22).next_to(arrows[0], DOWN, buff=0.1),
                Text("znak zostaje", font=FONT, color=FOREGROUND).scale(0.22).next_to(arrows[1], DOWN, buff=0.1),
            )
            return VGroup(pair, arrows, labels)

        if kind == "root_balance":
            radical = MathTex(r"\sqrt[n]{a}=b", color=ACCENT).scale(0.9)
            power = MathTex(r"b^n=a", color=SECONDARY).scale(0.85)
            arrow1 = Arrow(radical.get_right(), power.get_left(), color=MUTED, buff=0.25, tip_length=0.18)
            row = VGroup(radical, arrow1, power).arrange(RIGHT, buff=0.35)
            question = Text("pierwiastek pyta o podstawę potęgi", font=FONT, weight=MEDIUM, color=FOREGROUND).scale(0.24)
            question.next_to(row, DOWN, buff=0.42)
            return VGroup(row, question)

        if kind == "factor_tree":
            expr = MathTex(r"40=2^3\cdot 5", color=FOREGROUND).scale(0.72)
            root = MathTex(r"\sqrt[3]{40}=2\sqrt[3]{5}", color=ACCENT).scale(0.72)
            cube = RoundedRectangle(width=1.15, height=0.78, corner_radius=0.08, color=SECONDARY, stroke_width=4)
            cube_label = MathTex(r"2^3", color=SECONDARY).scale(0.52).move_to(cube)
            rem = RoundedRectangle(width=1.15, height=0.78, corner_radius=0.08, color=MUTED, stroke_width=3)
            rem_label = MathTex(r"5", color=FOREGROUND).scale(0.52).move_to(rem)
            chips = VGroup(VGroup(cube, cube_label), VGroup(rem, rem_label)).arrange(RIGHT, buff=0.35)
            chips.next_to(expr, DOWN, buff=0.5)
            root.next_to(chips, DOWN, buff=0.52)
            return VGroup(expr, chips, root)

        if kind == "common_degree":
            left = MathTex(r"\sqrt[3]{3}", color=ACCENT).scale(0.62)
            mid = MathTex(r"\sqrt[4]{5}", color=SECONDARY).scale(0.62)
            right = MathTex(r"\sqrt{2}", color=FOREGROUND).scale(0.62)
            top = VGroup(left, mid, right).arrange(RIGHT, buff=0.52)
            target = MathTex(r"\sqrt[12]{\phantom{000}}", color=MUTED).scale(0.9)
            target.next_to(top, DOWN, buff=0.65)
            arrows = VGroup(*[Arrow(m.get_bottom(), target.get_top(), color=MUTED, buff=0.12, tip_length=0.14) for m in top])
            label = Text("wspólny stopień", font=FONT, weight=BOLD, color=FOREGROUND).scale(0.26).next_to(target, DOWN, buff=0.3)
            return VGroup(top, arrows, target, label)

        if kind == "rationalize":
            frac1 = MathTex(r"\frac{6}{\sqrt[3]{3}}", color=FOREGROUND).scale(0.82)
            times = MathTex(r"\cdot\frac{\sqrt[3]{9}}{\sqrt[3]{9}}", color=SECONDARY).scale(0.72)
            frac2 = MathTex(r"=2\sqrt[3]{9}", color=ACCENT).scale(0.8)
            row = VGroup(frac1, times, frac2).arrange(RIGHT, buff=0.28)
            note = Text("dopełnij wykładnik do stopnia pierwiastka", font=FONT, color=MUTED).scale(0.22)
            note.next_to(row, DOWN, buff=0.42)
            return VGroup(row, note)

        if kind == "interval":
            axis = Line(3.7 * LEFT, 3.7 * RIGHT, color=FOREGROUND, stroke_width=4)
            seg = Line(axis.point_from_proportion(0.22), axis.point_from_proportion(0.78), color=ACCENT, stroke_width=12)
            left = Circle(radius=0.11, color=SECONDARY, stroke_width=5).move_to(axis.point_from_proportion(0.22))
            right = Dot(axis.point_from_proportion(0.78), color=SECONDARY, radius=0.12)
            lab_l = Text("otwarty", font=FONT, color=MUTED).scale(0.2).next_to(left, DOWN, buff=0.16)
            lab_r = Text("domknięty", font=FONT, color=MUTED).scale(0.2).next_to(right, DOWN, buff=0.16)
            return VGroup(axis, seg, left, right, lab_l, lab_r)

        if kind == "exercise":
            board = RoundedRectangle(width=4.4, height=3.2, corner_radius=0.12, color=SECONDARY, stroke_width=4)
            strip = Rectangle(width=4.0, height=0.56, color=ACCENT, fill_opacity=0.16, stroke_width=0)
            strip.next_to(board.get_top(), DOWN, buff=0.35)
            txt = Text("dane → plan → rachunek → wynik", font=FONT, weight=BOLD, color=FOREGROUND).scale(0.19)
            txt.move_to(strip)
            return VGroup(board, strip, txt)

        if kind == "summary":
            checks = VGroup()
            for i, step in enumerate(["rozpoznaj", "wybierz", "policz", "sprawdź"]):
                dot = Dot(color=ACCENT if i < 3 else SECONDARY, radius=0.07)
                txt = Text(step, font=FONT, weight=MEDIUM, color=FOREGROUND).scale(0.24)
                row = VGroup(dot, txt).arrange(RIGHT, buff=0.18)
                checks.add(row)
            checks.arrange(DOWN, aligned_edge=LEFT, buff=0.28)
            return checks

        grid = VGroup()
        for i in range(4):
            card = RoundedRectangle(width=1.85, height=0.78, corner_radius=0.08, color=ACCENT if i % 2 == 0 else SECONDARY, stroke_width=3)
            card.shift((i % 2) * 2.05 * RIGHT + (1 - i // 2) * 0.95 * UP)
            grid.add(card)
        return grid

    def construct(self):
        self.add_texture()
        self.add_scene_tag(DATA["tag"])

        title = Text(DATA["title"], font=FONT, weight=BOLD, color=FOREGROUND, line_spacing=0.92)
        title.scale(0.56)
        title.to_edge(UP, buff=0.9)
        if title.width > 12.8:
            title.scale_to_fit_width(12.8)

        if DATA["steps"]:
            self.play(FadeIn(title, shift=0.15 * DOWN), run_time=0.6)
            scene_seconds = DATA["duration"] + 1.3
            step_budget = (scene_seconds - 1.0) / len(DATA["steps"])
            current = None
            for step in DATA["steps"]:
                formula = MathTex(step["formula"], color=ACCENT).scale(1.15)
                if formula.width > 11.5:
                    formula.scale_to_fit_width(11.5)
                formula.move_to([0, 0.35, 0])
                caption = Text(step["label"], font=FONT, color=FOREGROUND).scale(0.34)
                if caption.width > 11.5:
                    caption.scale_to_fit_width(11.5)
                caption.next_to(formula, DOWN, buff=0.65)
                group = VGroup(formula, caption)
                if current is None:
                    self.play(FadeIn(group, shift=0.12 * UP), run_time=1.0)
                else:
                    self.play(FadeOut(current), FadeIn(group, shift=0.12 * UP), run_time=1.0)
                self.wait(max(0.2, step_budget - 1.7))
                self.play(Indicate(formula, color=SECONDARY), run_time=0.7)
                current = group
            self.play(FadeOut(title), FadeOut(current), run_time=0.4)
            return

        visual = self.make_visual(DATA.get("visualKind", "board"))
        visual.move_to([0, -0.2, 0])
        if visual.width > 8.2:
            visual.scale_to_fit_width(8.2)
        if visual.height > 4.45:
            visual.scale_to_fit_height(4.45)

        rows = VGroup()

        accent = Line(LEFT, RIGHT, color=SECONDARY, stroke_width=5).scale(1.2)
        accent.next_to(visual, DOWN, buff=0.45)
        if accent.get_bottom()[1] < -2.55:
            accent.move_to([0, -2.45, 0])

        self.play(FadeIn(title, shift=0.15 * DOWN), FadeIn(visual, shift=0.18 * UP), run_time=0.6)
        self.play(Create(accent), run_time=0.35)
        self.wait(DATA["duration"])
        self.play(FadeOut(title), FadeOut(visual), FadeOut(rows), FadeOut(accent), run_time=0.35)


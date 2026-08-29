from manim import *

from support.colors import MUTED
from support.compute import (
    add_signed,
    compare_on_line,
    frac_cancel,
    mul_repeat,
    pow_expand,
    root_ask,
    sign_flip,
    solve_linear,
    substitute,
)
from support.style import LessonScene, small_label


class _Base(LessonScene):
    tag = ""

    def construct(self):
        self.add_texture()
        self.add(small_label(self.tag, 0.34, MUTED).to_corner(UL, buff=0.55))
        self.body()


class P1Substitute(_Base):
    tag = "1 - substitute"

    def body(self):
        substitute(
            self,
            r"a_{n} = a_{1} + (n-1)\cdot r",
            r"a_{10} = 7 + (10-1)\cdot (-4)",
            ["7", "10", "(-4)"],
        )


class P2MulRepeat(_Base):
    tag = "2 - mul_repeat"

    def body(self):
        mul_repeat(self, 9, -4)


class P3AddSigned(_Base):
    tag = "3 - add_signed"

    def body(self):
        add_signed(self, 7, -36)


class P4SignFlip(_Base):
    tag = "4 - sign_flip"

    def body(self):
        sign_flip(self, [("+", "x^{2}"), ("-", "6x"), ("+", "9")])


class P5FracCancel(_Base):
    tag = "5 - frac_cancel"

    def body(self):
        frac_cancel(self, 39, 2, 12)


class P6SolveLinear(_Base):
    tag = "6 - solve_linear"

    def body(self):
        solve_linear(self, 2, -5, 9)


class P7PowExpand(_Base):
    tag = "7 - pow_expand"

    def body(self):
        pow_expand(self, 2, 4)


class P8RootAsk(_Base):
    tag = "8 - root_ask"

    def body(self):
        root_ask(self, 9, 2)


class P9CompareOnLine(_Base):
    tag = "9 - compare_on_line"

    def body(self):
        compare_on_line(self, [8, 2, 32, 4])

from manim import *

from support.style import LessonScene
from support.templates.theory_example import beat_seq, worked_beat

# One EXAMPLE block: ZasPro g-th-00 (ciag-arytmetyczny THEORY_SUPPORT #1).
# a_1 = 7, r = -4, find a_10.  Transcribed from the approved problem; the prose
# strings (notes, sentence, insight) are the planner's per-example authoring.
EX = {
    "label": "PRZYKŁAD 1 / 3",
    "source_id": "g-th-00",
    "statement": (
        "Ciąg arytmetyczny (a_n) jest określony dla każdej liczby naturalnej "
        "n ≥ 1. W tym ciągu a₁ = 7, a różnica r = −4. Oblicz dziesiąty wyraz "
        "tego ciągu."
    ),
    "highlights": ["a₁ = 7", "r = −4", "dziesiąty wyraz"],
    "sought": ["a_{10}"],
    "plan_formula": r"a_{n} = a_{1} + (n-1)\cdot r",
    "plan_note": "Znamy pierwszy wyraz i różnicę — wystarczy wzór na n-ty wyraz.",
    "sub_filled": r"a_{10} = 7 + (10-1)\cdot(-4)",
    "sub_note": "Wstawiamy a₁ = 7, r = −4 oraz n = 10 w miejsce liter.",
    "computes": [
        {"kind": "arith", "line": r"a_{10} = 7 + 9\cdot(-4)",
         "note": "Najpierw nawias: 10 − 1 = 9 kroków."},
        {"kind": "mul_repeat", "args": [9, -4], "line": r"a_{10} = 7 + (-36)",
         "note": "9 · (−4): dodajemy −4 dziewięć razy."},
        {"kind": "add_signed", "args": [7, -36], "line": r"a_{10} = -29",
         "note": "7 + (−36): ruszamy w lewo, przez zero."},
    ],
    "answer_tex": r"a_{10} = -29",
    "answer_sentence": "Dziesiąty wyraz ciągu jest równy −29.",
    "check": {
        "kind": "list",
        "terms": [7, 3, -1, -5, -9, -13, -17, -21, -25, -29],
        "note": "Dziesiąty wypisany wyraz to −29 — zgadza się.",
    },
    "insight": "Do n-tego wyrazu dochodzimy w n − 1 krokach po r — stąd nawias (n − 1), nie n.",
    "include_insight": True,
}

_SEQ = beat_seq(EX)


def _mk(i):
    class _B(LessonScene):
        _beat = i

        def construct(self):
            worked_beat(self, EX, self._beat)

    _B.__name__ = f"B{i:02d}_{_SEQ[i].replace('-', '_')}"
    return _B


for _i in range(len(_SEQ)):
    globals()[f"B{_i:02d}_{_SEQ[_i].replace('-', '_')}"] = _mk(_i)

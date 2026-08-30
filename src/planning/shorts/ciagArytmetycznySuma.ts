import type {ShortSpec} from "./types";

// Short 2: the Gauss pairing trick for the sum. Cut from ciag-arytmetyczny-teoria
// why_it_works 1..4, compressed to a 3-term fold so the column table fits 9:16.

const HDR = `from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED
`;

export const ciagArytmetycznySuma: ShortSpec = {
  slug: "ciag-arytmetyczny-suma-bez-dodawania",
  title: "Suma stu wyrazów w głowie",
  topic: "Ciąg arytmetyczny: suma bez dodawania po kolei",
  fromEpisode: "ciag-arytmetyczny-teoria",
  derivedScenes: ["why_it_works-1", "why_it_works-2", "why_it_works-3", "why_it_works-4", "why_it_works-5"],
  scenes: [
    {
      id: "hook",
      className: "Hook",
      title: "Hook",
      durationSeconds: 4.5,
      derivedFromScene: "",
      narration:
        "Sto liczb do dodania? Jest na to jeden trik. Dodajesz sumę od przodu i od tyłu naraz.",
      py:
        HDR +
        `

class Hook(LessonScene):
    def construct(self):
        self.add_texture()
        head = Text("SUMA STU WYRAZÓW\\nW GŁOWIE", font=FONT, weight=BOLD,
                    color=FOREGROUND, line_spacing=1.05).scale(0.92)
        head.move_to([0, 4.0, 0])
        s = MathTex(r"1 + 2 + 3 + \\cdots + 99 + 100").scale(1.15).set_color(FOREGROUND)
        s.move_to([0, -0.4, 0])
        arc = CurvedArrow(s[0][0].get_top() + 0.2 * UP, s[0][-1].get_top() + 0.2 * UP,
                          angle=-TAU / 8, color=ACCENT, stroke_width=4)
        self.play(FadeIn(head, scale=1.08), run_time=0.4)
        self.play(Write(s), run_time=0.6)
        self.wait(0.4)
        self.play(Create(arc), run_time=0.5)
        self.wait(1.4)
`
    },
    {
      id: "forwards",
      className: "Forwards",
      title: "Krótka suma",
      durationSeconds: 8,
      derivedFromScene: "why_it_works-1",
      narration: "Weźmy krótką sumę: dwa, pięć, osiem.",
      py:
        HDR +
        `from support.archetypes import stage_derivation


class Forwards(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, columns={
            "rows": [("od przodu", ["2", "5", "8"])],
            "static_rows": 0,
        }, caption="Dodajemy dwa, pięć, osiem.", pace="fast")
`
    },
    {
      id: "fold",
      className: "Fold",
      title: "Od przodu i od tyłu",
      durationSeconds: 11,
      derivedFromScene: "why_it_works-3",
      narration:
        "Pod spodem ta sama suma od tyłu. Każda kolumna daje dziesięć. Trzy jednakowe pary.",
      py:
        HDR +
        `from support.archetypes import stage_derivation


class Fold(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, columns={
            "rows": [("od przodu", ["2", "5", "8"]), ("od tyłu", ["8", "5", "2"]),
                     ("suma", ["10", "10", "10"])],
            "static_rows": 1,
        }, caption="Każda kolumna: pierwszy plus ostatni wyraz.", pace="fast")
`
    },
    {
      id: "formula",
      className: "Formula",
      title: "Wzór na sumę",
      durationSeconds: 11,
      derivedFromScene: "why_it_works-5",
      narration:
        "Podwojona suma to liczba wyrazów razy pierwszy plus ostatni. Dzielimy przez dwa i mamy wzór na sumę.",
      py:
        HDR +
        `from support.archetypes import stage_derivation


class Formula(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, symbolic=[
            r"2\\,S_n = n\\,(a_1 + a_n)",
            r"S_n = \\dfrac{n\\,(a_1 + a_n)}{2}",
        ], caption="Gotowy wzór na sumę n wyrazów.", pace="fast")
`
    }
  ]
};

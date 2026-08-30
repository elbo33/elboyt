import type {ShortSpec} from "./types";

// Short 3: Przykład 1 re-planned to four beats. Cut from ciag-arytmetyczny-teoria
// PRZYKŁAD 1 block, compressed to problem, substitution, one computation, answer.

const HDR = `from manim import *
from support.style import LessonScene, FONT
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED
`;

export const ciagArytmetycznyDziesiaty: ShortSpec = {
  slug: "ciag-arytmetyczny-dziesiaty-wyraz",
  title: "Dziesiąty wyraz w dwadzieścia sekund",
  topic: "Ciąg arytmetyczny: dziesiąty wyraz w dwadzieścia sekund",
  fromEpisode: "ciag-arytmetyczny-teoria",
  derivedScenes: [
    "example-g-th-00-00-present",
    "example-g-th-00-03-substitute",
    "example-g-th-00-05-compute-2",
    "example-g-th-00-07-result"
  ],
  scenes: [
    {
      id: "hook",
      className: "Hook",
      title: "Hook",
      durationSeconds: 4.5,
      derivedFromScene: "",
      narration:
        "Pierwszy wyraz siedem, różnica minus cztery. Dziesiąty wyraz policzysz bez wypisywania.",
      py:
        HDR +
        `

class Hook(LessonScene):
    def construct(self):
        self.add_texture()
        head = Text("DZIESIĄTY WYRAZ\\nW 20 SEKUND", font=FONT, weight=BOLD,
                    color=FOREGROUND, line_spacing=1.05).scale(0.92)
        head.move_to([0, 4.0, 0])
        chips = VGroup(
            MathTex(r"a_1 = 7", color=ACCENT).scale(1.25),
            MathTex(r"r = -4", color=ACCENT).scale(1.25),
        ).arrange(RIGHT, buff=1.1).move_to([0, -0.4, 0])
        self.play(FadeIn(head, scale=1.08), run_time=0.4)
        self.play(LaggedStart(*[FadeIn(c, shift=0.15 * UP) for c in chips], lag_ratio=0.4),
                  run_time=0.6)
        self.wait(1.6)
`
    },
    {
      id: "substitute",
      className: "Substitute",
      title: "Podstawienie",
      durationSeconds: 9,
      derivedFromScene: "example-g-th-00-03-substitute",
      narration:
        "Wzór na n-ty wyraz. Wstawiamy siedem, minus cztery oraz dziesięć.",
      py:
        HDR +
        `from support.archetypes import stage_derivation


class Substitute(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, symbolic=[
            r"a_n = a_1 + (n-1)\\cdot r",
            r"a_{10} = 7 + (10-1)\\cdot(-4)",
        ], caption="Same litery zamienione na dane.", pace="fast")
`
    },
    {
      id: "compute",
      className: "Compute",
      title: "Rachunek",
      durationSeconds: 11,
      derivedFromScene: "example-g-th-00-05-compute-2",
      narration:
        "Dziewięć razy minus cztery to minus trzydzieści sześć. Siedem dodać minus trzydzieści sześć.",
      py:
        HDR +
        `from support.archetypes import stage_derivation


class Compute(LessonScene):
    def construct(self):
        self.add_texture()
        stage_derivation(self, symbolic=[
            r"a_{10} = 7 + 9\\cdot(-4)",
            r"a_{10} = 7 + (-36)",
        ], caption="Dziewięć skoków po minus cztery.", pace="fast")
`
    },
    {
      id: "answer",
      className: "Answer",
      title: "Wynik",
      durationSeconds: 8,
      derivedFromScene: "example-g-th-00-07-result",
      narration: "Dziesiąty wyraz to minus dwadzieścia dziewięć.",
      py:
        HDR +
        `

class Answer(LessonScene):
    def construct(self):
        self.add_texture()
        ans = MathTex(r"a_{10} = -29", color=SECONDARY).scale(1.7).move_to([0, 0.3, 0])
        box = SurroundingRectangle(ans, color=SECONDARY, buff=0.35, corner_radius=0.14)
        cap = Text("Bez wypisywania wyrazów.", font=FONT, weight=MEDIUM, color=MUTED).scale(0.5)
        cap.move_to([0, ans.get_bottom()[1] - 1.0, 0])
        self.play(Write(ans), run_time=0.5)
        self.play(Create(box), Flash(ans, color=SECONDARY, line_length=0.4), run_time=0.5)
        self.play(FadeIn(cap, shift=0.15 * UP), run_time=0.4)
        self.wait(2.2)
`
    }
  ]
};

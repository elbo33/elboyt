import type {AuthoredScene, ExampleAuthoring, SectionAuthoring} from "./types";
import type {BandType} from "../skeletons";
import {AUTHORED_NARRATION, EXAMPLE_NARRATION} from "./dzialaniaLiczbyRzeczywisteScript";

const HDR = `import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement
from support.colors import ACCENT, SECONDARY, FOREGROUND, MUTED, GREEN, RED
from support.config import hold
`;

function scene(
  band: BandType,
  index: number,
  total: number,
  className: string,
  tag: string,
  archImport: string,
  body: string,
  meta: {
    title: string;
    still: string;
    narration: string;
    standalone?: boolean;
    short?: string;
    durationSeconds?: number;
  }
): AuthoredScene {
  const py =
    HDR +
    `from support.archetypes import ${archImport}\n\n\n` +
    `class ${className}(LessonScene):\n` +
    `    def construct(self):\n` +
    `        self.add_texture()\n` +
    `        self.add_scene_tag(${JSON.stringify(`${tag}  ·  ${index} / ${total}`)})\n` +
    body +
    `\n        hold(self, 1.2)\n`;
  return {
    band,
    index,
    title: meta.title,
    sceneLabel: `${tag}  ·  ${index} / ${total}`,
    standalone: meta.standalone ?? false,
    stillMoment: meta.still,
    shortHook: meta.short,
    narration: meta.narration,
    durationSeconds: meta.durationSeconds ?? 34,
    py
  };
}

const hook: AuthoredScene[] = [
  scene(
    "hook",
    1,
    2,
    "RealHookAxis",
    "WPROWADZENIE",
    "stage_figure",
    `        axis = NumberLine(x_range=[-8, 8, 2], length=10.5, include_numbers=True, color=MUTED)
        points = VGroup()
        labels = VGroup()
        for x, lab, col in [(-4, "-4", SECONDARY), (-2, "-2", ACCENT), (0, "0", FOREGROUND), (2.65, "√7", SECONDARY), (5, "5", ACCENT)]:
            dot = Dot(axis.n2p(x), radius=0.09, color=col)
            text = small_label(lab, 0.34, col).next_to(dot, UP, buff=0.18)
            points.add(dot)
            labels.add(text)
        sweep = Line(axis.n2p(-6.5), axis.n2p(6.5), color=ACCENT, stroke_width=10).set_opacity(0.28)
        stage_figure(self, VGroup(axis, sweep, points, labels),
            question="Jedna oś, wiele rodzajów liczb.",
            caption="Najpierw obraz osi, potem rachunek i przedziały.",
            reveal=[
                [Create(axis)],
                [Create(sweep)],
                [LaggedStart(*[FadeIn(m, shift=0.12*UP) for m in points], lag_ratio=0.18)],
                [LaggedStart(*[FadeIn(m) for m in labels], lag_ratio=0.12)],
            ])`,
    {
      title: "Hook: liczby jako punkty na osi",
      still: "number line with selected real numbers",
      standalone: true,
      short: "Jedna oś porządkuje działania i przedziały.",
      narration:
        "Zaczynamy od obrazu, nie od definicji. Liczby rzeczywiste traktujemy jak punkty na jednej osi. Na tej samej osi są liczby ujemne, zero, dodatnie, ułamki, pierwiastki i później całe przedziały. Ta lekcja będzie polegała na tym, że każdy rachunek będziemy podpinać pod obraz."
    }
  ),
  scene(
    "hook",
    2,
    2,
    "RealHookPipeline",
    "WPROWADZENIE",
    "stage_model",
    `        c1 = VGroup(small_label("zapis", 0.34, MUTED), mtex(r"(-2)^3 + 3(-4) - \\sqrt{49}", 0.48, SECONDARY)).arrange(DOWN, buff=0.25)
        c2 = VGroup(small_label("oś", 0.34, MUTED), NumberLine(x_range=[-30, 5, 5], length=4.2, include_numbers=False, color=MUTED)).arrange(DOWN, buff=0.25)
        c3 = VGroup(small_label("przedział", 0.34, MUTED), mtex(r"[-3,\\ 7)", 0.7, ACCENT)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Rachunek ma prowadzić do sensownego miejsca na osi.")`,
    {
      title: "Hook: od zapisu do obrazu",
      still: "three cards: expression, axis, interval",
      standalone: true,
      narration:
        "Nie będziemy robić filmu z przepisywania slajdów. Narracja wyjaśni słowa, a ekran ma pokazywać ruch: z zapisu przechodzimy do działania, z działania do punktu na osi, a z nierówności do zamalowanego fragmentu osi."
    }
  )
];

const intuition: AuthoredScene[] = [
  scene(
    "intuition",
    1,
    4,
    "RealSets",
    "INTUICJA",
    "stage_figure",
    `        rings = VGroup()
        specs = [(5.6, 3.2, "R", FOREGROUND), (4.4, 2.35, "W", ACCENT), (3.1, 1.55, "C", SECONDARY), (1.75, 0.85, "N", GREEN)]
        for w, h, lab, col in specs:
            e = Ellipse(width=w, height=h, color=col, stroke_width=4)
            t = small_label(lab, 0.44, col).move_to(e.get_right() + LEFT*0.45 + UP*0.18)
            rings.add(e, t)
        nw = small_label("NW", 0.42, MUTED).move_to([-2.0, -0.95, 0])
        stage_figure(self, VGroup(rings, nw),
            question="Rodziny liczb są zagnieżdżone.",
            caption="Naturalne, całkowite i wymierne siedzą w R; niewymierne wypełniają resztę osi.",
            reveal=[
                [Create(rings[0]), FadeIn(rings[1])],
                [Create(rings[2]), FadeIn(rings[3])],
                [Create(rings[4]), FadeIn(rings[5])],
                [Create(rings[6]), FadeIn(rings[7]), FadeIn(nw)],
            ])`,
    {
      title: "Zbiory liczb jako zagnieżdżenie",
      still: "nested ellipses N C W R",
      standalone: true,
      narration:
        "Zbiór liczb rzeczywistych jest największym pojemnikiem w tej lekcji. W środku są liczby wymierne, dalej całkowite, dalej naturalne. Obok wymiernych, ale nadal na tej samej osi, są liczby niewymierne. Taki obraz pomaga zrozumieć, czemu czasem wynik po prostu zostaje liczbą rzeczywistą, a czasem wypada poza mniejszy zbiór."
    }
  ),
  scene(
    "intuition",
    2,
    4,
    "RealClosedOps",
    "INTUICJA",
    "stage_figure",
    `        center = Circle(radius=1.05, color=ACCENT, stroke_width=5)
        rlabel = mtex(r"R", 1.0, FOREGROUND).move_to(center)
        ops = VGroup()
        for angle, op in [(0, "+"), (PI/2, "\\\\cdot"), (PI, "-"), (3*PI/2, ":")]:
            pos = 2.45*np.array([np.cos(angle), np.sin(angle), 0])
            token = VGroup(Circle(radius=0.36, color=SECONDARY, stroke_width=3), mtex(op, 0.58, SECONDARY)).move_to(pos)
            arrow = Arrow(token.get_center(), center.get_center(), color=MUTED, buff=0.48, stroke_width=3, tip_length=0.16)
            ops.add(token, arrow)
        warn = small_label(": przez zero odpada", 0.35, RED).next_to(ops[-2], DOWN, buff=0.2)
        stage_figure(self, VGroup(center, rlabel, ops, warn),
            question="Działanie bierze liczby z osi i zwraca liczbę z osi.",
            caption="Wyjątek, który trzeba widzieć od razu: dzielenie przez zero.",
            reveal=[
                [Create(center), FadeIn(rlabel)],
                [LaggedStart(*[FadeIn(ops[i], shift=0.12*IN) for i in range(0, len(ops), 2)], lag_ratio=0.18)],
                [LaggedStart(*[Create(ops[i]) for i in range(1, len(ops), 2)], lag_ratio=0.12)],
                [FadeIn(warn)],
            ])`,
    {
      title: "Wykonalność działań w R",
      still: "operations flowing into R circle",
      narration:
        "Dodawanie, odejmowanie i mnożenie dwóch liczb rzeczywistych znowu daje liczbę rzeczywistą. Dzielenie też możemy tak traktować, ale tylko wtedy, gdy dzielnik nie jest zerem. To jest pierwszy warunek bezpieczeństwa przed liczeniem."
    }
  ),
  scene(
    "intuition",
    3,
    4,
    "RealOrderMachine",
    "INTUICJA",
    "stage_figure",
    `        steps = [("()", ACCENT), (r"x^n,\\sqrt{x},\\log", SECONDARY), (r"\\times\\ : ", ACCENT), ("+  -", SECONDARY)]
        blocks = VGroup()
        for i, (tex, col) in enumerate(steps):
            box = RoundedRectangle(width=2.15, height=0.9, corner_radius=0.1, color=col, stroke_width=4, fill_color=col, fill_opacity=0.12)
            label = MathTex(tex, color=FOREGROUND).scale(0.48).move_to(box)
            blocks.add(VGroup(box, label))
        blocks.arrange(RIGHT, buff=0.55)
        arrows = VGroup(*[Arrow(blocks[i].get_right(), blocks[i+1].get_left(), color=MUTED, buff=0.12, tip_length=0.15) for i in range(3)])
        stage_figure(self, VGroup(blocks, arrows),
            question="Kolejność działań to maszyna, nie lista do recytowania.",
            caption="Każde wyrażenie przepuszczamy przez te same bramki.",
            reveal=[
                [LaggedStart(*[FadeIn(b, shift=0.15*UP) for b in blocks], lag_ratio=0.18)],
                [LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.15)],
            ])`,
    {
      title: "Kolejność działań jako maszyna",
      still: "operation-order machine",
      standalone: true,
      narration:
        "Kolejność działań wyobrażamy sobie jak maszynę. Najpierw wpadają nawiasy, także ukryte pod kreską ułamkową i pod pierwiastkiem. Potem potęgi, pierwiastki i logarytmy. Później mnożenie z dzieleniem, a na końcu dodawanie z odejmowaniem."
    }
  ),
  scene(
    "intuition",
    4,
    4,
    "RealIntervalAxis",
    "INTUICJA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-5, 9, 1], length=10.2, include_numbers=True, color=MUTED)
        seg = Line(axis.n2p(-3), axis.n2p(7), color=ACCENT, stroke_width=12).set_opacity(0.75)
        left = Dot(axis.n2p(-3), radius=0.12, color=SECONDARY)
        right = Circle(radius=0.13, color=SECONDARY, stroke_width=5).move_to(axis.n2p(7))
        label = mtex(r"[-3,\\ 7)", 0.82, FOREGROUND).next_to(axis, UP, buff=0.55)
        stage_figure(self, VGroup(axis, seg, left, right, label),
            question="Przedział to nie wzór. To fragment osi.",
            caption="Pełny koniec należy, pusty koniec nie należy.",
            reveal=[
                [Create(axis)],
                [Create(seg)],
                [FadeIn(left), FadeIn(right)],
                [Write(label)],
            ])`,
    {
      title: "Przedział jako fragment osi",
      still: "interval from minus three to seven",
      standalone: true,
      narration:
        "Przedział liczbowy to zamalowany fragment osi. Jeśli koniec ma kółko pełne, należy do zbioru. Jeśli koniec ma kółko puste, jest tylko granicą. Ten obraz będzie ważniejszy niż długa definicja."
    }
  )
];

const definition: AuthoredScene[] = [
  scene(
    "definition",
    1,
    4,
    "RealMinusPower",
    "DEFINICJA",
    "stage_derivation",
    `        stage_derivation(self, symbolic=[
            r"(-2)^4 = (-2)(-2)(-2)(-2) = 16",
            r"-2^4 = -(2^4) = -16",
        ], caption="Nawias decyduje, co jest podstawą potęgi.")`,
    {
      title: "Minus przy potędze",
      still: "two power transformations contrasting parentheses",
      standalone: true,
      narration:
        "Znak minus przy potędze trzeba widzieć graficznie. W pierwszym zapisie minus siedzi w nawiasie, więc jest częścią podstawy. W drugim zapisie minus stoi przed potęgą i zostaje na zewnątrz. To są dwa różne obiekty."
    }
  ),
  scene(
    "definition",
    2,
    4,
    "RealRootAbs",
    "DEFINICJA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-8, 8, 2], length=10, include_numbers=True, color=MUTED)
        left = Dot(axis.n2p(-7), radius=0.1, color=RED)
        right = Dot(axis.n2p(7), radius=0.1, color=GREEN)
        sq_left = MathTex(r"(-7)^2=49", color=RED).scale(0.55).next_to(left, UP, buff=0.45)
        sq_right = MathTex(r"7^2=49", color=GREEN).scale(0.55).next_to(right, UP, buff=0.45)
        root = MathTex(r"\\sqrt{49}=7", color=SECONDARY).scale(0.8).move_to([0, -1.65, 0])
        stage_figure(self, VGroup(axis, left, right, sq_left, sq_right, root),
            question="Dwie liczby mają ten sam kwadrat, ale pierwiastek wybiera nieujemną.",
            caption="Dlatego \\sqrt{a^2} daje |a|.",
            reveal=[
                [Create(axis)],
                [FadeIn(left), Write(sq_left)],
                [FadeIn(right), Write(sq_right)],
                [Write(root), Circumscribe(root, color=SECONDARY)],
            ])`,
    {
      title: "Pierwiastek arytmetyczny wybiera stronę dodatnią",
      still: "minus seven and seven on number line both squaring to forty nine",
      narration:
        "Dwie liczby mogą mieć ten sam kwadrat. Minus siedem do kwadratu i siedem do kwadratu dają tę samą wartość. Ale symbol pierwiastka kwadratowego oznacza pierwiastek arytmetyczny, czyli wynik nieujemny. Dlatego pierwiastek z kwadratu daje wartość bezwzględną."
    }
  ),
  scene(
    "definition",
    3,
    4,
    "RealLogQuestion",
    "DEFINICJA",
    "stage_derivation",
    `        stage_derivation(self, symbolic=[
            r"\\log_a b = c",
            r"a^c = b",
            r"\\log_2\\left(\\frac{1}{16}\\right)=?",
            r"2^{?}=\\frac{1}{16}",
        ], caption="Logarytm pyta o brakujący wykładnik.")`,
    {
      title: "Logarytm jako pytanie",
      still: "logarithm converted into missing exponent question",
      standalone: true,
      narration:
        "Logarytm czytamy jako pytanie o wykładnik. Jeśli widzę logarytm przy podstawie dwa, pytam, do której potęgi trzeba podnieść dwa, żeby otrzymać liczbę logarytmowaną. To zamienia obcy symbol na zwykłą potęgę."
    }
  ),
  scene(
    "definition",
    4,
    4,
    "RealEndpointRule",
    "DEFINICJA",
    "stage_model",
    `        def marker(tex, filled):
            axis = Line(LEFT*1.2, RIGHT*1.2, color=MUTED, stroke_width=4)
            mark = Dot(ORIGIN, color=SECONDARY, radius=0.1) if filled else Circle(radius=0.11, color=SECONDARY, stroke_width=4)
            lab = mtex(tex, 0.46, FOREGROUND).next_to(axis, DOWN, buff=0.25)
            return VGroup(axis, mark, lab)
        c1 = marker(r"x<7", False)
        c2 = marker(r"x\\le 7", True)
        c3 = marker(r"x>-3", False)
        stage_model(self, cards=[c1, c2, c3], tagline="Ostry znak daje pusty koniec. Nieostry znak daje pełny koniec.")`,
    {
      title: "Końce przedziałów",
      still: "three endpoint markers",
      narration:
        "Przy przedziałach każdy koniec rozstrzygamy osobno. Znak ostry daje pusty punkt, bo granica nie należy do zbioru. Znak nieostry daje punkt pełny, bo granica należy do zbioru."
    }
  )
];

const why: AuthoredScene[] = [
  scene(
    "why_it_works",
    1,
    3,
    "RealExpressionFlow",
    "DLACZEGO TO DZIAŁA",
    "stage_derivation",
    `        stage_derivation(self, symbolic=[
            r"(-2)^3 + 3\\cdot(-4) - \\sqrt{49}",
            r"-8 + 3\\cdot(-4) - 7",
            r"-8 + (-12) - 7",
            r"-27",
        ], caption="Każda linia robi tylko jeden typ ruchu.")`,
    {
      title: "Wyrażenie spływa po drabinie działań",
      still: "expression simplified over four lines",
      standalone: true,
      narration:
        "Długie wyrażenie uspokajamy przez linie pośrednie. Jedna linia robi potęgę i pierwiastek. Następna robi mnożenie. Dopiero potem zostaje zwykłe dodawanie liczb ze znakami. Dzięki temu uczeń widzi, gdzie dokładnie zmienił się zapis."
    }
  ),
  scene(
    "why_it_works",
    2,
    3,
    "RealIntervalOps",
    "DLACZEGO TO DZIAŁA",
    "stage_figure",
    `        base = NumberLine(x_range=[-5, 8, 1], length=9.6, include_numbers=True, color=MUTED)
        a = base.copy().shift(UP*0.85)
        b = base.copy().shift(DOWN*0.55)
        seg_a = Line(a.n2p(-4), a.n2p(3), color=ACCENT, stroke_width=10)
        seg_b = Line(b.n2p(-1), b.n2p(7), color=SECONDARY, stroke_width=10)
        overlap = Line(base.n2p(-1), base.n2p(3), color=GREEN, stroke_width=14).shift(DOWN*1.9)
        lab_a = small_label("A", 0.4, ACCENT).next_to(a, LEFT, buff=0.3)
        lab_b = small_label("B", 0.4, SECONDARY).next_to(b, LEFT, buff=0.3)
        lab_o = small_label("A ∩ B", 0.4, GREEN).next_to(overlap, LEFT, buff=0.3)
        stage_figure(self, VGroup(a, b, seg_a, seg_b, overlap, lab_a, lab_b, lab_o),
            question="Część wspólna to miejsce zamalowane dwa razy.",
            caption="Dlatego przedziały rysujemy jeden pod drugim w tej samej skali.",
            reveal=[
                [Create(a), Create(b), FadeIn(lab_a), FadeIn(lab_b)],
                [Create(seg_a)],
                [Create(seg_b)],
                [Create(overlap), FadeIn(lab_o)],
            ])`,
    {
      title: "Działania na przedziałach robi się wzrokiem",
      still: "two intervals and their overlap",
      narration:
        "Przedziały są graficzne z natury. Jeśli rysujemy dwa przedziały jeden pod drugim w tej samej skali, część wspólna staje się widoczna bez zgadywania. To fragment osi zamalowany w obu zbiorach jednocześnie."
    }
  ),
  scene(
    "why_it_works",
    3,
    3,
    "RealMaturaBridge",
    "DLACZEGO TO DZIAŁA",
    "stage_model",
    `        c1 = VGroup(mtex(r"(-2)^3", 0.62, ACCENT), small_label("znak i nawias", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        c2 = VGroup(mtex(r"\\log_2(1/16)", 0.56, SECONDARY), small_label("pytanie o wykładnik", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        c3 = VGroup(mtex(r"[-3,7)", 0.7, GREEN), small_label("fragment osi", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Matura miesza te trzy obrazy w jednym poleceniu.")`,
    {
      title: "Most do zadań maturalnych",
      still: "three visual handles for matura tasks",
      standalone: true,
      narration:
        "W arkuszu maturalnym te części często są wymieszane. Jeden fragment zadania sprawdza znaki i kolejność działań, drugi logarytm jako potęgę, a trzeci przynależność do przedziału. Dlatego budujemy trzy obrazy, które można szybko przywołać."
    }
  )
];

const summary: AuthoredScene[] = [
  scene(
    "summary",
    1,
    2,
    "RealSummary",
    "PODSUMOWANIE",
    "stage_model",
    `        c1 = VGroup(mtex(r"()", 0.8, ACCENT), small_label("ukryte nawiasy", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        c2 = VGroup(mtex(r"\\sqrt{x^2}=|x|", 0.52, SECONDARY), small_label("znak wyniku", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        c3 = VGroup(mtex(r"[a,b)", 0.72, GREEN), small_label("końce na osi", 0.3, MUTED)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Najpierw obraz. Potem rachunek. Na końcu kontrola.")`,
    {
      title: "Trzy obrazy do zapamiętania",
      still: "three memory cards",
      standalone: true,
      narration:
        "Po tej lekcji chcę, żeby zostały trzy obrazy. Pierwszy: ukryte nawiasy kierują kolejnością działań. Drugi: pierwiastek arytmetyczny kontroluje znak wyniku. Trzeci: przedział jest fragmentem osi z końcami pełnymi albo pustymi."
    }
  ),
  scene(
    "summary",
    2,
    2,
    "RealFinalTakeaway",
    "PODSUMOWANIE",
    "stage_figure",
    `        axis = NumberLine(x_range=[-10, 10, 5], length=10.5, include_numbers=True, color=MUTED)
        dot = Dot(axis.n2p(-4), radius=0.1, color=ACCENT)
        seg = Line(axis.n2p(-3), axis.n2p(7), color=SECONDARY, stroke_width=10).set_opacity(0.7)
        marker = Circle(radius=0.13, color=SECONDARY, stroke_width=4).move_to(axis.n2p(7))
        stage_figure(self, VGroup(axis, dot, seg, marker),
            question="Wynik ma miejsce na osi.",
            caption="Jeśli umiesz go zobaczyć, łatwiej sprawdzić, czy ma sens.",
            reveal=[
                [Create(axis)],
                [FadeIn(dot)],
                [Create(seg), FadeIn(marker)],
                [Circumscribe(VGroup(dot, seg), color=ACCENT)],
            ])`,
    {
      title: "Wynik musi mieć sens na osi",
      still: "final number line with point and interval",
      standalone: true,
      short: "Rachunek bez obrazu łatwo oszukuje.",
      narration:
        "Końcowa zasada jest prosta. Wynik nie jest samotną liczbą w zeszycie. Wynik ma swoje miejsce na osi. Jeśli po rachunku potrafisz wskazać to miejsce albo porównać je z przedziałem, masz dużo większą kontrolę nad zadaniem."
    }
  )
];

const exValue: ExampleAuthoring = {
  sourceId: "g-th-00",
  className: "RealExampleValue",
  sceneLabel: "PRZYKŁAD 1 / 3",
  durationSeconds: 24,
  ex: {
    label: "PRZYKŁAD 1 / 3",
    source_id: "g-th-00",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "compute-3", "result", "insight"],
    statement: "Oblicz wartość wyrażenia (-2)^3 + 3·(-4) - √49.",
    highlights: ["(-2)^3", "3·(-4)", "√49"],
    sought: ["wartość"],
    plan_formula: "(-2)^3 + 3\\cdot(-4) - \\sqrt{49}",
    plan_note: "Najpierw potęga i pierwiastek, potem mnożenie, na końcu suma.",
    computes: [
      {kind: "arith", line: "-8 + 3\\cdot(-4) - 7", note: "Potęga i pierwiastek są wyżej w kolejności działań."},
      {kind: "arith", line: "-8 + (-12) - 7", note: "Mnożenie wykonujemy przed dodawaniem."},
      {kind: "arith", line: "-27", note: "Teraz idziemy od lewej do prawej po osi."}
    ],
    answer_tex: "-27",
    answer_sentence: "Wartość wyrażenia jest równa −27.",
    insight: "Nie ma skrótu: najpierw struktura, potem rachunek.",
    include_insight: true,
    narrations: {
      present:
        "Pierwszy przykład pokazuje całą maszynę kolejności działań. Czytamy wyrażenie jako trzy główne części: potęga z ujemną podstawą, mnożenie przez liczbę ujemną i pierwiastek arytmetyczny.",
      restate:
        "Szukamy jednej liczby, czyli wartości całego wyrażenia. Nie zaczynamy od lewej krawędzi bezmyślnie. Najpierw zaznaczamy działania, które według kolejności muszą zostać wykonane wcześniej.",
      plan:
        "Plan jest prosty: najpierw potęga i pierwiastek, potem mnożenie, dopiero na końcu dodawanie i odejmowanie. Ten plan zostaje na ekranie jako mapa rachunku.",
      "compute-1":
        "Potęga ma minus w nawiasie, więc podstawa jest ujemna. Przy wykładniku nieparzystym wynik zostaje ujemny. Pierwiastek z czterdziestu dziewięciu daje siedem, bo pierwiastek arytmetyczny jest nieujemny.",
      "compute-2":
        "Teraz wykonujemy mnożenie. Trzy razy minus cztery daje minus dwanaście. Dopiero po tym kroku wyrażenie jest zwykłym dodawaniem i odejmowaniem liczb ze znakami.",
      "compute-3":
        "Ostatni ruch to przejście po osi w lewo. Minus osiem i minus dwanaście daje minus dwadzieścia, a po odjęciu siedmiu dochodzimy do minus dwadzieścia siedem.",
      result:
        "Wynik zapisujemy w ramce. Ważniejsze od samej liczby jest to, że każdy etap miał swoje miejsce w kolejności działań.",
      insight:
        "Ten przykład ma nauczyć procesu. Najpierw rozpoznaj strukturę, potem licz pojedyncze bloki, a dopiero na końcu sklej wynik."
    }
  }
};

const exLog: ExampleAuthoring = {
  sourceId: "g-th-01",
  className: "RealExampleLog",
  sceneLabel: "PRZYKŁAD 2 / 3",
  durationSeconds: 24,
  ex: {
    label: "PRZYKŁAD 2 / 3",
    source_id: "g-th-01",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "result", "insight"],
    statement: "Korzystając z definicji logarytmu, oblicz log_2(1/16).",
    highlights: ["log_2", "1/16"],
    sought: ["wartość logarytmu"],
    plan_formula: "\\log_a b = c \\iff a^c=b",
    plan_note: "Logarytm zamieniamy na pytanie o wykładnik.",
    computes: [
      {kind: "arith", line: "\\frac{1}{16}=\\frac{1}{2^4}=2^{-4}", note: "Liczbę logarytmowaną zapisujemy jako potęgę podstawy."},
      {kind: "arith", line: "\\log_2(2^{-4})=-4", note: "Logarytm zwraca wykładnik."}
    ],
    answer_tex: "-4",
    answer_sentence: "Wartość logarytmu jest równa −4.",
    insight: "Ujemny wynik logarytmu oznacza, że liczba logarytmowana jest odwrotnością potęgi podstawy.",
    include_insight: true,
    narrations: {
      present:
        "Drugi przykład wygląda krótko, ale jest fundamentalny. Nie traktujemy logarytmu jak symbolu do zapamiętania. Traktujemy go jak pytanie o brakujący wykładnik.",
      restate:
        "Szukamy takiego wykładnika, do którego trzeba podnieść dwa, żeby otrzymać jeden przez szesnaście. Zanim liczymy, sprawdzamy w głowie, że podstawa jest dodatnia i różna od jedności, a liczba logarytmowana jest dodatnia.",
      plan:
        "Definicja logarytmu mówi, że zapis logarytmiczny można zamienić na zapis potęgowy. Na ekranie zostaje równoważność, bo to ona prowadzi cały rachunek.",
      "compute-1":
        "Jeden przez szesnaście zapisujemy jako odwrotność czwartej potęgi dwójki. Odwrotność potęgi to wykładnik ujemny, więc dostajemy dwa do potęgi minus czwartej.",
      "compute-2":
        "Teraz logarytm ma już idealną postać. Podstawa logarytmu i podstawa potęgi są takie same, więc wynikiem jest sam wykładnik.",
      result:
        "Odpowiedź jest ujemna, i to ma sens. Żeby z podstawy większej od jeden zejść do ułamka, potrzebny jest wykładnik ujemny.",
      insight:
        "Przy logarytmach z definicji nie zgaduj. Zamień liczbę logarytmowaną na potęgę podstawy, a wynik pojawi się jako wykładnik."
    }
  }
};

const exInterval: ExampleAuthoring = {
  sourceId: "g-th-02",
  className: "RealExampleInterval",
  sceneLabel: "PRZYKŁAD 3 / 3",
  durationSeconds: 24,
  ex: {
    label: "PRZYKŁAD 3 / 3",
    source_id: "g-th-02",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "compute-3", "result", "insight"],
    statement: "Dany jest zbiór A = {x ∈ R : -3 ≤ x < 7}. Zapisz A jako przedział i oblicz długość.",
    highlights: ["długość"],
    sought: ["A", "d"],
    plan_formula: "\\{x\\in\\mathbb{R}: -3\\le x<7\\}",
    plan_note: "Lewy i prawy koniec rozstrzygamy osobno.",
    computes: [
      {kind: "arith", line: "-3\\le x\\quad \\Rightarrow\\quad \\text{koniec pełny}", note: "Znak nieostry włącza lewy koniec do zbioru."},
      {kind: "arith", line: "x<7\\quad \\Rightarrow\\quad \\text{koniec pusty}", note: "Znak ostry wyłącza prawy koniec ze zbioru."},
      {kind: "arith", line: "d=7-(-3)=10", note: "Długość to prawy koniec minus lewy koniec."}
    ],
    answer_tex: "A=[-3,7),\\quad d=10",
    answer_sentence: "A = [-3, 7), a długość przedziału wynosi 10.",
    insight: "Długość nie zależy od tego, czy końce są puste albo pełne.",
    include_insight: true,
    narrations: {
      present:
        "Trzeci przykład jest o przedziale, więc myślimy osią liczbową. Zapis w klamrze mówi: weź wszystkie liczby rzeczywiste, które spełniają dwa warunki naraz.",
      restate:
        "Szukamy dwóch rzeczy. Po pierwsze, zapisu przedziału. Po drugie, długości tego przedziału. Obie rzeczy wynikają z końców na osi.",
      plan:
        "Plan polega na tym, żeby lewy koniec i prawy koniec potraktować osobno. Jeden znak mówi, czy lewy koniec należy. Drugi znak mówi, czy prawy koniec należy.",
      "compute-1":
        "Po lewej stronie mamy znak nieostry. Liczba minus trzy należy do zbioru, więc na osi byłby punkt pełny, a w zapisie przedziału nawias domknięty.",
      "compute-2":
        "Po prawej stronie mamy znak ostry. Liczba siedem nie należy do zbioru, więc na osi byłby punkt pusty, a w zapisie przedziału nawias okrągły.",
      "compute-3":
        "Długość liczymy z położenia końców. Prawy koniec minus lewy koniec daje siedem minus minus trzy, czyli dziesięć.",
      result:
        "Odpowiedź ma dwie części: przedział od minus trzy z końcem pełnym do siedmiu z końcem pustym oraz długość dziesięć.",
      insight:
        "Kółko puste lub pełne wpływa na przynależność końca, ale nie wpływa na odległość między końcami."
    }
  }
};

function withNarration(scenes: AuthoredScene[]): AuthoredScene[] {
  return scenes.map((item) => ({
    ...item,
    narration: AUTHORED_NARRATION[`${item.band}-${item.index}`] ?? item.narration
  }));
}

function withExampleNarration(example: ExampleAuthoring): ExampleAuthoring {
  return {
    ...example,
    ex: {
      ...example.ex,
      narrations: {
        ...(example.ex.narrations as Record<string, string> | undefined),
        ...(EXAMPLE_NARRATION[example.sourceId] ?? {})
      }
    }
  };
}

export const dzialaniaLiczbyRzeczywiste: SectionAuthoring = {
  slug: "dzialania-liczby-rzeczywiste",
  topic: "Działania w zbiorze liczb rzeczywistych i przedziały liczbowe",
  authored: withNarration([...hook, ...intuition, ...definition, ...why, ...summary]),
  examples: [exValue, exLog, exInterval].map(withExampleNarration)
};

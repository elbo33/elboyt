import type {AuthoredScene, ExampleAuthoring, SectionAuthoring} from "./types";
import type {BandType} from "../skeletons";

const HDR = `import numpy as np
from manim import *
from support.style import LessonScene, mtex, small_label
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
    durationSeconds: meta.durationSeconds ?? 36,
    py
  };
}

const hook: AuthoredScene[] = [
  scene(
    "hook",
    1,
    2,
    "RootsHookQuestion",
    "WPROWADZENIE",
    "stage_figure",
    `        root = mtex(r"\\sqrt[n]{a}=b", 0.98, ACCENT)
        power = mtex(r"b^n=a", 0.98, SECONDARY)
        VGroup(root, power).arrange(RIGHT, buff=1.1)
        arrow = Arrow(root.get_right(), power.get_left(), color=MUTED, buff=0.22, stroke_width=4, tip_length=0.18)
        ask = small_label("szukamy liczby b", 0.36, MUTED).next_to(root, DOWN, buff=0.38)
        check = small_label("sprawdzamy potęgą", 0.36, MUTED).next_to(power, DOWN, buff=0.38)
        stage_figure(self, VGroup(root, arrow, power, ask, check),
            question="Pierwiastek pyta o podstawę potęgi.",
            caption="Nie zgadujemy symbolu. Pytamy, jaka liczba po potędze daje a.",
            reveal=[
                [Write(root)],
                [Create(arrow), Write(power)],
                [FadeIn(ask, shift=0.12*UP), FadeIn(check, shift=0.12*UP)],
            ])`,
    {
      title: "Hook: pierwiastek jako pytanie",
      still: "root expression turning into a power check",
      standalone: true,
      short: "Pierwiastek to pytanie o brakującą podstawę.",
      durationSeconds: 38,
      narration:
        "Cześć. W tym odcinku spokojnie przejdziemy przez pierwiastki dowolnego stopnia. Zaczynamy od jednego pytania: jaka liczba po podniesieniu do potęgi n daje liczbę pod pierwiastkiem. Ten obraz będzie prowadził całą lekcję, od znaków i dziedziny aż do upraszczania przykładów maturalnych."
    }
  ),
  scene(
    "hook",
    2,
    2,
    "RootsHookPipeline",
    "WPROWADZENIE",
    "stage_model",
    `        c1 = VGroup(small_label("stopień", 0.34, MUTED), mtex(r"n", 0.82, ACCENT)).arrange(DOWN, buff=0.22)
        c2 = VGroup(small_label("znak", 0.34, MUTED), mtex(r"a<0?", 0.66, SECONDARY)).arrange(DOWN, buff=0.22)
        c3 = VGroup(small_label("postać", 0.34, MUTED), mtex(r"k\\sqrt[n]{b}", 0.58, FOREGROUND)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Najpierw stopień. Potem znak. Na końcu uproszczenie.")`,
    {
      title: "Hook: trzy decyzje w każdym zadaniu",
      still: "three compact cards: degree, sign, simplified form",
      standalone: true,
      durationSeconds: 36,
      narration:
        "Każde zadanie z pierwiastkiem wyższego stopnia ma trzy decyzje. Najpierw patrzymy na stopień pierwiastka. Potem sprawdzamy znak liczby pod pierwiastkiem. Dopiero na końcu upraszczamy zapis, wyciągając pełne potęgi przed znak pierwiastka."
    }
  )
];

const intuition: AuthoredScene[] = [
  scene(
    "intuition",
    1,
    4,
    "RootsEvenPowerMirror",
    "INTUICJA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-4, 4, 1], length=9.8, include_numbers=True, color=MUTED)
        left = Dot(axis.n2p(-2), radius=0.11, color=SECONDARY)
        right = Dot(axis.n2p(2), radius=0.11, color=ACCENT)
        lab_l = small_label("-2", 0.34, SECONDARY).next_to(left, DOWN, buff=0.24)
        lab_r = small_label("2", 0.34, ACCENT).next_to(right, DOWN, buff=0.24)
        top = mtex(r"(-2)^4=16\\quad\\text{i}\\quad 2^4=16", 0.68, FOREGROUND).next_to(axis, UP, buff=0.72)
        arcs = VGroup(
            CurvedArrow(left.get_top()+UP*0.12, top.get_left()+DOWN*0.18, angle=-TAU/9, color=SECONDARY, stroke_width=3, tip_length=0.14),
            CurvedArrow(right.get_top()+UP*0.12, top.get_right()+DOWN*0.18, angle=TAU/9, color=ACCENT, stroke_width=3, tip_length=0.14),
        )
        result = mtex(r"\\sqrt[4]{16}=2", 0.72, ACCENT).next_to(axis, DOWN, buff=0.72)
        stage_figure(self, VGroup(axis, left, right, lab_l, lab_r, top, arcs, result),
            question="Parzysta potęga gubi znak.",
            caption="Dlatego pierwiastek parzystego stopnia wybiera wynik nieujemny.",
            reveal=[
                [Create(axis), FadeIn(left), FadeIn(right), FadeIn(lab_l), FadeIn(lab_r)],
                [Write(top), Create(arcs)],
                [Write(result)],
            ])`,
    {
      title: "Parzysta potęga gubi znak",
      still: "minus two and two both mapping to sixteen",
      standalone: true,
      short: "Czwarty pierwiastek nie daje dwóch odpowiedzi.",
      durationSeconds: 38,
      narration:
        "Pierwszy obraz dotyczy stopnia parzystego. Liczba minus dwa podniesiona do czwartej potęgi daje szesnaście. Liczba dwa też daje szesnaście. Symbol pierwiastka nie wypisuje jednak dwóch możliwości. Pierwiastek arytmetyczny stopnia parzystego wybiera wynik nieujemny, czyli dwa."
    }
  ),
  scene(
    "intuition",
    2,
    4,
    "RootsOddPowerSign",
    "INTUICJA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-9, 9, 3], length=10.4, include_numbers=True, color=MUTED)
        neg = Dot(axis.n2p(-8), radius=0.11, color=SECONDARY)
        pos = Dot(axis.n2p(8), radius=0.11, color=ACCENT)
        lab_neg = mtex(r"(-2)^3=-8", 0.54, SECONDARY).next_to(neg, UP, buff=0.32)
        lab_pos = mtex(r"2^3=8", 0.54, ACCENT).next_to(pos, UP, buff=0.32)
        root_neg = mtex(r"\\sqrt[3]{-8}=-2", 0.72, SECONDARY).next_to(axis, DOWN, buff=0.76)
        root_pos = mtex(r"\\sqrt[3]{8}=2", 0.72, ACCENT).next_to(root_neg, RIGHT, buff=1.0)
        stage_figure(self, VGroup(axis, neg, pos, lab_neg, lab_pos, root_neg, root_pos),
            question="Nieparzysta potęga zachowuje stronę osi.",
            caption="Dlatego pierwiastek nieparzystego stopnia może mieć wynik ujemny.",
            reveal=[
                [Create(axis)],
                [FadeIn(neg), Write(lab_neg)],
                [FadeIn(pos), Write(lab_pos)],
                [Write(root_neg), Write(root_pos)],
            ])`,
    {
      title: "Nieparzysty stopień zachowuje znak",
      still: "odd powers preserve negative and positive sides",
      standalone: true,
      durationSeconds: 38,
      narration:
        "Przy stopniu nieparzystym znak nie znika. Minus dwa do trzeciej potęgi daje minus osiem, a dwa do trzeciej potęgi daje osiem. Dlatego pierwiastek trzeciego stopnia z liczby ujemnej istnieje w liczbach rzeczywistych i wynik zostaje po lewej stronie osi."
    }
  ),
  scene(
    "intuition",
    3,
    4,
    "RootsDomainSwitch",
    "INTUICJA",
    "stage_model",
    `        c1 = VGroup(small_label("n parzyste", 0.34, ACCENT), mtex(r"\\sqrt[n]{a}", 0.58, FOREGROUND), small_label("a ≥ 0", 0.34, MUTED)).arrange(DOWN, buff=0.18)
        c2 = VGroup(small_label("n nieparzyste", 0.34, SECONDARY), mtex(r"\\sqrt[n]{a}", 0.58, FOREGROUND), small_label("a dowolne", 0.34, MUTED)).arrange(DOWN, buff=0.18)
        stage_model(self, cards=[c1, c2], tagline="Stopień pierwiastka decyduje, czy liczba ujemna jest dozwolona.")`,
    {
      title: "Stopień decyduje o dziedzinie",
      still: "two cards showing even and odd root domains",
      standalone: true,
      short: "Najpierw parzysty czy nieparzysty, dopiero potem rachunek.",
      durationSeconds: 36,
      narration:
        "Z tego dostajemy pierwszą kontrolę w zadaniu. Jeśli stopień jest parzysty, liczba pod pierwiastkiem musi być nieujemna. Jeśli stopień jest nieparzysty, liczba pod pierwiastkiem może być dowolna. Ta decyzja przychodzi przed rachunkiem, bo mówi, czy wyrażenie w ogóle istnieje w zbiorze liczb rzeczywistych."
    }
  ),
  scene(
    "intuition",
    4,
    4,
    "RootsCubeGroups",
    "INTUICJA",
    "stage_figure",
    `        cells = VGroup()
        for txt, col in [("2", ACCENT), ("2", ACCENT), ("2", ACCENT), ("5", SECONDARY)]:
            box = Square(side_length=0.62, stroke_width=2.5, stroke_color=MUTED, fill_color=col, fill_opacity=0.28)
            lab = small_label(txt, 0.34, FOREGROUND).move_to(box)
            cells.add(VGroup(box, lab))
        cells.arrange(RIGHT, buff=0)
        triplet = VGroup(cells[0], cells[1], cells[2])
        brace = Brace(triplet, UP, color=ACCENT)
        out = mtex(r"2", 0.7, ACCENT).next_to(brace, UP, buff=0.16)
        start = mtex(r"\\sqrt[3]{40}=\\sqrt[3]{2^3\\cdot5}", 0.62, FOREGROUND).next_to(cells, UP, buff=1.0)
        finish = mtex(r"2\\sqrt[3]{5}", 0.78, SECONDARY).next_to(cells, DOWN, buff=0.65)
        stage_figure(self, VGroup(start, cells, brace, out, finish),
            question="Uproszczenie to grupowanie pełnych paczek.",
            caption="Przy pierwiastku trzeciego stopnia trzy takie same czynniki wychodzą jako jeden.",
            reveal=[
                [Write(start)],
                [LaggedStart(*[FadeIn(c, shift=0.10*UP) for c in cells], lag_ratio=0.16)],
                [GrowFromCenter(brace), FadeIn(out)],
                [Write(finish)],
            ])`,
    {
      title: "Pełna paczka czynników wychodzi przed pierwiastek",
      still: "cube-root factor strip grouping three twos",
      standalone: true,
      short: "Wyciąganie przed pierwiastek to grupowanie potęg.",
      durationSeconds: 38,
      narration:
        "Teraz obraz upraszczania. Przy pierwiastku trzeciego stopnia szukamy trójek takich samych czynników. Liczba czterdzieści to dwa razy dwa razy dwa razy pięć. Trzy dwójki tworzą pełny sześcian, więc wychodzą przed pierwiastek jako jedna dwójka. Piątka zostaje pod pierwiastkiem, bo nie ma swojej pełnej trójki."
    }
  )
];

const definition: AuthoredScene[] = [
  scene(
    "definition",
    1,
    5,
    "RootsAnatomy",
    "DEFINICJA",
    "stage_figure",
    `        expr = mtex(r"\\sqrt[n]{a}=b", 1.08, FOREGROUND)
        degree = small_label("stopień", 0.34, ACCENT).move_to([-1.58, 1.1, 0])
        radicand = small_label("liczba pod pierwiastkiem", 0.34, SECONDARY).move_to([0.1, -1.06, 0])
        result = small_label("wynik", 0.34, GREEN).move_to([2.0, 1.03, 0])
        a1 = Arrow(degree.get_bottom(), expr.get_center()+LEFT*1.08+UP*0.34, color=ACCENT, buff=0.12, stroke_width=3, tip_length=0.14)
        a2 = Arrow(radicand.get_top(), expr.get_center()+LEFT*0.05+DOWN*0.10, color=SECONDARY, buff=0.12, stroke_width=3, tip_length=0.14)
        a3 = Arrow(result.get_bottom(), expr.get_center()+RIGHT*1.66+UP*0.02, color=GREEN, buff=0.12, stroke_width=3, tip_length=0.14)
        check = mtex(r"b^n=a", 0.78, SECONDARY).next_to(expr, DOWN, buff=1.15)
        stage_figure(self, VGroup(expr, degree, radicand, result, a1, a2, a3, check),
            question="Pierwiastek ma trzy role do rozpoznania.",
            caption="Czytamy zapis od stopnia, przez liczbę podpierwiastkową, do sprawdzenia potęgą.",
            reveal=[
                [Write(expr)],
                [FadeIn(degree), Create(a1)],
                [FadeIn(radicand), Create(a2)],
                [FadeIn(result), Create(a3)],
                [Write(check)],
            ])`,
    {
      title: "Elementy zapisu pierwiastka",
      still: "root notation with degree radicand result labels",
      standalone: true,
      durationSeconds: 38,
      narration:
        "Teraz zapis formalny. W pierwiastku stopień mówi, do jakiej potęgi będziemy sprawdzać wynik. Liczba pod pierwiastkiem mówi, co ma wyjść po tej potędze. Wynik oznaczamy literą b. Cały zapis czytamy więc tak: b jest pierwiastkiem stopnia n z a wtedy, gdy b do potęgi n daje a."
    }
  ),
  scene(
    "definition",
    2,
    5,
    "RootsEvenDefinition",
    "DEFINICJA",
    "stage_model",
    `        c1 = VGroup(small_label("stopień parzysty", 0.34, ACCENT), mtex(r"n=2,4,6,\\ldots", 0.50, FOREGROUND)).arrange(DOWN, buff=0.22)
        c2 = VGroup(small_label("wejście", 0.34, MUTED), mtex(r"a\\ge0", 0.72, SECONDARY)).arrange(DOWN, buff=0.22)
        c3 = VGroup(small_label("wynik", 0.34, MUTED), mtex(r"b\\ge0", 0.72, GREEN)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Przy parzystym stopniu kontrolujemy znak przed liczeniem i po liczeniu.")`,
    {
      title: "Definicja pierwiastka parzystego stopnia",
      still: "even root definition cards showing n even, a nonnegative, b nonnegative",
      durationSeconds: 36,
      narration:
        "Dla stopnia parzystego definicja ma dwa zabezpieczenia. Liczba pod pierwiastkiem musi być nieujemna, bo parzysta potęga nie da liczby ujemnej. Wynik też jest nieujemny, bo symbol pierwiastka oznacza jedną konkretną wartość, a nie dwie odpowiedzi równania. Dlatego czwarty pierwiastek z szesnastu jest równy dwa, a nie plus minus dwa."
    }
  ),
  scene(
    "definition",
    3,
    5,
    "RootsOddDefinition",
    "DEFINICJA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-5, 5, 1], length=9.8, include_numbers=True, color=MUTED)
        left = Dot(axis.n2p(-3), radius=0.1, color=SECONDARY)
        right = Dot(axis.n2p(3), radius=0.1, color=ACCENT)
        left_tex = mtex(r"(-3)^5=-243", 0.54, SECONDARY).next_to(left, UP, buff=0.34)
        right_tex = mtex(r"3^5=243", 0.54, ACCENT).next_to(right, UP, buff=0.34)
        neg_root = mtex(r"\\sqrt[5]{-243}=-3", 0.62, SECONDARY).next_to(axis, DOWN, buff=0.62)
        pos_root = mtex(r"\\sqrt[5]{243}=3", 0.62, ACCENT).next_to(neg_root, RIGHT, buff=0.8)
        stage_figure(self, VGroup(axis, left, right, left_tex, right_tex, neg_root, pos_root),
            question="Nieparzysty stopień działa po obu stronach osi.",
            caption="Liczba ujemna pod pierwiastkiem nieparzystym daje ujemny wynik.",
            reveal=[
                [Create(axis)],
                [FadeIn(left), Write(left_tex)],
                [FadeIn(right), Write(right_tex)],
                [Write(neg_root), Write(pos_root)],
            ])`,
    {
      title: "Definicja pierwiastka nieparzystego stopnia",
      still: "odd fifth power preserving sign on both sides of axis",
      standalone: true,
      durationSeconds: 38,
      narration:
        "Dla stopnia nieparzystego nie ma takiej blokady po lewej stronie osi. Ujemna liczba podniesiona do nieparzystej potęgi zostaje ujemna, a dodatnia zostaje dodatnia. Dlatego piąty pierwiastek z minus dwieście czterdzieści trzy istnieje i jest równy minus trzy. Znak wyniku idzie razem ze znakiem liczby podpierwiastkowej."
    }
  ),
  scene(
    "definition",
    4,
    5,
    "RootsPowerRule",
    "DEFINICJA",
    "stage_model",
    `        c1 = VGroup(small_label("n parzyste", 0.34, ACCENT), mtex(r"\\sqrt[n]{a^n}=|a|", 0.56, FOREGROUND), mtex(r"\\sqrt[4]{(-3)^4}=3", 0.46, SECONDARY)).arrange(DOWN, buff=0.18)
        c2 = VGroup(small_label("n nieparzyste", 0.34, SECONDARY), mtex(r"\\sqrt[n]{a^n}=a", 0.56, FOREGROUND), mtex(r"\\sqrt[5]{(-3)^5}=-3", 0.46, ACCENT)).arrange(DOWN, buff=0.18)
        stage_model(self, cards=[c1, c2], tagline="Pierwiastek parzysty potrzebuje wartości bezwzględnej. Nieparzysty zachowuje znak.")`,
    {
      title: "Pierwiastek z n-tej potęgi",
      still: "two rule cards contrasting even absolute value and odd signed result",
      standalone: true,
      short: "Tu najczęściej znika wartość bezwzględna.",
      durationSeconds: 38,
      narration:
        "Najważniejszy wzór tej części dotyczy pierwiastka z n tej potęgi. Jeśli stopień jest parzysty, wynik musi być nieujemny, więc dostajemy wartość bezwzględną z podstawy. Czwarty pierwiastek z minus trzy do czwartej potęgi daje trzy. Jeśli stopień jest nieparzysty, znak zostaje zachowany, więc piąty pierwiastek z minus trzy do piątej potęgi daje minus trzy."
    }
  ),
  scene(
    "definition",
    5,
    5,
    "RootsProductQuotientRules",
    "DEFINICJA",
    "stage_card",
    `        stage_card(self,
            centerpiece=r"\\sqrt[n]{a\\cdot b}=\\sqrt[n]{a}\\cdot\\sqrt[n]{b}",
            strip=r"\\sqrt[3]{2}\\cdot\\sqrt[3]{128}=\\sqrt[3]{256}=4",
            caption="Wzory na iloczyn i iloraz stosujemy dopiero po sprawdzeniu warunków.")`,
    {
      title: "Pierwiastek z iloczynu i ilorazu",
      still: "product rule for roots with numeric strip",
      durationSeconds: 38,
      narration:
        "Wzory na pierwiastek z iloczynu i ilorazu działają bardzo podobnie do zwykłego pakowania czynników pod jeden znak pierwiastka. Jeśli stopnie są takie same, możemy połączyć liczby pod jednym pierwiastkiem albo rozdzielić jeden pierwiastek na dwa. Przy stopniu parzystym trzeba jednak pilnować, żeby liczby pod pierwiastkami były nieujemne, a przy ilorazie mianownik nie może być zerem."
    }
  )
];

const why: AuthoredScene[] = [
  scene(
    "why_it_works",
    1,
    4,
    "RootsWhyEvenNoNegative",
    "DLACZEGO TO DZIAŁA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-4, 4, 1], length=9.2, include_numbers=True, color=MUTED)
        dots = VGroup()
        arrows = VGroup()
        for x, col in [(-3, SECONDARY), (-2, SECONDARY), (-1, SECONDARY), (1, ACCENT), (2, ACCENT), (3, ACCENT)]:
            dot = Dot(axis.n2p(x), radius=0.075, color=col)
            target = [axis.n2p(x)[0], 1.45, 0]
            arrows.add(Arrow(dot.get_top()+UP*0.05, target, color=col, stroke_width=2.8, tip_length=0.12))
            dots.add(dot)
        floor = NumberLine(x_range=[0, 10, 2], length=8.0, include_numbers=True, color=MUTED).shift(UP*1.45)
        zero_wall = Line(floor.n2p(0)+DOWN*0.35, floor.n2p(0)+UP*0.7, color=RED, stroke_width=5)
        label = mtex(r"x^2\\ge0", 0.76, FOREGROUND).next_to(floor, UP, buff=0.42)
        bad = mtex(r"\\sqrt[4]{-16}", 0.66, RED).next_to(axis, DOWN, buff=0.62)
        stage_figure(self, VGroup(axis, dots, arrows, floor, zero_wall, label, bad),
            question="Parzysta potęga nigdy nie ląduje poniżej zera.",
            caption="Dlatego parzysty pierwiastek z liczby ujemnej nie istnieje w R.",
            reveal=[
                [Create(axis), FadeIn(dots)],
                [LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.08), Create(floor), Create(zero_wall)],
                [Write(label)],
                [Write(bad)],
            ])`,
    {
      title: "Dlaczego parzysty pierwiastek z liczby ujemnej nie istnieje",
      still: "even powers landing only on nonnegative side",
      standalone: true,
      durationSeconds: 40,
      narration:
        "Teraz uzasadnienie, które ratuje dużo punktów. Każda liczba rzeczywista podniesiona do potęgi parzystej daje wynik nieujemny. Liczba dodatnia daje dodatni wynik, liczba ujemna też daje dodatni wynik, a zero daje zero. Nie ma więc liczby rzeczywistej, której czwarta potęga da minus szesnaście. Dlatego czwarty pierwiastek z minus szesnastu nie istnieje w zbiorze liczb rzeczywistych."
    }
  ),
  scene(
    "why_it_works",
    2,
    4,
    "RootsWhySimilarTerms",
    "DLACZEGO TO DZIAŁA",
    "stage_figure",
    `        left = VGroup(mtex(r"\\sqrt[3]{54}", 0.58, FOREGROUND), mtex(r"=3\\sqrt[3]{2}", 0.58, ACCENT)).arrange(DOWN, buff=0.25)
        mid = VGroup(mtex(r"\\sqrt[3]{16}", 0.58, FOREGROUND), mtex(r"=2\\sqrt[3]{2}", 0.58, ACCENT)).arrange(DOWN, buff=0.25)
        right = VGroup(mtex(r"\\sqrt[3]{250}", 0.58, FOREGROUND), mtex(r"=5\\sqrt[3]{2}", 0.58, ACCENT)).arrange(DOWN, buff=0.25)
        blocks = VGroup(left, mid, right).arrange(RIGHT, buff=1.0)
        common = mtex(r"\\sqrt[3]{2}", 0.82, SECONDARY).next_to(blocks, DOWN, buff=0.75)
        brace = Brace(blocks, DOWN, color=SECONDARY)
        stage_figure(self, VGroup(blocks, brace, common),
            question="Pierwiastki podobne trzeba najpierw odsłonić.",
            caption="Dopiero po uproszczeniu widać, które składniki mają ten sam rdzeń.",
            reveal=[
                [FadeIn(left, shift=0.12*UP)],
                [FadeIn(mid, shift=0.12*UP)],
                [FadeIn(right, shift=0.12*UP)],
                [GrowFromCenter(brace), Write(common)],
            ])`,
    {
      title: "Dlaczego najpierw upraszczamy składniki",
      still: "three cube roots becoming similar roots",
      durationSeconds: 38,
      narration:
        "Przy dodawaniu pierwiastków często nie widać od razu, czy składniki są podobne. Sześcienny pierwiastek z pięćdziesięciu czterech, z szesnastu i z dwustu pięćdziesięciu wyglądają inaczej. Po wyciągnięciu pełnych sześcianów każdy z nich ma jednak ten sam rdzeń: pierwiastek trzeciego stopnia z dwóch. Dopiero wtedy wolno dodawać współczynniki stojące przed pierwiastkiem."
    }
  ),
  scene(
    "why_it_works",
    3,
    4,
    "RootsWhyRationalize",
    "DLACZEGO TO DZIAŁA",
    "stage_figure",
    `        slots = VGroup()
        for txt, col in [("2", ACCENT), ("_", MUTED), ("_", MUTED)]:
            box = Square(side_length=0.68, stroke_width=2.5, stroke_color=MUTED, fill_color=col, fill_opacity=0.24)
            lab = small_label(txt, 0.36, FOREGROUND if txt != "_" else MUTED).move_to(box)
            slots.add(VGroup(box, lab))
        slots.arrange(RIGHT, buff=0)
        need = mtex(r"\\sqrt[3]{2}\\cdot\\sqrt[3]{2^2}=\\sqrt[3]{2^3}=2", 0.62, FOREGROUND).next_to(slots, UP, buff=0.85)
        fill = VGroup(small_label("2", 0.36, ACCENT), small_label("2", 0.36, ACCENT)).arrange(RIGHT, buff=0.38).move_to(slots[1:].get_center())
        frac = mtex(r"\\frac{12}{\\sqrt[3]{2}}\\cdot\\frac{\\sqrt[3]{4}}{\\sqrt[3]{4}}", 0.62, SECONDARY).next_to(slots, DOWN, buff=0.7)
        stage_figure(self, VGroup(need, slots, fill, frac),
            question="Usuwanie niewymierności to dopełnianie paczki.",
            caption="W mianowniku ma powstać pełna potęga stopnia n.",
            reveal=[
                [Write(need)],
                [FadeIn(slots)],
                [FadeIn(fill, shift=0.12*UP)],
                [Write(frac)],
            ])`,
    {
      title: "Dlaczego mnożymy przez czynnik dopełniający",
      still: "three slots showing denominator completion for cube root",
      standalone: true,
      durationSeconds: 38,
      narration:
        "Usuwanie niewymierności z mianownika też jest tylko grupowaniem. Jeśli w mianowniku stoi pierwiastek trzeciego stopnia z dwóch, to mamy jedną dwójkę z potrzebnych trzech. Brakuje dwóch dwójek. Dlatego mnożymy licznik i mianownik przez pierwiastek trzeciego stopnia z czterech, czyli z dwóch do kwadratu. W mianowniku powstaje pełny sześcian, więc pierwiastek znika."
    }
  ),
  scene(
    "why_it_works",
    4,
    4,
    "RootsWhyCommonDegree",
    "DLACZEGO TO DZIAŁA",
    "stage_model",
    `        c1 = VGroup(small_label("pierwiastek 3 stopnia", 0.32, ACCENT), mtex(r"\\sqrt[3]{3}=\\sqrt[12]{3^4}", 0.48, FOREGROUND)).arrange(DOWN, buff=0.22)
        c2 = VGroup(small_label("pierwiastek 4 stopnia", 0.32, SECONDARY), mtex(r"\\sqrt[4]{5}=\\sqrt[12]{5^3}", 0.48, FOREGROUND)).arrange(DOWN, buff=0.22)
        c3 = VGroup(small_label("wspólny stopień", 0.32, MUTED), mtex(r"NWW(3,4)=12", 0.56, GREEN)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Porównywanie różnych stopni działa jak wspólny mianownik.")`,
    {
      title: "Dlaczego sprowadzamy do wspólnego stopnia",
      still: "different root degrees converted to twelfth roots",
      durationSeconds: 38,
      narration:
        "Gdy pierwiastki mają różne stopnie, nie porównujemy ich na oko. Sprowadzamy je do wspólnego stopnia, podobnie jak ułamki do wspólnego mianownika. Dla stopni trzy i cztery wspólnym stopniem jest dwanaście. Pierwiastek trzeciego stopnia zamieniamy na dwunasty przez podniesienie liczby pod pierwiastkiem do czwartej potęgi, a pierwiastek czwartego stopnia przez potęgę trzecią."
    }
  )
];

const summary: AuthoredScene[] = [
  scene(
    "summary",
    1,
    3,
    "RootsSummaryChecks",
    "PODSUMOWANIE",
    "stage_model",
    `        c1 = VGroup(small_label("1", 0.34, ACCENT), mtex(r"n\\ \\text{parzyste?}", 0.48, FOREGROUND)).arrange(DOWN, buff=0.22)
        c2 = VGroup(small_label("2", 0.34, SECONDARY), mtex(r"a<0?", 0.64, FOREGROUND)).arrange(DOWN, buff=0.22)
        c3 = VGroup(small_label("3", 0.34, GREEN), mtex(r"k\\sqrt[n]{b}", 0.54, FOREGROUND)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Każde zadanie zaczyna się od stopnia, znaku i pełnych potęg.")`,
    {
      title: "Trzy kontrole w każdym zadaniu",
      still: "three summary checks for roots",
      durationSeconds: 36,
      narration:
        "Podsumowanie zaczyna się od trzech kontroli. Najpierw sprawdzamy, czy stopień pierwiastka jest parzysty czy nieparzysty. Potem patrzymy na znak liczby podpierwiastkowej. Na końcu szukamy pełnych potęg, które można wyprowadzić przed znak pierwiastka. Ta kolejność usuwa większość typowych błędów."
    }
  ),
  scene(
    "summary",
    2,
    3,
    "RootsSummaryRules",
    "PODSUMOWANIE",
    "stage_model",
    `        c1 = VGroup(mtex(r"\\sqrt[2k]{a^{2k}}=|a|", 0.50, ACCENT), small_label("parzysty stopień", 0.30, MUTED)).arrange(DOWN, buff=0.22)
        c2 = VGroup(mtex(r"\\sqrt[2k+1]{a^{2k+1}}=a", 0.46, SECONDARY), small_label("nieparzysty stopień", 0.30, MUTED)).arrange(DOWN, buff=0.22)
        c3 = VGroup(mtex(r"\\sqrt[n]{k^n b}=k\\sqrt[n]{b}", 0.44, GREEN), small_label("pełne paczki", 0.30, MUTED)).arrange(DOWN, buff=0.22)
        stage_model(self, cards=[c1, c2, c3], tagline="Nie zapamiętuj wszystkiego osobno. Pilnuj, co robi stopień.")`,
    {
      title: "Najważniejsze wzory jako obrazy",
      still: "three formula cards for root rules",
      durationSeconds: 38,
      narration:
        "Najważniejsze wzory nie są osobnymi sztuczkami. Przy parzystym stopniu pojawia się wartość bezwzględna, bo wynik pierwiastka musi być nieujemny. Przy nieparzystym stopniu znak zostaje zachowany. Przy upraszczaniu pełna paczka n takich samych czynników wychodzi przed pierwiastek jako jeden czynnik."
    }
  ),
  scene(
    "summary",
    3,
    3,
    "RootsSummaryMatura",
    "PODSUMOWANIE",
    "stage_card",
    `        stage_card(self,
            centerpiece=r"\\sqrt[n]{a}=b\\iff b^n=a",
            strip=r"n\\ \\text{parzyste}:\\ b\\ge0\\qquad n\\ \\text{nieparzyste}:\\ znak\\ zostaje",
            caption="Na maturze najpierw sprawdź sens pierwiastka, dopiero potem licz.")`,
    {
      title: "Ostatni obraz przed zadaniami",
      still: "root as a power-check equivalence",
      standalone: true,
      short: "Pierwiastek zawsze sprawdzaj potęgą.",
      durationSeconds: 36,
      narration:
        "Ostatni obraz jest najprostszy. Pierwiastek zawsze sprawdzamy potęgą. Jeśli b jest pierwiastkiem stopnia n z a, to b do potęgi n ma dać a. Przy stopniu parzystym dodatkowo wynik musi być nieujemny. Przy stopniu nieparzystym wynik może być ujemny i wtedy znak normalnie zostaje. To jest filtr, który warto uruchomić w głowie przed każdym przykładem maturalnym."
    }
  )
];

const exValues: ExampleAuthoring = {
  sourceId: "g-th-00",
  className: "RootsExampleValues",
  sceneLabel: "PRZYKŁAD 1 / 3",
  durationSeconds: 24,
  ex: {
    label: "PRZYKŁAD 1 / 3",
    source_id: "g-th-00",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "compute-3", "compute-4", "result", "insight"],
    statement: "Oblicz: a) ∛(-64), b) ⁴√625.",
    highlights: ["∛(-64)", "⁴√625"],
    sought: ["a", "b"],
    plan_formula: "\\sqrt[3]{-64},\\quad \\sqrt[4]{625}",
    plan_note: "Najpierw stopień i znak, potem sprawdzenie potęgą.",
    computes: [
      {kind: "arith", line: "\\sqrt[3]{-64}=-\\sqrt[3]{64}", note: "Stopień 3 jest nieparzysty, więc minus może zostać w wyniku."},
      {kind: "arith", line: "64=4^3\\Rightarrow \\sqrt[3]{-64}=-4", note: "Cztery do trzeciej potęgi daje sześćdziesiąt cztery."},
      {kind: "arith", line: "\\sqrt[4]{625}\\quad \\text{ma wynik}\\ge0", note: "Stopień 4 jest parzysty, więc wynik nie może być ujemny."},
      {kind: "arith", line: "625=5^4\\Rightarrow \\sqrt[4]{625}=5", note: "Pięć do czwartej potęgi daje sześćset dwadzieścia pięć."}
    ],
    answer_tex: "a=-4,\\quad b=5",
    answer_sentence: "Odpowiedzi to a = -4 oraz b = 5.",
    insight: "Ten sam symbol pierwiastka inaczej zachowuje znak przy stopniu parzystym i nieparzystym.",
    include_insight: true,
    narrations: {
      present:
        "Pierwszy przykład jest po to, żeby od razu rozdzielić dwa światy: stopień nieparzysty i stopień parzysty. Mamy obliczyć pierwiastek trzeciego stopnia z minus sześćdziesięciu czterech oraz pierwiastek czwartego stopnia z sześciuset dwudziestu pięciu.",
      restate:
        "Szukamy dwóch konkretnych liczb. W pierwszym podpunkcie liczba pod pierwiastkiem jest ujemna, ale stopień jest nieparzysty. W drugim podpunkcie stopień jest parzysty, a liczba pod pierwiastkiem dodatnia.",
      plan:
        "Plan ma dwa kroki. Najpierw patrzymy na stopień i znak, żeby wiedzieć, czy pierwiastek istnieje i jaki znak może mieć wynik. Potem sprawdzamy kandydatów przez podniesienie do odpowiedniej potęgi.",
      "compute-1":
        "Stopień trzy jest nieparzysty. Minus pod pierwiastkiem jest dozwolony, więc wynik będzie ujemny: minus pierwiastek trzeciego stopnia z sześćdziesięciu czterech.",
      "compute-2":
        "Sześćdziesiąt cztery to cztery do trzeciej potęgi. Dlatego minus cztery do trzeciej daje minus sześćdziesiąt cztery.",
      "compute-3":
        "W podpunkcie b stopień cztery jest parzysty. Wynik pierwiastka arytmetycznego musi być nieujemny, więc nie zapisujemy plus minus pięć.",
      "compute-4":
        "Sześćset dwadzieścia pięć to pięć do czwartej potęgi. Ponieważ pięć jest nieujemne, czwarty pierwiastek z sześciuset dwudziestu pięciu jest równy pięć.",
      result:
        "Odpowiedzi są dwie: w podpunkcie a minus cztery, a w podpunkcie b pięć.",
      insight:
        "Wniosek jest ważniejszy niż same liczby. Przy stopniu nieparzystym znak liczby pod pierwiastkiem przechodzi do wyniku. Przy stopniu parzystym symbol pierwiastka wybiera wynik nieujemny."
    }
  }
};

const exSimplify: ExampleAuthoring = {
  sourceId: "g-th-01",
  className: "RootsExampleSimplify",
  sceneLabel: "PRZYKŁAD 2 / 3",
  durationSeconds: 24,
  ex: {
    label: "PRZYKŁAD 2 / 3",
    source_id: "g-th-01",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "result", "insight"],
    statement: "Wyłącz czynnik przed znak pierwiastka: ∛40.",
    highlights: ["∛40"],
    sought: ["postać najprostsza"],
    plan_formula: "\\sqrt[3]{40}",
    plan_note: "Pod pierwiastkiem trzeciego stopnia szukamy pełnych sześcianów.",
    computes: [
      {kind: "arith", line: "40=2^3\\cdot5", note: "Rozkład odsłania jedną pełną paczkę trzech dwójek."},
      {kind: "arith", line: "\\sqrt[3]{40}=\\sqrt[3]{2^3\\cdot5}=2\\sqrt[3]{5}", note: "Pełny sześcian wychodzi przed pierwiastek jako dwójka."}
    ],
    answer_tex: "2\\sqrt[3]{5}",
    answer_sentence: "Postać najprostsza to 2∛5.",
    insight: "Nie przybliżamy pierwiastka. Zostawiamy dokładną najprostszą postać.",
    include_insight: true,
    narrations: {
      present:
        "Drugi przykład pokazuje najważniejszy ruch techniczny: wyłączanie czynnika przed pierwiastek. Mamy uprościć pierwiastek trzeciego stopnia z czterdziestu.",
      restate:
        "Szukamy postaci najprostszej. To nie znaczy, że mamy liczyć przybliżenie dziesiętne. Chcemy znaleźć pełne sześciany ukryte pod pierwiastkiem i wyprowadzić je przed znak pierwiastka.",
      plan:
        "Ponieważ stopień pierwiastka wynosi trzy, szukamy grup po trzy takie same czynniki. Najbezpieczniej jest rozłożyć czterdzieści na czynniki pierwsze.",
      "compute-1":
        "Czterdzieści zapisujemy jako dwa do trzeciej potęgi razy pięć. To pokazuje jedną pełną paczkę trzech dwójek i jedną piątkę, która nie tworzy pełnego sześcianu.",
      "compute-2":
        "Pierwiastek trzeciego stopnia z dwa do trzeciej potęgi daje dwa. Piątka zostaje pod pierwiastkiem.",
      result:
        "Odpowiedź to dwa pierwiastki trzeciego stopnia z pięciu.",
      insight:
        "Ten przykład pokazuje, że uproszczenie nie polega na usunięciu pierwiastka za wszelką cenę. Chodzi o to, żeby pod pierwiastkiem nie została żadna pełna potęga stopnia trzy."
    }
  }
};

const exRules: ExampleAuthoring = {
  sourceId: "g-th-02",
  className: "RootsExampleRules",
  sceneLabel: "PRZYKŁAD 3 / 3",
  durationSeconds: 24,
  ex: {
    label: "PRZYKŁAD 3 / 3",
    source_id: "g-th-02",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "compute-3", "result", "insight"],
    statement: "Oblicz: a) ⁴√2 · ⁴√128, b) √(∛64).",
    highlights: ["⁴√2 · ⁴√128", "√(∛64)"],
    sought: ["a", "b"],
    plan_formula: "\\sqrt[4]{2}\\cdot\\sqrt[4]{128},\\quad \\sqrt{\\sqrt[3]{64}}",
    plan_note: "Łączymy pierwiastki tego samego stopnia albo mnożymy stopnie zagnieżdżonych pierwiastków.",
    computes: [
      {kind: "arith", line: "\\sqrt[4]{2}\\cdot\\sqrt[4]{128}=\\sqrt[4]{256}", note: "Ten sam stopień pozwala połączyć liczby pod jednym pierwiastkiem."},
      {kind: "arith", line: "256=4^4\\Rightarrow \\sqrt[4]{256}=4", note: "Cztery do czwartej potęgi daje dwieście pięćdziesiąt sześć."},
      {kind: "arith", line: "\\sqrt{\\sqrt[3]{64}}=\\sqrt{4}=2", note: "Najpierw pierwiastek trzeciego stopnia z sześćdziesięciu czterech daje cztery."}
    ],
    answer_tex: "a=4,\\quad b=2",
    answer_sentence: "Odpowiedzi to a = 4 oraz b = 2.",
    insight: "Własności pierwiastków są bezpieczne wtedy, gdy sprawdzamy stopnie i warunki.",
    include_insight: true,
    narrations: {
      present:
        "Trzeci przykład zbiera własności pierwiastków. W podpunkcie a mamy iloczyn pierwiastków czwartego stopnia. W podpunkcie b mamy pierwiastek z pierwiastka.",
      restate:
        "Szukamy dwóch wartości. Pierwszy zapis wygląda niewygodnie, ale oba pierwiastki mają ten sam stopień. Drugi zapis jest zagnieżdżony, więc trzeba zdecydować, czy liczyć od środka, czy użyć wzoru na pierwiastek z pierwiastka.",
      plan:
        "W podpunkcie a połączymy pierwiastki czwartego stopnia pod jednym znakiem. W podpunkcie b najprościej policzyć środek, bo pierwiastek trzeciego stopnia z sześćdziesięciu czterech jest liczbą całkowitą.",
      "compute-1":
        "Łączymy liczby pod pierwiastkiem: dwa razy sto dwadzieścia osiem daje dwieście pięćdziesiąt sześć. Zostaje jeden pierwiastek czwartego stopnia.",
      "compute-2":
        "Dwieście pięćdziesiąt sześć to cztery do czwartej potęgi, więc pierwiastek czwartego stopnia z dwustu pięćdziesięciu sześciu jest równy cztery.",
      "compute-3":
        "W drugim podpunkcie najpierw liczymy pierwiastek trzeciego stopnia z sześćdziesięciu czterech. To jest cztery. Potem pierwiastek kwadratowy z czterech daje dwa.",
      result:
        "Odpowiedzi to cztery w podpunkcie a oraz dwa w podpunkcie b.",
      insight:
        "Najważniejsze jest to, żeby nie stosować wzorów mechanicznie. Zawsze patrzymy na stopnie, na znaki i na to, czy prostsze jest połączenie pierwiastków, czy policzenie środka."
    }
  }
};

export const pierwiastkiDowolnegoStopnia: SectionAuthoring = {
  slug: "pierwiastki-dowolnego-stopnia",
  topic: "Pierwiastki dowolnego stopnia",
  authored: [...hook, ...intuition, ...definition, ...why, ...summary],
  examples: [exValues, exSimplify, exRules],
  thumbnail: {
    filename: "thumbnail-1.png",
    py: `from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class ThumbnailScene(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA",
            headline="PIERWIASTKI\\nDOWOLNEGO STOPNIA",
            formula=r"\\sqrt[4]{(-3)^4}=3\\neq -3",
        )
`
  },
  thumbnailVariants: [
    {
      filename: "thumbnail-2.png",
      py: `from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class ThumbnailScene(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA",
            headline="BEZ TEGO\\nMATURA TO\\nLOTERIA",
            formula=r"\\sqrt[n]{a^n}=|a|\\ ?",
        )
`
    },
    {
      filename: "thumbnail-3.png",
      py: `from manim import *
from support.style import LessonScene
from support.thumbnail import stage_thumbnail


class ThumbnailScene(LessonScene):
    def construct(self):
        stage_thumbnail(
            self,
            kicker="MATURA",
            headline="MATURA\\nNIE WYBACZA\\nTEGO BŁĘDU",
            formula=r"\\sqrt[4]{81}=3\\quad\\text{nie}\\quad \\pm3",
        )
`
    }
  ]
};

import type {AuthoredScene, ExampleAuthoring, SectionAuthoring} from "./types";
import type {BandType} from "../skeletons";

const HDR = `import numpy as np
from manim import *
from support.style import LessonScene, FONT, mtex, small_label, statement, body
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
    "AbsHookDistance",
    "WPROWADZENIE",
    "stage_figure",
    `        axis = NumberLine(x_range=[-8, 8, 2], length=10.5, include_numbers=True, color=MUTED)
        zero = Dot(axis.n2p(0), radius=0.10, color=FOREGROUND)
        left = Dot(axis.n2p(-5), radius=0.12, color=SECONDARY)
        right = Dot(axis.n2p(5), radius=0.12, color=ACCENT)
        lab_left = small_label("-5", 0.38, SECONDARY).next_to(left, UP, buff=0.2)
        lab_zero = small_label("0", 0.34, FOREGROUND).next_to(zero, DOWN, buff=0.25)
        lab_right = small_label("5", 0.38, ACCENT).next_to(right, UP, buff=0.2)
        left_arc = CurvedArrow(axis.n2p(0)+UP*0.35, axis.n2p(-5)+UP*0.35, angle=TAU/8, color=SECONDARY, stroke_width=4, tip_length=0.16)
        right_arc = CurvedArrow(axis.n2p(0)+UP*0.35, axis.n2p(5)+UP*0.35, angle=-TAU/8, color=ACCENT, stroke_width=4, tip_length=0.16)
        distance = mtex(r"|{-5}|=5\\quad\\text{i}\\quad |5|=5", 0.62, FOREGROUND).next_to(axis, DOWN, buff=0.75)
        stage_figure(self, VGroup(axis, zero, left, right, lab_left, lab_zero, lab_right, left_arc, right_arc, distance),
            question="Wartość bezwzględna to odległość od zera.",
            caption="Znak liczby może być inny, ale odległość jest taka sama.",
            reveal=[
                [Create(axis), FadeIn(zero), FadeIn(lab_zero)],
                [FadeIn(left), FadeIn(right), FadeIn(lab_left), FadeIn(lab_right)],
                [Create(left_arc), Create(right_arc)],
                [Write(distance)],
            ])`,
    {
      title: "Hook: moduł jako odległość",
      still: "number line with -5 and 5 equally distant from zero",
      standalone: true,
      short: "Moduł to odległość, nie kasowanie minusa.",
      durationSeconds: 38,
      narration:
        "Cześć. W tym odcinku spokojnie przejdziemy przez wartość bezwzględną. Najważniejszy obraz jest bardzo prosty: moduł to odległość na osi liczbowej. Liczba minus pięć i liczba pięć leżą po dwóch stronach zera, ale obie są oddalone od zera o pięć jednostek. Dlatego wartość bezwzględna nie pyta najpierw, czy liczba jest dodatnia czy ujemna. Ona pyta, jak daleko jesteśmy od punktu odniesienia. Jeśli ten obraz masz w głowie, równania z modułem przestają wyglądać jak sztuczka ze znakami."
    }
  ),
  scene(
    "hook",
    2,
    2,
    "AbsHookPipeline",
    "WPROWADZENIE",
    "stage_model",
    `        c1 = VGroup(small_label("obraz", 0.34, MUTED), mtex(r"|x|=d(x,0)", 0.58, ACCENT)).arrange(DOWN, buff=0.25)
        c2 = VGroup(small_label("definicja", 0.34, MUTED), mtex(r"|x|=x\\ \\text{albo}\\ -x", 0.50, FOREGROUND)).arrange(DOWN, buff=0.25)
        c3 = VGroup(small_label("równanie", 0.34, MUTED), mtex(r"|x-a|=r", 0.72, SECONDARY)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Najpierw widzimy odległość, potem dopiero rozbijamy przypadki.")`,
    {
      title: "Plan lekcji: obraz, definicja, równania",
      still: "three cards: distance, definition, equation",
      standalone: true,
      durationSeconds: 36,
      narration:
        "Plan lekcji będzie uporządkowany. Najpierw ustawimy obraz geometryczny, czyli odległość od zera i od dowolnego punktu na osi. Potem zapiszemy definicję algebraiczną, bo ona tłumaczy, kiedy zostawiamy wyrażenie bez zmian, a kiedy zmieniamy znak całego wyrażenia. Na końcu przejdziemy do równań. Zobaczysz przypadek dwóch rozwiązań, jednego rozwiązania, braku rozwiązań, oraz zadania, w którym odległość i środek odcinka trzeba policzyć z osi."
    }
  )
];

const intuition: AuthoredScene[] = [
  scene(
    "intuition",
    1,
    4,
    "AbsMirrorAxis",
    "INTUICJA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-7, 7, 1], length=10.6, include_numbers=True, color=MUTED)
        pairs = VGroup()
        for x, col in [(-6, SECONDARY), (-3, SECONDARY), (3, ACCENT), (6, ACCENT)]:
            dot = Dot(axis.n2p(x), radius=0.08, color=col)
            lab = small_label(str(x), 0.28, col).next_to(dot, UP if x in [-6, 3] else DOWN, buff=0.18)
            pairs.add(dot, lab)
        mirror = DashedLine(axis.n2p(0)+DOWN*0.85, axis.n2p(0)+UP*1.25, color=FOREGROUND, stroke_width=3)
        label = mtex(r"|{-3}|=|3|=3", 0.66, FOREGROUND).next_to(axis, DOWN, buff=0.8)
        stage_figure(self, VGroup(axis, pairs, mirror, label),
            question="Moduł składa oś jak lustro.",
            caption="Punkty symetryczne względem zera mają ten sam moduł.",
            reveal=[
                [Create(axis), Create(mirror)],
                [LaggedStart(*[FadeIn(m, shift=0.10*UP) for m in pairs], lag_ratio=0.12)],
                [Write(label)],
            ])`,
    {
      title: "Moduł jako odbicie względem zera",
      still: "symmetric points on a number line",
      standalone: true,
      durationSeconds: 36,
      narration:
        "Najpierw popatrz na moduł jak na złożenie osi wzdłuż zera. Punkt minus trzy po złożeniu trafia w to samo miejsce co punkt trzy, bo oba są trzy jednostki od zera. To samo dzieje się z minus sześć i sześć. Ten obraz wyjaśnia, dlaczego równanie z modułem często daje dwa rozwiązania. Jeśli pytasz o odległość, możesz iść w prawo albo w lewo."
    }
  ),
  scene(
    "intuition",
    2,
    4,
    "AbsFromPoint",
    "INTUICJA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-2, 11, 1], length=10.4, include_numbers=False, color=MUTED)
        center = Dot(axis.n2p(6), radius=0.11, color=FOREGROUND)
        left = Dot(axis.n2p(4), radius=0.11, color=SECONDARY)
        right = Dot(axis.n2p(8), radius=0.11, color=ACCENT)
        brace_l = Brace(Line(axis.n2p(4), axis.n2p(6)), UP, color=SECONDARY)
        brace_r = Brace(Line(axis.n2p(6), axis.n2p(8)), UP, color=ACCENT)
        lab_c = small_label("środek: 6", 0.34, FOREGROUND).next_to(center, DOWN, buff=0.56)
        lab_l = small_label("x = 4", 0.34, SECONDARY).next_to(left, DOWN, buff=0.38)
        lab_r = small_label("x = 8", 0.34, ACCENT).next_to(right, DOWN, buff=0.38)
        d_l = small_label("2", 0.34, SECONDARY).next_to(brace_l, UP, buff=0.12)
        d_r = small_label("2", 0.34, ACCENT).next_to(brace_r, UP, buff=0.12)
        formula = mtex(r"|x-6|=2", 0.82, FOREGROUND).next_to(axis, DOWN, buff=0.75)
        stage_figure(self, VGroup(axis, center, left, right, brace_l, brace_r, lab_c, lab_l, lab_r, d_l, d_r, formula),
            question="|x - a| czytamy jako odległość x od a.",
            caption="Tutaj szukamy punktów odległych od 6 o 2.",
            reveal=[
                [Create(axis), FadeIn(center), FadeIn(lab_c)],
                [FadeIn(left), FadeIn(right), FadeIn(lab_l), FadeIn(lab_r)],
                [GrowFromCenter(brace_l), GrowFromCenter(brace_r), FadeIn(d_l), FadeIn(d_r)],
                [Write(formula)],
            ])`,
    {
      title: "Odległość od dowolnego punktu",
      still: "points 4 and 8 at distance 2 from 6",
      standalone: true,
      short: "Jedno równanie z modułem daje dwa punkty.",
      durationSeconds: 38,
      narration:
        "Teraz przesuwamy punkt odniesienia. Zapis wartość bezwzględna z x minus sześć oznacza odległość liczby x od liczby sześć. Jeśli ta odległość ma wynosić dwa, to na osi są dwa miejsca: dwa kroki w lewo, czyli cztery, oraz dwa kroki w prawo, czyli osiem. Nie trzeba jeszcze rozwiązywać równania. Wystarczy zobaczyć środek i promień."
    }
  ),
  scene(
    "intuition",
    3,
    4,
    "AbsRadiusCases",
    "INTUICJA",
    "stage_model",
    `        c1 = VGroup(small_label("r < 0", 0.34, RED), mtex(r"|x-a|=-2", 0.52, FOREGROUND), small_label("brak punktów", 0.30, MUTED)).arrange(DOWN, buff=0.18)
        c2 = VGroup(small_label("r = 0", 0.34, SECONDARY), mtex(r"|x-a|=0", 0.52, FOREGROUND), small_label("jeden punkt", 0.30, MUTED)).arrange(DOWN, buff=0.18)
        c3 = VGroup(small_label("r > 0", 0.34, GREEN), mtex(r"|x-a|=r", 0.52, FOREGROUND), small_label("dwa punkty", 0.30, MUTED)).arrange(DOWN, buff=0.18)
        stage_model(self, cards=[c1, c2, c3], tagline="O liczbie rozwiązań decyduje znak prawej strony.")`,
    {
      title: "Promień decyduje o liczbie rozwiązań",
      still: "three cases for radius negative zero positive",
      durationSeconds: 36,
      narration:
        "W równaniu z odległością prawa strona zachowuje się jak promień. Promień ujemny nie istnieje, więc moduł nie może być równy liczbie ujemnej. Promień zerowy daje jeden punkt, dokładnie w środku. Promień dodatni daje dwa punkty, po jednym z każdej strony środka. To jest szybki test, który warto zrobić przed każdym rozbijaniem modułu na przypadki."
    }
  ),
  scene(
    "intuition",
    4,
    4,
    "AbsWholeExpression",
    "INTUICJA",
    "stage_figure",
    `        expr = mtex(r"|x-5|", 1.05, FOREGROUND)
        whole = SurroundingRectangle(expr, color=ACCENT, buff=0.2, corner_radius=0.1)
        wrong = VGroup(mtex(r"x+5", 0.72, RED), Cross(mtex(r"x+5", 0.72, RED), stroke_color=RED, stroke_width=5)).arrange(RIGHT, buff=0.45)
        right = mtex(r"\\begin{cases}x-5,&x\\ge 5\\\\5-x,&x<5\\end{cases}", 0.62, SECONDARY)
        group = VGroup(VGroup(expr, whole), wrong, right).arrange(DOWN, buff=0.65)
        stage_figure(self, group,
            question="Jeśli zmieniasz znak, zmieniasz całe wyrażenie.",
            caption="Moduł nie zmienia pojedynczych minusów na plusy.",
            reveal=[
                [Write(expr), Create(whole)],
                [FadeIn(wrong)],
                [Write(right)],
            ])`,
    {
      title: "Znak zmienia całe wyrażenie",
      still: "absolute value expression boxed as one whole",
      durationSeconds: 38,
      narration:
        "Najczęstszy błąd brzmi: moduł po prostu usuwa minus. To jest za płytkie. Jeśli wyrażenie pod modułem jest ujemne, zmieniamy znak całego wyrażenia, nie pojedynczego symbolu. Dlatego wartość bezwzględna z x minus pięć jest równa x minus pięć tylko wtedy, gdy x jest co najmniej pięć. Gdy x jest mniejsze od pięciu, całe wyrażenie x minus pięć zmienia znak i dostajemy pięć minus x."
    }
  )
];

const definition: AuthoredScene[] = [
  scene(
    "definition",
    1,
    5,
    "AbsDefinitionPiecewise",
    "DEFINICJA",
    "stage_card",
    `        stage_card(self,
            centerpiece=r"|x|=\\begin{cases}x,&x\\ge 0\\\\-x,&x<0\\end{cases}",
            strip=r"|7|=7\\quad\\text{ale}\\quad |{-7}|=7",
            caption="Wynik modułu nigdy nie jest ujemny.")`,
    {
      title: "Definicja algebraiczna modułu",
      still: "piecewise definition of absolute value",
      standalone: true,
      durationSeconds: 36,
      narration:
        "Teraz zapis algebraiczny. Jeśli liczba lub wyrażenie pod modułem jest nieujemne, moduł niczego nie zmienia. Jeśli jest ujemne, moduł daje liczbę przeciwną. Zwróć uwagę na zapis minus x. On nie mówi, że wynik jest ujemny. Jeśli x było ujemne, to minus x jest dodatnie. Dlatego wynik wartości bezwzględnej nigdy nie schodzi poniżej zera."
    }
  ),
  scene(
    "definition",
    2,
    5,
    "AbsDistanceFormula",
    "DEFINICJA",
    "stage_derivation",
    `        stage_derivation(self, symbolic=[
            r"|x|=d(x,0)",
            r"|x-a|=d(x,a)",
            r"d(a,b)=|a-b|=|b-a|",
        ], caption="Kolejność odejmowania w odległości nie zmienia wyniku.")`,
    {
      title: "Wzory odległości na osi",
      still: "absolute value distance formulas",
      durationSeconds: 34,
      narration:
        "Najważniejsze czytanie geometryczne jest krótkie. Moduł z x to odległość x od zera. Moduł z x minus a to odległość x od a. Odległość między dwiema liczbami a i b możemy zapisać jako moduł z a minus b albo moduł z b minus a. Kolejność odejmowania nie ma znaczenia, bo odległość nie pamięta kierunku."
    }
  ),
  scene(
    "definition",
    3,
    5,
    "AbsEquationBasic",
    "DEFINICJA",
    "stage_card",
    `        stage_card(self,
            centerpiece=r"|x|=c\\iff x=c\\ \\lor\\ x=-c",
            annotations=[(r"c", "odległość od zera")],
            strip=r"c>0:\\ 2\\quad c=0:\\ 1\\quad c<0:\\ 0",
            caption="Zawsze najpierw sprawdź, czy prawa strona może być odległością.")`,
    {
      title: "Równanie |x| = c",
      still: "absolute value equation cases",
      durationSeconds: 34,
      narration:
        "Równanie moduł z x równa się c trzeba czytać: jakie liczby są w odległości c od zera. Jeżeli c jest dodatnie, mamy dwa rozwiązania, c oraz minus c. Jeżeli c jest równe zero, mamy jedno rozwiązanie, czyli x równe zero. Jeżeli c jest ujemne, nie ma rozwiązań. Odległość nie może być ujemna."
    }
  ),
  scene(
    "definition",
    4,
    5,
    "AbsEquationShifted",
    "DEFINICJA",
    "stage_card",
    `        stage_card(self,
            centerpiece=r"|x-a|=r\\iff x=a-r\\ \\lor\\ x=a+r",
            strip=r"|x-6|=2\\Rightarrow x=4\\ \\lor\\ x=8",
            caption="Dwa rozwiązania są symetryczne względem środka a.")`,
    {
      title: "Równanie |x - a| = r",
      still: "shifted absolute value equation formula",
      standalone: true,
      short: "Środek i promień dają rozwiązania bez stresu.",
      durationSeconds: 36,
      narration:
        "Najbardziej maturalna postać to moduł z x minus a równa się r. Liczba a jest środkiem, czyli punktem odniesienia na osi. Liczba r jest promieniem, czyli odległością. Rozwiązania są więc po lewej i po prawej stronie środka: a minus r oraz a plus r. W przykładzie z x minus sześć i promieniem dwa dostajemy cztery oraz osiem."
    }
  ),
  scene(
    "definition",
    5,
    5,
    "AbsTwoModules",
    "DEFINICJA",
    "stage_derivation",
    `        stage_derivation(self, symbolic=[
            r"|f(x)|=|g(x)|",
            r"f(x)=g(x)\\quad\\text{lub}\\quad f(x)=-g(x)",
            r"\\text{minus przed }g(x)\\text{ wymaga nawiasu}",
        ], caption="Dwa moduły po dwóch stronach dają dwie alternatywy.")`,
    {
      title: "Równanie |f(x)| = |g(x)|",
      still: "two absolute values split into alternatives",
      durationSeconds: 36,
      narration:
        "Gdy moduły stoją po obu stronach równania, porównujemy odległości od zera. Dwie liczby mają taki sam moduł wtedy, gdy są równe, albo gdy są przeciwne. Dlatego zapisujemy dwa równania: f od x równa się g od x, albo f od x równa się minus g od x. W drugim przypadku nawias jest obowiązkowy, bo minus dotyczy całego wyrażenia po prawej stronie."
    }
  )
];

const why: AuthoredScene[] = [
  scene(
    "why_it_works",
    1,
    4,
    "AbsWhyTwoSolutions",
    "DLACZEGO TO DZIAŁA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-1, 9, 1], length=10.4, include_numbers=True, color=MUTED)
        center = Dot(axis.n2p(4), radius=0.12, color=FOREGROUND)
        left = Dot(axis.n2p(1), radius=0.12, color=SECONDARY)
        right = Dot(axis.n2p(7), radius=0.12, color=ACCENT)
        left_arrow = Arrow(axis.n2p(4), axis.n2p(1), buff=0, color=SECONDARY, stroke_width=4, tip_length=0.18)
        right_arrow = Arrow(axis.n2p(4), axis.n2p(7), buff=0, color=ACCENT, stroke_width=4, tip_length=0.18)
        lab = mtex(r"|x-4|=3", 0.76, FOREGROUND).next_to(axis, DOWN, buff=0.72)
        stage_figure(self, VGroup(axis, center, left, right, left_arrow, right_arrow, lab),
            question="Dwie strony osi robią dwa przypadki.",
            caption="Od środka idziemy raz w lewo, raz w prawo.",
            reveal=[
                [Create(axis), FadeIn(center)],
                [GrowArrow(left_arrow), FadeIn(left)],
                [GrowArrow(right_arrow), FadeIn(right)],
                [Write(lab)],
            ])`,
    {
      title: "Dlaczego są dwa rozwiązania",
      still: "two directions from center on number line",
      durationSeconds: 36,
      narration:
        "Dlaczego pojawiają się dwa przypadki? Bo na osi z danego punktu możesz przejść o tę samą odległość w dwóch kierunkach. Od czterech o trzy jednostki w lewo trafiasz w jeden. Od czterech o trzy jednostki w prawo trafiasz w siedem. Algebraicznie są to równania x minus cztery równa się minus trzy oraz x minus cztery równa się trzy. Oba opisują tę samą odległość."
    }
  ),
  scene(
    "why_it_works",
    2,
    4,
    "AbsWhyNoNegative",
    "DLACZEGO TO DZIAŁA",
    "stage_figure",
    `        gauge = NumberLine(x_range=[0, 8, 1], length=8.2, include_numbers=True, color=MUTED)
        zero_wall = Line(gauge.n2p(0)+DOWN*0.45, gauge.n2p(0)+UP*0.9, color=RED, stroke_width=6)
        bad = mtex(r"|x+2|=-6", 0.82, RED).next_to(gauge, UP, buff=0.7)
        note = small_label("odległość zaczyna się od 0", 0.38, FOREGROUND).next_to(gauge, DOWN, buff=0.55)
        stage_figure(self, VGroup(gauge, zero_wall, bad, note),
            question="Moduł nie może dać wyniku ujemnego.",
            caption="Jeśli prawa strona jest ujemna, kończymy od razu.",
            reveal=[
                [Create(gauge), Create(zero_wall)],
                [Write(bad)],
                [FadeIn(note)],
            ])`,
    {
      title: "Dlaczego prawa strona musi być nieujemna",
      still: "distance scale blocked at zero",
      durationSeconds: 34,
      narration:
        "Odległość zaczyna się od zera. Nie ma odległości minus sześć, minus dwa, ani minus jedna druga. Dlatego równanie moduł z czegoś równa się liczba ujemna jest sprzeczne od razu. Nie rozbijamy go na dwa równania, bo rozbijanie ma sens dopiero wtedy, gdy prawa strona może być odległością."
    }
  ),
  scene(
    "why_it_works",
    3,
    4,
    "AbsWhyOneSolution",
    "DLACZEGO TO DZIAŁA",
    "stage_figure",
    `        axis = NumberLine(x_range=[-2, 8, 1], length=10, include_numbers=True, color=MUTED)
        center = Dot(axis.n2p(3), radius=0.14, color=SECONDARY)
        pulse = Circle(radius=0.34, color=SECONDARY, stroke_width=5).move_to(center)
        formula = mtex(r"|x-3|=0\\Rightarrow x=3", 0.78, FOREGROUND).next_to(axis, DOWN, buff=0.75)
        stage_figure(self, VGroup(axis, center, pulse, formula),
            question="Promień zero zostawia tylko środek.",
            caption="Nie ma lewego i prawego punktu, bo nie wykonujemy żadnego kroku.",
            reveal=[
                [Create(axis), FadeIn(center)],
                [Create(pulse)],
                [Write(formula)],
            ])`,
    {
      title: "Dlaczego promień zero daje jedno rozwiązanie",
      still: "single solution at center for radius zero",
      durationSeconds: 34,
      narration:
        "Jeżeli promień jest równy zero, to nie idziemy ani w lewo, ani w prawo. Zostajemy dokładnie w środku. Dlatego równanie moduł z x minus trzy równa się zero ma jedno rozwiązanie: x równa się trzy. To jest inny przypadek niż promień dodatni, gdzie punkty rozchodzą się na dwie strony."
    }
  ),
  scene(
    "why_it_works",
    4,
    4,
    "AbsWhyCenterRadius",
    "DLACZEGO TO DZIAŁA",
    "stage_derivation",
    `        stage_derivation(self, symbolic=[
            r"p=-5,\\quad q=11",
            r"a=\\frac{p+q}{2}=\\frac{-5+11}{2}=3",
            r"r=\\frac{|q-p|}{2}=\\frac{|11-(-5)|}{2}=8",
            r"|x-3|=8",
        ], caption="Dwa rozwiązania wyznaczają środek i promień równania.")`,
    {
      title: "Odtwarzanie równania z dwóch rozwiązań",
      still: "center and radius from two solutions",
      durationSeconds: 38,
      narration:
        "Czasem zadanie działa w drugą stronę. Nie dostajesz równania, tylko dwie liczby, które mają być rozwiązaniami. Wtedy traktujesz je jak końce odcinka na osi. Środek to średnia tych dwóch liczb. Promień to połowa odległości między nimi. Dla minus pięć i jedenaście środkiem jest trzy, a promieniem osiem, więc równanie ma postać moduł z x minus trzy równa się osiem."
    }
  )
];

const summary: AuthoredScene[] = [
  scene(
    "summary",
    1,
    3,
    "AbsSummaryImages",
    "PODSUMOWANIE",
    "stage_model",
    `        c1 = VGroup(small_label("obraz", 0.34, MUTED), mtex(r"|x|=d(x,0)", 0.56, ACCENT)).arrange(DOWN, buff=0.25)
        c2 = VGroup(small_label("środek", 0.34, MUTED), mtex(r"|x-a|=r", 0.66, SECONDARY)).arrange(DOWN, buff=0.25)
        c3 = VGroup(small_label("przypadki", 0.34, MUTED), mtex(r"r<0,\\ r=0,\\ r>0", 0.48, FOREGROUND)).arrange(DOWN, buff=0.25)
        stage_model(self, cards=[c1, c2, c3], tagline="Jeśli widzisz odległość, widzisz też liczbę rozwiązań.")`,
    {
      title: "Trzy obrazy do zapamiętania",
      still: "three summary cards",
      durationSeconds: 34,
      narration:
        "Podsumujmy obrazy, które mają zostać po tej lekcji. Pierwszy: moduł to odległość od zera. Drugi: moduł z x minus a to odległość od punktu a, więc a jest środkiem. Trzeci: prawa strona równania działa jak promień. Promień ujemny daje brak rozwiązań, promień zerowy jedno, a dodatni dwa rozwiązania."
    }
  ),
  scene(
    "summary",
    2,
    3,
    "AbsSummaryMistakes",
    "PODSUMOWANIE",
    "stage_derivation",
    `        stage_derivation(self, symbolic=[
            r"|x-4|=3\\Rightarrow x=7\\ \\text{lub}\\ x=1",
            r"|x+2|=-6\\Rightarrow \\varnothing",
            r"|x-5|\\neq x+5",
        ], caption="Te trzy kontrole chronią większość punktów w zadaniach z modułem.")`,
    {
      title: "Trzy błędy, których unikamy",
      still: "three common absolute value mistakes",
      durationSeconds: 34,
      narration:
        "Są trzy błędy, które zabierają najwięcej punktów. Pierwszy: zapisanie tylko jednego rozwiązania tam, gdzie odległość daje punkt po lewej i po prawej. Drugi: rozwiązywanie modułu równego liczbie ujemnej. Trzeci: udawanie, że moduł zmienia minusy pojedynczo. W rzeczywistości zmienia się znak całego wyrażenia, i tylko wtedy, gdy to wyrażenie jest ujemne."
    }
  ),
  scene(
    "summary",
    3,
    3,
    "AbsSummaryNext",
    "PODSUMOWANIE",
    "stage_card",
    `        stage_card(self,
            centerpiece=r"|x-a|=r",
            strip=r"x=a-r\\quad\\text{lub}\\quad x=a+r",
            caption="Na maturze najpierw rysuj w głowie oś, potem licz.")`,
    {
      title: "Ostatni obraz przed zadaniami",
      still: "core absolute value formula",
      durationSeconds: 34,
      narration:
        "Na koniec zostaje jedna instrukcja. Kiedy widzisz moduł, najpierw narysuj w głowie oś. Zapytaj: od którego punktu mierzę odległość i jaka jest ta odległość. Dopiero potem zapisuj przypadki i licz. Dzięki temu równania z wartością bezwzględną stają się zadaniami o punktach na osi, a nie chaotycznym przepisywaniem znaków."
    }
  )
];

const exValue: ExampleAuthoring = {
  sourceId: "g-th-00",
  className: "AbsExampleValue",
  sceneLabel: "PRZYKŁAD 1 / 3",
  durationSeconds: 20,
  ex: {
    label: "PRZYKŁAD 1 / 3",
    source_id: "g-th-00",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "compute-3", "compute-4", "result", "insight"],
    statement: "Oblicz wartość wyrażenia A = |-8| + |3 - 10| - |-2|.",
    highlights: ["|-8|", "|3 - 10|", "|-2|"],
    sought: ["A"],
    plan_formula: "A=|{-8}|+|3-10|-|{-2}|",
    plan_note: "Każdy moduł liczymy osobno, patrząc na znak środka.",
    computes: [
      {kind: "arith", line: "A=8+|3-10|-|{-2}|", note: "Liczba minus osiem jest ujemna, więc jej moduł to osiem."},
      {kind: "arith", line: "A=8+|{-7}|-|{-2}|", note: "Najpierw wykonujemy działanie pod modułem: trzy minus dziesięć to minus siedem."},
      {kind: "arith", line: "A=8+7-2", note: "Moduły z minus siedem i minus dwa dają odpowiednio siedem i dwa."},
      {kind: "arith", line: "A=13", note: "Zostaje zwykły rachunek: osiem plus siedem minus dwa."}
    ],
    answer_tex: "A=13",
    answer_sentence: "Wartość wyrażenia wynosi 13.",
    insight: "Najpierw oblicz wnętrze modułu, potem zdecyduj o znaku.",
    include_insight: true,
    narrations: {
      present:
        "Pierwszy przykład jest rachunkowy. Mamy obliczyć wartość wyrażenia z trzema modułami. Nie próbujemy robić wszystkiego naraz. Każdy moduł traktujemy jak osobne pytanie: jaka jest odległość tej liczby od zera?",
      restate:
        "Szukamy jednej liczby, czyli wartości A. Zaznaczone są trzy miejsca, w których trzeba zdjąć moduł. Dwa z nich są od razu liczbami ujemnymi, a w środkowym trzeba najpierw policzyć trzy minus dziesięć.",
      plan:
        "Plan jest prosty: każdy moduł obliczamy osobno, a dopiero potem wykonujemy dodawanie i odejmowanie. To chroni przed pomyleniem kolejności działań.",
      "compute-1":
        "Zaczynamy od modułu z minus osiem. Odległość liczby minus osiem od zera wynosi osiem, więc pierwszy moduł zastępujemy liczbą osiem.",
      "compute-2":
        "W drugim module najpierw liczymy wnętrze. Trzy minus dziesięć to minus siedem. Jeszcze nie kończymy, tylko zapisujemy moduł z minus siedem.",
      "compute-3":
        "Teraz zdejmujemy pozostałe moduły. Moduł z minus siedem to siedem, a moduł z minus dwa to dwa. W wyrażeniu zostaje już zwykłe osiem plus siedem minus dwa.",
      "compute-4":
        "Na końcu wykonujemy rachunek. Osiem plus siedem daje piętnaście, a piętnaście minus dwa daje trzynaście.",
      result:
        "Odpowiedź jest jedna: wartość wyrażenia A wynosi trzynaście.",
      insight:
        "W takim przykładzie największy błąd to zbyt szybkie zdejmowanie modułu. Najpierw liczysz to, co jest w środku, dopiero potem decydujesz, czy wynik zostaje, czy zmienia znak."
    }
  }
};

const exEquation: ExampleAuthoring = {
  sourceId: "g-th-01",
  className: "AbsExampleEquation",
  sceneLabel: "PRZYKŁAD 2 / 3",
  durationSeconds: 21,
  ex: {
    label: "PRZYKŁAD 2 / 3",
    source_id: "g-th-01",
    beats: ["present", "restate", "plan", "compute-1", "compute-2", "result", "insight"],
    statement: "Rozwiąż równanie |x - 6| = 2 i podaj interpretację geometryczną otrzymanych rozwiązań na osi liczbowej.",
    highlights: ["|x - 6| = 2", "interpretację geometryczną"],
    sought: ["x"],
    plan_formula: "|x-6|=2\\Rightarrow x=6-2\\ \\lor\\ x=6+2",
    plan_note: "Szukamy liczb odległych od 6 o 2.",
    computes: [
      {kind: "arith", line: "x=4\\ \\lor\\ x=8", note: "Dwa kroki w lewo od sześciu dają cztery, a dwa kroki w prawo dają osiem."},
      {kind: "arith", line: "|4-6|=2\\quad\\text{i}\\quad |8-6|=2", note: "Oba punkty leżą w odległości dwa od liczby sześć."}
    ],
    answer_tex: "x=4\\ \\lor\\ x=8",
    answer_sentence: "Rozwiązania to x = 4 lub x = 8.",
    insight: "Punkty 4 i 8 są symetryczne względem środka 6.",
    include_insight: true,
    narrations: {
      present:
        "Drugi przykład pokazuje najważniejszą interpretację geometryczną. Rozwiązujemy równanie moduł z x minus sześć równa się dwa, a potem mamy powiedzieć, co te rozwiązania znaczą na osi liczbowej.",
      restate:
        "Szukamy wartości x. Wyrażenie x minus sześć mówi, że punktem odniesienia jest sześć. Prawa strona, czyli dwa, mówi, że odległość od tego punktu ma wynosić dokładnie dwa.",
      plan:
        "Zamiast zaczynać od suchego rozbijania na przypadki, odczytujemy środek i promień. Środek to sześć, promień to dwa, więc rozwiązania leżą dwa kroki od sześciu.",
      "compute-1":
        "Dwa kroki w lewo od sześciu dają cztery. Dwa kroki w prawo od sześciu dają osiem. To są dwa kandydaty na rozwiązania.",
      "compute-2":
        "Sprawdzamy odległość. Cztery minus sześć daje minus dwa, a jego moduł to dwa. Osiem minus sześć daje dwa, a jego moduł też wynosi dwa.",
      result:
        "Rozwiązania równania to x równe cztery lub x równe osiem.",
      insight:
        "Najważniejszy wniosek: w równaniu moduł z x minus a równa się r, dwa rozwiązania są symetryczne względem liczby a."
    }
  }
};

const exDistance: ExampleAuthoring = {
  sourceId: "g-th-02",
  className: "AbsExampleDistance",
  sceneLabel: "PRZYKŁAD 3 / 3",
  durationSeconds: 21,
  ex: {
    label: "PRZYKŁAD 3 / 3",
    source_id: "g-th-02",
    beats: ["present", "restate", "plan", "substitute", "compute-1", "compute-2", "result", "insight"],
    statement: "Na osi liczbowej punkt A ma współrzędną -3, a punkt B ma współrzędną 5. Oblicz odległość d(A,B) i współrzędną środka S odcinka AB.",
    highlights: ["-3", "5", "odległość", "środka"],
    sought: ["d(A,B)", "S"],
    plan_formula: "d(A,B)=|a-b|,\\quad S=\\frac{a+b}{2}",
    plan_note: "Odległość liczymy modułem różnicy, a środek jako średnią końców.",
    sub_filled: "d(A,B)=|{-3}-5|,\\quad S=\\frac{-3+5}{2}",
    sub_note: "Podstawiamy współrzędne końców odcinka.",
    computes: [
      {kind: "arith", line: "d(A,B)=|{-8}|=8,\\quad S=\\frac{2}{2}", note: "Różnica końców daje minus osiem, a suma końców daje dwa."},
      {kind: "arith", line: "d(A,B)=8,\\quad S=1", note: "Moduł z minus osiem to osiem, a dwa podzielone przez dwa to jeden."}
    ],
    answer_tex: "d(A,B)=8,\\quad S=1",
    answer_sentence: "Odległość wynosi 8, a środek odcinka ma współrzędną 1.",
    insight: "Środek jest jednakowo odległy od obu końców: od -3 i od 5 dzielą go 4 jednostki.",
    include_insight: true,
    narrations: {
      present:
        "Trzeci przykład łączy moduł z geometrią osi. Punkt A ma współrzędną minus trzy, punkt B ma współrzędną pięć. Mamy obliczyć odległość między punktami oraz współrzędną środka odcinka.",
      restate:
        "Szukamy dwóch rzeczy: długości odcinka AB oraz punktu S, który leży dokładnie pośrodku. Dane są tylko współrzędne końców, więc całe zadanie rozgrywa się na osi liczbowej.",
      plan:
        "Używamy dwóch wzorów. Odległość to moduł różnicy współrzędnych. Środek odcinka na osi to średnia arytmetyczna końców.",
      substitute:
        "Podstawiamy minus trzy i pięć. W odległości zapisujemy moduł z minus trzy minus pięć. W środku zapisujemy ułamek: minus trzy plus pięć, wszystko przez dwa.",
      "compute-1":
        "W odległości wnętrze modułu daje minus osiem, więc zaraz dostaniemy odległość osiem. W środku licznik daje dwa, więc zostaje dwa przez dwa.",
      "compute-2":
        "Kończymy rachunek. Moduł z minus osiem wynosi osiem, a dwa przez dwa daje jeden.",
      result:
        "Odpowiedź ma dwie części: odległość punktów A i B wynosi osiem, a współrzędna środka odcinka AB wynosi jeden.",
      insight:
        "Sprawdzenie geometryczne jest bardzo czytelne. Od minus trzy do jeden są cztery jednostki, i od jeden do pięć też są cztery jednostki. To potwierdza, że S naprawdę jest środkiem."
    }
  }
};

export const wartoscBezwzgledna: SectionAuthoring = {
  slug: "wartosc-bezwzgledna",
  topic: "Wartość bezwzględna: interpretacja i proste równania",
  authored: [...hook, ...intuition, ...definition, ...why, ...summary],
  examples: [exValue, exEquation, exDistance],
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
            headline="WARTOŚĆ\\nBEZWZGLĘDNA",
            formula=r"|x-6|=2\\Rightarrow x=4\\ \\lor\\ x=8",
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
            headline="BEZ TEGO\\nNIE ZDASZ",
            formula=r"|x-6|=2\\Rightarrow x=4\\ \\lor\\ x=8",
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
            headline="EGZAMINATOR\\nLICZY, ŻE\\nTEGO NIE ZNASZ",
            formula=r"|x-6|=2\\Rightarrow x=4\\ \\lor\\ x=8",
        )
`
    }
  ]
};

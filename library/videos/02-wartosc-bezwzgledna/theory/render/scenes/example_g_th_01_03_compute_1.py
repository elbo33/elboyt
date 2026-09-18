import json

from manim import *
from support.style import LessonScene
from support.templates.theory_example import worked_beat

EX = json.loads("{\"label\":\"PRZYKŁAD 2 / 3\",\"source_id\":\"g-th-01\",\"beats\":[\"present\",\"restate\",\"plan\",\"compute-1\",\"compute-2\",\"result\",\"insight\"],\"statement\":\"Rozwiąż równanie |x - 6| = 2 i podaj interpretację geometryczną otrzymanych rozwiązań na osi liczbowej.\",\"highlights\":[\"|x - 6| = 2\",\"interpretację geometryczną\"],\"sought\":[\"x\"],\"plan_formula\":\"|x-6|=2\\\\Rightarrow x=6-2\\\\ \\\\lor\\\\ x=6+2\",\"plan_note\":\"Szukamy liczb odległych od 6 o 2.\",\"computes\":[{\"kind\":\"arith\",\"line\":\"x=4\\\\ \\\\lor\\\\ x=8\",\"note\":\"Dwa kroki w lewo od sześciu dają cztery, a dwa kroki w prawo dają osiem.\"},{\"kind\":\"arith\",\"line\":\"|4-6|=2\\\\quad\\\\text{i}\\\\quad |8-6|=2\",\"note\":\"Oba punkty leżą w odległości dwa od liczby sześć.\"}],\"answer_tex\":\"x=4\\\\ \\\\lor\\\\ x=8\",\"answer_sentence\":\"Rozwiązania to x = 4 lub x = 8.\",\"insight\":\"Punkty 4 i 8 są symetryczne względem środka 6.\",\"include_insight\":true,\"narrations\":{\"present\":\"Drugi przykład pokazuje najważniejszą interpretację geometryczną. Rozwiązujemy równanie moduł z x minus sześć równa się dwa, a potem mamy powiedzieć, co te rozwiązania znaczą na osi liczbowej.\",\"restate\":\"Szukamy wartości x. Wyrażenie x minus sześć mówi, że punktem odniesienia jest sześć. Prawa strona, czyli dwa, mówi, że odległość od tego punktu ma wynosić dokładnie dwa.\",\"plan\":\"Zamiast zaczynać od suchego rozbijania na przypadki, odczytujemy środek i promień. Środek to sześć, promień to dwa, więc rozwiązania leżą dwa kroki od sześciu.\",\"compute-1\":\"Dwa kroki w lewo od sześciu dają cztery. Dwa kroki w prawo od sześciu dają osiem. To są dwa kandydaty na rozwiązania.\",\"compute-2\":\"Sprawdzamy odległość. Cztery minus sześć daje minus dwa, a jego moduł to dwa. Osiem minus sześć daje dwa, a jego moduł też wynosi dwa.\",\"result\":\"Rozwiązania równania to x równe cztery lub x równe osiem.\",\"insight\":\"Najważniejszy wniosek: w równaniu moduł z x minus a równa się r, dwa rozwiązania są symetryczne względem liczby a.\"}}")

class AbsExampleEquation_03_compute_1(LessonScene):
    def construct(self):
        worked_beat(self, EX, beat=3)


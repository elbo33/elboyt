import json

from manim import *
from support.style import LessonScene
from support.templates.theory_example import worked_beat

EX = json.loads("{\"label\":\"PRZYKŁAD 2 / 3\",\"source_id\":\"g-th-01\",\"beats\":[\"present\",\"restate\",\"plan\",\"compute-1\",\"compute-2\",\"result\",\"insight\"],\"statement\":\"Wyłącz czynnik przed znak pierwiastka: ∛40.\",\"highlights\":[\"∛40\"],\"sought\":[\"postać najprostsza\"],\"plan_formula\":\"\\\\sqrt[3]{40}\",\"plan_note\":\"Pod pierwiastkiem trzeciego stopnia szukamy pełnych sześcianów.\",\"computes\":[{\"kind\":\"arith\",\"line\":\"40=2^3\\\\cdot5\",\"note\":\"Rozkład odsłania jedną pełną paczkę trzech dwójek.\"},{\"kind\":\"arith\",\"line\":\"\\\\sqrt[3]{40}=\\\\sqrt[3]{2^3\\\\cdot5}=2\\\\sqrt[3]{5}\",\"note\":\"Pełny sześcian wychodzi przed pierwiastek jako dwójka.\"}],\"answer_tex\":\"2\\\\sqrt[3]{5}\",\"answer_sentence\":\"Postać najprostsza to 2∛5.\",\"insight\":\"Nie przybliżamy pierwiastka. Zostawiamy dokładną najprostszą postać.\",\"include_insight\":true,\"narrations\":{\"present\":\"Drugi przykład pokazuje najważniejszy ruch techniczny: wyłączanie czynnika przed pierwiastek. Mamy uprościć pierwiastek trzeciego stopnia z czterdziestu.\",\"restate\":\"Szukamy postaci najprostszej. To nie znaczy, że mamy liczyć przybliżenie dziesiętne. Chcemy znaleźć pełne sześciany ukryte pod pierwiastkiem i wyprowadzić je przed znak pierwiastka.\",\"plan\":\"Ponieważ stopień pierwiastka wynosi trzy, szukamy grup po trzy takie same czynniki. Najbezpieczniej jest rozłożyć czterdzieści na czynniki pierwsze.\",\"compute-1\":\"Czterdzieści zapisujemy jako dwa do trzeciej potęgi razy pięć. To pokazuje jedną pełną paczkę trzech dwójek i jedną piątkę, która nie tworzy pełnego sześcianu.\",\"compute-2\":\"Pierwiastek trzeciego stopnia z dwa do trzeciej potęgi daje dwa. Piątka zostaje pod pierwiastkiem.\",\"result\":\"Odpowiedź to dwa pierwiastki trzeciego stopnia z pięciu.\",\"insight\":\"Ten przykład pokazuje, że uproszczenie nie polega na usunięciu pierwiastka za wszelką cenę. Chodzi o to, żeby pod pierwiastkiem nie została żadna pełna potęga stopnia trzy.\"}}")

class RootsExampleSimplify_01_restate(LessonScene):
    def construct(self):
        worked_beat(self, EX, beat=1)


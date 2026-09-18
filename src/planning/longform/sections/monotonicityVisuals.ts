import type {PowerRootsVisualStep} from "./powerRootsVisuals";

export const monotonicityVisuals: Record<string, PowerRootsVisualStep[]> = {
  "theory-00-hook": [
    {formula: String.raw`7^{-3}\;?\;7^{-2}`, label: "Ta sama podstawa, różne wykładniki"},
    {formula: String.raw`\left(\frac25\right)^4\;?\;\left(\frac25\right)^7`, label: "Czy dla ułamka działa ten sam kierunek?"},
    {formula: String.raw`a>1\quad\text{lub}\quad0<a<1`, label: "Najpierw sprawdź podstawę"}
  ],
  "theory-concept-1": [
    {formula: String.raw`a>0\quad\Longrightarrow\quad a^x>0`, label: "Dodatnia podstawa daje dodatni wynik"},
    {formula: String.raw`2^{-3}=\frac1{2^3}=\frac18`, label: "Minus w wykładniku oznacza odwrotność"},
    {formula: String.raw`a^0=1\quad(a>0)`, label: "Jedynka jest punktem odniesienia"}
  ],
  "theory-concept-2": [
    {formula: String.raw`a>1:\quad x<y\Rightarrow a^x<a^y`, label: "Podstawa większa od jedynki: rośnie"},
    {formula: String.raw`0<a<1:\quad x<y\Rightarrow a^x>a^y`, label: "Podstawa ułamkowa: maleje"},
    {formula: String.raw`2>1\qquad 0<\frac12<1`, label: "Dwie strony jedynki, dwa kierunki"}
  ],
  "theory-concept-3": [
    {formula: String.raw`2^0=1,\quad2^1=2,\quad2^2=4`, label: "Wykładnik rośnie, wartość rośnie"},
    {formula: String.raw`-3<-2`, label: "Porównaj wykładniki na osi"},
    {formula: String.raw`2^{-3}<2^{-2}`, label: "Kierunek pozostaje taki sam"}
  ],
  "theory-concept-4": [
    {formula: String.raw`\left(\frac12\right)^1=\frac12`, label: "Mnożenie przez ułamek zmniejsza liczbę"},
    {formula: String.raw`\left(\frac12\right)^2=\frac14`, label: "Większy wykładnik, mniejszy wynik"},
    {formula: String.raw`1<2\quad\text{lecz}\quad\frac12>\frac14`, label: "Kierunek nierówności się odwraca"}
  ],
  "theory-method-1": [
    {formula: String.raw`a^x\;?\;a^y`, label: "Sprawdź, czy podstawy są takie same"},
    {formula: String.raw`a>1\quad\text{czy}\quad0<a<1`, label: "Ustal położenie podstawy względem jedynki"},
    {formula: String.raw`27=3^3,\quad9=3^2`, label: "Różne podstawy można czasem uwspólnić"}
  ],
  "theory-method-2": [
    {formula: String.raw`1=a^0\quad(a>0)`, label: "Zapisz jedynkę jako potęgę"},
    {formula: String.raw`2^{-1}<2^0=1`, label: "Przy podstawie większej od jedynki"},
    {formula: String.raw`\left(\frac12\right)^{-1}>\left(\frac12\right)^0=1`, label: "Przy ułamku kierunek się odwraca"}
  ],
  "theory-formula-1": [
    {formula: String.raw`a>1,\quad x<y`, label: "Warunek: podstawa większa od jedynki"},
    {formula: String.raw`a^x<a^y`, label: "Potęgowanie zachowuje porządek"},
    {formula: String.raw`5^{x-2}<5^6\Rightarrow x-2<6`, label: "Tak użyjesz reguły w nierówności"}
  ],
  "theory-formula-2": [
    {formula: String.raw`0<a<1,\quad x<y`, label: "Warunek: podstawa między zerem a jedynką"},
    {formula: String.raw`a^x>a^y`, label: "Potęgowanie odwraca porządek"},
    {formula: String.raw`1^x=1`, label: "Podstawa jeden jest przypadkiem osobnym"}
  ],
  "example-g-th-00": [
    {formula: String.raw`-3<-2\Rightarrow7^{-3}<7^{-2}`, label: "Siedem: zachowaj kierunek"},
    {formula: String.raw`0<\frac25<1,\quad4<7`, label: "Dwie piąte: odwróć kierunek"},
    {formula: String.raw`\left(\frac25\right)^4>\left(\frac25\right)^7`, label: "Pierwsza potęga jest większa"}
  ],
  "example-g-th-01": [
    {formula: String.raw`\left(\frac34\right)^{-6}>1`, label: "Ujemny wykładnik przy ułamku: tak"},
    {formula: String.raw`(0{,}9)^5<1`, label: "Dodatni wykładnik przy ułamku: nie"},
    {formula: String.raw`2^{-0{,}3}<2^0=1`, label: "Ujemny wykładnik przy dwójce: nie"}
  ],
  "example-g-th-02": [
    {formula: String.raw`5^{x-2}<5^6`, label: "Podstawa pięć jest większa od jedynki"},
    {formula: String.raw`x-2<6\Rightarrow x<8`, label: "Zachowaj znak i rozwiąż nierówność"},
    {formula: String.raw`x\in(-\infty,8)`, label: "Ósemka nie należy do przedziału"}
  ],
  "matura-setup": [
    {formula: String.raw`27^{10}\;?\;9^{16}`, label: "Nie licz ogromnych wartości"},
    {formula: String.raw`27=3^3`, label: "Pierwsza podstawa to potęga trójki"},
    {formula: String.raw`9=3^2`, label: "Druga podstawa też jest potęgą trójki"}
  ],
  "matura-calculate": [
    {formula: String.raw`27^{10}=(3^3)^{10}=3^{30}`, label: "Pierwszy wykładnik: trzydzieści"},
    {formula: String.raw`9^{16}=(3^2)^{16}=3^{32}`, label: "Drugi wykładnik: trzydzieści dwa"},
    {formula: String.raw`30<32\Rightarrow3^{30}<3^{32}`, label: "Podstawa trzy zachowuje kierunek"}
  ],
  "matura-check": [
    {formula: String.raw`27^{10}<9^{16}`, label: "Większa jest druga liczba"},
    {formula: String.raw`27^{10}=3^{30},\quad9^{16}=3^{32}`, label: "Sprawdź oba przekształcenia"},
    {formula: String.raw`3>1\Rightarrow30<32`, label: "Znak wynika z rosnącej potęgi"}
  ],
  "theory-summary": [
    {formula: String.raw`a>1:\;x<y\Rightarrow a^x<a^y`, label: "Powyżej jedynki: zachowaj kierunek"},
    {formula: String.raw`0<a<1:\;x<y\Rightarrow a^x>a^y`, label: "Poniżej jedynki: odwróć kierunek"},
    {formula: String.raw`1=a^0`, label: "Porównuj z jedynką przez wykładnik zero"},
    {formula: String.raw`\checkmark`, label: "Zasubskrybuj i zaproponuj kolejny temat"}
  ]
};

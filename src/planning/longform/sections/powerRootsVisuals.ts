export type PowerRootsVisualStep = {formula: string; label: string};

// Each short mathematical step is revealed in sequence during its scene.
export const powerRootsVisuals: Record<string, PowerRootsVisualStep[]> = {
  "theory-00-hook": [
    {formula: String.raw`a^m\cdot a^n=a^{m+n}`, label: "Jedna podstawa, dodaj wykładniki"},
    {formula: String.raw`\sqrt[n]{a^m}=a^{\frac{m}{n}}`, label: "Pierwiastek też można zapisać jako potęgę"},
    {formula: String.raw`16^{\frac34}=8`, label: "Za chwilę zobaczysz, skąd bierze się wynik"}
  ],
  "theory-concept-1": [
    {formula: String.raw`a^3=a\cdot a\cdot a`, label: "Ta sama podstawa, trzy czynniki"},
    {formula: String.raw`2^4=2\cdot2\cdot2\cdot2`, label: "Wykładnik mówi, ile razy mnożymy"},
    {formula: String.raw`2^4=16`, label: "Tak powstaje wartość potęgi"}
  ],
  "theory-concept-2": [
    {formula: String.raw`\frac{a^m}{a^m}=1`, label: "Dzielimy tę samą liczbę przez siebie"},
    {formula: String.raw`a^{m-m}=a^0=1`, label: "Podstawa musi być różna od zera"},
    {formula: String.raw`a^{-n}=\frac{1}{a^n}`, label: "Ujemny wykładnik daje odwrotność"}
  ],
  "theory-concept-3": [
    {formula: String.raw`\sqrt{16}=4`, label: "Pierwiastek kwadratowy jest nieujemny"},
    {formula: String.raw`4^2=16`, label: "Sprawdź wynik przez potęgowanie"},
    {formula: String.raw`\sqrt{x^2}=|x|`, label: "Dla ujemnego x potrzebna jest wartość bezwzględna"}
  ],
  "theory-concept-4": [
    {formula: String.raw`a^m\cdot a^n=a^{m+n}`, label: "Mnożenie: dodaj wykładniki"},
    {formula: String.raw`\frac{a^m}{a^n}=a^{m-n}`, label: "Dzielenie: odejmij wykładniki"},
    {formula: String.raw`(a^m)^n=a^{mn}`, label: "Potęga potęgi: pomnóż wykładniki"}
  ],
  "theory-method-1": [
    {formula: String.raw`16^{\frac34}`, label: "Najpierw rozpoznaj prostą podstawę"},
    {formula: String.raw`(2^4)^{\frac34}`, label: "Zapisz szesnaście jako potęgę dwójki"},
    {formula: String.raw`2^{4\cdot\frac34}=2^3=8`, label: "Pomnóż wykładniki i oblicz"}
  ],
  "theory-method-2": [
    {formula: String.raw`8=2^3\qquad4=2^2`, label: "Różne liczby mogą mieć wspólną podstawę"},
    {formula: String.raw`\frac{2^7\cdot2^{-3}}{2^2}`, label: "Najpierw uporządkuj licznik"},
    {formula: String.raw`2^{7-3-2}=2^2`, label: "Dodaj i odejmij wykładniki"}
  ],
  "theory-formula-1": [
    {formula: String.raw`a^n=\underbrace{a\cdot\ldots\cdot a}_{n}`, label: "Wykładnik liczy czynniki"},
    {formula: String.raw`a^2\cdot a^3`, label: "Razem jest pięć takich samych czynników"},
    {formula: String.raw`a^2\cdot a^3=a^5`, label: "Stąd bierze się dodawanie wykładników"}
  ],
  "theory-formula-2": [
    {formula: String.raw`a^0=1`, label: "Wzór obowiązuje dla niezerowej podstawy"},
    {formula: String.raw`7^0=1`, label: "Wartość nie zależy od niezerowej podstawy"},
    {formula: String.raw`0^0`, label: "Zera do zera nie obliczamy tym wzorem"}
  ],
  "example-g-th-00": [
    {formula: String.raw`\sqrt[4]{5^3}`, label: "Stopień pierwiastka trafi do mianownika"},
    {formula: String.raw`\sqrt[n]{a^m}=a^{\frac{m}{n}}`, label: "Wykładnik pod pierwiastkiem trafi do licznika"},
    {formula: String.raw`\sqrt[4]{5^3}=5^{\frac34}`, label: "Ta sama liczba w nowej postaci"}
  ],
  "example-g-th-01": [
    {formula: String.raw`16^{\frac34}`, label: "Zacznij od zapisania podstawy"},
    {formula: String.raw`(2^4)^{\frac34}=2^{4\cdot\frac34}`, label: "W potędze potęgi mnożymy wykładniki"},
    {formula: String.raw`2^3=8`, label: "Ostateczny wynik"}
  ],
  "example-g-th-02": [
    {formula: String.raw`\frac{2^7\cdot2^{-3}}{2^2}`, label: "Wszystkie potęgi mają podstawę dwa"},
    {formula: String.raw`\frac{2^{7-3}}{2^2}=\frac{2^4}{2^2}`, label: "W liczniku dodaj wykładniki"},
    {formula: String.raw`2^{4-2}=2^2=4`, label: "Przy dzieleniu odejmij wykładnik"}
  ],
  "matura-setup": [
    {formula: String.raw`\left(\frac19\right)^{-\frac12}+32^{\frac25}-7^0`, label: "Trzy składniki, trzy krótkie rachunki"},
    {formula: String.raw`\left(\frac19\right)^{-\frac12}`, label: "Ujemny wykładnik: pomyśl o odwrotności"},
    {formula: String.raw`32^{\frac25}\qquad 7^0`, label: "Wspólna podstawa i wykładnik zerowy"}
  ],
  "matura-calculate": [
    {formula: String.raw`\left(\frac19\right)^{-\frac12}=9^{\frac12}=3`, label: "Pierwszy składnik daje trzy"},
    {formula: String.raw`32=2^5`, label: "Trzydzieści dwa zapisz jako potęgę dwójki"},
    {formula: String.raw`32^{\frac25}=(2^5)^{\frac25}=2^2=4`, label: "Drugi składnik daje cztery"}
  ],
  "matura-check": [
    {formula: String.raw`7^0=1`, label: "Trzeci składnik daje jeden"},
    {formula: String.raw`3+4-1=6`, label: "Wróć do działań z polecenia"},
    {formula: String.raw`\left(\frac19\right)^{-\frac12}+32^{\frac25}-7^0=6`, label: "Sprawdź znaki i zaznacz odpowiedź"}
  ],
  "theory-summary": [
    {formula: String.raw`a^m\cdot a^n=a^{m+n}`, label: "Mnożenie: dodaj"},
    {formula: String.raw`\frac{a^m}{a^n}=a^{m-n}`, label: "Dzielenie: odejmij"},
    {formula: String.raw`(a^m)^n=a^{mn}`, label: "Potęga potęgi: pomnóż"},
    {formula: String.raw`\sqrt[n]{a^m}=a^{\frac{m}{n}}`, label: "Zasubskrybuj i napisz, jaki temat chcesz zobaczyć"}
  ]
};

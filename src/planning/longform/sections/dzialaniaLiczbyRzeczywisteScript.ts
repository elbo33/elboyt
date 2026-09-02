export const AUTHORED_NARRATION: Record<string, string> = {
  "hook-1":
    "Cześć. W tym odcinku przejdziemy spokojnie przez działania w zbiorze liczb rzeczywistych i przez przedziały liczbowe. Zaczynamy od osi, bo ona będzie naszym głównym obrazem. Na jednej prostej widzimy liczby ujemne, zero, liczby dodatnie, pierwiastki i później całe kawałki osi. Najpierw zobaczysz, jak rozpoznawać rodzaje liczb. Potem przejdziemy przez kolejność działań, znaki przy potęgach, pierwiastki i logarytmy. Na końcu użyjemy tego samego obrazu do przedziałów. Nie będziemy uczyć się haseł na pamięć. Będziemy patrzeć, co oznacza zapis, jaki ruch wolno wykonać, i gdzie wynik powinien leżeć na osi.",
  "hook-2":
    "Plan odcinka jest taki: zapis matematyczny nie zostaje na ekranie jako martwa linijka. Zamieniamy go na serię widocznych decyzji. Wyrażenie mówi nam, co liczyć najpierw. Oś pokazuje, czy znak i wielkość wyniku mają sens. Przedział pokazuje nie jedną liczbę, ale cały zbiór liczb. Dlatego ekran będzie prosty: krótkie etykiety, wzory i rysunki. Pełne wyjaśnienie usłyszysz w narracji. Właśnie tak będziemy pracować przy przykładach: najpierw patrzymy na strukturę, potem wykonujemy pojedynczy ruch, a dopiero na końcu zapisujemy odpowiedź.",
  "intuition-1":
    "Najpierw ustawiamy rodziny liczb. Największym zbiorem w tej lekcji jest zbiór liczb rzeczywistych, oznaczany literą R. W jego wnętrzu są liczby wymierne, czyli takie, które można zapisać jako ułamek. W wymiernych są liczby całkowite, a w całkowitych liczby naturalne. Obok wymiernych, ale nadal w R, leżą liczby niewymierne. To na przykład pierwiastki o rozwinięciu dziesiętnym, które się nie kończy i nie jest okresowe. Ten rysunek pokazuje, że wiele działań jest bezpiecznych w R, ale nie w mniejszych zbiorach. Odejmowanie może wyrzucić nas z naturalnych.",
  "intuition-2":
    "Teraz patrzymy na działania. Wyobraź sobie, że bierzemy dwie liczby z osi i przepuszczamy je przez działanie. Dodawanie, odejmowanie i mnożenie zawsze zwracają liczbę rzeczywistą. Dzielenie też zwraca liczbę rzeczywistą, ale tylko wtedy, gdy dzielnik nie jest zerem. To jest warunek, którego nie wolno pominąć. Zero w mianowniku nie oznacza trudnego rachunku, tylko brak wartości. Dlatego przed liczeniem uczymy się pytać: czy ten ruch jest dozwolony. Jeśli działanie jest dozwolone, wynik ma wrócić na tę samą oś. Jeśli nie jest dozwolone, nie wolno udawać, że coś wyszło.",
  "intuition-3":
    "Kolejność działań traktujemy jak maszynę z bramkami. Najpierw wchodzą nawiasy, również te ukryte pod kreską ułamkową i pod znakiem pierwiastka. Potem liczymy potęgi, pierwiastki i logarytmy. Następna bramka to mnożenie i dzielenie, wykonywane od lewej do prawej. Na końcu zostaje dodawanie i odejmowanie, także od lewej do prawej. Dzięki temu wyrażenie nie jest chaosem. Każdy fragment czeka na swoją kolej. W przykładach będziemy dokładnie pilnować, przez którą bramkę przechodzi zapis.",
  "intuition-4":
    "Ten sam obraz osi będzie potrzebny przy przedziałach. Przedział to nie jest tylko para nawiasów w zeszycie. To zamalowany fragment osi liczbowej. Gdy punkt końcowy należy do zbioru, zaznaczamy go pełnym punktem. Gdy jest tylko granicą, zaznaczamy go pustym kółkiem. Na ekranie widzisz odcinek od minus trzy do siedmiu. Lewy koniec jest wzięty, prawy nie. Taka różnica jest mała graficznie, ale ogromna w odpowiedzi. Przy każdym przedziale będziemy więc osobno rozstrzygać lewy koniec i prawy koniec.",
  "definition-1":
    "Pierwsza pułapka to minus przy potędze. W górnym zapisie minus znajduje się w nawiasie, więc jest częścią podstawy. Potęgujemy całą liczbę ujemną. W dolnym zapisie minus stoi przed potęgą. Najpierw powstaje potęga liczby dodatniej, a dopiero potem dokładamy znak minus z przodu. Dlatego te dwa zapisy nie znaczą tego samego. Gdy widzisz potęgę, zadaj jedno pytanie: co dokładnie jest podstawą. Odpowiedź prawie zawsze znajduje się w nawiasie albo w jego braku.",
  "definition-2":
    "Druga pułapka to pierwiastek kwadratowy. Na osi widać dwie liczby, minus siedem i siedem. Obie po podniesieniu do kwadratu dają czterdzieści dziewięć. Ale symbol pierwiastka kwadratowego w szkolnym zapisie wybiera wynik nieujemny. Dlatego pierwiastek z czterdziestu dziewięciu to siedem, a nie dwie odpowiedzi. Dwie liczby pojawiają się dopiero wtedy, gdy rozwiązujemy równanie: jaka liczba po podniesieniu do kwadratu daje czterdzieści dziewięć. Sam pierwiastek arytmetyczny wybiera prawą stronę osi zawsze.",
  "definition-3":
    "Logarytm brzmi jak nowe działanie, ale najwygodniej czytać go jako pytanie. Zapis logarytm z b przy podstawie a równa się c oznacza: a do potęgi c daje b. Czyli logarytm szuka brakującego wykładnika. Na przykład, gdy zobaczysz logarytm przy podstawie dwa z liczby jeden przez szesnaście, nie zaczynasz od pamięciowego wzoru. Pytasz: do której potęgi trzeba podnieść dwa, żeby otrzymać jeden przez szesnaście. Ta zmiana języka jest kluczowa. Logarytm zamienia się w zwykłe myślenie o potęgach, a ułamek zwykle prowadzi do wykładnika ujemnego tutaj.",
  "definition-4":
    "Przy przedziałach najważniejszy jest koniec. Znak ostry, mniejsze albo większe, daje pusty punkt, bo granica nie należy do zbioru. Znak nieostry, mniejsze lub równe albo większe lub równe, daje punkt pełny, bo granica należy do zbioru. Nie próbuj zapamiętywać każdego typu przedziału osobno. Patrz na znak przy końcu i przetłumacz go na kółko. Potem ten sam wybór przepisujesz na nawias: pusty punkt to nawias okrągły, pełny punkt to nawias domknięty.",
  "why_it_works-1":
    "Teraz widać, dlaczego wyrażenie liczymy liniami, a nie w głowie jednym skokiem. Pierwsza linia to cały zapis. Druga linia wykonuje tylko potęgę i pierwiastek, bo te działania mają pierwszeństwo przed mnożeniem i sumą. Trzecia linia wykonuje mnożenie. Dopiero czwarta linia zbiera zwykłe liczby ze znakami. Ten sposób jest wolniejszy na papierze, ale szybszy w nauce, bo każdy błąd ma adres. Jeśli wynik jest zły, widzisz, czy problem był przy nawiasie, przy pierwiastku, przy mnożeniu, czy przy końcowym dodawaniu. Rachunek przestaje być czarną skrzynką tutaj.",
  "why_it_works-2":
    "Działania na przedziałach robimy oczami. Jeśli dwa przedziały narysujesz pod sobą w tej samej skali, część wspólna dosłownie pojawia się jako fragment zamalowany dwa razy. Suma byłaby wszystkim, co zostało zamalowane chociaż raz. Różnica byłaby tym, co zostaje z pierwszego przedziału po wycięciu drugiego. To podejście usuwa zgadywanie z nawiasów. Nie patrzymy tylko na symbole. Patrzymy, które punkty są naprawdę w zbiorze. Szczególnie końce sprawdzamy osobno, bo tam najłatwiej zgubić pusty albo pełny punkt.",
  "why_it_works-3":
    "W zadaniach maturalnych te trzy obrazy często składają się w jedną całość. Fragment z potęgą sprawdza, czy widzisz podstawę i znak. Fragment z logarytmem sprawdza, czy potrafisz wrócić do pytania o wykładnik. Fragment z przedziałem sprawdza, czy umiesz przełożyć wynik na oś. Dlatego nie chcemy pamiętać oddzielnych sztuczek. Chcemy mieć trzy uchwyty: nawias przy potędze, definicję logarytmu i zamalowany przedział. Gdy zadanie robi się dłuższe, te uchwyty prowadzą rozwiązanie krok po kroku.",
  "summary-1":
    "Podsumujmy trzy obrazy, które mają zostać po tej lekcji. Pierwszy obraz to ukryte nawiasy. Kreska ułamkowa, znak pierwiastka i zwykły nawias mówią, co liczymy jako osobny blok. Drugi obraz to pierwiastek arytmetyczny i wartość bezwzględna. Gdy pierwiastek wychodzi z kwadratu, wynik nie może być ujemny. Trzeci obraz to przedział jako fragment osi. Puste albo pełne końce decydują o tym, czy graniczne liczby należą do zbioru. Jeśli te obrazy masz w głowie, rachunek staje się dużo spokojniejszy.",
  "summary-2":
    "Na koniec wracamy do osi. Wynik nie jest samotną liczbą zapisaną w ostatniej linijce. Wynik ma swoje miejsce. Gdy dostajesz minus dwadzieścia siedem, wiesz, że leży daleko po lewej stronie zera. Gdy dostajesz przedział od minus trzy do siedmiu, widzisz cały zamalowany odcinek. Gdy liczysz logarytm i wychodzi wartość ujemna, rozumiesz, że liczba logarytmowana była ułamkiem. To jest cel odcinka: nie tylko umieć policzyć, ale umieć zobaczyć, dlaczego odpowiedź ma sens."
};

export const EXAMPLE_NARRATION: Record<string, Record<string, string>> = {
  "g-th-00": {
    present:
      "Pierwszy przykład pokazuje pełną kolejność działań. Na ekranie widzisz potęgę z ujemną podstawą, mnożenie przez liczbę ujemną oraz pierwiastek. Nie zaczynamy od pierwszego znaku po lewej. Najpierw patrzymy, które elementy są samodzielnymi blokami rachunku właśnie.",
    restate:
      "Szukamy jednej wartości całego wyrażenia. Zaznaczamy więc trzy rzeczy: potęgę, pierwiastek i mnożenie. Dopiero gdy te części będą obliczone, końcowa linia stanie się prostym dodawaniem oraz odejmowaniem liczb ze znakami, bez żadnej ukrytej operacji, i dlatego końcówka będzie prostsza do sprawdzenia.",
    plan:
      "Plan zostaje krótki. Najpierw potęga i pierwiastek. Potem mnożenie. Na końcu suma od lewej do prawej. Dzięki temu każdy krok ma swoje miejsce i nie mieszamy działań spokojnie.",
    "compute-1":
      "Minus jest w nawiasie, więc podstawa potęgi jest ujemna. Wykładnik jest nieparzysty, dlatego wynik zostaje ujemny. Pierwiastek daje siedem dokładnie tutaj.",
    "compute-2":
      "Teraz mnożymy. Trzy razy minus cztery daje minus dwanaście. Wyrażenie jest już sprowadzone do zwykłych liczb ze znakami na osi teraz.",
    "compute-3":
      "Ostatni ruch odbywa się na osi w lewo. Minus osiem i minus dwanaście, potem jeszcze minus siedem, daje minus dwadzieścia siedem.",
    result:
      "Wynik trafia do ramki: minus dwadzieścia siedem. To nie jest zgadywanie. Każda linia wykonała dokładnie jeden poziom kolejności działań, dlatego możemy sprawdzić cały tok rachunku od początku i zobaczyć dokładnie, gdzie mógłby powstać ewentualny błąd rachunkowy.",
    insight:
      "Wniosek z przykładu jest ważniejszy niż sama liczba. Najpierw rozpoznaj strukturę, potem licz pojedyncze bloki, a dopiero na końcu sklej wynik. Wtedy znak minus ma dużo mniej okazji, żeby cię oszukać w rachunku, bo każdy fragment ma jasną rolę w całym wyrażeniu."
  },
  "g-th-01": {
    present:
      "Drugi przykład jest o logarytmie z definicji. Na ekranie widzisz podstawę dwa i liczbę jeden przez szesnaście. Całe zadanie pyta o wykładnik, który ukrywa się między tymi dwiema liczbami na ekranie i w samej definicji.",
    restate:
      "Najpierw sprawdzamy sens zapisu. Podstawa jest dodatnia i różna od jedności. Liczba logarytmowana jest dodatnia. Logarytm istnieje, więc możemy szukać wykładnika bez żadnego wyjątku. Teraz pytanie jest już dobrze postawione matematycznie, dzięki temu nie szukamy wyniku w miejscu, gdzie zapis byłby niedozwolony.",
    plan:
      "Używamy definicji. Logarytm zamienia się w pytanie: podstawa do jakiej potęgi daje liczbę logarytmowaną. Na ekranie dlatego pojawia się równoważny zapis potęgowy, zamiast przeskakiwać od razu do odpowiedzi.",
    "compute-1":
      "Jeden przez szesnaście zapisujemy jako odwrotność czwartej potęgi dwójki. Odwrotność oznacza wykładnik ujemny, więc wynik będzie po lewej stronie zera tutaj.",
    "compute-2":
      "Teraz podstawy są takie same. Logarytm z potęgi dwójki oddaje wykładnik, czyli minus cztery. Nie ma już ukrytego rachunku wprost tutaj.",
    result:
      "Odpowiedź to minus cztery. Znak ujemny ma sens, bo potęga ujemna prowadzi z liczby większej od jedności do ułamka. Sprawdzamy wstecz: dwa do potęgi minus czwartej daje jeden przez szesnaście, to zamyka sprawdzenie całej definicji logarytmu.",
    insight:
      "Wniosek: przy logarytmie z definicji nie szukamy sztuczki. Najpierw przepisujemy liczbę logarytmowaną jako potęgę podstawy. Kiedy to się uda, odpowiedzią jest wykładnik. Dlatego logarytm warto czytać jak pytanie, nie jak osobny wzór, potem sprawdź odpowiedź, wracając do potęgi, z której wyszedł zapis."
  },
  "g-th-02": {
    present:
      "Trzeci przykład przechodzi z pojedynczego wyniku na cały zbiór liczb. Zapis w klamrze mówi: bierzemy wszystkie liczby rzeczywiste x, które spełniają jednocześnie warunek z lewej i warunek z prawej na wspólnej osi liczbowej od razu.",
    restate:
      "Szukamy zapisu przedziału oraz jego długości. To są dwa różne zadania na tym samym rysunku. Zapis przedziału zależy od pustych i pełnych końców. Długość zależy od odległości między końcami osi, dlatego będziemy je odczytywać po kolei, bez mieszania znaczeń w jednym kroku.",
    plan:
      "Plan jest graficzny. Lewy koniec rozstrzygamy osobno, prawy koniec osobno. Potem mierzymy odległość między nimi. Najpierw decydujemy o kółkach, dopiero potem o liczbie. To utrzyma porządek całego rozwiązania.",
    "compute-1":
      "Przy minus trzy mamy znak nieostry. To znaczy, że minus trzy należy do zbioru. Na osi byłby punkt pełny, więc przedział będzie domknięty z lewej.",
    "compute-2":
      "Przy siedem mamy znak ostry. To znaczy, że siedem nie należy do zbioru. Na osi byłby punkt pusty, więc prawy nawias jest okrągły.",
    "compute-3":
      "Długość to prawy koniec minus lewy koniec. Odejmujemy minus trzy, więc odległość wynosi dziesięć jednostek na osi od lewej do prawej.",
    result:
      "Odpowiedź ma dwie części. Zbiór A zapisujemy jako przedział od minus trzy z końcem pełnym do siedmiu z końcem pustym. Jego długość wynosi dziesięć. Oba wyniki czytamy z tego samego rysunku, najpierw zbiór, potem miarę odcinka.",
    insight:
      "Wniosek: nawias decyduje o przynależności końca, ale nie zmienia odległości między końcami. Długość czytamy z osi. Dlatego zawsze oddzielaj pytanie o należenie końców od pytania o samą odległość. Pełny koniec zostaje, pusty koniec odpada, ale długość pozostaje ta sama dla całego odcinka."
  }
};

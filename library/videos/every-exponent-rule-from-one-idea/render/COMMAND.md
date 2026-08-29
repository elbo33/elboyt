# Render — „Potęgi i pierwiastki" / *Every exponent rule from one idea*

Long-form, 1920x1080, 30 fps, no voiceover. 20 chapters. On-screen language: Polish.
Matura chapter I · *Liczby rzeczywiste* → *Potęgi i pierwiastki* (poziom podstawowy).

## Reproduce

From `ai-math-longform-generator/`:

```bash
npm install
MANIM_PYTHON=../ai-math-shorts-generator/.venv/bin/python \
  npm run generate -- --planner powers-roots-long \
  "Every exponent rule from one idea"
```

This writes `generated/video.mp4`. Copy only that file back to
`library/videos/every-exponent-rule-from-one-idea/` (overwriting the existing
final), then delete `generated/` and `public/`.

## What's in this folder

- `powersRootsLongPlanner.ts` — the planner: chapter list + embedded Manim per chapter.
- `storyboard.json` — the resolved plan (chapter titles, order, re-synced durations).
- `scenes/` — the Manim source the pipeline generated and rendered, one file per
  chapter, plus `support/` (shared style, colours, and the repeated
  `build_exponent_example` template).

## The one idea

`aⁿ` counts how many times `a` is written as a factor. Multiplying `aᵐ · aⁿ`
just writes `m` factors, then `n` more — `m + n` factors. That single law,
"wykładniki się dodają przy mnożeniu", forces every other rule:
`(aᵐ)ⁿ = aᵐⁿ`, `a⁰ = 1`, `a⁻ⁿ = 1/aⁿ`, `a^(1/n) = ⁿ√a`, `aᵐ/aⁿ = aᵐ⁻ⁿ`.

## Chapter order

wstęp → plan → podstawy → główna budowa → 8 przykładów (`aᵐ·aⁿ = aᵐ⁺ⁿ`, jeden
wspólny szablon) → sprawdzenie wzoru → duży przypadek (2¹⁰·2¹⁵) → dlaczego to
działa (liczenie czynników) → jedno prawo → (aᵐ)ⁿ, a⁰, a⁻ⁿ → pierwiastek jako
wykładnik 1/n → algebra (wszystkie reguły z jednej) → podsumowanie → koniec.

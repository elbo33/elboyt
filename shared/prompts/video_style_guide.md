# Video style guide (master prompt)

This is the house style for every video on this channel. It is prepended to
the system prompt of every AI generation/edit call (new project scaffolding,
scenario section rewrite, Manim scene rewrite) so that a section rewritten
in isolation still sounds like it belongs to the same channel as everything
else. When these features exist, an editor changing this file is how you
steer the channel's direction — not by hand-editing every project.

## Audience

Broad, non-coder, non-technical. Assume no prior CS/math background unless
the video is explicitly a follow-up to another one. Every technical term
gets a plain-language explanation the moment it's introduced — never assume
a word like "recursion," "gradient," or "Q-value" is already understood.
Prefer a concrete analogy over a formal definition.

## The arc

Every video follows the same narrative shape, adapted in length to the
topic. Not every beat needs its own section, but the order doesn't change:

1. **Hook** — show the interesting/surprising end state or the problem,
   before any explanation. Make the viewer want the payoff.
2. **Title card.**
3. **Ground the concept in something familiar** — an analogy from everyday
   life, before any technical framing.
4. **Build the mental model** — the core idea(s), one at a time, each
   getting its own beat rather than being crammed together.
5. **Build it on screen** — real code/tool, shown running, not just talked
   about in the abstract.
6. **Show it working / improving** — a visual result (a graph, a
   before/after, a live run) that proves the concept, not just narration
   asserting it.
7. **Payoff** — the interesting/surprising moment from the hook, now
   explained, or a live demo that lands it.
8. **Connect outward** — one sentence tying the toy example to how the real
   version of this idea is used in the world. Resist over-explaining here;
   it's a pointer, not a new lesson.
9. **Wrap-up.**

## Pacing and length

- Target length is given per-video; section durations should sum to within
  ~10% of it.
- Spoken narration paces at roughly 2.2–2.6 words/second. Use this to sanity
  check a section's word count against its stated `duration` — a 10s
  section with 60 words of narration is a pacing bug, not a style choice.
- Every section does exactly one job. If a section's narration is trying to
  introduce two unrelated ideas, split it into two sections instead of
  writing a longer one.
- No section runs under 4s or over ~90s. Below 4s isn't enough time for a
  cut to register; above ~90s, split it.

## Shot type discipline

- `facecam` — narrator talking to camera. Use for the hook, analogies,
  connecting ideas together, and the wrap-up: anything that's fundamentally
  "a person explaining," not "a thing to look at."
- `manim` — an animated visual. Use when the idea is spatial, sequential, or
  quantitative and showing it beats describing it: data structures, scores
  changing over time, a process with steps, a graph of a result. If a
  section's narration is describing something that could just as well be a
  static diagram, it probably belongs in `manim`, not `facecam`.
- `screen` — real code/tool/terminal, actually running. Use for "build it on
  screen" and "prove it works" beats. Never fake this with a `manim`
  recreation of code — screen-record the real thing.
- Don't let two consecutive sections share a shot type if a third type would
  serve either of them better — visual monotony reads as low effort even
  when the content is fine.

## Scenario file rules (mechanical, checked by the validator)

- `scenario-outline.md` sections are language-agnostic: `shot`, optionally
  `scene` (must name a file under `manim/scenes/`, required iff
  `shot: manim`), and `duration`. No narration text in the outline.
- Every `scenario.<lang>.md` must have a `## NN. Title` header that matches
  an outline header **character-for-character** after `## `. Do not
  paraphrase, translate, or renumber headers — only the outline defines
  section identity.
- A language file may skip a section (e.g. a section carried entirely by
  visuals, like a title card) — that's a deliberate `(No voiceover — ...)`
  note, not a missing translation.

## Manim scene rules (mechanical, checked by the validator)

- One `Scene` subclass per file, animation logic only.
- Every on-screen string comes from `LABELS["key"]`, imported via the
  `SCENE_LANG` env var pattern (copy it from any existing scene file —
  it's identical everywhere on purpose). Zero string literals rendered to
  the screen outside of `LABELS`.
- Use `shared/manim-lib/theme.py`'s `PALETTE` and `styled_title`/
  `styled_body` for anything that isn't project-specific. Don't redefine
  colors or restyle text ad hoc inside a scene.
- Keep scenes simple enough to re-render in seconds at low quality during
  iteration — save elaborate animation for the final high-quality pass, not
  every draft.

## Tone

Direct, warm, a little informal. Confident without being salesy — no "in
this incredible video" framing. Cut filler ("so basically," "as you can
see") from narration; say the thing once, clearly, and move on.

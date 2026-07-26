"""Builds the prompt for scaffolding an entirely new project from a short
idea, a target length, and a set of languages — and validates the
structured draft that comes back. Writing the draft's files under
projects/<slug>/ is the caller's job (see webapp/project_writer.py).

The model replies with one JSON object describing every file at once,
rather than several free-text files, so the two invariants that matter
most (scenario section headers matching exactly, and every LABELS[...] key
a scene uses existing in every language's labels file) are guaranteed by
construction: the platform assembles the actual files from this one
shared shape instead of trusting several independent text outputs to
agree with each other.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from llm_client import generate  # noqa: E402
from style_guide import load_style_guide  # noqa: E402
from validate import validate_new_project  # noqa: E402

_JSON_SHAPE_EXAMPLE = """{
  "slug": "short-kebab-case-idea",
  "titles": [{"lang": "en", "text": "The Video's Title"}],
  "sections": [
    {
      "id": "01",
      "title": "Cold Open",
      "shot": "facecam",
      "scene": "",
      "duration_seconds": 15,
      "narration": [{"lang": "en", "text": "Narration for this section, in English."}]
    },
    {
      "id": "02",
      "title": "Title Card",
      "shot": "manim",
      "scene": "title_card",
      "duration_seconds": 5,
      "narration": [{"lang": "en", "text": "(No voiceover — title card carries the beat.)"}]
    }
  ],
  "scenes": [
    {
      "name": "title_card",
      "class_name": "TitleCard",
      "source": "import importlib\\nimport os\\n\\nfrom manim import FadeIn, FadeOut, Scene\\n\\nfrom theme import styled_title\\n\\nLANG = os.environ.get(\\"SCENE_LANG\\", \\"en\\")\\nLABELS = importlib.import_module(f\\"labels.labels_{LANG}\\").LABELS\\n\\n\\nclass TitleCard(Scene):\\n    def construct(self):\\n        title = styled_title(LABELS[\\"title\\"])\\n        self.play(FadeIn(title))\\n        self.wait(1)\\n        self.play(FadeOut(title))\\n"
    }
  ],
  "labels": [
    {"lang": "en", "entries": [{"key": "title", "text": "The Video's Title"}]}
  ]
}"""

_USER_PROMPT_TEMPLATE = """Scaffold a brand new video project from this idea:

{idea}

Target length: {target_length_seconds} seconds total.
Languages to write narration and labels for: {languages}.

Reply with ONLY one JSON object (no markdown fence, no commentary) shaped
exactly like this example — same top-level keys, same nesting:

{json_shape_example}

Rules, on top of everything in the style guide above:
- "slug": a short kebab-case idea slug, no number prefix (the platform
  adds that itself), e.g. "tic-tac-toe-ai" not "003-tic-tac-toe-ai".
- "sections": cover the full story arc from the style guide. "id" is a
  zero-padded string ("01", "02", ...). "shot" is exactly one of facecam
  / manim / screen. "scene" is the scene name (must match a "name" in
  "scenes") when shot is "manim", and "" otherwise. Section durations
  should sum to within about 10% of the target length.
- "narration": one entry per requested language for every section, even
  a manim-only section — for those, write "(No voiceover — ...)"
  explaining what carries the beat, exactly like the example, rather than
  omitting the entry.
- "scenes": one entry per distinct scene name referenced by a section.
  "source" is the complete Python source for that scene file as a single
  string (use \\n for newlines) — copy the SCENE_LANG/LABELS import
  boilerplate from the example verbatim, use `shared/manim-lib/theme.py`'s
  PALETTE/styled_title/styled_body for styling, and reference on-screen
  text only via LABELS["key"] lookups, never a hardcoded string.
- "labels": one entry per requested language, each with every LABELS key
  every scene actually uses — a key referenced by a scene but missing from
  some language's entries will fail validation.
"""


def _parse_and_validate(raw: str, languages: list[str]) -> tuple[dict | None, list[str]]:
    try:
        draft = json.loads(raw)
    except json.JSONDecodeError as exc:
        return None, [f"model did not return valid JSON: {exc}"]
    if not isinstance(draft, dict):
        return None, ["model's JSON was not an object"]

    errors = validate_new_project(
        draft.get("sections", []), draft.get("scenes", []), draft.get("labels", [])
    )

    if not draft.get("slug"):
        errors.append("draft has no slug")

    title_langs = {t.get("lang") for t in draft.get("titles", [])}
    for lang in languages:
        if lang not in title_langs:
            errors.append(f"no title given for requested language {lang!r}")

    for section in draft.get("sections", []):
        have = {n.get("lang") for n in section.get("narration", [])}
        for lang in sorted(set(languages) - have):
            errors.append(f"section {section.get('id')} has no narration entry for language {lang!r}")

    return draft, errors


def propose_new_project(
    *, idea: str, target_length_seconds: int, languages: list[str]
) -> tuple[dict | None, list[str]]:
    """Returns (draft, errors). An empty errors list means the draft is
    safe to write to projects/<slug>/ (see webapp/project_writer.py).

    Retries once, feeding the previous attempt and its validation errors
    back to the model, before giving up and surfacing the errors to the
    human rather than writing a broken project.
    """
    system = load_style_guide()
    user = _USER_PROMPT_TEMPLATE.format(
        idea=idea,
        target_length_seconds=target_length_seconds,
        languages=", ".join(languages),
        json_shape_example=_JSON_SHAPE_EXAMPLE,
    )

    raw = generate(system, user, json_mode=True)
    draft, errors = _parse_and_validate(raw, languages)

    if errors:
        retry_user = (
            f"{user}\n\nYour previous reply was:\n{raw}\n\n"
            "It failed validation with these errors:\n- "
            + "\n- ".join(errors)
            + "\n\nReply again with a corrected, complete JSON object (not a"
            " diff or partial update) fixing all of the above."
        )
        raw = generate(system, retry_user, json_mode=True)
        draft, errors = _parse_and_validate(raw, languages)

    return draft, errors

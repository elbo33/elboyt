"""Builds the prompt for revising one Manim scene's animation code and
validates the result. This module only proposes source — rendering a
preview and writing an accepted proposal to `manim/scenes/<scene>.py` are
the caller's job (see `webapp/scene_editor.py` and
`render_pipeline.render_scene_preview`), so a rejected/never-rendered
proposal never touches a real file.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from llm_client import generate  # noqa: E402
from style_guide import load_style_guide  # noqa: E402
from validate import validate_scene_source  # noqa: E402

_USER_PROMPT_TEMPLATE = """Video: {project_title}
Scene file: manim/scenes/{scene}.py

Shared theme helpers available (from shared/manim-lib/theme.py) — reuse
these for color/typography, don't redefine colors or restyle text ad hoc:
---
{theme_source}
---

Current scene source:
---
{current_source}
---

Requested change: {feedback}

Reply with ONLY the full replacement Python source for this scene file —
no markdown code fence, no commentary before or after. Keep the
SCENE_LANG / LABELS import block exactly as it is unless the requested
change genuinely requires touching it. Every on-screen string must come
from a LABELS[...] lookup — only reference LABELS keys that already exist
in the current source above, do not invent new ones."""


def propose_scene_revision(
    *,
    project_title: str,
    scene: str,
    theme_source: str,
    current_source: str,
    feedback: str,
) -> tuple[str, list[str]]:
    """Returns (proposed_source, validation_errors).

    An empty errors list means the proposal is safe to render a preview
    from and offer a human for accept/reject; a non-empty list means it
    failed a structural check (see `validate.py`).
    """
    system = load_style_guide()
    user = _USER_PROMPT_TEMPLATE.format(
        project_title=project_title,
        scene=scene,
        theme_source=theme_source,
        current_source=current_source,
        feedback=feedback,
    )
    proposed = generate(system, user).strip()
    errors = validate_scene_source(proposed)
    return proposed, errors

"""Builds the prompt for revising one scenario section's narration and
validates the result. This module only proposes text — writing an accepted
proposal back to `scenario.<lang>.md` is the caller's job (see
`webapp/scenario_editor.py`), so a rejected proposal never touches disk.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from llm_client import generate  # noqa: E402
from style_guide import load_style_guide  # noqa: E402
from validate import validate_section_body  # noqa: E402

_USER_PROMPT_TEMPLATE = """Video: {project_title}

Full outline, for pacing/context only — revise ONLY the one section below,
do not touch or reference changing any other section:
---
{outline_text}
---

Full current script in this language, for tone/context only:
---
{lang_text}
---

You are revising ONLY this section:
Header: {section_header}

Current narration for this section:
---
{current_body}
---

Requested change: {feedback}

Reply with ONLY the replacement narration text for this section's body. No
header line, no markdown code fence, no commentary before or after — just
the narration text itself, ready to drop into the script file."""


def propose_section_revision(
    *,
    project_title: str,
    outline_text: str,
    lang_text: str,
    section_header: str,
    current_body: str,
    feedback: str,
) -> tuple[str, list[str]]:
    """Returns (proposed_body, validation_errors).

    An empty errors list means the proposal is safe to offer a human for
    accept/reject; a non-empty list means it failed a structural check
    (see `validate.py`) and must not be offered as accept-able as-is.
    """
    system = load_style_guide()
    user = _USER_PROMPT_TEMPLATE.format(
        project_title=project_title,
        outline_text=outline_text,
        lang_text=lang_text,
        section_header=section_header,
        current_body=current_body,
        feedback=feedback,
    )
    proposed = generate(system, user).strip()
    errors = validate_section_body(proposed)
    return proposed, errors

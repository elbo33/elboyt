"""The one place that calls out to an LLM.

Every AI feature (scenario rewrite, scene rewrite, project scaffolding)
goes through `generate()` here instead of importing an SDK directly.
Swapping providers later means changing this file only.

Configuration is via environment variables, not hardcoded:

    OPENAI_API_KEY     required. Your OpenAI API key.
    ELBOYT_LLM_MODEL    required. The model to call, e.g. "gpt-4.1" or
                        whatever your account has access to — deliberately
                        not defaulted here so this never silently calls a
                        model you didn't choose.

Both are also read from a `.env` file at the repo root if present (loaded
below via python-dotenv), so you don't have to `export` them in every shell
session. `.env` is gitignored — it must never be committed.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class LLMConfigError(Exception):
    pass


def generate(system: str, user: str, *, json_mode: bool = False) -> str:
    """Send one system+user turn to the configured model, return its text.

    No conversation history, no tool calls, no streaming — every AI feature
    in this platform is "here's context + an instruction, give me back
    text (or a full file) to review," which is exactly the flows in
    ROADMAP.md Milestones 5-7. If a future feature needs multi-turn or
    streaming, extend this function rather than bypassing it.

    `json_mode=True` (used by Milestone 7's project scaffolder, which asks
    for one JSON object describing several files at once) sets OpenAI's
    "JSON mode": it guarantees syntactically valid JSON, not that it
    matches any particular shape — the caller still validates the parsed
    structure itself.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise LLMConfigError("OPENAI_API_KEY is not set.")
    model = os.environ.get("ELBOYT_LLM_MODEL")
    if not model:
        raise LLMConfigError(
            "ELBOYT_LLM_MODEL is not set — pick the model this platform should "
            "call (e.g. `export ELBOYT_LLM_MODEL=gpt-4.1`) and try again."
        )

    # Imported lazily so importing this module never requires the `openai`
    # package unless generate() is actually called.
    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    extra_kwargs = {"response_format": {"type": "json_object"}} if json_mode else {}
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        **extra_kwargs,
    )
    return response.choices[0].message.content or ""

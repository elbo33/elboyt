#!/usr/bin/env python3
"""Sanity-check the LLM client against a real API key, no webapp needed.

    export OPENAI_API_KEY=sk-...
    export ELBOYT_LLM_MODEL=gpt-4.1
    python shared/ai-lib/try_prompt.py "Say hello in one sentence."
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from llm_client import generate  # noqa: E402
from style_guide import load_style_guide  # noqa: E402


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: python try_prompt.py <user message>", file=sys.stderr)
        return 1
    print(generate(load_style_guide(), sys.argv[1]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

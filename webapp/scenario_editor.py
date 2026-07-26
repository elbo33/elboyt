"""Mechanical read/write of a single scenario section's body text.

Deliberately separate from `read_model.py` (read-only, HTML-rendering,
cached) — this module does raw text surgery on `scenario.<lang>.md`: find
the line `## <header>`, replace only the lines up to the next `## ` header
(or EOF), and leave every other byte in the file untouched. That's what
keeps an AI-proposed edit's diff to exactly the section that changed.
"""

from __future__ import annotations

from pathlib import Path


class SectionNotFoundError(Exception):
    def __init__(self, header: str):
        super().__init__(f"no such section header: {header!r}")
        self.header = header


def _section_bounds(lines: list[str], header: str) -> tuple[int, int]:
    """Returns (body_start, body_end) line indices: lines[body_start:body_end]
    is everything between the header line and the next header line (or EOF).
    """
    marker = f"## {header}"
    header_index = None
    for i, line in enumerate(lines):
        if line.rstrip("\n") == marker:
            header_index = i
            break
    if header_index is None:
        raise SectionNotFoundError(header)

    body_end = len(lines)
    for i in range(header_index + 1, len(lines)):
        if lines[i].startswith("## "):
            body_end = i
            break
    return header_index + 1, body_end


def get_section_body(lang_path: Path, header: str) -> str:
    lines = lang_path.read_text().splitlines(keepends=True)
    start, end = _section_bounds(lines, header)
    return "".join(lines[start:end]).strip()


def replace_section_body(lang_path: Path, header: str, new_body: str) -> None:
    lines = lang_path.read_text().splitlines(keepends=True)
    start, end = _section_bounds(lines, header)

    body_lines = [f"{ln}\n" for ln in new_body.strip("\n").splitlines()] or [""]
    replacement = list(body_lines)
    if end < len(lines):
        replacement.append("\n")

    lines[start:end] = replacement
    lang_path.write_text("".join(lines))

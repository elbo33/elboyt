# New project checklist

1. Rename this directory to `<NNN-project-slug>` and move it under `projects/`.
2. Fill in `project.yaml`.
3. Edit `scenario/scenario-outline.md`, then `scenario/scenario.en.md` (add
   more `scenario.<lang>.md` files for additional languages — same section
   headers, translated narration).
4. Edit or replace `manim/scenes/intro_hello.py` and its
   `manim/labels/labels_en.py` (add `labels_<lang>.py` per language). Add
   more scene files the same way.
5. Render: `python manim/render.py` (see that file's docstring for options),
   or use the web platform.

Full convention docs: the repo's top-level `README.md`.

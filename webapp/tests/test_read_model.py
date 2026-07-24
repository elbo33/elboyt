"""Tests for the read model against the real example project fixture
(projects/001-example-project). No web framework involved — this is the
whole point of keeping read_model.py decoupled.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import read_model  # noqa: E402

SLUG = "001-example-project"


def setup_function(_):
    read_model.clear_cache()


def test_list_projects_finds_example():
    projects = read_model.list_projects()
    slugs = [p.slug for p in projects]
    assert SLUG in slugs


def test_project_languages_include_en_fr_pl():
    project = read_model.get_project(SLUG)
    assert set(project.languages) >= {"en", "fr", "pl"}


def test_project_scenes_discovered():
    project = read_model.get_project(SLUG)
    assert set(project.scenes) == {"title_card", "big_idea"}


def test_scenario_sections_parsed_in_order():
    scenario = read_model.get_scenario(SLUG, "en")
    ids = [s.section_id for s in scenario.sections]
    assert ids == ["01", "02", "03", "04", "05", "06"]


def test_scenario_shot_types_and_scene_links():
    scenario = read_model.get_scenario(SLUG, "en")
    by_id = {s.section_id: s for s in scenario.sections}
    assert by_id["01"].shot_type == "facecam"
    assert by_id["02"].shot_type == "manim"
    assert by_id["02"].scene == "title_card"
    assert by_id["04"].scene == "big_idea"
    assert by_id["05"].shot_type == "screen"


def test_scenario_narration_rendered_as_html():
    scenario = read_model.get_scenario(SLUG, "en")
    hook = next(s for s in scenario.sections if s.section_id == "01")
    assert hook.narration_html is not None
    assert "<p>" in hook.narration_html
    assert "Recursion looks like magic" in hook.narration_html


def test_scenario_matches_across_languages_by_header():
    en = read_model.get_scenario(SLUG, "en")
    fr = read_model.get_scenario(SLUG, "fr")
    assert [s.title for s in en.sections] == [s.title for s in fr.sections]
    assert fr.sections[0].narration_html is not None
    assert "récursivité" in fr.sections[0].narration_html


def test_scenario_missing_language_reports_missing_sections():
    scenario = read_model.get_scenario(SLUG, "de")
    assert all(s.narration_html is None for s in scenario.sections)


def test_list_renders_reports_size_and_duration_for_existing_render():
    renders = read_model.list_renders(SLUG, "en")
    by_scene = {r.scene: r for r in renders}
    assert "title_card" in by_scene
    info = by_scene["title_card"]
    assert info.filename == "title_card.mp4"
    assert info.size_bytes > 0
    assert info.duration_seconds is not None
    assert info.duration_seconds > 0


def test_list_renders_empty_before_any_render():
    # A language nothing has been rendered for yet should just be empty,
    # not an error.
    renders = read_model.list_renders(SLUG, "zz-not-a-real-lang")
    assert renders == []


def test_unknown_project_raises():
    import pytest

    with pytest.raises(read_model.ProjectNotFoundError):
        read_model.get_project("does-not-exist")

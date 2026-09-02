"""Format-driven Manim configuration.

The single place that turns a format id (env `MANIM_FORMAT`, set by the TS
renderer) into Manim's pixel/frame dimensions. Every scene module imports this
before anything else so `config.*` is set once, consistently. `style.py` no
longer sets dimensions itself.
"""
import os

from manim import config

from .colors import BACKGROUND

_FORMATS = {
    #                 pixels        Manim frame units      bottom safe band
    "longform-16x9": dict(pw=1920, ph=1080, fw=14.222222, fh=8.0, safe=0.0),
    "short-9x16": dict(pw=1080, ph=1920, fw=9.0, fh=16.0, safe=0.25),
    "still-16x9": dict(pw=1920, ph=1080, fw=14.222222, fh=8.0, safe=0.0),
    "still-9x16": dict(pw=1080, ph=1920, fw=9.0, fh=16.0, safe=0.25),
}

FORMAT_ID = os.environ.get("MANIM_FORMAT", "longform-16x9")
_F = _FORMATS.get(FORMAT_ID, _FORMATS["longform-16x9"])

config.pixel_width = _F["pw"]
config.pixel_height = _F["ph"]
config.frame_width = _F["fw"]
config.frame_height = _F["fh"]
config.frame_rate = 30
config.background_color = BACKGROUND

FRAME_W = _F["fw"]
FRAME_H = _F["fh"]
IS_VERTICAL = _F["ph"] > _F["pw"]
SAFE_BOTTOM_FRAC = _F["safe"]

# --- global dwell scale ---------------------------------------------------
# The long form is a slow lecture: every step stays on screen long enough for
# someone who does not know the topic to read it. Shorts compress hard. One
# knob, imported by archetypes / templates / compute — env MANIM_DWELL overrides.
LONGFORM_DWELL = float(os.environ.get("MANIM_DWELL", "3.4"))
_RT_SLOW = 1.4  # run_times stretch less than holds — sluggish motion reads worse than a long hold
# The short is a trailer, not a compressed lecture: still readable, but every
# hold short and every reveal quick. Not the lecture pace halved.
_HOLD_FAST = float(os.environ.get("MANIM_DWELL_FAST", "1.35"))
_RT_FAST = 0.85


def hold(scene, seconds, pace="slow"):
    """A reading hold."""
    scene.wait(seconds * (LONGFORM_DWELL if pace != "fast" else _HOLD_FAST))


def rt(seconds, pace="slow"):
    """An animation run_time."""
    return seconds * (_RT_SLOW if pace != "fast" else _RT_FAST)
# Anything drawn must stay above this y (Manim units). 0 unless the format
# reserves a bottom band (shorts: the platform-UI no-go zone).
SAFE_BOTTOM_Y = -_F["fh"] / 2 + _F["fh"] * _F["safe"]

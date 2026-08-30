# Reproduce

```
.venv/bin/python scripts/make_stills.py library/stills/ciag-arytmetyczny-teoria/render/stills.json
```

1:1 (1080x1080) stills. Each lifts one frame from an existing render (here the
four shorts under library/shorts/), centre-crops it into the top of a
house-styled square (dark ground + add_texture-style grid), and adds a caption
panel: letter-spaced tag, accent rule, bold headline. No Manim re-run.

Note: the ciag-arytmetyczny-teoria episode's per-scene clips were not retained,
so these are sourced from the shorts. To source stills from the episode itself,
keep generated/scenes/renders/ after that episode's render.

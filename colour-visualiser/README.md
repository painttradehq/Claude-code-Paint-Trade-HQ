# Wall Colour Visualiser (prototype)

Standalone web prototype: repaint a photo of a real job.

- Open `index.html` in any browser. No build step, no server, no dependencies.
- Photos are processed in the browser only; nothing is uploaded anywhere.
- Tap to fill a wall, adjust Sensitivity, tidy with brush/eraser, one colour per surface.
- "Save picture" exports the painted photo with a colour schedule strip.
- Starter colours are generic. Brand/colour names are typed in by the painter.

Status: prototype, not wired into the Paint Trade HQ app.

## Running it

Smart detect needs the page served over http so it can load its model files:

    cd colour-visualiser && python3 -m http.server 8000

then open http://localhost:8000. Opened straight from disk (file://) it still works,
but falls back to the simpler edge fill.

## Wall detection

- **Smart detect (default):** Segment Anything (SlimSAM, Apache 2.0) runs in the browser.
  Each photo is prepared once (about 8 s on a desktop CPU in testing), then each tap takes
  a fraction of a second. A tap yields three candidate outlines; medium is the default and
  the Sensitivity slider steps to the smaller or larger one.
- **Edge fill (fallback / toggle off):** classical edge-aware flood fill.
- Both are finished with a guided filter that snaps the paint line to the photo's edges.

## Test results (92 labelled walls in 52 real home interiors)

Score = overlap with the hand-labelled visible wall (1.0 is perfect).

| | Edge fill | Smart detect |
|---|---|---|
| One tap, default setting | 0.47 | 0.54 |
| Best of the three slider positions | 0.54 | 0.69 |
| Walls scoring above 0.8 (best slider position) | 18% | 41% |

Not tested: phones, exteriors, real job photos, and the published artifact's sandbox.
Scripts are in `tests/` (`build_set.py` fetches the research-only test photos; do not commit them).
See `THIRD_PARTY.md` for licences.

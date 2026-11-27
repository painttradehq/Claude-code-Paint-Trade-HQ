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

### Trim, doors and drag-to-select (39 labelled trim pieces and 19 walls in 32 real photos)

Dragging across a surface in the fill tool sends up to six points to the model and uses the
tightest outline. Drags in the test were simulated from points spread over the labelled surface.

| Finished outline | Edge fill | Tap | Drag |
|---|---|---|---|
| Skirting (only 3 examples) | 0.61 | 0.38 | 0.67 |
| Door and window frames (20) | 0.31 | 0.53 | 0.68 |
| Doors (16) | 0.44 | 0.71 | 0.87 |
| Walls (19) | 0.41 | 0.60 | 0.68 |
| Share of trim painted by a wall selection | 5% | 9% | 16% |

Tried and removed because they did not hold up: defaulting to the tight outline when it is thin
(helped trim, hurt walls and doors), and re-cutting outlines along edges with a watershed (no gain).

### Every element at three photo qualities (77 labelled pieces in 52 real home photos)

"Typical phone" and "poor phone" are the same photos degraded with soft focus, grain, dim light,
a colour cast, hand shake and heavy JPEG compression (`tests/degrade_set.py`).

| Drag (finished outline) | Wall | Ceiling | Door | Cabinet | Frame | Skirting (3 only) | All |
|---|---|---|---|---|---|---|---|
| Sharp | 0.73 | 0.82 | 0.89 | 0.86 | 0.71 | 0.67 | 0.79 |
| Typical phone | 0.71 | 0.81 | 0.86 | 0.85 | 0.68 | 0.53 | 0.77 |
| Poor phone | 0.63 | 0.77 | 0.83 | 0.83 | 0.57 | 0.51 | 0.71 |

Single tap, all elements: 0.60 sharp, 0.59 typical, 0.54 poor. Edge fill: 0.41, 0.42, 0.34.

### Five real job photos (visual check, no labels)

Run with `tests/job_test.js` using real taps and drags. Good: smooth walls, ceilings, doors, garage
doors, a timber gate, feature fins. Weak: panelised facades (selected panel by panel, patchy),
cream walls beside cream cabinets (blotchy spill), windows inside a rendered wall (painted with it),
white cornice under a white ceiling (Trim line catches only part), and repainting very dark glossy
trim white (comes out grey and patchy).

## Tools

- **Select:** tap a surface, or drag across it for a tighter selection. A new selection never takes
  pixels another surface already owns, so paint trim first and the wall stops at it.
- **Trim line:** drag along skirting, cornice, architraves or frames. It fits a straight line to the
  drag, then for each nearby offset and small tilt averages the colour step across that line along its
  whole length, so faint but consistent edges stand out from grain. The strip is the band between the
  pair of edge lines whose weaker side is strongest; each side keeps its own tilt, so tapering strips
  stay straight-edged. Long or lens-curved runs are read as a chain of shorter pieces. Where no clear
  band shows it paints nothing. Max width limits the band; Sensitivity sets how faint an edge counts.

  On the five job photos (`tests/job_test.js`, one drag per run): hallway skirting full length and
  crisp; living room timber skirting and ornate cornice full length; brick pier caps two of three.
  Not found: the hallway's white cornice under a white ceiling, and a thin roof fascia.
- **Brush / Eraser:** by hand, optionally staying inside edges.

Not tested: phones, and the published artifact's sandbox.
Scripts are in `tests/` (`build_set.py` fetches the research-only test photos; do not commit them).
See `THIRD_PARTY.md` for licences.

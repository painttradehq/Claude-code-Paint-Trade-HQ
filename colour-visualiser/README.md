# Wall Colour Visualiser (prototype)

Standalone web prototype: repaint a photo of a real job.

- Open `index.html` in any browser. No build step, no server, no dependencies.
- Photos are processed in the browser only; nothing is uploaded anywhere.
- Tap to fill a wall, adjust Sensitivity, tidy with brush/eraser, one colour per surface.
- "Save picture" exports the painted photo with a colour schedule strip.
- Starter colours are generic. Brand/colour names are typed in by the painter.

Status: prototype, not wired into the Paint Trade HQ app.

Wall detection (v2) is classical image processing, no AI model:
- an edge map measured between averaged patches, so grain is ignored and soft edges are caught
- a fill that stops at edges, cannot squeeze through small gaps, and walks up to the edge line
- a guided filter that snaps the paint line to the photo's edges
- a brush/eraser that spreads only from where the stroke started and stops at edges

Tested only on generated test images (including a white-on-white room with soft
focus, grain and JPEG compression), not yet on real job photos. Low-contrast
edges, heavy texture (brick, weatherboards) and strong shadows will still need
the Sensitivity slider and brush touch-ups.

# Wall Colour Visualiser (prototype)

Standalone web prototype: repaint a photo of a real job.

- Open `index.html` in any browser. No build step, no server, no dependencies.
- Photos are processed in the browser only; nothing is uploaded anywhere.
- Tap to fill a wall, adjust Sensitivity, tidy with brush/eraser, one colour per surface.
- "Save picture" exports the painted photo with a colour schedule strip.
- Starter colours are generic. Brand/colour names are typed in by the painter.

Status: prototype, not wired into the Paint Trade HQ app. Wall detection is a
colour-similarity flood fill, so white walls next to white trim/ceilings need
the Sensitivity slider and brush touch-ups.

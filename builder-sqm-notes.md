# Round 97 — Square metres beside W L H: measured or typed (10 November) — PROTOTYPED, waits for Josh's look, then "send" after Round 96

Prototype: **`estimate-builder-sqm.html`** (open at 1440: every area header now ends *W · L · H · m²*; the Kitchen's m² reads 15.1 in grey, filled from 4.2 × 3.6; scroll to **Deck & Stairs** — no dimensions, the Decking line waits, the header says *floor — type the m² or give W and L* → type **38** in the m² box → the line is 38 m², priced, the header reads *floor 38 m² (typed)* and the box carries a *typed ×* tag → type W 6 and L 5: the typed 38 still wins → × on the tag: back to W × L = 30 → the paint card follows; then 1024). Built from the Round 89 builder by `tools/make_sqm.py`; Playwright `tools/test_sqm.js` **18/18** at 1440 and 1024. Josh, 10 Nov: *"a client sent 38 m² for a deck and I have no measurements — add a m² box that fills itself as W/L/H are typed but can be written when all we have is the area."*

## 1. Today, and why the deck shows nothing

`components/estimate/v2/estModel.ts:22 derived` counts an area as measured only when **W, L and H are all set**, and `:24 autoQty` gives every m² line that is not a ceiling the **wall** area 2(W+L)×H. So a *Decking* line in an area with only W and L gets nothing, and with a height typed gets the wall area, which is wrong for a deck. The per-line typed quantity exists (`LinePanel.tsx:34`, auto off) but is not where the eye goes.

## 2. The m² box (`area-sqm-{id}`)

- In the area header, after **W · L · H · m**: a thin divider, the label **m²**, and a box.
  - **Auto:** when the box has no typed value it shows **W × L** in grey as soon as W and L exist (the Kitchen's 15.1), empty before that.
  - **Typed:** type a number and it is the area's floor area; the box turns accent with bold text and a small **typed ×** tag (`area-sqm-typed-{id}`); the × (`data-sqclear`) clears it and W × L takes over again. Clearing the box by hand does the same.
  - Typing W or L while a typed value exists does not overwrite it — the typed number wins until cleared; the tag is the reminder.
- Stored on the area: `sqm: number | 0` beside `width, length, height` (`areas[].sqm`, `PUT /estimates/{id}` accepts it, 0–100 000, 0.1 steps).
- The same box in the Add-work sheet's measure strip, which now shows whenever a line of the area still lacks what it needs (not only when H is missing).

## 3. Which face each line takes

`estModel.ts`:

- `derived(a)` returns, per face: `floor = sqm > 0 ? sqm : W × L`, `ceiling = floor`, `walls = 2(W+L)×H`, `linear = 2(W+L)`, and whether each is measured: `floorMeasured` (floor > 0), `wallsMeasured` (W, L and H), `linearMeasured` (W and L), plus `floorTyped`.
- `faceOf(line)`: lineal → *linear*; m² lines by the library category — **Decking, Driveways / concrete** (and any category containing *floor*) → *floor*; **Ceilings, Verandah / patio ceilings** → *ceiling* (= floor); everything else → *walls*.
- `autoQty` returns the face's area when that face is measured, else 0 — so a deck prices from the m² alone, a wall still needs H, skirting needs W and L.
- The header's text names each face a line in the area needs: *floor 38 m² (typed) · walls — needs H · 22 lm*; a face nobody needs is not mentioned; nothing needed → *no measurements needed yet*. The red tint on the dims shows while any line still lacks its face.
- The line's warning says what is missing: *"Deck & Stairs needs the m² — or W and L to fill the quantity"*, *"… needs H …"*, *"… needs W and L …"*; the panel's litres hint the same (*Give Deck & Stairs the m² — or W and L and the litres work themselves out*).
- Round 88's paint card reads the line's quantity, so a typed deck area gives the litres and the tins at once; the client view, public page and PDF print the quantity as today (38 m²).

## 4. Backend

- `areas[].sqm` accepted and stored by `PUT /estimates/{id}`; the server's mirror of the area maths (the to-the-cent check Round 88 introduced for `services/paint.py`, and anything in `services/estimate_lines.py` that recomputes an auto quantity) follows the same face rule and the typed floor; Lucy and MCP read the same rows, no change.
- Old quotes: `sqm` absent = 0 = auto; nothing changes for them.

## 5. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. A TS_ area with W 4.2, L 3.6, H 2.7: the box reads 15.1 in grey; walls 42.1 m², 15.6 lm unchanged from today.
2. A new area *Deck & Stairs* with a Decking line and nothing measured: the header asks for the m² or W and L; the line is unpriced. Type 38 → the line is 38 m² at its rate; the header reads *floor 38 m² (typed)*; the tag shows; save, reload — still typed.
3. Type W 6, L 5 — the 38 stays; × — the floor is 30 and the box is grey; the line follows.
4. A Walls line in the same area still says *needs H* until H is typed; a Skirting line prices from W and L.
5. The Kitchen with 20 typed: ceiling lines take 20, walls keep 2(W+L)×H; clearing restores both.
6. The paint card's litres follow the typed m²; the client view and PDF print 38 m².
7. The server totals equal the builder's to the cent for the deck quote (the Round 88 check).
8. 1024: W L H and m² on one row in the header; no horizontal scroll; no console errors; `tsc` clean; nothing under `app/employee/*`.

## 6. Tests

`backend/tests/test_r97_area_sqm.py`: `sqm` saved and read back; the server-side quantity for a floor-face line from `sqm`, from W × L, and 0 when neither; a wall-face line still needing H; the paint litres from a typed area. Suite green before and after.

## 7. What's new

A new draft, the next free number, title **"Square metres, measured or typed"**, one card: "Every area now has an m² box beside W, L and H. It fills itself from the width and length — or type the area a client gave you and decks, floors and ceilings price from it straight away." Draft only; never publish.

## 8. Report

`memory/reports/round97-area-sqm-report.md`, starting "Round 97 done": the verify items with screenshots at both widths, the face rule as built, the suite before and after, the GitHub commit. No code review. Do not start anything else after it. Do not offer next action items.

## 9. Josh's calls before the send (defaults; "send" takes them)

1. **The typed m² is the floor area** (decks, floors, ceilings). Walls keep W, L and H. Alternative: a second typed box for walls m² as well.
2. **Which categories count as floor:** Decking, Driveways / concrete, and any category with *floor* in its name; ceilings share the floor figure. Add or remove names before the build.
3. **A typed value wins over W × L until cleared** (the tag and × make it visible). Alternative: typing W or L clears the typed value.

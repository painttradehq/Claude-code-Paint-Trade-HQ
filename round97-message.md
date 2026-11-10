**After the Round 98 fix is reported: Round 96 resumes, then Round 97.** One round at a time. **Round 96** (paint on a job by the litre) is the brief already saved at `memory/specs/projects/round96-message.md` with its correction (acceptance writes one row per paint-card product, with litres and cost-price tins) and its restyle note (the job's card looks like the quote's paint card, built with `PaintCard.tsx`'s styles); its prototype is Josh's upload `project-paint-litres.html` with "here" — if two files of that name arrived, the later one is the brief's. Build 96 to its report, then **Round 97 below**, when you hold its prototype — Josh uploads **`estimate-builder-sqm.html`** with "here"; save it as `memory/specs/estimates/estimate-builder-sqm.html` and this message as `memory/specs/estimates/round97-message.md`. Backend and admin frontend; nothing under `app/employee/*`. TS_ tenants only; the owner's tenant read-only; nothing published. Build exactly what is written; nothing from the suggestion list; no code review. File:line are as at `82bf0a3`; where a line has moved, find the function by name.

# Round 97 — Square metres beside W L H: measured or typed

The prototype is the Round 89 builder with the change (open at 1440: every area header now ends *W · L · H · m²*; the Kitchen's m² reads 15.1 in grey, filled from 4.2 × 3.6; scroll to **Deck & Stairs** — no dimensions, the Decking line waits, the header says *floor — type the m² or give W and L* → type **38** in the m² box → the line is 38 m², priced, the header reads *floor 38 m² (typed)* and the box carries a *typed ×* tag → type W 6 and L 5: the typed 38 still wins → × on the tag: back to W × L = 30 → the paint card follows; then 1024). Its checks (`tools/test_sqm.js`, 18 at 1440 and 1024) are the shape of the verify list. Josh, 10 Nov: *"a client sent 38 m² for a deck and I have no measurements — add a m² box that fills itself as W/L/H are typed but can be written when all we have is the area."*

## 1. Today, and why the deck shows nothing

`components/estimate/v2/estModel.ts:22 derived` counts an area as measured only when **W, L and H are all set**, and `:24 autoQty` gives every m² line that is not a ceiling the **wall** area 2(W+L)×H. So a *Decking* line in an area with only W and L gets nothing, and with a height typed gets the wall area, which is wrong for a deck. The per-line typed quantity exists (`LinePanel.tsx:34`, auto off) but is not where the eye goes.

## 2. The m² box (`area-sqm-{id}`)

- In the area header, after **W · L · H · m**: a thin divider, the label **m²**, and a box.
  - **Auto:** when the box has no typed value it shows **W × L** in grey as soon as W and L exist (the Kitchen's 15.1), empty before that.
  - **Typed:** type a number and it is the area's floor area; the box turns accent with bold text and a small **typed ×** tag (`area-sqm-typed-{id}`); the × (`data-sqclear`) clears it and W × L takes over again. Clearing the box by hand does the same.
  - Typing W or L while a typed value exists does not overwrite it — the typed number wins until cleared; the tag is the reminder.
- Stored on the area: `sqm: number | 0` beside `width, length, height` (`areas[].sqm`; `PUT /estimates/{id}` accepts it, 0–100 000, 0.1 steps).
- The same box in the Add-work sheet's measure strip, which now shows whenever a line of the area still lacks what it needs (not only when H is missing).

## 3. Which face each line takes (`estModel.ts`)

- `derived(a)` returns, per face: `floor = sqm > 0 ? sqm : W × L`, `ceiling = floor`, `walls = 2(W+L)×H`, `linear = 2(W+L)`, and whether each is measured: `floorMeasured` (floor > 0), `wallsMeasured` (W, L and H), `linearMeasured` (W and L), plus `floorTyped`.
- `faceOf(line)`: lineal → *linear*; m² lines by the library category — **Decking, Driveways / concrete** (and any category containing *floor*) → *floor*; **Ceilings, Verandah / patio ceilings** → *ceiling* (= floor); everything else → *walls*.
- `autoQty` returns the face's area when that face is measured, else 0 — so a deck prices from the m² alone, a wall still needs H, skirting needs W and L.
- The header's text names each face a line in the area needs: *floor 38 m² (typed) · walls — needs H · 22 lm*; a face nobody needs is not mentioned; nothing needed → *no measurements needed yet*. The red tint on the dims shows while any line still lacks its face.
- The line's warning says what is missing: *"Deck & Stairs needs the m² — or W and L to fill the quantity"*, *"… needs H …"*, *"… needs W and L …"*; the panel's litres hint the same.
- Round 88's paint card reads the line's quantity, so a typed deck area gives the litres and the tins at once; the client view, public page and PDF print the quantity as today (38 m²).

## 4. Backend

- `areas[].sqm` accepted and stored by `PUT /estimates/{id}`; the server's mirror of the area maths (the to-the-cent check Round 88 introduced for `services/paint.py`, and anything in `services/estimate_lines.py` that recomputes an auto quantity) follows the same face rule and the typed floor; Lucy and the connector read the same rows, no change (the connector's `update_quote` passes `sqm` through with the area).
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

## 8. Report, and GitHub

`memory/reports/round97-area-sqm-report.md`, starting "Round 97 done": the verify items with screenshots at both widths, the face rule as built, the suite before and after, and the commit hash at the end so Josh can click **Save to GitHub**. No code review. Do not offer next action items.

## 9. Then publish (Josh's word, 10 Nov)

When both Round 96 and Round 97 are reported, **publish the app** — the published variables stay exactly as they are (the connector's two among them). If publishing is not something you can do yourself, say so in one line and stop; Josh presses Publish. After that, stop and wait.

---

**Addendum sent 11 Nov (Josh, from his tablet on a real quote: "the alarm for fixing things is disabling the send option — enable it, regardless"):** `ReviewSend.tsx:68` disables `rs-send` while any red checklist item remains (`estModel.ts:54–69`). In Round 97: Send is disabled only by busy, no recipient email, or attachments over the size — never by the checklist; the items stay listed with their Fix links; the heading at `:55` reads "… to check before it goes"; no confirm step. Verify: a TS_ quote with no job address sends; one with no client email still cannot.

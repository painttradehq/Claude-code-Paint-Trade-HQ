# Fix Round F · part 2a — Line details v2 (proposal for Josh's review, not sent)

Prototype: **`estimate-builder-line-details.html`**. Open at **1440** first: on the paper click the Kitchen line "Walls · Standard plasterboard" → the panel. Try: Unit → each → the note and Reset; tick **Preparation** → the text, **Edit for this line** → Done; Product → **New product…** → Brand, Name, Pack, Cost → **Add and use**; Save; Send → the client view shows "prep: …" under the line. Then **1024**. Playwright: `tools/test_line_panel.js`, **64/64** at both widths. Screenshots: `line-panel-1440.png`, `line-panel-products-1440.png`.

Covers the owner's items 1 (parked here), 5, 6, 7 (prep on the quote **and** the crew job page) and 15 from the 14 October list. Becomes the spec after Josh's changes. Nothing goes to Emergent before "send"; it queues behind Fix Round F part 1.

## 1. What changes (on top of the current Line details panel, `components/estimate/v2/LinePanel.tsx`)

| Where | Today | After |
|---|---|---|
| Panel | `Sheet width={460}` | **640** (`Sheet width={640}`); everything else in the sheet family unchanged. The repair and custom branches only gain the width. |
| Quantity (library lines) | "Quantity · priced by m²", qty field, Auto/Manual segment | One row **Quantity · Unit · How it's measured**: qty field (130 px) · **Unit select** (170 px: each, m², lm, hr, day, job; the Library item's unit is marked "· Library default" and is the default) · the Auto/Manual segment for m² and lm, otherwise the grey line "Typed by hand · auto measure works for m² and lm". When the unit differs from the item's: a line "Library default is m² · this line uses ea · **Reset**". |
| Unit change rules | Unit fixed from the item (`lineFromVariant` → `pricedBy`) | `line.unit` is editable on library lines. Changing it keeps the quantity number and the step rates (they are "per unit"; the rate column header follows the unit). Auto measure switches off for anything but m² and lm (`qty_auto = false`, qty keeps the last computed value). Reset puts the item's unit back and turns auto on again for m² and lm. The quote line, the PDF and the crew job page print `line.unit`. |
| Rate and time grid | 4 columns 22 · 1fr · 84 · 76 | 22 · 1fr · 96 · 84; the step column has room for the prep text. |
| Preparation row | "Preparation · optional, adds to every unit" + rate + min | Same, plus under the hint: the Library item's **"what the prep includes"** text (`prepAbout`; if empty: "No prep notes on this Library item yet.") and a link **Edit for this line** → a textarea prefilled with that text (`line.prep_note`, null = use the item's text) with **Use the Library text instead** when a per-line text exists; the link reads **Edited for this line** afterwards. When Preparation is ticked: a checkbox **Print on the quote and show the crew** (`line.prep_show`, default on). Editing the text never changes the price. |
| Product section | One column of chips: On this Library item · Suggested · Everything else · No product | Same groups, **two chips per row**, plus a dashed chip **New product…** ("Not in your Products yet? Add it here"; with a search typed: "Add '{text}' to your Products"). It opens an inline form: **Brand · Name · Pack**, **Material** (the item's family preselected) · **Cost $ per pack**, checkbox **Also add it to the Library item "{name}"** (ticked), **Cancel** / **Add and use**. Add and use creates the product on the Products page, selects it on this line (colour field appears), adds it to the Library item's products when ticked, and toasts "{Brand Name} added to your Products and used on this line". |
| Note and photo, footer | — | Unchanged. |

## 2. Where the prep text prints

- **Quote (client view, PDF, public page):** the line's sub reads `prep: {text} · prime · 2 coats` when `prep` is on, `prep_show` is on and the text is not empty; otherwise `prep · …` as today. One place: `services/estimate_lines.client_document` builds the sub for all three.
- **Builder paper:** the line meta reads `Prep · {text} · Prime · 2 coats …` (`estModel.ts` `lineMeta`), `Prep` alone when not shown.
- **Crew job page (C2, "The work"):** the crew route's line gains `prep: {text} | null` (null when off or not shown); the line reads "{name} · {finish} · {coats} coats · Prep: {text}". The crew chat adds the read in its next round; this round stores and exposes the field.

## 3. Data

- `Line` (library kind): `unit` (exists; now editable), **`prep_note: string | null`** (null = the item's `prepAbout`), **`prep_show: boolean`** (default true). Saved with the estimate as every other line field; `client_document` and the PDF read them; the crew route (`GET /projects/mine/{id}`) exposes `prep` per line as above.
- Library item: `prepAbout` exists (`routes/library_variants.py:70`); unchanged. The Library editor's "What the prep includes" field is where the default text lives.
- Products: `POST /materials` creates the product with `brand, name, pack, material, unit_cost` (the Products page's own fields; tenant-scoped); the Library item's `products` list gets the new product's label appended when the box is ticked (`PUT /library/variants/{id}`, same label convention as today). The line stores `product_id` and `pack` as today.

## 4. Verify (testing agent, 1440 then 1024, TS_ tenant)

1. Panel opens at 640 px on the right for a library line, a repair line and a custom line; footer and Save/Delete unchanged.
2. Library line: Unit shows the item's unit marked "Library default"; change to each → note + Reset, Auto/Manual gone, "Typed by hand…" shown, footer "ea ×", rate header "$ / ea", total unchanged; Reset → m² and auto back. Save → the paper row and the client view show "ea"; the PDF prints "ea".
3. Prep: the row shows the item's `prepAbout`; Edit for this line → textarea prefilled; change → Done → "Edited for this line"; "Use the Library text instead" restores; price unchanged throughout. Tick Preparation → the "Print on the quote and show the crew" box, ticked. Save → client view and PDF line sub "prep: {text}"; untick the box → "prep" only; an item with no `prepAbout` shows "No prep notes on this Library item yet." and the per-line text still prints.
4. Products: two chips per row; New product… → form with Brand, Name, Pack, Material, Cost; Add and use → the product exists on Library › Products, is selected on the line, appears under "On this Library item" when ticked (and not when unticked); Cancel leaves nothing behind; a TS_ product never appears for another tenant.
5. 1024: no horizontal scroll, the panel still 640 (the 96 % cap only bites below ~667 px); no console errors; `tsc` clean; `app/employee/*` untouched (the crew read comes from the crew chat).

## 5. Tests

`backend/tests/test_fixF_part2.py` on TS_: a library line saved with `unit: "each"`, `prep_note`, `prep_show` round-trips; `client_document` sub contains "prep: {text}" only when shown; `POST /materials` from the panel's fields creates a tenant-scoped product and the Library item's products list grows when asked; the crew route exposes `prep` per line (null when hidden). Suite green before and after.

## 6. What's new (Draft only)

**Title:** Line details, roomier
**Body:** The Line details panel is wider and you can change a line's unit on the spot: each, m², metres, hours, days or a job price, with the Library item's unit as the default. Preparation now says what it covers, from the Library item or edited for that line, and prints on the quote and on your crew's job page. Need a product that isn't in your list yet? Add it from the line without leaving the quote.

## 7. Questions for Josh (one line each)

1. When the unit changes, the step rates keep their numbers and are read "per new unit" (prototype) — right?
2. Prep text prints on the quote by default once Preparation is ticked (prototype) — keep, or off by default?
3. "New product" asks Brand · Name · Pack · Material · Cost only; everything else is edited later on the Products page — enough?
4. Anything else you want in this panel while it is open?

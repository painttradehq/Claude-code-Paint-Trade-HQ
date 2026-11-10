# Round 96 — Paint on a job by the litre (10 November) — SENT 10 Nov (`round96-message.md`, queued `dbpe25fq3e8s73ei0210` behind 93 + 94 and 95; the §8 defaults taken: cost price, automatic fit; Josh uploads `project-paint-litres.html` with "here")

Prototype: **`project-paint-litres.html`** (open at 1440: the project's *Products on this job* card with two rows that came from the estimate → **+ Add paint** → one row per product with coverage and sizes → pick *Deck & Exterior Stain* → type 13 → the fit reads *1 × 10L + 3 × 1L · $362.00* as you type → Enter → the row → click a row's litres → type 22 → the tins re-fit; then 1024). Playwright `tools/test_litres.js` **16/16** at 1440 and 1024. Josh's note 4 of 10 Nov: *"each paint is wired to a particular litre size — let the admin choose the paint and write the litres."* Everything else on the project page is unchanged.

## 1. Today

`app/admin/project/[id].tsx:177`: the picker lists **one row per product per size** (`catalog … map(mt => mt.sizes.map(sz => …))`) and `POST /projects/{id}/materials` takes `{material_id, size_label, quantity: 1}` (`routes/projects.py:1238–1262`), snapshotting that size's price. The row shows *Dulux · 15L · $0.00/ea · × 1*. Round 88 built the litres logic for the quote: `services/paint.py` — `product_sizes` (your price per size), `fit_tins` (largest tins while whole ones fit, the remainder filled by the sizes below, against every all-one-size option; cheapest, then fewest tins) — and the quote's paint card lists one product once.

## 2. The card (`project-products-card`)

- **Head:** *Products on this job · n*, the sum (the tins' cost, not the litres), **+ Add paint** (`project-products-toggle`). Sub-line: *"Paint pulled from your Products catalogue, by the litre. Pick the product, type the litres — the tins and the cost work themselves out from your sizes and prices. Colour comes across from the estimate when it was chosen there; otherwise type it here so the crew know what to open."*
- **Add paint, step 1** (`project-products-picker`): the search (`project-products-search`) and **one row per product** (`project-products-pick-{id}`): brand tile, name, *{brand} · {coverage} m² per litre per coat · 4L · 10L · 15L*, and *from $x/L* (the cheapest size per litre). No row per tin.
- **Step 2** (`picker-step-litres`): the product's name and sizes, a **Litres** field (`picker-litres`, 0.1 steps, focused on a desktop, after the tap on touch — Fix I §12), the fit as you type (`picker-fit`: *→ 1 × 10L + 3 × 1L · $362.00*), **Add** (enabled once litres > 0; Enter adds), **Back**.
- **A row** (`product-row-{id}`): the name; *{brand} · **13.4 L** → 1 × 15L*; the litres are a click to edit in place (`row-litres-{id}` → `row-litres-input-{id}`, Enter or blur saves, Escape cancels) and the tins re-fit; the colour and code fields exactly as today with the *✓ from the estimate* mark; the tin count; the cost (`row-cost-{id}`); remove. Rows that came from the estimate's paint card (Round 88) arrive with their litres.
- Empty: *"No paint on this job yet — Add paint, pick the product, type the litres."*

## 3. Backend

- `POST /projects/{id}/materials` accepts `{material_id, litres}` (litres > 0, ≤ 10 000, 0.1 steps) beside the old `{material_id, size_label, quantity}` (kept for anything that still sends it). With `litres`, the server runs `services/paint.product_sizes(material, 0)` — **cost prices, no markup: this is the job's cost** — and `fit_tins(litres, sizes)`, and stores `litres`, `tins: [{size_label, count, unit_cost}]`, `quantity` = total tins, `unit_cost` = the blended cost per tin, `line_cost` = Σ count × unit_cost (the field the card and the Job money card already sum).
- `PATCH /projects/{id}/materials/{mid}` accepts `litres` and re-fits; `colour` / `colour_code` as today.
- `_pm_serialize` (`projects.py:1220`) returns `litres` and `tins`; a row from before this round (no `litres`) serialises as today (`size_label × quantity`) and the card shows it as today.
- **Corrected 10 Nov:** today acceptance and from-estimate copy only products **with a colour** (`_copy_estimate_colours`, `projects.py:422`, `:566`; quantity 1, one size, `colour_from=estimate`); Round 88's `paint_summary` never reaches the job. This round makes acceptance and from-estimate write one row per product of the quote's `paint_summary().products` — its litres, the tins fitted at cost price, the colour and `colour_from=estimate` when the quote chose one — replacing `_copy_estimate_colours`, so the job starts with the quote's paint.
- The crew's materials list (`projects.py:1000–1004`, read by the crew app — backend only; no file under `app/employee/*` changes) adds `litres` and `tins_text` (*1 × 15L*) beside `size_label`; the crew screen shows them when the crew chat gets to it.
- A product with no priced size: the fit still gives the tins; the cost shows *—* and the sum skips it, as the quote's paint card does.

## 4. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. Add paint lists each TS_ product once with coverage and sizes; search narrows.
2. Pick a product, type 13.4 → the fit and cost as you type; Enter adds the row with *13.4 L → …*; the sum is the tins' cost.
3. Click the litres, type 22, Enter → the tins re-fit and the cost follows; Escape cancels an edit.
4. A row added the old way (an existing TS_ row with `size_label × quantity`) still shows and still totals.
5. The fits match `fit_tins` on the server to the cent for 3, 13, 22 and 31 L against a 4 / 10 / 15 L product (the Round 88 table).
6. The crew route carries `litres` and `tins_text`; nothing under `app/employee/*` changed.
7. 1024: the picker's two steps fit; no horizontal scroll; no console errors; `tsc` clean.

## 5. Tests

`backend/tests/test_r96_paint_litres.py`: add by litres (fit, stored fields, line_cost), patch litres re-fits, the old payload still works, an unpriced size, the crew route's fields, isolation. Suite green before and after.

## 6. What's new

A new draft, the next free number, title **"Paint on a job, by the litre"**, one card: "On a job's Products card, pick the paint and type the litres — the tins and the cost follow from your sizes and prices, the same way the quote works them out." Draft only; never publish.

## 7. Report

`memory/reports/round96-paint-litres-report.md`, starting "Round 96 done": the verify items with screenshots at both widths, the fit table, the suite before and after, the GitHub commit. No code review. Do not start anything else after it. Do not offer next action items.

## 8. Josh's calls before the send (defaults; "send" takes them)

1. **Cost at your cost price, no markup** on the job (the quote's paint card applies the markup for the client; the job's Products card is what the paint costs you). Alternative: the same marked-up figure as the quote.
2. **The fit is automatic** (Round 88's rule). Alternative: a "by tin" switch on a row to pick the tins by hand, as the quote's paint card has.

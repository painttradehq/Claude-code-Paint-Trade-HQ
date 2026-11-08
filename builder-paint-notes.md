# Round 88 — Builder: areas in order, one product once, paint from coverage (7 November) — BUILT 8 Nov (report `memory/reports/round88-paint-report.md`; results at the end of this file); waits for publish

Prototype: **`estimate-builder-paint.html`** (open at 1440: hover the "01" beside Kitchen → ▼ moves it under Living Room, ▲ back; the area ⋯ menu has Move up / Move down → click the Walls line's summary → the Product list shows each product once with its coverage and sizes → "Paint for this line" shows the litres and the sum → By hand → type 9 → Auto → Save → scroll to the bottom: the Paint card under the totals → Charge on top → a Paint row joins the totals → edit tins → Client view shows one Paint line; then 1024). Playwright `tools/test_paint.js` **31/31** at 1440 and 1024. Built on the Round 76 builder (`estimate-builder-fix-e.html`, generator `tools/make_paint.py`); everything not named here is unchanged. Josh's notes of 7 Nov, items 13 and 14 (`notes-triage-7nov.md` §C).

## 1. Areas move up and down

- The number on the left of every area ("01", "02"…) gains two small arrows, ▲ above and ▼ below, shown on hover and on keyboard focus (`area-num-{id}`, `data-amove="up|down"`, aria labels "Move {area} up/down"); the first area's ▲ and the last area's ▼ are disabled. The area's ⋯ menu gets **Move up** and **Move down** above Rename, disabled the same way.
- A move swaps the area with its neighbour, renumbers every area, keeps the page where it is and flashes the moved area for half a second. Lines keep their areas. The order is the order of `est.areas`; every area's `order` field is rewritten 0…n and saved by the usual autosave (`PUT` body carries `areas`).
- Everything that prints areas follows that order with no further change: the paper, the client view, the public page, the PDF, Lucy's reading of the quote, the crew's job view (they read `areas` in array order; the report confirms each).

## 2. One product once

- The line panel's Product list (`components/estimate/v2/LinePanel.tsx`, `estModel.flatProducts`) lists **one chip per product** (material id), not one per size. The chip reads: brand + name on the first line; on the second **`{coverage} m²/L · {sizes, e.g. 1L · 4L · 10L · 15L} · from {lowest size price} · {material}`**; a product with no coverage omits that part, a product with no sizes reads "no size yet" as today. Search matches brand, name, material, category and size labels. "On this Library item", "Suggested for {category}" and "Everything else" groups stay; picking a chip sets `product_id` and clears `pack` (the size is no longer chosen per line — see §3).
- `lineFromVariant` (the first product on the Library item) sets `product_id` only. Old lines with a `pack` keep it in the data; nothing reads it for paint any more; the client never saw it (Round 76 E10).
- The Add work sheet's product chips for custom material lines (`data-prod`) are unchanged: a hand-typed materials line still names a size and a price, as today.

## 3. Paint for this line (the litres)

- For a **library line priced per m² with a product that has coverage**, the panel's new block **Paint for this line** shows **litres = m² × coats ÷ coverage**, rounded to 0.1 L, with the sum written under it ("42.1 m² × 2 coats ÷ 16 m²/L (the product's coverage)"). m² is the line's quantity as it stands (auto from the area or typed); coats is the line's coat count (1, 2 or 3). **Auto** is the default.
- **By hand**: the litres become a field prefilled with the auto value and focused, plus a short "Why" field (for the owner and the crew; never on the client's document). The summary under the number reads "set by hand · {why}". **Auto** clears the override. Stored on the line as `paint: { mode: "manual", litres, note }`; absent means auto.
- A library line **priced per each, lineal or hour**, or whose area is not measured, has no auto figure: the block says so and offers By hand only. A line with no product says "Pick a product above and the paint works itself out from the area and the coats."
- **Primer is not counted** (it is a different product); the block says so when the Prime step is on. A primer wants its own line with the primer product, or a note in the Paint card. (A primer calculation can come later.)
- The line's summary on the paper names the litres after the colour: "Prime · 2 coats · Dulux Wash&Wear Low Sheen · Natural White · 5.3 L · 7h 1m". Not on the client's document.

## 4. The Paint card (tins and cost, per product, for the whole quote)

- Under the totals block a second card, **Paint for this quote** (`eb-paint`), lists every product used on the quote's live lines (optional extras only when the client has chosen them): **Product** (brand + name; under it coverage, the colours used, and "n lines by hand" when any), **Lines**, **Litres** (the sum of the lines' litres), **Tins**, **Cost**. Subtitle: "{n} products · {litres} L needed · {cost} at your prices".
- **Tins are fitted per product across the whole quote** from the product's sizes, by the rule in `fitTins` (prototype): fill with the largest size while it fits, cover the remainder with the smallest size that covers it; compare that against "all one size" for each size; take the cheapest, then the fewest tins; list largest size first. Under the tins: "{litres bought} L bought · edit tins".
- **Cost** uses the price the builder already uses for products (`flatProducts`): the business's own price for the size when set, otherwise the retail price plus the business's markup. A size with no price counts $0 and the row says "no price".
- **edit tins**: the tins become a count per size; typing updates the row and the totals at once; **Done** keeps it (`est.paint_tins[product_id] = {size_label: count}`), **Back to auto** refits. A product set by hand is marked "set by hand".
- The card's switch, per quote: **In my rates** (default) — nothing is added to the quote; the card is the ordering list. **Charge on top** — a row **"Paint · n products at your prices (in the subtotal)"** joins the totals above the discount line, the subtotal includes it, GST applies as to everything else, and the client's document gets **one line "Paint supplied by us ({products})" with the amount** under Products and colours — never litres or tins (Round 76 E10 stands). Stored as `est.paint_charge: true|false`.
- **The default for new quotes** is a switch in **Quote setup › Pricing**: "Paint is: in my m² rates / charged on top at my prices", default **in my rates** for every business (existing quotes keep whatever they have; nothing in any current total changes on the publish).
- Empty state: "Pick a product on a line and measure its area — the litres, tins and cost appear here."

## 5. Backend

- `services/estimate_lines.py` (the one place totals and rows are computed for the client view, the public page, the PDF and the email): when `paint_charge` is true, the subtotal includes the paint total computed exactly as the builder does (same fit, same prices, same rounding — one shared function, `services/paint.py`, used by the builder through the API response so the two never differ), and a `paint_line` ({label, amount, products}) is returned for the client documents. Lucy's estimate summary and the MCP read gain `paint: {litres, cost, charged}`.
- `GET /estimates/{id}` returns `paint_summary` (per product: litres, tins, cost) computed server-side so the builder, the PDF and the crew agree; the builder recomputes locally only while editing and re-reads on save.
- `PUT /estimates/{id}` accepts `areas[].order`, `lines[].paint`, `paint_charge`, `paint_tins`; validation: litres ≥ 0, counts integers ≥ 0, product ids owned by the tenant.
- Quote setup › Pricing: `estimate_defaults.paint_charge` (bool, default false), read when a quote is created.
- The crew's job view is the crew chat's; the paint summary is available to it from the same `paint_summary` field when that chat wants it. Nothing under `app/employee/*` in this round.

## 6. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. A TS_ quote with three areas: ▼ on the first moves it second and renumbers; ▲ moves it back; the ⋯ menu's Move up/down do the same; the first area's ▲ and the last's ▼ are disabled; reload keeps the order; the client view, public page and PDF print the areas in the new order.
2. The line panel lists each product once with "{coverage} m²/L · sizes · from $"; picking one sets the product; search by size label and brand works; the recommended group still shows the Library item's products.
3. A measured m² line with 2 coats and a 16 m²/L product shows litres = m² × 2 ÷ 16 to 0.1 L; changing coats to 3 updates it; By hand with 9 and a note → the summary reads "9 L"; Auto returns the figure; a per-each line offers By hand only; an unmeasured area says to measure it.
4. The Paint card: two products on four lines → litres summed per product, tins fitted (a 22 L need with 1/4/10/15 L sizes → the cheapest fit), cost at the business's price; edit tins +1 raises the cost; Back to auto refits; In my rates → no Paint row; Charge on top → the Paint row, subtotal and total rise by the paint cost, GST follows; the client view and the PDF show one "Paint supplied by us" line with the amount and no litres; the public page the same.
5. Quote setup › Pricing: the default switch; a new quote follows it; an existing quote is untouched.
6. Lucy: "how much paint for this quote?" answers from `paint_summary`. MCP read carries `paint`.
7. Suite before and after; `tsc` clean; 1024 no horizontal scroll; no console errors; nothing under `app/employee/*`.

## 7. Tests

`backend/tests/test_r88_paint.py`: the fit rule on five needs against three size sets (incl. "all one size" winning); litres rounding; auto vs manual; per-product summing; `paint_charge` in the subtotal and GST; the client document's paint line; `areas[].order` round trip; isolation (another tenant's product id refused). Suite green before and after.

## 8. What's new

A new draft, the next free number, title **"Paint, worked out"**, one card: "Pick a product on a line and the quote works out the litres from the area, the coats and the product's coverage. The Paint card under the totals adds up the tins per product at your prices, for ordering — or, if you choose, charged on top. Areas can now be moved up and down from the number beside them." Draft only.

## 9. Report

`memory/reports/round88-paint-report.md`, starting "Round 88 done": the fit rule's test table, the before/after of one TS_ quote's totals with Charge on top, the places that print areas in order, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

## 10. Josh's calls before the send (each has a default; "send" takes the defaults)

1. **Default for everyone: In my rates.** No quote total changes when this publishes. (Alternative: Charge on top by default — it would raise every new quote.)
2. **Paint prices:** the business's own price per size when set, else retail + markup, as the builder already does. (Alternative: retail only.)
3. **No wastage allowance** in the auto figure; By hand covers it. (Alternative: a per-business "+10%" setting in Quote setup.)
4. **Primer not counted** in this round.


## Results (Emergent, 8 Nov, ~1 h; not published)

- Built as specified: the ▲▼ arrows and Move up / Move down (order saved; the places that print areas confirmed in the report); one chip per product with coverage, sizes and from-price; "Paint for this line" auto (m² × coats ÷ coverage) and By hand with a reason; the "Paint for this quote" card with the fit rule and editable tins; In my rates / Charge on top with the Paint row, the client's single Paint line and the Quote setup › Pricing default. Backend `services/paint.py`; `compute_estimate` writes `paint_summary`, `paint_total`, `paint_line`; `paint_charge` on the PUT.
- **Builder and server agree to the cent** on the test quote: 13.4 L → 1 × 15 L → $240.00; subtotal $1,572.00 · GST $157.20 · total $1,729.20. Charge on top on a second quote: $1,578.00 → $1,958.00 subtotal with $380 of paint; total $1,735.80 → $2,153.80.
- Fit table from the tests (prices as seeded): 22 L against 1/4/10/15 L → 1 × 15 L + 1 × 4 L + 3 × 1 L = $420 (22 L bought); 22 L against 1/4/10 L → 2 × 10 L + 2 × 1 L = $440; 9.5 L → 1 × 10 L; 16 L against 2/15 L → 1 × 15 L + 1 × 2 L; 6.4 L against 4/10 L → 2 × 4 L.
- Testing agent at 1440 and 1024: items 1–4 and 6 pass. **Item 5 (the Quote setup › Pricing switch) hit a pre-existing bug:** `GET /api/admin/profile` returned a partial `estimate_defaults` for a tenant with only issued quote numbers, so the Pricing tab opened blank and Save refused; the tester made a one-line backend fix (defaults merged under the saved keys), kept, and the switch then passed. One low finding fixed on the way: with a product already on the line and an empty search, the Product section hid the current product — it now shows first.
- **Lucy:** the report says "not applicable — no quote reading exists" (Lucy has no tool that reads a quote's lines today), so the paint question stays for the day Lucy gets one; the MCP read carries `paint`. Spec silences noted by Emergent: the public page keeps the server's Paint figure when the client ticks an optional extra; the quote email prints the total only; the ▲▼ and card icon are text glyphs as in the prototype; `pack` on a custom material line is untouched. Pre-existing and left: the 1024 top bar wraps to two rows (Round 76 layout); the client table groups a Trim line under the first line's surface (`products_rows`).
- `tests/test_r88_paint.py` green (fit table, rounding, auto vs manual, per-product sums, subtotal + GST, the client line, the order round trip, isolation); the estimate, invoice, crew-scope and MCP suites green; `tsc` clean; nothing under `app/employee/*`; TS_ rows torn down. Draft **n 32 "Paint, worked out"**, unpublished. Pre-existing failures unchanged (`test_r19`, `test_r46` ×2, `test_r63`, `test_r78` ×2 → Fix I).

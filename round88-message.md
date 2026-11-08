Round 88 — Builder: areas in order, one product once, paint from coverage. Start when you hold the prototype: Josh uploads **`estimate-builder-paint.html`** (about 287 KB) with "here"; save it as `memory/specs/estimates/estimate-builder-paint.html` and save this message as `memory/specs/estimates/round88-message.md`. Round 87 and the crew chat's Round E are done; nothing else is running. One round at a time — if a crew round is running, queue this behind it.

The prototype is the Round 76 builder (`estimate-builder-fix-e.html`) with the three changes below; everything not named here is unchanged. Its checks (`tools/test_paint.js`, 31 at 1440 and 1024) are the shape of the verify list. Admin frontend and backend only; nothing under `app/employee/*` (the crew's Scope screen may read the new `paint_summary` later — that is the crew chat's). TS_ tenants only, torn down; the owner's tenant read-only; nothing published. Josh's notes 13 and 14 of 7 November.

**Decisions already taken (build them as written):** the default for every business is **In my rates**, so no existing or new quote total changes on the publish unless the owner chooses otherwise; paint prices are the ones the builder already uses for products (the business's own price per size when set, otherwise retail plus the business's markup); no wastage allowance in the auto figure (By hand covers it); primer is not counted in this round.

## 1. Areas move up and down

- The number on the left of every area ("01", "02"…) gains two small arrows, ▲ above and ▼ below, shown on hover and on keyboard focus (`area-num-{id}`, `data-amove="up|down"`, aria labels "Move {area} up" / "Move {area} down"); the first area's ▲ and the last area's ▼ are disabled. The area's ⋯ menu gets **Move up** and **Move down** above Rename, disabled the same way.
- A move swaps the area with its neighbour, renumbers every area, keeps the page where it is and flashes the moved area for half a second. Lines keep their areas. The order is the order of `est.areas`; every area's `order` field is rewritten 0…n and saved by the usual autosave (the PUT body already carries `areas`).
- Everything that prints areas follows that order with no further change: the paper, the client view, the public page, the PDF, Lucy's reading of the quote, the crew's job and Scope views (they read `areas` in array order — confirm each in the report; fix any that sorts differently).

## 2. One product once

- The line panel's Product list (`components/estimate/v2/LinePanel.tsx`; `estModel.flatProducts` today makes one row per size) lists **one chip per product** (material id). The chip reads brand + name on the first line and on the second **`{coverage} m²/L · {size labels, e.g. 1L · 4L · 10L · 15L} · from {lowest size price} · {material}`**; a product with no coverage omits that part; a product with no sizes reads "no size yet" as today. Search matches brand, name, material, category and size labels. The groups "On this Library item", "Suggested for {category}" and "Everything else" stay. Picking a chip sets `product_id` and clears `pack` (the size is no longer chosen per line — §4 fits tins per product).
- `lineFromVariant` (the Library item's first product) sets `product_id` only. Old lines keep their `pack` in the data; nothing reads it for paint; the client never saw it (Round 76 E10).
- The Add work sheet's product chips for hand-typed material lines (`data-prod`) are unchanged: a custom materials line still names a size and a price.

## 3. Paint for this line

- For a **library line priced per m² with a product that has coverage**, the panel gets a block **Paint for this line** (`panel-paint`) under the product and colour: **litres = m² × coats ÷ coverage**, rounded to 0.1 L (`paint-litres`), with the sum written under it ("42.1 m² × 2 coats ÷ 16 m²/L (the product's coverage)"). m² is the line's quantity as it stands (auto from the area or typed); coats is the line's coat count (1, 2 or 3). **Auto** is the default.
- **By hand** (`data-paintmode="manual"`): the litres become a number field prefilled with the auto value and focused (`pl_paintl`), plus a short "Why (for you and the crew)" field (`pl_paintnote`); typing updates the figure at once; the summary under the number reads "set by hand · {why}". **Auto** clears the override. Stored on the line as `paint: { mode: "manual", litres, note }`; absent means auto.
- A library line **priced per each, lineal or hour**, or whose area is not measured, has no auto figure: the block says why ("Priced per ea, so there is no area to work from — set the litres by hand." / "Measure {area} and the litres work themselves out.") and offers By hand only. A line with no product reads "Pick a product above and the paint works itself out from the area and the coats."
- **Primer is not counted**; when the Prime step is on the block says: "The primer coat is not counted here — it is a different product. Add a primer line, or note it in the Paint card." A closing hint: "Tins and cost are worked out per product across the whole quote, in the Paint card under the totals."
- The line's summary on the paper names the litres after the colour ("Prime · 2 coats · Dulux Wash&Wear Low Sheen · Natural White · 5.3 L · 7h 1m"). Never on the client's documents.

## 4. The Paint card

- Under the totals block a second card, **Paint for this quote** (`eb-paint`, same frame as the totals), lists every product used on the quote's live lines (optional extras only when the client has chosen them): **Product** (brand + name; under it the coverage, the colours used, and "n lines by hand" when any), **Lines**, **Litres** (the sum of the lines' litres, with the unit), **Tins**, **Cost**. Subtitle: "{n} products · {litres} L needed · {cost} at your prices". Empty state: "Pick a product on a line and measure its area — the litres, tins and cost appear here."
- **Tins are fitted per product across the whole quote** from the product's sizes, by this rule (the prototype's `fitTins`): option A fills with the largest size while a whole tin fits, then covers the remainder with the smallest size that covers it; options B are "all one size" for each size (ceiling of need ÷ size); take the cheapest option, then the fewest tins; list the largest size first. Under the tins: "{litres bought} L bought · edit tins" (`paint-tins-{product_id}`).
- **Cost** uses the price the builder already uses for products: the business's own price for the size when set, otherwise retail plus the business's markup. A size with no price counts $0 and the row says "no price".
- **edit tins** (`data-tinedit`): the tins become a count per size (`data-tin`, `data-size`); typing updates the row and the totals at once; **Done** keeps it (`est.paint_tins[product_id] = {size_label: count}`), **Back to auto** refits. A product set by hand is marked "set by hand".
- The card's switch, per quote (`paint-charge`): **In my rates** (default) — nothing is added to the quote; the card is the ordering list. **Charge on top** — a row **"Paint · n products at your prices (in the subtotal)"** (`eb-paint-row`) joins the totals above the discount line, the subtotal includes it, GST applies as to everything else, and the client's documents get **one line "Paint supplied by us ({products})" with the amount** (`doc-paint-line`) under Products and colours — never litres or tins. Stored as `est.paint_charge: true|false`.
- Hint under the card: "In my rates: nothing is added to the quote; this is your ordering list." / "Charge on top: a Paint row of {cost} joins the totals and the client sees one Paint line, no litres." + "The default for new quotes is set in Quote setup › Pricing."
- **Quote setup › Pricing** gets the default switch "Paint is: in my m² rates / charged on top at my prices" (`estimate_defaults.paint_charge`, default false), read when a quote is created. Existing quotes keep what they have.

## 5. Backend

- One shared module, `services/paint.py`: litres per line (the rule in §3), the summary per product and the fit (§4), the cost with the business's prices. `services/estimate_lines.py` uses it: when `paint_charge` is true the subtotal includes the paint total and the response carries `paint_line` ({label, amount, products}) for the client view, the public page, the PDF and the email; `GET /estimates/{id}` returns `paint_summary` (per product: litres, tins, cost; plus `total`) so the builder, the PDF and later the crew agree. The builder recomputes locally while editing with the same rule and re-reads on save; the report shows one quote where both agree to the cent.
- `PUT /estimates/{id}` accepts `areas[].order`, `lines[].paint`, `paint_charge`, `paint_tins`; validation: litres ≥ 0, counts integers ≥ 0, product ids owned by the tenant (another tenant's id → 400).
- Lucy's estimate summary and the MCP estimate read gain `paint: {litres, cost, charged}`.
- Products already carry `coverage_sqm_per_l` and `sizes[] {size_label, size_liters, cost_price, custom_price}`; nothing changes in the Library.

## 6. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. A TS_ quote with three areas: ▼ on the first moves it second and renumbers; ▲ moves it back; the ⋯ menu's Move up / Move down do the same; the first area's ▲ and the last's ▼ are disabled; reload keeps the order; the client view, the public page and the PDF print the areas in the new order.
2. The line panel lists each product once with "{coverage} m²/L · sizes · from $"; picking one sets the product; search by a size label and by brand works; the Library item's recommended products still show first.
3. A measured m² line with 2 coats and a 16 m²/L product shows litres = m² × 2 ÷ 16 to 0.1 L; changing coats to 3 updates it; By hand with 9 and a note → the paper's summary reads "9 L"; Auto returns the figure; a per-each line offers By hand only; an unmeasured area says to measure it.
4. The Paint card: two products on four lines → litres summed per product; tins fitted (a 22 L need with 1/4/10/15 L sizes → the cheapest fit, show the arithmetic); cost at the business's price; edit tins +1 raises the cost; Back to auto refits; In my rates → no Paint row and the total unchanged; Charge on top → the Paint row, subtotal and total rise by the paint cost and GST follows; the client view, the public page and the PDF show one "Paint supplied by us" line with the amount and no litres anywhere.
5. Quote setup › Pricing: the default switch; a new quote follows it; an existing quote is untouched.
6. Lucy: "how much paint for this quote?" answers from `paint_summary`; the MCP read carries `paint`.
7. Suite before and after (chunked); `tsc` clean; 1024 no horizontal scroll; no console errors; `git status` shows nothing under `app/employee/*`.

## 7. Tests

`backend/tests/test_r88_paint.py`: the fit rule on five needs against three size sets (including a case where "all one size" wins); litres rounding; auto vs manual; per-product summing; `paint_charge` in the subtotal and GST; the client document's paint line; `areas[].order` round trip; isolation (another tenant's product id refused). Suite green before and after.

## 8. What's new

A new draft, the next free number, title **"Paint, worked out"**, one card: "Pick a product on a line and the quote works out the litres from the area, the coats and the product's coverage. The Paint card under the totals adds up the tins per product at your prices, for ordering — or, if you choose, charged on top. Areas can now be moved up and down from the number beside them." Draft only; never publish.

## 9. Report

`memory/reports/round88-paint-report.md`, starting "Round 88 done": the fit rule's test table, the before/after of one TS_ quote's totals with Charge on top, the places that print areas in order, the builder-vs-server agreement check, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

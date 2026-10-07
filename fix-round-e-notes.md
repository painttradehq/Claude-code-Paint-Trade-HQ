# Fix Round E — estimate builder: the owner's eleven notes (7 Oct) — Spec Notes for Emergent

Prototype: `estimate-builder-fix-e.html` (open at 1440: the Kitchen lines (summary order, note line) → click a summary (not the name) to open the line panel → "+ Add exterior zone" → North face → pick Front Door three times (×3) → Done → Job details → Client card › Change › New client › More details → camera › Take photo → Client view (Products and colours, Job details); then 1024). Playwright `tools/test_fix_e.js` 14/14. Built on the Round 60 builder (`estimate-builder-faces.html`); everything not named here is unchanged.

Owner notes, 7 Oct, taken while building a real estimate. Each item below is one note with the decision. Owner rules: no notices or banners under the cards; nothing duplicated; every panel opens on the right; no mobile work; nothing changes beyond what is listed.

## 1. Items

| # | Note | Decision | Notes |
|---|---|---|---|
| E1 | Lucy's button should be movable | **Drag to move** | The Lucy bubble (bottom-right today) can be dragged anywhere along the right or bottom edge of the window; it snaps to the nearest edge on release; the spot is remembered per browser (`localStorage`). A plain click still opens the box; a drag does not. Same on every page. Not in the prototype (the bubble is in the shell, not the builder); build it as described. |
| E2 | Picking the same item twice in an area should become "Door ×3" | **Repeat pick raises the quantity** | In the item picker (level 2 of a face, and the interior/exterior item lists), picking an item that is already on that area and is priced **per item** (`each`) raises that line's quantity by one and the tile's badge reads "3×"; the line's quantity becomes manual (it was 1 by hand anyway). Measured items (m², lineal) cannot be added twice: the second pick toasts "{item} is already on {area} — it is measured, not counted". Same rule in the Add work sheet when the same Library item is added to an area that already has it. |
| E3 | Walls, ceilings, skirting take their measurement from the area | **Already so** (`autoQty`, Round 11); no change. If the owner saw an empty quantity it was an unmeasured area: the row already says "Measure {area} to fill the quantity". | — |
| E4 | Uploading or taking a photo goes straight into the editor | **Photo lands in the grid first** | After Take photo / Upload the photo appears in the Photos grid (tagged to the area or line as today) with the toast "Photo added · Edit to mark it up". The editor opens only from the card's **Edit** (or by clicking the picture). Same on the crew app's photo flow? **No** — crew app untouched (owner rule). |
| E5 | Line summary order and layout | **Prep · Prime · {n} coats · {brand product} · {colour}; the note on its own line** | The summary under the line name reads, in this order and only the parts that apply: `Prep` · `Prime` · `2 coats` · `Dulux Wash&Wear Low Sheen` · `Natural White` · the labour time. It wraps instead of being cut off, so the row grows when it is long. A line note sits on its own line under the summary with a small note icon, in italics, and an "ON THE QUOTE" mark when "show on quote" is ticked. The client document's description sub-line uses the same order (`prep · prime · 2 coats`). |
| E6 | New client needs more than the basic details | **More details link** | The builder's New client form keeps Name · Phone · Email · Address · Suburb · State · Postcode and gains a link **More details — company, other contacts, how they found you, notes** that reveals the CRM's fields in the same dialog: Company · How they found you (the CRM's source list) · Other contact (name + phone or email, saved as a contact row per Round 45) · Notes. Saved to the client record exactly as CRM › Add client does; one form, not a second. |
| E7 | "What, how long and when" is unclear; the scope line duplicates the quote type and the reference is written automatically | **Job details = how long and when** | The dialog keeps two fields: **How long it will take** (with the hours-based suggestion) and **When it starts** (date or "On acceptance"). The "Scope in one line" field and the PO / reference field go from the dialog, the card, the client document's Job details block and the email draft (which says "Your quote for {type} painting at {address}…" instead). The card reads "How long and when" until filled, then "On the quote". `scope_summary` and `reference` stay in the data for old estimates but are no longer shown or edited. |
| E8 | The window on the right where you choose the items is small and crowded | **Wider right-side panel** | The item picker (Add interior area / Add exterior zone, and the elements on a face) opens as a full-height panel on the right, **860 px** wide (max 96% of the window), tiles four to a row at 1440 and two at 1024, more padding between groups. Same content, same behaviour; just room. |
| E9 | In the line details, typing a product finds nothing | **Bug — fix** | `LinePanel.tsx` filters `products` with `matchesProduct(q, x)`; as typed, nothing matches. Reproduce on the owner's tenant (read-only) with "dulux" and "wash", find the cause (likely the product list passed in, or the matcher's field names after Round 56/58 changed the product shape — `brand` + `name` + `sizes`), fix, and add a test that typing a brand or a word of the name lists the product. |
| E10 | The client's quote shows the paint quantity | **Client never sees pack sizes or litres** | The client document's "Products and colours" table shows product, colour, surface and where. The pack / litres sub-line goes from Client view, the public page, the Review & send pane and the PDF (one renderer). The builder's own materials lines keep their pack size. |
| E11 | Clicking the item's photo should open its details like the name does | **Whole name block opens the panel** | The name, the summary, the note and the photo count under a line all open the line details panel; the quantity, rate and menu keep their own behaviour. |

## 2. Reuse / restyle / replace

| Existing piece | Decision |
|---|---|
| `AreaPicker.tsx` (Round 60 picker, a dialog) | **Restyle** into the 860 px right panel (same `SetupPanel`/sheet shell as the line details); content unchanged; repeat-pick rule (E2) |
| `Builder.tsx` line rows | **Change** summary order, wrapping, note line, click target (E5, E11) |
| `Photos.tsx` + `PhotoEditor` | **Change** the after-capture step (E4) |
| `Dialogs.tsx` New client / Job details | **Extend** with More details (E6); **shrink** Job details (E7) |
| `ClientDoc.tsx` + `services/pdf.py` quote template | **Change** Job details block and products table (E7, E10), sub-line order (E5) |
| `LinePanel.tsx` product search | **Fix** (E9) |
| Lucy bubble (`components/lucy/*`) | **Extend** drag + remembered position (E1) |
| Routes and data | **Unchanged** except reading the client's extra fields through the existing CRM create route |

## 3. Verify (agent-tested / Unverified, then the testing-agent pass at 1440 and 1024)

1. E5/E11: a line with prep + primer + 2 coats + product + colour reads in that order; a long one wraps; a note shows on its own line with the mark when "show on quote" is on; clicking the summary opens the panel.
2. E8/E2: the picker is a right panel 860 px wide at 1440 (two columns at 1024); picking Front Door three times on a face gives one line "×3" and the tile badge "3×"; picking Walls twice toasts and adds nothing.
3. E4: Take photo / Upload adds a card to the grid without opening the editor; Edit opens it.
4. E6: New client › More details shows the CRM fields; Create and use saves them on the client record (check in CRM).
5. E7: Job details shows two fields; the card, the client document, the PDF and the email draft show no scope line and no reference; an old estimate with a scope still opens fine.
6. E9: typing "dulux" and "wash" in the line panel lists the products; test added.
7. E10: Client view, public page, Review & send pane and PDF show no pack size or litres in Products and colours.
8. E1: the Lucy bubble drags, snaps to an edge, is remembered after reload, and a click still opens the box; on every page.
9. Suite green before and after; isolation; test estimates created on TS_ tenants and removed; nothing on the owner's tenant changed (E9 reproduction is read-only).

# Estimate builder — Add work, smarter and cleaner — Spec Notes for Emergent

Prototype: `estimate-builder-add-work-v2.html` (open at 1440: "+ Add work to Kitchen" → the sheet → rail "Ceilings" → rail "All repairs" → type "crack" in the search → clear, type "pressure wash driveway" → "Add as a custom line" → Trade → rail "Everything" → Add on a card → click a card's name → Done; then 1024). Playwright `tools/test_add_work2.js` 36/36 at 1440 and 1024. Built on the Fix Round E builder (Round 68); nothing outside the sheet changes.

**Owner (9 Oct):** first "fix the Add work page to the same size as the Add area page", then "now that there is more space, can we redesign it smarter and cleaner". Owner rules: simple and practical; no duplication; every test id kept; nothing changes outside the sheet; no mobile / crew-app work; the owner's tenant stays read-only.

## 1. What changes, what stays

| Piece | Decision |
|---|---|
| Sheet size | **Same as the Add area picker (E8):** full-height right panel, 860 px wide, max 96 % of the window; the picker's padding. The line-details panel (460 px) is untouched. |
| Header "Add work to {area ▾}" + × | **Keep.** Under it, one new line **On the paper** (`sheet-on-paper`): up to six small chips with the lines this area already has ("Walls · Standard plasterboard", "Ceiling · Flat", …, "+N more"), or "Nothing in {area} yet." — so the painter sees what is there before adding. Then **one search** (`sheet-search`, placeholder "Search everything — walls, doors, cracks, mould, scaffold…") that looks across the Library and Repairs at once. |
| Tab row Library · Custom line · Repair | **Remove.** Replaced by the left **rail** (`sheet-rail`, 196 px): **Library** → Everything (count) and one row per category with its count; **Repairs & prep** → All repairs and one row per group with counts; **Anything else** → Custom line. The selected row is lavender (`nav-{library|repair|custom}-{slug}`); while a search is typed no row is selected. Clicking a row clears the search. |
| Library list (one long row per item) | **Cards, two to a row** (`lib-row-{id}` kept on the card): photo or icon · name (click = line details, as today) · "$14.00/m² · 2 coats" (or "No price yet" in red) · description, two lines max · **Add** (→ "✓ Added", same handler). Group labels with counts (`WALLS 4`); the "Outside / Inside the house — also in your Library" marker (`sheet-other-side`) sits on the group label. |
| Repair list | **Same cards** (`task-row-{id}`): purple wrench or red hazard icon · name · "$6.00/lm · 6 min" or "Hazard flag" · description · Add. Hazard rows open the details panel on add, as today. |
| Search | **One field for everything:** results grouped as the Library categories that match, then "Repairs & prep", each with counts; when nothing matches, "Nothing in the Library or Repairs matches …". Every search ends with the offer **"Not in the Library? {words} can be a custom line …" → Add as a custom line** (`search-custom-btn`): opens the Custom line form with the words already in Description and the cursor there. |
| Custom line form (one column) | **Two columns** (`.form2`): Kind tiles across the top (`kind-*`), then Description · Qty / Unit / Rate (or Sub-quote) side by side, Markup % · Shown to client (`trade-shown`) for Trade, Labour hours for Labour, Note + "Show the note on the quote" (`custom-show`). Same ids (`cu_*`), same reader, same Add line (`custom-add`). |
| Measure strip (area without measurements) | **Keep**, at the top of the content column (`measure-strip`). |
| Footer | **Keep:** "N added this session · quote now $…" (or "Quote total $…") + Done (`sheet-done`); on Custom line "Adds one line to {area}" + Add line. |
| Area switch (`shArea` select), dims inputs, products chips, details panel | **Unchanged** handlers and ids. |

## 2. Verify (agent-tested / Unverified, then the testing-agent pass at 1440 and 1024)

1. The sheet opens at the picker's size (860 × window height, on the right, at both widths); no tab row; On the paper lists the area's lines; one search in the header.
2. Rail: Library categories with counts, Repairs & prep groups with counts, Custom line; clicking a category shows only that group, the row is highlighted; All repairs shows repair cards only.
3. Cards two to a row with photo/icon, name, price · coats (or No price yet), description, Add; Add → Added and the footer count and total update; clicking a name opens the line details panel as today; hazard add still opens details.
4. Search "crack" → Repairs results and the custom-line offer, rail unselected; "wall" → Library walls; the offer opens the Custom line form with the words filled; the form is two columns; Trade shows sub-quote, markup and the shown-to-client price; Add line adds as today.
5. Measure strip for an unmeasured area; area switch resets the Added marks as today; Done closes; Escape closes; no console errors at 1440 and 1024; suite green before and after; nothing created on any tenant beyond TS_.

No What's new draft (the sheet is inside Round 68's "Quicker estimates", still a draft — add one line to that draft's third card if you think it needs it; otherwise leave it).

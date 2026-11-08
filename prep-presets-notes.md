# Round 89 — Prep as a pop-up from the line panel (8 November) — DRAFT, waits for Josh's review and "send"

Prototype: **`estimate-builder-prep.html`** (open at 1440: click the Skirting line's summary → the Preparation row reads "Edit prep · 3" with the steps under it → click it → the pop-up: search "sand", tick Wash down, type "Remove picture hooks" + Enter, hover "Strip old wallpaper" and × it, type a one-off note, Done → Save → the paper and the Client view carry the steps; open the Walls line, tick Preparation → "Add prep"; then 1024). Playwright `tools/test_prep.js` **25/25** at 1440 and 1024. Built on the Round 88 builder (`estimate-builder-paint.html`, generator `tools/make_prep.py`); everything not named here is unchanged. Josh's note 21 of 7 Nov, with his change of flow (8 Nov): **not a Library section — a pop-up from the builder, multiple steps, add your own.**

## 1. Where it lives

- In the line panel's **Rate and time** steps, the **Preparation** row keeps its checkbox, rate and minutes. When Preparation is ticked, the row's hint gains a link: **Add prep** when no steps are chosen, **Edit prep · {n}** when some are (`prep-edit`). Under the row a muted line lists the chosen steps, "·"-separated, then the one-off note in italics, and "NOT ON THE QUOTE" when printing is off (`prep-summary`).
- Ticking Preparation does not open anything by itself; the link does. Unticking Preparation keeps the steps on the line (hidden) so a slip is not a loss; ticking again shows them.

## 2. The pop-up (`prep-pop`)

A centred box, 520 px wide, over the panel (the panel stays open behind it). From top to bottom:

1. **Title** "Preparation" with the line's name and area under it; × closes.
2. **Search** (`prep-search`) filters the list as you type; no match → "Nothing matches "{text}" — add it below and it is yours from now on."
3. **The list** (`prep-list`): one row per step, a checkbox each, multiple ticks. The business's list = the **standard steps** seeded for every business plus the business's **own steps** (marked "YOURS"; × on hover removes one from the list, with a toast). Standard steps cannot be removed. The count at the bottom updates on every tick ("3 steps chosen" / "No steps chosen yet", `prep-count`).
4. **Add your own** (`prep-new` + Add, or Enter): the step is added to the business's list, ticked, and kept for next time (saved to the business, not the quote). Typing a name that already exists ticks the existing one.
5. **One-off note for this line only** (`prep-extra`, optional): free text that does not join the list.
6. **Print on the quote and show the crew** (`prep-show`, default on).
7. **Also set this prep for:** two ghost buttons, "all {category} in {area}" and "all {category} everywhere" (`prep-apply-area`, `prep-apply-all`), same wording as the product buttons: they apply the same steps, note and print switch to the other library lines of the same category and close.
8. **Cancel / Done** (`prep-done`). Escape and a click outside close the pop-up only; the panel stays.

**Standard steps (seeded per business, in this order):** Wash down with sugar soap · Fill nail holes and cracks · Sand back · Scrape loose and flaking paint · Spot prime bare patches · Caulk gaps and joints · Patch plaster · Treat mould · Degloss glossy surfaces · Remove and refit hardware · Mask and cover with drop sheets · Pressure wash · Treat rust on metal · Timber repairs and putty · Seal stains.

## 3. What is stored and where it prints

- On the line: `prep_steps: [names in the list's order]`, `prep_extra: ""`, `prep_show: true|false`, alongside the existing `prep: true`. The existing free-text `prep_note` (Round 77 part 2a) is **replaced** by these: an old line's `prep_note` is shown once as the one-off note when its pop-up first opens (so nothing typed before is lost) and saved back as `prep_extra`.
- On the business: `prep_steps` (the list: `[{name, own}]`), seeded with the standard steps on first use; own steps added and removed from the pop-up only. No Library page.
- **The paper**: the line's summary reads "Prep · {steps · joined} — {note} · Prime · 2 coats · …" (Round 76's order; the note after an em dash).
- **The client view, public page, PDF and email**: the line's sub-line reads "prep: {steps} — {note} · 2 coats" when Print on the quote is on, plain "prep · 2 coats" when off (today's behaviour for the note).
- **The crew** (job view and the Scope screen): the same text when Print on the quote is on; that is the crew chat's reading of an existing field, no change needed there.

## 4. Backend

- `PUT /estimates/{id}` accepts `lines[].prep_steps` (list of strings, each ≤ 80 chars, ≤ 30 per line), `prep_extra` (≤ 300 chars), `prep_show`.
- `GET /api/prep-steps` → the business's list (seeded on first read); `POST /api/prep-steps {name}` adds an own step (dedupe case-insensitively; returns the list); `DELETE /api/prep-steps/{name}` removes an own step (a standard one → 400). Tenant-scoped; `admin_settings.prep_steps`.
- `services/estimate_lines.prep_text(line)` builds the text used by the client documents, the PDF, the email and the crew routes, honouring `prep_show`; `prep_note` falls back when `prep_steps` is absent (old quotes).
- Lucy and MCP: no change (they read the same rows).

## 5. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. A TS_ line with Preparation off: no link; tick → "Add prep"; the pop-up opens with the 15 standard steps, nothing chosen; Escape closes it and the panel stays.
2. Tick three steps, add "Remove picture hooks" with Enter (ticked, YOURS), type a one-off note, Done → "Edit prep · 4" and the summary line; Save; the paper reads "Prep · … — note"; reload keeps it; the client view and the PDF read "prep: … — note".
3. × on the own step removes it from the list and from the line; a standard step shows no ×; reopening the pop-up on another line shows the own step is gone from the list.
4. Print on the quote off → the summary shows NOT ON THE QUOTE; the client view and PDF read plain "prep".
5. "all walls in {area}" sets the same prep on the other walls lines of that area and leaves other categories alone; "everywhere" does the same across areas.
6. An old TS_ line seeded with a `prep_note` and no `prep_steps`: the pop-up opens with the note in the one-off field; Done saves it as `prep_extra`; the paper reads as before.
7. Search "sand" narrows to one; clearing restores the list. 1024: the pop-up fits the viewport; no horizontal scroll; no console errors; nothing under `app/employee/*`.

## 6. Tests

`backend/tests/test_r89_prep.py`: the list's seed, add (and dedupe), remove (standard → 400), isolation; the line fields' validation; `prep_text` with steps, note, show off, and the `prep_note` fallback; the client document and PDF text. Suite green before and after.

## 7. What's new

A new draft, the next free number, title **"Prep, ticked off"**, one card: "Tick Preparation on a line and choose the prep steps from a list — yours to add to. They print on the quote and the crew see them, unless you say not to." Draft only.

## 8. Report

`memory/reports/round89-prep-report.md`, starting "Round 89 done": the verify items, the `prep_note` migration behaviour, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

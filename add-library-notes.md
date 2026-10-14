# Fix Round F · part 2b — Add to the Library from the quote (proposal for Josh's review, not sent)

Prototype: **`estimate-builder-add-library.html`** (built on the Line details v2 base, so both parts stack). Open at **1440** first: Add work to Kitchen → type "bagged brick" in the search → **Add to the Library** → the Library page with the return bar → name, rates → **Save item** → back in the sheet on Walls with the new card first → **Add**. Then: Add work → Ceilings → the dashed **New Library item in Ceilings** card → Cancel; Repairs › Plaster → **New repair task in Plaster** → Save task → Add. Then **1024**. Playwright: `tools/test_add_library.js`, **50/50** at both widths. Screenshots: `add-library-page-1440.png`, `add-library-back-1440.png`, `add-library-task-1440.png`.

Owner's item 3 from the 14 October list: "the Library of add task or item should be reachable from the builder; a button that takes you to the right place in the Library; the estimate saves first." Becomes the spec after Josh's changes; queues behind part 2a.

## 1. The flow

1. **Two doors in the Add work sheet.** (a) Search with no match: the hint now reads "Not in the Library? **{text}** can be a one-off custom line, or a new Library item you will have next time too." with two buttons, **Add as a custom line** (as today) and **Add to the Library** (accent). (b) At the end of every Library category view: a dashed card **New Library item in {category}** ("Saves this quote, opens the Library, brings you back"); at the end of every Repairs & prep group: **New repair task in {group}**.
2. **The quote saves first.** The builder forces its autosave and waits for it (toast "Quote saved"); if the save fails, the user stays on the builder with the usual error and nothing opens.
3. **The Library editor opens with a return bar.** The existing Library screens (`app/admin/library/add-variant.tsx` for items, `add-task.tsx` for repair tasks) open with: the name prefilled from the search (items) or empty, the category or group preselected (the rail category the user was in; from a search, a guess by the words: "ceiling" → Ceilings, "door / frame / skirting / trim / window" → the matching category, else Walls), and a sticky bar at the top: **← Back to quote {number} · {area}** · "You came here from the quote. Save and you go straight back with it ready to add." · "✓ Quote saved {h:mm am/pm}". Everything else on the editor is the screen as it is today; the prototype shows a condensed version of it.
4. **Save brings you back.** Save item / Save task returns to the builder with the Add work sheet open on the same area, on that category or group, the new card **first** with a **New** pill and an accent outline, and the toast "{name} is in your Library — add it to {area}". One tap on Add puts it on the quote. Back, Cancel and Escape return to the sheet exactly as it was (same area, category, search text), with nothing created.

## 2. What changes in the app

| Where | Change |
|---|---|
| `components/estimate/v2/AddWorkSheet.tsx` (follow-up A's sheet) | The two-button hint in the no-match state; the dashed card after the cards of a Library category and after the tasks of a repair group; both call `onAddToLibrary({ kind: 'item' \| 'task', category, name })`. |
| `components/estimate/v2/Builder.tsx` | `onAddToLibrary`: `await saveNow()` (the existing autosave, forced and awaited; on failure show the existing save error and stop), then `router.push('/admin/library/add-variant?category=…&name=…&return=' + encodeURIComponent('/admin/estimate/{id}?addwork={areaId}&cat={category}'))` (tasks: `add-task?group=…&name=…&return=…&cat={group}`). On load with `?addwork=…&cat=…&new={id}`: open the sheet on that area and category (repair group when `kind=task`), put the item with `new` first with the New pill and outline, show the toast. |
| `app/admin/library/add-variant.tsx`, `add-task.tsx` | Read `return`, `category` / `group`, `name`. With `return` set: the sticky return bar above the page (accent tint, the exact texts in §1.3; the time is the save time passed as `saved=` in the URL, formatted h:mm am/pm in the business time zone); prefill the name and category/group. On Save: navigate to `return` + `&new={newId}&kind=item|task`. On Back, Cancel or Escape: navigate to `return` without `new`. Without `return`: the screens are unchanged. |
| Guessing the category from a search | One helper `guessCategory(text, categories)` in the frontend, the rule in §1.3; the user can change the category on the editor. |

No backend change. No new route. The item or task is created by the editor's existing save; the builder reads it from the Library on return.

## 3. Verify (testing agent, 1440 then 1024, TS_ tenant)

1. Search "bagged brick" (no match) → both buttons; **Add to the Library** → toast "Quote saved", the Library editor with the return bar naming the quote and the area, name prefilled, category Walls.
2. Save with an empty name → the editor's own validation; fill name, rates, Save item → back in the builder, sheet open on Kitchen › Walls, the new card first with the New pill and its price; Add → the line is on the paper in Kitchen; reload the page → the quote still has the line (the save really happened).
3. Ceilings → the dashed card → editor with Ceilings preselected → Cancel → sheet on Ceilings, nothing created in the Library.
4. Repairs › Plaster → New repair task → editor (group Plaster) → Save task → sheet on Plaster, the new task first with the New pill, "$45.00/ea · 20 min" → Add → on the quote.
5. Escape on the editor with a return bar = Cancel. The editors without `return` look and behave exactly as before.
6. Isolation: the item lands in the TS_ tenant's Library only. 1024: no horizontal scroll; no console errors; `tsc` clean; `app/employee/*` untouched.

## 4. Tests

Frontend-only round; the testing agent covers §3. One backend assertion in the existing library tests if the editor's save route gains nothing: none. Suite green before and after.

## 5. What's new (Draft only)

**Title:** Add to the Library from the quote
**Body:** Typing something the Library doesn't have? Add work now offers "Add to the Library" beside the custom line, and every category ends with "New Library item". The quote saves itself, the Library opens with the name filled in, and Save brings you straight back with the new item ready to add. Repairs work the same way.

## 6. Questions for Josh (one line each)

1. The category guess from the search text (Ceilings, Doors, Skirting…, else Walls) — fine, or always ask?
2. Should the quote also reopen the Line details panel of the new line after Add, so prices can be checked straight away? (Prototype: no, one tap on Add is the end.)
3. Anything on the Library editor's return bar you want worded differently?

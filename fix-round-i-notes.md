# Fix Round I — small fixes and the test debt (10 November) — READY, waits for Josh's word; no prototype needed

From `fix-round-i-candidates.md` (7 Nov) and Josh's notes of 10 Nov (`notes-triage-10nov.md`), checked against the code at `1acc836` (the latest on GitHub: Round 88; Round 89's code is not pushed yet — item 9). Backend and admin frontend only; nothing under `app/employee/*`; TS_ tenants only; the owner's tenant read-only; nothing published. Each item names the file and line as they stand.

## 1. The five test files that fail before any round touches them

Named as pre-existing by the Round 87, 88 and 89 reports: `test_r78_contracts` (2 cases), `test_materials_tier_gating` (3), `test_r46_attachments` (2), `test_r63_worker` (1), `test_r19` `test_42_filters_and_paging`. For each: run it, paste the failing assertion, say whether the **behaviour** or the **test** is wrong, and fix that one — never delete a test to make the suite green. What the files cover, so the answer is checkable:

- `tests/test_r78_contracts.py`: countersign stores a reference not bytes and attaches the PDF; the private blob is served only by the contract routes; the files listing reads the saved reference; a gone blob renders on request; a legacy base64 document still serves; Drive-connected uploads go private under `employee contracts` (:53–:136). The November contract and Drive work changed this area.
- `tests/test_materials_tier_gating.py`: `TestMaterialsMeta` (meta reflects a live downgrade), `TestTierGating` (patch / verify / delete of a curated product → 403 on *standard*, allowed on *pro*), `TestStandardOwnMaterials`, `TestBrandAllowList` (:69–:143). `routes/materials.py:57–70` reads the tier through `services.plans.plan_key` since Round 80 (starter/small → standard, enterprise → pro) — the likeliest break is the plan names.
- `tests/test_r46_attachments.py`: upload limits and row shape; the crew switch, signed link, rename, delete; the quote bundle cap, public link and accept links; isolation (:28–:161).
- `tests/test_r63_worker.py`: the web process registers no scheduler; the lock prevents a double run; the harness worker starts and logs jobs; the briefing slot query; the price-refresh batches; a stale running job is marked failed (:41–:165).
- `tests/test_r19_…py:54 test_42_filters_and_paging`: filters today's daily report by the tenant's business day (`Australia/Melbourne`); known to depend on the runner's date around midnight — if that is all, make the test seed a report for "today in the tenant's zone" rather than rely on the clock.

After the fixes the suite runs chunked, as Rounds 85–89, and the report lists every file green or names what is still red and why.

## 2. The builder's top bar wraps to two rows at 1024

`components/estimate/v2/Builder.tsx:112–121`: the bar is `flexWrap: 'wrap'` and carries back · number · status · type chip · spacer · *"● Saved just now"* · the Builder | Client switch · 📷 · ☰ · ⋯ · **Send**. At 1024 the text pushes Send to a second row (Round 88's testing agent). Fix, at `width <= 1100` only: the save indicator shows the dot alone with the text as its `title`; the Builder | Client switch shows its two icons without words; the number keeps `white-space: nowrap`. One row at 1024 with Send visible; 1440 unchanged.

## 3. The client document's product rows and their surfaces

`services/estimate_lines.py:363–375 products_rows` groups by product + colour and collects every surface (`line.library.category`) into `surfaces`. Round 88 noted a Trim line shown under the first line's surface. Check the three renderers — `components/estimate/v2/ClientDoc.tsx:41` (the *Products and colours* table), `services/pdf.py:415`, the public page — print **all** surfaces of a row, joined with " · " in the order they were collected, not the first one; fix whichever prints one. Verify with a TS_ quote that uses one product on Walls and Trim in the same area: the row reads *Walls · Trim*.

## 4. The project's Job money card after a payment

`app/admin/project/[id].tsx:44–47`: the page reloads on tab focus and visibility (Round 40 §2.7), but a payment recorded on the invoice page in the **same tab** and a return to the project page fires neither, so the card shows the old figures until a fresh open (Josh, 7 Nov; Emergent's offered "one-line refetch"). Fix: `useFocusEffect(useCallback(() => { load(); }, [load]))` from `expo-router`, so the screen reloads whenever it comes back into focus; the existing listeners stay. Verify: record a payment on a TS_ invoice, go back to the project — the card and the Linked records line show the new balance without a reload.

## 5. The "R17b test idea" rows in the platform feedback are test residue, not a tester

The five feedbacks parked as *"let me duplicate a quote for a repeat client"* (FB-3f26b1ee, FB-36b69c40, FB-c809a766 on 22 Oct, 25 Oct, 2 Nov; FB-0db440e9 7 Nov; FB-a75f7ea5 8 Nov — `memory/PARKING_LOT.md:1501–1516`) all come from **TS_ Alpha Owner (TS_ Alpha Painting)** with the title *"R17b test idea"*: the testing agent's seeded idea from Round 17b, re-created on test runs, surviving the TS_ teardown, and then parked by the routine as though a painter had written it. Fix: (a) the TS_ teardown deletes feedback threads and messages whose tenant or author is `TS_`; (b) the platform feedback list and the sidebar's unread count (`/platform/feedback/unread`) exclude TS_ tenants; (c) the five rows are removed from the platform inbox and from `memory/PARKING_LOT.md`; (d) the Round 17b test keeps working against its own TS_ tenant. For the record: **Duplicate estimate already exists** in the builder's ⋯ menu (`Builder.tsx:91`, `more('dup')`) — it copies the quote for the same client; nothing to build.

## 6. Week and Day: a multi-day entry on every day it covers, and the view opens where the day starts

`components/calendar/WeekGrid.tsx:157` places all-day and multi-day entries with `allDay.filter(e => e.date === iso(d))`, so a job or any entry with an `end_date` shows on its **first day only** in Week and Day, while Month draws the whole bar (`calModel.ts:36 isSpan`). Fix: the predicate becomes `startOf(e) <= iso(d) && iso(d) <= endOf(e)` (the helpers at `calModel.ts:37–38`), and a bar that continues from the previous day or into the next shows a small › / ‹ at its edge. Second: the hour grid starts at 06:00 and opens at the top, so on a tablet the timed items of the day sit below the fold (Josh's 10 Nov screenshot, "3 things in view", one visible). Fix: on opening Day or Week, scroll the grid so the first timed item of the day is at the top, and to the business's operating-hours start when there is none. If Josh names another oddity (`notes-triage-10nov.md` §B 2), it joins here.

## 7. No "install the app" on the client's pages

`app/+html.tsx:35–39` links the admin manifest on every non-crew page, and `app/_layout.tsx:87` mounts `InstallAppBanner` everywhere but crew paths (`InstallAppBanner.tsx:16`), so the public quote, invoice, variation and report pages (`app/quote/[token].tsx`, `app/invoice/[token].tsx`, `app/variation/[token].tsx`, `app/report/[token].tsx`) and `/`, `/signup`, `/welcome`, `/terms`, `/privacy` are installable and show the banner — Josh saw it opening his own quote as the client. Fix: the manifest link and the apple-title meta only under `/admin` (admin manifest) and `/crew`, `/employee` (crew manifest) — in the head script and in the root layout's route-change re-apply; the banner mounts only there; on every other path `beforeinstallprompt` gets `preventDefault()` so Chrome's own bar stays away too. The service worker registration is untouched (asset cache). Verify: open a TS_ quote link in Chrome on Android and desktop — no banner, no install bar, the page works; the admin and crew doors still install.

## 8. The project's site address is the job's, not the client's home

On acceptance `routes/projects.py:505` sets `site_address = estimate.clientAddress`, geocodes it and writes `address`, `location_address`, `location_label` and the coordinates from it (`:553–558`), while the project's name (`:513`) already uses the estimate's job address (`jobAddressDetails`). Result (Josh's 10 Nov screenshot): title *20 Convention Centre Place, South Wharf*, card and map at the client's home. Fix: `site_address` = the job address when `jobAddressDetails` has a street (street, suburb, state, postcode joined), else the client address; geocode that; `_crew_address` (`:779`) follows unchanged; the *Job site & client* card shows the site under the client's name and *Open customer record* keeps the home. Existing projects: **no backfill**; the card gets a small **Re-sync from the estimate** link (the card already says *Synced from EST-…*) that re-derives address, coordinates and label for that one job on a click. Verify: a TS_ estimate with a job address different from the client's → accept → the project shows the site; the re-sync link fixes a TS_ project created before.

## 9. "Starts in NaN days"

`app/admin/project/[id].tsx:71` shows `Starts in ${daysUntil(p.start_date)} days`; `components/lists/ListKit.tsx:17 sod` runs `new Date(x)` on whatever is stored. Find what that project's `start_date` holds (Josh's job *20 Convention Centre Place* showed *09/10/2026* in the field and NaN in the strip); save ISO `YYYY-MM-DD` from the date input in every path that writes `start_date` / `target_end_date`; and when the days cannot be computed show *Starts {long date}*, never NaN. The same guard on `daysAgo` / `ago` where the strip uses them.

## 10. The AI summary's gaps read as a sentence

`app/admin/project/[id].tsx:213–217` (Round 40 B46) renders every `[gap]` the model writes as the fixed phrase *not on record yet*; the 10 Nov summary read *"so the job needs a not on record yet and not on record yet"*. Fix: render the bracket's own words in muted italics (*a start date and a finish date*) with *not on record yet* as the hover title; and the summary prompt (`ai_routes.py`, the project-summary system text) says to write "no start date on record" in words rather than a bracket inside a sentence. Verify on a TS_ project with no dates: the sentence reads naturally; nothing else in the summary changes.

## 11. Date fields: day / month / year everywhere, and no typing of dashes

Josh, 10 Nov: *"go through all the pages — anywhere there is a place to add a date, make sure it is day/month/year with the slashes added for you."* Inventory at `1acc836`: **26 native `type="date"` inputs in 18 files** (CalDrawer, InvDialogs, ItemModal, the project page, MyHoursTab, XeroRow, MyobRow, AccountPage, RateModal, the builder's Dialogs, FileCard, the daily-reports FilterBar and ExportModal, the CRM Composer, IssueWizard, CountersignModal, CalRail, employee-detail) — these already show **dd/mm/yyyy on an Australian device** with a picker, and typing digits moves day → month → year by itself. **Three places are free text with an ISO placeholder** and are the ones Josh sees: the project strip's Start / Target finish (`app/admin/project/[id].tsx:30 DateIn`, the *YYYY-MM-DD* box in his screenshot), the invoice's record-payment date (`app/admin/invoices.tsx:252`), the estimate follow-up's Due (`app/admin/estimates.tsx:245`); `events.tsx:88/:161/:356` still carries DD/MM/YYYY ↔ ISO conversion code for a birthday field. Fix: one shared `components/shared/DateInput.tsx` — a native `type="date"` with `lang="en-AU"`, the app's input styling, an empty-state placeholder *dd/mm/yyyy*, and ISO `YYYY-MM-DD` in and out — used by the three text fields and by the 26 native ones as they are touched (no behaviour change for them); the birthday conversions in `events.tsx` go through it too. Verify: every date field on the admin pages shows day/month/year on a device set to en-AU and stores ISO; the project strip, the payment date and the follow-up Due open a picker and accept typed digits without a dash.

## 12. Every form above the keyboard on a tablet or phone — the sweep

Josh hit it twice on 10 Nov (Choose a client, then the Round 89 prep pop-up) and asked for every form to be checked. Three causes, found across the admin app at `1acc836`:

**(a) The page does not shrink for the keyboard.** `app/+html.tsx:13` sets `viewport` without `interactive-widget`. On Android Chrome the on-screen keyboard then shrinks only the *visual* viewport, so a dialog fixed to `inset: 0` and centred (`maxHeight: 92vh`) keeps its size and the keyboard simply covers its lower half. Fix, once for the whole app: `interactive-widget=resizes-content` in that meta — the layout viewport shrinks with the keyboard, every centred dialog and right-hand drawer reflows into the space above it, and their scrolling bodies take the rest. iPhone Safari ignores the flag and scrolls the focused field into view on its own; the admin app's phones are mostly Android, and the autofocus rule below helps both.

**(b) Eight dialog shells, each sized once.** `estimate/v2/ui.tsx` `Dialog` (`:16`, `maxHeight: 92vh`) and `Sheet` (`:32`); `crm/v2/kit.tsx` `Dialog` (`:95`) and `Drawer` (`:109`); `employees/EmpDialogs.tsx` `Dialog` (`:15`); `equipment/eqUtils.tsx` `Modal` (`:42`); `design-system/Modal.tsx` (`:21`); `shared/SetupPanel.tsx` (`:18`); `lists/ListKit.tsx` `Drawer` (`:179`). Each: height capped at `100dvh` minus its margin (not `vh`), a body that scrolls (`minHeight: 0`), header and footer fixed — the pattern `SetupPanel.tsx:47` already has. Lists with a fixed `maxHeight` inside a dialog (Choose a client `Dialogs.tsx:54` 360 px, `PickFromYardModal.tsx:26` 320 px, the project's product picker `project/[id].tsx:177` 220 px, `VariationModal.tsx:78` 280 px, the brand listbox `ProductForm.tsx:74`) lose the fixed number and fill the body instead, scrolling within it.

**(c) Autofocus on touch.** Fifteen `autoFocus` sites open the keyboard before the person has seen the form. Rule: a shared `useAutoFocus()` (or `autoFocus={pointerFine}`) that focuses only when `(pointer: fine)` matches — desktop keeps focus-on-open, a tablet or phone waits for the tap. Sites: the client search (`estimate/v2/Dialogs.tsx:53`), the New event title (`calendar/CalDrawer.tsx:99`) and quick-add title (`CalRail.tsx:75` — gone with Round 91), the equipment item name (`equipment/ItemModal.tsx:33`), the timesheet note (`timesheets/PersonDrawer.tsx:29`), the invoice message (`invoice/v2/InvoiceBuilder.tsx:147`), the payment amount (`app/admin/invoices.tsx:248`), the follow-up note (`app/admin/estimates.tsx:244`), the client tag (`crm/v2/ClientPage.tsx:78`), the collection name (`training/LibraryParts.tsx:39`), the document-type name (`employees/detail/FileCard.tsx:72`), the add-variant inline input (`app/admin/library/add-variant.tsx:180`), the countersign name (`contracts/CountersignModal.tsx:17`). Two autofocus a **button**, not a field (`archive.tsx:82` confirm, `files/Attachments.tsx:50` rename-ok): no keyboard, leave them. **Round 89's prep pop-up** is not on GitHub yet; its search box follows the same rule, and its 520 px box and scrolling list get the `dvh` cap of (b).

Verify, on Android Chrome at 390 and on a tablet, and at 1440: Choose a client, the prep pop-up, Add work, New event, New client, Add item (equipment), Pick from yard, the project's Add paint, Record payment, the follow-up — each opens with the form visible and no keyboard; tapping a field raises the keyboard and the form's body scrolls above it with the footer buttons reachable; desktop focus-on-open unchanged.

## 13. The New client form: Phone sinks below Email

Josh, 10 Nov (screenshot): in the builder's *New client* dialog the Phone box sits lower than the Email box and the two labels do not line up. Cause: `components/estimate/v2/ui.tsx:14 Row` lays its fields out with `alignItems: 'flex-end'`, and the Email field carries a hint under its input (*"Needed to send the quote. You can add it later."*, `Dialogs.tsx:46`), so the row's floor is the hint's bottom and the hint-less Phone field drops to it. Fix: `Row` aligns `flex-start` (labels on one line, inputs on one line — this also tidies the Edit client row at `:41`, the *Other contact* row at `:50` and Suburb / State / Postcode at `:47`), and the email hint moves under the whole row as one muted line (*"Email is needed to send the quote — you can add it later."*). Verify at 1440, 1024 and on a tablet: Name full width, Phone and Email level, the hint beneath them, Address, then Suburb / State / Postcode level.

## 14. The client's document: no price on the area row

Josh, 10 Nov (screenshot of the client view): *Deck & Stairs · $2,660.00* above *Decking · Deck restoration · 38 m² · $70.00 · $2,660.00* — the same money twice; the area is a label, the task is what costs. `components/estimate/v2/ClientDoc.tsx:37` prints each area group's summed total in its header row, and `services/pdf.py:351` (`_grouped_labour`) prints the same bold amount in the PDF's area row. Fix: the area row keeps the name, the dimensions and the note, and loses the amount, in the client view, the public page (same component) and the PDF; the section total *What we will do* and the Subtotal are untouched. Verify: a TS_ quote with two areas of two lines each — no amount on either area row, the lines and totals unchanged, PDF and public page the same.

## 15. The client's document: an empty "Job details" box

Same screenshot: a grey *Job details* card with nothing in it. `ClientDoc.tsx:34` and `pdf.py:316–326` always draw the card and only its rows (`Site`, `Est. duration`, `Start`) disappear when empty; the PDF's *Site* falls back to the client's address (`pdf.py:319`), the client view's does not. Fix, both places the same: *Site* = the job address when the quote has one, else the client's address; *Est. duration* and *Start* when set; and when there is nothing at all (no address anywhere, no duration, no start) the card is not drawn and *Prepared for* takes the row. Verify: the TS_ quote of §14 with no job address shows the client's address as Site; a quote with nothing shows one card; the PDF matches the view.

## 16. New client: the state is not QLD by default

`components/estimate/v2/Dialogs.tsx:34` starts a new client with `state: 'QLD'` for every business — Josh's Ivanhoe client came out as *Ivanhoe QLD* on the quote. Fix: the State field starts empty and fills from the Address finder's pick as it already does; if the business profile carries a state (the business address picked through the finder), that is the starting value instead. The same check on the CRM's New client form (`crm/v2`) and the lead-to-client conversion, so no form carries a hard-coded state. Verify: a TS_ business in Victoria opens New client — State empty; picking an address fills VIC; the quote reads *Ivanhoe VIC*.

## 17. Not in this round, and why

- **The CRM inbox at 390** (Round 87): code-verified only; Josh checks it on his phone after the publish — a note, not a build item.
- **Equipment "there is no list of items"** (Josh's note 16): the page lists his one item; if he meant a standard list to add from (ladders, sprayers, drop sheets), that is a small design round, not a fix. Josh's word.
- **Round 88's profile-defaults fix** (`admin_profile.py:281`) is already in.

## 18. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. Each test file of §1 green, or the report names the case and the reason; the full suite before and after, chunked.
2. The builder at 1024: one row, Send visible, the dot's title reads the saved time; at 1440 unchanged.
3. A TS_ quote with one product on Walls and Trim: the client view, the public page and the PDF all read *Walls · Trim*.
4. The payment flow of §4 without a reload.
5. The platform feedback inbox shows no TS_ rows; the unread count ignores them; the teardown removes a seeded TS_ idea; Round 17b's own test still passes.
6. Week and Day: a TS_ job over three days shows on all three; the day opens at its first timed item.
7. A TS_ quote link on Android Chrome and desktop: no install banner, no install bar; the admin and crew doors still install.
8. A TS_ acceptance with a job address: the project card, map and geofence at the site; the re-sync link corrects an older TS_ project.
9. The strip never reads NaN; a project with an ISO start reads *Starts in n days*.
10. The summary sentence on a TS_ project without dates reads naturally.
11. Every admin date field shows day/month/year on an en-AU device and stores ISO; the three former text fields open a picker.
12. The ten forms of §12 on Android at 390 and a tablet: visible on open, keyboard only on tap, body scrolling above the keys, footer reachable; desktop unchanged.
13. New client: Phone and Email level with the hint beneath; the other `Row`s unchanged in meaning, level in layout.
14. The client view, public page and PDF: no amount on an area row; the totals unchanged.
15. Job details: Site falls back to the client's address; the card is absent when there is nothing to say; PDF and view agree.
16. New client's State starts empty (or the business's); a Victorian address reads VIC on the quote.
17. `tsc` clean; no console errors; nothing under `app/employee/*`.

## 19. What's new

A new draft, the next free number, title **"Small fixes"**, one card: "The calendar's Week and Day now show a multi-day job on every day it covers and open at your first appointment. A job's page shows the site address, not the client's home. Clients opening a quote are no longer offered the app. Every date is day/month/year. On the quote, an area is a heading again — the price sits on the work, not twice." Draft only; never publish.

## 20. Report, and GitHub

`memory/reports/round-fix-i-report.md`, starting "Fix Round I done": the five test files with their outcome, the fifteen fixes with file:line, the suite before and after. **Then push to GitHub** (Save to GitHub) and name the commit in the report: `main` on GitHub is `1acc836`, Round 88 — Round 89's code and report (9 Nov) never arrived, and every round from here should end with a push. No code review. Do not start anything else after it. Do not offer next action items.

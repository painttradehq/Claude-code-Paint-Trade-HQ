# Fix Round I — small fixes and the test debt (10 November) — READY, waits for Josh's word; no prototype needed

From `fix-round-i-candidates.md` (7 Nov) checked against the code at `1acc836` (the latest on GitHub: Round 88; Round 89's code is not pushed yet — item 9). Backend and admin frontend only; nothing under `app/employee/*`; TS_ tenants only; the owner's tenant read-only; nothing published. Each item names the file and line as they stand.

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

## 6. Not in this round, and why

- **The CRM inbox at 390** (Round 87): code-verified only; Josh checks it on his phone after the publish — a note, not a build item.
- **Equipment "there is no list of items"** (Josh's note 16): the page lists his one item; if he meant a standard list to add from (ladders, sprayers, drop sheets), that is a small design round, not a fix. Josh's word.
- **Round 88's profile-defaults fix** (`admin_profile.py:281`) is already in.

## 7. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. Each test file of §1 green, or the report names the case and the reason; the full suite before and after, chunked.
2. The builder at 1024: one row, Send visible, the dot's title reads the saved time; at 1440 unchanged.
3. A TS_ quote with one product on Walls and Trim: the client view, the public page and the PDF all read *Walls · Trim*.
4. The payment flow of §4 without a reload.
5. The platform feedback inbox shows no TS_ rows; the unread count ignores them; the teardown removes a seeded TS_ idea; Round 17b's own test still passes.
6. `tsc` clean; no console errors; nothing under `app/employee/*`.

## 8. What's new

No draft — nothing a user sees changes except the builder bar at 1024 and the money card refreshing, which need no note.

## 9. Report, and GitHub

`memory/reports/round-fix-i-report.md`, starting "Fix Round I done": the five test files with their outcome, the four fixes with file:line, the suite before and after. **Then push to GitHub** (Save to GitHub) and name the commit in the report: `main` on GitHub is `1acc836`, Round 88 — Round 89's code and report (9 Nov) never arrived, and every round from here should end with a push. No code review. Do not start anything else after it. Do not offer next action items.

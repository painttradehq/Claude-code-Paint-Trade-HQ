# Fix Round J — merge Josh's bug-fix branch, verify it, then fix the rest of his list (one round)

*Sent to Emergent on 11 Nov (evening) on Josh's word: "Emergent has credit now. When you're done ask it to fix these issues."*

Josh ran a full test of the published app (11 Nov) and listed 58 bugs. While you were out of credit, twenty of them were fixed in code on the GitHub branch **`claude/fix-round-j`** (11 commits on top of `main` `5e16d97`; it also carries Round 99, the quote terms). Part A brings that in and verifies it. Part B is the rest of the list. Same rules as every round (end of message).

## Part A — merge and verify (do this first; report before Part B)

1. `cd /app && git fetch origin claude/fix-round-j && git merge origin/claude/fix-round-j`. Merge, never rewrite; if the tree has moved, merge and keep both sides. **If the fetch is refused (auth), stop and reply "fetch refused: <the error>" — don't retype the changes by hand.**
2. Suite before and after. Four pure files run without the harness and must be green: `tests/test_r99_quote_terms.py` (8), `tests/test_fixj_pricing_source.py` (5), `tests/test_fixj_quote_guard.py` (14), `tests/test_fixj_job_money.py` (7). `tsc --noEmit` has one pre-existing red (`CoverageBar.tsx:86`) — leave it.
3. Testing agent on the preview, TS_ Alpha, 1440 then 1024, these checks (each commit message carries the detail):
   - B-001 Quote setup › Terms: a template set default → the builder's Client view, the public page, the PDF and the emailed PDF show it; a tenant with no template still sees the built-in eight.
   - B-002 Settings › Business: change the phone, Save, reload → the logo and signature are still there.
   - B-003 / B-051 / B-052 Quote setup › Pricing 12 % and crew cost $62 → the job page's Job money says 12 % and its sub-line names Quote setup › Pricing; a crew member with no pay rate costs at $62 "(est.)" in Job money, the Labour card and Business performance.
   - B-025 / B-037 a quote whose job address differs from the client's → Mark accepted (admin) → the new job's name is the job tag or street + suburb and its site card and pin are the job address. A quote with no job address falls back to the client's address as before. The client's own accept and the manual conversion are unchanged.
   - B-035 Edit location → new address → Save → the card shows it and Directions opens it; Re-sync still works.
   - B-033 job › Details › Notes opens (no blank page); type, Save → the builder's Quote details shows the same text; Visible to crew saves (`crew_visible` through the PATCH).
   - B-042 accepted quote + sent deposit invoice → change a rate in the builder → the save is refused with the 409 message naming the invoice; a notes-only save goes through; the connector's `update_quote` behaves the same.
   - B-044 accepted quote with a job → Mark as draft → 409; a sent quote with only a draft invoice → archive works; one with a sent invoice → refused.
   - B-058 Equipment hire → pencil → change the cost → Save changes → the row and the Actual-to-date total update.
   - B-029 / B-047 / B-055 / B-012 / B-039 a started job with nothing invoiced → Job money: Profit so far reads "Nothing invoiced yet", the chip says "quoted", the jobs list card says "est X%" and its invoice line "Deposit invoice drafted · not sent" (never "paid in full"); send the deposit → Invoiced so far = the deposit, "Overhead on what's invoiced" = pct × deposit, Profit so far = deposit − cost to date, the list chip "X% margin so far"; the connector's `get_job` `actual_margin_pct` equals the page; a negative Expected profit prints "-$595.19" in red.
   - B-005 record a payment this month → Business performance income for the month equals the payment.
   - B-038 Dashboard "on the books" = live jobs + accepted-not-started jobs.
4. Report `memory/reports/fix-round-j-report.md` (what merged, suite before/after, the agent's results, the commit hash). Then Part B.

## Part B — the rest of Josh's list (fix these; my read of each line and where to look)

**Quotes**
- B-006 the Quotes list shows the client's address, not the job address — rows print the job address (`jobAddressDetails`, built as `_site_address_of` does) and fall back to the client's; `LIST_EXCLUDE` must keep `jobAddressDetails`.
- B-007 "edited 11h ago" is off by the time-zone gap — the server stamps naive UTC (`_utcnow()` strips tzinfo) and `parseDate` treats a naive string as UTC, so find the stamp on the estimates list that is parsed another way (`ago()` in `estimates.tsx:46` on `updatedAt` / the last event) and send every stamp through `parseDate`.
- B-017 duplicate EST-0006 and a missing EST-0012 — the numbering (`last_used_estimate_seq` / `estimate_seq_floor` / the create path) can hand out a used number under two quick creates or after a delete; make the next number one atomic counter write. **No renumbering of existing quotes.**
- B-022 "0.0 labour hours · about 0.5 days" when the hours are 0 — the Quote total sub-line (`QuoteDetails.tsx:26`): hide the hours and days when the hours are 0.
- B-061 the paint list stays empty with a misleading message when products have no coverage figure — say which product has no coverage and link to it in the Library.
- B-060 quote lines keep old Library rates after the item is priced — **ask Josh before building**: a line snapshots `library.rates` when it is added; the options are a "Refresh rates from Library" action on a draft quote, or re-reading the rates when a draft opens. Don't pick for him.
- B-023 exterior quotes can't add interior items — **ask Josh**: the Library picker filters by the quote's type; he may want "show all" with the quote's type first.

**Library**
- B-019 "Add an item" always opens Windows and there is no category picker — around `library/items.tsx:129`: a category select in the new-item form, defaulting to the current filter.
- B-020 / B-021 the item form wipes what you type while it is loading, and React error #310 — #310 is a hook-order change (a hook after a conditional return) in the item form; fix the order and the wipe goes with it.
- B-024 the "1 coat rate set" label reads wrong — count the coat rates that are set and word it "2 of 3 coat rates set".

**Invoices**
- B-016 the Archived filter shows 0 although INV-0004 is archived — `invoices.tsx:89` loads `/invoices?status=archived`; check the API filter and the tab count against each other.
- B-026 the invoice editor has no Mark as / Record payment — **hold; the design comes from Josh's chat (prototype first).**
- B-030 the deposit invoice line is labelled "Progress payment" — `invoice_lines.py:352`: "Deposit · N% of quote …" when the milestone is the deposit.
- B-031 a long email address runs over the next card — wrap or ellipsis on the invoice page's client card.
- B-032 the deposit invoice isn't linked to the job — in `update_estimate_status` the deposit draft is written before the job spawns; set `project_id` on it once the job exists (and in the client accept path). Forward-only; no backfill.
- B-043 a paid invoice moved back to draft keeps its payment and won't recalculate — `patch_invoice_status`: refuse draft while payments exist (409: record a refund or credit it first); the same rule for the connector.

**Jobs**
- B-018 the target finish can be set before the start date — validate in `PUT /projects/{id}` (400) and in the date strip.
- B-027 internal quote notes show as "Site access" on the job card — `JobSiteCard` prints `p.notes` (the quote's internal notes) under "Site access"; label it "Quote notes (internal)". The crew never receives `notes` (only `crew_notes`) — confirm in the crew read and leave `app/employee/*` alone.
- B-028 the timeline says "from the client" for manual accepts, with wrong times and order — the Activity feed's accept line says who accepted (the client, or the admin by hand) and the feed sorts by stamp.
- B-034 the completion report promises a 2-year warranty — `project_photos.py` warranty section defaults: the wording must come from Settings › Documents / the business's own terms; no fixed number of years.
- B-036 "Text client" texts a landline — use the mobile number only (the customer's `phone` vs `landline`); hide the button when there is no mobile.
- B-040 the job page is squashed at tablet width — **hold for a 1024 pass from Josh's chat** unless it is a one-line overflow fix.
- B-045 starting a job sets a target finish on its own — `projects.py:1088`: drop the +5 days guess; the target stays empty until set (the quote's duration already fills it when the job is spawned).
- B-046 a past start date doesn't start the job — **ask Josh**: start the job when the date passes, or nudge?
- B-053 deleting an expense has no confirmation — `window.confirm`, as the job delete has.

**Timesheets**
- B-004 Dashboard crew hours 53.2 vs Timesheets 32.92 — `dashboard_home.py:301-307` `hours_between(closed, open_)`: find the difference against the Timesheets page's week total (open sessions or the admin bridge counted, most likely) and make both read one function.
- B-048 daily reports can't be backdated and there are no per-person hours — **feature; ask Josh.**
- B-049 the change log doesn't show job changes, and saving re-rounds the hours — log the job change as an entry; save the typed hours without re-rounding.
- B-050 sessions from a deleted job show the old address but count on no job — show "(deleted job)" and keep the hours on the person's total.

**Settings**
- B-015 the quote PDF text points to "Settings › Invoicing" — `QsPdfTab.tsx:13` and `pdfSections.ts:24`: name the real place (Settings › Quote setup › the invoicing tab).
- B-056 supplier fields are capped at 80 characters with no warning — `suppliers.py:24-27`: raise the cap to 160 and show the limit in the form.

**Connector** (`services/connector_tools.py`)
- B-008 lines land in "Site & setup" unless linked to their zone — `update_quote` accepts an `area` name on a line and resolves or creates the area, so Claude doesn't need ids.
- B-009 the time-clock read returns nothing — `t_get_timeclock_entries` (line 218): check the scope and filters against real rows.
- B-010 can't read or price Library items — add `list_library_items` (read) and let an `update_quote` line reference a library item id so the rate comes from the Library.
- B-011 can't set the payment plan — add `payment_plan` to `update_quote`'s schema (the PUT already passes it through).
- B-059 the saved total leaves out auto-measured lines — a `qty_auto` line needs its area's W·L·H or sqm; when the connector sends lines without the areas the quantity is 0: either require the area or compute from the stored areas.

**Other**
- B-013 training video collections are listed twice — `training-videos.tsx:38`: one source, de-duplicated.
- B-014 the crew login path (/crew vs /employee/login) — **not this round** (crew files belong to the crew chat); note it in the report.
- B-041, B-054, B-057 — features, parked; not this round.

## Rules

TS_ rows only, torn down after; Josh's own tenant read-only; no backfill; nothing beyond this list and nothing from your own suggestion list; no notices or banners; AI = Claude only, through the app's own key; nothing under `app/employee/*`; no secrets in any reply (never print a key, an admin id or MONGO_URL); one commit per bug where you can; report `memory/reports/fix-round-j-report.md` with the commit hash; What's new as a **draft** only (never publish): "Fix round: Business save keeps your logo · job money follows Quote setup › Pricing and shows what's invoiced · jobs take the quote's job address · Details › Notes fixed · accepted quotes locked once invoiced · equipment hire rows editable · and the smaller fixes from Josh's list." Save to GitHub and Publish are Josh's clicks. For the **ask Josh** items, write the question in the report and don't build.

# Fix Round J — Josh's bug list B-001 to B-061 (12 Nov list; work from 11 Nov) — code written in this chat on the app repo's branch `claude/fix-round-j`

Emergent is out of credit, so the fixes are written here, one commit per bug, on **`claude/fix-round-j`** (which starts from `claude/quote-terms`, so B-001 is on it). What this chat can do: read the code, change it, compile it, run the pure unit tests, type-check the frontend. What it cannot do: run the app, the Mongo-backed suite or the testing agent, or publish — so **"fixed" below means the code is changed and reasoned through, with a unit test where the logic is pure**; the live confirmation is Josh's after Emergent merges the branch, runs the suite and publishes. The one-line summaries come from Josh's PDF; the batch docs with the detail were not uploaded, so each entry says how the line was read.

Order: Josh's *Fix first* (B-001, B-002, B-003, B-025, B-033, B-035, B-042, B-044, B-051, B-058), then by area.

**11 Nov, evening — the ten *Fix first* items are all on the branch** (plus B-037 and B-052, which fell out of the same root causes). Branch `claude/fix-round-j` is pushed: `f9d37af` (B-001) → `6f89dce` → `7c1896c` → `7d5ee79` → `bf81dc8` → `c5042ab` → `15981d2` → `4ddd7af`. Checked here: every touched backend file compiles; the pure tests run green (27: 8 quote terms + 5 pricing source + 14 quote guard); `tsc --noEmit` on the frontend shows only the one error that was already on `main` (`CoverageBar.tsx:86`). Not checked here: the Mongo-backed suite, the testing agent, the screens in a browser — that is Emergent's merge step (§ below) and then Josh's Publish.

### What each fix does and how Josh confirms it (after merge + publish)

- **B-002** — `PUT /admin/profile/business` replaced the whole `business_profile` section with the Business page's own fields, so every save dropped `logo_url`, `signature_url` and their upload stamps. It now merges onto the stored section (null clears, missing keeps). *Confirm:* Settings › Business → change the phone → Save → the logo and signature are still there after a reload; the quote PDF still carries the logo.
- **B-003 / B-051 / B-052** — the job money read `admin_settings.pricing`, which no screen writes; Quote setup › Pricing saves `estimate_defaults.overhead_pct` / `labor_hourly_rate`. New `services/job_pricing.py` resolves Quote setup → legacy section → 3 % / $75; crew with no pay rate are costed at Quote setup's *Average crew cost* (still flagged "est.") instead of $55 in the job money, the Labour card and Business performance. *Confirm:* Quote setup › Pricing says 12 % → open a job → the Job money card's Overhead line says 12 % and the sub-line names Quote setup › Pricing; a crew member with no rate shows the Quote setup rate with "(est.)".
- **B-025 / B-037** — the admin's *Mark accepted* still ran an old copy of the job-creation code (`estimates.py`) that took `clientAddress` as the job site and named the job after the client; the client's own accept and the manual conversion had moved to the shared spawner in Fix Round I. All three share it now (job address; name = job tag → street + suburb → "Estimate EST-xxxx"; quote start date and duration; Quote setup pricing; paint rows). *Confirm:* quote with a job address different from the client's → Mark accepted → the new job's site card, map pin and name are the job address. Old jobs are untouched (no backfill — the card's "Re-sync from the estimate" fixes one on demand).
- **B-035** — the site card displayed `client_snapshot.address` and sent Directions and the Edit location form there, so a saved location never showed. The card, Directions, the map label and the form now use `location_address` first; Directions falls back to the pin and says so when there is neither; the AI brief's `site_address` follows the same rule. *Confirm:* Edit location → new address → Save → the card shows it and Directions opens it.
- **B-033** — the quote stores crew notes as **one text** (`crew_notes` + `crew_visible`, what the builder's Quote details edits); the job drawer treated it as a list and called `.map` on the string → blank page. The Notes tab is now a text box + *Visible to crew* + *Save notes*, writing the same two fields; `PATCH /estimates/{id}` accepts `crew_visible` (the builder sent it and the server dropped it). *Confirm:* job → Details → Notes opens; type → Save → the builder's Quote details shows the same text; tick Visible to crew → the crew app shows it on the job.
- **B-042** — new `services/quote_guard.py`. A PUT on an **accepted** quote that has a **raised** invoice (sent or paid — a draft never locks) and changes the *money signature* (per-line qty × rate, optional flags, discount, GST mode, payment-plan percentages, paint settings) is refused with a 409 that names the invoice and says to price the change as a variation on the job. Notes, photos, dates, terms, labels, client details still save. The connector's `update_quote` goes through the same PUT. **Rule note:** Josh's line said "after the deposit is paid"; the branch locks from the moment an invoice is *raised* (sent counts), because a sent invoice already bills percentages of the quote. If Josh wants paid-only, it is one condition in `money_change_block`. *Confirm:* accepted quote with a sent deposit invoice → change a rate in the builder → the save is refused with the message; change the notes → saves.
- **B-044** — same module: an accepted quote with a job or a raised invoice can't be moved to draft/sent/viewed/declined/on hold (409 names the job or invoice and what to do first); no quote with a job or a raised invoice can be archived; accepted quotes still can't be archived at all. Wired into `PATCH /estimates/{id}/status`, which the connector's `set_quote_status` calls. *Confirm:* accepted quote with a job → Mark as draft → refused; a sent quote with a draft invoice only → archive works.
- **B-058** — each equipment hire row has an edit button that opens the existing form prefilled; *Save changes* calls the `PATCH …/equipment/{item_id}` route that already existed. *Confirm:* job → Equipment hire → pencil → change the cost → Save changes → the row and the Actual-to-date total update.

### For Emergent, when there is credit (Josh's "send")

1. `git fetch origin && git merge origin/claude/fix-round-j` (eight commits on top of `main` `5e16d97`, includes Round 99's `claude/quote-terms`). Merge, never rewrite.
2. Suite before and after; the new pure files run without the harness: `tests/test_r99_quote_terms.py`, `tests/test_fixj_pricing_source.py`, `tests/test_fixj_quote_guard.py`.
3. Testing agent on the preview, TS_ tenant, the *Confirm* steps above at 1440 and 1024 — plus the two regressions worth a look: the builder's autosave on an accepted + invoiced quote (a notes-only save must still go through; a rate change must show the 409 message, not a silent failure), and Mark accepted on a quote with no job address (falls back to the client's address, as before).
4. Report `memory/reports/fix-round-j-report.md`, commit hash; Save to GitHub and **Publish** are Josh's clicks. What's new **draft** (never publish): "Fix round: Business save keeps your logo · job money follows Quote setup › Pricing · jobs take the quote's job address · Details › Notes fixed · accepted quotes locked once invoiced · equipment hire rows editable."

| ID | Area | Severity | The line | Status |
|---|---|---|---|---|
| B-001 | Quotes | High | Client view shows generic terms instead of the T&C template | **FIXED** on the branch (`f9d37af`, Round 99 — `services/quote_terms.py`, the three profile builders, 8 unit tests) |
| B-002 | Settings | High | Saving Settings › Business wipes the logo | **FIXED** `6f89dce` — the save merges onto the stored section |
| B-003 | Jobs | High | Job money uses $75/h and 3% overhead, not Quote setup | **FIXED** `7c1896c` — `services/job_pricing.py`, 5 tests |
| B-025 | Jobs | High | New job uses the client's billing address as the job site | **FIXED** `7d5ee79` — Mark accepted uses the shared spawner |
| B-033 | Jobs | High | Details › Notes tab crashes the page to a blank screen | **FIXED** `c5042ab` — one-text crew notes + `crew_visible` on PATCH |
| B-035 | Jobs | High | Directions and Edit location still use the client's address | **FIXED** `bf81dc8` — `location_address` first, AI brief too |
| B-042 | Connector | Medium–high | Can change an accepted quote after the deposit is paid | **FIXED** `15981d2` — `services/quote_guard.py` money lock (from *raised*, see note), 14 tests |
| B-044 | Connector | Medium–high | Accepted → draft → archived works, leaving the job and paid invoice behind | **FIXED** `15981d2` — status guard on job / raised invoice |
| B-051 | Jobs | Medium–high | Job money ignores the 12% overhead in Quote setup | **FIXED** `7c1896c` — same root as B-003 |
| B-058 | Jobs | Medium–high | Equipment hire items can't be edited after they're added | **FIXED** `4ddd7af` — edit button → existing form → PATCH |
| B-006 | Quotes | Medium | Quotes list shows the client's address, not the job address | open |
| B-007 | Quotes | Medium | "Edited 11h ago" times are off by the time-zone gap | open |
| B-017 | Quotes | Low | Duplicate quote number EST-0006; EST-0012 missing | open |
| B-022 | Quotes | Low | "0.0 labour hours · about 0.5 days" when hours are 0 | open |
| B-023 | Quotes | Medium | Exterior quotes can't add interior items (ceilings, skirting etc.) | open |
| B-060 | Quotes | Medium | Quote lines keep old Library rates after the item is priced | open |
| B-061 | Quotes | Low | Paint list stays empty, with a misleading message, when products have no coverage figure | open |
| B-019 | Library | Medium | "Add an item" always opens Windows; no category picker | open |
| B-020 | Library | Medium | Item form wipes what you type if it's still loading | open |
| B-021 | Library | Medium | React error #310 in the console (may cause B-020) | open |
| B-024 | Library | Low | "1 coat rate set" label reads wrong | open |
| B-016 | Invoices | Low | Archived filter shows 0, but INV-0004 is archived | open |
| B-026 | Invoices | Low–medium | Invoice editor has no "Mark as" or Record payment; only the list side panel does | open |
| B-030 | Invoices | Low | Deposit invoice line is labelled "Progress payment" | open |
| B-031 | Invoices | Low | Long email address runs over the next card | open |
| B-032 | Invoices | Low | Deposit invoice isn't linked to the job in the data | open |
| B-043 | Invoices | Medium | Paid invoice moved back to draft keeps its payment and won't recalculate | open |
| B-005 | Jobs | Medium | Business performance shows $0 income despite paid invoices | open |
| B-012 | Jobs | Low | Cards say "paid in full" when nothing is invoiced | open |
| B-018 | Jobs | Low | Target finish can be set before the start date | open |
| B-027 | Jobs | Medium | Internal quote notes show as "Site access" (crew may see them) | open |
| B-028 | Jobs | Medium | Timeline says "from the client" for manual accepts; wrong times and order | open |
| B-029 | Jobs | Medium | Job money counts the whole quote as revenue already earned | open |
| B-034 | Jobs | Medium | Completion report promises a 2-year warranty | open |
| B-036 | Jobs | Low–medium | "Text client" texts a landline | open |
| B-037 | Jobs | Low | New job is named after the client, so the name shows twice | **FIXED** `7d5ee79` — same root as B-025 (name = job tag → street + suburb → Estimate number) |
| B-038 | Jobs | Medium | "On the books" leaves out accepted jobs that haven't started | open |
| B-039 | Jobs | Low | Negative profit shows as "$-595.19" in green | open |
| B-040 | Jobs | Low–medium | Job page squashed at tablet width | open |
| B-045 | Jobs | Medium | Starting a job sets a target finish date on its own | open |
| B-046 | Jobs | Low | A past start date doesn't start the job | open |
| B-047 | Jobs | Low–medium | Actual cost includes the full overhead from day one | open |
| B-052 | Jobs | Low–medium | Crew with no hourly rate are costed at a guessed $55/h | **FIXED** `7c1896c` — Quote setup's average crew cost, still flagged "est." |
| B-053 | Jobs | Low | Deleting an expense has no confirmation | open |
| B-055 | Jobs | Medium | Job profit on the page disagrees with the data | open |
| B-004 | Timesheets | Medium | Dashboard crew hours (53.2) don't match Timesheets (32.92) | open |
| B-048 | Timesheets | Medium | Daily reports can't be backdated; no per-person hours | open |
| B-049 | Timesheets | Low | Timesheet change log doesn't show job changes; saving re-rounds hours | open |
| B-050 | Timesheets | Medium | Sessions from a deleted job show the old address but count on no job | open |
| B-015 | Settings | Low | Quote PDF points to "Settings › Invoicing", which doesn't exist | open |
| B-056 | Settings | Low | Supplier fields capped at 80 characters with no warning | open |
| B-008 | Connector | Medium | Lines land in "Site & setup" unless linked to their zone | open |
| B-009 | Connector | Medium | Time-clock read returns nothing | open |
| B-010 | Connector | Low | Can't read or price Library items | open |
| B-011 | Connector | Low | Can't set the payment plan | open |
| B-059 | Connector | Medium | Saved total leaves out auto-measured lines | open |
| B-013 | Other | Low | Training video collections listed twice | open |
| B-014 | Other | Low | Crew login path differs (/crew vs /employee/login) | open |
| B-041 | Feature | — | Materials expense category with receipt photos; quoted access across to the job; Variations picker like the quote picker | parked (feature) |
| B-054 | Feature | — | Quoted access hire flows into the job's Equipment hire automatically | parked (feature) |
| B-057 | Feature | — | Import supplier price lists (CSV/XLSX) in Settings › Suppliers | parked (feature) |

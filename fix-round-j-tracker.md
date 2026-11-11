# Fix Round J — Josh's bug list B-001 to B-061 (12 Nov list; work from 11 Nov) — code written in this chat on the app repo's branch `claude/fix-round-j`

Emergent is out of credit, so the fixes are written here, one commit per bug, on **`claude/fix-round-j`** (which starts from `claude/quote-terms`, so B-001 is on it). What this chat can do: read the code, change it, compile it, run the pure unit tests, type-check the frontend. What it cannot do: run the app, the Mongo-backed suite or the testing agent, or publish — so **"fixed" below means the code is changed and reasoned through, with a unit test where the logic is pure**; the live confirmation is Josh's after Emergent merges the branch, runs the suite and publishes. The one-line summaries come from Josh's PDF; the batch docs with the detail were not uploaded, so each entry says how the line was read.

Order: Josh's *Fix first* (B-001, B-002, B-003, B-025, B-033, B-035, B-042, B-044, B-051, B-058), then by area.

| ID | Area | Severity | The line | Status |
|---|---|---|---|---|
| B-001 | Quotes | High | Client view shows generic terms instead of the T&C template | **FIXED** on the branch (`f9d37af`, Round 99 — `services/quote_terms.py`, the three profile builders, 8 unit tests) |
| B-002 | Settings | High | Saving Settings › Business wipes the logo | open |
| B-003 | Jobs | High | Job money uses $75/h and 3% overhead, not Quote setup | open |
| B-025 | Jobs | High | New job uses the client's billing address as the job site | open |
| B-033 | Jobs | High | Details › Notes tab crashes the page to a blank screen | open |
| B-035 | Jobs | High | Directions and Edit location still use the client's address | open |
| B-042 | Connector | Medium–high | Can change an accepted quote after the deposit is paid | open |
| B-044 | Connector | Medium–high | Accepted → draft → archived works, leaving the job and paid invoice behind | open |
| B-051 | Jobs | Medium–high | Job money ignores the 12% overhead in Quote setup | open |
| B-058 | Jobs | Medium–high | Equipment hire items can't be edited after they're added | open |
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
| B-037 | Jobs | Low | New job is named after the client, so the name shows twice | open |
| B-038 | Jobs | Medium | "On the books" leaves out accepted jobs that haven't started | open |
| B-039 | Jobs | Low | Negative profit shows as "$-595.19" in green | open |
| B-040 | Jobs | Low–medium | Job page squashed at tablet width | open |
| B-045 | Jobs | Medium | Starting a job sets a target finish date on its own | open |
| B-046 | Jobs | Low | A past start date doesn't start the job | open |
| B-047 | Jobs | Low–medium | Actual cost includes the full overhead from day one | open |
| B-052 | Jobs | Low–medium | Crew with no hourly rate are costed at a guessed $55/h | open |
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

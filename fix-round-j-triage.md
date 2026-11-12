# Fix Round J — triage of the 61 lines from Josh's painting-business Claude (12 Nov)

Josh's own Claude account for the painting business works in the published app through the connector (quotes, jobs, invoices — real painting work, not code) and wrote up what it hit: 58 bugs and 3 feature requests, B-001 to B-061 (`PTHQ_bug_list___ALL_B-001_to_B-061`, summary lines only; the batch docs with the detail were not uploaded). Josh, 12 Nov: *"go through them and if you think they are legitimate and correct we can implement them and add them into the parking lot."* Verdicts below are from reading the code on the app repo's `main`/`claude/fix-round-j`, not from running the app — where a line could only be confirmed on screen it says *plausible*.

**Verdicts:** FIXED = on `claude/fix-round-j` or built by Emergent · FIX = a real bug, clear fix, in the Emergent brief (`fix-round-j-emergent-brief.md` Part B) · PARK = legitimate ask, but a design or a feature, so it goes to the parking lot in `admin-remaining.md` and waits for Josh's word · NOT A BUG = works as designed or a data matter, with the reason.

| ID | Line | Verdict | Why |
|---|---|---|---|
| B-001 | Generic terms instead of the T&C template | FIXED | Round 99 on the branch; Emergent also built its own copy on `main` (one of the two is kept at the merge) |
| B-002 | Business save wipes the logo | FIXED | `6f89dce` |
| B-003 / B-051 | Job money uses 3 % / $75 not Quote setup | FIXED | `7c1896c` |
| B-004 | Dashboard crew hours 53.2 vs Timesheets 32.92 | FIX | real: the dashboard's `hours_between` sums every closed session in the week plus open sessions' elapsed time; the Timesheets page applies its own window and rounding — two formulas, one must go (`dashboard_home.py:301-307`, `timeclock_stats.py:31`) |
| B-005 | Business performance $0 income | FIXED | `79fffc2` |
| B-006 | Quotes list shows the client's address | FIX | real: `estimates.tsx:195/258` print `clientAddress`; the job address is in `jobAddressDetails` and the list route already sends it |
| B-007 | "edited 11h ago" off by the time zone | FIX | real: `ListKit.ago()` does `new Date(iso)` on a naive UTC stamp, which a browser reads as local time; `parseDate` already treats naive as UTC — route `ago()` through it |
| B-008 | Connector lines land in "Site & setup" | FIX | real: the connector's `update_quote` has no area-by-name resolution, so a line without an `area_id` is swept into Site & setup on read |
| B-009 | Connector time-clock read returns nothing | FIX | real, likely cause: `t_get_timeclock_entries` filters on the tenant scope field, while timeclock rows are found elsewhere by `project_id`/`employee_id` (the job money never filters them by owner) — older rows may not carry the scope key |
| B-010 | Connector can't read or price Library items | FIX (small) | `get_library_tasks` and `get_materials` exist; the priced Library *items* (variants with coat rates) have no read tool and a line can't name one |
| B-011 | Connector can't set the payment plan | FIX | real: `payment_plan` is missing from `update_quote`'s schema; the PUT already takes it |
| B-012 | "paid in full" with nothing invoiced | FIXED | `2cdc57e` |
| B-013 | Training collections listed twice | FIX (low) | plausible: the page loads `/training-collections` once, so the duplicates come from the API or the data — check which |
| B-014 | Crew login path /crew vs /employee/login | NOT A BUG | `/crew` is the crew door by design (Round C2); `/employee/login` is the same app's route and both work. Crew files belong to the crew chat anyway |
| B-015 | PDF text says "Settings › Invoicing" | FIX | real: `QsPdfTab.tsx:13`, `pdfSections.ts:24` |
| B-016 | Archived filter shows 0 but INV-0004 is archived | FIX (low) | the API supports `?status=archived`; the page loads that list lazily, so the count reads 0 until it has — check the count and the load order |
| B-017 | Duplicate EST-0006, missing EST-0012 | FIX | real: `_next_estimate_number` reads the highest number and adds one — two quick creates or a delete can reuse a number; make it one atomic counter write. No renumbering of existing quotes |
| B-018 | Target finish before the start date | FIX | real: no date check in `PUT /projects/{id}` |
| B-019 | "Add an item" opens Windows, no category picker | FIX (small UI) | plausible from `library/items.tsx` (the category comes from the filter param, defaults when "All") |
| B-020 / B-021 | Item form wipes typing; React #310 | FIX | React #310 = a hook order change; plausible, find the hook after a conditional return in the item form |
| B-022 | "0.0 labour hours · about 0.5 days" | FIX | real: `QuoteDetails.tsx:26` always prints the line |
| B-023 | Exterior quotes can't add interior items | PARK | legitimate (verandah ceilings, eaves, a door inside an exterior job) but it is a design choice: the Library picker filters by the quote's type; proposal "the quote's type first, then everything" needs Josh's word |
| B-024 | "1 coat rate set" label | FIX (low) | real: the item card's tag at `library/items.tsx:149` (`${coatN} coat rate…`); word it "N of 3 coat rates set" |
| B-025 / B-037 | New job takes the client's address and name | FIXED | `7d5ee79` |
| B-026 | Invoice editor has no Mark as / Record payment | PARK | half right: Record payment exists in the editor once the invoice is sent (`InvoiceBuilder.tsx:177`); *Mark as* is only in the list panel. Adding it to the editor is a design item — prototype first |
| B-027 | Internal quote notes shown as "Site access" | FIX | real: `JobSiteCard` prints `p.notes` (the quote's internal notes) under "Site access"; the crew never receives `notes`, only `crew_notes` — relabel, nothing leaks |
| B-028 | Timeline says "from the client" for manual accepts | FIX | plausible: `CommsTimeline` prints "from the client" when the row's `by` is `client`; the manual accept must stamp who did it |
| B-029 / B-047 / B-055 | Job money revenue, overhead, page vs data | FIXED | `2cdc57e` |
| B-030 | Deposit line labelled "Progress payment" | FIX | real: `invoice_lines.py:352` uses the one label for every milestone |
| B-031 | Long email runs over the next card | FIX (css) | plausible; a wrap/ellipsis |
| B-032 | Deposit invoice not linked to the job | FIX | real: the deposit draft is written before the job spawns (`update_estimate_status`); set `project_id` after. Forward-only, no backfill |
| B-033 | Notes tab blanks the page | FIXED | `c5042ab` |
| B-034 | Completion report promises a 2-year warranty | FIX | real: `project_photos.py:28 DEFAULT_WARRANTY` hard-codes "2-year warranty" (editable in Settings › Documents, but the default must not promise years) |
| B-035 | Directions / Edit location use the client's address | FIXED | `bf81dc8` |
| B-036 | "Text client" texts a landline | PARK (small) | not a code bug: a customer has one `phone` field, so whatever was typed is what gets texted. The ask is a mobile/landline split on the customer record (the business profile already has it) |
| B-038 | "On the books" leaves out accepted-not-started | FIXED | `22ab1c4` |
| B-039 | "$-595.19" in green | FIXED | `2cdc57e` |
| B-040 | Job page squashed at tablet width | PARK | legitimate; a 1024 layout pass with a prototype from this chat, not a one-line fix |
| B-041 | Materials expense category with receipt photos; quoted access to the job; Variations picker like the quote picker | PARK | three feature asks, all sensible |
| B-042 / B-044 | Accepted quote money / status guards | FIXED | `15981d2` (locks from a *sent* invoice; Josh to confirm paid-only or not) |
| B-043 | Paid invoice back to draft keeps its payment | FIX | real: `patch_invoice_status` refuses *archiving* with payments (409) but not *draft*; the same rule belongs there |
| B-045 | Starting a job sets a target finish by itself | FIX | real: `projects.py:1088` adds 5 days when none is set |
| B-046 | A past start date doesn't start the job | FIXED (Emergent) | Josh's pick: a nudge + Start job button, auto-start off (Emergent `7cc25b5`) |
| B-048 | Daily reports can't be backdated; no per-person hours | PARK | a feature (backdating needs rules on who may, and the per-person view is new UI) |
| B-049 | Change log misses job changes; save re-rounds hours | FIX | plausible; both are small in the timesheets save path |
| B-050 | Sessions from a deleted job: old address, counted on no job | FIX | plausible; show "(deleted job)" and keep the hours on the person |
| B-052 | $55 guess for crew with no rate | FIXED | `7c1896c` |
| B-053 | Deleting an expense has no confirmation | FIX | real: `[id].tsx` expense delete calls the API straight away |
| B-054 | Quoted access hire → job's Equipment hire automatically | PARK | feature, sensible (pairs with B-041's second ask) |
| B-056 | Supplier fields capped at 80 with no warning | FIX | real: `suppliers.py:24-27 max_length=80` |
| B-057 | Import supplier price lists (CSV/XLSX) | PARK | feature |
| B-058 | Equipment hire rows can't be edited | FIXED | `4ddd7af` |
| B-059 | Saved total leaves out auto-measured lines | FIX | real: `update_estimate` runs `apply_totals` on the fields *sent*, so lines sent without their areas measure as 0 — compute on the merged document |
| B-060 | Lines keep old Library rates | FIXED (Emergent) | Josh's pick: "Refresh rates from Library" on a draft (Emergent `7cc25b5`) |
| B-061 | Paint list empty with a misleading message | FIX | real in substance: `services/paint.py` needs a product coverage figure; the message should name the product |

**Count:** 23 fixed (20 on the branch + B-001 again, B-046, B-060 at Emergent) · 29 FIX, all in Emergent's Part B · 8 PARK (B-023, B-026, B-036, B-040, B-041, B-048, B-054, B-057) · 1 NOT A BUG (B-014).

The eight PARK items are now in `admin-remaining.md` under the parking lot, each with its one-line reading; any of them starts on Josh's word, with a prototype first where it is a screen.

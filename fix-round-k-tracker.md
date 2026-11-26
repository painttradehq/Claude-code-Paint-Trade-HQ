# Fix Round K — the bug log to 26 November (96 entries)

Josh, 25 Nov: *"every problem that we come across has been logged. Here is the file of logged issues; let's go through them and fix them."* The file is `PTHQ bug log – all reports to 26 Nov 2026` (15 pages, 96 entries, logged 11–24 Nov by Josh's painting-business Claude through the connector and the browser).

**Where the work is:** app repo, branch `claude/fix-round-k` (pushed), 18 commits on top of GitHub `main` `0165cde` (the Save to GitHub of 15 Nov: Fix Round J parts A and B, Round 100, Round 101). One patch for Emergent: `emergent-uploads/pthq-fixes-26nov.patch` (56 files, +1316 −166; applies cleanly to `0165cde`, proven). **Sent to Emergent on 25 Nov** on Josh's word (`fix-round-k-emergent-message.md`; queued — Emergent's last work before it was Round 101 on 15 Nov, so the patch sits on its newest code). Josh uploads the patch, this tracker and the message file to the Emergent chat. Nothing is live until Emergent applies it, Josh clicks Save to GitHub, then Publish.

**How it was checked here:** no live app and no database in this chat. Each fix was read against the code, 98 pure tests pass (67 new in `tests/test_fixk_*.py`, the rest from Fix Round J), every changed Python file compiles, the screens type-check (only the old `CoverageBar.tsx:86` error). Nothing was viewed on a screen — that is Emergent's testing agent's job.

**The numbering clash in the log:** B-082 to B-088 were used twice. Below, the contracts ones are written **B-082c … B-089c**.

## Count

| | Entries |
|---|---|
| B-001 to B-061 — already fixed in the code on GitHub (15 Nov) | 52 |
| B-001 to B-061 — parked earlier (features / design) | 8 |
| B-001 to B-061 — not a bug (B-014) | 1 |
| B-062 onward — fixed in this round | 27 |
| B-062 onward — already fixed (B-071 in Round 101; B-073 retested fixed) | 2 |
| B-062 onward — parked (feature or design; Josh's word starts them) | 6 |
| **Total** | **96** |

The log says "as far as we know all the others are still open". For B-001 to B-061 that is because they were logged before the fixes and not retested; whether the 15 Nov code is published could not be checked from here (the live site is not reachable from this chat).

## B-062 onward

| ID | What it was | Verdict | What was done (commit) |
|---|---|---|---|
| B-062 | Settings › Crew app (and the quote builder) go blank when the window narrows | **Fixed** | A hook in the shared admin shell sat below its narrow-window return, so crossing 768 px changed the number of hooks and React blanked every admin page. Moved above the return (`0adc669`). *Still true:* a form's unsaved typing is lost when the window crosses 768 px, because the page swaps to its phone layout there — that goes with the tablet pass (B-063). |
| B-063 | On a tablet (~600 px) Settings shows only Account, Billing, Briefing, About | **Parked** | By design the full Settings is the desktop component from 768 px up; below that is the old phone list. Making every section work at tablet width is a layout job (with B-040, the job page at tablet width) — prototype first. |
| B-064 | Terms: every heading and paragraph a separate numbered "Note" | **Fixed** | New parser: a short heading line takes the paragraph(s) under it; "Title: text" on one line works as before; the editor says which formats it takes (`ed1dbad`). |
| B-065 | Zone notes vanish when the zone has no lines | **Fixed** | The client copy returns `note_zones`; the Client view, public page and PDF print the zone and its note in its place (`671a8a2`). |
| B-066 | Reference / work order number on the quote | **Parked** | A new field on the quote, Client view, PDF and invoices (the invoice already has "Reference / PO"). Feature. |
| B-067 | Invoice "Job" box shows the scope; scope missing from the charges | **Fixed** | Josh's layout: Job box = job type + address; the scope sits under the quote's charge (stage and balance invoices). Screen, public page and PDF (`ffdb607`). |
| B-068 | Zone notes lose their line breaks | **Fixed** | `white-space: pre-line` for zone and line notes in the builder, Client view and PDF (`671a8a2`). |
| B-069 | Connector `update_quote` drops a zone note | **Fixed** | `note` accepted on a zone or line (stored as `notes`), `mins` on a custom line (stored as hours); the schema names the keys; anything it can't place comes back under `extra.warnings` (`671a8a2`). |
| B-070 | Duplicate estimate makes an empty draft | **Fixed** | The cause was the Round 101 §1 bug (already fixed on GitHub). Hardened: a copy that can't be filled is removed and the reason shown (`dd124a8`). |
| B-071 | After a resend every builder save fails (422) | Already fixed | Round 101 §1, on GitHub since 15 Nov. EST-0034's stored value needs no repair — the list form is now accepted. |
| B-072 | Library tasks show as "repair ·" on the client copy | **Fixed** | Surface prep tasks (masking, protection, site clean) read "prep" / tag "Prep"; repair groups keep "repair" (`671a8a2`). The read-only unit on a task line is left as it is. |
| B-073 | "Write the template" on Contracts did nothing | Already fixed | Retested fixed 19 Nov per the log. |
| B-074 | Quote back to draft keeps its acceptance and leaves the deposit invoice behind | **Fixed** | Leaving Accepted drops `accepted_at`, the signature fields and the frozen payment schedule, and archives the quote's unsent, unpaid draft invoices; deleting a job unlinks its invoices (`fe917b2`). |
| B-075 | "Fix this session" can't change only the job on open or 0-hour sessions | **Fixed** | Times are checked and sent only when one was changed, on the form and the server (`f76b6de`). |
| B-076 | Default quote email: "Hi Owners", visit line always added | **Fixed** | A person is greeted by first name, a company by its quote contact's first name, else "Hi there". The opener is now "Thanks for the opportunity to quote." — the quote has no record of a site visit to decide by (`ba3fab7`). |
| B-077 | Deleting a job uses the browser's confirm box | **Fixed** | The app's own confirm, saying what goes and what stays (`36aa03e`). |
| B-078 | Admin can't message the crew | **Parked** | A feature across the admin side and the crew app (messages, push, job timeline). Crew app work belongs to the crew chat. |
| B-079 | Invoice email and due date: greeting, typed due date ignored, no short terms | **Fixed** | A typed due date sets the terms to that many days ("3 days"), so the card, email, footer and PDF agree; greeting as B-076 (`ba3fab7`). |
| B-080 | Deposit invoice stays linked to the deleted job after a second acceptance | **Fixed** | When a job is made from a quote, the quote's invoices linked to no job or to a deleted one join the new job (`fe917b2`). |
| B-081 | A payment can't be recorded on a draft invoice | **Parked** | Same design item as B-026 (Mark as / Record payment in the invoice editor). |
| B-082c | Template preview says "Every field resolves." when a field came out blank | **Fixed** | The preview says which casual fields are empty because the sample employee is full-time (`db19c10`). |
| B-083c | Money fields fill in as bare numbers | **Fixed** | "Insert a field" says what each money / loading field turns into; filling stays a bare number so wording written as `$[HOURLY RATE]` is not doubled (`db19c10`). |
| B-084c | Connector can read contract templates but not write them | **Fixed** | `save_contract_template(type, content, name?)` — the editor's "Save as vN" (`5961bc1`). |
| B-085c | Tick boxes in a template can't be ticked | **Parked** | Feature: a checkbox in the crew's signing view and a record of the choices (crew app). |
| B-086c | Template editor box very narrow on a small window | **Fixed** | Below 1000 px the editor sits under the list at full width (`db19c10`). |
| B-087c | Notice period required for a casual | **Fixed** | Required only when the Employment agreement uses `[NOTICE PERIOD]` — wizard and server (`db19c10`). |
| B-088c | `[CASUAL LOADING]` fills as a phrase and clashes with the wording | **Fixed** | The phrase stays (existing templates rely on it); two plain fields added: `[CASUAL LOADING PERCENT]` ("25%") and `[CASUAL HOURLY RATE]` (base + loading) (`db19c10`). |
| B-089c | No way to attach files when issuing documents | **Parked** | Feature (attachments per issue and per template, shown in the crew app). |
| B-082 | Job keeps its completed date after going back to In progress | **Fixed** | Cleared on any change to an unfinished status, with a "Reopened" line on the job (`4d452ef`). |
| B-083 | PDFs and photos go to a binned "Paint Trade HQ" folder in Drive | **Fixed** | Every Drive write asks whether the stored folder is live; a binned or deleted one is replaced by the live folder and stored again (`4a652a2`). Files already in the binned folder are not moved by the app — see "Josh, by hand". |
| B-084 | Quote PDF "About us" prints made-up claims | **Fixed** | No sample blurb or stats: nothing typed, no About us (`6888ab8`). With it: the stock fallback terms (2-year warranty, $20M) are gone for a business with no terms template (`ed1dbad`). |
| B-085 | A draft variation can't be edited or previewed | **Fixed (edit)** | Draft rows get an edit pencil that opens the form pre-filled; `PATCH /projects/{id}/variations/{vid}`; connector `update_variation` (`3052d90`). A separate Preview before Send was not built (a new screen). |
| B-086 | Library item priced by the hour shows "No price in the Library" | **Fixed** | The item's hourly rate is carried onto the line (builder, connector, Refresh rates); `list_library_items` returns `hourly_rate` (`b6ad538`). |
| B-087 | Approved variation lands on the invoice as if its price included GST | **Fixed** | A variation is stamped from the job's quote: GST on top → the price is ex-GST, the client sees "$320.00 + GST ($352.00 incl. GST)", the invoice line is $320 + GST. Older variations keep their old reading (`3052d90`). |
| B-088 | Variation description cut off mid-word on the invoice | **Fixed** | The whole description is copied (`3052d90`). |

## Choices made here that Josh can veto before it goes to Emergent

1. **B-087 — a variation is priced like the job's quote.** When the quote adds GST on top, the variation's price is ex-GST and the client is shown both figures before approving. Only variations made after this ships; the four $320 ones on INV-0016 stay as Josh left them.
2. **B-084 — no stock terms.** A business with no terms template used to get eight generic clauses on its quotes, including a 2-year warranty and $20M public liability. Now it gets no terms section (the Terms tab already says so).
3. **B-076 — the default opener.** "Thanks for having us out." became "Thanks for the opportunity to quote." because the app can't tell whether there was a site visit.
4. **B-088c — `[CASUAL LOADING]` stays a phrase**; the two new fields give the percent and the loaded rate.
5. **B-074 — moving an accepted quote back archives its unsent deposit draft**; a second acceptance raises a fresh one (a new invoice number).

## Josh, by hand

- **Google Drive bin (B-083), soon:** the old "Paint Trade HQ" folder in the Drive bin still holds EST-0042.pdf, EST-0041.pdf and the photos for EST-0034 and EST-0024. Drive deletes binned items 30 days after they were binned. Restore that folder or move those files out; the app will not move them.
- **Old PDFs:** quote PDFs already saved in Drive before 20 Nov still carry the old About us figures.

## For the next Save to GitHub

Emergent's pod is the only place newer than GitHub `main`. If anything was built there after 15 Nov and not saved, the patch may need a three-way merge on those files — the message tells Emergent to stop and name any file that conflicts.

## Emergent's report (read 26 Nov, on Josh's "check")

- **Applied cleanly:** `git apply --3way --index`, 56 files, no conflicts (its commit `2b8b794`). The 98 pure tests are green and the type check is clean. Its older tests were updated as asked (`ec55998`, `85c5216`, `7e31b25`). The suite's remaining reds are the pod's usual ones.
- **On-screen checks — about half done, and only at 1440:**
  - Passed: 11 (due date), 13 (resize, no crash), 16 (connector), 17 (no sideways scroll, 1440 and 1024).
  - Part passed: 1 (variation GST — form and row; the client page, the invoice line and the GST-inclusive case not viewed), 2 (edit a draft — the sent row and the 409 not viewed), 3 (About us / terms — the empty case only), 5 (invoice layout — PDF only, the public page not viewed), 15 (contracts — the stacking only).
  - **Not viewed at all:** 4 (terms format), 6 (zones and notes), 7 (un-accept), 8 (reopen), 9 (hourly item), 10 (session fix), 12 (greeting). The testing agent would not build the extra test data.
  - Not run: 14 (Drive) — a test Drive can't be connected from the preview.
- **One difference:** the connector returns what it couldn't place as `warnings` at the top of the result, not under `extra.warnings`. Harmless; the wording in the message was mine.
- **One finding it left alone:** the invoice builder's own Job card (the admin's side) shows the address without the job type, while the PDF shows both.
- What's new draft #46 made, not published. TS_ tenants torn down. **Not saved to GitHub** — `main` is still `0165cde`.
- **After the round, at Josh's request, it built a variation "Preview & send" window (`9942d32`)** — see `variation-review-send-notes.md`: it is its own cut-down window, not the estimate builder's.

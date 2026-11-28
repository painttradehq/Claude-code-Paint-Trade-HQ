# Round C7 — verdict (28 Nov 2026, read from `main` at 19ede01; the C7 commits are 4689600 and 2e73d50)

**ACCEPTED.** The crew diff is exactly the brief's rule-1 list (20 files in 4689600: 25 with the report commit's PRD/report lines; `tests/c6b_api.py` deleted; `routes/attachments.py` untouched as §5.5 allowed; nothing under `app/admin/*`; the admin round that followed touched no crew path). The quote route is an allow-list built field by field with the `presentation` blob projected out; test 1 walks the payload for money, client contact, photos, hours and internal notes. The edge panel is one component mounted once in the crew root layout; the swipe-in is caught on the crew column (the agent's silence 6, a sound call); the clock card moved to the panel unchanged, reading a zustand store; the Dashboard keeps only the weather text and the on-the-clock chip; the Inbox sits under Dashboard with the back link and the lit rule; Operations holds the three rows; the scope is inline on the job page; `/scope` redirects; the quote screen follows the business's section order, including the layout toggle. The carry-overs are in. `pytest --collect-only` 1,716. The report is honest about what it did not verify.

Read by me from the diff; the agent's screenshots are not on GitHub (`test_reports/` is not committed), so the screens are **unverified by eye here** — the prototype pass is the reference until the next phone pass.

## Carry into C8 (small, none blocking)

1. **Job page robustness** — `project/[id].tsx` loads the job and the scope in one `Promise.all`; a scope failure now takes the whole job page down ("Could not load this job."). Fetch the scope separately; a scope failure leaves the job page up.
2. **Inbox back link** — drawn above `TabHeader` with a negative top margin (`inbox.tsx`). Give `TabHeader` an `above` prop and drop the margin arithmetic.
3. **Weather chip** — rendered as plain text; the prototype shows a bordered pill (`.wx-chip`). Make it the pill.
4. **Four §6 items the agent left Unverified** — a notification tap route lands on `/employee/inbox` and the Dashboard badge follows Mark all read; the Operations hours sub equals the hours screen's big number; no chip when the forecast is unavailable; a tap where a tab sits while the panel is open only closes it. Verify in C8.

## Notes for the record

- "Agent-tested" in the report means the testing agent re-ran the author's own harness; the agent says so itself.
- Chunk 4 gained two `test_xero` reds that pass alone — chunk noise, unproven; the other 29 reds are the same before and after and not this round's.
- The r46 crew 403 did not reproduce in four runs; nothing was changed. Closed as not reproducible; reopen if the owner sees it on painttradehq.co.
- Spec silences 1–8 all accepted as decided.

---

# The agent's report, verbatim (`memory/reports/roundC7-dashboard-quote-report.md`)

Round C7 done

# Round C7 — Dashboard, the edge time clock, Operations, the scope on the job page, the quote without the money (28 Nov 2026)

Brief `memory/specs/crew/c7-round-message.md` (v1.2, 43,596 bytes), spec `c7-dashboard-ops-quote-notes.md`, prototype `c1-crew-shell.html` (225,962 bytes, the later shell). The first brief and shell were saved, then replaced; the panel was first built to v1.1 (full height, My hours row) and reworked to v1.2 before anything was wired in.

All screen checks ran on TS_ Alpha (seeded, then torn down: 0 TS_ rows left), iPhone user agent, touch, 390 × 844 then 360 × 800. The owner's tenant was not signed in to or written.

## Verify (§6)

| # | Item | Result |
|---|---|---|
| 1 | Dashboard: tab name, weather chip by the date, no clock card on the page, handle 20 % tall centred grey; sheet the size of the clock card, centred, no My hours row; sign in through the job sheet above the panel; ×; green chip and green handle; chip opens the panel; sign out; chip gone | Agent-tested, both sizes (`iteration_c7.json`) |
| 1 | No chip when the forecast is unavailable (delete the pin) | **Unverified** — not run |
| 1 | Unread badge on the Dashboard tab | **Unverified on screen** — the TS_ crew member had no unread message during the runs; the code moves the badge and the id |
| 2 | Gestures: edge swipe opens on Dashboard and job page; swipe left closes; tap on the dim closes; the opening swipe on the job page does not tap the row | Agent-tested, both sizes |
| 2 | While open, a tap where a tab sits only closes | **Unverified as its own step** — the dim covers the tab bar and a tap on the dim closes (tested at the bottom-right corner) |
| 3 | Inbox link → Inbox with "‹ Dashboard", Dashboard tab lit, back returns | Agent-tested, both sizes |
| 3 | `features.inbox` off → no link, no badge, `/employee/inbox` redirects to the Dashboard; restored | My harness only (`test_reports/c7_switches.py`), both sizes |
| 3 | A notification tap route to `/employee/inbox`; badge follows Mark all read | **Unverified** |
| 4 | Operations: three rows, each opens its screen, back reads Operations and lands there; Me without hours/equipment; Learn with Coaching and How I'm going only | Agent-tested, both sizes |
| 4 | My hours sub equals the hours screen's big number | **Unverified** — the sub rendered ("This week 0 h 03 m"); the two numbers were not compared |
| 4 | `features.equipment` off hides the row; `features.learn` off hides Training and the Learn tab; restored | My harness only, both sizes |
| 5 | Job page: "THE WORK · 2 areas · 4 lines", summary card, areas, a line opening in place, lightbox and caption, `/scope` lands on the job page, Open the quote row | Agent-tested, both sizes |
| 5 | Planned-hours switch on → header and area labels carry hours; `features.photos` off → no grids; no row on a TS_ job without a quote | My harness only, both sizes |
| 6 | Quote screen: sections, wording, no "$", no RATE/AMOUNT/Subtotal/GST/Total/bank, status pill, back, "This job has no quote." by URL | Agent-tested, both sizes (the no-quote copy: my harness) |
| 6 | Side-by-side with the owner's PDF, including the layout change | Mine, by text extraction, not by eye — below |
| 7 | Tests, suite, carry-overs, teardown, `app/admin/*` diff empty, nothing published | Below |

The testing agent re-ran my harness (`test_reports/c7_ui.py`) rather than writing its own; treat "agent-tested" as one script run twice by two hands.

## Side-by-side (PDF `test_reports/c7_owner_quote_default.pdf` / `_moved.pdf` vs the crew route)

- Default layout: PDF order About us → Prepared for → Job details → WHAT WE WILL DO → MATERIALS SUPPLIED → OPTIONAL EXTRAS → Terms & conditions → thank-you; crew `sections` hero, about, client-job, cost-breakdown, terms, footer. Same order.
- About us moved after the work and Terms off: both documents followed (PDF: …OPTIONAL EXTRAS → About us → thank-you, no terms; crew: hero, client-job, cost-breakdown, about, footer). Settings restored by snapshot.
- Every crew line sub, the show-on-quote area note, the term titles and the thank-you line were found verbatim in the PDF text. The PDF contains "$"; the crew response and screen contain none.
- Not compared: PRODUCTS AND COLOURS and Hazard disclosures (the TS_ quote has neither), the logo, REVISED QUOTE, and visual styling.

## Backend

- `routes/projects.py`: `GET /api/projects/mine/{id}/quote` (allow-list, built field by field); `has_quote` on the C2 detail.
- Tests: new `tests/test_c7_crew_quote.py` (5); `test_c2_crew_jobs.py` `DETAIL_KEYS` + `has_quote`; `test_crew_signup_audit.py::test_09` rewritten as §5.5. `pytest --collect-only`: **1,716 collected**.
- Env changes: none. New packages: none. Removed routes: none (the scope screen redirects). Deleted: `tests/c6b_api.py`.
- `app/admin/*` diff: empty.

## Full suite (4 chunks, 25 s pause)

| | Before | After |
|---|---|---|
| Chunk 1 | 2 failed, 352 passed | 356 passed |
| Chunk 2 | 281 passed | 281 passed |
| Chunk 3 | 11 failed, 507 passed | 6 failed, 510 passed |
| Chunk 4 | 23 failed, 423 passed | 25 failed, 426 passed |

Chunk 1's first attempt each time did not start (port); both were re-run alone, the "before" on the stashed pre-change tree. Gone after: `test_09` (fixed here), `test_fixF_part2::test_crew_route_exposes_prep_per_line` and five `test_r45_contacts` (not touched — order or noise). New after: two `test_xero` tests in chunk 4; `test_xero.py` alone is 22 passed, so I read them as chunk noise, unproven. The other 29 reds are the same before and after and are not this round's.

## Carry-overs

- `StackHdr` `titleTestID`: `crew-feedback-title`, `crew-events-title`, `crew-quote-title` render (my harness).
- `VideoPlayer.tsx` web origin = `window.location.origin`: changed; not exercised.
- Lightbox caption rule: built ("{line} · {name} — {note}", the name alone when it contains the line's name). The run showed only an area photo ("TS_ Living room · Kitchen · 1"); the name-alone case was not seen on screen.
- `test_09`: green. `tests/c6b_api.py`: gone.
- **r46 crew 403: not reproduced.** `test_r46_attachments.py` passed in the before suite, the after suite and two targeted runs. No cause found, nothing changed in `routes/attachments.py`.

## What's New

Draft #47 has a twelfth card, "Your Dashboard, the quote in your pocket", with §7's text. Still a draft; nothing published.

## Spec silences (decided here, reversible)

1. A job with no scope yet still shows "THE WORK · 0 areas · 0 lines" and the empty card.
2. `ScopeBody` takes no `hoursOn` prop: the scope payload already says whether hours are shown.
3. `revised_at` is in the payload only when the quote was revised (so the key set is 22, or 23 revised; 24 with a licence number).
4. When `features.documents` is off, Me's "Mine" heading goes with its only row.
5. The Inbox back link is drawn above the shared header rather than inside `TabHeader` (the rule gave `TabHeader` two new props only).
6. The swipe-in is caught on the crew column in `app/employee/_layout.tsx` (a hook exported from `EdgeClock.tsx`), since a 24 px strip over the content would block taps there.
7. The clock's state resets when the signed-in crew member changes.
8. The dev preview needed a frontend restart before the new tab route appeared; a build picks it up on its own.

# Round 77 — Dashboard home diet: the same page from a tenth of the trips (proposal for Josh's review, not sent)

Backend round with one small frontend touch; no prototype (nothing on the dashboard changes). Written from Emergent's step-by-step anatomy of `GET /api/dashboard/home` (15 October) and the Round 64 code of `services/dashboard_home.py` (529 lines; line numbers are Round 64).

**Why.** The dashboard home takes 0.8–1.3 s on preview with a local database and 4.7–5.0 s on production (deployer log timings, owner tenant). `home_payload` (`dashboard_home.py:138`) makes roughly 35–45 database trips, almost all sequential: `tz_for` and `now_for` read `admin_settings` twice (:140–141); estimates, invoices, projects and employees are loaded in full (:150–153) and then read again inside `calendar_feed.entries_for_range` (:204, which also reads events, reminders, admins ×3 and `gcal_samples` and calls every connected external calendar), inside `brief_v2` (:241, which runs the whole calendar fan-out a second time for today, plus leads and messages counts that step 5 already made), inside `map_payload` (:242, one `estimates.find_one` per live project), inside `activity_rows` (:249, `deposit_invoices_for` re-reads invoices, `ai_jobs` twice) and inside `brief_state` (:248). External calls sit on the request path: Open-Meteo for the business and for every live-job suburb (30-minute process cache, cold after a restart), the connected Google/Outlook/CalDAV calendars (twice), and the Anthropic brief once a day. At about 84 ms per production round trip the sequential trips alone cost 3–4 s.

## 1. What changes (backend)

| Rule | Change |
|---|---|
| **Read each collection once** | `home_payload` loads `admin_settings` (one read, feeding `tz_for`, `now_for`, `calendar`, `ai`, `business_location`), estimates, invoices, projects, employees, admins, this week's `events`, `reminders`, `timeclock` (closed this week + open), `briefing_headlines` (today + previous), `ai_jobs` (the Start-fresh-since row and the activity rows' two queries become one), `equipment_requests`, `employee_contracts`, `lucy_ideas`, `leads` (new) and `messages` (unread) **once each**, with the Round 75 projections, in **one `asyncio.gather`**. Everything downstream receives these lists as arguments: `entries_for_range(aid, m0, s6, *, preloaded=…)` gains optional keyword arguments for employees, projects, invoices, admins, events and reminders and skips its own reads when they are given; `brief_v2`, `map_payload`, `activity_rows`, `brief_state`, `_owner_first_name` and `deposit_invoices_for` take what they need from the loaded lists instead of querying. Nothing else in `calendar_feed` changes; callers that pass nothing behave as today. |
| **Calendar once** | The week's entries are computed once; `brief_v2` takes today's entries by filtering the week's list instead of calling `entries_for_range` again. |
| **Map in one query** | `map_payload`'s `resolve_job_point` fallback reads the needed estimates with one `$in` query from the already loaded estimates (no `find_one` per project). |
| **External calls off the request path** | Weather: when the 30-minute cache has an entry, use it; when it is cold, return `weather: null` / `weather_areas: []` **and** start the Open-Meteo fetch as a background task (`asyncio.create_task`) that fills the cache; the next load has it. Connected calendars (Google, Outlook, CalDAV): their entries come from a per-tenant 5-minute cache in `calendar_feed`; a cold cache returns the internal entries only and refreshes in the background the same way. The Anthropic brief: if today's brief is not yet stored, return `brief: {on: true, pending: true, lines: []}` and write it in a background task (`_write_brief` → the existing upsert); never await the model on the request path. |
| **Stages, not a chain** | After the single gather: `brief_v2`, `map_payload`, `activity_rows` run together in a second gather; `brief_state` and `_owner_first_name` need nothing further. Three awaited stages in total. |
| **Budget** | ≤ 12 database round trips per call, all in the first gather except the two `count_documents` that need no lists; zero external calls awaited on the request path; the route's existing `Server-Timing: app;dur=` header stays. |

Everything in the payload keeps its shape and values: same cards, strip, weather fields (when cached), brief lines, activity rows, map, greeting. The only new field is `brief.pending`.

## 2. Frontend (admin only: `app/admin/dashboard.tsx`)

When the payload arrives with `brief.pending === true`, the brief card shows its existing loading state (the one used while "Regenerate" runs) and the page fetches the brief again once, 5 s later, through the existing brief route the Regenerate button uses (read, not regenerate); if still pending, it stays in the loading state until the next page load. When `weather` is `null`, the weather card shows the state it already has for "no location yet"; the next load fills it. Nothing else on the dashboard changes.

## 3. What it does not do

- No change to any number, card, order or wording on the dashboard.
- No change to `calendar_feed` behaviour for other callers (calendar page, drawers), beyond the optional preloaded arguments and the 5-minute external-calendar cache, which the calendar page also benefits from.
- No change to the brief's content, cadence (once a day) or the Regenerate button.
- `app/employee/*` untouched.

## 4. Measure (read-only on production via the deployer's log timings; the owner's tenant read-only)

Before and after: `GET /api/dashboard/home` server time p50 over ten calls (preview, local DB) and the production log timings for the owner's tenant over a day (the app logs requests over 500 ms today; add a debug-level log line for this route with its duration and trip count so a sub-500 ms production result is visible). Target on production: under 1 s warm.

## 5. Verify (testing agent, 1440 then 1024, TS_ tenant)

1. Seeded TS_ tenant with quotes in every status, two invoices, two live jobs with suburbs, three crew (one on site), a reminder today, an event this week, a lead, an unread reply: the dashboard before and after shows the same cards, numbers, strip, activity rows, map pins and greeting (compare the JSON payload field by field; only `brief.pending` may differ).
2. Cold weather cache: the first load returns without weather and the card shows its no-weather state; a second load within a minute shows the weather; no request waited on Open-Meteo (mock it with a 3 s delay and assert the first response returned in well under that).
3. Brief not yet written today: the first load returns `pending`; the card shows the loading state; the brief appears on the re-fetch; the stored brief is written once (no duplicate upsert when two loads race).
4. A tenant with a connected Google calendar (mocked): entries appear from the cache; a cold cache returns internal entries and the external ones on the next load; the calendar page shows the same entries as before.
5. Trip budget: an in-process count (as `tests/_r76_inproc.py` does) of database calls for one `home_payload` ≤ 12; suite and `tsc` clean; 1024: no horizontal scroll; no console errors; `app/employee/*` untouched.

## 6. Tests

`backend/tests/test_r77_dashboard_diet.py` on TS_: payload equality before/after on the seeded tenant (deterministic fields; the brief and weather fields compared when cached); database call count ≤ 12 for `home_payload`; weather cold path returns immediately and fills the cache in the background; brief pending path writes exactly once under two concurrent loads; `entries_for_range` with and without preloaded lists returns identical entries; the external-calendar cache expires after 5 minutes (clock patched). Suite green before and after.

## 7. What's new (Draft only)

**Title:** A quicker start to the day
**Body:** The dashboard now gathers everything it shows in one go, and the weather, your calendars and the day's brief no longer hold the page up. Same cards, same numbers, on screen sooner.

## 8. Questions for Josh (one line each)

1. When the weather or the brief is not ready yet, the page shows the card in its loading state and fills it a few seconds later instead of waiting. OK?
2. Connected calendars refresh in the background at most every 5 minutes on the dashboard (the calendar page gets the same). OK?

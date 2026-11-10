Round 95 — Calendar: an end date on events, drawn as one bar. **Rounds 93 + 94 are ahead of this one: finish them and write their report first; start this only after, and when you hold its prototype** — Josh uploads **`calendar-end-date.html`** (a standalone page) with "here"; save it as `memory/specs/calendar/calendar-end-date.html` and this message as `memory/specs/calendar/round95-message.md`. One round at a time — if a crew round is running, queue this behind it. Backend and admin frontend only; nothing under `app/employee/*`. TS_ tenants only; the owner's tenant read-only; nothing published. Build exactly what is written here; nothing from the suggestion list; no code review. File:line below are as at `82bf0a3`; where a line has moved since, find the function by name.

The prototype is the Round 91 calendar with the change (open at 1440: October shows a three-day crew event *Whitfield · deck restoration* as one bar across 20–22 → **+ New event** → Date and **Ends on** side by side → set an end three days out → the hint reads *3 days · one bar across them* → Add to calendar → the bar appears → Week → the bar across its days in the all-day row → click the middle day → the Day shows it → click the bar → the drawer reads *Tue 20 Oct – Thu 22 Oct · 7:30am–3:30pm each day* → Edit; then 1024). Its checks (`tools/test_enddate.js`, 18 at 1440 and 1024) are the shape of the verify list. Josh's note 1 of 10 November: *"the New event has a starting date but no ending date … the bar on the dates should be joined across each date."* Everything not named here is unchanged (Round 91's toolbar, the Show menu, the attention pill, the views, quick-add from an hour cell, the gear, the Google and Outlook layers).

## 1. What the code already has

`EventCreate` / `EventUpdate` carry `start_date` and `end_date` (Calendar Phase 2, `server.py:346–347`, "enables multi-day"); the month treats any entry whose `end_date` differs as a span (`components/calendar/calModel.ts:36 isSpan`, `:37–38 startOf / endOf`) and draws the bar it draws for jobs and leave. Only the drawer is missing the field: `components/calendar/CalDrawer.tsx:100` offers one *Date* and `:93` saves `start_date = end_date = date`. Week and Day placing a span on its first day only (`WeekGrid.tsx:157`) was **Fix Round I §6**, done at `e55c83f` — this round builds on it; if anything of §6 is still missing, build it here and say so.

## 2. The New event and Edit event drawers (`CalDrawer.tsx`, the form)

- **Date** and **Ends on** side by side (`event-date`, `event-end`). Ends on defaults to the Date, has `min` = Date, and is pulled back to the Date if set earlier. A hint under it: *Same day*, or *"{n} days · one bar across them"* (`event-days`). Both are the shared `DateInput` of Fix I §11 (day/month/year, `lang="en-AU"`).
- **Category**, **All day**, **Starts / Ends** (times), **Linked job**, **More options** as today. With more than one day and times set, the times hint reads *These times apply on each day* — a two-day 7:30–3:30 event is 7:30–3:30 on both days, not one 32-hour block.
- The drawer's subtitle shows the range as you type: *Tue 20 Oct – Thu 22 Oct*.
- Save sends `date = start_date = Date`, `end_date = Ends on`, `time` / `end_time` as today; everything else as today. Edit opens with Ends on filled from `end_date`.
- An entry's **view** (the drawer before Edit) reads **When**: *Tue 20 Oct – Thu 22 Oct · 7:30am–3:30pm each day*, or *· all day*; a one-day entry reads as today.

## 3. One bar across the days

- **Month** (`CalViews.tsx`, the month cells): a span entry is drawn in every cell it covers, and the chips of one entry **touch across the cell borders** — square inner corners, the first day rounded on the left, the last on the right (`data-span="sp-start | sp-mid | sp-end"` in the prototype). The title prints once at the start of the bar, and again on the Monday when the bar continues into a new week row; the other segments carry no text. Spans sort first in a cell, in start-date order, so a bar keeps its lane along the row. The chip's time prefix is not shown on a span (the drawer has the times). Jobs and leave already draw this way; events join them.
- **Week** and **Day**: the all-day row carries the bar on every day covered, joined the same way; a span with times stays in the all-day row (it is a multi-day thing), with its times in the drawer, not as a block in the hour grid — the hour grid keeps one-day timed events.
- A one-day event is a plain chip, as today.

## 4. Backend

No model change. `PUT /events/{id}` and `POST /events` already accept `start_date` / `end_date`; the server validates `end_date >= start_date` (400 otherwise) — add if missing. The Google and Outlook layers are read-only and untouched. The calendar feed (`routes/calendar_feed.py`) exports the range as `DTSTART` / `DTEND` (end exclusive) — check it does for events as it does for jobs.

## 5. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. New event: Date and Ends on side by side; Ends on = Date by default; an earlier end snaps back; the hint counts the days.
2. Add a three-day *Jobs & crew* event with 7:30–15:30: Month shows one joined bar with the title once; Week shows it across its three days in the all-day row; Day on the middle day shows it; the drawer reads the range and *each day*; Edit shows Ends on filled; Save keeps it.
3. A bar that crosses into the next week row restarts with its title on the Monday.
4. A one-day event is unchanged; a timed one-day event stays in the hour grid.
5. The ICS feed carries the range for a multi-day event.
6. 1024: the drawer at 440 px, no horizontal scroll, the bars still joined. No console errors; `tsc` clean; nothing under `app/employee/*`.

## 6. Tests

`backend/tests/test_r95_event_end_date.py`: create and update with `end_date`, the `end_date < start_date` 400, the feed's DTSTART/DTEND for a two-day event. Suite green before and after (chunked, as the rounds before).

## 7. What's new

A new draft, the next free number, title **"Events that last days"**, one card: "Give an event an end date and it runs as one bar across the calendar — in the month, the week and the day — with its times on each day." Draft only; never publish.

## 8. Report, and GitHub

`memory/reports/round95-end-date-report.md`, starting "Round 95 done": the verify items with screenshots at both widths, the suite before and after, and the commit hash at the end so Josh can click **Save to GitHub**. No code review. Do not start anything else after it. Do not offer next action items.

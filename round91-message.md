Round 91 — Calendar layout: one Show dropdown, no side cards, the grid full width. Start when you hold the prototype: Josh uploads **`calendar-layout.html`** (a small standalone file) with "here"; save it as `memory/specs/calendar/calendar-layout.html` and save this message as `memory/specs/calendar/round91-message.md`. Round 89 is done; nothing else is running. One round at a time — if a crew round is running, queue this behind it.

The prototype is a standalone page built from the current calendar (`app/admin/events.tsx`, `components/calendar/*`): the same month, week and day views with sample entries, and the three changes below. Its checks (`tools/test_calendar.js`, 23 at 1440 and 1024) are the shape of the verify list. Admin frontend only; no backend change; nothing under `app/employee/*`. TS_ tenants only; the owner's tenant read-only; nothing published. Josh's notes 9 and 10 of 7 November (note 8, the day click, shipped in Round 87 item 21). Everything not named here is unchanged: the views, the entry drawer, quick-add, New event, the gear's Calendar settings, the Google and Outlook layers, the crew avatars.

## 1. The filters become one dropdown

- The "SHOW" row of seven chips (Jobs & crew, Meetings & site visits, Reminders & follow-ups, Money due, Birthdays, Documents, Google) goes. In its place, in the toolbar after the search: one button **Show** (`cal-show`) with seven small colour dots (a hidden category's dot fades to 18 % opacity) and a label **All** / **{n} of 7** / **None**, then ▾.
- Clicking it opens a 280 px dropdown under the button (`cal-show-pop`): one row per category — checkbox, colour dot (Google's hollow, as its chips), label, and the count of its entries **in the month on screen** (`show-row-{key}`) — plus a footer with **Show all** (`show-all`) and **Hide all** (`show-none`) and the words "this month". Ticking applies at once and the dropdown stays open; Escape or a click elsewhere closes it. The same seven keys and the same stored preference as the chips today (whatever the page persists for hidden categories keeps working; nothing changes in the data).
- The subtitle's "{n} things in view" counts what the dropdown leaves visible.

## 2. The three side cards go; the grid takes the width

- The right column with **Today**, **Next 7 days** and **Needs attention** (`components/calendar/CalRail.tsx`, `rail-today`, `rail-upcoming`, `rail-attention`) is removed from the page; the grid (`cal-grid`) spans the content column at every width. The search's results list, which lived in that column, becomes the filtered grid itself: the search narrows the entries and the month, week and day views show what matches. Delete `CalRail.tsx` if nothing else imports it (say so).
- **Needs attention keeps a home in the toolbar**: a red pill **Needs attention · {n}** (`cal-attention`), shown only when n > 0, between the Show button and the Month / Week / Day switch. Clicking it opens a 340 px list (`cal-attention-pop`): **Late** first, then **Soon**, each row the entry's title in its category colour with the sub-line the card used ("Overdue — chase payment", "Due 30 Oct"); a row opens the entry's drawer as the card did; "Show more" past eight, as before. Hiding a category in Show also drops its items from the pill. Today's and the next seven days' items are not listed separately any more: today is marked in the grid and the day view is one click away.

## 3. Toolbar, left to right

Today · ‹ › · the month or day title · search · **Show ▾** · **Needs attention · n** (when any) · Month | Week | Day · the gear. At 1440 one row; at 1024 two rows at most, nothing overflowing. **+ New event** stays top right in the page header.

## 4. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. The page has no side cards; the grid's right edge sits at the content column's right edge at 1440 and 1024; no horizontal scroll.
2. Show: seven rows with this month's counts; unticking Money due removes its chips from the month, the week and the day; the button reads "6 of 7"; Hide all empties the grid and reads "None"; Show all restores "All"; the choice survives a reload exactly as the chips' choice did.
3. The attention pill: a TS_ tenant with one overdue invoice and one document expiring within a week shows "Needs attention · 2"; the list opens, Late first; a row opens the drawer; with Money due hidden the count drops to 1; with nothing late or soon the pill is absent.
4. Search "okafor" narrows the grid to that client's entries in every view; clearing restores it.
5. Day click, week and month switching, quick-add from an hour cell, New event, the drawer — all as before.
6. 1024: the toolbar fits in two rows at most, the dropdown and the attention list stay inside the viewport. No console errors; `tsc` clean; nothing under `app/employee/*`.

## 5. Tests

Frontend only; the testing agent's pass is the test. The backend is untouched; the suite runs before and after to show it (chunked, as Rounds 85–89).

## 6. What's new

A new draft, the next free number, title **"A wider calendar"**, one card: "The calendar now fills the page. The category chips are one Show menu, and anything late or due soon sits in a red pill in the toolbar." Draft only; never publish.

## 7. Report

`memory/reports/round91-calendar-report.md`, starting "Round 91 done": the verify items with screenshots at both widths, the removed components, how the hidden-category preference is stored, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

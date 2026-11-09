# Round 91 — Calendar layout: one Show dropdown, no side cards, the grid full width (9 November) — SENT 9 Nov (`round91-message.md`; the prototype goes up as Josh's upload with "here"), building

Prototype: **`calendar-layout.html`** (open at 1440: the grid fills the page; **Show ▾** → untick Money due → the red chips go and the button reads "6 of 7" → Hide all / Show all → the red **Needs attention · 4** pill → its list → click the number of the 23rd → the day by hours → Week → Month; then 1024). Playwright `tools/test_calendar.js` **22/22** at 1440 and 1024. Built from the current page (`app/admin/events.tsx`, `components/calendar/*`, the 23 Oct capture `memory/marketing/screens/22-calendar-1440.png`); everything not named here is unchanged — the views, the drawer, quick-add, the gear's Calendar settings, the Google layer. Josh's notes 9 and 10 of 7 Nov (note 8, the day click, shipped in Round 87 item 21).

## 1. The filters become one dropdown

- The "SHOW" row of seven chips (Jobs & crew, Meetings & site visits, Reminders & follow-ups, Money due, Birthdays, Documents, Google) goes. In its place, in the toolbar after the search: one button **Show** (`cal-show`) with seven small colour dots (a hidden category's dot fades) and a label **All** / **{n} of 7** / **None**, then ▾.
- Clicking it opens a 280 px dropdown under the button (`cal-show-pop`): one row per category — checkbox, colour dot (Google's hollow, as its chips), label, and the count of its entries **in the month on screen** — plus a footer with **Show all** and **Hide all** ("this month" beside them). Ticking applies at once and the dropdown stays open; Escape or a click elsewhere closes it. The same seven keys and the same stored preference as the chips today (whatever the page already persists for hidden categories keeps working; nothing else changes in the data).
- The subtitle's "{n} things in view" counts what the dropdown leaves visible.

## 2. The three side cards go; the grid takes the width

- The right column with **Today**, **Next 7 days** and **Needs attention** (`CalRail.tsx`) is removed from the page; the grid (`cal-grid`) spans the content column at every width. The search's results list, which lived in that column, becomes the filtered grid itself (the search already narrows the entries; the month, week and day views show what matches).
- **Needs attention keeps a home in the toolbar**: a red pill **Needs attention · {n}** (`cal-attention`), shown only when n > 0, between the Show button and the Month/Week/Day switch. Clicking it opens a 340 px list (`cal-attention-pop`): **Late** first, then **Soon**, each row the entry's title in its category colour and a sub-line ("Overdue — chase payment", "Due 30 Oct"); a row opens the entry's drawer as the old card did. "Show more" past eight, as before. Hiding a category in Show also drops its items from the pill. Today's and the next seven days' items are no longer listed separately: today is marked in the grid and the day view is one click away (Round 87).

## 3. Everything else as built

Month, Week and Day (the Round 87 day click included), the entry drawer, quick-add from an hour cell and from New event, the "+n more" link, Today and ‹ ›, the gear → Calendar settings, the Google and Outlook layers' styling, the crew avatars in the week header. No new data, no new routes.

## 4. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. The page has no side cards; the grid's right edge sits at the content column's right edge at 1440 and 1024; no horizontal scroll.
2. Show: seven rows with this month's counts; unticking Money due removes its chips from the month, the week and the day; the button reads "6 of 7"; Hide all empties the grid and reads "None"; Show all restores "All"; the choice survives a reload exactly as the chips' choice did.
3. The attention pill: a TS_ tenant with one overdue invoice and one document expiring within a week shows "Needs attention · 2"; the list opens, Late first; a row opens the drawer; with Money due hidden the count drops to 1; with nothing late or soon the pill is absent.
4. Search "okafor" narrows the grid to that client's entries in every view; clearing restores it.
5. Day click, week and month switching, quick-add from an hour cell, New event, the drawer — all as before.
6. 1024: the toolbar fits in two rows at most, the dropdown and the attention list stay inside the viewport. No console errors; `tsc` clean; nothing under `app/employee/*`.

## 5. Tests

Frontend only; the Playwright pass above is the test. Backend untouched.

## 6. What's new

A new draft, the next free number, title **"A wider calendar"**, one card: "The calendar now fills the page. The category chips are one Show menu, and anything late or due soon sits in a red pill in the toolbar." Draft only.

## 7. Report

`memory/reports/round91-calendar-report.md`, starting "Round 91 done": the verify items with screenshots at both widths, the removed components, how the hidden-category preference is stored, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

## 8. Josh's calls before the send (defaults; "send" takes them)

1. **Needs attention stays as a toolbar pill** rather than disappearing with the cards. (Alternative: drop it entirely; late invoices still show in red on the grid and on the dashboard.)
2. **Today and Next 7 days are not replaced** — the grid and the day view carry them. (Alternative: a "Next 7 days" entry in the Show dropdown's footer that jumps to the week view.)

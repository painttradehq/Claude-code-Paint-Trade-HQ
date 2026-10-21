# Round 81 — Pay and hours: Overtime rate · Operating hours · sign-in / sign-out reminders (prototype for Josh's review, 21 Oct)

Prototypes: **`settings-pay-hours.html?page=business`** (Business › Operating hours; then the rail › Crew app › Push notifications for the two reminder switches) and **`employee-pay-rates.html`** (the employee page's Pay rates with Overtime, the This week card, Add employee; `?daily=1` for a daily-rate employee). Open at **1440** first, then **1024**. Playwright: `tools/test_hours.js`, **46/46** at both widths. Screenshots: `hours-business-1440.png`, `hours-crew-1440.png`, `employee-pay-1440.png`, `employee-pay-add-1440.png`, `employee-pay-1024.png`, `hours-business-1024.png`, `hours-crew-1024.png`.

Josh (21 October): (1) "On the employee profile page there is a section to write the rate $; I want another there called Overtime rate, because some businesses pay extra." (2) "The employee timesheets have no alarm to tell the employee to sign off. Add a section in Settings › Business called Operating hours; if it says 7am to 4pm the crew get a notification 'don't forget to sign out', and the same for sign-in." Decisions the same day: **blank overtime rate = the hourly rate**; **the project labour cost uses the overtime rate for overtime hours**; **the morning reminder goes only to crew with a job scheduled that day**; the hours live on the Business page and the two switches on the Crew app page; **one short round after Round 80**.

## 1. What exists today (Round 64 code)

- An employee has `hourly_rate` and `daily_rate`, set in the Add employee dialog ("Pay · admin only") and in the employee page's file card under **Pay rates** (`detail/FileCard.tsx`, `PUT /employees/{id}`); owner and members with the pay permission only (`test_team_access.py`).
- Overtime **hours** already exist: the Timesheets gear sets "Overtime after 8 h / day and 38 h / week" (`operations.overtime_threshold_hours_per_day/_per_week`, `services/timesheets.split_overtime`); the week grid, the person drawer and the payroll CSV split regular and overtime hours; the CSV has hours only.
- Money disagrees with itself: the employee page's **This week** card costs overtime at a hidden **1.5 ×** the hourly rate (`detail/Happening.tsx`); the **project labour cost** (`routes/projects.py`, timeclock sessions × `hourly_rate`) ignores overtime.
- The Timesheets gear's **Auto sign-out at** closes sessions left open from a previous day at that time and flags them `auto_closed` (`services/timesheets.auto_sign_out_job`, every 15 min, per-tenant time zone). It tells the crew nothing.
- No push (C7). In-app notifications exist (`db.notifications`, recipient type employee); the crew app shows them when open. Round 79 stored five push choices on the Crew app page for C7.
- No business-hours setting anywhere.

## 2. The employee page — Overtime rate

- **Pay rates** gets a third field, **Overtime $/h**, after Hourly and Daily (the file card; the Add employee drawer's Pay section the same: Hourly rate · Daily rate · Overtime rate). Same permission as the other two. Help line: "Feeds labour cost on live projects and the payroll file. Hourly wins; daily is used when hourly is empty. Overtime is paid for the hours past the thresholds in the Timesheets gear — leave it blank to pay overtime at the hourly rate." A daily-rate employee (hourly empty, daily set) has the Overtime field greyed with "Overtime is not used with a daily rate — a day is a day."
- **One money rule everywhere:** `regular hours × hourly_rate + overtime hours × (overtime_rate or hourly_rate)`; daily-rate employees: `days worked × daily_rate`. The This week card drops its 1.5 × and prints the rule under the bars ("38 h regular × $52.50 + 4 h overtime × $78.75 = $2,310"); the project labour cost splits each employee's sessions by day with the same `split_overtime` (daily threshold, then the running weekly threshold in the pay week) and prices the overtime part at the overtime rate; the payroll CSV gains `hourly_rate` and `overtime_rate` columns (and `daily_rate`), so the hours and the rates sit on one line.
- Record: `employee.overtime_rate` (float ≥ 0 or null). `PUT /employees/{id}` and `POST /employees` accept it; the summary route and the MCP listing carry it with the same stripping as `hourly_rate`; the crew's own profile route never returns pay fields (as today).

## 3. Settings › Business › Operating hours

New section after **Contact**, saving with the page's Save bar. Line: "Your ordinary working day. The crew app uses it for the sign-in and sign-out reminders (Settings › Crew app › Push notifications). The Timesheets gear keeps its own auto sign-out time as the safety net for forgotten sessions."

- **Start of the day** (time, 15-minute steps, default 7:00 am) — "The sign-in reminder goes out at this time."
- **End of the day** (default 4:00 pm) — "The sign-out reminder goes out at this time." Under it a computed note: "A 9-hour day, Monday to Friday." An end at or before the start shows "The end of the day must be after the start." in red and Save is refused with the same words.
- **Working days**: Mon–Sun chips, Mon–Fri on — "Reminders go out on these days only."
- Stored on the tenant's Operations settings: `operations.hours { start: "07:00", end: "16:00", days: [1,2,3,4,5] }`, in the business's time zone (the one `tz_for` already resolves). Validation: `end > start`, days ⊆ 1–7.
- The **Timesheets gear** shows a read-only line above Auto sign-out at: "Operating hours 7:00 am – 4:00 pm · set in Settings › Business", so the safety net is never set before the end of the day. Nothing else in the gear changes.

## 4. Settings › Crew app › Push notifications — two more switches

Under Round 79's five, on by default, saved at once in `crew_app_settings.notifications`:

- **Remind them to sign in at the start of the day** — "At **7:00 am** on working days, to crew with a job that day · the time is set in Settings › Business › Operating hours" (`signin_reminder`).
- **Remind them to sign out at the end of the day** — "At **4:00 pm** on working days, to everyone still signed in · the time is set in Settings › Business › Operating hours" (`signout_reminder`).

The times print from the saved operating hours. The Crew app page line adds "the operating hours on the Business page".

## 5. Backend — the reminder job

- A scheduler job every 5 minutes (`worker.py`, beside `timesheet_auto_sign_out`): for every tenant with `operations.hours` and the switch on, in the tenant's time zone, on a working day:
  - at **start** (within the 5-minute window): every active crew member (onboarding complete, not removed, not red-flagged) who **has a job scheduled for today** — a project they are assigned to whose dates cover today (the same assignment and dates the crew app's Today page uses) — and who is not signed in, gets a notification `kind: "signin_reminder"`, title "Time to sign in", message "Sign in on the {project name} job when you reach the site." If the business has no job scheduled for today, nobody is reminded.
  - at **end**: everyone still signed in gets `kind: "signout_reminder"`, title "Don't forget to sign out", message "It's {4:00 pm} — sign out when you leave {project name}."
  - one of each per employee per day: `reminders.{date}.{kind}` stamped on the employee, so a restart or an overlapping run never sends twice.
- Written to `db.notifications` (recipient type employee) exactly like the existing ones, so the crew app's bell shows them when open. **Push delivery comes with C7** (the crew chat): the two kinds join Round 79's five; the admin's switches gate both the in-app write and the push. Nothing in this round sends a push.
- Auto sign-out is unchanged. `GET /employee/app-settings` (Round 79) adds `hours { start, end, days }` so the crew app can show "Your day: 7:00 am – 4:00 pm" where the crew chat wants it.

## 6. The crew side (the crew chat, C7 or its next round)

The two notification kinds in the push mapping; tapping the sign-in reminder opens the Time clock on that job; tapping the sign-out reminder opens the sign-out step. Nothing else. `app/employee/*` stays the crew chat's.

## 7. Verify (testing agent, 1440 then 1024, TS_ tenant)

1. Employee page › Pay rates: three fields; Overtime blank → the help line; set 78.75 → saved, `GET /employees/{id}` carries `overtime_rate`; a daily-rate employee shows Overtime greyed with the note. Add employee: the three pay fields; a new employee saved with an overtime rate.
2. The This week card: a TS_ crew member with 9, 9, 8, 9, 7 hours → 38 h regular, 4 h overtime; labour 38 × hourly + 4 × overtime; with Overtime blank, 4 × hourly; the rule line under the bars matches.
3. Live project page money: the same crew member's sessions on a TS_ project price the overtime hours at the overtime rate; with no overtime rate, at the hourly rate; a daily-rate member at days × daily.
4. Payroll CSV (Lock week): the three rate columns, the figures matching the employee record; a member without the pay permission still gets no rates anywhere.
5. Settings › Business › Operating hours: defaults 7:00 / 4:00 pm / Mon–Fri; the note; end 6:00 am refused with the red note and on Save; Saturday on → "Monday to Saturday"; Save → `GET /admin/profile` carries `operations.hours`; the Timesheets gear shows the read-only line.
6. Settings › Crew app › Push notifications: seven rows; the two reminders print the saved times; switching one saves at once; `GET /admin/crew-app-settings` reflects it; `GET /employee/app-settings` for a TS_ crew member carries `hours`.
7. The job: with the tenant's clock set to the start time (test harness: call the job with a fixed "now"), a crew member assigned to today's TS_ project and not signed in gets one `signin_reminder`; one with no job today gets nothing; a second run in the same window sends nothing more; at the end time the signed-in member gets one `signout_reminder`; on a non-working day nothing; with the switch off nothing; tenant B's crew never get tenant A's reminders.
8. 1024: no horizontal scroll; no console errors; `tsc` clean; `app/employee/*` untouched.

## 8. Tests

`backend/tests/test_r81_pay_hours.py` on TS_: `overtime_rate` save / read / stripping; the money rule in the week summary and the project labour cost (blank → hourly; set → overtime rate; daily-rate); the CSV columns; `operations.hours` validation (end ≤ start → 400; days outside 1–7 → 400); the reminder job with a fixed clock (start: assigned and not signed in → one; not assigned → none; twice → still one; end: signed in → one; switch off → none; non-working day → none; cross-tenant → none). Suite green before and after.

## 9. What's new (Draft only)

**Title:** Overtime rates and reminders to sign in and out
**Body:** Each employee can now have an overtime rate, used wherever the app costs their hours. Settings › Business has your operating hours, and the crew app can remind the crew to sign in at the start of the day and to sign out at the end. The reminders reach their phones once push notifications arrive with the crew app's next round.

## 10. Decisions and notes

1. Blank overtime rate = the hourly rate (Josh). The This week card's old 1.5 × goes.
2. The project labour cost uses the overtime rate (Josh).
3. The morning reminder only to crew with a job scheduled today (Josh); the end-of-day reminder to everyone still signed in.
4. Hours on the Business page, switches on the Crew app page (Josh: "not sure what you mean" → built as proposed: the hours are a business fact other pages can use; what reaches the phone sits with the other push choices; one place for each).
5. Overtime defined by the operating hours (outside 7–4 = overtime) is not proposed; the 8 h / 38 h thresholds stay the rule.
6. Builds after Round 80. Both prototypes are patches on existing pages; the employee page prototype is a mock of the real file card from the code, not a redesign of that page.

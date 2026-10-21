# Pay and hours — two parked items (Josh, 21 October)

Josh: (1) "On the employee profile page there is a section to write the rate $; I want another there called Overtime rate, because some businesses pay extra." (2) "The employee timesheets have no alarm to tell the employee to sign off. Add a section in Settings › Business called Operating hours or similar; the alarm knows from that when to go off. If it says 7am to 4pm, the crew get a notification 'don't forget to sign out', and the same for sign-in."

Nothing is built or sent. This note records what exists, the design to prototype, and the questions. Both items are small; together they make one short admin round ("Pay and hours") after Round 80, or they ride with Fix Round G.

## 1. Overtime rate on the employee page

### What exists (Round 64 code)

- An employee has `hourly_rate` and `daily_rate`. They are set in the Add employee dialog ("Hourly rate $/h", "Daily rate $/day", `EmpDialogs.tsx`) and on the employee page's file card under **Pay rates** (`detail/FileCard.tsx`, `PUT /employees/{id}`). Only the owner and members with the pay permission see them (`test_team_access.py`).
- Overtime **hours** already exist: the Timesheets gear sets "Overtime after 8 h / day and 38 h / week" (Operations settings; `services/timesheets.split_overtime`); the week grid, the person drawer and the payroll CSV split regular and overtime hours. The CSV carries hours only, no dollars.
- Two places turn hours into money, and they disagree: the employee page's **This week** card costs overtime at a hidden **1.5 × the hourly rate** (`detail/Happening.tsx`); the **project labour cost** (live project page money, `routes/projects.py`) uses the plain hourly rate for every hour and knows nothing about overtime.

### The design

- A third field, **Overtime rate $/h**, beside Hourly rate in the Add dialog and in the Pay rates block; same permission as the other two. Help line: "Paid for the hours past the overtime thresholds in the Timesheets gear. Leave blank to pay overtime at the hourly rate." Daily-rate employees have no overtime pay (a day is a day); the field stays but is greyed with "Not used with a daily rate".
- The money follows one rule everywhere: **regular hours × hourly rate + overtime hours × (overtime rate, or the hourly rate when blank)**. The This week card drops its 1.5 ×; the project labour cost splits each day's sessions with the same `split_overtime` the timesheet uses (per employee, per day, running weekly total) and prices the overtime part at the overtime rate; the payroll CSV gains two columns, `hourly_rate` and `overtime_rate`, so the bookkeeper has the figures next to the hours.
- `employee.overtime_rate` (float or null) on the record; the summary route and the MCP listing carry it with the same stripping as `hourly_rate`.

### Questions for Josh

1. Blank overtime rate = the hourly rate (no extra), as written — or 1.5 × the hourly rate, which is what the This week card assumes today? (My pick: blank = hourly rate. You said *some* businesses pay extra; the field is where they say how much.)
2. The live project page's labour cost: use the overtime rate for overtime hours (my pick: yes — it is the true cost), or keep every hour at the hourly rate?

## 2. Operating hours and the sign-in / sign-out reminders

### What exists

- The Timesheets gear has **Auto sign-out at** (Off, or a time): every 15 minutes a job closes sessions left open from a *previous* day at that time and flags them `auto_closed` for the admin to check (`services/timesheets.auto_sign_out_job`, per-tenant time zone). It never tells the crew anything.
- No push notifications exist (the crew plan's C7). In-app notifications exist (`db.notifications`, recipient type employee) and the crew app shows them when it is open — ratings, contracts, equipment, daily-report feedback use them. Round 79 stored five push choices on the Crew app page for C7 to honour.
- There is no business-hours setting anywhere.

### The design

- **Settings › Business › Operating hours** (new section, saves with the page's Save bar): "Start of the day" 7:00 am, "End of the day" 4:00 pm (time pickers, 15-minute steps), working days (Mon–Sun chips, Mon–Fri on). Line: "Your ordinary working day. The crew app uses it for the sign-in and sign-out reminders; the Timesheets gear keeps its own auto sign-out time as the safety net." Stored as `operations.hours { start: "07:00", end: "16:00", days: [1..5] }` in the tenant's time zone. The Timesheets gear shows "Operating hours 7:00 am – 4:00 pm · set in Settings › Business" above Auto sign-out at, so the two times sit together and nobody sets the safety net before the end of the day.
- **Settings › Crew app › Push notifications** gets two more switches (on by default), under the five from Round 79: "Remind them to sign in at the start of the day" and "Remind them to sign out at the end of the day", each with the time read from Operating hours ("at 7:00 am · set in Settings › Business"). One place for the hours, one place for what reaches the phone.
- **Backend job** every 5 minutes, per tenant in its time zone, on working days only: at the start time, every active crew member who has a job scheduled for today and is not signed in gets "Good morning — sign in when you reach the site" (`kind: signin_reminder`); at the end time, everyone still signed in gets "It's 4:00 pm — don't forget to sign out" (`kind: signout_reminder`). One reminder each per day, stamped on the employee so a restart cannot send it twice. Written to `db.notifications` now (the crew app shows them when open); **delivered as push when C7 lands** — the crew chat's C7 picks up these two kinds along with Round 79's five. Auto sign-out keeps closing what is still open the next day.
- **The crew side** (the crew chat): the two notification kinds, and the sign-in screen's own words when the reminder opens it. Nothing else.

### Questions for Josh

3. The morning reminder: only crew with a job scheduled for today (my pick — a crew member on leave or between jobs should not be nagged every morning; when the business schedules nothing, nobody is reminded), or every active crew member?
4. Operating hours on the Business page as you asked, with the two switches on the Crew app page — or everything on the Crew app page? (My pick: as you asked; the hours are a business fact other pages can use later.)
5. One short round "Pay and hours" for both items after Round 80, or fold them into Fix Round G?

## 3. What is not in this note

- Overtime defined by the operating hours (anything outside 7–4 is overtime) is a different rule from today's 8 h / 38 h thresholds. Not proposed; say if you want that option in the Timesheets gear later.
- No change to the crew app's screens here beyond the two reminders; `app/employee/*` stays the crew chat's.

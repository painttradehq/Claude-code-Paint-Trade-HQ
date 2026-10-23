# Marketing captures — real screens and walkthrough clips from the preview (23 October) — SENT 23 Oct (sections 1–4 verbatim; report "Marketing captures done")

Josh wants real pictures of the app for the website and for the chat box's gallery, and short moving clips of a user going from page to page. Only Emergent can take them (the preview is not reachable from here). This is a **capture job, no code change**; it occupies the Emergent job for one sitting, so it goes when Josh says "send" and nothing else is running.

## What Emergent does

1. **Data.** Use the TS_ Alpha tenant with the seeded "Demo Lifecycle Painting Co" data as it is (realistic names, no real people). Before capturing, set the business name to **"Harbourline Painting"** and the owner name to **"Sam Reyes"** on that tenant for the pictures, and put them back after. No real tenant is opened. If a screen looks empty, add one or two TS_ rows for it and remove them after.
2. **Screenshots** at **1440 × 900** (admin), **390 × 844** (crew app and public pages), PNG, no browser chrome, cursor hidden, saved to `memory/marketing/screens/<nn>-<slug>-<width>.png`. Light theme. Toasts and the Lucy bubble closed unless the shot is about them. Wait for data to load.

| nn | Screen | Route / how | Widths |
|---|---|---|---|
| 01 | Login (hero + form) | `/admin/login` | 1440 |
| 02 | Dashboard | `/admin/dashboard` | 1440, 1024 |
| 03 | Estimates list | `/admin/estimates` | 1440 |
| 04 | Quote builder, two areas with lines and a photo | an existing TS_ quote | 1440, 1024 |
| 05 | Quote builder — Add work sheet open on the right | same quote | 1440 |
| 06 | Line details panel | same quote, one line | 1440 |
| 07 | Quote details — payment schedule and presentation switch | same quote | 1440 |
| 08 | Presentation pages tab with reviews block | same quote | 1440 |
| 09 | Review & Send | same quote | 1440 |
| 10 | Client quote page on the phone, scrolled to accept | `/quote/<token>` | 390 |
| 11 | Client quote page — signature drawn, before Accept | same | 390 |
| 12 | Library hub | `/admin/library` | 1440 |
| 13 | Library items with photos | `/admin/library/items` | 1440 |
| 14 | Projects (live) | `/admin/projects` | 1440 |
| 15 | Project details with photos and the money block | `/admin/project/<id>` | 1440 |
| 16 | Job drawer open on the right | from Projects | 1440 |
| 17 | Timesheets week grid | `/admin/timesheets` | 1440 |
| 18 | Timesheets person drawer | same | 1440 |
| 19 | Invoices list | `/admin/invoices` | 1440 |
| 20 | Invoice builder | `/admin/invoice/<id>` | 1440 |
| 21 | Client invoice page on the phone | `/invoice/<token>` | 390 |
| 22 | Calendar month with events and a reminder | `/admin/events` | 1440 |
| 23 | CRM clients | `/admin/crm` | 1440 |
| 24 | Client page with the thread and the AI summary | `/admin/customer-detail?...` | 1440 |
| 25 | Leads pipeline | CRM leads view | 1440 |
| 26 | Employees | `/admin/employees` | 1440 |
| 27 | Employee profile with Pay rates (hourly, daily, overtime) | `/admin/employee-detail?...` | 1440 |
| 28 | Contracts — issued contracts view | `/admin/contracts` | 1440 |
| 29 | Daily reports feed (admin) | `/admin/daily-reports` | 1440 |
| 30 | Performance page | `/admin/performance` | 1440 |
| 31 | Equipment | `/admin/equipment` | 1440 |
| 32 | Lucy chat open on a quote page, one question answered | the Lucy button on a quote | 1440 |
| 33 | Settings › Business — Files & storage with Drive connected | `/admin/settings?page=business#storage` | 1440 |
| 34 | Settings › Business — Operating hours | same page, `sec-hours` | 1440 |
| 35 | Settings › Crew app | `/admin/settings?page=crew` | 1440 |
| 36 | Settings › Billing (tester state, "Plans open at launch") | `/admin/settings?page=billing` | 1440 |
| 37 | Terms of Service | `/terms` | 1440, 390 |
| 38 | Crew: sign-in | `/crew` | 390 |
| 39 | Crew: today's jobs (dashboard) | crew dashboard | 390 |
| 40 | Crew: time clock, signed in | `/employee/time-clock` | 390 |
| 41 | Crew: daily report with a photo | `/employee/daily-report` | 390 |
| 42 | Crew: contract to sign | `/employee/contracts` | 390 |
| 43 | Crew: equipment request | `/employee/request-equipment` | 390 |
| 44 | Completion report on the phone | `/report/<token>` | 390 |

3. **Clips** — Playwright video recording at **1440 × 900** (crew clips at 390 × 844), 20–45 seconds each, slow and deliberate (a pause of about a second after each click so the eye can follow), saved to `memory/marketing/clips/<nn>-<slug>.webm`; if `ffmpeg` is on the box, also an `.mp4` (H.264) of each. No sound. Cursor is not recorded by Playwright, so move the page, not the mouse: scroll, open, click, let it settle.

| nn | Journey |
|---|---|
| C1 | Sign in → dashboard loads → open today's job from the strip → the job drawer |
| C2 | New quote: client and address → add an area → pick two Library items → a photo → Review & Send → the sent toast |
| C3 | The client's phone: open the quote link → scroll → tick the optional line → draw a signature → Accept → the accepted state |
| C4 | Projects → project details → photos → the money block → the completion report preview |
| C5 | Crew phone: sign in → time clock sign-in → daily report with a photo → submit |
| C6 | Timesheets week → person drawer → export the payroll CSV (the download toast) |
| C7 | Invoices → the deposit invoice → record a payment → the balance updates → the client invoice page |
| C8 | Lucy on a client page: ask "where are we with this client?" → the answer appears → the morning brief on the dashboard |

4. **Rules.** TS_ tenants only; the owner's real tenant is never opened; the two name changes above are reverted at the end; nothing is published; no code changes; the files go into `memory/marketing/` and Josh picks them up with **Save to GitHub** (or downloads them from the job's file view). Report in `memory/reports/marketing-captures-report.md`, starting "Marketing captures done": the list of files with sizes, which screens could not be captured and why, whether `.mp4` was possible. Do not start anything else after it.

## What Josh gets

Forty-odd PNGs at the real sizes and eight short clips, from the real app with demo data, ready for the website's screenshots section, the "see it move" blocks, and the chat box's picture answers. If a screen needs a redo (wrong state, wrong data), name it and I send a one-line follow-up.

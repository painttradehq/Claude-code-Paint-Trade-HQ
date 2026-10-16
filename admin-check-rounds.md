# Admin app — rounds of checks on the live app (plan, 16 October)

Josh's direction of 16 October: the crew chat finishes the crew app; this chat does the admin side; **all speed work is on hold** (Round 75b finishes what it started, Round 77 is shelved, no Storage checks, no Apply). What the admin side does now: get the live admin app checked end to end, collect what is wrong, and fix it in one round at a time, between the crew chat's rounds.

## 0. Ground rules for a check

- On the **live app** (production), signed in as the owner, on the laptop at full width first, then the iPad, then the phone's browser for the public pages.
- Test data lives in a **separate tester business**: Settings › Platform › Tester invites → invite "TS_ Check Painting" with a spare email, sign up through the invite, do every check inside that tenant. Josh's real business stays read-only during checks. At the end of a check round, Platform › Start fresh removes the tester tenant's data (the existing job), or the tenant stays for the next round.
- Nothing is sent to Emergent during a check; findings are collected first.
- For each failure write five things: screen · what you did · what you expected · what happened · screenshot. One line each. Paste the list here ("findings") and I turn it into the Fix Round G walkthrough with the cause in the code and the fix, as in `fix-round-f-walkthrough.md`.
- A check round is one sitting of about an hour. Seven rounds below; do them in order; each one builds on the data the previous one created.

## Check 1 — Doors, accounts, settings

| Step | Expected |
|---|---|
| Open `/`, `/admin`, `/crew` on the laptop and on the phone | `/` and `/admin` → the admin sign-in; `/crew` → the crew sign-in with "Paint Trade HQ Crew"; each page links to the other door in its footer; no device sniffing |
| Sign in as the owner; sign out; sign in again | Lands on the dashboard; the session list in Settings › Security shows the device; "Sign out other devices" ends the other session on its next request |
| Forgot password → the email → reset | The email arrives from `no-reply@painttradehq.com.au` (the Resend domain must be verified first; if the email does not arrive, that is the finding); the reset link works once |
| Settings › Account, Business, Team, Security | Every field saves and reads back after a reload; the business time zone is Australia/Melbourne; team invite creates an admin member with the chosen access and that member sees only what the access allows |
| Settings › Platform (owner only) | Tabs Signup leads · Tester invites · Feedback · Updates · Start fresh (and Storage once 75b is published: open it, press nothing) |
| Tester invite → sign-up as TS_ Check Painting | The new tenant starts empty (no quotes, no customers, no library items from Josh's business); Quote set-up shows defaults |
| What's new | The drafts (n 12–16) are **not** visible to any user; only published entries show in the bell |

## Check 2 — Quotes, end to end (inside TS_ Check Painting)

| Step | Expected |
|---|---|
| Library: add two items (Walls, Ceilings) and one repair task; set rates and minutes; one item with a prep text | Rates save; the Library hint under "Rate and time" reads ex-GST (Round 72 not built yet) |
| New quote → client, address (Places suggestions), two areas, lines from the Library, one custom line, one optional line | Autosave toast; totals right; the Add work sheet opens on the right at 1440 and at 1024 |
| Line details (part 2a): change the unit, type a prep note, "Print on the quote and show the crew" on | Panel 640 px; the paper shows "Prep · …"; the client view shows "prep: …" |
| Add to the Library from the quote (part 2b): search "bagged brick" → Add to the Library → Save item | Quote saved first; the Library editor with the return bar; back in the sheet with the new card first and a New pill; Add puts it on the quote; reload keeps it |
| Photos: add two photos to an area, mark one up | They show in the photo sheet, on the line, in Review & Send and on the public link; their addresses start with `/api/blobs/` (Round 75), not `data:` |
| Quote details: GST section absent (Round 72 later), presentation switch, payment schedule | As today |
| Review & Send: one signature (F6), AI draft has no sign-off, send by email | The email arrives from the `.com.au` sender with the public link; the text in the app is owner-safe if the server has no email (F7) |
| Public link on the phone: read, accept with a drawn signature | Accepted; the deposit invoice is created; the owner gets the notification |
| PDF preview on the iPad (F4) | Pages render (canvas), not a blank frame |
| Exterior quote: the area picker | The second level (face/element) is gone (F3) |
| Keyboard on the iPad in the item editor's rate/minutes fields (F1) | The keyboard stays open while typing |

## Check 3 — Money

| Step | Expected |
|---|---|
| Invoices: the deposit from Check 2; a progress invoice; a stand-alone invoice; send; public page; PDF; record a payment | Numbers match the quote; the public page and the PDF agree with the builder; payment marks the balance |
| Credit note | Follows its invoice |
| Settings › Business › Accounting (Xero) | The connect button and status read as expected; if the developer app is not set up, the page says so plainly (finding: E15 still open?) |
| Billing (Stripe) in the tester tenant | The trial state shows; the pay strip appears when it should and nowhere else |

## Check 4 — Work: jobs, time, reports, calendar, gear, people

| Step | Expected |
|---|---|
| Projects: the job created from the accepted quote; the job drawer; crew notes | The drawer opens on the right; the crew-notes visibility toggle question (pending) is answered by what you see |
| Employees: add two TS_ crew, generate invite codes | Codes work in the crew sign-up (hand them to the crew chat for its own checks) |
| Timesheets: entries from the crew's clock-ins (after the crew chat's checks), the drawer labels | "General" shows as "General", not "On site" (pending item: confirm) |
| Daily reports (admin view): the crew's C4 reports, the feedback thread | Readable, feedback saves |
| Events / calendar: an event, a reminder with a client, Tomorrow and Mark done on the reminder (F9) | The reminder shows as "Reminder · {client}: {text}"; Tomorrow moves the reminder, Mark done closes it, the client is untouched |
| Equipment: an item, a request from the crew | As today |
| Dashboard: cards, strip, weather, brief, activity, map | Numbers match the data created above; note how long the page takes on a plain reload (speed on hold, but write the number down) |

## Check 5 — CRM

| Step | Expected |
|---|---|
| CRM set-up: links, review link, sign-off text | Saves; the saved signature shows in Review & Send with Edit → set-up (F6) |
| Inbox, leads, automations | A test lead moves through the pipeline; an automation that emails shows "Sent" only when the provider accepted, "Queued · no SMS number connected" for SMS (F8) |
| Customer detail | Quotes, invoices, reminders listed; the merge tags preview |

## Check 6 — Lucy, Help, Learn, Performance

| Step | Expected |
|---|---|
| Lucy from a quote page, an invoice page, a job page, a customer page (F2) | Lucy's answer shows she knows which page is open ("You're looking at EST-…") |
| AI audit log | The chats above are listed, this tenant's only |
| Help hub | Untouched (reserved for Adam) |
| Training videos | Play; watched state saves |
| Performance, pricing page | Numbers consistent with the data created; the pricing page shows the plans as in `pricing.md` if it is public |

## Check 7 — Isolation and teardown

| Step | Expected |
|---|---|
| Sign in as Josh's real business and search for "TS_" anywhere (quotes, customers, library, employees, calendar) | Nothing from the tester tenant appears |
| Platform › Start fresh on the tester tenant (or keep it for Fix Round G's retest) | The tenant's data is gone; Josh's untouched |

## Known open items to settle during the checks

1. Admin layout bounces pushed routes (`/terms`, `/privacy` from inside the admin shell) — does it still?
2. Timesheets drawer shows "General" as "On site" — still?
3. The dashboard lost `SignInOutWidget.tsx` (deleted in C3) — what, if anything, is missing from the owner's dashboard?
4. The project drawer's crew-notes visibility toggle — wanted or not?
5. The contract email says "Attached" but attaches nothing (`contracts-email-only.md`, draft) — confirm the behaviour on the live app, then the one-word decision.
6. Resend: `painttradehq.com.au` verified and the sender working (Check 1 shows it).
7. Google OAuth redirect URIs on the real domain; the Drive connection on production (photos would then go to Drive first).
8. Xero developer app (Check 3).

## After the checks

Findings → `fix-round-g-walkthrough.md` (cause, file, fix, needs) → Josh picks → `fix-round-g-notes.md` → "send" when the crew chat is between rounds (one round at a time across both chats). Round 72 (GST) and Round 74 (presentation pages) stay queued for when Josh wants features again; Round 77 and the Storage work stay on hold.

# Round 92 — Alerts for admins: a buzz on the computer and the phone (9 November) — PROTOTYPED, waits for Josh's look and his calls in §11

Prototype: **`account-alerts.html`** (open at 1440: Settings › Account, the new **Alerts** section under Profile → click the "Alerts on this device" switch → the browser asks → Allow → "On · Chrome on Windows", **Send a test** draws the alert as the system shows it → Remove the iPhone row → flip switches under **What buzzes** → the row at the bottom shows the iPhone-in-Safari, installed-app and blocked states; then 1024, where the rail becomes the tab strip the real shell uses). Playwright `tools/test_alerts.js` **25/25** at 1440 and 1024. The browser prompt, the system notification and the "Prototype only — see it as" row are illustrations, not things to build. Josh's note 28 of 7 November ("admin notified when the app is closed"). Code read at `82bf0a3`.

**What exists and what does not.** The crew app got web push in November: `services/crew_push.py` (one VAPID key pair made once and kept in `platform_keys._id="vapid"`; `send_to_employee`; a wrap on Motor's `insert_one` that pushes every notification row written for an employee), `routes/crew_push.py` (`/api/employee/push/public-key`, `/status`, `/subscriptions`, `/test`), `frontend/utils/crewPush.ts`, `components/crew/CrewAlerts.tsx`, `public/sw.js` (the `push` and `notificationclick` handlers), the service worker registered for the whole site in `app/+html.tsx`. Admins have nothing: **Round 35 removed the admin bell and eight admin notification writes, and Round 41 H4 makes `POST /notifications` refuse admin recipients** ("written to nowhere"). So this round is push only — **no bell, no list in the app, no stored rows**; the pages are the record. Everything not named here is unchanged, and nothing under `app/employee/*` changes.

## 1. Where it lives

Settings › **Account** gains a section **Alerts**, tagged *Saves at once*, between **Profile** and **Team admins** (`sec-alerts`; `components/settings/pages/AlertsSection.tsx`, rendered by `AccountPage.tsx`). Description: *"A buzz on this computer or your phone when something needs you, even with Paint Trade HQ closed. Yours alone: each admin sets their own."* The owner and every team admin see it; each person's devices and switches are their own (stored on their `admins` document, §5).

Two rows, as the page's other rows (`Row`, label 260 px, 200 px when narrow):

## 2. "This device" — the card (`alerts-card`)

Label *This device*, hint *"Turn alerts on where you want them: this computer, the app on your phone, or both."*

- **Top line:** bell icon, **Alerts on this device**, a status line (`alerts-device-status`), the `Switch` from `CrewAppParts` on the right (`alerts-device`). States:
  - **Off** (default; permission not yet asked): status *"Off — turn on to get buzzed here."*; under it, muted: *"Your browser will ask once. Alerts arrive while the browser is running, even with this tab closed."* (on a phone: *"Your phone will ask once."*). Clicking the switch runs the browser's permission prompt from the click (never on load), registers the push subscription on `/sw.js` and saves it (§5). Allow → **On**; Block → **Blocked**.
  - **On:** status in green *"On · {device}"* ({device} = the browser and OS from the user agent, as the crew route stores it — "Chrome on Windows", "iPhone · installed app"); a ghost button **Send a test** (`alerts-test`) with the note *"Shows as “Paint Trade HQ” in the corner of your screen — on a phone, on the lock screen."* The test alert reads *Paint Trade HQ / "Alerts are on. You’ll get buzzed for quotes, payments, replies and the crew."* and opens the dashboard. Switching off removes this device's subscription (server row and browser subscription) — *"Alerts are off on this device."*
  - **Blocked** (permission denied): status in red *"Blocked in your browser."*, the switch disabled, the line *"Allow notifications for painttradehq.co — click the icon left of the address, set Notifications to Allow, then reload this page."* (`alerts-blocked`).
  - **iPhone in Safari** (not installed): status *"iPhone buzzes only from the installed app."*, the switch disabled, the three steps the crew card uses (`alerts-ios-steps`): *Tap Share in Safari (the square with the arrow) · Choose “Add to Home Screen”, then Add · Open Paint Trade HQ from your Home Screen and turn alerts on here.* The admin manifest already installs at `/admin/dashboard` with scope `/admin/`; the installed app gets the same service worker.
  - Android Chrome works in the browser; the installed app is better (the crew card's tip) — same wording, one muted line, only on Android when not installed.
- **Devices with alerts on** (`alerts-devices`): every subscription this admin holds, one row each — name, **THIS DEVICE** on the current one, *"added {date}"*, and **Remove** (`alerts-remove-{id}`, a confirm: *"Remove {device}? That device stops getting alerts until you turn them on there again."*). None: *"None yet. Turn alerts on here, or open Settings › Account in the app on your phone and turn them on there."* (`alerts-no-devices`).
- On every admin app open, `syncPush` once (as the crew app does): a device that already allowed alerts re-saves its subscription, so a re-installed iPhone keeps working.

## 3. "What buzzes" — the switches (`alerts-events`)

Label *What buzzes*, hint *"Your own list. It applies to every device you turn on; off here is off everywhere for you."* One card, four groups, a `Switch` per row (`alert-ev-{key}`), each click saved at once (toast *"{title}: on/off"*); an off row dims. Under the card: *"Tapping an alert opens the record it is about. Nothing piles up in the app — the pages are the record."*

| Group | Key | Switch | Sub-line | Default | Fires from (`82bf0a3`) | The alert reads (title / body) | A tap opens |
|---|---|---|---|---|---|---|---|
| Clients | `quote_answered` | Quote answered | A client signs a quote, or declines it. Opens the quote. | on | `routes/estimate_send.py:505` `accept_public_estimate` after the status write (the `already_accepted` return sends nothing); `:603` `decline_public_estimate` | "{Client} accepted {Q-number}" / "{total} · {quote title}" — or "{Client} declined {Q-number}" / the reason if given | `/admin/estimate/{id}` |
| Clients | `quote_opened` | Quote opened | A client opens a quote for the first time. | **off** | `routes/estimate_send.py:409–411`, only when the status moves sent → viewed | "{Client} opened {Q-number}" / "{quote title}" | the quote |
| Clients | `invoice_paid` | Invoice paid online | A client pays through the invoice’s pay link. Payments you record yourself do not buzz. | on | `routes/invoice_payments.py:223` `_mark_invoice_paid` (the Stripe webhook; already idempotent). Not `invoices.py`'s admin-recorded payments | "{Client} paid {INV-number}" / "${amount} · paid in full" or "part-paid, ${balance} to go" | `/admin/invoice/{id}` |
| Clients | `client_reply` | Client replied | A text or email reply lands in the Inbox. | on | `routes/comms.py:366` `_ingest_email` when it returns a new row; `:450` `sms_inbound` | "{Client name, or the number / address when unmatched}" / the first 80 characters | `/admin/crm?view=inbox&thread={thread key}` (`CrmHome` reads `view`; add `thread` to open that thread) |
| Clients | `variation_answered` | Variation answered | A client accepts or declines a variation. | on | `routes/variations.py:289` `public_respond_variation` | "{Client} accepted/declined variation {n}" / "{project} · {amount}" | `/admin/project/{id}` |
| Crew | `daily_report` | Daily report filed | A crew member files a daily report. | on | `routes/daily_reports.py:62` `create_daily_report` when the caller is an employee (an admin filing one does not buzz) | "{Name} filed a daily report" / "{project}" | `/admin/daily-reports` |
| Crew | `equipment_request` | Equipment request | A crew member asks for equipment. | on | `routes/equipment.py:489` `create_equipment_request` | "{Name} asked for {equipment_name}" / the reason | `/admin/equipment` |
| Crew | `signin_flagged` | Sign-in outside the distance | A sign-in lands outside the job’s distance, under your Crew app rule. | on | `routes/timeclock.py:111` sign-in, when the record is written with `outside_radius` true (`:161`); never for the "ask" rule's refused attempt, which writes nothing | "{Name} signed in {distance} from {job}" / "{radius} allowed · {rule}" | `/admin/timesheets` |
| Crew | `contract_signed` | Document signed | A crew member signs a contract or document you sent. | on | `routes/contracts.py:543` `sign_document` | "{Name} signed {document name}" / "Countersign when you are ready" when the document wants one | `/admin/contracts` |
| Crew | `document_expiry` | Licence or ticket expiring | A crew licence or ticket is a week from expiry, again on the day, and the day after. | on | `services/doc_expiry.py:55` `nudge_job`, at the three `STAGES` it already uses for the crew nudge (7, 0, −1 days), once per stage as `doc_nudges` already guarantees | "{Name}’s {document type} {expires in a week / expires today / expired yesterday}" / "{date}" | `/admin/employee-detail?id={employee}&doc={type}` |
| You | `reminder_due` | Reminder due | A reminder you set reaches its time. | on | a sibling of `services/pay.reminders_job` on the same five-minute tick: `db.reminders` rows with `remind_at ≤ now`, `fired` not true and no `pushed_at`; set `pushed_at` when sent (no timed firing exists today — the dashboard brief lists them and the owner ticks them) | "{reminder text}" / "{time}" | the related record when `related_type`/`related_id` name one (event → `/admin/events`, estimate → the quote, project → the project), else `/admin/events` |
| Platform | `tester_feedback` | Tester feedback | A tester sends feedback from the app. Only platform admins see this switch. | on | `routes/feedback.py:164` new thread and `:190` new message from a tester | "{Tester business}: {subject}" / the first 80 characters | `/admin/settings?page=platform` |

The group header *Platform* carries the small tag *Josh only*; the row and the key exist only for platform admins (`services.tester_access.is_platform_admin`), as the Platform rail item does.

## 4. Who gets what

- An event fans out to **every admin of the tenant** — the owner (`admins._id == owner_admin_id`) and the team admins (`admins.tenant_id == owner_admin_id`, not locked) — then each person's own filters apply: their switch for that key (missing = the default above), their devices (none → nothing), and, for a team admin, their **access**: the alert is sent only when the page it opens is one they can use (`services/access.py` keys): `quote_answered`, `quote_opened`, `invoice_paid` → `quotes`; `client_reply` → `clients`; `variation_answered`, `daily_report` → `jobs`; `equipment_request` → `equipment`; `signin_flagged`, `contract_signed`, `document_expiry` → `crew`. The owner always passes. `reminder_due` goes to the admin who set the reminder (`created_by`), the owner when that is empty; `tester_feedback` to platform admins only, whatever their tenant.
- The person whose own action caused the event is skipped (an admin's own payment entry, an admin filing a daily report) — the hooks above already only fire for client- and crew-side actions, so this is only the `exclude_admin_id` argument on `alert()` for safety.
- Isolation: the fan-out is by `owner_admin_id`; a subscription row names its `admin_id` and its tenant; an endpoint belongs to one person (saving it under an admin deletes the same endpoint under any other admin or employee, as the crew route does the reverse).

## 5. Backend

- **Storage.** Per person: `admins.alerts = {"events": {key: bool}}` (only the keys the person has changed; defaults from `EVENTS`). Subscriptions: the existing `push_subscriptions` collection, rows with `admin_id` and `owner_admin_id` (the tenant) and `kind: "admin"`, beside the crew rows (`employee_id`); fields `endpoint, keys, device, created_at, updated_at`. Nothing else is written — **no `notifications` rows for admins** (Round 41 H4 stands).
- **Routes** `routes/admin_push.py`, prefix `/api/admin/push`, `get_current_admin`:
  - `GET /public-key` → `{public_key}` (the same VAPID key as the crew).
  - `GET /status?endpoint=` → `{devices: [{id, device, added_at, this}], events: {key: bool — the effective values}, platform: bool}`; `this` is true for the row whose endpoint matches the query.
  - `POST /subscriptions {endpoint, keys, device}` (same validation as the crew route) → saves or refreshes; `DELETE /subscriptions/{id}` (own rows only; the client also unsubscribes in the browser when it is this device).
  - `PUT /events {key: bool, …}` → merges into `admins.alerts.events`; unknown key → 422; `tester_feedback` from a non-platform admin → 422.
  - `POST /test` → the test alert to this admin's devices; 409 *"Turn on alerts on this device first."* when there are none.
- **Service** `services/admin_alerts.py`: `EVENTS` (the twelve keys, titles, defaults, access key); `async def alert(owner_admin_id, key, *, title, body, url, related_id=None, only_admin_id=None, exclude_admin_id=None)` — resolves recipients (§4), builds the payload `{title ≤ 120, body ≤ 300, url, tag: "{key}:{related_id}", icon, badge}` and sends through **`send_to_subscriptions(subs, payload)`, factored out of `crew_push.send_to_employee`** (one signer, one dead-endpoint clean-up for 404/410, one place that never raises). Hooks call `alert()` fire-and-forget (`create_task`), after their own write, so a push failure never touches the request. The twelve hook points are the table's column five, one call each; no new scheduler beyond the reminders sibling on the existing five-minute tick.
- **Service worker.** `public/sw.js` is unchanged: the admin payload always carries `url`, so the `/employee/inbox` fallback is never used for it; the icon and badge files exist. `app/+html.tsx` already registers `/sw.js` at scope `/` on https.
- **The crew push is untouched** in behaviour: `routes/crew_push.py` and the employee notification hook keep working; only the sending function moves into the shared helper.

## 6. Frontend

- `utils/webPush.ts`: the body of today's `utils/crewPush.ts` made generic on the base path (`makePush('/employee/push')`, `makePush('/admin/push')`): `pushSupport`, `enablePush`, `disablePush`, `syncPush`, `thisPhoneSubscribed`. **`utils/crewPush.ts` keeps exporting the same names** (`export const { … } = makePush('/employee/push')`), so `components/crew/CrewAlerts.tsx` and everything under `app/employee/*` is untouched.
- `components/settings/pages/AlertsSection.tsx`: the two rows of §2 and §3; `Switch` from `CrewAppParts`; the devices card styled as the Security card (`security-card`); `syncPush` once on the admin shell's mount (`app/admin/_layout.tsx`), not on every page.
- Both phones: Android Chrome (browser or installed) and iPhone (installed app only, iOS 16.4+) — the same support matrix the crew card ships.

## 7. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. Settings › Account shows **Alerts** between Profile and Team admins for a TS_ owner and for a TS_ team admin; each sees their own devices and switches; no change on Business, Crew app, Billing.
2. Desktop Chrome: switch → the permission prompt → Allow → *"On · Chrome on …"*, a `push_subscriptions` row with `admin_id`, **Send a test** delivers; switch off → the row is gone, the browser subscription too. Block → the blocked state; the switch disabled.
3. The devices list: a second subscription (another browser profile) shows as a row; Remove deletes it and it stops receiving; *"None yet"* when empty.
4. Switches save at once and survive a reload (`admins.alerts.events`); **Quote opened** is the only default off.
5. Each hook once with TS_ data, the alert text and the tap target as the table: public accept and decline of a TS_ quote; first view only once; the Stripe test webhook for an online payment; an inbound SMS and an inbound email; a variation response; a crew daily report, equipment request, flagged sign-in, signed document; a crew document dated a week out (`nudge_job` with `only_admin_id`); a reminder due (the tick with `now` injected); a tester message (to the platform admin only). Each sends to the owner's device, not to a second TS_ tenant's.
6. Access: a team admin on the *site* preset receives the crew alerts and none of the quote or client ones; the owner receives everything; a switch off stops that event for that person only.
7. The crew push still works (`POST /api/employee/push/test` to a TS_ employee's device) and no file under `app/employee/*` changed.
8. 1024: the rail is a tab strip, the card and the switches fit the content column, no horizontal scroll. No console errors; `tsc` clean.
9. Josh on his own phones after the publish: iPhone installed app and Android Chrome, Turn on → Send a test → one real quote acceptance (his tenant, his click).

## 8. Tests

`backend/tests/test_r92_admin_alerts.py`: the routes (public key; subscribe / status with `this` / remove; events merge, unknown key 422, platform-only key 422; test 409 with no device); recipient resolution (switch off, default off, access, locked admin, platform-only, a second tenant excluded); one hook end-to-end with the sender stubbed (quote accepted → title, body, url, tag); the crew route and hook unchanged. Suite green before and after (chunked, as Rounds 85–91).

## 9. What's new

A new draft, the next free number, title **"Alerts on your phone"**, one card: "Turn on alerts in Settings › Account and get a buzz when a client signs a quote, pays online or replies, and when the crew file a report or ask for gear — even with the app closed. You pick what buzzes." Draft only; never publish.

## 10. Report

`memory/reports/round92-alerts-report.md`, starting "Round 92 done": the verify items with screenshots at both widths, the twelve hook points as built (file:line), the shared sender, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

## 11. Josh's calls before the send (defaults; "send" takes them)

1. **Quote opened is off by default** (a client opening a quote three times at night is noise for most; one switch away for those who want it). Alternative: on.
2. **Team admins get alerts too, filtered by their access.** Alternative: the owner only, and the section hidden for team admins.
3. **The Platform switch "Tester feedback" exists, for platform admins only** (the sidebar's unread poll stays as the in-app sign). Alternative: leave it out.
4. **Reminder due rides the existing five-minute tick** — a reminder set for 2:00 buzzes between 2:00 and 2:05. Alternative: leave reminders out of this round (the dashboard brief keeps listing them).
5. **The list of twelve.** Anything to drop or add before the build — "Quote answered" covers accept and decline in one switch; nothing buzzes for an admin's own actions.

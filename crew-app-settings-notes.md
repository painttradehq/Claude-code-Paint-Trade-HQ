# Parking lot — Settings › Crew app (admin side) and the crew checks Josh asked for (18 October)

Josh's note, 18 October, given to both chats: push notifications to the phone must be checked; GPS sign-in and sign-out must only work within about 10–30 m of the registered site; the admin ↔ crew patterns must be right (admin adds an employee → the crew member gets a link or scans a QR → an onboarding first page with the welcome video and the admin's notes on culture, values and the company); the admin creates a QR per employee, and a general one; the QR is copyable and sendable; and **a Settings page for the crew app** on the admin side: what the crew side sees and can control, plus the welcome video and description for the onboarding section.

Not a spec yet. This records what exists, what each chat owns, and the decisions before a prototype.

## 1. What exists today (Round 64 code; the crew chat has the current tree)

| Topic | Today |
|---|---|
| **Invite** | Invite codes live in `qr_codes` (kind `invite`, per business, `active` flag; `routes/employees.py:33`). The frontend already carries QR libraries (`qrcode`, `react-native-qrcode-svg`). Whether the Employees page shows a scannable QR today, or only the code, the crew chat confirms from the current tree. |
| **Onboarding** | `app/employee/onboarding.tsx` is a wizard that ends with `onboarding_complete` and `onboarded_at` (Round 42). No welcome video, no admin notes. |
| **Geofence** | **Soft** (Iteration 61): sign-in is never blocked; the record is stamped `outside_radius` and `distance_from_site_m` against the business's `gps_radius_m` setting, with a per-project `geofence_radius_m` override (null = no fence for that job). The admin sees the flag on the timesheet. |
| **Push** | None. No `expo-notifications`, no push-token route. The crew plan's C7 covers it. In-app notifications exist (`app/employee/notifications.tsx`). |

## 2. Who builds what

- **Crew chat (`app/employee/*`):** the onboarding first page (welcome video, admin notes), the QR scan / link entry, push notifications (C7), the geofence behaviour on the crew's sign-in and sign-out screens, and the crew-side checks Josh asked for.
- **Admin chat (this one):** **Settings › Crew app** (the page below), the invite QR on the Employees page if it is not already there, the geofence setting and the sign-in rule, and the backend fields both sides read. The two chats agree the data shape before either builds (§4).

## 3. Settings › Crew app — what the page would hold

One page under Settings, prototyped on the right-hand panel pattern like the other settings pages:

1. **Onboarding.** Welcome video (an upload to the business's storage, or a YouTube link), a welcome note (headline + text: culture, values, who we are), and a preview of the first page as the crew sees it on a phone. The crew app shows this page first after the invite, before the existing wizard.
2. **What the crew sees.** Switches per crew feature: Jobs, Time clock, Daily reports, Photos, Inbox, Learn (training), Documents and contracts, Equipment requests, Team events, Feedback. Off hides the tab or card on the crew side. Defaults on.
3. **Sign-in rules.** The distance from the site within which sign-in and sign-out are accepted, with the rule: **flag** (as today) or **block** (Josh's wish). The number: see §5.1.
4. **Invites.** The general QR (one for the business: anyone who scans it signs up as crew of this business, pending the admin's approval) and the per-employee QR / link from the Employees page; Copy link, Download QR, Send by SMS/email. Expiry and "revoke" on each.
5. **Notifications.** Which events push to the crew's phone once C7 exists: job assigned, start-time change, message from the office, daily report feedback, contract to sign.

## 4. Data shape to agree with the crew chat (one record per business)

`crew_app_settings` on the tenant: `{ onboarding: { video_url, video_kind: upload | youtube, headline, note }, features: { jobs, timeclock, daily_reports, photos, inbox, learn, documents, equipment, events, feedback }, signin: { radius_m, rule: flag | block }, invites: { general_code, general_active }, notifications: { job_assigned, start_change, office_message, report_feedback, contract } }`. The crew app reads it once at sign-in and on resume; the admin page writes it. The geofence fields replace `gps_radius_m` in use, keeping the per-project override.

## 5. Decisions for Josh before a prototype

1. **10–30 m is tighter than a phone's GPS.** A phone in a street reports its position to about 5–20 m, worse under roofs and near tall buildings. A 10 m block will refuse honest sign-ins at the door. Suggestion: default **50 m**, minimum 30, with "block" only when the phone's own accuracy reading is good; otherwise flag. Your call on the number and on flag vs block.
2. The general QR: pending approval by the admin before the person sees jobs, or active at once?
3. The welcome video: upload (your storage, size limit) or YouTube link only? Both is easy.
4. Order: this page can be prototyped now and built after the crew chat's onboarding screen (C5) or together with it in one coordinated round.

## 6. The checks Josh asked for (for the crew chat's check rounds)

1. Push: there is nothing to check until C7 is built; today's notifications are in-app only.
2. GPS: on a real phone at a registered job site, sign in at the door, 50 m away and 200 m away; note the distance the app records and whether the admin's timesheet shows the flag. Repeat for sign-out. This measures what the fence does today before the rule changes.
3. Invite flow end to end: add an employee in admin → the code or QR → the crew phone → sign-up → first screen. Note every screen the crew sees, in order, with a screenshot each; that list becomes the onboarding spec.

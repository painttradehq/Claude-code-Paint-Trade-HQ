# Round 79 — Settings › Crew app (proposal for Josh's review, not sent)

Prototype: **`settings-crew-app.html?page=crew`** (Settings rail › Crew app; Onboarding → **Preview on a phone**; the switches, the distance rule, the general QR and the approvals, the push choices). Open at **1440** first, then **1024**. Playwright: `tools/test_crew_settings.js`, **60/60** at both widths. Screenshots: `crew-settings-top-1440.png`, `crew-settings-1440.png`, `crew-settings-phone-1440.png`, `crew-settings-1024.png`.

Josh's note of 18 October (given to both chats) and his answers: distance as recommended (**50 m default, 30 m minimum**), rule **flag**; the general QR **waits for approval**, crew only see jobs they are assigned to; welcome video by **upload**, YouTube link kept as an option (he is not sure); **minimal onboarding is required** before the main pages open.

## 1. What exists today (Round 64 code; the crew chat confirms against the current tree)

- Invite codes live in `qr_codes` (kind `invite`, per business, `active`; `routes/employees.py:33`); the frontend already has `qrcode` and `react-native-qrcode-svg`.
- The crew onboarding wizard (`app/employee/onboarding.tsx`) ends with `onboarding_complete` / `onboarded_at`; no welcome video, no admin note.
- The site fence is soft (Iteration 61): sign-in never refuses; the record is stamped `outside_radius` and `distance_from_site_m` against the business's `gps_radius_m` with a per-project `geofence_radius_m` override.
- No push notifications exist (the crew plan's C7). In-app notifications exist.

## 2. The page (admin, `app/admin/settings` rail › **Crew app**)

Five sections on the Business-page pattern (sections, rows, "saves at once" where it does):

1. **Onboarding.** Welcome video card (upload to the business's storage: MP4/MOV up to 200 MB, status line "name · length · uploaded date", Replace / Remove; the video is served to the crew app through its storage reference, never embedded in a record); "YouTube link instead" (optional; the upload wins when both are set); Welcome headline; Welcome note (multi-line); **Preview on a phone** opens a right drawer with a phone frame showing the first page as the crew sees it (video block or "No video", headline, note, Continue, three dots) and the line "Then: name, phone, photo and the documents to sign. The main pages open after that." Headline, note and link save with the page's Save bar; the video acts at once.
2. **What the crew sees** (saves at once). Ten rows with switches: Jobs and Time clock always on (lock); Daily reports, Photos, Inbox, Learn, Documents & contracts, Equipment requests, Team events, Feedback on by default. Off hides the tab or card in the crew app; nothing is deleted. Toast "{feature} hidden from / shown to the crew".
3. **Sign-in on site.** "Distance from the site" number field, default **50**, minimum **30** (a lower value is pushed up to 30 with a red note); the explanation that a phone's GPS is only accurate to about 5–20 m outdoors; a job can set its own distance on its page (existing override). "Outside the distance" radio, saves at once: **Flag it** (default, Josh's choice: sign-in always works, entries outside the distance are marked on the timesheet with the distance) or **Refuse it** (refused only when the phone's GPS reading is accurate, otherwise flagged, never locked out).
4. **Invites** (saves at once). Left card **General QR and link**: the QR, the code (`SANO-7K2Q`), the join address `app.painttradehq.com.au/crew/join/{code}`, Copy link · Download QR · Send… · New code (confirm; the old code stops working; approved people unaffected); "Approval before they see anything" always on for the general code. Right card **Personal invite**: text pointing at Employees › the person › Invite (tied to the person, skips approval), Open Employees; **Waiting for your approval** list: name, how they came in, phone, Approve / Decline.
5. **Push notifications** (saves at once). Five switches, on by default: a job is assigned, a start time or date changes, a message from the office, feedback on their daily report, a document to sign. Line: "Push arrives with the crew app's next round; these choices apply from then."

## 3. Data and routes (backend; the crew app reads the same record)

| Piece | Detail |
|---|---|
| **Record** `crew_app_settings` (one per business, keyed by `owner_admin_id`) | `{ onboarding: { video_file_id, video_provider, video_url, youtube_url, headline, note }, features: { daily_reports, photos, inbox, learn, documents, equipment, events, feedback } (booleans; jobs and timeclock implied true), signin: { radius_m (int ≥ 30, default 50), rule: "flag" \| "block" }, invites: { general_code, general_active }, notifications: { job_assigned, start_change, office_message, report_feedback, contract } }`. Defaults as above when the record is missing. `signin.radius_m` replaces `gps_radius_m` in `routes/timeclock.py` (read the new field, fall back to the old once); the per-project override stays. |
| **Routes** (admin, tenant-scoped) | `GET /admin/crew-app-settings` (defaults filled in); `PUT /admin/crew-app-settings` (any subset; validation: radius ≥ 30, rule in the two values); `POST /admin/crew-app-settings/video` (multipart; `file_storage.upload(..., folder="Crew app", public=False)`; replaces the previous video; returns the status line fields) and `DELETE …/video`; `POST /admin/crew-app-settings/invite/regenerate` (new `general_code`, old row inactive); `GET /admin/crew-app-settings/pending` and `POST /admin/employees/{id}/approve` / `…/decline` for sign-ups that came through the general code (`pending_approval: true` on the employee until approved; declined = removed). |
| **Crew side** (crew chat) | `GET /employee/app-settings` returns `features`, `signin`, `notifications` and `onboarding` (with a signed, short-lived URL for the video, or the YouTube link) — the crew app reads it at sign-in and on resume, hides tabs per `features`, shows the welcome page before the wizard, and sends `rule`/`radius_m` into its sign-in screen. The general-code sign-up creates the employee with `pending_approval: true`; the crew app shows "Waiting for {business} to approve you" and nothing else until approved. **Personal invites** (the existing per-employee code) skip approval. |
| **Time clock** | `rule: "block"`: the sign-in route refuses (`409 outside_site`, with the distance) when `distance_from_site_m > radius_m` **and** the phone's reported accuracy is ≤ 25 m; otherwise it records with `outside_radius` as today. `rule: "flag"`: as today. The crew app sends its accuracy reading with the position (one new field). |
| **Push** | No sending in this round. The five booleans are stored for C7. |

## 4. What it does not do

- No crew screens: the welcome page, the pending-approval screen, the tab hiding and the sign-in behaviour are the crew chat's (C5/C3 follow-up), built against §3. This round ships the admin page, the record, the routes and the time-clock rule; the crew chat's round reads them.
- No push sending (C7). No change to personal invites beyond pointing at them. No change to the Employees page except an "Invite" link name if it differs.
- `app/employee/*` untouched.

## 5. Verify (testing agent, 1440 then 1024, TS_ tenant)

1. Settings › Crew app opens from the rail; five sections as the prototype; the page sub-line.
2. Upload a small MP4 → status line, stored under "Crew app" in the TS_ tenant's storage (PTHQ cloud on preview), not inside the record; Replace; Remove; YouTube link saves; headline and note save with the Save bar; Preview on a phone shows what was typed; Escape closes.
3. Feature switches save at once and `GET /admin/crew-app-settings` reflects them; Jobs and Time clock cannot be switched.
4. Distance 10 → 30 with the note; 50 saves; rule Flag/Refuse saves at once. Time clock on TS_: with rule flag a far-away sign-in is recorded and flagged; with rule block and an accurate reading it is refused with the distance; with a poor reading it is recorded and flagged.
5. General code: Copy link, Download QR (a PNG), Send… (share sheet or the SMS/email dialog), New code (the old join link answers "This invite has ended"); a sign-up through the general code appears under Waiting for your approval; Approve → the employee can sign in; Decline → removed. A personal invite skips the list.
6. Isolation: tenant B's settings, code and pending list never show for A. 1024: no horizontal scroll; no console errors; `tsc` clean; `app/employee/*` untouched.

## 6. Tests

`backend/tests/test_r79_crew_settings.py` on TS_: defaults when no record; PUT validation (radius 10 → 400, rule "maybe" → 400); video upload stores a file reference and no base64; regenerate deactivates the old code and the old join link fails; general-code sign-up → `pending_approval`, approve/decline; `/employee/app-settings` returns the record for the tenant's crew only; time clock block vs flag with accuracy 10 m and 60 m. Suite green before and after.

## 7. What's new (Draft only)

**Title:** Your crew app, your way
**Body:** Settings has a new Crew app page: a welcome video and note for new crew, switches for what the crew sees, the on-site sign-in distance, a general QR anyone can scan (with your approval) and the push choices for when notifications arrive.

## 8. Questions for Josh (one line each)

1. The YouTube link stays as an option next to the upload (prototype)? Or upload only?
2. Declining a general-code sign-up removes it silently (prototype). Should the person get a text saying so?
3. Order: build this admin side first, then the crew chat's welcome page and pending screen against §3 (my suggestion), or the two together in one coordinated round?

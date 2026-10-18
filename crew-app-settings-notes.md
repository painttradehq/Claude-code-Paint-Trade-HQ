# Round 79 — Settings › Crew app, with the crew side in the same round (spec, ready for "send 79")

Prototype: **`settings-crew-app.html?page=crew`** (Settings rail › Crew app; Onboarding → **Preview on a phone**; the feature switches; the distance and the rule; the push choices). Open at **1440** first, then **1024**. Playwright: `tools/test_crew_settings.js`, **48/48** at both widths. Screenshots: `crew-settings-top-1440.png`, `crew-settings-1440.png`, `crew-settings-phone-1440.png`, `crew-settings-1024.png`.

Josh's decisions (18 October): distance **50 m default, 30 m minimum**, rule **flag**; invites and approvals stay on the Employees page (no Invites section, no duplication); welcome video by **upload only**; **minimal onboarding is required** before the main pages open; **one coordinated round**: this admin spec and the crew chat's crew spec (built against §3) go to Emergent together as Round 79; the crew chat owns every file under `app/employee/*`.

## 1. What exists today (Round 64 code; the crew chat confirms against the current tree)

- Invites: invite codes in `qr_codes` (kind `invite`, per business, `active`; `routes/employees.py:33`), used by the crew sign-up; managed from the Employees page. Not touched by this round.
- The crew onboarding wizard (`app/employee/onboarding.tsx`): invite code → details (name, date of birth, phone, email, emergency contact, password) → profile photo (optional) → documents with expiry dates (driving licence and white card required) → … → terms and conditions with a signature → `onboarding_complete`. No welcome video, no note from the admin.
- The site fence is soft (Iteration 61): sign-in never refuses; the record is stamped `outside_radius` and `distance_from_site_m` against the business's `gps_radius_m` (Operations settings, default 100, edited in the **Timesheets gear**, `TimesheetSetupPanel.tsx:17`) with a per-project `geofence_radius_m` override.
- No push notifications exist (the crew plan's C7). In-app notifications exist.

## 2. The admin page (Settings rail › **Crew app**)

Four sections on the Business-page pattern (sections, rows, "saves at once" where it does). Page line: "What your crew sees on their phones, the welcome they get, and the rule for signing in on site. Invites stay on the Employees page."

1. **Onboarding.** Welcome video card: upload to the business's storage (MP4 or MOV up to 200 MB), status line "name · length · uploaded date", Replace / Remove; Welcome headline; Welcome note (multi-line, up to 2 000 characters); **Preview on a phone** opens a right drawer with a phone frame: the video block (or "No video — the note shows on its own"), the headline, the note, Continue, three dots, and the line "Then the sign-up steps the crew app already has: details, a photo, licence and white card, the terms to sign. The main pages open after that." The headline and note save with the page's Save bar ("Crew app saved"); the video acts at once.
2. **What the crew sees** (saves at once). Ten rows with switches; Jobs and Time clock are always on (lock). What each switch hides in the crew app (C1's tabs Today · Jobs · Inbox · Learn · Me): Daily reports → the report card on a job and the Today prompt; Photos → the photo actions on a job; Inbox → the Inbox tab; Learn → the Learn tab; Documents & contracts → the Documents and My contracts cards on Me; Equipment requests → the Equipment card on Me; Team events → the events card on Today and Me; Feedback → the Feedback card on Me. Off hides; nothing is deleted. Toast "{feature} hidden from / shown to the crew".
3. **Sign-in on site.** "Distance from the site" number field, default **50**, minimum **30** (a lower value is pushed up to 30 with a red note), the explanation that a phone's GPS is only accurate to about 5–20 m outdoors, and the note that a job can set its own distance on its page (existing override). "Outside the distance" radio, saves at once: **Flag it** (default: sign-in always works, entries outside the distance are marked on the timesheet with the distance) or **Refuse it** (sign-in is refused only when the phone's GPS reading is accurate; a poor reading goes through flagged, never a lock-out). **This field replaces the GPS radius in the Timesheets gear**: that field is removed there and the gear shows "Sign-in distance: 50 m · set in Settings › Crew app" with a link. One place.
4. **Push notifications** (saves at once). Five switches, on by default: a job is assigned, a start time or date changes, a message from the office, feedback on their daily report, a document to sign. Line: "Push arrives with the crew app's next round; these choices apply from then."

## 3. Data and routes (backend, this spec; the crew side reads them)

| Piece | Detail |
|---|---|
| **Record** `crew_app_settings` (one per business, keyed by `owner_admin_id`) | `{ onboarding: { video_file_id, video_provider, headline, note }, features: { daily_reports, photos, inbox, learn, documents, equipment, events, feedback } (booleans; jobs and timeclock implied true), signin: { radius_m (int ≥ 30, default 50), rule: "flag" \| "block" }, notifications: { job_assigned, start_change, office_message, report_feedback, contract } }`. Defaults as above when the record is missing. |
| **Distance, one place** | `signin.radius_m` is the business distance. `routes/timeclock.py` reads it (falling back to the old `gps_radius_m` once, then the per-project override as today); the Operations setting `gps_radius_m` stops being written; the Timesheets gear field is removed (§2.3). The admin "off-site sign-ins" bar on Timesheets and the `outside_radius` flag keep working unchanged. |
| **Admin routes** (tenant-scoped) | `GET /admin/crew-app-settings` (defaults filled in); `PUT /admin/crew-app-settings` (any subset; radius ≥ 30, rule in the two values, note ≤ 2 000 characters); `POST /admin/crew-app-settings/video` (multipart; `file_storage.upload(..., folder="Crew app", public=False)`, replaces the previous video and deletes the old file, returns the status fields) and `DELETE …/video`. |
| **Crew routes** (this spec builds them; the crew chat's screens call them) | `GET /employee/app-settings` → `{ features, signin, onboarding: { headline, note, video: true/false }, welcome_seen: true/false }` for the caller's business. `GET /employee/onboarding/video` streams the welcome video to a signed-in crew member with HTTP Range (`Accept-Ranges: bytes`, 206), reading the file back through `file_storage.download` (Drive, OneDrive or the private blob — the Round 78 helpers); never a public URL; 404 for another tenant's crew. `POST /employee/onboarding/welcome-seen` sets `welcome_seen_at` on the employee. The time-clock sign-in and sign-out routes accept one new optional field, `accuracy_m` (the phone's reported accuracy). |
| **Time clock** | **Sign-in** with `rule: "block"`: refused (`409 outside_site`, with the distance and the accuracy) when `distance_from_site_m > radius_m` **and** `accuracy_m` ≤ 25; otherwise recorded with `outside_radius` as today. With `rule: "flag"`: as today. **Sign-out is never refused**: a crew member who has left the site must still be able to close the clock, so sign-out is recorded and flagged when outside, under both rules. |
| **Push** | No sending in this round. The five booleans are stored for C7. |

## 4. The crew side (the crew chat's spec, same round; everything under `app/employee/*`)

Written here so both chats build to one shape; the crew chat words its own spec and prototype from it.

1. **Welcome page**, shown once per person, after the invite code and before the existing wizard, when `welcome_seen` is false: the video (streamed from `GET /employee/onboarding/video`, with the phone's native player) or nothing when `video` is false, the headline, the note, **Continue** → `POST /employee/onboarding/welcome-seen` → the wizard. The main tabs stay closed until `onboarding_complete`, as today.
2. **Tabs and cards follow `features`** (§2.2's list), read at sign-in and on resume; a hidden feature's screens are unreachable, not just unlinked.
3. **Sign-in screen**: sends `accuracy_m` with the position; shows the distance rule from `signin` in its own words ("You're 120 m from the site — this will be flagged" / with rule block and a good reading: "You're 120 m from the site — move closer to sign in"); sign-out always goes through, flagged when outside.
4. Nothing on push yet (C7).

## 5. What it does not do

- No invite or approval work: the Employees page keeps it. If Check 4 finds the general-code sign-up does not wait for approval, that becomes a Fix Round G item.
- No YouTube link: upload only. No push sending (C7).
- Admin files and crew files are built by their own chats; the shared backend routes are in this spec.

## 6. Verify (testing agent, 1440 then 1024 for admin; 390 then 360 for crew; TS_ tenant)

1. Settings › Crew app opens from the rail; four sections as the prototype; the page line; no Invites section.
2. Upload a small MP4 → the status line; the file sits under "Crew app" in the TS_ tenant's storage (PTHQ cloud on preview), not inside the record; Replace deletes the old file; Remove; headline and note save with the Save bar; Preview on a phone shows what was typed; Escape closes.
3. Feature switches save at once and `GET /admin/crew-app-settings` reflects them; Jobs and Time clock cannot be switched; a TS_ crew member's `GET /employee/app-settings` returns the same, and the crew app hides the right tabs and cards.
4. Distance 10 → 30 with the note; 50 saves; the Timesheets gear no longer has a GPS field and shows the link line; rule Flag / Refuse saves at once. Time clock on TS_: rule flag → a far-away sign-in is recorded and flagged; rule block + accuracy 10 m → refused with the distance; rule block + accuracy 60 m → recorded and flagged; sign-out from far away is always recorded and flagged.
5. A new TS_ crew member sees the welcome page once (video plays on the phone), then the wizard; a second sign-in skips it. `GET /employee/onboarding/video` streams with Range (206) and refuses another tenant's crew (404).
6. Isolation: tenant B's settings never show for A. Admin 1024: no horizontal scroll; crew 360: nothing overflows; no console errors; `tsc` clean.

## 7. Tests

`backend/tests/test_r79_crew_settings.py` on TS_: defaults when no record; PUT validation (radius 10 → 400, rule "maybe" → 400, note 2 001 → 400); video upload stores a file reference and no base64, replace deletes the old file; `/employee/app-settings` returns the tenant's record for its crew only; the video stream with Range and the cross-tenant 404; `welcome-seen` once; time clock block vs flag with accuracy 10 m and 60 m, sign-out never refused; the Operations `gps_radius_m` no longer written. Suite green before and after.

## 8. What's new (Draft only)

**Title:** Your crew app, your way
**Body:** Settings has a new Crew app page: a welcome video and note for new crew, switches for what the crew sees, the on-site sign-in distance and rule, and the push choices for when notifications arrive. New crew see your welcome the first time they open the app.

## 9. Second pass — what the recheck changed

1. Invites section removed (duplication of the Employees page). Four sections now.
2. The GPS radius already had a home in the Timesheets gear; keeping both would be two places for one number. It moves here and the gear points at it.
3. Sign-out must never be refused, or a crew member who has left the site cannot close the clock. Written into the rule.
4. Serving the video: an uploaded video in a private store cannot be a public link; the crew app streams it through a crew-authenticated route with Range support, using the Round 78 download helpers.
5. The welcome page shows once, stamped on the employee.
6. The phone preview's "then" line names the wizard's real steps.
7. Each feature switch says what it hides in the crew app's own terms.
8. The note field gets a length limit; the video replace deletes the previous file.
9. YouTube option dropped (Josh: upload only). The crew side is written in as §4 so the two chats build to one shape in one round.

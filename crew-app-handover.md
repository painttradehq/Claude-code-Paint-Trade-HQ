# Crew app — handover pack for the new chat

Written 11 October 2026 in the admin/web chat, for the chat that will build the crew (employee) app. It holds everything that chat needs to start without re-deriving it: what exists, what is web-only, what the earlier specs parked "for the employee-app work", what Josh has to decide, and the order to build in.

**Where the facts come from.** The app code at commit `7139b03` (4 October 2026, Round 64 state) in `painttradehq/the-newest-update-of-pthq`, the specs under `memory/specs/`, the lawyer pack (`lawyer/` in the deliverables repo) and this chat's log (`round11-results.md`). Rounds 65–73 and follow-ups A/B since then changed admin pages only, except the logo round, which replaced the icons. **First job of the new chat: press Save to GitHub in Emergent (Josh), clone the current code and re-check §2–§4 against it before designing anything.** Anything below that the current code contradicts, the current code wins.

**Decision this pack is built on (Josh, 11 Oct):** crew side first. The admin side is too big to fit on a phone as it is; that is a separate, later conversation.

---

## 1. Rules that carry over from the web chat

Same rules, same owner. The new chat follows them from its first message.

1. Nothing goes to Emergent without Josh's "send". Answering Emergent's housekeeping questions inside a round is fine.
2. One round at a time. **Both chats send to the same Emergent job**, so this means one round at a time *across both chats*. Josh alternates; a crew round never goes while an admin round is still building, and the other way round.
3. Every screen is prototyped here first (self-contained HTML), Josh reviews it, then the spec goes. For the crew app the prototype is a phone frame: verify with Playwright at **390 × 844** first, then **360 × 800**. No desktop widths unless a screen is also used on a laptop.
4. Simple and practical. No notices, no banners, no duplication, no guess work in specs: say "keep as built" or name the exact value.
5. AI = Claude only, through the app's own key. **The crew app has no AI at all** (data map §5: "Crew: … No AI"). No Lucy for crew.
6. Isolation per business on every new route; tenant tests extended; `TS_` test rows only, torn down; the owner's real tenant read-only in rounds.
7. Do not change anything beyond what was asked. **The crew chat never touches `app/admin/*`, the admin shell or admin routes; the admin chat never touches `app/employee/*`.** If a crew round needs an admin-side change (a setting, a flag), the crew chat writes the exact change into its spec and Josh sends it as part of that round.
8. Never paste or echo secrets. Key values appeared in the Emergent chat earlier; they are never repeated anywhere.
9. Every round message carries a What's new draft written for the owner ("Your crew now …"). Emergent creates a Draft, never publishes.
10. No backfill. Help hub is reserved for Adam.
11. Round messages end with "Round N done" and stop; Emergent reports agent-tested vs Unverified per §8 item, then the testing-agent pass, backend changes, env changes, deleted files, removed routes.

Round numbering: crew rounds are **C1, C2, …** so they never collide with the admin rounds (which are at 73 plus follow-ups).

---

## 2. What the crew app is today

### 2.1 One codebase, one deployment

- The crew app is **not a separate app**. It is the `/employee/*` part of the same Expo project (`frontend/`, expo-router) that serves the admin web app, against the same FastAPI backend and the same Emergent preview. There has never been a native build: **no `eas.json`**, `frontend/README.md` is the Expo default.
- Expo SDK **54.0.35**, React Native **0.81.5**, expo-router **6.0.24**, new architecture on, typed routes on.
- Emergent job `b55b8df9-f0c5-41c7-80d1-f174b2874432`, slug `pthq-replica`.
- The public landing page `app/index.tsx` is the crew's front door: a QR code to `/employee/onboarding?admin=<admin id>&code=<invite code>`, an "Employee Login" tile, and a redirect for a signed-in user by role (admin → `/admin/dashboard`, employee → `/employee/dashboard`). In the Round 64 clone the hero still carries a "Powered by OpenAI" pill; check whether a later round removed it, and if not it goes in C1.

### 2.2 The 16 screens (`frontend/app/employee/`)

| Route | File · lines | What it does today | API calls |
|---|---|---|---|
| `/employee/login` | `login.tsx` · 147 | Email + password. A red-flagged employee gets 403 "Account access temporarily restricted. Please contact admin." | `POST /employees/login` (body field is named `username`, holds the email) |
| `/employee/onboarding` | `onboarding.tsx` · 1175 | Wizard: name, date of birth, phone, email, address, emergency contact, licences/qualifications with uploads (expo-document-picker; camera or library via expo-image-picker), profile photo, password. **Registers only with a valid `admin_id` + active invite `code`** (collection `qr_codes`, kind `invite`); otherwise rejected. **Sets `agreed_to_terms` true automatically; the crew member is never shown the Terms or Privacy Policy** (lawyer pack 04 §5). | `POST /employees/register?admin_id=&code=` |
| `/employee/dashboard` | `dashboard.tsx` · 318 | Tile grid: Contracts, Daily report, Feedback, Notifications (bell), Profile, Request equipment, Coaching (`strike-system`), Team events, Training. Sign out → `/`. Shows an "accomplishment" popup from an unread notification and marks it read. | `GET /notifications/{me}`, `PUT /notifications/{id}/read` |
| `/employee/time-clock` | `time-clock.tsx` · 557 | Sign in / sign out with GPS. Status polled every 60 s while signed in. Location comes from the **browser** `navigator.geolocation` and the address line from a direct call to `nominatim.openstreetmap.org` from the phone. The sign-in sends `{ project_name: <free text or "General">, location: {latitude, longitude, accuracy, address} }`. **No `project_id` is sent**, so the backend geofence never runs for a crew sign-in today (see §2.3). | `GET /timeclock/status`, `GET /timeclock/my-records?limit=10`, `POST /timeclock/sign-in`, `POST /timeclock/sign-out` |
| `/employee/daily-report` | `daily-report.tsx` · 198 | Crew end-of-day report with photos (image picker → `fetch(asset.uri)` → upload). Admin feedback creates a notification linking to `/employee/daily-report?report={id}`; push is **not** sent (`routes/daily_reports.py:502`: "the crew app has no push-token registration yet, so there is nothing to send to; in-app only"). The daily-reports spec left this form "untouched; it comes with the employee-app work". | `POST /daily-reports`, `GET /daily-reports/my-reports` |
| `/employee/team-events` | `team-events.tsx` · 463 | Events list and RSVP; team list. | `GET /events`, `POST /events/{id}/rsvp/{me}`, `GET /employees` |
| `/employee/training` | `training.tsx` · 329 | Collections, videos, required-for-new-starters first, Save to my list, mark watched. On web a YouTube iframe listens to `window` `message` events for the player state; on native it opens YouTube with `Linking.openURL`. Reads the Round 18 fields. | `GET /training-collections`, `GET /training-videos`, `GET /training-progress/{me}`, `POST /training-videos/{id}/save`, `POST /training-progress/{me}/complete-video` |
| `/employee/contracts` | `contracts.tsx` · 773 | Round 22 crew side: list of issued documents, read with unfilled `[FIELDS]` highlighted (never blanked), sign by drawing or typing, ask a question, download the signed copy (web: blob download; native: an alert saying it was emailed). | `GET /employee-contracts/mine`, `POST …/{id}/viewed`, `POST …/{id}/question`, `PUT …/{id}/sign`, `GET …/{id}/my-pdf` |
| `/employee/request-equipment` | `request-equipment.tsx` · 967 | My equipment (Round 20 `my-items` route: name, tag, condition, since, next check), request form, my requests with outcome. The crew "problems with this item" flow and photo of damage were parked for the employee-app work (equipment spec §6). | `GET /equipment`, `GET /equipment/my-items`, `GET /equipment/requests/my-requests`, `POST /equipment/requests`, `DELETE /equipment/requests/{id}` |
| `/employee/notifications` | `notifications.tsx` · 317 | List, read, read all; type `validation` opens My validations. | `GET /notifications/{me}?recipient_type=employee`, `PUT /notifications/{id}/read`, `PUT /notifications/{me}/read-all?recipient_type=employee` |
| `/employee/profile` | `profile.tsx` · 562 | Own details, documents and photo (document + image pickers). | `GET/PUT /employees/{me}` |
| `/employee/feedback` | `feedback.tsx` · 343 | Crew → owner feedback and the replies. Routes live in `server.py`, not in a `routes/` module. | `GET /feedback/employee/{me}`, `POST /feedback` |
| `/employee/my-validations` | `my-validations.tsx` · 376 | Performance validations the owner recorded. | `GET /validations/my` (`routes/performance.py`) |
| `/employee/strike-system` | `strike-system.tsx` · 50 | **"Coaching"** (route name kept, employees spec §5.4): shared coaching notes, type label, topic, what good looks like, linked video, **Got it** sets `acknowledged_at`. Never the word strike, no counts. | `GET /employees/{me}` (reads `strikes` with `shared !== false`), `PUT /employees/{me}/strikes/{id}`, `GET /training-videos` |
| `/employee/project/[id]` | `project/[id].tsx` · 19 | Round 14 §3 crew view of a job's photos (`ProjectPhotos` with the `crew` prop: add photos, no delete, no pairing). In the clone nothing in the crew screens links to it; URL only. | `GET /projects/{id}/photos`, `GET /estimates/{id}` |
| `/` | `app/index.tsx` | Landing: QR to onboarding (built from the signed-in admin's id), Employee Login, role redirect. | none |

6,594 lines in total. Test ids already used on the crew side: `employee-*`, `coaching-*`, `crew-contract-*`, `cta-onboard`. Keep that style.

### 2.3 Auth, tenancy, backend

- JWT with `role: "employee"`, `sub` = employee id (`routes/employees.py` `employee_login`). `backend/auth.py` has `get_current_employee` (403 unless role is employee) and `verify_employee_access` (admin: any employee; employee: self only).
- Routes that use the employee dependency: `routes/contracts.py` (6), `routes/equipment.py` (5), `routes/timeclock.py` (4), `routes/daily_reports.py` (4), `routes/performance.py` (2). The older crew routes in `server.py` (events, RSVP, feedback, notifications) and `routes/employees.py` check inside each handler. **Before a crew round adds or widens a route, audit the handler it touches for the business check**; the isolation tests to extend are `test_tenant_isolation.py`, `test_employees_security.py`, `test_equipment_p3_security.py`, `test_r43_isolation_and_rate_limit.py`.
- Employee ↔ business: `owner_admin_id` on the employee record. Registration needs `admin_id` + an active invite `code`; an admin can also create employees directly (same file, line 82 sets `owner_admin_id` from the signed-in admin).
- Geofence (`routes/timeclock.py` 85–165): runs **only when `project_id` is set**; per-project `geofence_radius_m` wins (explicit `null` = no geofence for that job), else the admin's `gps_radius_m`; stamps `outside_radius` and `distance_from_site_m`; never blocks the sign-in. Because the crew screen sends no `project_id`, the admin's off-site flag never fires from a crew sign-in today. Fixing that needs a job picker on the crew clock (C2).
- Token storage: AsyncStorage keys `authToken`, `userRole`, `userId`, `userData` (`store/authStore.ts`); `utils/api.ts` adds the bearer header.
- **Backend URL** (`utils/api.ts`): on web it is the page's own origin (`/api` proxied by the platform); on iOS/Android it is `EXPO_PUBLIC_BACKEND_URL`. A native build therefore needs the stable API domain before it can talk to anything.

### 2.4 Project configuration (`frontend/app.json`)

| Key | Value today | Note |
|---|---|---|
| `name` / `slug` | "For Painters" / `for-painters` | Store-facing name; Josh decides (§6) |
| `version` / Android `versionCode` | 1.0.0 / 1 | |
| `scheme` | `jscrew` | Deep-link scheme; rename with the name |
| iOS `bundleIdentifier` / Android `package` | `com.sanopaint.crew` | **Sano-specific.** Cannot be changed after the first store upload. Decide before any build (§6). |
| `orientation` | portrait | keep |
| iOS `supportsTablet` | true | design for phones; tablets only if Josh wants them |
| iOS `infoPlist` | `NSPhotoLibraryUsageDescription` only | Missing: location when-in-use, camera |
| Android `permissions` | `READ_MEDIA_IMAGES` only | Missing: fine location, camera, post notifications |
| `plugins` | expo-router, expo-splash-screen (image 200 px, black background), expo-web-browser, expo-font | add expo-location, expo-notifications when used |
| `web.output` | static | the Emergent preview runs the dev server; the deploy builds static |
| icon / adaptive icon / splash | `assets/images/*.png` dated 6 Oct in the clone | the "A new mark" round came after; check they are the extended-P mark now |

Installed Expo modules the crew screens can use natively without adding anything: `expo-location 19.0.8`, `expo-image-picker 17.0.11`, `expo-document-picker 14.0.7`, `expo-file-system 19.0.23`, `expo-sharing 14.0.7`, `expo-linking 8.0.12`, `async-storage 2.2.0`. **Not installed:** `expo-notifications`, `expo-camera`, `expo-device`.

PWA pieces that exist: `public/manifest.webmanifest` is **admin-only** (`id` and `start_url` `/admin/dashboard`, admin shortcuts, theme `#4B3E86`, icons `/icons/logo-192|512.png`); `public/sw.js` caches the shell + `offline.html` (cache name `pthq-shell-v1` in the clone, `v2` in the current build, network-first). A crew install needs its own manifest or a crew `start_url`. The public `/privacy` and `/terms` pages exist, which the stores require.

### 2.5 Look and feel

- 14 of 14 crew screens import `utils/colors.ts`; none use `theme/tokens.ts` (Fraunces, accent `#4B3E86`, background `#FAF9F6`) that every admin page uses now. `Colors` is a proxy that reads the mode from **`localStorage` at module load** (a web call to guard on native). Dark is the default: black `#000000` canvas, coral `#FF4D4D` accent, blue `#5B9EFF`, white text, `StatusBar style="light"`. The light palette already maps to the new brand (`primary #4B3E86`, `background #FAF9F6`, `text #1E1C1A`, accent `#B4472A`).
- So the crew app still looks like the original black-and-coral app while the admin side has the Paint Trade HQ look. Whether to restyle is decision §6.2; the recommendation is yes.

---

## 3. Web-only code that has to change for a native build

Everything below works in a phone browser today and breaks or degrades in a store build. Each item names the replacement; the module is already installed unless marked **add**.

| Where | Today | Native replacement |
|---|---|---|
| `time-clock.tsx:66` | `navigator.geolocation.getCurrentPosition` | `expo-location`: `requestForegroundPermissionsAsync` + `getCurrentPositionAsync({ accuracy: High })`. Same `{latitude, longitude, accuracy}` payload. Add the iOS/Android permission strings (§2.4). Location only at sign-in and sign-out, never in the background (that is what the Privacy Policy and data map say). |
| `time-clock.tsx:72` | Reverse geocoding by calling `nominatim.openstreetmap.org` from the phone | Drop the external call. Either show the job's own address (once a job is picked, C2) or add a small backend route that geocodes with the Open-Meteo geocoder the app already uses, so no third party is called from the device. |
| `time-clock.tsx:142` | `project_name` free text | A **job picker** (today's assigned jobs of this business) sending `project_id`, so the geofence runs and the admin's off-site flag works. Keep "General" for no job. |
| `contracts.tsx:154` | `URL.createObjectURL` + `<a download>` on web; alert "emailed to you" on native | `expo-file-system` write to the cache directory + `expo-sharing.shareAsync` (iOS share sheet / Android intent). |
| `onboarding.tsx:64` | `URL.createObjectURL(file)` for the document preview | Use the picker's `uri` directly (the picker branch already has it). |
| `training.tsx:53–55, 175–180` | YouTube `iframe` + `window.addEventListener('message')` for watched state; native opens YouTube externally and cannot mark the video watched | Either keep "open on YouTube" plus a manual **Mark as watched** button on native, or embed with `react-native-webview` (**add**) and the same postMessage listener. Decide in the training round (C6). |
| `utils/colors.ts` (module load) | `localStorage` read for the theme mode | Guard `typeof localStorage !== 'undefined'`; on native read `Appearance` or AsyncStorage. (If the crew app is restyled onto `theme/tokens.ts`, this goes away for crew screens.) |
| `app/index.tsx` | Web landing page with QR code | Native build opens straight at login (or dashboard when a token is stored); the QR stays a web page the owner prints. |
| Push | **No push-token registration anywhere** (frontend or backend). Contracts, equipment and daily-report feedback "notify the crew app" = a row in `notifications` that the phone sees when it opens the screen. | `expo-notifications` (**add**) + `expo-device` (**add**): register the Expo push token, `POST /api/employees/me/push-token` (new route, employee JWT, stores `{token, platform, updated_at}` on the employee), a backend helper `push_to_employee(employee_id, title, body, link)` that posts to the Expo push service, called from the three places that already insert a notification. Web (PWA) push is a separate, later step. |
| Session | `AsyncStorage` token, 30 s request timeout | Fine as is. Add "signed out everywhere" handling for a 401 (today the admin shell handles it; check the crew path). |

Files uploaded today as base64 / blobs (`fetch(asset.uri)` then upload) work on native with the picker URIs; keep the 15 MB per file cap from onboarding.

---

## 4. Work the earlier specs parked "for the employee-app work"

These are commitments already written into specs that the crew chat inherits.

1. **Daily report, crew form** (`daily-reports-notes.md`): the admin page was redesigned in Round 19; the crew form was left as is and promised to the employee-app work. Scope: today's job preselected, hours, what was done, photos (before/after, pin notes reuse `ProjectPhotos`), issues/blockers, the owner's feedback shown under the report with the `Replied` state.
2. **Equipment, crew side** (`equipment-notes.md` §6): "problems with this item" with a photo of the damage, My equipment reads `my-items`, requests keep their routes.
3. **Push** for contract issued/countersigned, equipment request outcome, daily-report feedback (the three existing in-app notifications), as described in §3.
4. **Time clock job picker** so the geofence works (§2.3, §3).
5. **Timesheets**: an admin edit that sets the sign-out of an open session must show as signed out on the crew clock (timesheets spec, line "the crew app then shows signed out") — the 60 s status poll covers it; keep it.
6. **Legal** (lawyer pack 04 §5 and the Privacy Policy): onboarding must **show** Terms and Privacy with a tick box instead of setting `agreed_to_terms` silently; say on the clock screen that location is recorded only at sign-in and sign-out; crew can be 15 or older (15–17 with the employer holding guardian consent); staff documents and signatures are private, never a public link. If the lawyer's returned text changes any of this, the crew chat gets the new text from the admin chat.
7. **Store rules that create product work**, when and if a store build is chosen: Apple (App Store Review Guideline 5.1.1) and Google Play (account deletion policy) both require an in-app way to **delete the account** for apps that let people create one. Crew records belong to the employer and signed documents are kept 7 years, so this becomes a "Request removal" flow (crew asks; the employer ends employment; personal data beyond the retained records is deleted by the 30-day purge). This needs the lawyer's view before C8.
8. **Coaching** screen is finished (employees spec §5.4) and **contracts** crew side is finished (Round 22): restyle only, no behaviour changes, unless Josh asks.

---

## 5. Prerequisites outside the code (Josh's side)

Needed before the **first crew round** can be built against current code:

- **Save to GitHub** in Emergent. Rounds 65–73 and follow-ups A/B are unsaved; the new chat cannot read current code until this is done.

Needed before a **native store build** (C8), not before the design rounds:

- **Stable API domain** (`app.painttradehq.com.au` was the plan) with production secrets, Redeploy and the deploy check. Native builds read `EXPO_PUBLIC_BACKEND_URL`; a preview URL that changes is not usable.
- **Apple Developer Program** (organisation enrolment, needs the business's D-U-N-S number; US$99 a year) and **Google Play Console** (one-off US$25) in the business's name. Allow two to four weeks for Apple's organisation verification.
- An **Expo account** for EAS Build (free tier builds in a queue; paid tiers skip it). `eas.json` with `development`, `preview`, `production` profiles comes in C8.
- The **bundle id / package name** decision (§6.4) made before the first upload.
- Store listing material: name, subtitle, description, screenshots (6.7″ and 6.1″ iPhone, Android phone), privacy nutrition labels (location, photos, contact info, identifiers), support URL, privacy URL (`/privacy` exists).
- **Resend** domain for the business's own sending domain is already on Josh's list; crew emails (signed-copy PDFs) go through it.

Not needed for crew: Google/Microsoft OAuth, Xero, Twilio. Crew have no connected services.

---

## 6. Decisions for Josh (before C1)

Each has a recommendation so the new chat can move; Josh overrides any of them in one line.

1. **Ship path.** (a) Installable web app first: a crew `start_url` + manifest, "Add to Home Screen" instructions, works on every phone today, no store accounts or review, updates instantly with the web deploy; web push works on Android and on iOS 16.4+ only when installed. (b) Native store apps via EAS Build: store presence, reliable push, camera/location permissions handled natively; needs §5. **Recommendation: (a) now, (b) when the domain and store accounts exist.** The design rounds are identical for both, so nothing is wasted.
2. **Restyle to the new brand.** The crew screens are still black and coral. **Recommendation: yes**, onto `theme/tokens.ts` (light, Fraunces headings, `#4B3E86`), done screen by screen inside each round rather than as one big restyle round, so every round ships something a crew member sees.
3. **Navigation.** Today: a tile dashboard with nine tiles and a back arrow on each screen. **Recommendation: a bottom tab bar** — Today (clock + today's job + notes), Jobs (photos, daily report), Docs (contracts, profile, equipment), Learn (training, coaching), More (events, feedback, notifications, sign out). Prototyped in C1; Josh picks the five tabs.
4. **Name, bundle id, scheme.** Today "For Painters", `com.sanopaint.crew`, `jscrew`. Suggested: "Paint Trade HQ Crew", `au.com.painttradehq.crew`, scheme `pthqcrew`. The bundle id is permanent once uploaded.
5. **Account removal** (§4.7): confirm with the lawyer what a crew member may delete and what the employer must keep.
6. **Language.** English only, or a second language for the crew screens? (Affects every string from C1.)
7. **Tablets.** Phone only for the design rounds (recommended), or also 768 px.
8. **Pay and hours.** Should crew see their own timesheet totals on the phone (the admin Timesheets "My hours" tab exists for admins only today)? Not in any spec; yes/no.
9. **The job view (added 11 Oct after Josh reviewed C1).** This is the heart of the crew's day and the first version of this pack only gave it one line under C4. Crew cannot see any job today: there is no crew-side read of projects or estimates, only the admin-side `assigned_employee_ids` on a job (Round 40). The crew chat needs Josh's answer to **what a crew member may see of a job they are assigned to**, before it designs the Jobs tab. The business holds all of this already; the question is only what to show. Suggested split, for Josh to edit:
   - **Show:** the job name and address with a map link; start and finish dates; the scope per area as the estimate describes it (the areas, the work lines with their quantities and coats, the products and colours chosen); site and access notes the owner writes for the crew; the job photos (before/after, pin notes, the crew can add); the daily reports for that job; approved variations as "added work"; who else is on the job.
   - **Decide:** the client's name and phone (useful on site, personal data), the client's notes from the CRM, the estimate's "on paper" wording.
   - **Never:** prices, margins, discounts, payment status, invoices, the client's email and message history, Lucy.
   Also a **"Portfolio"**: a crew member's own list of the jobs they worked on, with the photos, is what the current `app.json` photo-permission text already promises ("Attach job photos to your project portfolio"). Josh to say whether that is wanted and whether it is per person or per business.
   **Build order change:** the job view is round **C2**, straight after the shell; the time clock moves to **C3** and reuses the job list for its picker; the daily report becomes **C4**. Backend for the job round: a crew-only read route (employee JWT, jobs of the crew member's business where `assigned_employee_ids` contains them) that returns only the fields in the "Show" list and the "Decide" items Josh approves, with an isolation test that a crew member of another business gets nothing.

---

## 7. Suggested round order

Each round: phone-frame prototype (390 × 844, also checked at 360 × 800) → Josh reviews → spec notes with a reuse table, verify list, tests, What's new draft → "send" → Emergent builds → testing agent at 390 and 360 → "Round CN done".

| Round | Scope | Notes |
|---|---|---|
| **C1** | Crew shell: sign-in, bottom tabs (or the chosen navigation), Today screen (clock status, today's job, unread notifications), brand restyle of these screens, remove the "Powered by OpenAI" pill if still there, `localStorage` guard | Sets the pattern every later round reuses |
| **C2** | **Jobs** (moved up 11 Oct, see §6.9): my jobs list (today, upcoming, done), the job page with the "Show" list, photos (`project/[id]` reused), the crew-only read route with its isolation test | The heart of the crew's day; everything else hangs off the job |
| **C3** | Time clock: job picker from the C2 list → `project_id`, `expo-location`, off-site warning shown to the crew, no nominatim, location wording | Makes the admin geofence flag real |
| **C4** | Daily report (crew form) with photos and the owner's feedback thread, opened from the job | Parked since Round 19 |
| **C5** | Documents: onboarding (Terms/Privacy tick, pickers), profile, contracts (native PDF share) | Legal items from §4.6 |
| **C6** | Learn and gear: training (watched state on native), coaching restyle, equipment with "problem with this item" + damage photo | Equipment spec §6 debt |
| **C7** | Notifications and push: token route, `expo-notifications`, the three existing triggers, web push for the installed PWA if (a) was chosen | Backend helper shared by all three |
| **C8** | Store readiness: `eas.json`, bundle ids, permission strings, icons/splash check, account-removal flow, listing material, TestFlight / internal testing track | Only after §5 |

Admin-side changes a crew round may need (an owner setting, a project field) are written into that crew round's spec; Josh sends them together.

---

## 8. How the new chat starts

Paste this as the first message of the new chat, with this file attached:

> Crew app chat for Paint Trade HQ. Read `crew-app-handover.md` and follow §1. First: I have pressed Save to GitHub; clone `painttradehq/the-newest-update-of-pthq`, re-check §2–§4 against the current code and tell me what changed. Then propose C1 as a phone prototype. Nothing goes to Emergent without my "send".

Places and tools the new chat uses:

- App code: `https://github.com/painttradehq/the-newest-update-of-pthq` (read-only; Emergent writes it on Save to GitHub).
- Deliverables repo: `painttradehq/claude-code-paint-trade-hq`, branch `claude/build-request-xufpxo` holds this file, the admin prototypes and `round11-results.md` (the running log). The crew chat gets its own branch and its own log file; it does not edit the admin files.
- Emergent: job `b55b8df9-f0c5-41c7-80d1-f174b2874432` (`pthq-replica`); tools `get_job_status`, `send_message`, `get_recent_trajectories`; the MCP servers drop often, re-run ToolSearch.
- Google Drive (software@joshsano.com.au): "Legal review pack" and "Logo — extended P (Oct 2026)" folders at the top of My Drive. The logo masters for icons and splash are there (`pthq-tile.svg`, `pthq-mark.svg`, PNG tiles).
- Playwright: `NODE_PATH=$(npm root -g) node tools/<test>.js` with `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`, viewport `{ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }`, then 360 × 800.
- Prototype toolkit: Python generators that patch a base HTML with `rep(a, b, count)` exact-count replacements and assert the count; the crew chat starts a new base (phone frame) rather than patching the admin pages.

---

## 9. What the admin chat keeps doing meanwhile

Round 72 (GST-inclusive pricing), the contracts-retention decision, the lawyer's returned text (re-run of Round 66), the 30-day purge (A12), in-app learning (A13), the full retest (A14), the deck (A15), the E-list, and Josh's platform steps (production secrets, Redeploy, publish the five What's new drafts, Xero developer app, Google OAuth redirect URIs on the real domain, Resend domain). None of it touches `app/employee/*`.

If a crew round and an admin round both need the same file (likely: `utils/colors.ts`, `theme/tokens.ts`, `routes/employees.py`, `backend/auth.py`), the chat that is not building waits; Josh says which goes first.

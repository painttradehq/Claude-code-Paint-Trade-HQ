# Round 85 — Speed fixes: the six from the research, in order (25 October) — BUILT 25 Oct (report `memory/reports/round85-speed-fixes-report.md`; trips on the preview: dashboard 60–64 → 10 in 3 waves, profile 10 → 2 with no data: string, projects 12 → 3, unseen 5 → 1, overview 4 → 2 carrying plans, unread 3 → 1, 0 auth trips warm; shell 5 calls in + 5 after first paint; SW cache-first; ten indexes with IXSCAN; payload equality proven; `test_r85_speed_fixes.py` 20/20; suite 889 passed / 113 skipped in four chunks, only the two known order-dependent daily-report tests failing; tsc clean; draft n 25. Not done: nothing renders the owner signature today, so that check had nothing to verify; the cold-brief re-fetch reuses `/dashboard/home`.) **Waits for publish → Josh's Storage-card dry run + Apply (brand files) → the Speed check numbers.**

Backend and admin-frontend round; **no prototype** (nothing changes on screen; pages arrive sooner). Built on Round 84's measurements (`speed-research-notes.md` §6 and Emergent's report `memory/reports/round84-speed-research-report.md`) and the Round 77 blueprint (`dashboard-diet-notes.md`), which this round supersedes. Nothing under `app/employee/*`. The owner's real tenant is read-only; the only sanctioned write on it is the logo/signature move, which Josh triggers himself from the Storage card (§2.2).

**The numbers to beat (production, 24 h logs):** `GET /api/dashboard/home` p50 **18.3 s** (60–64 sequential trips × 250 ms); `/api/admin/profile` 1.2 MB and 10 trips (p50 1.2 s); `/api/billing/overview` 4 trips (0.8 s); the shell fires 13 calls on a cold load with two duplicates; every call pays one uncached revocation trip. **Target after this round, with the database still in Oregon:** dashboard home ≤ 6 trip-waves ≈ **1.5–2 s**; profile ≤ 3 trips and ≤ 20 kB; the shell's on-load calls down to the ones the first paint needs; the per-call floor one trip lower. (Moving the database to the app's region, support's Option 1, is Josh's ticket and multiplies all of this; it is not in this round.)

## 1. The trip counter is the ruler

Round 84's `Server-Timing: trips=N` and the stage names stay. Every item below states a **trip budget**; the report shows before and after trips and ms per route on the preview from the counter, and Josh reads the production figures from the Speed check card after the publish.

## 2. The fixes, in order

### 2.1 Dashboard home: read once, in waves (fix 1 — the 18 s)
`services/dashboard_home.py` as `dashboard-diet-notes.md` §1 specifies, updated by the Round 84 stage data:
- **Wave 1, one `asyncio.gather`**: `admin_settings` once (feeding `tz_for`, `now_for`, calendar, ai, business location — today read several times), estimates, invoices, projects, employees, admins, this week's events, reminders, timeclock (closed this week + open), briefing headlines (today + previous), ai_jobs, equipment requests, employee contracts, lucy_ideas, leads, messages (unread) — each **once**, with the Round 75 projections. Everything downstream receives these lists: `entries_for_range(aid, m0, s6, *, preloaded=…)` gains optional keyword arguments and skips its own reads when given; `brief_v2`, `map_payload`, `activity_rows`, `brief_state`, `_owner_first_name`, `deposit_invoices_for` take what they need from the lists. Callers that pass nothing behave as today.
- **Calendar fan-out once**: the week's entries computed once; `brief_v2` filters today from the week's list instead of calling `entries_for_range` again. Connected external calendars (Google, Outlook, CalDAV) come from a per-tenant 5-minute cache; a cold cache returns the internal entries and refreshes in the background.
- **Map in one query**: `resolve_job_point`'s fallback reads the needed estimates with one `$in` from the loaded list.
- **Nothing external on the request path**: weather from the 30-minute cache or `null` with a background fill; **the AI morning brief is never generated inside the request** — today it is (9.6 s on a cold day for a tenant with the brief on): if today's headline is not stored, return `brief: {on: true, pending: true, lines: []}` and leave generation to the existing `ai_morning_briefings` cron (:00/:15/:30/:45), which writes it; the dashboard's `brief.pending` handling is §3.
- **Wave 2**: `brief_v2`, `map_payload`, `activity_rows` together; `brief_state` and `_owner_first_name` need nothing further. Three awaited stages in all.
- **Budget: ≤ 12 trips** per call (all in wave 1 except the two counts that need no lists), zero awaited external calls. The payload keeps its shape and values; the only new field is `brief.pending`.

### 2.2 The profile: logo and signature as files, a projection on the route (fix 2 — 1.2 MB on every page)
- `utils/image_upload.persist_image` loses the base64 fallback for the business logo and the owner signature (and any other caller): when no bucket is configured the bytes go to the blob store (`services/blobs.py`, as Round 75 did for photos) and the field holds `/api/blobs/{id}`; `kind: "brand"`, `owner_admin_id`, served by `GET /api/blobs/{id}` under the Round 75 safety conditions (image/* only, nosniff, inline, by id, rate-limited). The public quote page, the PDFs, the contracts and the emails already render whatever URL the field holds.
- **Move the ones already stored as text**: extend the Round 75b `POST /api/platform/maintenance/move-media` to `admin_settings.business_profile.logo_url` and `signature_url` (collection `admin_settings`, keys `business_profile.logo_url`, `business_profile.signature_url`), dry run and apply exactly as 75b (token, `confirm: "MOVE"`, audit row, idempotent, SHA-256 dedupe). The Storage card's dry run lists them per business ("Sano Paint · logo 612 kB, signature 590 kB as text"). **Josh runs dry run → Apply on the live app** after the publish; the round itself applies only on TS_ tenants.
- `GET /api/admin/profile` returns a projection that excludes nothing the screens use but never a `data:` string (after the move there is none; before it, the two fields are replaced by a short placeholder URL that the Business page still shows as "uploaded — moving to files" — only if a `data:` value is found). Trips: the route makes 10 today — gather the settings doc, the admin doc, `next_invoice_seq`, `last_used…` and the rest into one wave; **budget ≤ 3 trips**, ≤ 20 kB without the images.

### 2.3 One trip less on every call (fix 3)
- `services/principal.py`: the revocation check (`is_jti_revoked`) gets a per-jti cache, **TTL 10 s** (Josh's call, §6.1), invalidated at once in the process that handles a sign-out or "sign out other devices"; the other pod catches up within the TTL. Result: a warm authenticated request makes **0 auth trips** (principal cached 30 s, revocation cached 10 s), a cold one 1–2.
- `PlanFeatureGate` reads the plan fields from `request.state.principal`'s admin doc instead of its own `admins.find_one` (the principal cache already holds the doc; the Round 76 invalidation on billing writes covers it).
- One Motor client: `server.py`'s second client goes; everything uses `database.py`'s (same settings, one pool).

### 2.4 The shell: fewer calls on the way in (fix 4)
- `dashboard/home` and `legal/status` fire **once** per load: find the remount after `access.load()` resolves and stop it (or dedupe in the store as Round 76 did for the profile: an in-flight promise shared by callers).
- `billing/plans` folds into `billing/overview` (the overview response carries `plans` for the pills and the Billing page; the separate route stays for the page's refresh).
- After first paint only (Round 76 rule): `updates/unseen`, `version`, `feedback/unread`, `platform/feedback/unread`, `billing/me`; none on the sign-in pages; polls no faster than every 120 s and paused while the tab is hidden; `billing/me` on tab focus no more than once a minute.
- Trip budgets for the routes the shell and the list pages call on load: `/admin/profile` ≤ 3 (§2.2), `/projects` ≤ 4 (today 12), `/updates/unseen` ≤ 2 (today 5), `/billing/overview` ≤ 2 (today 4: the two `seat_counts` into one aggregation), `/feedback/unread` ≤ 1, `/legal/status` 1. Same response shapes.

### 2.5 Service worker: cache-first for hashed assets (fix 5)
`frontend/public/sw.js`: cache-first for `/_expo/static/*`, fonts, icons and any file whose name carries a content hash; network-first for HTML and `/api/*`; a versioned cache name with old caches deleted on activate; nothing cached for `/api/`. On a plain reload the fonts come from the cache (≈ 900 kB, 0.5–0.9 s saved); a new deploy still shows the new bundle because the HTML is network-first and the asset names change.

### 2.6 Tenant indexes on the newer collections (fix 6)
`services/indexes.py` gains, `background=True`, nothing unique: timeclock, messages, ai_audit_log, notifications, updates, employee_sessions, daily_reports, leads, reminders, events — each on its tenant key (`owner_admin_id`, or the key the collection actually filters by; `employee_sessions` by `employee_id` and the tenant key) plus the date field the dashboard and lists sort by where one exists. The report lists the ten index specs.

### 2.7 Not in this round
Two uvicorn workers (measure after the above; the 1 vCPU limit may make it worse); the database move (support); the photo/video move for estimates (Josh's Storage card); nothing in the crew app; no change to what any screen shows.

## 3. Frontend touches (admin only)
- `app/admin/dashboard.tsx`: `brief.pending === true` → the brief card's existing loading state and one re-fetch of the brief after 5 s through the route the Regenerate button reads; `weather === null` → the card's existing "no location yet" state. Nothing else on the dashboard changes.
- The shell changes of §2.4 (`app/admin/_layout.tsx`, the access/profile stores, the sidebar pills reading `plans` from the overview).
- `public/sw.js` (§2.5).

## 4. Verify (testing agent, 1440 then 1024, TS_ tenants; the owner's tenant timings only)
1. **Payload equality**: a seeded TS_ tenant with quotes in every status, two invoices, two live jobs with suburbs, three crew (one on site), a reminder today, an event this week, a lead, an unread reply — the dashboard JSON before and after this round is identical field by field except `brief.pending`; the cards, strip, activity rows, map pins and greeting match on screen.
2. **Trips**: from `Server-Timing` on the preview, before → after: `dashboard/home` 60 → ≤ 12; `admin/profile` 10 → ≤ 3; `projects` 12 → ≤ 4; `updates/unseen` 5 → ≤ 2; `billing/overview` 4 → ≤ 2; a warm authenticated call to `/version`-class routes shows `trips=0` for auth. The table goes in the report.
3. **Cold brief**: a tenant with the brief on and no headline today → the first load returns at once with `pending`; the card shows loading; the cron writes the brief; the re-fetch shows it; no duplicate write when two loads race.
4. **Sign-out**: "sign out other devices" on device A → device B is refused on its next request in the same process at once, and within 10 s otherwise (test with the TTL forced to 1 s and a wait).
5. **Profile**: a TS_ tenant with a logo and signature uploaded with no bucket → both land as blobs, `/admin/profile` carries their `/api/blobs/` URLs and no `data:` string, the Business page shows them, the quote PDF and the public quote show the logo, a contract shows the signature; the move-media dry run and apply on a TS_ tenant seeded with `data:` values convert both and are idempotent; the Storage card's dry run lines name them.
6. **Shell**: on a cold dashboard load the request list shows `dashboard/home` once, `legal/status` once, no `billing/plans`; `updates/unseen`, `version`, the two `unread` and `billing/me` only after first paint; polls paused with the tab hidden.
7. **Service worker**: plain reload after a first visit → fonts and the hashed bundle chunks from the SW cache (0 ms-class), HTML and `/api/*` from the network; after a new deploy the new bundle shows.
8. **Indexes** exist after a restart (`index_information()`); `explain` on the dashboard's messages/leads/reminders/timeclock queries shows an index scan.
9. Suite before and after; `tsc` clean; 1024: no horizontal scroll; no console errors; nothing under `app/employee/*` changed.

## 5. Tests
`backend/tests/test_r85_speed_fixes.py`: trip budgets per route from the counter; payload equality on the seeded tenant; `brief.pending` and the single write; revocation TTL behaviour; profile blobs and the move on `admin_settings` keys; `billing/overview` carries `plans`; the ten indexes. Suite green before and after.

## 6. Decisions
1. **Revocation cache TTL: 10 s** (Josh, 25 Oct). "Sign out other devices" bites at once on the pod that handled it and within ten seconds on the other; the saving is one trip per call.
2. The logo/signature apply on the live app is Josh's click on the Storage card after the publish (as 75b); the round applies on TS_ tenants only.
3. The database move stays a support ticket; this round's numbers are with Oregon.

## 7. What's new — Draft n 25 "Quicker, everywhere" (never published)
One card: "The dashboard and every page now load in a fraction of the time: the app fetches what it needs in one go instead of one piece after another, your logo and signature are kept as files instead of inside your profile, and fonts come from your browser's cache. Nothing has moved; it just arrives sooner."

## 8. Report
`memory/reports/round85-speed-fixes-report.md`, starting "Round 85 done": the trips and ms per route before and after (preview), the dashboard stage breakdown after, the shell's on-load call list after, the ten indexes, the suite before and after, and anything in the plan that could not be done with why. No code review. Do not start anything else after it. Do not offer next action items.

# Round 84 — Speed research: why the app loads in 10 s and what to fix first (24 October) — DONE 25 Oct (report `memory/reports/round84-speed-research-report.md`; findings in §6 below)

Josh, 24 Oct: the app's loading time is getting worse — about 10 s now, better a month ago; the Emergent "grow" compute upgrade did not help. This round **measures before it fixes**: read-only on production, a small owner-only "Speed check" card so real numbers can be read off the live app, and a ranked list of causes with a fix plan. No feature work. Nothing under `app/employee/*`.

## 0. What we already know (from Rounds 75, 76, 77's anatomy, and the 15 Oct log diagnosis)

- **The database is in a different cloud from the app.** The app runs in Google Cloud Iowa; the database is Emergent-managed in AWS Oregon. Round 76 measured **200–300 ms per database round trip** on production; the same code on the preview, with a local database, takes 0.15–0.25 s per request instead of 1.5–2.2 s. This is the one thing the "grow" upgrade cannot touch: it is distance, not CPU.
- **Pages make many trips.** The dashboard home made 35–45 sequential trips (Round 77's anatomy, 15 Oct) — at 200 ms each that alone is 7–9 s. Round 76 cut the per-request authentication trips from about five to one or two; Round 77 (the dashboard diet) was written but **never sent**.
- **Rounds 80–83 added work per request**: the subscription gate now reads the plan state and the feature gate checks `plans.has(...)` on many routes; the billing overview, the Account page and the sidebar pills call new routes on load; the Terms status is checked on sign-in; the Round 81 reminder job runs every 5 minutes per tenant; the Round 80 cron hourly. Whether these cost trips per page is unmeasured.
- **The frontend bundle** was 1.3 MB plus eight fonts in October (Round 76's recording: ~3 s of an 11.5 s hard refresh); it has grown since (Billing, presentation pages, connect reasons, the Terms box). Whether it is served compressed and cached on the live domain is unmeasured.
- **Media**: Round 75 put new photos in the blob store; the Round 75b Storage card exists on the live app (owner-only) but **Check storage was never clicked**, so whether old photos and videos still sit inside records is unknown. The deployer's probe on 15 Oct found no `data:` photos on production (26 estimates then).
- **Workers**: one uvicorn worker per pod on a 500m CPU limit; the two-workers change (Round 76 §3) was Josh's decision via support and is still open.
- `maxPoolSize` was raised to 50 by Josh (Round 75 §4).


## 0b. Josh's own measurements (DevTools Network, live app, dashboard, 25 Oct, Melbourne)

| | Plain reload | Hard refresh |
|---|---|---|
| Requests / transferred / resources | 38 / 2.1 MB / 8.9 MB | 26 / 2.6 MB / 8.9 MB |
| DOMContentLoaded / Finish | 1.0 s / 4.05 s | 1.4 s / 4.46 s |
| `GET /api/dashboard/home` | **still pending at 18 s** (cards "—", activity spinner) | **still pending at 17 s** |
| `GET /api/admin/profile` | **1,219 kB · 2.03 s** | 1,219 kB · 2.60 s |
| `GET /api/billing/overview` | 1.73 s (0.4 kB) | 1.51 s |
| `plans` / `status` / `version` | 431 / 382 / 340 ms | 365 / 444 / 332 ms |
| `me` ×3 · `unread` ×2 · `unseen` | 368–583 · 462–601 · 471 ms | 362–706 · 412–498 · 478 ms |
| Fonts (Fraunces, Inter ×3, IBM Plex Mono ×2, Ionicons ≈ 900 kB) | re-fetched over the network through the service worker, 480–920 ms each | from disk cache, 6–57 ms |
| JS bundle `entry-65b8e9a….js` | memory cache, 0 ms | network |

What it says: the shell is up in about 1.4 s; **the 10+ s is `/api/dashboard/home` alone** (the briefing is off for this tenant, so not the AI brief); the profile call drags **1.2 MB** on every page (the logo and signature as data: URLs, most likely — Round 75 moved estimate photos only); `billing/overview` costs 1.5 s on load (Round 80 addition); a dozen tiny calls cost 330–700 ms each (the production floor: browser → Iowa → Oregon database → back); `me` fires three times and `unread` twice (Round 76's dedupe not holding, or new callers); the service worker fetches hashed fonts over the network on a plain reload. Sent to Emergent as the Round 84 addendum on 25 Oct.

## 1. The hypotheses, ranked by expected share of the 10 s

| # | Cause | Why it fits "getting worse" | How the round proves or clears it |
|---|---|---|---|
| H1 | **Cross-cloud database latency** × the number of trips a page makes | Every new feature adds a trip or two; each costs 200–300 ms on production and 1 ms on the preview | Measure the trip latency from inside the production app (the Speed check card); count trips per page (the Round 76 counter extended to every route) |
| H2 | **The dashboard's 35–45 sequential trips** (Round 77 not built) | The first page after sign-in is the one Josh feels | Server-Timing per stage on `/dashboard/home` on production |
| H3 | **New per-request work since Round 76** (plan gate, feature checks, billing/account calls, Terms status) outside the principal cache | Added in the last two weeks, exactly when it got worse | Trip counter per request on production; list every route called on a dashboard load and its server time |
| H4 | **The frontend bundle**: size, no compression or short cache on the live domain, fonts | Grows with every round; a plain reload should be cheap, a hard refresh is not | Bytes transferred, `content-encoding`, `cache-control` on the main bundle and fonts; cold vs warm load timing from Playwright with a 20 Mbit throttle |
| H5 | **Background jobs on the single worker** (the 5-minute reminder job per tenant, the hourly plan cron, auto sign-out every 15 min, AI price refresh) contending with requests | More tenants, more jobs since October | Durations and timing of each scheduled job from the logs; CPU of the pod during a dashboard load |
| H6 | **Media still inside records** (old photos, videos) making list and dashboard reads heavy | Only if Check storage finds them | Josh clicks Check storage on the live app and pastes the lines |
| H7 | **Missing indexes on newer collections** (timeclock, messages, ai_audit_log, notifications, updates) | Collections grow daily; unindexed `owner_admin_id` scans get slower with size | `$indexStats` and `explain` on the queries the dashboard and lists run |

Expected order of effect: H1+H2 (the big one, likely 6–8 s), H3 (1–2 s), H4 (1–3 s on a cold load), H5–H7 (smaller, but H6 can be large if a video sits in a record).

## 2. What Emergent does (read-only on production; one small owner-only tool)

1. **Trend from the logs.** The app logs every request over 500 ms. From the production logs for the last 30 days: per route, the p50 and p95 server time per day for `GET /api/dashboard/home`, `GET /api/estimates`, `GET /api/admin/profile`, `GET /api/auth/me`, `GET /api/billing/overview`, `GET /api/projects`, `GET /api/customers`; a table by week showing whether they climbed. The owner's tenant is read-only; nothing but timings is read.
2. **Trip counter on every route.** Extend the Round 76 counter so every database call in a request increments `request.state.db_trips` (one wrapper around the Motor client, no logic change), and the existing `Server-Timing: app;dur=` header gains `trips=N`. Debug-level log line per request with route, duration and trips. This is the measurement instrument for the whole round.
3. **Dashboard stage timing.** In `services/dashboard_home.py`, time each stage (settings, estimates, invoices, projects, employees, calendar fan-out, brief, map, activity, weather, external calendars) and add them to `Server-Timing` as `s1;dur=…` etc. No behaviour change.
4. **The Speed check card** (platform owner only, next to the Storage card on the Platform screen; same guard as `/api/platform/*`): `GET /api/platform/maintenance/speed` returns and the card shows:
   - database round trip: 20 `ping` commands, p50 / p95 / max in ms;
   - the app pod's region (from the cloud metadata endpoint if reachable, else "unknown") and the **database host's region as a word only** (derived from the connection host name, never printing the host or the URL);
   - uvicorn worker count, pod uptime, process RSS memory, the CPU limit if readable;
   - `/dashboard/home` for the signed-in owner run once server-side: total ms, trips, the stage breakdown;
   - the last run time and duration of each scheduled job (from the `job_locks` records or the scheduler's own bookkeeping);
   - `$indexStats` summary: for `timeclock, messages, ai_audit_log, notifications, updates, employee_sessions, daily_reports, leads, reminders, events`: whether an index on `owner_admin_id` (or the tenant key the collection uses) exists and how often it was used;
   - collection counts and sizes (reuse the Storage check's `collStats` code; do not duplicate it).
   The card has one button **Run speed check** and shows the result as plain lines plus a **Copy** button so Josh can paste it here. Read-only, nothing changes, other admins get 404.
5. **A dashboard load, measured end to end on the preview** with Playwright at 1440: cold (empty cache) and warm; the number of requests fired by the dashboard route, each one's size and server time, duplicates, and the main bundle's bytes, `content-encoding` and `cache-control`. Then the same request list against the **live** domain for the public pages only (`/admin/login` shell, `/terms`) — no sign-in to production by the agent.
6. **Code audit of the request path since Round 76**: list every middleware and dependency that runs on an authenticated request today (gate, pay strip, plan gate, feature gate, principal, Terms status, billing) with the trips each makes and whether the principal cache covers it; and every call the admin shell fires on load (`_layout.tsx`, the sidebar, the badges) with its interval.
7. **Report** `memory/reports/round84-speed-research-report.md`, starting "Round 84 done": the trend table; the trips-per-route table; the dashboard stage breakdown; the bundle numbers; the request-path audit; the job durations; then a **ranked list of causes with a number against each** and a fix plan with the expected saving per fix and the order. No fixes in this round except the instruments above. Suite before and after; `tsc` clean; TS_ rows only; nothing published; nothing from the suggestion list.

## 3. What Josh does (none of it needs Emergent)

1. **Today, before any build**: open the live app, sign in, dashboard. Press F12 → **Network** → reload the page (plain reload, not Ctrl+Shift+R) → wait until it settles → click the **Time** column to sort slowest first → screenshot the top of the list and the footer line ("… requests · … transferred · Finish …"). Then one more screenshot after a **hard refresh** (Ctrl+Shift+R). Upload both here. This splits the 10 s into "bundle" and "API" before anything else.
2. On the live app: Settings › Platform → the **Storage** card → **Check storage** → paste the lines here (read-only).
3. After the round is published: the **Speed check** card → Run → Copy → paste here.
4. **Ask Emergent support now** (this is likely the single biggest fix and needs no code): the database add-on in the app's own region (Option 1 from 15 Oct). Questions to put to them: price; downtime and whether it can run outside AEDT business hours; a snapshot before the migration and a copy afterwards; whether an Australian region exists for the app on any plan; and **two uvicorn workers per pod**. Their answers go in the plan.

## 4. After the research

The report's ranked list becomes the fix order. Likely shape, to be confirmed by the numbers: (1) the database move to the app's region (support); (2) Round 77 dashboard diet, extended to the quotes, jobs and customers pages; (3) whatever H3 finds (plan and feature checks through the principal cache, shell calls after first paint); (4) bundle compression, caching and code-splitting on the live domain; (5) two workers; (6) media move if H6 finds any. Each is its own round or Josh's click; nothing speculative gets built.

## 5. What's new

None (instruments and a report; nothing for users). Say so in the report.

## 6. Findings (Emergent, 25 Oct) — "Round 84 done"

- **Instruments built**: every Motor call counted per request (`services/db_trips.py`); `Server-Timing: app;dur, trips;dur, s1…s15` with the dashboard stage names; a per-request debug line; `job_runs` bookkeeping; the **Speed check** card (platform owner only, next to Storage; others 404); `tests/test_r84_speed_instruments.py`; tsc clean.
- **H2 confirmed and bigger than thought**: `/dashboard/home` makes **60 sequential database trips** (not 35–45) → at the 200–300 ms Oregon round trip 12–18 s; the production 24 h logs show **p50 18.3 s** for the owner's tenant. (A 30-day trend is not retrievable: the platform's log tooling keeps 24 h and no timestamps.)
- **`/admin/profile` is 1.2 MB** because the logo and the owner signature are inline data URLs in `admin_settings` (`utils/image_upload.py` falls back to base64 when no bucket is configured — the same fallback Round 75 removed for estimate photos).
- **The shell fires `dashboard/home` and `legal/status` twice** on load, plus the Round 80/82 calls (billing overview, plans, Terms status).
- **Every tiny call pays an uncached revocation trip** (Round 76 kept `is_jti_revoked` live by design) — the 330–700 ms floor.
- **The service worker is network-first**, so hashed fonts are refetched on a plain reload.
- **None of the ten newer collections has a tenant index.**
- **Cleared**: background jobs and the compute tier are not the cause (the "grow" upgrade could not help).
- Preview Speed check: DB ping p50 0.2 ms; 1 worker; CPU limit 2 vCPU; dashboard 728 ms for the same 60 trips — the trips are cheap next to the database and ruinous across clouds.
- **Ranked fix plan** (Emergent's, savings estimated): 1 gather the dashboard reads (≈18 s → ~2 s); 2 logo and signature to files (−1.2 MB, −2 s on every page); 3 cache the revocation check and the plan-gate read; 4 dedupe the shell's calls; 5 cache-first service worker for hashed assets; 6 tenant indexes on the newer collections; and the **database in the app's region** as the structural lever (support, Josh).
- Suite: before pass 189 s; the full after-run hit port exhaustion in the pod (the Code tab now occupies port 8011); every affected file re-run green except the known daily-report fixture-order test. TS_ rows cleaned; owner tenant timings only; nothing published; no What's new.

## 7. The pasted detail (25 Oct)

- Production 24 h (only requests over 500 ms are logged, 17 lines): `dashboard/home` n 7 **p50 18,340 ms, p95 ~50 s**; `admin/profile` p50 1,160 ms, p95 5.5 s; `billing/overview` p50 816 ms. No 30-day trend (tooling keeps 24 h, no timestamps, old pods gone).
- Trips per route (preview counter): dashboard/home **60–64**; projects 12; admin/profile 10; updates/unseen 5; billing/overview 4; legal/status 2–3; feedback/unread 3; auth/me, estimates, platform/me, login 2; customers, billing/plans 1; version 0.
- Dashboard stages (preview): calendar fan-out the largest trip count (`entries_for_range`); `brief_v2` re-reads admin_settings, reminders, leads, messages, admins, lucy_ideas and the calendar range again; **the AI morning brief is generated inside the request when today's headline is not cached — 9.6 s on a cold day** (off for Josh's tenant, on for others).
- Profile: `utils/image_upload.persist_image` writes the logo and signature as inline base64 when no bucket is configured; the preview copy is 3 KB without them.
- Request path: PlanFeatureGate makes 1 uncached `admins.find_one` on gated routes; `principal.resolve()` runs the revocation check uncached on every call (+ the caller doc on a 30 s miss); two Motor clients (`database.py` and `server.py`), two pools.
- Shell on a cold load: `admin/login → auth/me → legal/status → dashboard/home → billing/overview → billing/plans → legal/status (again) → dashboard/home (again) → admin/profile → platform/me → version → feedback/unread → updates/unseen` (+ `billing/me` after first paint and on every tab focus; two unread polls every 120 s). The duplicates come from a remount after `access.load()` resolves; `billing/overview` + `plans` (80) and `legal/status` (82) are new since Round 76. `billing/overview` = 4 trips, no Stripe HTTP call.
- Service worker `public/sw.js`: network-first for everything, cache only as fallback.
- No tenant index on timeclock, messages, ai_audit_log, notifications, updates, employee_sessions, daily_reports, leads, reminders, events.
- Jobs: all milliseconds on the preview (operating_hours_reminders 385 ms); they run in the worker process → H5 cleared.
- Revocation cache at 30 s: a revoked token could work up to 30 s on the other pod (two pods, no shared cache).
→ Round 85 written: `speed-fixes-notes.md`.

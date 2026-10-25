# Round 86 — Presentation and brand images out of the records, and the missing indexes (25 October) — BUILT 25 Oct (sent as `round86-message.md`; results at the end of this file); waits for publish, then Josh's steps in §8

Backend round with two small admin touches; no prototype (nothing changes on screen). Found by Josh's **Check storage**, **Speed check** and DevTools on the live app, 25 Oct, straight after the Round 85 publish.

**What the live database holds.** `estimates`: 39 records, **241 MB**, average 6.3 MB. The ten largest are each **14.6 MB**, all of it under the key **`presentation`** — "14.6 MB as text: 13 images". The Round 74 presentation pages store their photos as base64 text, and every quote carries a full copy of the business's presentation (the same 13 images, identical size, in EST-0008 … EST-0019). `admin_settings` for Josh's business is 1 KB (so the logo and signature are **not** there, and the Round 85 brand move found nothing); `private_files` holds two start-fresh export zips (13.6 MB, Josh's own backups, fine). The `admins` and `estimate_presentation_templates` collections were not scanned by the tool.

**What it costs.** Every open, save, send and PDF of a quote moves 14.6 MB through the database and the server; every list or summary that reads estimates without excluding `presentation` (the Round 75 projections predate Round 74, so they exclude `photos`, `lines`, `areas`, `items`, `signature_data_url` — not `presentation`) drags 14.6 MB per quote: the quotes list, the dashboard's estimates read, the customer page, Lucy's estimate tool, the MCP list. Ten quotes on a page is 146 MB. This is the heaviest thing in the app and it grows with every quote.

**What the live Speed check and DevTools showed (25 Oct, 3:52 pm, pod up 22 min, 1 worker, 1 vCPU, memory 1012 MB).**

- Database round trip, 20 pings: p50 **38.9 ms**, p95 40.2 ms. The raw trip is cheap — far from the 200–300 ms Round 84 assumed. Regions read "unknown" (the card could not determine them).
- Dashboard home, server side, Josh's tenant: **10,094 ms for 10 database trips, all of it in wave 1 (10,074 ms)**; calendar 0 ms; wave 2 0 ms. Ten trips at 39 ms is 0.4 s; the other 9.6 s is data moving and being decoded, and the only heavy data this tenant has is `estimates.presentation`. The server works on it in one worker on one vCPU, so every other call waits behind it — in Josh's table the 0.1–0.4 kB calls took 270–960 ms each while `home` was pending. **Confirm by timing each wave-1 query** (the `s1…` Server-Timing stages exist since Round 84) and name the query and its bytes in the report.
- The browser: `/api/admin/profile` **1,199 kB in 1.63 s and 1.78 s**, once on each of two consecutive pages — the brand images are still inline because they are not in `admin_settings`; §2 moves them from wherever they are (name the collection and keys in the report). `estimates` (the quotes list) and dashboard `home` were still pending when the table was copied.
- **None of the ten Round 85 indexes exist on the live database.** All ten collections read "NO tenant index · 0 indexes" (`notifications` has 891 records). Find out why `services/indexes.py` did not create them on the published pod — startup gated to an environment, a failure in the log, a different database than the preview — fix it so the published app creates them at startup, and the Speed check reads them back. Report the cause.
- The job `operating_hours_reminders` took **3,813 ms** on its last run; every other job took 80–130 ms. Report what it scans; if it is a missing index or a full read of a collection, fix it in this round and say so.
- At dashboard load Josh's table shows `status` five times, `unread` four times and `me` three times, with different sizes. Account for each in the report: distinct routes are fine; the same route called twice at load is a duplicate to remove (Round 85's dedupe); a poll says its interval.

## 1. Presentation photos become files

- **Blob store for presentation images**: template photos (`estimate_presentation_templates`, any photo in any block: hero, grids, about-us) and the per-quote `presentation` copy hold `/api/blobs/{id}` (`kind: "presentation"`, `owner_admin_id`, `estimate_id` where per quote), served by `GET /api/blobs/{id}` under the Round 75 safety conditions (image/* only, nosniff, inline, by id, rate-limited). Uploads and **Pick from a finished job** write a blob (a picked job photo is already a blob: reuse its id, no copy). The review platform marks are static frontend assets, never stored per record.
- **The per-quote copy is structure plus links, never bytes**: when a quote takes the template (Round 74 part 1's "new quotes follow the switch"), it copies the block list with captions, headings and the image **URLs** — kilobytes. The quote keeps the pages as sent (Round 74's semantics unchanged); only the weight goes.
- The client view, the public page and the PDF render from the URLs (the PDF renderer fetches the blob bytes at render time, as it does for estimate photos since Round 75).

## 2. The move, extended (the Round 75b tool)

- `POST /api/platform/maintenance/move-media` learns three more targets: `estimates` → every `data:image` string **anywhere under `presentation`** (any depth); `estimate_presentation_templates` → anywhere in the record; `admins` → `logo_url`, `signature_url`, `business_profile.*` and any `data:image` string anywhere on the admin document (the Round 84 code comment "~6.7 MB base64 on the admin doc" says the brand images may live there, not in `admin_settings`). SHA-256 dedupe **across records** (the same 13 images in ten quotes become 13 blobs, referenced ten times); dry run per business ("Josh Sano Painting & Decorating · 11 quotes · 13 distinct images · 146 MB as text → 13 files, 11 MB"); apply with the token and `confirm: "MOVE"` as 75b; idempotent; audit row; re-reads every touched record and asserts no `data:image` remains under the touched keys.
- **Check storage** scans `admins` and `estimate_presentation_templates` too, and its per-record `data:` scan walks any depth (the `presentation` weight was found because the key is top-level; nested keys must be found the same way).
- Josh runs dry run → Apply on the live app after the publish (the owner's tenant is the sanctioned one-off write, as 75b); the round applies on TS_ tenants only.

## 3. Reads that never touch `presentation`

Add `presentation` to the Round 75 exclusion projection everywhere a list, count, summary or dashboard reads estimates: `routes/estimates.py` (the list), `services/dashboard_home.py` wave 1, `routes/customers.py`, `ai_tools.py`, `routes/mcp_server.py`, `routes/archive.py`, `routes/projects.py` (the project's estimate reads), the invoices' estimate reads. The builder (`GET /estimates/{id}`) still loads the whole record, which after the move is small. Same response shapes.

## 4. Verify (testing agent, 1440 then 1024, TS_ tenants; the owner's tenant read-only)

1. A TS_ tenant with the residential template: upload three photos and pick two from a finished job → the template holds five `/api/blobs/` URLs and no `data:` string; the picked ones reuse the job photo's blob id.
2. A new quote with the pages on → `estimate.presentation` is under 20 kB and holds the URLs; the client view, the public page (laptop and 390) and the PDF show the five photos in the right blocks and order; pages off → nothing.
3. A TS_ quote seeded with a `presentation` copy carrying three base64 images (two identical) → dry run reports 1 quote · 2 distinct images · bytes; apply converts them to 2 blobs; the public page and PDF still show them; a second apply moves nothing. Same for a seeded template and a seeded admin doc with a base64 `logo_url`.
4. `GET /estimates`, the dashboard, a customer page and Lucy's estimate tool responses carry no `presentation` key; `Server-Timing` sizes on a quotes list with ten TS_ quotes that have pages drop accordingly (report bytes before and after).
5. Check storage lists `admins` and `estimate_presentation_templates`, and a nested seeded `data:` string is found and named.
6. The Speed check on the preview after the round: the ten collections read "tenant index · n indexes" (10 of 10); dashboard home for a TS_ tenant with ten quotes carrying pages — trips and milliseconds before and after, with the wave-1 query timings.
7. Suite before and after; `tsc` clean; 1024 no horizontal scroll; no console errors; nothing under `app/employee/*` changed.

## 5. Tests

`backend/tests/test_r86_presentation_images.py`: blob URLs on upload and pick; the quote copy's size and URLs; the move on `estimates.presentation`, on a template and on an admin doc (dedupe across records, idempotence); the projections; the Storage check's new collections and nested scan. Suite green before and after.

## 6. What's new

Amend the unpublished Draft n 25 "Quicker, everywhere" with one sentence: "Quotes with presentation pages open, save and send far faster too." No new draft.

## 7. Report

`memory/reports/round86-presentation-images-report.md`, starting "Round 86 done": the dry-run lines for the TS_ seeds, the before/after bytes of the quotes list, the collections now scanned, where the brand images were found (collection and keys), the wave-1 query timings that account for the 10 s, why the ten indexes were missing on the live database and what now creates them, what `operating_hours_reminders` scans, the accounting of `status` / `unread` / `me` at dashboard load, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

## 8. Josh's steps after the publish

Settings › Platform › Storage: **Check storage** (now with `admins` and the templates) → **Move media out, dry run** (expect the eleven quotes, the template and, if the admin doc holds them, the logo and signature) → **Apply** with MOVE → open EST-0019, its public link and PDF to see the photos → Check storage again: `estimates` should read about 1 MB, not 241 → **Run speed check** again: dashboard home well under 10 s, the ten collections with their tenant index → a DevTools table of the dashboard: `profile` a few kB, `home` and `estimates` no longer pending.


## Results (Emergent, 25 Oct — report `memory/reports/round86-presentation-images-report.md`, not published)

- **Images out of the records.** Presentation photos are `kind: presentation` blobs: a new upload route `POST /api/estimate/presentation-templates/upload` with SHA-256 dedupe; a `data:` string posted or copied is turned into a file server-side; a picked job photo reuses its own blob id. The move learns `estimates.presentation` (any depth), `estimate_presentation_templates` (whole record) and `admins`. **The 1,199 kB profile is `admins.photo_url`** — the owner's inline profile photo from before Round 85, not the logo or signature; named from the code path (the preview's copy of Josh's record carries no inline image, so the live dry run's "admin record" line is the confirmation). Dedupe across records and runs. Dry run on the seed: "TS_ Alpha Painting · 10 quotes · 13 distinct images · 102.6 MB as text → 13 files, 3.7 MB"; apply took the ten seeded quotes from 105,051 kB to 28 kB; a second run moved nothing; the PDF still renders. Check storage scans `admins` and the templates and names nested paths (`presentation.blocks[].photos[]`).
- **Wave 1.** The ten seconds is the `estimates` read: the Round 75 projection left `presentation` in — 105 MB for 12 quotes on the seed (75 ms on the preview's local database; on the live 39 ms link that is the 10 s). Now 9 kB. `/estimates` 107.6 MB → 10.3 kB. Every list, dashboard, customer, invoice and project read excludes it. Each wave-1 read is its own `w1.<name>~<kB>` stage in the Speed check.
- **Indexes.** The live "0 indexes" on a collection with 891 records was `$indexStats` being refused — it needs a cluster-monitor privilege the live database user lacks — and the Speed check read the refusal as zero. The count was wrong, not the indexes (whether the ten exist on live is read by the published check from `listIndexes`, which needs no privilege). Fixed alongside: each index created in its own try (one conflict no longer stops the rest), a background task at startup, the outcome recorded and shown in the card ("startup index run … 24 ok · 0 failed").
- **Accounting.** `operating_hours_reminders`: four sequential trips per `admin_settings` document with reminders on (the default; 385 such documents for 27 admins on the preview) — 1,541 trips → 2. Shell at load: 5 calls at first paint, 5 after, one brief re-fetch at +5 s; `me` ×3 are three different routes; `unread` ×4 are two routes plus one 120 s poll each; `status` fires once at load (`legal/status`) — the other `status` routes belong to later pages. No duplicates to remove.
- Tests: `tests/test_r86_presentation_images.py` (7); suite 894 passed / 113 skipped in chunks, the same two order-dependent daily-report tests; tsc clean; the testing agent's frontend pass at 1440 and 1024; TS_ rows torn down; the owner's tenant read only; Draft n 25 amended, still a draft. The `test_r84` shape test gained the `index_run` key.
- Also in the log: "Parking lot: FB-36b69c40 parked tester feedback" (→ `fix-round-h-candidates.md` item 6); the testing agent's first pass hit a stale Metro bundle on the preview (item 7).

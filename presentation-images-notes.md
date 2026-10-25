# Round 86 — Presentation and brand images out of the records (25 October) — DRAFT, waits for Josh's "send"

Backend round with two small admin touches; no prototype (nothing changes on screen). Found by Josh's **Check storage** on the live app, 25 Oct, straight after the Round 85 publish.

**What the live database holds.** `estimates`: 39 records, **241 MB**, average 6.3 MB. The ten largest are each **14.6 MB**, all of it under the key **`presentation`** — "14.6 MB as text: 13 images". The Round 74 presentation pages store their photos as base64 text, and every quote carries a full copy of the business's presentation (the same 13 images, identical size, in EST-0008 … EST-0019). `admin_settings` for Josh's business is 1 KB (so the logo and signature are **not** there, and the Round 85 brand move found nothing); `private_files` holds two start-fresh export zips (13.6 MB, Josh's own backups, fine). The `admins` and `estimate_presentation_templates` collections were not scanned by the tool.

**What it costs.** Every open, save, send and PDF of a quote moves 14.6 MB through the database and the server; every list or summary that reads estimates without excluding `presentation` (the Round 75 projections predate Round 74, so they exclude `photos`, `lines`, `areas`, `items`, `signature_data_url` — not `presentation`) drags 14.6 MB per quote: the quotes list, the dashboard's estimates read, the customer page, Lucy's estimate tool, the MCP list. Ten quotes on a page is 146 MB. This is the heaviest thing in the app and it grows with every quote.

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
6. Suite before and after; `tsc` clean; 1024 no horizontal scroll; no console errors; nothing under `app/employee/*` changed.

## 5. Tests

`backend/tests/test_r86_presentation_images.py`: blob URLs on upload and pick; the quote copy's size and URLs; the move on `estimates.presentation`, on a template and on an admin doc (dedupe across records, idempotence); the projections; the Storage check's new collections and nested scan. Suite green before and after.

## 6. What's new

Amend the unpublished Draft n 25 "Quicker, everywhere" with one sentence: "Quotes with presentation pages open, save and send far faster too." No new draft.

## 7. Report

`memory/reports/round86-presentation-images-report.md`, starting "Round 86 done": the dry-run lines for the TS_ seeds, the before/after bytes of the quotes list, the collections now scanned, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

## 8. Josh's steps after the publish

Settings › Platform › Storage: **Check storage** (now with `admins` and the templates) → **Move media out, dry run** (expect the eleven quotes, the template and, if the admin doc holds them, the logo and signature) → **Apply** with MOVE → open EST-0019, its public link and PDF to see the photos → Check storage again: `estimates` should read about 1 MB, not 241.

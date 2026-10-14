# Round 75 — Speed: lists load what they show, photos live as files (proposal for Josh's review, not sent)

Backend-only round; no prototype (nothing changes on screen). Written from the Round 64 code (line numbers are Round 64; the agent checks them against the current tree before changing anything) and from Emergent support's 14 October diagnosis, which the code confirms.

**Why.** An estimate record on production is about 7.6 MB because photos are stored inside it as base64 text. The photo upload path (`routes/estimates_v2.py` `_store`) tries the connected Drive, then the built-in bucket, then falls back to a `data:` URL written into `photos[].url` (`services/file_storage.py:38`); the marked and corrected copies of a photo go the same way (`estimates_v2.py:228–240`), and `lines[].photo_url` copies the photo's URL (`estimates_v2.py:270`), so one photo can sit in the record twice. On production Drive is not connected and no bucket is configured, so every photo lands in the record. The quotes list (`routes/estimates.py:90`), the dashboard (`services/dashboard_home.py:150–152`, every estimate, invoice and project in full, up to 5000 each), the customer page (`routes/customers.py:313`), Lucy's estimate tool (`ai_tools.py:290`) and the MCP list (`routes/mcp_server.py:141`) all read whole records with no projection. No indexes exist on estimates, materials, customers, projects or invoices by `owner_admin_id` (only `contract_terms_templates`, attachments and jobs create indexes at startup, `server.py:170–180`). The database URL caps the connection pool at 5 (the owner's own step, §4).

## 1. What changes

| Where | Change |
|---|---|
| **List and summary queries read only what they show** | Add an exclusion projection `{"photos": 0, "lines": 0, "areas": 0, "items": 0, "signature_data_url": 0}` to every estimate query that feeds a list, a count or a summary: `routes/estimates.py:90` (`GET /estimates`), `services/dashboard_home.py:150` (and `projects` at `:152` with `{"photos": 0, "documents": 0}` if those keys exist on project records; `invoices` at `:151` with `{"lines": 0, "signature_data_url": 0}`), `routes/customers.py:313` and `:357`, `ai_tools.py:290`, `routes/mcp_server.py:141`, `routes/archive.py:40`, `routes/projects.py:516, 525, 580, 784` (`photos`, `documents`). The response shape of each endpoint is otherwise unchanged; `has_signature` on the list keeps working from a separate `{"signature_data_url": {"$exists": true}}` check or by projecting the field to a boolean with `$cond`, not by loading the PNG. The builder (`GET /estimates/{id}`) still loads the whole record. Pattern already in the code: `services/merge_tags.py:44`; Round 40's signature strip on the list. |
| **Photos become files with a link, in every storage mode** | `services/file_storage.builtin_store` loses the `data:` fallback. When there is no Drive and no bucket, the bytes go to the GridFS blob store the readiness round added for the data export (`services/blobs.py`; reuse its put/get, add nothing that duplicates it) and the record keeps `{"url": "/api/blobs/{blob_id}", "file_id": blob_id, "provider": "pthq"}`. One new route `GET /api/blobs/{blob_id}` streams the bytes with the stored content type and `Cache-Control: public, max-age=31536000, immutable`; 404 when missing; no login, because the public quote page and the PDF renderer load photos by URL and today's Drive uploads are already public-by-link for the same reason (`file_storage.upload(..., public=True)`); `blob_id` is a uuid4, unguessable. The marked and corrected copies and `lines[].photo_url` follow automatically because they go through `_store`. Nothing changes in the builder, the photo sheet, line thumbnails, the client view, the public page, the PDF or the crew job page: they already render whatever URL the record holds. **Safety conditions (the owner's "yes, if safe"):** (a) no route lists blobs, by tenant or otherwise; a link is the only way to a photo; (b) each blob record carries `owner_admin_id`, `estimate_id` and `kind: "photo"`, and the route serves only blobs whose content type starts with `image/`, with `X-Content-Type-Options: nosniff` and `Content-Disposition: inline`, so nothing stored can ever be served as a page or a script; (c) deleting a photo, deleting the quote, and the archive purge (`services/archive_purge.py`) delete its blobs, so a leaked link dies with the photo; (d) the route reads by `_id` only, never by a filename or path; (e) a per-IP limit on the route of 300 requests a minute so the id space cannot be scanned. This is the same exposure the app has today for Drive photos (anyone with the link) and for the public quote link itself. |
| **Move the photos already stuck in records** | One idempotent script `backend/scripts/move_photos_out.py` with `--dry-run` (default) and `--apply`. For every estimate in every tenant: each `data:` URL inside `photos[]` (the `url` and whichever keys hold the marked and corrected copies) and in `lines[].photo_url` is decoded, written to the blob store once per distinct image (the same bytes referenced from two places get one blob), and replaced by its `/api/blobs/{id}` URL; `provider: "pthq"`. Dry run prints per tenant: records, photos, bytes, and the five largest records. Apply prints the same after, re-reads each changed record and asserts no `data:image` remains. This round runs the dry run on every tenant, including the owner's, and reports the numbers; it does **not** run `--apply` on the owner's tenant. The apply on real data is a follow-up message after the numbers are seen, with a `mongodump` of `estimates` immediately before it (§5.4). The owner has agreed to the move in principle (14 October). Contract PDFs stored as base64 (`private_files`, `employee_documents`) are not touched; the contracts follow-up handles them. |
| **Indexes at startup** | New `services/indexes.py` with `ensure_indexes()` called from the startup hook in `server.py` after the existing three, in its own try/except like them. Indexes (`create_index` is idempotent; `background=True`): estimates `(owner_admin_id, status)`, `(owner_admin_id, createdAt)`, `(owner_admin_id, customer_id)`; invoices `(owner_admin_id, status)`, `(owner_admin_id, createdAt)`, `(owner_admin_id, estimate_id)`; projects `(owner_admin_id, status)`, `(owner_admin_id, created_at)`, `estimate_id`; customers `(owner_admin_id, name)`; materials `owner_admin_id` and `admin_id` (`services/estimate_lines.py:355` queries both). Nothing unique; no data changes. |

## 2. What it does not do

- No change to what any screen shows, where photos appear, or how a photo is taken, named, tagged or marked.
- No change to the Drive or OneDrive paths; businesses with Drive connected already store photos as files.
- No retention or archiving rule (the owner's 30-days-after-done idea is a later round, separate from speed).
- No change to `app/employee/*`. The crew job route serves the same photo URLs it does today.
- No secret or deployment change by the agent (§4 is the owner's step).

## 3. Measure before and after (read-only on the owner's tenant)

Before any change, record on the owner's real tenant: `GET /estimates` response bytes and server time; `GET /dashboard/home` (whichever route `dashboard_home` serves) server time; the three largest estimate records in bytes; `db.estimates.stats()` average record size. Repeat after §1 rows 1–2, then after the migration. Put the three sets of numbers in the report; the numbers decide whether the round did its job.

## 4. The owner's own step (not for the agent)

In Manage Publishes › Secrets, edit `MONGO_URL` and change `maxPoolSize=5` to `maxPoolSize=50` (only that number; the value is a secret and never goes in a chat). Save; it takes effect on the next deploy together with the `.com.au` sender.

## 5. Verify (testing agent, 1440 then 1024, TS_ tenant unless stated)

1. `GET /estimates` for a TS_ tenant with a quote that has three photos: the payload carries no `photos`, `lines`, `areas`, `items` or `signature_data_url`; the list page shows the same columns and the same `has_signature`/photos-link cells as before; the quotes list, the dashboard and a customer page load with no visible change.
2. With no Drive and no bucket on the TS_ tenant: add a photo in the builder → the record holds `/api/blobs/{id}` (no `data:`); the photo shows in the photo sheet, on its line, in Review & Send, on the public quote link, in the PDF, and on the crew job page for a crew member of that tenant; mark it up → the marked copy is a blob too; delete it → the blob is deleted with it.
3. `GET /api/blobs/{id}` returns the bytes with the right content type, the cache header, `nosniff` and `inline`; an unknown id → 404; a non-image blob (the export zips) → 404 on this route; no route lists blobs; the 301st request from one IP within a minute → 429.
4. Migration: dry run on the owner's tenant prints the counts, bytes and five largest records (report them; nothing changes); on a TS_ tenant with a seeded `data:` photo, `--apply` converts it, the served bytes equal the original image, the record no longer contains `data:image`, and a second `--apply` changes nothing. `--apply` is not run on the owner's tenant in this round.
5. Indexes exist after a restart (`index_information()` on the five collections); the suite and `tsc` are clean; 1024: no horizontal scroll; no console errors.
6. §3 numbers before and after in the report.

## 6. Tests

`backend/tests/test_r75_speed.py` on TS_: the list payload excludes the heavy keys and keeps `has_signature`; a photo upload with no Drive and no bucket yields a `/api/blobs/` URL and the route serves the same bytes; `move_photos_out` converts a seeded `data:` photo (and a `lines[].photo_url` copy of it into the same blob) and is idempotent; `ensure_indexes()` creates the listed indexes. Suite green before and after.

## 7. What's new (Draft only)

**Title:** Faster everywhere
**Body:** Quote, job and customer lists and the dashboard now load only what they show, and photos are kept as files with a link on the quote instead of inside it. Nothing changes on screen; pages just arrive faster, especially on quotes with many photos.

## 8. Josh's answers (14 October)

1. The one-off move of real photos: include it. (Dry run in this round; apply as a follow-up after the numbers and a backup.)
2. Photos reachable by unguessable link without a login: yes, if safe → the five conditions in §1 row 2.
3. Order: straight after Fix Round F part 2b, ahead of Round 72.

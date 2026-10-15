# Round 75b — Storage check and media move, run from inside the app (proposal for Josh's review, not sent)

Backend + one owner-only admin card. Follows Round 75 (done, live) and Emergent's housekeeping answers of 15 October.

**Why.** Nobody can reach the production database from outside the app: the deployer is read-only, cannot exec into a pod and has no `MONGO_URL`; preview has its own local database. So Round 75's production dry run never ran, and the numbers behind Emergent support's "each estimate record is about 7.6 MB" are still unverified. The deployer's own read-only probe found production at 26 estimates, 10 invoices, 2 projects and **no** `data:` string on `photos.url` or `lines.photo_url`, which contradicts support's claim; the weight, if it exists, sits under other keys. Round 75 §8.1 also left non-image media (MP4/MOV/WebM uploaded through `estimate/media/upload`) inline as `data:` text, and one phone video encoded as text is 5–8 MB, which fits support's number. The only way to know, and then to move anything, is a tool inside the app that the platform owner runs against the live database.

## 1. Backend (platform owner only, same guard as the other `/api/platform/*` routes)

| Route | What it does |
|---|---|
| `GET /api/platform/maintenance/storage` | Read-only. For `estimates, invoices, projects, daily_reports, project_photos, private_files, employee_documents, admin_settings, fs.files`: `collStats` count, size, avgObjSize, storageSize. For `estimates, projects, daily_reports, private_files, employee_documents`: the ten largest records across all tenants (business name, tenant id, record id and number, BSON bytes via `bson.encode`), each with its five heaviest top-level keys in bytes and a count and byte total of every string value anywhere in the record that starts with `data:`, grouped by MIME prefix (`image/`, `video/`, `application/pdf`, other). Cursor scan, never a full load; at most 5 000 records per collection. Returns JSON plus a `text` summary: one line per collection, one line per large record ("Sano Paint · EST-0007 · 7.4 MB · photos 7.2 MB as text: 1 video, 3 images"). |
| `POST /api/platform/maintenance/move-media` | Body `{mode: "dry-run" \| "apply", collection: "estimates", tenant?: owner_admin_id, keys?: [...], token?, confirm?}`. Generalises `scripts/move_photos_out.py`: every string value starting `data:image/` or `data:video/` under `photos[]`, `lines[].photo_url`, `media[]` and any key passed in `keys` (default: the keys the storage check reported) is decoded, written once per distinct SHA-256 as a blob with `owner_admin_id`, `estimate_id`, `kind: photo \| video`, and replaced by `/api/blobs/{id}`. Dry run returns per tenant: records, strings, bytes by MIME group, and a `token` valid 15 minutes. Apply requires that `token` and `confirm: "MOVE"`, re-reads every touched record and asserts no `data:image`/`data:video` remains under the touched keys, returns before/after bytes per record, and writes one audit-log row. The owner's tenant is allowed: this is the sanctioned one-off write, triggered by the owner. |
| `GET /api/blobs/{id}` | Also serves `video/*`, with HTTP Range (`Accept-Ranges: bytes`, 206 on a `Range` request) so iPhone and Safari can play it; the Round 75 safety conditions unchanged (images and videos only, nosniff, inline, by `_id`, 300/min per IP, deleted with the photo and the quote). |
| New uploads | `estimate/media/upload` stores video as a blob from now on (reverses Round 75 §8.1); images already do. |

## 2. Frontend (admin, the platform owner's screen that holds the tester invites)

One card **Storage**, visible only to the platform owner, in the existing card style:

- **Check storage** → a table (collection · records · total MB · average KB) and under it **Largest records** (business · record · MB · where the weight is, from the `text` lines). A note line: "Read-only. Nothing changes."
- **Move media out · dry run** → the dry-run lines per business ("Sano Paint · 4 records · 1 video, 7 images · 9.1 MB as text") and a line "Before you apply: download your data export (Settings › Account) as the backup." Then **Apply** opens a confirm that asks to type MOVE; after apply, the before/after lines and "Done. Open a quote with photos to check them."
- Errors show the route's message. Nothing else on the screen moves. Other admins never see the card and get 404 on the routes.

No prototype unless the owner asks: an owner-only tool with two buttons and two tables.

## 3. Verify (testing agent, 1440 then 1024, TS_ tenant)

1. Seed a TS_ estimate with one `data:image` photo, one `data:video` entry and a `lines[].photo_url` copy of the image. Check storage lists the record with the right bytes and MIME groups and names the heavy keys; invoices and the other collections show counts and sizes.
2. Dry run: 1 record · 2 distinct strings (the copied image counts once) · bytes as seeded; a token comes back. Apply without the token or `confirm` → 400; with both → the image and the video are blobs, the line's `photo_url` points at the same blob as the photo, no `data:` left in those keys, before/after bytes shown; the photo shows in the builder, Review & Send and the public page; the video plays in the client view on a WebKit browser (a `Range` request gets 206); a second apply → nothing to move.
3. A new video upload through `estimate/media/upload` lands as a blob.
4. A non-platform admin: no card, 404 on both routes. Crew untouched. Suite and `tsc` clean. 1024: no horizontal scroll, no console errors.

## 4. Tests

`backend/tests/test_r75b_storage.py` on TS_: storage report shape, largest-record ranking and MIME grouping; dry run counts and token; apply gating (token, `confirm`), idempotence, blob dedupe by hash, `lines[].photo_url` rewrite; `video/*` blob with Range → 206 and correct bytes; non-platform admin → 404. Suite green before and after.

## 5. What's new

None: an owner-only tool, nothing for users. (Say so in the report instead of creating a draft.)

## 6. Housekeeping in the same message

Commit `backend/.env.example` and `frontend/yarn.lock` as they are (Emergent's recommendation: the example names the keys the app reads today; the lock file is behind the committed `package.json`). No other change to either.

## 7. Order after this round

Publish → the owner clicks Check storage on the live app and sends the lines here → database move to us-central1 by support (Option 1) → the owner downloads the data export and clicks Apply → Round 72 (GST) or Round 77 (dashboard home diet), the owner's pick.

## 8. Questions for Josh (one line each)

1. Build it as written, or prototype the Storage card first (your rule; my view: not needed for an owner-only tool)?
2. OK to have the videos moved too, and new videos stored as files? (Yes keeps the fix complete; no leaves videos as text in the record.)
3. After this: Round 72 GST first, or Round 77 dashboard home (4.7–5 s on production today; 35–45 database trips, the calendar read twice, weather and briefing inline)?

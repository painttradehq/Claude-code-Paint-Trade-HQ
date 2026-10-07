# Start fresh — remove a business's job records (Settings › Platform, fourth tab) — Spec Notes for Emergent

Prototype: `start-fresh-panel.html` (open with `?page=platform&tab=reset` at 1440: the tab, Start fresh… → the right-side panel → tick crew → tick numbering → type the business name → Start fresh → progress → done → Done; then 1024). Playwright `test_start_fresh.js` 14/14. Built on the Round 38 Platform page; everything else on Settings is untouched.

**Owner (7 Oct):** the published app carries the records created while testing (clients, estimates, invoices, employees and more) and there is no way to remove them. A one-off action, platform admin only for now, that clears the signed-in business's job records and keeps its setup. Owner rules: platform admin only; acts only on the admin's own business, never another tenant; a full export before anything is removed; runs as a background job (Round 63 worker); no banner anywhere else — the tab, one Recent activity row and Lucy's brief are the only places it shows.

## 1. Reuse / restyle / replace

| Existing piece | Decision | Notes |
|---|---|---|
| Platform page tab row (Signup leads · Tester invites · Feedback · Updates) | **Extend** | Fifth tab **Start fresh** (`platform-tab-reset`, `?tab=reset`), after Updates. No count badge. |
| Round 63 worker + `ai_jobs` | **Reuse** | New job kind `start_fresh`; same lock, progress fields, `…/current` pattern. |
| `services/archive_purge.py` (Round 41 H8 scan) | **Reuse** its per-collection map | The map of tenant collections and their soft-delete fields is the starting point for the delete list below. |
| Exports (`private_files`, Round 46 attachments) | **Reuse** | The pre-delete export is one private zip stored like an attachment, owner-only, deleted after 30 days by the worker. |
| Quote / invoice numbering (`estimate_seq_floor`, invoice sequence, Round 41 H1) | **Extend** | Reset to 1 only when the tick is on; otherwise untouched. |
| Recent activity (Dashboard) | **Extend** | One row kind `start_fresh`: "Started fresh · 412 records removed". Lucy's brief mentions it under activity if it happened since the last brief. |

## 2. The tab (`sf-page`)

Count line (`sf-count`): "**338** job records from testing · **74** more if crew and staff go too" — live counts from `GET /api/platform/start-fresh/counts`. Action: **Start fresh…** (`sf-open`, danger red). Under it one sentence: "Removes every job record from **{business}** so the business starts with a clean slate. Settings, products, templates and your account stay. Only you can do this, and only for your own business." Then the table **What goes · Records** (`sf-row-{key}`), one row per group below, the crew row muted with "(only if you tick it)". Under the table: "Stays: {what-stays sentence}". After a run: the count line reads "**No job records.** Started fresh {when}." and a last-run line (`sf-last`): "Last start fresh: {when} · {n} records removed · Download the export (kept until {date}) · also in Recent activity on the Dashboard."

While a job runs (also when the page is reopened): the count line reads "**Starting fresh…** {done} of {total} removed" and the button is disabled; polls `…/current` every 5 s.

## 3. The panel (`sf-drawer`, right side, 480 px)

Header "Start fresh" · "{business} · removes job records, keeps settings" · ×.
- **What goes**: the groups with counts and a Total line; the crew row crossed out while its tick is off.
- Tick **Also remove crew and office staff** (`sf-employees`, off by default): "Their accounts and everything about them: timesheets, sign-ins, onboarding documents, contracts, leave, ratings, training progress, equipment issued. They would need to be onboarded again."
- Tick **Reset quote and invoice numbering to 1** (`sf-numbering`, off): "Off: the next quote and invoice continue from today's numbers."
- **What stays** sentence, ending "Numbering continues from today's numbers." or "Numbering restarts at EST-0001 and INV-0001."
- Line: "Before anything is removed, a full export of these records is saved and kept for 30 days. You can download it from the Start fresh tab."
- **Type the business name to confirm** (`sf-confirm`): the Start fresh button (`sf-go`, danger) stays disabled until the typed text equals the business name, case-insensitive.
- Footer: Cancel · Start fresh.
- **Running** (`sf-progress`): bar + "Removing… {done} of {total}" and "Runs in the background. You can close this and come back; the tab shows the progress."
- **Done** (`sf-done`): green card "Done. {total} records removed{ · numbering reset}." with the per-group counts, the **Download the export · kept until {date}** button (`sf-export`), footer **Done**.

## 4. What goes, what stays

Scope is always `owner_admin_id = the signed-in platform admin's own business`. Nothing in any other tenant is read or touched; the isolation test covers it.

| Group (key) | Collections (tenant rows only) |
|---|---|
| clients | `customers` (+ their contacts), `leads`, `customer_activity`, `pipeline_deals` |
| estimates | `estimates`, `attachments` on estimates, estimate photos (`project_photos` with an estimate id), `estimate_followups` rows, `estimate` events |
| invoices | `invoices`, `credit_notes`, recorded payments inside invoices, `stripe_events` for the tenant |
| projects | `projects`, variations, `project_materials`, `daily_reports`, completion reports, `project_photos`, `attachments` on projects, `qr_codes` for jobs |
| calendar | `events`, `reminders`, `celebrations` |
| messages | `messages`, inbox threads, `sms_log`, `automation_runs` (the automation definitions stay) |
| activity | `notifications`, the activity feed rows, `frontend_errors` for the tenant, `support_requests` |
| ai | Lucy conversations, `briefing_headlines`, `brief_runs`, `performance_summaries`, `lucy_ideas` (the owner's reminders and ideas — they refer to test jobs), the per-tenant AI audit log |
| equipment | `equipment_items`, `equipment_assignments`, `equipment_item_events`, `equipment_requests` |
| archived | every soft-deleted row of the groups above |
| employees (only when ticked) | `employees` (except the owner's own admin row), `employee_documents`, `employee_contracts` (+ their PDFs), `employee_validations`, `employee_updates`, `timeclock`, `timesheet_weeks`, leave, strikes/recognition/ratings, training progress rows, equipment issued, their `qr_codes` |

**Stays, always:** `admins` (owner and team admins), `admin_settings`, `admin_profiles`, `admin_sessions`, `app_settings`, `materials`, `library_variants`, `library_tasks`, `estimate_templates`, `estimate_presentation_templates`, `contract_templates` (+ versions), `contract_terms_templates`, `email_templates`, `sms_templates`, `automations` (definitions), `training_videos`, `training_collections`, every integration row (`drive_`, `onedrive_`, `gcal_`, `outlook_`, `apple_`, `inbox_connections`, `connected_services`, `sms_settings`), `tester_invites`, `signup_leads`, `feedback*`, `updates*`, `platform_settings`, `job_locks`, the business's files that belong to kept rows (logo, signature, templates). Files in the business's own Drive/OneDrive are **not** deleted (they are the owner's files; the app only forgets them) — say so in the panel's export line if you think it needs saying, otherwise in the report.

Where the spec's collection list differs from the code (names, extra collections), follow the code and list the difference in the report; the rule is "every row that belongs to the business's job records goes, every row that is setup stays".

## 5. Backend

- `GET /api/platform/start-fresh/counts` → `{groups: [{key, label, count}], employees: {count}, last: {at, total, export_file_id} | null}`.
- `POST /api/platform/start-fresh {remove_employees, reset_numbering, confirm_name}` → 400 unless `confirm_name` equals the business name (case-insensitive) and no job is running; writes the export first (one private zip: a JSON file per collection with the rows as stored, plus the built-in-store files of those rows; `private_files` owner-only, `expires_at` = +30 days, the worker deletes it after); then creates `ai_jobs {kind: 'start_fresh', total, done, groups: {key: n}, export_file_id}` and returns 202 `{job_id, total}`. The worker deletes group by group, updating `done` after each collection; `status: done`, `finished_at`; writes the Recent activity row; resets numbering if asked (estimate and invoice sequences and floors to 0 so the next is 0001).
- `GET /api/platform/start-fresh/current` → the running job or null. `GET /api/platform/start-fresh/export/{file_id}` → the zip (owner only, 404 after expiry).
- Platform admin only (403 for everyone else, including the business's own team admins); the job runs on the platform admin's own `owner_admin_id` only.
- Tests: counts match a seeded TS_ tenant; the export zip contains every removed row; after the run every listed collection has 0 tenant rows and every "stays" collection is unchanged (compare counts before/after); crew kept when unticked, removed when ticked; numbering untouched / reset; a normal admin and tenant B get 403 (`test_tenant_isolation.py` extended); a second POST while running → 409; the expired export is removed by the worker.

## 6. Verify

1. Tab and panel at 1440 and 1024 as in the prototype; counts live; button disabled until the name matches; crew tick changes the total; numbering tick changes the stays line.
2. Run on a TS_ tenant seeded with every record type: progress on the tab and in the panel, done card with counts, the export downloads and opens, the tab shows "No job records" and the last-run line, Recent activity has the row, the Dashboard and every list page load empty without errors, Settings/products/templates intact, numbering as ticked.
3. Run again with crew ticked: employees gone, their crew-app logins fail, owner still signs in.
4. Owner's real tenant: **not run** in this round; report the counts endpoint's result for it (reads only) so the owner knows what the first real run would remove.
5. Suite green before and after; isolation; TS_ torn down; no email sent.

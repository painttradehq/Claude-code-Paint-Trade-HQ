Two parts, in this order: **first follow-up B, then Round C2.** Finish B and report "Round C1 follow-up B done" before touching anything for C2. Nothing else in between.

=====================================================================
PART 1 — Round C1 — §8 answers and follow-up B (guard every crew screen)

§8 answers (keep as built unless stated):
1. Keep. C2 may move the shared pieces to a new crew-only folder `components/crew/` and re-point the imports; nothing else goes in that folder.
2–7. Keep.
8. Expected; the job on sign-in arrives in C3.
9. Not this round. Noted for C3 (time clock), which touches `routes/timeclock.py` anyway: compare naive and aware timestamps safely in `/timeclock/status`.
10. Keep; the owner's admin chat has been told about the `utils/api.ts` change.
11. Keep. The owner's crew invite QR / code lives on the admin Employees page, so the landing page's QR is not needed on web.
12–16. Keep.

Follow-up B — guard every crew screen in one place:
- In `frontend/app/_layout.tsx` (the root Stack), on web only: if `usePathname()` starts with `/employee/` and `!isPhone()`, `router.replace('/admin/login')` and render nothing for that route. One guard, no per-screen edits, covers the eleven existing crew screens and every future one; the three entry-point guards from follow-up A stay as they are.
- Nothing under `app/admin/*`; no backend, env or route change.
- Verify (testing agent, phone UA for the crew paths, desktop UA + iPad UA for the non-phone paths): a desktop context carrying a crew session that opens `/employee/time-clock`, `/employee/contracts` and `/employee/project/<id>` directly lands on `/admin/login` with no crew element rendered; an iPhone UA still opens all three; the admin app on a desktop is untouched; no console errors; `tsc` clean.
- Report as "Round C1 follow-up B done", appended to the Round C1 report, then stop.

=====================================================================
PART 2 — Round C2 — Jobs: my jobs, the job page, the crew-only read routes.

The spec is pasted below verbatim; save it as `memory/specs/crew/c2-jobs-notes.md`. The prototype is the one already saved for C1 (`memory/specs/crew/c1-crew-shell.html`): the Jobs tab (`?screen=app&tab=jobs`), the job screen (`?screen=job&id=j1`; `?screen=job&id=j2` for a coming-up job with a site contact and no files) and the Today's-job card (`?screen=app&tab=today`). Open it at 390 × 844 first, then 360 × 800.

Rules for this round:
1. Touch `frontend/app/employee/*` (new `(tabs)/jobs.tsx`, the Today's-job card in `(tabs)/dashboard.tsx`, the rewritten `project/[id].tsx`), `backend/routes/projects.py` (the two crew routes only, declared above `/projects/{project_id}`), one new test file `backend/tests/test_c2_crew_jobs.py`, and — only if you choose to move the shared pieces — a new crew-only folder `frontend/components/crew/`. Nothing under `app/admin/*`; no other backend file; no env change; no new package.
2. The route payloads are allow-lists built field by field (§5). No estimate or project document is ever passed through; no money key ever leaves the server. The isolation test walks the JSON to prove it.
3. Every string, size and colour is in the spec or the prototype; where the spec says "as built", keep today's behaviour. No notices, no banners, no duplication. The crew app has no AI of any kind.
4. Testing agent at **390 × 844 first, then 360 × 800**, with a **phone user agent** (follow-up A), on the `TS_` tenant; `TS_` rows only, torn down; `project_a`'s crew restored; the owner's real tenant read-only.
5. Create the What's new entry as a **Draft** (text in §8). Never publish.
6. Report at the end, starting with the words **"Round C2 done"**: each verify item (§7) as agent-tested or Unverified; the testing-agent iteration number at both sizes; the isolation-test run; backend changes (the two routes and the test file, nothing else), env changes (none), deleted files, removed routes, redirects added; then a §8 "spec silences" list for the owner. Then stop.

Spec (verbatim from `c2-jobs-notes.md`):

## 1. Josh's answers (11 Oct) and what they settle

| § 6.9 item | Josh | In C2 |
|---|---|---|
| Client's name | **yes** | Shown as its own line under the job title (the title is the job's `name`, which is never the client's name, see §2). |
| Client's phone | **only a site manager, if any** | The CRM already has a contact role **`site`, labelled "Site contact"** on every client; Josh confirmed (11 Oct) that this is the site manager. The job page shows that contact's name and mobile with a tel: link when one exists. The client's own phone is never read. |
| Client's CRM notes | **no** | Never read: `customers.notes` and `customers.contacts[].notes`. |
| The quote's "on paper" wording | **no** | Never read: `scope_summary`, line descriptions. |
| Portfolio | **correct** | Jobs › **Done** is the crew member's portfolio: the finished jobs they were assigned to, each with its photos. Per person; no separate screen; the word "Portfolio" appears nowhere. **Done = status `done` or `invoiced` (Josh, 11 Oct, corrected): a job stays in the crew's Done list, and their portfolio, after the owner invoices it; the crew never see the word "invoiced".** |
| Show the quoted work | **always, to the assigned crew** | No per-job switch. Scope, colours, files ("Crew can see" only) and photos show to every crew member assigned to the job. Optional lines the client did not accept are left out (Josh, 11 Oct). |

## 2. What exists today (from the code)

- Crew can read **nothing** of a job except `GET /projects/{id}/photos` (assigned jobs only: `items`, `photos_link`, `estimate_id`, and since Round 46 `attachments` = the "Crew can see" files). The crew photo screen (`app/employee/project/[id].tsx`, 19 lines) then calls `GET /estimates/{id}` — admin-only, 403 swallowed — so its title falls back to "Job photos". No employee route returns `crew_notes` today; nothing the owner marks "Visible to the crew" reaches a phone yet.
- **A job's `name` is normally not the client's name.** On the two main paths (admin Convert, client accept: `routes/projects.py:440–444`) `name` = the quote's job tag, else "street, suburb", else "Estimate {number}" ("Never the bare client name"), and `client_name` is stored beside it. On the third path (the admin sets a quote's status to accepted: `routes/estimates.py:318–345`) `name` = job tag, else the client's full name, else the customer's name, else the address, and **no `client_name` field is written**. The client's name is on `client_snapshot.name` on every path; the client's phone is `client_snapshot.phone` (the admin page's tel:/sms: buttons read it; the crew route never does).
- **Address:** at creation both `client_snapshot.address` and `location_address` are copied from the quote's `clientAddress`, not from its `jobAddressDetails` (`routes/projects.py:435, 482–484`). The admin page's "Edit location" writes `location_address` + the pin (`PATCH /projects/{id}/location`, `:822–856`), but the admin page itself keeps displaying `client_snapshot.address` (`JobSiteCard.tsx:23, 50, 68`), so an edited site address shows only as the moved pin. The crew route returns `location_address` when set, else `client_snapshot.address` (the site, not the client's postal address). (Admin-side quirk; flagged for Josh.)
- **Crew notes:** the builder's Quote details drawer saves `crew_notes` (one text) and `crew_visible` (one switch, "Visible to the crew"). The switch is persisted by the builder's PUT autosave; the drawer's PATCH drops it because `crew_visible` is not in the PATCH allow-list (`routes/estimates.py:417`). The project drawer's Notes tab writes a **list** shape (`[{id, text, crew_visible: false, …}]`) with no way to flip a note on. C2 reads both shapes. An empty string is "no note".
- **Scope:** on a migrated estimate the work is `areas[]` (`id, name, width, length, height, notes, order`) plus `lines[]` joined on `line.area_id` (`services/estimate_lines.py`). The existing helper **`flatten_estimate_lines(estimate, products)`** (`:295–317`, the one list behind Client view, the public page, the PDF and invoices) already returns one row per line in area order: `id, area_id, area_name, area_dims, area_note (only when the area's note is marked show-on-quote), name, sub ("prep · primer · 2 coats" for library lines, "repair", or the category), qty, unit, optional, chosen, photo_url, product {id, brand, name, pack, colour, surface} | null, hazard` plus money (`rate, total, line_total, unit_price`) and aliases. There is no `finish` field. Optional lines come back with `optional: true` and `chosen` (in `accepted_options`); the ones not chosen were not sold.
- **Paints and colours:** `project_materials` rows (`material_name, brand, size_label, colour, colour_code, quantity`; money fields `unit_cost, is_custom_price, line_cost, subtotal`). For a v2 quote these rows are **empty at creation** (`_copy_estimate_colours` reads only `estimate.materials` + `estimate.products`, never the lines' `product_id` / `colour`), so the route also derives products from `estimate.lines[]` where `product_id` is set (brand and name from `db.materials`, `pack` as the size, `colour`, the area names).
- **Crew:** `projects.assigned_employee_ids` (absent, not `[]`, until the owner first saves the crew); names from `employees.name`; role = `role`, else `role_label`, else `position`, else "Painter".
- **Variations:** `project.variations[]` `{id, title, description, price, timeframe, area, notes, lines [{name, category, unit, qty, rate, kind}], status, created_at, sent_at, responded_at, responded_by}`; `status` moves `draft → sent → approved | declined`.
- **Daily reports:** `daily_reports` rows `{employee_id, project_id, submitted_at (naive UTC), hours_worked, tasks_completed (the whole WEATHER / TEAM / TASKS / CHECKLIST block), issues_notes, photos, admin_feedback, feedback_at, feedback_by, deleted_at}`; `parse_report(tasks_completed, issues_notes)['done']` gives the work lines; Replied = `admin_feedback` non-empty. **Crew-filed reports carry `project_id: null` today**: the crew form's job picker calls admin-only `GET /projects` (403 → empty list). So "My reports" on a job stays empty until C4 rewires the picker to the C2 list route.
- **Files:** `crew_rows(project_id)` → `[{id, name, kind (pdf | img | doc), size, open_url}]`, newest first, max 50; `open_url` is a 10-minute signed link.
- **Owner's first name:** `admin_settings.business_profile.owner_name` (what photo bylines use), else `admins.owner_name`.
- **Statuses:** `quoted, in_progress, on_hold, done, invoiced`; dates `start_date, target_end_date, completed_date`.

## 3. The §6.9 lists mapped to data

| List | Item | Source | On the job page |
|---|---|---|---|
| Show | Job name | `projects.name` | Title (Fraunces 27) |
| Show | Client's name | `client_snapshot.name` (fallback `client_name`; null on a manual job) | Line under the title: "{client} · {address}"; the client is dropped from this line when it already is the title (admin-accept path), the address when it already is the title |
| Show | Address, map link | `location_address` (fallback `client_snapshot.address`), `location_lat/lng` | Same line; **Directions** opens Google Maps with the address (same query as the admin page) |
| Show | Start and finish dates | `start_date`, `target_end_date`, `completed_date`, `status` | "Dates & crew" card: "{start} → {target}"; done jobs "{start} → done {date}" |
| Show | Who else is on the job | `assigned_employee_ids` → `employees.name` | Second line of "Dates & crew"; Today's card "Tom with you" / "Just you on this job" |
| Show | Site contact (name, mobile) | the job's `customer_id` → `customers.contacts[]` where `role == "site"` → `{name, phone}` (new behaviour: nothing reads this role today) | One row "Site contact · {mobile}" with a tel: link, only when such a contact exists; nothing else from the contact is read |
| Show | Site and access notes | `estimate.crew_notes` when `crew_visible !== false` and non-empty (string shape), plus list-shape notes with `crew_visible === true` | "Access & notes" card, "From {owner first name}:", amber left rule; absent when there is nothing to show |
| Show | Scope per area | `flatten_estimate_lines()` rows grouped by `area_id`; rows with `optional` and not `chosen` dropped | "The work": one block per area (`area_name`, `area_dims` when measured, `area_note` when present), lines "{name} · {qty} {unit}" with the row's `sub` on the right; **`rate`, `total`, `line_total`, `unit_price` are never copied** |
| Show | Products and colours | `project_materials` rows + the `product` of each flattened line (deduped by product id + colour) | "Paints & colours": swatch from `colour_code` (neutral grey when none), "{colour} · {where}", product and brand |
| Show | Job photos | existing `GET /projects/{id}/photos` + `ProjectPhotos` with the `crew` prop | "Photos · N" grid + Add (the Round 14 crew view, reused as a section) |
| Show | Daily reports for the job | `daily_reports` where `employee_id` = me, `project_id` = this job, `deleted_at` null; newest first | "My reports": date (`submitted_at` in the business's timezone), hours (`hours_worked`, "No hours" when null), the parsed work lines, **Replied** pill when `admin_feedback` is set |
| Show | Approved variations as "added work" | `variations[]` with `status == "approved"`: `title, description, area, timeframe, responded_at, lines [{name, qty, unit}]` | Extra blocks inside "The work", titled with the variation's `title`, pill "Added work · approved {d Mon}" |
| Never | Prices, margins, discounts, payment status, invoices, the client's own phone, client email and message history, CRM notes, the quote's paper wording, Lucy | — | The route builds its payload from an **allow-list** (§5); no money field, no `client_snapshot.phone`, no `notes` of a customer or contact is ever read |

## 3b. What C1 left behind that C2 builds on (from the Round C1 report, 12 Oct)

- The tab bar, the Inbox badge store, `Row` / `Sect` / `List` / `TabHeader` and the time formatters are named exports of `app/employee/(tabs)/_layout.tsx`. C2 may import from there, or move them to a new crew-only folder `components/crew/` (nothing else lives there) and re-point the C1 imports.
- Device rule (follow-up A): `utils/device.ts` `isPhone()`; the `(tabs)` layout, `login.tsx` and `onboarding.tsx` render nothing and redirect a non-phone to `/admin/login`. The new Jobs tab inherits the guard from the group; the job screen `project/[id].tsx` sits outside the group and **gets the same guard** (first line of the component, as in `login.tsx`).
- Test crew: `crew.alpha.one@ts-pthq.example` (TS_ Alpha). `crew.alpha.two` is the red-flagged one.
- The old `dashboard.tsx` is gone; Today is `app/employee/(tabs)/dashboard.tsx`. The Today's-job card goes under the time-clock card there.
- `notifications.tsx` is a redirect to `/employee/inbox`.

## 4. What a crew member sees after C2

**Jobs** tab: segmented **Now · Coming up · Done**. Rows: job name, status pill ("In progress" green; "On hold" amber; "Starts {Mon 20 Oct}" purple; "Done {Fri 3 Oct}" grey), "{client} · {address}", "{dates} · {n} on the crew". Buckets: Now = `in_progress` or `on_hold`; Coming up = `quoted`; Done = `done` or `invoiced` (both carry the pill "Done {completed_date}"; nothing on the crew side says invoiced). Sort: Now and Coming up by `start_date` ascending (no date last); Done by `completed_date` descending. Empty lines: "No job on the go right now." / "Nothing booked yet." / "No finished jobs yet."

**Job screen** (stack screen at `/employee/project/{id}`, replaces the 19-line photos page): back "Jobs", title, client · address line, buttons **Directions** and **Daily report** (opens `/employee/daily-report?project={id}` so C4 can preselect the job); then Dates & crew, Site contact (only when one exists), Access & notes (only when there is a visible note), The work, Paints & colours, Files (rows open the signed `open_url`; the page re-fetches the job before opening a row older than ten minutes; empty: "No files shared for this job."), Photos · N (grid + Add), My reports (empty: "No reports for this job yet."). Nothing on the page shows a dollar sign.

**Today** gains the **Today's job** card: the first Now job by `start_date` (name, client · address, pill, who else is on it, the access note on one line, **Directions**, **Open job**); with more than one Now job a last line "and {n} more on the go" opens the Jobs tab; none: "No jobs assigned to you yet." The clock card's job line stays `project_name` until C3.

## 5. Backend (the first crew routes of the crew app)

House convention for crew reads is `<resource>/mine` or `my-*` (`/employee-contracts/mine`, `/equipment/my-items`, `/daily-reports/my-reports`, `/timeclock/my-records`, `/validations/my`), so:

- **`GET /projects/mine`** — `current_employee: dict = Depends(get_current_employee)`; filter `{"owner_admin_id": current_employee["owner_admin_id"], "assigned_employee_ids": current_employee["id"]}` (the dependency already carries `owner_admin_id`; no second employee lookup). Returns `[{id, name, client_name, address, status, start_date, target_end_date, completed_date, crew_count}]`.
- **`GET /projects/mine/{project_id}`** — same filter plus `_id`; 404 otherwise. Returns **only**: `id, name, client_name, address, location {lat, lng}, status, start_date, target_end_date, completed_date, owner_first_name, crew [{id, name, role}], site_contact {name, phone} | null, notes [{text, created_at}], areas [{id, name, dims, note, lines [{id, name, qty, unit, sub, product {brand, name, pack, colour} | null, photo_url}]}], added_work [{title, description, area, timeframe, approved_at, lines [{name, qty, unit}]}], materials [{name, brand, size_label, colour, colour_code, quantity, source: "job" | "quote"}], files [{id, name, kind, size, open_url}], photos_link, my_reports [{id, date, hours_worked, work_lines, has_feedback}]`. Built field by field; the estimate and project documents are never passed through. `areas` = `flatten_estimate_lines(est, products_map)` rows grouped by `area_id` in row order, rows with `optional and not chosen` dropped, each line copying only `id, name, qty, unit, sub, product, photo_url`; `materials` = the `project_materials` rows (`source: "job"`) plus each distinct line `product` (`source: "quote"`, `size_label` ← `pack`); `approved_at` = `responded_at`; `date` = `submitted_at` via `tz_for(owner_admin_id)`; `work_lines` = `parse_report(...)['done']`; `has_feedback` = `bool(admin_feedback)`; `photos_link` = the project's, else the estimate's; `site_contact` from a tenant-scoped `customers` read (`{"_id": customer_id, "owner_admin_id": …}`) after the assignment check, `null` when the job has no customer, the customer has no contacts, or none has `role == "site"`.
- **Both routes are declared in `routes/projects.py` above `@router.get("/projects/{project_id}")` (line 697)**, as `/projects/board` and `/projects/stats/yearly` are, or the admin route swallows "mine" and returns 403.
- The crew photo screen's `GET /estimates/{id}` call goes with the old page.

**Isolation tests** — new `backend/tests/test_c2_crew_jobs.py` in the Round 43 fixture style (`admin_a, admin_b, crew_a, crew_a_new, crew_b, seed`; `TS_` rows only, torn down; random order safe). A module fixture saves `prev = admin_a.get(f"/projects/{seed['project_a']}").json().get("assigned_employee_ids")`, sets the crew to `[crew_a.id]` via `PUT /projects/{id}/crew`, yields, restores `prev` (the `test_r46_attachments.py` pattern). Cases:
1. `crew_a.get("/projects/mine")` lists `project_a`; the detail returns 200 with the keys above.
2. `crew_b.get("/projects/mine").json() == []`; `crew_b.get(f"/projects/mine/{project_a}").status_code == 404`.
3. `crew_a_new` (same business, not assigned) → 404 on the detail, and the list does not contain `project_a`.
4. `admin_a` and `admin_b` → 403 on both routes (`get_current_employee`).
5. Walk the detail JSON: none of `price, total, subtotal, tax, discount, cost_price, sell_price, unit_cost, rate, payment, invoice, email, notes, client_snapshot` appear as keys at any depth; `phone` appears at most once, at `site_contact.phone`.
6. With a TS_ customer carrying contacts `[{role: "site", name, phone}, {role: "accounts", …}]`, `site_contact` equals the site row's name and phone; with no `site` row it is `null`.
7. A TS_ estimate with `crew_visible: false` → `notes == []`; flipped on → the text appears.
8. An approved TS_ variation appears in `added_work`; a draft one does not.
9. `project_a` set to `status: "invoiced"` → still in `crew_a`'s list with `status: "invoiced"` and the detail still 200; the payload carries no invoice, payment or money key; restored afterwards.

**Backend changes:** two read routes, one test file. **Env changes:** none. **Deleted files:** none (the photo page is rewritten in place).

## 6. Admin-side facts Josh should know (no admin change needed for C2)

- No new field for the site manager: the CRM contact role **`site` ("Site contact")** already exists on every client (`components/crm/v2/Contacts.tsx`, `routes/customers.py:82–83`). Contacts left as migrated "Name — 04xx" rows have no role until tidied and will not show to the crew. Optional one-line hint in the contact editor's Role field, if Josh wants it: "Site contact — their name and mobile show on the job for the assigned crew." (Admin chat.)
- The builder's "Visible to the crew" switch is saved by the PUT autosave, not by the PATCH (`crew_visible` is missing from the allow-list at `routes/estimates.py:417`); the project drawer's Notes tab can never make a note crew-visible. (Admin chat.)
- A job's address comes from the client's address, not the quote's job address, and the admin job page keeps showing the client's address after "Edit location" (only the pin moves) (§2). (Admin chat.)

## 7. Verify (testing agent, 390 then 360, TS_ tenant)

1. Jobs: a TS_ crew member assigned to four jobs (in progress, quoted with a start date, done, invoiced) sees all four in the right segments — the invoiced one under Done with the "Done {date}" pill — with client · address lines and crew counts; an unassigned fifth job never appears.
2. Job page: title = the job's name; client · address line; Directions opens Maps; Dates & crew names the other assigned crew; Site contact row shows for a client with a `site` contact and is absent otherwise; the access note shows only when the quote's switch is on and vanishes when it is off; areas and lines match the quote's areas (qty, unit, `prep · primer · N coats`), no `$` anywhere on the page; colours match the project's Products rows and the quote's product lines; a file marked "Crew can see" opens, one not marked is absent; the photos grid adds a photo (as Round 14); My reports lists this crew member's reports for this job only, Replied where feedback exists.
3. Added work: an approved variation shows as an extra block with its title and pill; a draft or declined one does not.
4. Today's job card: the in-progress job; Open job → the page; "and 1 more on the go" with two Now jobs; "No jobs assigned to you yet." with none.
5. `test_c2_crew_jobs.py` passes; suite green before and after; TS_ torn down; `project_a`'s crew restored; the owner's tenant read-only.
6. 390 and 360: no horizontal scroll, no console errors, `tsc` clean, `app/admin/*` diff empty.

## 8. What's new draft (owner-facing, Draft only)

**Title:** Your crew can see their jobs
**Body:** Each crew member now has a Jobs tab with the jobs you assign them: the job and client, the address with directions, the dates, who else is on the job, the site contact's number when the client has one, the work per area as it was quoted, the paints and colours, the files you marked "Crew can see", the photos, and their own daily reports. Your crew notes from the quote show when "Visible to the crew" is on. Prices never leave the office. Assign crew on the job page as you do now.

## 9. Josh's answers (11 Oct)

1. "Site manager" = the CRM role labelled **Site contact** — **yes**.
2. Optional lines the client did not accept are left out of "The work" — **yes**.
3. "Done" includes invoiced jobs — **yes** (corrected 11 Oct after a first "no"). Done = `done` or `invoiced`; the crew side never shows the word invoiced.

Nothing is open on C2. It waits on the C1 review and "Round C1 done".

# C2 — Jobs: my jobs, the job page, the crew-only read route (proposal, not sent)

Prototype: the **Jobs** tab and the **job screen** in `c1-crew-shell.html` (`?screen=app&tab=jobs`, `?screen=job&id=j1`, `?screen=job&id=j2` for a job with no files, `&jobs=0` for a crew member with no jobs). Built from handover **§6.9** (Show / Decide / Never) and the code facts in `crew-recheck-11oct.md` §5. Status: **proposal**; Josh's answers on the Decide items and the Portfolio question are still to come (they did not reach this chat). Nothing goes to Emergent before "send", and C2 goes only after "Round C1 done".

## 1. What exists today (short)

- Crew can read **nothing** of a job except `GET /projects/{id}/photos` (assigned jobs only: photos, `photos_link`, `estimate_id`, and since Round 46 the `crew_visible` files). The crew photo screen then calls `GET /estimates/{id}`, which is admin-only → 403, so its title falls back to "Job photos".
- The admin side already marks things for the crew: the estimate's **Crew notes** with the switch **"Visible to the crew"** (builder › Quote details, "Shown on the job in the crew app once this becomes a project"), **files** "Crew can see", **product colours** ("what the crew read to know what tin to open"), **photos** ("Crew see this grid in the employee app"), **assigned crew** (`assigned_employee_ids`).
- Two shapes of crew notes exist: the builder saves one text + one switch; the project drawer's Notes tab saves a list of notes each with `crew_visible: false` and no way to flip it. Only the builder's notes can reach the crew today. (Admin-chat matter; C2 reads both shapes.)

## 2. The §6.9 lists mapped to data

| List | Item | Source | On the job page |
|---|---|---|---|
| Show | Job name, address, map link | `projects.name`, `client_snapshot.address`, `location_lat/lng` | Title + address line; **Directions** opens Google Maps with the address (same query as the admin page) |
| Show | Start and finish dates | `start_date`, `target_end_date`, `completed_date`, `status` | "Dates & crew" card: "{start} → {target}"; done jobs "{start} → done {date}" |
| Show | Scope per area | `estimate.areas[]` + its lines (`lineItems`/`lines`): name, quantity + unit, coats, the line note | "The work": one block per area, lines as "{name} · {finish} · {coats} coats"; **no price field is read** |
| Show | Products and colours | `project_materials` rows: `material_name`, `brand`, `size_label`, `colour`, `quantity` | "Paints & colours": swatch (named colour → the swatch stays neutral grey when no hex is known), colour · where, product |
| Show | Site and access notes | `estimate.crew_notes` when `crew_visible !== false` (string), plus list-shape notes with `crew_visible === true` | "Access & notes" card, "From {owner first name}:", amber left rule |
| Show | Job photos | existing `GET /projects/{id}/photos` + `ProjectPhotos` with the `crew` prop | "Photos · N" grid + Add (the Round 14 crew view, reused as a section) |
| Show | Daily reports for the job | `daily_reports` where `employee_id` = me and `project_id` = this job | "My reports": date, hours, work line, **Replied** pill when feedback exists |
| Show | Approved variations as "added work" | `project.variations[]` with `status == "approved"`: `title`, `description`, `area`, `timeframe`, `responded_at`, `lines[] {name, qty, unit}`; never `price` or a line's `rate` | Inside "The work" as extra blocks titled with the variation's `title` and the pill "Added work · approved {responded_at as d Mon}" |
| Show | Who else is on the job | `assigned_employee_ids` → names | "Dates & crew" card second line; Today's card "Tom with you" / "Just you on this job" |
| Decide | Client's name and phone | `client_snapshot.name`, `.phone` | Prototype: the job is **titled with the client surname** (that is what `projects.name` holds for quoted jobs); **no phone**. Josh decides. |
| Decide | Client's CRM notes | customer record | Prototype: **not shown**. Josh decides. |
| Decide | The estimate's "on paper" wording | `scope_summary`, line descriptions | Prototype: **not shown**; the per-area lines are clearer on a phone. Josh decides. |
| Never | Prices, margins, discounts, payment status, invoices, client email and message history, Lucy | — | The route builds its payload from an **allow-list**; no money field is ever read. |

**Portfolio** (§6.9): the prototype treats **Jobs › Done** as the crew member's own portfolio: the finished jobs they were assigned to, each with its photos. Per person, no separate screen. Josh to confirm, and whether the name "Portfolio" should appear anywhere.

## 3. What a crew member sees after C2

**Jobs** tab: segmented **Now · Coming up · Done**. Rows: name, status pill ("In progress" green; "On hold" amber; "Starts {Mon 20 Oct}" purple; "Done {Fri 3 Oct}" grey), address, "{dates} · {n} on the crew". Buckets: Now = `in_progress` or `on_hold`; Coming up = `quoted`; Done = `done` or `invoiced`. Sort: Now and Coming up by `start_date` ascending (no date last); Done by `completed_date` descending. Empty lines: "No job on the go right now." / "Nothing booked yet." / "No finished jobs yet."

**Job screen** (stack screen, `/employee/project/{id}`, replaces the 19-line photos page): back "Jobs", title, address, buttons **Directions** and **Daily report** (opens `/employee/daily-report?project={id}` so C4 can preselect the job); then Dates & crew, Access & notes (only when there is a visible note), The work, Paints & colours, Files (rows open the signed `open_url`; empty: "No files shared for this job."), Photos · N (grid + Add), My reports (empty: "No reports for this job yet."). Nothing on the page shows a dollar sign.

**Today** gains the **Today's job** card: the first Now job by `start_date` (name, address, pill, "Tom with you", the access note on one line, **Directions**, **Open job**); with more than one Now job a last line "and {n} more on the go" opens the Jobs tab; none: "No jobs assigned to you yet." The clock card's job line stays `project_name` until C3.

## 4. Backend (the only new routes of the crew app so far)

- `GET /employee/projects` — employee JWT (`get_current_employee`); `db.projects.find({owner_admin_id: emp.owner_admin_id, assigned_employee_ids: emp.id})`; returns `[{id, name, address, status, start_date, target_end_date, completed_date, crew_count}]`.
- `GET /employee/projects/{id}` — same filter, 404 otherwise; returns **only**: `id, name, address, location {lat, lng}, status, start_date, target_end_date, completed_date, owner_first_name, crew [{id, name, role}], notes [{text, created_at}], areas [{name, lines [{name, quantity, unit, coats, note}]}], added_work [{title, description, area, timeframe, approved_at, lines [{name, qty, unit}]}], materials [{name, brand, size_label, colour, quantity}], files [{id, name, kind, size, open_url}] (the Round 46 `crew_rows`), photos_link, my_reports [{id, date, hours_worked, work_completed, has_feedback}]`. Built field by field from the allow-list above; the estimate document is never passed through.
- Both routes in `routes/projects.py`, employee dependency, business check first (`owner_admin_id`), assignment check second.
- **Isolation tests** (`tests/test_tenant_isolation.py` extended, `TS_` rows only, torn down): an employee of TS_ business B gets `[]` from the list and 404 on A's job; an employee of A **not assigned** to the job gets 404; an admin JWT gets 403; the detail payload contains none of `price, total, subtotal, tax, discount, cost_price, sell_price, unit_cost, payment, invoice, email, phone` as keys at any depth (asserted by walking the JSON).
- The crew photo screen's `GET /estimates/{id}` call goes (it was a 403).

## 5. Admin-side change Josh sends with this round (one line, admin files)

- The estimate's "Visible to the crew" switch keeps its meaning (crew notes). **No new switch**: the scope, colours, files and photos are shown to assigned crew by the rules above (files only when "Crew can see"). If Josh wants a per-job "Show the quoted work to the crew" switch, that is a `projects.crew_sees_scope` boolean, a checkbox in the project page's Crew card, and the route hides `areas` + `added_work` when it is false — say so and it goes into the spec.

## 6. Verify (testing agent, 390 then 360, TS_ tenant)

1. Jobs: a TS_ crew member assigned to three jobs (in progress, quoted with a start date, done) sees them in the right segments with the right pills; an unassigned fourth job never appears.
2. Job page: title/address from the project; Directions opens Maps; Dates & crew names the other assigned crew; the access note shows only when the estimate's switch is on and vanishes when the admin turns it off; areas and lines match the estimate's areas, no `$` anywhere on the page; colours match the project's Products rows; a file marked "Crew can see" opens, one not marked is absent; photos grid adds a photo (as Round 14); My reports lists this crew member's reports for this job only, Replied where feedback exists.
3. Added work: an approved variation shows as an extra block with its pill; a draft or declined one does not.
4. Today's job card: the in-progress job; Open job → the page; "and 1 more on the go" with two Now jobs; "No jobs assigned to you yet." with none.
5. Isolation tests pass; suite green before and after; TS_ torn down; the owner's tenant read-only.
6. 390 and 360: no horizontal scroll, no console errors, `tsc` clean, `app/admin/*` diff empty.

## 7. What's new draft (owner-facing, Draft only)

**Title:** Your crew can see their jobs
**Body:** Each crew member now has a Jobs tab with the jobs you assign them: the address with directions, the dates, who else is on the job, the work per area as it was quoted, the paints and colours, the files you marked "Crew can see", the photos, and their own daily reports. Your crew notes from the quote show when "Visible to the crew" is on. Prices never leave the office. Assign crew on the job page as you do now.

## 8. Open questions for Josh (one line each)

1. Decide items: client name as the job title — yes? Client phone — no? CRM notes — no? "On paper" wording — no?
2. Portfolio = Jobs › Done, per person — yes? Any place the word "Portfolio" should appear?
3. A per-job "Show the quoted work to the crew" switch (§5) — wanted, or always show to assigned crew?
4. Should "Done" also include invoiced jobs (yes in the prototype)?

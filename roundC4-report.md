# Round C4 done — Daily report: the crew form rebuilt, opened from the job, photos on the job, the owner's reply shown (14 Oct)

(Pasted verbatim from the job on 23 Oct: `memory/reports/roundC4-daily-report-report.md`.)

Spec: `memory/specs/crew/c4-daily-report-notes.md`. Prototype: `memory/specs/crew/c1-crew-shell.html` (C4 screens). Testing agent **iteration 141** — 390 × 844 then 360 × 800, iPhone UA, TS_ demo tenant, all seven checks pass, teardown done. Backend `tests/test_c4_crew_daily_report.py` **7 passed**; full suite before 783 / after **790 passed, 114 skipped, 0 failed** (Round 19 daily-report tests and `test_tenant_isolation.py` included). `tsc` clean, ruff clean on the touched files. `app/admin/*` diff empty; `git diff --stat components/daily-report/` = the two deletions only; the owner's "New report" modal untouched.

## §8 verify
1. Today › End of day → list; job page Daily report button → `/employee/daily-report/new?project=` with the job preselected and its crew chips; the C2 link `/employee/daily-report?project=` redirects to the same form — **agent-tested**.
2. Clock-signed-in job preselected · hours prefilled from the clock — **agent-tested for the "not clocked on" branch ("0.0", first Now job / General)**; the signed-in branch is Unverified in the browser (logic reads `/timeclock/status` `session.sign_in_time` + `/timeclock/my-hours` `days[]` as spec). General → "Where were you?" — agent-tested. No jobs → General — agent-tested (crew whose only job was invoiced).
3. Inline errors, Send, list under Today with Flagged, stored document (`project_id`, `flagged`, `issues_notes`, `date`, `WEATHER: Sunny, Windy`, four checklist lines, `ADDITIONAL NOTES:`), owner page Flagged pill + banner text — **agent-tested**. Photo upload through the OS picker — **Unverified** (browser automation cannot drive the picker; the choice sheet + Cancel agent-tested; upload path is the same multipart `file` call as `DailyReportPhotos`). Photo on the job page as "Day n · site photo" — **backend-tested** (`rep:{id}:0`, `source report`, `at == date`).
4. Owner reply → Replied pill, reply card by first name, notification deep link opens the report — **agent-tested**.
5. One report (flagged, replied), Edit under 24 h prefilled, General + cleared hours → "No hours · edited", no Edit after 24 h — **agent-tested**.
6. Owner soft-delete → gone from list, `mine/{id}` 404 → "Report not found" line; restore → back — **agent-tested**.
7. Tests green before/after; TS_ torn down; owner tenant read-only — **done**.
8. Two modals deleted; other `components/daily-report/*` byte-identical — **done**.
9. 390 and 360: no horizontal scroll, Send bar visible, no console errors, `tsc` clean, `app/admin/*` empty — **agent-tested**.

## Backend changes (`routes/daily_reports.py`)
- `DailyReportCreate.flagged: bool = False`; `DailyReportUpdate.flagged: bool | None`.
- Create: `flagged` / `flagged_at`; `date` = business-local date of `submitted_at` (only when the tenant is known); employee `author_name` = the employee document's `name`.
- `GET /daily-reports/my-reports`: allow-list rows (`id, date, day_label, sent_label, project_id, project_name, job_site, hours_worked, flagged, issues_notes, photos, done, tomorrow, team, weather, checklist, notes, can_edit, edited, feedback`), `deleted_at: None` filter, business-tz labels, `notes` only when the block has `ADDITIONAL NOTES:`, `feedback.by_first_name` from `owner_name` (never `feedback_by`).
- New `GET /daily-reports/mine/{report_id}` (declared before the admin `/{report_id}` route).
- PUT: 404 on deleted, 403 not own, 400 > 24 h, 404 project of another business; `model_dump(exclude_unset=True)` so sent nulls clear (`photos: null` → `[]`, `tasks_completed`/`job_site` nulls dropped); `flagged` sets/clears `flagged_at`, `flagged: false` clears `issues_notes`; `updated_at` stamped.
- Env changes: none. New packages: none. Removed routes: none. Deleted files: `components/daily-report/ViewReportModal.tsx`, `EditReportModal.tsx`, `app/employee/daily-report.tsx` (→ folder).

## Frontend
`app/employee/daily-report/index.tsx`, `new.tsx`, `[id].tsx`; `components/crew/ReportForm.tsx`; `app/employee/project/[id].tsx` one line. `JobPicker` reused unchanged; `useCrewJobs` read only. Navigation exactly as §5 (`router.back` with dashboard fallback, `replace` for `?report=`/`?project=`, `push` for new/edit, `dismissTo('/employee/daily-report')` after Send and from the report's back). What's new draft **"Crew daily reports, rebuilt"** created (n 12, Draft, not published).

## Spec silences (for the owner)
1. `hoursTxt` prints "0.0" in the form when nothing is clocked; `formToApiFormat` stores that as null (spec-accepted) — the list then says "No hours". Alternative: leave the field empty when the clock total is 0.
2. The Flagged / Replied pills on the list use the app's danger/success tokens (no red tone exists in the crew `Pill` set; `(tabs)/_layout.tsx` was out of bounds) via a small `TonePill` in `ReportForm.tsx`.
3. Edit mode with a linked job shows the job name in the Job row with an empty sub-line (the row's "{client} · {address}" needs the jobs list; the sheet refreshes it on pick).
4. In the form's photo grid, a tile removed with × only drops the URL from the report; the uploaded file stays in storage (no delete route exists; as `DailyReportPhotos`).
5. `?edit=` on a report older than 24 h still opens the form; Save then gets the backend 400 as the inline Send error (the Edit link itself is hidden, so only a typed URL reaches it).
6. The "Which job?" sheet lists Now and Coming up jobs as in C3; a done/invoiced job cannot be picked for a report (General or the typed site instead).

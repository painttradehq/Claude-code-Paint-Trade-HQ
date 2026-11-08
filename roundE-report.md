# Round E report — read from the live repo (`painttradehq/the-newest-update-of-PTHQ`, commit `55a4f5a`, 7 Nov 2026) — ACCEPTED

Built 7 Nov 11:10 UTC (the uploads were on the job before the 8 Nov chat note). Read 8 Nov from the repo once GitHub access was restored; `ask-e-report.md` was not needed and was not sent. Diff `3cab602..55a4f5a`: 16 files, +973/−18 — `backend/routes/projects.py` (+96), `backend/services/crew_app_settings.py` (+10/−5), `backend/routes/project_photos.py` (1 line), `backend/tests/test_c2_crew_jobs.py` (1 line), new `backend/tests/test_e_crew_scope.py` (152), `frontend/app/employee/project/[id].tsx` (+11), new `frontend/app/employee/project/[id]/scope.tsx` (150), `frontend/components/crew/Lightbox.tsx` (+18/−6), `frontend/store/authStore.ts` (1 line), the three saved spec files, PRD, PARKING_LOT (tester-feedback commits in the same window) and Emergent's deployer RCA on the admin invoice question (not E's). Nothing under `app/admin/*`. Round 88 (admin, 8 Nov, `1acc836`) touched no crew file and confirmed `_crew_scope` iterates the flattened rows in `est.areas` order.

## My read of the code against the brief

- **Route** `GET /projects/mine/{id}/scope` (`get_current_employee`; C2's owner + assigned filter → 404; admins 403). Payload built field by field: `{summary, planned_hours, hours?, areas[{id, name, dims, note, hours?, area_photos[{url,name,note}], lines[{id, name, qty, unit, sub, prep, note, product{brand,name,pack,colour}|null, hours?, photos[{url,name,note}]}]}], added_work}`. No money key anywhere (`_product_row`'s `id`/`surface` are dropped; `rate`/`total`/`line_total` of the flattened rows never copied). Optional unchosen lines skipped. The show-on-quote note is stripped from `sub` (whole sub → null when the sub is the note). `migrate_estimate` runs once (the route migrates only when `lineItems` exist; `flatten_estimate_lines` then sees `lines` and does not migrate again — checked in the current `estimate_lines.py:326–328, :224–230`).
- **Hours** only when `crew_app_settings.scope.planned_hours` is true: `compute_line(...)["hours"]` per line rounded to one decimal, area = sum, top `hours` = sum; added work carries none. `hoursTxt` reused ("8.5 h", "2 h").
- **`scope_detail`** on C2's job payload = summary, or any area note / area photo / line note / line photo (product alone does not count); `DETAIL_KEYS` in `test_c2_crew_jobs.py` extended.
- **Settings**: `DEFAULTS["scope"]`, `validate_patch` bool-only → 400 `{field: "planned_hours", message: "planned_hours is true or false"}`, `for_admin` and `for_crew` pass `scope` through; `_merge` fills it for existing documents (checked `:38–43`).
- **Photos route**: `original_url` joins `upload_url` in `_strip` for crew callers (`project_photos.py:102`).
- **Frontend**: `scope.tsx` reads the scope route plus `GET /projects/mine/{id}` for the back label; summary card, area headers with dims (not uppercased) and hours, area note card, area photo grid, lines with inline detail (note, "Paint {brand} {name} · {colour}", photo grid), chevron only with detail, Added work list, Lightbox with caption and × (`crew-scope-lightbox-close`); `useFeature('photos')` hides every grid; 404 → "This job is not on your list."; test ids `crew-scope`, `-back/-title/-meta/-body/-summary/-area/-area-note/-area-photos/-line/-detail/-note/-product/-photos/-photo/-added/-lightbox/-lightbox-close/-error`. Job page: `crew-job-scope` row at the end of "The work", "{n} line(s) · the quote's notes and marked photos", two-line sub. `Lightbox.tsx`: optional `caption`/`closeTestID`; C6 callers unchanged. `authStore.ts`: `scope?`.
- **Tests**: 5 cases (fixture restores the estimate by snapshot, the crew assignment and the settings doc; `crew_a_new`/`crew_b` 404, `admin_a`/`admin_b` 403). Agent's `--collect-only`: 1,216.

## Verify items (§6) — all six agent-tested at 390 × 844 and 360 × 800, iPhone UA
As the report below says. Testing agent 62/66 at 390 (the four were its own script reading the chevron glyph), 51/51 at 360.

## Deviations / silences — my calls
1. Row at the end of "The work" (prototype) — fine.
2. Hours from the calculator (`mins.c2` + prep), not the spec's approximation — correct, as §5 intended.
3. An area with a note/photos but no kept line does not appear — leave (rare; the builder always has a line per area in practice). Parked.
4. No quote → empty skeleton, no row — fine.
5. Area-photo caption "{area} · {name}" — fine.
6. The job page's own sub-line keeps the show-on-quote note (C2) — leave.
7. Two-line row sub — fine.
8. Scope calls `GET /projects/mine/{id}` for the back label — works; a nit for a later pass: pass the name in the route params and drop the second call. Parked.
9. Photos switch hides area photos too — decision 7, fine.
10. No admin switch for planned hours yet — handover (already listed). Every business runs with hours hidden until then.
11. Scope summary absent on v2 quotes until the builder gets the field back — handover §10.4 (already listed).
12. `hoursTxt` as decision 2 — fine.
Extra nit (mine): the lightbox caption reads "Walls · Kitchen · Walls — Crack above the window" when the builder's photo name already contains the line name. One line: when `p.name` already contains the line name, caption = `p.name` + note. Parked for the next crew pass.

## Suite
Pre-existing, identical on `3cab602`: `test_r19_daily_reports::test_42` (+ its downstream isolation case), `test_r46_attachments` ×2 (crew 403 on a crew-visible attachment's PDF — crew-facing, pre-existing; in the admin handover and the crew fix list), `test_r63_worker`, `test_r78_contracts` ×2 (private blob served only by contract routes — the blob exposure, handover item 0). Harness order effects documented by the agent.

## What's new
Draft n 31 "The whole quote on the crew's phone, minus the money", body as §7, `draft`.

## Verdict
**ACCEPTED.** Nothing to send back. Carry into the next crew pass (not C6b): the caption nit, the back-label second call, silence 3 if Josh wants areas with only a note to show.

---

# The agent's report, verbatim (`memory/reports/roundE-crew-scope-report.md` @ 55a4f5a)

# Round E done — Scope: the quote as the owner built it, on the crew's phone, without money

Brief `memory/specs/crew/e-round-message.md`, spec `memory/specs/crew/c2-followup-e-notes.md`, prototype `memory/specs/crew/c1-crew-shell.html` (203 KB, replaces revision 9) — all three saved before work started. TS_ tenant only; the owner's tenant untouched; nothing published. `tsc` clean; `git status` shows nothing under `app/admin/*`.

## §6 verify items

1. **Job page row / bare job / skeleton** — agent-tested at 390 × 844 and 360 × 800 (iPhone UA, touch). `crew-job-scope` "Open the full scope" · "4 lines · the quote's notes and marked photos" on the TS_ job with notes and photos; no row on the TS_ job with a bare quote; that bare job's `/scope` deep link renders the skeleton (meta, areas, lines, no summary, no chevrons).
2. **Scope screen** — agent-tested at both sizes. Summary card; area label "KITCHEN · 4.2 × 3.6 × 2.4 m" with the unit kept lowercase; area note card; lines with qty + sub; "Walls · 32 m²" opens inline with the note, "**Paint** Dulux TS_ Product Wash&Wear · Natural White" and the photo tile showing the marked image; the photo opens the lightbox with caption "Walls · Kitchen · Walls — Crack above the window", × and tap-outside both close it; "Ceiling · 15 m²" has no chevron and does not open; the show-on-quote note ("Slide it out, protect the floor") appears exactly once.
3. **No money** — agent-tested. No "$" on the screen; the scope and job responses carry none of `price, total, line_total, unit_price, rate, original_url, upload_url, marks_v2, image_size` and no `hours`; the optional unchosen line is absent; `GET /projects/{id}/photos` as crew carries no `original_url` / `upload_url`.
4. **Planned hours** — agent-tested. Switch off → no hours anywhere. `PUT /admin/crew-app-settings {"scope":{"planned_hours":true}}` as the TS_ owner → meta "2 areas · 4 lines · about 13 h planned", "KITCHEN · … · 11 h", "HALLWAY · 2 h", subs "prep · 2 coats · 8.5 h", "0.5 h", "2 h", "2 h"; added work carries none; `"yes"` → 400 "planned_hours is true or false". Restored to false.
5. **Photos switch** — agent-tested. `features.photos` false → no photo grids on Scope (Walls keeps its chevron for note + paint); restored; Back lands on the job page.
6. **Tests** — `backend/tests/test_e_crew_scope.py` 5 cases green (detail flag + payload shape, money/unmarked-copy walk, planned-hours switch incl. the 400, photos route, isolation); `test_c2_crew_jobs.py` green with `scope_detail` in its key set; `test_r79_crew_settings.py` green. Suite before/after below. TS_ tenants torn down by the final harness run (0 TS_ admins left). `app/admin/*` diff empty. No `rm -rf` anywhere.

Testing-agent report: `/app/test_reports/iteration_e_crew_scope.json` — 390 × 844: 62/66 (the 4 were the agent's own script reading the Ionicons chevron glyph in `inner_text`, fixed in its script), 360 × 800: 51/51. Its one UI note — the row's sub-line was ellipsised at both widths — fixed (`numberOfLines={2}`). Its second note (the job page's own line sub still shows the show-on-quote note and wraps at 360) is C2 behaviour the spec leaves in place; listed under silences.

Isolation run: `test_5_isolation` — `crew_a_new` (same business, unassigned) 404, `crew_b` 404, `admin_a` 403, `admin_b` 403.

## Backend changes

- `routes/projects.py`: new `GET /api/projects/mine/{project_id}/scope` (`get_current_employee`; C2 filter → 404; admins 403) built field by field by `_crew_scope(est, products, planned_hours)` — `summary`, `planned_hours`, `areas[{id, name, dims, note, area_photos[{url, name, note}], lines[{id, name, qty, unit, sub, prep, note, product|null, photos[{url, name, note}]}]}]`, `added_work` (C2's, via the shared `_crew_added_work`); `hours` on line/area/top level only when the switch is on; the show-on-quote note is removed from `sub` (whole sub → null when `sub == note`); `migrate_estimate` once, then flatten and `compute_line` from that object. C2's detail route gains the additive `scope_detail` boolean from the same helper.
- `services/crew_app_settings.py`: `DEFAULTS["scope"] = {"planned_hours": False}`; `validate_patch` accepts `scope.planned_hours` as a bool only (else `SettingsError("planned_hours", "planned_hours is true or false")` → the route's 400 shape); `for_admin` and `for_crew` pass `scope` through.
- `routes/project_photos.py:102`: `"original_url"` added to the `_strip` tuple (crew callers).
- `tests/test_c2_crew_jobs.py`: `DETAIL_KEYS` + `scope_detail`. New `tests/test_e_crew_scope.py`.
- Frontend: new `app/employee/project/[id]/scope.tsx`; `app/employee/project/[id].tsx` one row (+ `scope_detail` on the type); `components/crew/Lightbox.tsx` optional `caption` / `closeTestID`; `store/authStore.ts` `scope?: {planned_hours: boolean}`. `app/employee/_layout.tsx` unchanged.
- Env changes: none. Deleted files: none (two scratch files the testing agent left in the tree — `backend/tests/test_e_crew_scope_money_api.py`, `tests/e_scope_ui.py` — were removed; they were never part of the repo). Removed routes: none. New packages: none.

## Test count

`pytest --collect-only -q tests` → **1 216 tests collected** (1 211 + the 5 new). One collection-time error is reported when the harness server is not running (a module that opens a connection at import) — it collects cleanly under `scripts/run_tests.sh`.

## Suite before / after

- Round E's modules and every crew/settings/photos module green standalone (`test_e_crew_scope`, `test_c2_crew_jobs`, `test_r79_crew_settings`, `test_fixF_part2`, `test_geo`, `test_iter91_admin_employee_bridge`, `test_iteration_61_geofence`, `test_r17b_feedback`, `test_r17c_legal`, `test_r26_invoice_setup`, `test_r45_contacts`, `test_r21_timesheets`, `test_r22_contracts`, `test_stay_signed_in`, `test_team_access`, `test_xero`, chunk 1 of 4 entirely green).
- Pre-existing, identical with the pre-Round-E backend checked out (`3cab602`) and with the round applied: `test_r19_daily_reports::test_42_filters_and_paging`, `test_r46_attachments` (2, signed attachment link 403), `test_r63_worker::test_harness_worker_started_and_logs_jobs`, `test_r78_contracts` (2, Round 87's baseline). Not touched by this round.
- Harness note: four alphabetical chunks run back to back share session fixtures that an earlier module revokes (password change / sign-out tests) → 401 "Session was signed out" in later modules of the same chunk, and `test_tenant_isolation::test_r19_daily_reports_isolation` needs `test_r19_daily_reports` to have run first. Order effects, not code; all those modules pass standalone. Run chunks with a pause so the previous harness server has released the port (`seed failed` otherwise).

## What's new

Draft **#31 "The whole quote on the crew's phone, minus the money"**, body as §7. Draft only — not published.

## Spec silences (for the owner)

1. **Where the row sits.** The spec says "after the areas"; the prototype puts it after the added-work rows at the end of "The work". Built as the prototype (end of the list).
2. **Library planned hours.** The spec's "qty × mins × coats / 60" is an approximation: the quote's calculator stores minutes per coat count (`mins.c2` for two coats) plus primer and prep minutes; the route uses that calculator (`compute_line`) as §5 says, so Walls 32 m² × (14 + 2) min / 60 = 8.5 h. The test asserts the calculator's figure.
3. **An area with no kept lines** (only photos or a note, or only an optional unchosen line) does not appear on Scope — blocks come from line rows, as C2. Its photos are not sent.
4. **A job with no quote** answers the scope route with the empty skeleton (`areas: []`, `summary: null`); the job page shows no row.
5. **Area-photo captions.** The spec gives "{line} · {name}" for line photos; area photos use "{area} · {name}" — the tile text is the photo's name else the area name.
6. **The job page's own sub-line** still carries a show-on-quote note (C2's `_sub_for`), so at 360 a long note wraps the line title; only Scope strips it, as the spec says. Left as is.
7. **The row's sub-line** needs two lines at 390/360 for the spec's exact text; set `numberOfLines={2}`.
8. **Back label.** Scope reads the job name from `GET /projects/mine/{id}` alongside the scope call (the scope payload has no name); the "no second call" rule in §4 applies to the job page's row, which reads `scope_detail` from the job payload.
9. **Photos switch** hides `area_photos` as well as line photos (decision 7); a line whose only detail is photos then has no chevron.
10. **Settings › Crew app** has no "Show planned hours to crew" switch yet (admin chat, §10.1) — every business runs with hours hidden until then; the tests and the agent set it through the PUT.
11. **Scope summary** will be absent on most v2 quotes until the builder gets the field back (§10.4); the TS_ quote carried one by direct write.
12. **`hoursTxt`** prints whole hours bare ("2 h") and one decimal otherwise ("8.5 h"), as decision 2; "No hours" is never reached (hours only when carried).

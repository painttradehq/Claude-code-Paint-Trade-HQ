# Round 98 fix — the connector's first live test (10 November) — READY, waits for Josh's "send"; backend only, no testing agent

Josh connected his Claude to the published door on 10 Nov and had it run a test on his own tenant (a client, a lead, quote EST-0030 accepted by hand, three invoices, a job with an expense, reminders). His Claude reported nine problems. Read against the code at `e1d4b4f` (GitHub `main`), they sort into **connector bugs** (Round 98's own — most of them the sixteen old read tools' field names, never checked against real documents), **two app items** for Fix Round J, and **two misreads** that are the app's design. This brief is the connector part. Save it as `memory/specs/connector/round98-fix-message.md`. TS_ tenants only; the owner's tenant read-only; no testing agent (nothing on screen); pytest + the §7 probes of Round 98 re-run; report `memory/reports/round98-fix-report.md` with the commit hash for Save to GitHub; stop after it.

## 0. Also, quietly: rotate the preview key

The preview key was printed in the Round 98 reply. Generate a new `MCP_API_KEY` for the preview `.env`, **do not print it anywhere**, and say only "preview key rotated". The production key is Josh's own and is not touched.

## 1. Every read returns the fields the app actually stores (the "blank fields", "jobs show no money", "$0 revenue" reports)

`services/connector_tools.py`'s `keep=[…]` lists came from the 2024 read tools and name fields that do not exist: estimates `customer_name` / `created_at` / `valid_until` (the app stores `clientName`, `createdAt`; validity is not a stored field), invoices `customer_name` / `paid_total` / `issued_at` / `created_at` (`clientName`, `amount_paid`, `issue_date`, `createdAt`), projects `customer_name` / `budget` / `expenses_total` / `live_margin` / `end_date` (`target_end_date`; the money is **computed**, never stored), customers `city` (`suburb`, `state`, `postcode`). Fix, for all twenty reads: take each field from a real TS_ document and from the screen that shows it, and return what the screen shows — in particular:

- `get_estimates`: `estimate_number, clientName, clientEmail, status, subtotal, discount_amount, tax_amount, total, createdAt, sent_at, accepted_at, declined_at, jobAddressDetails` (flattened to one `job_address` string as `_estimate_link_fields` builds it).
- `get_invoices`: `invoice_number, clientName, estimate_id, estimate_number, project_id, status, kind, milestone, subtotal, tax_amount, total, amount_paid, balance, issue_date, due_date, sent_at, paid_at, createdAt`; **a draft milestone / balance invoice is reported at the figure it would show when opened** — run the same recalculation `GET /invoices/{id}` runs (`invoices.py:288–293`, `lines_for_kind` + `apply_totals`) before reporting, and add `"draft_note": "recalculates against the quote when opened"` on drafts.
- `get_projects`: name, `clientName` (from the linked customer), status, `start_date`, `target_end_date`, `estimate_id`, `estimate_number`, `site_address`, crew names, and **the money the Job money card shows** — call the same function the project list and page use (`routes/projects.py:125–230`, the aggregate that gives `labour_cost`, `materials_cost`, `expenses_total`, `invoiced`, `paid`, `revenue`, `margin`) once for the listed ids; no field invented.
- `get_customers`: `name, company, email, phone, address, suburb, state, postcode, kind, source, tags, notes, created_at, last_touch_at`.
- `get_dashboard_summary`: the same numbers the dashboard shows (`services/dashboard_home.py`'s definitions), not an ad-hoc aggregate — and **pipeline excludes archived and declined quotes** ("archived quotes still count in pipeline value").
- `get_reminders` and the reminder writes return `remind_at` **in the business's local time with the zone named** (`"Wed 12 Nov 10:30 (Australia/Melbourne)"` plus the ISO local string), as Lucy's `_list_reminders` does.
- Every other read: the same check, field by field.

## 2. Reminders: creates are the bug, not edits

`routes/reminders.create_reminder` stores `remind_at` **as the string it receives**; `patch_reminder` converts a naive value from the business time zone to UTC. The connector's `add_reminder` schema says "business local time" and passes the string straight through, so a new reminder is stored as local-time text that the firing job reads as UTC (eleven hours late in Melbourne), while an edited one is stored right — which is why Josh's Claude saw the edit "shift" when it read the raw UTC back. Fix in the connector: `add_reminder` converts local → UTC exactly as Lucy's `ai_tools._add_reminder` does (`services.tenant_tz.local_to_utc`), `update_reminder` keeps the route's conversion, and both return the local time (§1). The route's own hardening (naive input normalised in `create_reminder` too) is an app item for Fix Round J so the UI path is safe as well.

## 3. Job status: the enums must be the app's

`get_projects`' filter enum offers `scheduled` and `cancelled`, which `PROJECT_STATUSES` (`models/project.py:7`: `quoted, in_progress, on_hold, done, invoiced`) does not have, and `update_job` takes any string and lets the route answer 400. Fix: both enums = `PROJECT_STATUSES`; the description says that "scheduled" is a start date in the future on a `quoted` job (the scheduler starts it — `start_scheduled_projects`), not a status.

## 4. Discount: the schema says what the builder sends

`update_quote` takes `discount` as an untyped object; the app treats any `type` other than `percent` as a dollar amount (`services/estimate_lines.py:163`), so `"percentage"` became $10. Fix: `discount: {enabled: bool, type: enum[percent, fixed], value: number, reason: string}` in the schema, and the wrapper normalises `percentage`, `%`, `pct` → `percent` and `dollars`, `amount`, `$` → `fixed` before the model. The same for `tax: {enabled, rate, label, inclusive}`.

## 5. A quote started for a converted lead links the lead

`convert_lead` leaves the lead at *contacted* by design; the lead becomes *won* when **its linked quote** is accepted (`sync_lead_for_estimate`), and the chooser links a lead only when it is given `lead_id`. Josh's Claude converted the lead, then started the quote with the new `client_id` only, so the lead never moved. Fix: `create_quote` with a `client_id` and no `lead_id` looks up that client's open lead (`status` in new / contacted / quoted, same tenant) and passes it as `lead_id`, exactly as starting the quote from the lead card does; `convert_lead`'s result carries `lead_id` and the line "start the quote with this lead_id so the lead moves to won on acceptance".

## 6. The balance invoice: drafts do not count, and the connector must say so

What Josh's Claude called an overcharge is the app's rule since Round 12: **a draft is not invoiced** (`crm_stats.NOT_INVOICED = draft, cancelled, credited, archived`), so with the deposit (INV-0006) and the progress invoice (INV-0007) still unsent, the "remaining balance" is the whole quote, labelled *"$0.00 already invoiced of $1,287.00"*; and a draft recalculates against the schedule when it is opened (`invoices.py:288`), so by the time INV-0006 and INV-0007 are sent, opening INV-0008 shrinks it to the true remainder. Nothing reaches a client until Send. Still, three drafts adding to $1,973 on a $1,287 quote is a trap, so:

- `create_invoice_from_quote` with `kind: balance` (or when `_resolve_kind` lands on balance) while **unsent drafts exist for that quote** returns `isError` with: *"INV-0006 and INV-0007 are still drafts, so the balance would be the whole quote. Send them first, or ask for the next milestone instead."* — the app's own figure, not a new rule. Josh's call §9.1 whether the app's invoice chooser gets the same guard (Fix Round J).
- `get_invoices` reports drafts at their recalculated figure (§1) and `get_estimates` carries `invoiced_total` and `still_to_invoice` from `schedule_plan`, so the sum Claude reads is the app's.

## 7. Verify (pytest + probes on the preview; TS_ Alpha)

1. Every read against a TS_ document seeded by the screen: no blank field that the screen shows; `get_projects` money equals the Job money card; `get_dashboard_summary` equals the dashboard; pipeline excludes archived and declined.
2. `add_reminder` "2026-11-12T10:30" → the app's calendar shows Wed 12 Nov 10:30 local, the stored value is UTC, the read says local; `update_reminder` the same.
3. `update_job` with `scheduled` → the tool refuses with the enum; `get_projects` filter enum = `PROJECT_STATUSES`.
4. `update_quote` with `{type: "percentage", value: 10}` → 10 % off, the builder shows the same.
5. `convert_lead` → `create_quote(client_id)` → `set_quote_status accepted` → the lead reads *won*.
6. A TS_ quote accepted (deposit draft made), `create_invoice_from_quote` with `balance` → the refusal naming the drafts; after the drafts are marked sent by the status route, `balance` → the remainder; `get_invoices` on an untouched draft equals what `GET /invoices/{id}` returns.
7. The Round 98 probe transcript re-run, green; `test_r98_connector.py` extended for each item above; suite green before and after; no file under `frontend/`.

## 8. For Fix Round J (app side, not this brief)

- The deposit draft made on acceptance has no `project_id` because it is raised before the project is spawned (`estimate_send.py:565` vs the deposit call): spawn the project first, or set `project_id` on that quote's invoices once the project exists. The money card already joins by estimate, so this is cosmetic.
- `create_reminder` normalises naive input (local → UTC) like `patch_reminder`.
- `compute_estimate` accepts `percentage` as `percent`.
- The invoice chooser's own guard when a balance is raised while drafts sit unsent (§9.1).

## 9. Josh's calls (defaults; "send" takes them)

1. **The balance guard in the app too** (the chooser refuses or warns the same way) — default **yes, in Fix Round J**. Alternative: the connector only.
2. **Money in `get_projects` and `get_dashboard_summary` from the app's own functions** (slower per call, always equal to the screen) — default yes. Alternative: the stored fields only, with the money left out.

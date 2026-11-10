**Order change, then Round 98.** Josh is short on credit, so: finish **Rounds 93 + 94** (running) and write their report. Then **hold Rounds 95 and 96** — do not start them; their briefs and prototypes stay saved for later. **Round 98 below is next**, straight after the 93 + 94 report. Backend only; no frontend file; no testing agent this round (there is nothing on screen to test — verify with pytest and JSON-RPC probes, §7). One round at a time — if a crew round is running, queue this behind it. TS_ tenants only; the owner's tenant read-only except the one read in §2; nothing published. Build exactly what is written here; nothing from the suggestion list; no code review. Save this message as `memory/specs/connector/round98-message.md`. File:line are as at `82bf0a3`; where a line has moved, find the function by name.

# Round 98 — Connect your Claude, owner only

Josh's own Claude (the Claude app on his phone, tablet and desktop, the web, Claude Code) works inside Paint Trade HQ through the door that already exists: the remote MCP server at **`/api/mcp`** (`backend/routes/mcp_server.py`, mounted in `server.py`). Today it has sixteen `get_*` read tools, one tenant fixed by `MCP_OWNER_ADMIN_ID`, one key `MCP_API_KEY`, both environment settings; on the published app `/api/mcp/health` answers `configured: false` (neither is set), and an unauthenticated probe gets a `500`. This round keeps that shape for Josh alone — the key stays the lock, the tenant stays his — and adds **the write tools**, **an audit row per call**, and **the transport fixes Claude's client expects**. Josh's Claude has the *Request headers* option in its custom-connector dialog (checked 10 Nov), so the key path works on every surface; no sign-in screen, nothing in Settings, nothing for other businesses. The everyone version (sign-in per person, Connections section) comes later and reuses all of this.

## 1. The door (`routes/mcp_server.py`)

- **401 done properly.** A missing or wrong key answers `401` with the header `WWW-Authenticate: Bearer` and a JSON body `{"error": "unauthorized"}`. **An unconfigured door (no `MCP_API_KEY`) answers the same 401**, never a 500 — that 500 is why Claude said *"couldn't determine how this server signs in"* when it probed the live door. The token is read from `Authorization: Bearer …` or `X-API-Key`, never from the URL. `GET /api/mcp/health` stays open and keeps reporting `configured`.
- **Protocol version.** `initialize` echoes the client's `protocolVersion` when it is one of `2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25`, else answers `2025-06-18`; today it always says `2024-11-05`. The `MCP-Protocol-Version` request header is accepted and ignored for routing.
- **`GET /api/mcp`** answers **`405`** with `Allow: POST` (this server offers no SSE stream) instead of today's `200` JSON. POST handling (single message, batch, notifications → 202) stays.
- **`tools/list`** carries, per tool, `title` (one short line) and `annotations`: `readOnlyHint: true` on every read; on every write `readOnlyHint: false`, `destructiveHint: false`, `idempotentHint` true for the `update_*` tools and false for the `create_*` / `add_*` ones. The `instructions` string in `initialize` becomes: the business name (from the owner's profile), *"Every tool reads or writes exactly as the app's own screens do; a write lands at once and is logged. Not offered from here: sending anything to a client or the crew, charging or refunding, deleting, crew accounts and pay, team admins, Settings — say 'do this in the app' and give the link."* and *"Reply with the link a write returns."*
- **Every call runs as Josh.** Per request the server loads the owner's admin row (`db.admins` `_id == MCP_OWNER_ADMIN_ID`) and builds the dict `auth.get_current_user` builds for an owner (`auth.py:92–112`): `{id, role: "admin", username, actor_name: <the owner's name>, is_owner: True, access: ALL_ON, jti: None}` — and passes it to the route functions as their `current_admin`. Records therefore carry Josh as the author exactly as if he had clicked (`createdBy`, `estimator_name`, activity `by`); the audit row says Claude did it (§4).
- **Results.** Text JSON as today, capped as `_clean` caps. Every write returns `{id, label, link}` — `label` the number or name (*EST-0193*, *Jo Okafor*), `link` built from `APP_PUBLIC_URL` (`/admin/estimate/{id}`, `/admin/project/{id}`, `/admin/crm?client={id}` or whatever the app's own route is), so Claude can hand Josh the thing it made.
- **Rate limit:** 60 calls a minute per key, `429` beyond, counted in memory per process.
- **`get_signup_leads`** reads across tenants (platform-level, `mcp_server.py:235`). It stays only because this tenant is the platform owner's; mark it `platform_only: True` in the registry and refuse it with `isError` when `MCP_OWNER_ADMIN_ID` is not a platform admin (`services.tester_access.is_platform_admin`).

## 2. The key and the tenant (environment; nothing in the database)

- Generate two 32-byte URL-safe keys (`secrets.token_urlsafe(32)`): one for the **preview** (set `MCP_API_KEY` and `MCP_OWNER_ADMIN_ID` = a TS_ owner's `_id` in the preview's backend `.env`, used by the verify), one for **production**.
- Find Josh's owner admin `_id` by his login email `painting@joshsano.com.au` — **a read only**; nothing is written to his tenant.
- **Hand-over:** in your reply to Josh in this chat, once and nowhere else (not in the report, not in a file, not in git, not in a test), give him the two lines to add to the **published app's variables** before the next publish: `MCP_API_KEY=<the production key>` and `MCP_OWNER_ADMIN_ID=<his id>`, and the one line he enters in Claude's *Request headers*: header `Authorization`, value `Bearer <the production key>`. The MCP server URL he enters is the published address + `/api/mcp`.
- Rotating the key is setting a new value; nothing else changes.

## 3. The write tools — the first cut (22)

**The rule:** every tool is a thin wrapper over the route function the screen calls, with Josh's admin dict as `current_admin` — **no second code path** — so numbering, CRM mirroring, totals, activity rows, status guards and the Round 92 alerts happen exactly as from the screen, and whatever a route refuses (`400/404/409/422`) the tool returns as `isError: true` with the route's own `detail`. Where a route function needs the `Request` object, call the service beneath it or pass a bare `Request` scope; where a route takes a Pydantic model, build the model from the tool's arguments so validation runs. The registry lives in one place, **`services/connector_tools.py`**: per tool its name, title, description, input schema, annotations, the route call and `access` key; `mcp_server.py` reads the registry for both the sixteen reads (moved in as they are) and the writes. Lucy's `ai_tools.py` registry is untouched this round.

| Tool | Arguments | Route behind it |
|---|---|---|
| `create_client` | name, phone, email, address, suburb, state, postcode, company, notes, tags, source | `routes/customers.create_customer` (`CustomerIn`) |
| `update_client` | id + any of the same (not `archived`) | `routes/customers.update_customer` (`CustomerPatch`) |
| `add_client_note` | client id, text | `routes/crm.add_note` |
| `log_client_call` | client id, outcome (answered / voicemail / no_answer), minutes, note | `routes/crm.add_call` |
| `create_lead` | name, phone, email, address, message, source, value | `routes/leads.create_lead` |
| `update_lead` | id, status (new / contacted / qualified / closed_won / closed_lost), lost_reason, value, assigned_to, name, phone, email, address, message | `routes/leads.patch_lead` |
| `add_lead_note` | lead id, text | the handler behind `POST /leads/{lead_id}/notes` |
| `convert_lead` | lead id | `routes/leads.convert_lead` (its New / Contacted guard stands) |
| `create_quote` | client id or lead id, estimate_type, template_id | `routes/estimates_v2.create_from_chooser` |
| `update_quote` | id + areas (name, width, length, height, notes), lines (library task id or free text; qty, rate, unit, product id, colour, coats, notes, optional), discount, tax, jobAddressDetails, notes, crew_notes, valid_until — the fields the `Estimate` model takes | `routes/estimates.update_estimate` (the §11.1 guard keeps status and identity fields; `apply_totals` runs) |
| `set_quote_status` | id, status — what the status menu allows by hand (archived, draft, accepted, declined); **never `sent`** (refused by the tool before the route) | `routes/estimates.update_estimate_status` |
| `add_quote_followup` / `complete_quote_followup` | quote id, note, due date / followup id | `routes/estimate_followups.create_followup` / `update_followup` |
| `create_job_from_quote` / `create_job` | quote id / name, client id, start_date, target_end_date, notes | `routes/projects.create_project_from_estimate` / `create_project` |
| `update_job` | id + name, status, start_date, target_end_date, notes (`ProjectUpdate`); `site_address` → the location route; `crew` (the full list of employee ids) → the crew route | `routes/projects.update_project`, `update_project_location`, `set_project_crew` |
| `start_job` / `complete_job` | id | the handlers behind `POST /projects/{id}/start` and `/complete` |
| `add_job_expense` | id, amount, description, date | the handler behind `POST /projects/{id}/expenses` |
| `add_job_note` | id, message | `routes/projects.append_activity` |
| `create_variation` | job id, title, description, price or lines, timeframe, area, notes — a draft; sending stays in the app | `routes/variations.create_variation` |
| `create_event` / `update_event` | title, date, time, end_time, all_day, start_date, end_date, category, location, description, customer_id, project_id, selected_employees, recurrence, reminder_offset_min (`EventCreate` / `EventUpdate`) | the handlers behind `POST /events` (`server.py:603`) and `PUT /events/{id}` (`:715`) |
| `add_reminder` / `update_reminder` | text, remind_at (local business time), related_type, related_id / id, remind_at, text, done | `routes/reminders.create_reminder` / `patch_reminder` |
| `save_idea` | text | `routes/lucy_ideas.create_idea` |
| `create_invoice_from_quote` | quote id, kind, milestone (the next open one when omitted) | the handler behind `POST /invoices/from-estimate/{estimate_id}` (`FromEstimateBody`) |
| `add_coaching_note` / `give_recognition` | employee id, text (+ the fields their routes take) | the handlers behind `POST /employees/{id}/strikes` and `POST /team-accomplishment` (`server.py:1052`) — Lucy's two parked confirm-first tools, back as connector tools |

**Not in this cut** (they wait for their rounds or for Josh's word): job paint by the litre (`add_job_paint`, after Round 96), suppliers (after Round 93's route is built — it is in this same build, so `create_supplier` / `update_supplier` over `routes/suppliers` **may** be added if 93 + 94 landed cleanly; say which), `record_payment`, `set_invoice_status`, timeclock records, equipment, leave, products and library tasks.

**Reads added:** `get_connector_activity` (the `ai_tool_audit` rows with `via: "connector"`, newest first, limit) so Josh can ask his Claude *"what did you change today?"*; `get_invoices`, `get_reminders`, `get_library_tasks` — reads the sixteen do not cover and the writes need (the same `_clean` whitelisting, tenant-scoped).

**Not offered, whatever the AI asks** (not tools; the `instructions` say so): sending anything to a client or the crew (quote send / resend, invoice email or SMS, variation send, completion report, contract issue / remind, crew push), charging, refunds, credit notes, Stripe, marking anything *sent*; deleting, hard-deleting, merging, purging; crew members' accounts, passwords, PINs, pay rates, access; team admins; Settings (business, quote defaults, comms, connections, billing, plan); the platform (What's new, tester invites, signup-lead writes); Start fresh; data export; Lucy's settings and her key.

## 4. Audit

Every `tools/call` — reads and writes — writes one row to **`db.ai_tool_audit`** in the shape Lucy's `execute_tool` writes (`ai_tools.py:931–943`: `owner_admin_id`, `tool_name`, `user_id` = Josh's id, `user_name`, `user_role: "admin"`, `args`, `status`, `result_preview`, `latency_ms`, `created_at`) plus `via: "connector"`, `client` (the `clientInfo.name` from `initialize`, kept per session — `claude-ai`, `claude-code`, or whatever the client sends; empty when unknown) and `record: {type, id}` for a write. Never a key in a row. The row is written even when the tool errors (`status: "error"`).

## 5. Isolation

The tenant comes from `MCP_OWNER_ADMIN_ID` on every query, as today; a tool given another tenant's id gets the route's own 404. `get_signup_leads` as §1. The preview key never works on production and the production key never on the preview (different values). No cross-tenant test data is touched.

## 6. Tests

`backend/tests/test_r98_connector.py`: the 401 shape (no key, wrong key, **no key configured**), `GET` → 405, the protocol echo (four known versions and an unknown one), the 429 at the 61st call; `tools/list` has every registry tool with annotations and none of the not-offered names; one test per write tool through `tools/call` asserting the stored row equals what the route returns from the screen's own call (same payload through the HTTP route with a TS_ admin token) — numbering, `createdBy`, CRM mirroring where it applies; `set_quote_status` with `sent` refused; a route refusal surfaces as `isError` with the route's `detail`; isolation (another tenant's ids → 404; the platform-only read refused for a non-platform tenant); the audit row with `via`, `client`, `record`; `get_connector_activity` lists it. Suite green before and after (chunked, as the rounds before).

## 7. Verify (no testing agent; pytest plus probes on the preview with the preview key and a TS_ tenant)

1. `curl` without a key → 401 with `WWW-Authenticate: Bearer`; with the key: `initialize` (client version `2025-06-18` echoed), `notifications/initialized` → 202, `tools/list` (count, annotations), `GET /api/mcp` → 405, `/api/mcp/health` → `configured: true` on the preview.
2. Through `tools/call` against TS_ data, once each: `create_client` → `create_lead` → `convert_lead` → `create_quote` for that client → `update_quote` with one area and two lines (the totals match the builder's own save of the same payload to the cent) → `add_quote_followup` → `set_quote_status` *accepted* by hand → `create_job_from_quote` → `update_job` (dates, crew, site address) → `add_job_note` → `add_job_expense` → `create_variation` → `create_event` spanning two days → `add_reminder` → `create_invoice_from_quote` → `add_coaching_note` → `give_recognition`; each returns `{id, label, link}` and the record reads in the app as if made there.
3. `get_connector_activity` lists every call above with `via: connector`.
4. The sixteen reads still answer as before, from the registry.
5. Teardown: the TS_ rows go as every round's do.

## 8. What's new

None for this round — nothing a painter can see. The card comes with the sign-in round.

## 9. Report, and GitHub

`memory/reports/round98-connector-report.md`, starting "Round 98 done": the door's new behaviour (401, 405, versions, annotations, rate limit), the registry's tool list as built with the route each wraps, the audit row shape, the probe transcript of §7 (keys redacted), the suite before and after, and the commit hash at the end so Josh can click **Save to GitHub**. The production key and Josh's admin id go **only** in your chat reply to him (§2). No code review. Do not start Rounds 95 or 96 after it — stop and wait. Do not offer next action items.

# Round 98 — Connect your Claude, owner only (10 November) — MAPPED, waits for Josh's two checks and his word on the tool list; goes after Round 97

Josh, 10 Nov: *"how long will it take if we give Claude edit access to my app only so it can create and edit things?"* and *"write tools on the existing MCP door first, then sign-in per business + Connections section"*; the second gate inside the app is **not** wanted (*"it can be done by admin"* — Claude's own confirmation in front of Josh is the gate). This is the map for the first of those two: Josh's own Claude, on his phone, desktop or in Claude Code, working inside Paint Trade HQ through the door that already exists. Nothing in Settings, no sign-in screen, nothing for any other business. The everyone version (`connect-your-ai-exploration.md` §5 Shape 2) comes later and reuses all of it (§8).

## 0. In one paragraph

The app already has a remote MCP server at **`/api/mcp`** (`backend/routes/mcp_server.py`): sixteen read tools, one tenant fixed by `MCP_OWNER_ADMIN_ID`, one key `MCP_API_KEY`, both environment settings. For Josh alone that shape is kept: the key stays the lock, the tenant stays his. The round adds **the write tools** (§3), each calling the same route function the app's own screens call, **an audit row per call**, and **the small transport fixes** Claude's client expects (§2). Backend only, no frontend file. Cost per call to Paint Trade HQ: nothing — Josh's Claude plan pays for the AI.

## 1. Two checks before anything is written (Josh, two minutes; answers are true/false and yes/no — no URL or key pasted here)

1. **Is the door on?** Open your published app's address followed by `/api/mcp/health` in a browser — no login. It answers `"configured": true` or `false`. **Answered 10 Nov: the door is reachable on the published app (`ok: true`, sixteen tools listed) and `configured: false`** — neither `MCP_API_KEY` nor `MCP_OWNER_ADMIN_ID` is set there, so nobody has ever used the door on the live app; the round sets both (§2). The preview has its own pair pointing at a TS_ tenant for the verify.
2. **Does your Claude show "Request headers"?** claude.ai › **Customize › Connectors › Add custom connector**. Look for a **Request headers** section in the dialog. **Answered 10 Nov: yes** — Josh's dialog is the two-step kind; after *Continue anyway* the manual screen offers *Sign in now / Sign in when needed / No sign-in*, the OAuth client choices, and **Request headers** ("up to four"). So the key path works on every surface and the round stays backend only; §8's owner-gated sign-in is not folded in.
   - **Yes** → the key works everywhere: the Claude app on the phone and tablet, the desktop app, the web, Claude Code. (Anthropic, 10 Nov: *"Request header authentication is in beta and available to a limited set of organizations. If you don't see the Request headers section … your organization doesn't have access yet."*)
   - **No** → the key still works in **Claude Code** today (`claude mcp add --transport http … --header`, any plan), but the Claude app on the phone needs the sign-in round. In that case my recommendation is to fold the owner-gated sign-in (§8, first paragraph) into this round so the phone works from day one — a bigger round, same code the everyone version needs.

## 2. The door (`routes/mcp_server.py`; backend only)

- **Key and tenant stay environment settings.** Emergent generates a fresh 32-byte key for the **published** app and sets `MCP_API_KEY` + `MCP_OWNER_ADMIN_ID` (Josh's admin id) there; a different key and a TS_ tenant on the preview. The key is shown **once, in Emergent's own chat** (Josh's build chat), never here; rotating it is setting a new value. Live key on the published app only; test key on the preview only.
- **Every call runs as Josh.** The server loads the owner's admin row once per request and builds the same dict `auth.get_current_user` builds for him (`id`, `role: admin`, `username`, `actor_name`, `is_owner`, `access: ALL_ON`), and passes it to the route functions. Records therefore carry Josh as the author exactly as if he had clicked (estimator name, `createdBy`, activity `by`); the audit row says Claude did it (§4). Default — alternative in §9.
- **401 done properly:** a missing or wrong key answers `401` with `WWW-Authenticate: Bearer` (today a bare 401 with JSON), **and so does an unconfigured door** (today `_check_auth` raises `500` when `MCP_API_KEY` is unset — that is why Josh's Claude said *"Couldn't determine how this server signs in"* when it probed the live door on 10 Nov). The token is read from `Authorization: Bearer` or `X-API-Key`, never from the URL.
- **Protocol version:** `initialize` echoes the client's `protocolVersion` when it is one the server knows (`2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25`), else the newest of those; today it always says `2024-11-05`. The `MCP-Protocol-Version` request header is accepted.
- **`GET /api/mcp` answers `405`** (this server offers no SSE channel) instead of today's `200` with a JSON body, which a client that opened the GET for a stream cannot read. `GET /api/mcp/health` stays.
- **`tools/list` carries annotations:** `readOnlyHint: true` on the sixteen reads; `readOnlyHint: false, destructiveHint: false, idempotentHint` as fits on each write; a one-line `title`. Claude shows these and asks before each write; *Always allow* per tool is Josh's choice in Claude.
- **`instructions`** (what Claude reads at connect): the business name, that every write lands exactly as if done in the app, what is **not** offered (§3 last block) and that the reply should carry the app link the tool returns.
- **Results:** text JSON as today, capped as `_clean` caps; every write returns `{id, number|name, link}` with `link` built from `APP_PUBLIC_URL` (e.g. `/admin/estimate/{id}`), so Claude can hand Josh the thing it made.
- **Rate limit:** 60 calls a minute per key; `429` beyond.
- **`get_signup_leads`** reads across tenants (platform-level, `mcp_server.py:235`). It stays only because the tenant is the platform owner's; it is marked platform-only in the registry and drops out the day a second tenant can connect.

## 3. The write tools — the list for Josh's word

**The rule:** a tool is a thin wrapper over the route function the screen calls (`routes/customers.create_customer`, `routes/estimates_v2.create_from_chooser`, `routes/estimates.update_estimate`, …) with Josh's admin dict — **no second code path**, so numbering, CRM mirroring, totals, activity rows, status guards and the Round 92 alerts happen exactly as from the screen, and whatever a route refuses (`400/404/409`) the tool refuses with the same message. The registry lives in one place (`services/connector_tools.py`): name, title, description, input schema, annotations, the route call. Lucy keeps her own registry untouched this round (the merge is the everyone round).

★ = first cut for Round 98 (24 tools); the rest is Round 99 if Josh wants them.

**Clients & leads**

| Tool | Does | Route |
|---|---|---|
| ★ `create_client` | name, phone, email, address / suburb / state / postcode, company, notes, tags, source | `POST /customers` (`CustomerIn`); the route's own phone/email match rules apply |
| ★ `update_client` | the same fields by id (not `archived`) | `PATCH /customers/{id}` |
| ★ `add_client_note` | a note on the client's activity | `POST /customers/{id}/notes` |
| ★ `log_client_call` | answered / voicemail / no answer, minutes, note | `POST /customers/{id}/calls` |
| ★ `create_lead` | name, phone, email, address, message, source, value | `POST /leads` |
| ★ `update_lead` | status (new / contacted / qualified / closed_won / closed_lost), lost reason, value, assigned to, details; `add_lead_note` | `PATCH /leads/{id}`, `POST /leads/{id}/notes` |
| ★ `convert_lead` | makes or links the client as the Convert button does (New / Contacted only) | `POST /leads/{id}/convert` |

**Quotes**

| Tool | Does | Route |
|---|---|---|
| ★ `create_quote` | a new draft for a client or a lead, optional template and type — number, GST, payment plan and presentation defaults as the chooser sets them | `POST /estimates/from-chooser` |
| ★ `update_quote` | areas (name, W, L, H, Round 97 `sqm`), lines (library task or free text, qty, rate, product, colour, coats, notes, optional), discount, GST mode, job address, notes, crew notes, valid-until; totals recomputed by `apply_totals`; status and identity fields never change here (§11.1 guard) | `PUT /estimates/{id}` |
| ★ `set_quote_status` | what the status menu allows by hand (archive, back to draft, mark accepted / declined); never *sent* | `PATCH /estimates/{id}/status` |
| ★ `add_quote_followup` | note + due date on a quote; `complete_quote_followup` | `POST/PATCH /estimates/{id}/followups` |

**Jobs**

| Tool | Does | Route |
|---|---|---|
| ★ `create_job_from_quote` / `create_job` | from an accepted quote, or a bare job (name, client, dates, notes) | `POST /projects/from-estimate/{id}`, `POST /projects` |
| ★ `update_job` | name, start / target end, notes, status fields `ProjectUpdate` allows; site address; crew (the full list) | `PUT /projects/{id}`, `PATCH …/location`, `PUT …/crew` |
| ★ `start_job` / `complete_job` | as the two buttons | `POST …/start`, `POST …/complete` |
| ★ `add_job_paint` / `update_job_paint` | product + litres (Round 96's fit), colour | `POST/PATCH …/materials` |
| ★ `add_job_expense` | amount, what, date | `POST …/expenses` |
| ★ `add_job_note` | a note on the job's activity | `POST …/activity` |
| ★ `create_variation` | title, description, price or lines, timeframe — a **draft**; sending stays in the app | `POST …/variations` |

**Calendar & reminders**

| Tool | Does | Route |
|---|---|---|
| ★ `create_event` / `update_event` | title, date, times or all-day, end date (Round 95), crew, client, job, location, category, recurrence, reminder | `POST /events`, `PUT /events/{id}` |
| ★ `add_reminder` / `update_reminder` | text + when; snooze, rename, done | `POST /reminders`, `PATCH /reminders/{id}` |
| ★ `save_idea` | as Lucy's | `POST /lucy-ideas` |

**Invoices**

| Tool | Does | Route |
|---|---|---|
| ★ `create_invoice_from_quote` | the next milestone, or deposit / progress / balance by name | `POST /invoices/from-estimate/{id}` |
| `create_invoice` / `update_invoice` | a free-form invoice; edits while draft | `POST /invoices`, `PUT /invoices/{id}` |
| `record_payment` | a payment received (bank transfer / cash), amount, date, note | `POST /invoices/{id}/payments` — **Josh's call §9.2** |
| `set_invoice_status` | archive, mark paid, back to draft — not *sent* | `PATCH /invoices/{id}/status` — **§9.2** |

**Crew, equipment, time**

| Tool | Does | Route |
|---|---|---|
| ★ `add_coaching_note` / `give_recognition` | Lucy's two parked confirm-first tools, back as connector tools | `POST /employees/{id}/strikes`, `POST /team-accomplishment` |
| `add_leave` | leave for a crew member | `POST /employees/{id}/leave` |
| `approve_equipment_request` / `decline_equipment_request`, `move_equipment` | as the buttons | `POST /equipment/requests/{id}/approve|decline`, `PATCH /equipment/items/{id}/location` |
| `create_equipment_item` / `update_equipment_item` | name, category, tag, serial, condition, next check, cost | `POST/PATCH /equipment/items` |
| `add_timeclock_record` / `edit_timeclock_record` | a missed sign-in, a corrected sign-out | `POST /timeclock/records`, `PUT …/{id}` — **§9.2** (hours drive pay) |

**Products & library**

| Tool | Does | Route |
|---|---|---|
| `create_product` / `update_product` | brand, name, category, coverage, sizes and prices | `POST/PATCH /materials` |
| `create_library_task` / `update_library_task` | a task, its rate, labour minutes, methods, products | `POST/PUT /tasks` |
| `create_supplier` / `update_supplier` | **after Round 93 is built** | `POST/PUT /api/suppliers` |

**Reads added:** `get_connector_activity` — what Claude did through the door (the `ai_tool_audit` rows with `via: connector`), so Josh can ask his Claude *"what did you change today?"* without a new screen; `get_invoices`, `get_reminders`, `get_library_tasks`, `get_suppliers` (after 93) — reads the sixteen do not cover and the writes need.

**Not offered, whatever the AI asks (not tools; the reply says "do this in the app" with the link):** sending anything to a client or the crew (quote send / resend, invoice email or SMS, variation send, completion report, contract issue / remind, crew push), charging, refunds, credit notes, Stripe, marking anything *sent*; deleting, hard-deleting, merging, purging; crew members' accounts, passwords, PINs, pay rates, access; team admins; Settings (business, quote defaults, comms, connections, billing, plan); the platform (What's new, tester invites, signup leads); Start fresh; data export; Lucy's settings and her key.

## 4. Audit

Every `tools/call` writes one row to **`db.ai_tool_audit`** as Lucy's `execute_tool` does (`ai_tools.py:931`): `tool_name`, `args` (never a key), `status`, `result_preview`, `latency_ms`, plus `via: "connector"`, `client` (the `clientInfo.name` from `initialize`, e.g. *claude-ai* / *claude-code*) and `record` (`{type, id}` for a write). Read back by `get_connector_activity` (§3) and, in the sign-in round, by the Connections section.

## 5. How Josh connects (after publish; the key never leaves his hands)

- **Claude app — web, phone, tablet, desktop** (if the dialog has *Request headers*): Customize › Connectors › **Add custom connector** → name *Paint Trade HQ* → MCP server URL: the published address + `/api/mcp` → Authentication **No sign-in** → Request headers: `Authorization` = `Bearer ` + the key (Anthropic: include the scheme) → Add. In a chat: **+ › Connectors › Paint Trade HQ** on. Claude asks before each tool; keep the writes on *ask*.
- **Claude Code** (terminal on his own machine): `claude mcp add --transport http pthq <published address>/api/mcp --scope user --header "Authorization: Bearer <key>"`. Then `/mcp` shows it connected.
- **Not this chat / Claude Code on the web:** the cloud environment cannot reach the published app, and a connector there is the claude.ai connector above anyway.

## 6. Verify (testing agent on the **preview** with the preview key and a TS_ tenant; the owner's tenant read-only)

1. `initialize` echoes the client's protocol version; `tools/list` has every tool with annotations; `GET /api/mcp` → 405; no key / wrong key → 401 with `WWW-Authenticate: Bearer`; 61st call in a minute → 429.
2. Each ★ tool once against TS_ data: the record is indistinguishable from one made in the app (quote number sequence, CRM fields mirrored, totals, activity row, `createdBy`), and the audit row exists with `via: connector`.
3. Isolation: the TS_ key with another tenant's ids → 404 on every tool; `get_signup_leads` only for the platform tenant.
4. A refused route (`PUT` on a quote with a bad payment plan, `convert_lead` on a Qualified lead, archiving an invoice with payments) returns the route's own message through the tool, `isError: true`.
5. End to end with the **MCP Inspector** (`npx @modelcontextprotocol/inspector`) against the preview: connect, list, one read, one write. Josh's own Claude is the final check after publish (§5).
6. Suite green before and after; no frontend file touched; nothing under `app/employee/*`.

## 7. Tests

`backend/tests/test_r98_connector_writes.py`: auth (401 shape, 405, 429), protocol echo, one test per ★ tool through `tools/call` asserting the stored row equals the route's own result, isolation, the audit row, the not-offered list absent from `tools/list`.

## 8. What the everyone version adds later (nothing here is thrown away)

**Sign-in with Paint Trade HQ** (OAuth 2.1: `401 + WWW-Authenticate: Bearer resource_metadata=…`, RFC 9728 and 8414 metadata, DCR or Claude's Client ID Metadata Document, PKCE S256, the consent page inside the admin app, token + refresh with rotation, redirect `https://claude.ai/api/mcp/auth_callback` and Claude Code's loopback); tenant and person **from the token** instead of the environment; the person's access keys; Settings › Connections › *AI assistants* (Connect, rows, Revoke); Lucy and the connector on one registry. The §3 registry, the audit `via`, the transport fixes and the tests carry over as they are; the environment key path is then removed or kept for the platform admin only. **Owner-gated now, if §1.2 says No:** the same sign-in built in this round, with `authorize` accepting only admins of `MCP_OWNER_ADMIN_ID`'s tenant — the gate is one line to lift later.

## 9. Josh's calls before the send (defaults; "send" takes them)

1. **The ★ first cut (24 tools)** — add or strike. The rest is Round 99.
2. **Money-adjacent edits** — `record_payment`, `set_invoice_status`, the timeclock records: **out of the first cut** by default (they are admin edits, not sending or charging; Claude would confirm each; the audit shows them — say the word and they move in).
3. **Deletions:** none offered, including calendar events; `update_event` can move or shorten one. Alternative: `delete_event` as the one deletion.
4. **Attribution:** records carry Josh as the author; the audit row says Claude. Alternative: activity rows read *Josh (via Claude)*.
5. ~~If the Claude app has no *Request headers*~~ — settled 10 Nov: it has them (§1.2); the round stays backend only.
6. **What's new:** none for this round — nothing a painter can see. The card comes with the sign-in round.

Size: the first cut alone ≈ Round 92 (backend only). With the owner-gated sign-in folded in ≈ Round 85 + 92.

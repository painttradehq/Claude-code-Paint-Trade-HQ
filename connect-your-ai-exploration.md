# Exploration — "Connect your own AI to run the app" (10 November) — an exploration, not a round; nothing scheduled, nothing sent

Josh's idea (10 Nov): *"ability to connect to an AI account like Claude or GPT or other to run the software, like how we connect to GitHub or Google — that AI can do the tasks inside the app."* He understands the three parts named in the parking lot (a connection per business, write tools, other vendors) and asked to explore anyway. Grounded in the code at `82bf0a3` and in Anthropic's connector documentation read on 10 Nov (sources at the end). Mock-up: **`connect-ai.html`** (the Settings › Connections section, the consent screen, and what it looks like from inside Claude), `tools/test_connect_ai.js`.

## 0. The short answer

The plug already exists and it is the right one: the app has a **remote MCP server** (`backend/routes/mcp_server.py`), which is exactly how a person's own Claude connects to a product today — claude.ai, Claude Desktop, mobile, Claude Code and Cowork all add a product by its URL as a *custom connector*, on every plan. What is missing is three things, in order of size: **a sign-in per person** (today one key in the environment opens one tenant — yours), **a short list of safe actions** (today sixteen read-only tools), and **a place in Settings** where the owner connects, sees who is connected, and revokes. The proper sign-in is "Sign in with Paint Trade HQ" — the app becomes an OAuth provider the way Google is one for us — because that is what Claude requires of a connector that acts as a person, and it is what ChatGPT requires too. It is one focused backend round plus a Settings section, and it costs Paint Trade HQ nothing per call: the user's own Claude plan pays for the AI. The recommendation (§9) is a staged path: first reading, then drafting, never sending or charging from outside the app.

## 1. Two ideas in one sentence, and which one this is

- **Lucy** is the AI *inside* the app: it runs on the app's own key, with the app's own tool list, under the rule *"AI = Claude only, via the app's key"*. Nothing here changes that.
- **"Connect your AI"** is the reverse direction: the user's *own* assistant, outside the app — the Claude app on their phone or desktop, or ChatGPT — reaches into Paint Trade HQ and uses it as a set of tools. The app is the *provider*, like Google Drive is to us. The AI vendor is whoever the user already pays; we provide the socket. Josh's rule is about the app's own AI calls and is untouched by this; the only new question it raises is whether the socket is offered to Claude only or to any MCP client (§8).

## 2. What exists in the code today

| Piece | Where | What it does |
|---|---|---|
| Remote MCP server | `backend/routes/mcp_server.py` (621 lines), mounted in `server.py:1252`; `GET /api/mcp/health` | MCP Streamable HTTP transport (JSON-RPC over `POST /api/mcp/`): `initialize`, `tools/list`, `tools/call`. |
| Its tools | `TOOLS` at `mcp_server.py:358` | **Sixteen, all reads:** `get_customers`, `get_estimates`, `get_projects`, `get_employees`, `get_materials`, `get_daily_reports`, `get_timeclock_entries`, `get_equipment_assignments`, `get_equipment_requests`, `get_leads`, `get_signup_leads`, `get_events`, `get_contract_templates`, `get_employee_updates`, `get_training_videos`, `get_dashboard_summary`. Fields are whitelisted per tool (`_clean(keep=[…])`). |
| Its auth | `mcp_server.py:38–61` | One shared `MCP_API_KEY` (`Authorization: Bearer` or `X-API-Key`); **one tenant for the whole server**, `MCP_OWNER_ADMIN_ID` from the environment. No per-business, no per-person, no scopes, no revocation short of rotating the env. |
| Lucy's tools | `backend/ai_tools.py` `TOOL_SCHEMAS` / `TOOL_REGISTRY` (lines 59–895) | Eighteen tools: sixteen reads plus two small writes (`add_reminder`, `save_idea`); `create_event`, `add_coaching_note`, `give_recognition` were pulled from the registry in Round 34 "for the later confirm-first version" (their code stays). |
| Audit | `ai_tools.py:922–945` → `db.ai_tool_audit`; `ai_routes.py:289` → `db.ai_audit_log` and the page `/admin/ai-audit-log` | One row per tool call (`tool_name`, who, args, status, preview, latency) and one per provider call. Reusable as is for calls that arrive through the connector, with a `via` field. |
| Who may do what | `services/access.py` (`quotes, clients, products, jobs, equipment, calendar, crew, crew_edit, pay, settings, lucy`) | Team admins' access keys; a connection made by a person should carry that person's keys. |
| Where it would live | Settings › **Connections** (Round 94, `connections-notes.md`) | The page Josh asked for on 9 Nov — "the outside services this business is connected to". An *AI assistants* section belongs there. |

Nothing in the code lets a tester connect today: the server is wired to Josh's tenant by environment variable, and the key is a platform secret.

## 3. How Claude connects to a product today (Anthropic's documentation, read 10 Nov)

- **Where:** *Customize › Connectors › Add custom connector*, by URL, on **Free, Pro, Max, Ultra, Team and Enterprise** (Free: one custom connector). On Team/Enterprise an Owner adds it for the organisation and each member connects with their own account. The same connector works in claude.ai, Desktop, mobile, Cowork and Claude Code.
- **Three ways in:** (1) **OAuth** — each user signs in to the product with their own account; (2) **a fixed credential in a request header** (an API key) — *beta, available to a limited set of organisations*, and it is "the organisation's credential, not a person's"; (3) **no sign-in**. For a connector that acts as a person, OAuth is the only path that is generally available.
- **What the product must implement for OAuth:** answer an unauthenticated call with **`401` + `WWW-Authenticate: Bearer resource_metadata="…"`**; serve **protected resource metadata (RFC 9728)** whose `resource` equals the server URL exactly and whose `authorization_servers` names the issuer; the authorization server serves **RFC 8414 metadata** at `/.well-known/`; **PKCE S256** on every authorization; Claude identifies itself by **Dynamic Client Registration (RFC 7591)** or by its hosted **Client ID Metadata Document**, or the owner pastes an OAuth client the product issued; the redirect URI is **`https://claude.ai/api/mcp/auth_callback`** (Claude Code: a loopback on any port); the token endpoint takes form-encoded bodies, returns `invalid_grant` properly, **rotates refresh tokens**; discovery/registration/token endpoints must answer within **10 seconds**; Anthropic's calls come from `160.79.104.0/21`.
- **Tool approvals are on Claude's side:** Claude asks before using a tool, the person can choose **Always allow** per tool, and can set a tool to **Blocked** under the connector. Anthropic asks connector builders to annotate tools with `readOnlyHint` / `destructiveHint`.
- **Scopes:** the product controls what Claude asks for via the `scope` on its `401` or `scopes_supported` in its metadata; Claude appends `offline_access` for a refresh token when offered.
- A listing in Anthropic's **Connectors Directory** is a separate, later step (submission and review); custom connectors need none of it.

## 4. ChatGPT, for completeness

Search results (10 Nov) agree on the shape: ChatGPT connects to a **remote HTTPS MCP server** through *Developer mode*, with **OAuth or no auth**; **write actions show a confirmation prompt** before they run; which plans get write actions is disputed between sources (Business/Enterprise/Edu certainly; Plus/Pro reported both ways). OpenAI's own page could not be read from this session (`developers.openai.com` is outside the allowed network), so treat the plan detail as unverified. The point for us: **the same OAuth server serves both** — build it once for Claude and ChatGPT can use it, if Josh wants that.

## 5. What Paint Trade HQ would have to build — three shapes

### Shape 1 — a key per business (small; not enough)

Settings › Connections › *AI assistants* › **Create a key** → the owner pastes the server URL and the key into Claude under *Request headers*. On our side: `db.ai_connections` with hashed keys per tenant, the tenant read from the key instead of `MCP_OWNER_ADMIN_ID`, revoke from Settings. Perhaps two days of work. **But:** request-header credentials are a *beta for a limited set of organisations* in Claude, so most painters cannot use it today; a key is the business's credential, not a person's, so no per-person access and a weak audit; ChatGPT has no header mode at all. Good as an internal stop-gap for Josh's own testing, not as the product.

### Shape 2 — "Sign in with Paint Trade HQ" (the right one)

The app becomes an **OAuth 2.1 authorization server** for its own MCP endpoint:

- `GET /.well-known/oauth-protected-resource` (RFC 9728; `resource` = `https://painttradehq.co/api/mcp`), `GET /.well-known/oauth-authorization-server` (RFC 8414; S256; `registration_endpoint`; `scopes_supported`).
- `POST /api/oauth/register` (DCR) — or honour Claude's Client ID Metadata Document, which avoids a registration per connection; both are cheap once the rest exists.
- `GET /api/oauth/authorize` → **the consent screen inside the admin app** (the person is already signed in, or signs in): *"Claude wants to connect to Harbourline Painting as Sam Reyes. It will be able to: read quotes, clients, jobs, crew and the calendar. It will not be able to send, charge or delete anything."* Allow / Cancel. Redirects to `https://claude.ai/api/mcp/auth_callback` (and Claude Code's loopback) with the code.
- `POST /api/oauth/token` (form-encoded; code + PKCE verifier; refresh with rotation; `invalid_grant`), `POST /api/oauth/revoke`. Tokens carry `tenant`, `admin_id`, `scopes`, `client`, audience = the MCP URL.
- `mcp_server.py` reads the tenant and the person **from the token**, applies the person's access keys, and returns `401 + WWW-Authenticate` with the metadata pointer when there is none. The env key path stays for the platform admin only, or goes.
- Library: `authlib` has the OAuth 2.1 server pieces for Starlette/FastAPI (authorization code + PKCE, refresh rotation, metadata, DCR); the app already issues and revokes its own JWT sessions (`auth.py`, `admin_sessions`), so the session side exists.
- Isolation: every query already scopes by `owner_admin_id`; the change is where that id comes from. TS_ tenants test it end to end with a real claude.ai custom connector.

Effort: one backend round of the size of Round 85 or 92, plus the Settings section (§6). Works for Claude on every plan, Claude Code, Cowork, and ChatGPT.

### Shape 3 — actions, carefully

The sixteen reads are already useful ("what's owed this week", "who's on site", "the Okafor quote's status"). Actions come after, in two layers:

- **Drafting, never sending:** `draft_quote` (a new draft estimate for a client, from a sentence), `draft_reply` (a draft in the Inbox thread), `add_reminder`, `add_note_to_client`, `create_event` — things that leave something in the app for a person to finish with a click. Sending a quote, charging, paying crew, deleting, changing rates: **not offered** from outside the app, whatever the AI asks.
- **One tool registry** for Lucy and the connector (`services/ai_tools_registry.py`), so a tool is written once with its `readOnlyHint` / `destructiveHint`, its access key, and whether it writes; the MCP server and Lucy both read it (no duplication).
- **Confirmation** comes from the client app (Claude asks; ChatGPT shows a modal) *and* from us: write tools are off unless the person ticked *Allow drafting* on the consent screen (a second scope), and every call lands in `ai_tool_audit` with `via: "connector"`, the client's name and the person, visible on the AI audit log page.
- Rate limits per token (e.g., 60 calls a minute) and a size cap on results, as `_clean` already does.

## 6. What the owner would see (the mock-up)

Settings › **Connections** gains a third section, **AI assistants** (*Saves at once*): *"Let your own Claude read your business — and, if you allow it, leave drafts for you — from the Claude app on your phone or computer. Each admin connects their own; nothing is sent, charged or deleted from outside the app."*

- Not connected: a card with **Connect your Claude** → a dialog with the server URL in a copy field (`https://painttradehq.co/api/mcp`) and three steps: *Open Claude › Customize › Connectors › Add custom connector · Paste the URL, keep "Sign in now" · Click Connect and allow it here.* The same URL works in Claude Desktop, mobile and Claude Code. (Josh's call whether to show a ChatGPT line.)
- Connected: one row per connection — *Claude · Sam Reyes · connected 10 Nov · last used 2 h ago · Read only* (or *Read + drafts*) — with **Revoke**. Team admins see their own rows; the owner sees everyone's.
- A line **"48 calls this week · see the AI audit log"**.
- **The consent screen** (what Claude opens in the browser): the business name, the person, the two scopes as plain sentences, what it can never do, Allow / Cancel.

## 7. Safety and isolation

- The tenant comes from the token, never from the environment; audience and expiry are checked on every call; a token revoked in Settings stops the next call.
- A team admin's connection carries that person's access keys; a *site* preset gets no quotes or money through Claude either.
- Tool results carry text written by others (a client's email in `recent_messages`, a note in a lead). That is the same prompt-injection surface Lucy already has; the server never treats a result as an instruction, and the client apps have their own protections. The write layer stays "drafts only" partly for this reason.
- The 401 flow and metadata are public by design; the secrets are the tokens, stored hashed, with short access-token life and rotating refresh.
- Rate limits per token; the existing field whitelists; no bulk export tool.
- No new AI key in the app, no vendor billing: the user's Claude plan pays for the AI; Paint Trade HQ pays for the requests only.

## 8. The decisions this raises for Josh (not needed now)

1. **Claude only, or any MCP client?** Technically the OAuth server cannot refuse a standards-compliant client without checks on its redirect URI or client metadata; restricting to Claude's redirect URI (`claude.ai/api/mcp/auth_callback` + Claude Code's loopback) is possible and simple. Offering it to ChatGPT too is the same code with the restriction off. This is Josh's product and rule call; nothing in it changes Lucy.
2. **Per person (recommended) or owner only.**
3. **Which actions, if any, in the first version** — reads only is a complete, useful first release.
4. **Directory listing** ("Paint Trade HQ" in Anthropic's Connectors Directory) later — a marketing step with its own review.

## 9. Recommendation and a staged path (when Josh wants it; none of this is scheduled)

- **Stage 1 — Round N "Connect your Claude":** Shape 2 (OAuth 2.1 server, token-scoped MCP, per-person), the sixteen reads re-based on the registry, the *AI assistants* section on Connections, the consent screen, the audit `via`, TS_ end-to-end test with a real custom connector. Value on day one: a painter asks their own Claude, on the phone, *"what's owed this week?"* and gets their numbers.
- **Stage 2 — drafts:** the drafting tools of §5 Shape 3 behind the *Allow drafting* scope; Lucy gets the same registry (her parked `create_event`, `add_coaching_note`, `give_recognition` return as confirm-first tools in the same move).
- **Stage 3 — never, or much later:** sending, money, deletions from outside the app.
- Before Stage 1 Josh answers §8 items 1–3; the spec and prototype come after his word.

## Sources

- Anthropic, *Authentication for connectors*: <https://claude.com/docs/connectors/building/authentication.md>
- Anthropic, *Add a connector that isn't in the directory*: <https://claude.com/docs/connectors/custom/add-unlisted.md>
- MCP specification, *Authorization* (2025-06-18, via GitHub): <https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2025-06-18/basic/authorization.mdx>
- Search results on ChatGPT Developer mode and custom connectors (OpenAI's own page unreachable from this session): <https://developers.openai.com/api/docs/guides/developer-mode>, <https://auth0.com/blog/add-remote-mcp-server-chatgpt/>, <https://zuplo.com/docs/mcp-gateway/connect-clients/chatgpt>, <https://hjarni.com/blog/how-to-use-mcp-with-chatgpt>
- Other pages the search returned on Claude custom connectors: <https://claude.com/docs/connectors/custom>, <https://support.claude.com/en/articles/12922490>, <https://sunpeak.ai/blogs/claude-connector-oauth-authentication/>, <https://remote-mcp.com/claude-connectors>, <https://github.com/anthropics/claude-ai-mcp/issues/212>

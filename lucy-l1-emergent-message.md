# Lucy L1 — Lucy does the work, confirm first (round 1 of 5) — SENT to Emergent 26 Nov on Josh's word ("let's send Lucy stuff to Emergent, I will upload the files")

Josh uploads three files with this message: `lucy-operator.html` (the prototype), `lucy-l1-emergent-message.md` (this file) and `lucy-operator-spec.md` (the whole plan, L1–L5).

---

## The message as sent

# Lucy L1 — Lucy does the work, confirm first (round 1 of 5)

Josh is uploading three files: **`lucy-operator.html`** (the prototype — the reference for every screen in this round), `lucy-l1-emergent-message.md` (this message as a file) and `lucy-operator-spec.md` (the whole plan, for context only). Save them under `memory/specs/lucy/`. If the prototype is not in the chat when you read this, reply "waiting for the prototype" once and wait — do not build the screens from this text alone.

**Finish what you are working on first.** Then build **only L1** below. Sending anything, recording payments, deleting, email and files are later rounds (L2–L5), each on Josh's word — do not start them.

Josh, 25–26 Nov: "We have decided to give Lucy full access to operate instead of just reading mode … read, create, edit, delete, just like Claude would have access to the app." · "Make the chat more interactive; right now it's too small." · "Remove the testing section … keep the ability for testers to log the error … make Lucy serve the testers while the testing phase is ongoing." · "With Lucy's ability permissions, we need that in the Lucy gear."

In the prototype try: "Add a $180 skip bin expense to the South Wharf job" · "Start a quote for Leanne Crowe" · "Report a problem: the Variations card shows $0" · ⋯ › My reports · ⋯ › Lucy's setup. `?tester=0` shows it for someone outside the tester program. The prototype also shows a send card, a delete card, "Send for me", "Delete records", Email, Files and next-step buttons — **those are L2–L5 and are not built now.**

One commit per part.

## Part 1 — The panel (frontend)

Files: `components/tester/HelperPanel.tsx`, `HelperBubble.tsx`, `components/lucy/LucyChat.tsx`.

- Lucy is a **panel down the right-hand side**, full height, 16 px from the top, right and bottom: **560 px** wide from a 1181 px window up, **480 px** below. A button in her header, before ⋯ (`tc-wide`, `aria-pressed`), makes her **760 / 640** and back; remembered per browser. The bubble that opens her stays as it is.
- Greeting: "Hi {first name}, what do you need?" Typing box: "Ask Lucy, or tell her what to do…".
- Rows: the four question rows stay. Fill rows, in this order: **Start a quote for…** (fills "Start a quote for ") · **Add to a job…** ("Add to the job ") · Remind me… · I've got an idea · and for testers only **Report a problem** ("Report a problem: "). Every row and the typing box are on screen at 1024 × 768 with no scrolling.
- "What Lucy can do" (the `WHAT` text, and the same fixed answer in `ADMIN_SYSTEM_PROMPT`): keep Josh's words and add one sentence after "…answer questions about them.": **"I can also do the work for you — start and change quotes, add to jobs, raise invoices, book the calendar — and I always show you what I'm about to do and wait for your OK."**

## Part 2 — What Lucy can use, and "What Lucy can do" in her setup

**One set of tools.** Lucy keeps her own tools in `ai_tools.py` as they are and is also given every entry of `services/connector_tools.REGISTRY` (21 reads, 33 writes) — the same handlers, no second copy. Where a name is in both (`add_reminder`, `save_idea`) hers is used. `/api/mcp` and the connector do not change.

- A registry handler is called with **the caller's own `get_current_user` dict** (what the HTTP routes receive), never the connector's owner dict, so each route's own scoping and checks apply as on screen. Crew still get 403 on everything under `/api/ai`.
- **Reads run at once**, as today. **A write never runs inside the chat loop** — it becomes a card (Part 3). The two exceptions are her own `add_reminder` and `save_idea`: they save at once with her one-line confirmation, exactly as today.
- **Team admins:** a tool is offered only if the admin's access allows it. Registry `access` → `services.access` key: `estimates` → `quotes` · `invoices` → `quotes` · `crm` → `clients` · `projects` → `jobs` · `calendar` → `calendar` · `team` → `crew` for a read, `crew_edit` for a write · `timesheets` → `crew` · `equipment` → `equipment` · `library` → `products` · `settings` → `settings` · `dashboard` → none · `platform` → platform owner only, as now. For an admin without `pay`, pass tool results through `strip_pay`.

**Lucy's setup › What Lucy can do** (`components/lucy/LucySetupPanel.tsx`, first section, saved by the panel's own Save with the rest; `PUT /admin/profile/ai`, stored as `ai.can`):

| Row (`lucy-perm-{key}`) | Choices | Starts as | Covers the writes whose registry `access` is |
|---|---|---|---|
| Quotes (`quotes`) | Read · Read and change | Read and change | `estimates` |
| Clients and leads (`clients`) | same | same | `crm` |
| Jobs (`jobs`) | same | same | `projects` |
| Invoices (`invoices`) | same | same | `invoices` |
| Calendar and reminders (`calendar`) | same | same | `calendar`, and `save_idea` / `add_reminder` |
| Crew and HR (`crew`) | same | same | `team` |
| Library and products (`library`) | same | same | `settings` (suppliers) |

Section heading "What Lucy can do", with the line "Lucy always shows you what she is about to do and waits for your OK. This sets what she is allowed to offer at all." Sub-lines per row as in the prototype. **Only these seven rows in L1.**

- The setting is the business's. An admin's Lucy can do the **lesser** of this setting and that admin's own access.
- **Enforced on the server twice:** an area on Read is left out of her tool list, and the permission is checked again when a card is approved.
- When she is asked to change something in an area that is off she gets one small read tool, `setup_is_off(area)`, which returns the sentence she says — "Changing quotes is turned off in my setup, so I can only read them." — and no card. When `tools` in the chat response includes it, the panel shows a button **Open Lucy's setup** (`lucy-open-setup`) under that answer.
- Asked to send or delete (not in L1) she says so in one line and where to do it ("I can't send yet — open EST-0046 and press Send.").

## Part 3 — Confirm first: the card

**Nothing changes before the button.** When Claude's reply contains a write, the loop stops: the reads in that same reply run and their results are held, the write is stored as a waiting action, and the chat response carries it as `action`. One card waits per conversation.

**The card is built by the server from the tool and its arguments — never from the model's words.** New `services/lucy_actions.py`: title = the registry `title`; rows = label/value pairs from the arguments, with ids resolved to names (client, job, quote number, invoice number, crew member), money as `$1,234.00`, dates as the app shows them, long text cut at 300 characters, a list as a count and its first items. For an update, show only the fields being changed, as "old → new". No raw ids, no JSON. Examples in the prototype: "Add an expense" (Job · What · Amount · Category · Date) and "Draft a variation".

**A task of several steps** uses one Lucy-only tool, `do_steps({title, steps: [{tool, args}]})` (not in REGISTRY): up to 8 steps, each a write she is allowed; an argument written `"$1.id"` takes the id step 1 returned. The server checks every step against its tool's schema before showing anything. Card: the title, the numbered steps (each step's title and one line built from its arguments), button **Approve all N steps**. On approve the steps run in order and stop at the first one the app refuses; the rest are marked not run. A total on the card is allowed only if the server prices the lines the way saving does — never the model's figure; if that is not possible without saving, leave the total off the waiting card and show it on the done card from the saved quote. Say which you did in the report.

**Card states** (kicker · foot), as the prototype:

| State | Shows |
|---|---|
| waiting | "LUCY IS ABOUT TO" · **Approve** · **Change something** · **Cancel** |
| running | "LUCY IS WORKING" · "Working — step 2 of 4…", the steps tick (poll the action while the approve request is open) |
| done | "LUCY DID" · ✓ what happened, from the write's own result · "Approved by {first name} · 2:14 pm" · a button that opens the record (the `link` the write returns) |
| failed | "NOT DONE" · the app's own words (the route's `detail`) — then Lucy offers the right way (the prototype's example: an accepted quote can't be changed → she drafts a variation) |
| cancelled | "NOT DONE" · "Cancelled — nothing was changed." |
| replaced | "NOT DONE" · "Replaced by the one below" |
| moved on | "NOT DONE" · "Not done — you moved on." |

- **Approve:** `POST /api/ai/actions/{id}/approve`. The move from waiting to running is atomic, so a second click cannot run it twice (409). Permission (setup + the admin's access) is re-checked. The write goes through the same registry handler as the connector. Its result is saved **before** Claude is called again; then the loop resumes with the tool results and her follow-up text comes back in the same response. If that call fails or the day's allowance is used up, the card is still **done** — the write happened — and there is simply no follow-up.
- **Cancel:** `POST /api/ai/actions/{id}/cancel`. No model call.
- **Change something:** fills the box with "Change that: ". The next message carries `replaces_action_id`; if that turn produces a card the old one becomes replaced.
- **Moved on:** any other new message while a card waits marks it moved on.
- Only the admin who asked can approve or cancel their card; another admin of the business sees it without buttons ("Waiting for {name}").
- **History:** chat history stays text-only as today. A message that had a card is replayed to Claude with one bracketed line — the tool, its arguments and how it ended (proposed / done + result / cancelled / moved on) — so she can pick up "Change that: make it $220". `GET /ai/conversations/{id}` returns each message's `action` so a reopened chat shows its cards.
- **The record:** every approved write adds an `ai_tool_audit` row like the connector's, with `via: "lucy"`, the action id, who approved and the record touched.
- Test ids as the prototype: `lucy-act`, `lucy-act-kick`, `lucy-act-title`, `lucy-act-step-N`, `lucy-act-approve`, `lucy-act-change`, `lucy-act-cancel`, `lucy-act-state`, `lucy-act-link`; `data-kind` (`change` / `plan` / `report`) and `data-state` on the card.

**System prompt:** replace "The only things you write…" with: she does the work by calling the write tools; the app shows the user a card and nothing happens until they approve, so she never says something is done before the result comes back; she reads the record first (a quote's status before changing it); more than one change → `do_steps` once; she never invents ids, prices or rates. The two fixed answers stay word for word (plus the sentence in Part 1).

## Part 4 — One chat: testers report to Lucy

- **Remove the Help chat from the box:** the `help` tab, the "Help" menu item and `ThreadView` in the panel. `?help=1` opens Lucy on My reports. The `/api/feedback` routes and the team's inbox in Settings › Platform stay as they are. This is the tester helper only — nothing named Help hub is touched.
- **Testers only** (`sub.tester`; the server's existing `_tester` check): the **Report a problem** row and **My reports** in ⋯ (`tc-menu-reports`). Nobody else sees either.
- **Logging never needs the AI.** A message that starts "Report a problem" is handled by the app with no call to `/ai/chat`: with nothing after it Lucy asks "What went wrong?" and the next message is the report; otherwise a card (kind `report`): What happened · Page (title and path) · Browser ("Chrome · window 1440 wide") · Screenshot ("Attached" when an image is on the + button, else "None — add one with + first if it helps"). Button **Log it** → the existing `POST /api/feedback/threads` (kind `bug`, with the page, browser, viewport and the screenshot). Done: "Logged as FB-xxxxxxxx. The team will see it." — FB- plus the first eight characters of the thread id — with a **My reports** button.
- When a tester describes a fault in their own words mid-chat, Lucy has a tester-only tool `report_problem(what)`; the chat response then carries `report: {text}` and the panel shows the same card. It is not logged until **Log it**.
- **My reports** is a list, not a chat (no typing box): "Problems you have reported · N", newest first; each row the FB number, their words, the page, the date, the status (`new` → Logged · `replied` → Replied · `fixed` → Fixed · `parked` → Parked) and the team's latest reply under "THE TEAM". `GET /api/feedback/threads` gains `text` (the tester's first message) and `last_reply` (the latest message from `owner`). Opening the list clears the unread badge. **Add to this report** goes back to Lucy with the box filled "About FB-xxxxxxxx: "; sending it shows a card "Add to FB-xxxxxxxx" → `POST /api/feedback/threads/{id}/messages`. "← Back to Lucy" returns to the chat.

## Part 5 — Engine (`services/ai_provider.py`, `ai_routes.py`)

- **Prompt caching** (none today). The system text must be frozen: "Today is …" (it carries the minute) and "The owner is looking at …" move out of `system` into a text block at the end of the newest user message. Tools are sent sorted by name, the same list on every call of a conversation. Put `cache_control: {"type": "ephemeral"}` on the system block and on the last block of the last message of each request. Keep `thinking: {"type": "adaptive"}` and the model setting exactly as they are.
- **Pausing and resuming:** the assistant message is stored exactly as returned (every block, thinking blocks included, unedited); on approve it is sent back followed by **one** user message holding a `tool_result` for every `tool_use` in it — the held read results and the write's result, `is_error: true` with the app's words for a refusal.
- **Loop:** up to 10 model calls a turn instead of 4; `max_tokens` 16000. If a reply stops on `max_tokens`, run nothing and answer "That was too much for one go — ask me for it in two parts."
- **Allowance:** `usage.input_tokens` no longer includes cached tokens. Each `ai_audit_log` row also stores `cache_read_tokens` and `cache_write_tokens`; the day's allowance counts input + output + cache writes × 1.25 + cache reads × 0.1. The default allowance (300,000) and the Usage line in her setup do not change.
- In the report give the usage of one real turn of several calls from the preview (uncached · written · read per call). `cache_read` must be above zero from the second call on; if the preview has no key, say so.

## Checks

Pure tests (`tests/test_lucy_l1_*.py`, runnable with `--noconftest`): the tool list for each setting and each team-admin preset; an area on Read gives no write tools; the card rows for an expense, a client update ("old → new") and a `do_steps` plan; `$1.id` substitution and a plan that stops at a refused step; the allowance arithmetic; the history line. In-process, with the model faked: a write pauses and nothing is written; approve writes once and a second approve is 409; cancel writes nothing; approve by another admin is refused; approve with the allowance used up still writes; a permission turned off after the card was made refuses on approve.

On screen with the testing agent, TS_ data, **1440 then 1024**:
1. The panel is 560 / 480 wide and full height; the wider button gives 760 / 640; every row and the typing box are on screen.
2. "Add a $180 skip bin expense to {a TS_ job}" → a card; the job has no new expense until Approve; then "LUCY DID", the expense is on the job, the button opens it.
3. Change something → "Change that: make it $220" → the old card says "Replaced by the one below", the new one shows $220.00.
4. A new question while a card waits → "Not done — you moved on."
5. "Start a quote for {a TS_ client}" → one plan card; Approve all → the steps tick; a draft quote exists, nothing is sent.
6. Asked to change an accepted quote → no change is made; she says why in the app's words and offers a variation card.
7. Lucy's setup opens on "What Lucy can do": seven rows, all Read and change. Quotes → Read, Save: asked for a quote she says it is turned off, no card, and **Open Lucy's setup** opens it. Cancel in the setup saves nothing.
8. A team admin on the "site" preset (no quotes) is offered no quote tools.
9. Tester: no Help in ⋯; Report a problem → "What went wrong?" → the card with the page and the browser → Log it → "Logged as FB-…"; it is first in My reports as Logged, and in the team's inbox. Add to this report works. With the AI key removed (or the allowance at zero) the report still logs.
10. Not a tester: no Report a problem row, no My reports.
11. A crew login: 403 on `/api/ai/chat` and `/api/ai/actions/*`.

## Rules

TS_ rows only, torn down after; Josh's own tenant read-only; no backfill; nothing beyond this message and nothing from your own suggestion list; no notices or banners — the card is the message; AI is Claude only, through the app's own key; nothing under `app/employee/*`; no key, password or admin id in any reply. Report to `memory/reports/lucy-l1-report.md`. Add to the What's new **draft** (never publish): "Lucy can now do the work — ask her to start a quote, add an expense to a job or update a client. She shows you what she is about to do and waits for your OK. Choose what she may change in Lucy's setup." and, for testers, "Report a problem to Lucy — the separate Help chat is gone." Save to GitHub and Publish are Josh's clicks.

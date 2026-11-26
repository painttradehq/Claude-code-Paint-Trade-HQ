# Lucy — conversation first (a change to L1; two points of L2) — NOT SENT (waits for Josh's "send")

Josh, 26 Nov, after seeing L1 in the preview: "Why is Lucy showing like framing while creating an estimate and all? I thought it was going to be communication only, like the Claude connector would do." Offered three ways, he chose: **conversation only for creating and changing; a card only for what can't be undone** — "as close as we can get it to how we do it here."

Josh uploads the updated `lucy-operator.html` with it (it opens conversation-first; `?ask=1` shows it with "Ask me before changes" on). Checks: `tools/test_lucy_operator.js`, 192 of 192 at 1440 × 900 and 1024 × 768.

---

## The message to send

# Lucy — conversation first (a change to L1; two points of L2)

Josh has used L1 in the preview. His words: "Why is Lucy showing like framing while creating an estimate and all? I thought it was going to be communication only, like the Claude connector would do." So: **Lucy makes a change and tells you, in conversation — no card. A card stays only for what can't be undone.**

Josh is uploading an **updated `lucy-operator.html`** — save it over `memory/specs/lucy/lucy-operator.html`. It now opens conversation-first; add `?ask=1` to see it with "Ask me before changes" on (the L1 cards). Try: "Add a $180 skip bin expense to the South Wharf job" · "Start a quote for Leanne Crowe" then its button · "Record a payment on INV-0009" · "Report a problem: …" · ⋯ › Lucy's setup.

Do this with L2 if you are still in it, or straight after — its own commits, nothing else changed.

## 1. One switch: "Ask me before changes" — off as it starts

`ai.can.ask` (bool, default **false**), saved with the rest of Lucy's setup. In "What Lucy can do" it is the first row (`lucy-perm-ask`):

- The line under the heading becomes: "Lucy makes the change and tells you what she did. Before anything is sent to a client she shows you the email and waits for your OK."
- Row: **Ask me before changes** — "On: she shows a card and waits for your OK before every change. Off: she makes the change and tells you. Sending always asks first."
- Then a small heading "What she may change" above the seven area rows (and Send for me, from L2).

**On:** exactly what L1 built — cards, `do_steps`. Nothing in that path changes.

## 2. Off: a change runs in the conversation

- A registry write runs **inside the chat loop**, like a read, through the same path an approved card uses (`lucy_actions._run_one`): the same handler, the caller's own user dict, the same `ai_tool_audit` row with `via: "lucy"`. Its result (id, label, link) goes back to Claude as the tool result.
- Writes in one reply run **in order, one at a time** — never gathered in parallel. If the app refuses one, the rest of that reply are not run and each gets "not run — an earlier step was refused".
- `do_steps` is not offered — she calls the writes one after another with the real ids.
- **Permissions do not change:** an area on Read gives no write tools; a team admin's own access still cuts the list; `setup_is_off` as now.
- **Always a card, whatever the switch:** every send (L2); `record_payment` — a recorded payment cannot be removed in the app and is passed on to the accounting sync; and every delete when L3 comes.

**What the panel shows:** Lucy's answer as an ordinary message, and under it one plain button per record she touched — "Open EST-0046", "Open the job" (`lucy-open`) — from the `link` each write returns, no repeats. No box, no "LUCY DID", no step list. The chat response carries them as `did: [{label, link, link_label}]`; they are stored on the message and returned by `GET /ai/conversations/{id}` so a reopened chat still has its buttons.

**History:** the message is replayed to Claude with one bracketed line per write — tool, arguments, result — as `history_line` does for a card, so "send it" on the next turn knows which quote.

**What she is told** (`ADMIN_SYSTEM_PROMPT`, in place of the card paragraph when the switch is off): she makes a change by calling the write tool and it happens at once. Then she says in one or two lines exactly what changed — names, numbers and amounts from the results, never before the result has come back. If something needed is missing, or more than one record matches (two jobs in Ivanhoe), she asks one short question first and never guesses. If the app refuses a step she stops and says what was done and what was refused, in the app's own words. A draft is a draft: she says "Nothing is sent." With the switch on, the L1 paragraph is used. The system text stays frozen per business so it still caches.

## 3. L2, two points

- **Next-step button** (Part 4): with the switch off it follows the writes run in the turn — a draft quote started or changed, an invoice raised, a variation drafted — instead of a done card. Same buttons, same rules.
- **`record_payment` keeps its card** in both modes (as above). The send card is unchanged.

## 4. Testers' reports

With the switch off, "Report a problem: …" (the row or the words) is **logged at once** — the same `POST /api/feedback/threads`, still with no call to the AI — and Lucy says "Logged as FB-xxxxxxxx. I added the page you're on ({page}) and your browser. The team will see it." with a **My reports** button (`lucy-open`). "Report a problem" alone still gets "What went wrong?" first. "About FB-xxxxxxxx: …" is added at once: "Added to FB-xxxxxxxx." When Lucy herself guesses that a message is a fault (`report_problem`), the small report card stays — it is her guess, so the tester confirms it. With the switch on, as L1.

## 5. Words

- The fixed "what I do" answer and `WHAT` — the added sentence becomes: **"I can also do the work for you — start, change and send quotes, add to jobs, raise and send invoices, record payments, book the calendar. I tell you what I did, and before anything is sent I show you first and wait for your OK."**
- What's new draft #47, first card: "Lucy can now do the work — ask her to start a quote, add an expense to a job or update a client, and she does it and tells you. Before anything is sent to a client she shows you first. In Lucy's setup you choose what she may change, and whether she asks before every change." Still a draft.

## Checks

Pure / in-process (model faked): switch off — a write runs once inside the loop and its result returns to the model; two writes in one reply run in order; a refused write stops the ones after it; a send and `record_payment` still pause; `did` holds one entry per record; the history line; the audit row. Switch on — every L1 test still passes unchanged.

On screen with the testing agent, TS_ data, sends as a dry run, **1440 then 1024**:
1. As it opens: "Add a $180 skip bin expense to {a TS_ job}" → no card; the expense is on the job; her answer names the job and the amount; **Open the job** opens it.
2. "Start a quote for {a TS_ client}" → no card; a draft quote exists with its lines; her answer gives the number and the total as saved, and "Nothing is sent"; **Send it to {name}** → the send card; nothing is sent before **Send it**.
3. Two TS_ jobs with similar names, "add an expense to the {shared word} job" → she asks which one; nothing is written.
4. A change asked on an accepted quote → nothing changes; she says why in the app's words and offers a variation; on "yes" it is drafted, not sent.
5. "Record a payment on {INV}" → the card, in both modes.
6. Quotes on Read → nothing is created; she says it is turned off, with the setup button.
7. A team admin on the "site" preset → no quote is created.
8. Tester: "Report a problem: …" → logged at once, first in My reports and in the team's inbox; with the allowance at zero it still logs.
9. Lucy's setup: "Ask me before changes" is the first row and off. Turn it on and save → the same expense request waits on the L1 card; approve works as before.
10. A reopened conversation still shows its Open buttons. Nothing runs off sideways in the 480 px panel.

## Rules

As L1 and L2: TS_ rows only, torn down after; Josh's own tenant read-only; no backfill; nothing beyond this message and nothing from your own suggestion list; no notices or banners; AI is Claude only, through the app's own key; nothing under `app/employee/*`; no key, password or admin id in any reply. Add a section to the round's report. Save to GitHub and Publish are Josh's clicks.

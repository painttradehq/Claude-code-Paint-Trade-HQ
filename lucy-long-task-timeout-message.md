# Lucy — a long task ends in "Lucy could not answer just now" — SENT to Emergent 27 Nov on Josh's word ("send it")

Josh, 27 Nov, with a screenshot of Lucy's panel: "create test estimate of 10 items and accepted and create two invoices" → "Lucy could not answer just now." — "I keep getting error." The allowance line under it read 281,313 / 300,000.

**Read in the code (`a71a8f3`) — the cause:**
- `frontend/utils/api.ts` line 52 gives every request **30 seconds** (`timeout: 30000`). `LucyChat.tsx` posts `/ai/chat` through that client; a card's approve goes the same way.
- Since conversation-first, a task of several changes runs inside that one request — several calls to the model, one after another, each carrying her tools. Ten lines, an acceptance and two invoices is well past 30 seconds.
- When the client gives up there is no answer from the server, so `LucyChat.tsx` line 131 falls to its last words, "Lucy could not answer just now." Every real AI failure has its own sentence (`ai_provider._Call`: not connected, allowance used up, key rejected, busy, "AI request failed"), which is why this one says nothing.
- The server is not told the panel gave up. The turn may run to its end or be cut part-way (the app's http middlewares can cancel the endpoint when the connection closes). So the user sees an error while a quote, a job or an invoice may already exist; asks again; and may get a second set. Every try spends the day's allowance.

Not confirmed from a log — this chat cannot see the server. The message asks Emergent to measure it on a test account first.

**No prototype** — one quiet line under the three dots is the only new thing on screen.

---

## The message as sent

# Lucy — a long task ends in "Lucy could not answer just now"

Josh, on the app: "create test estimate of 10 items and accepted and create two invoices" → **"Lucy could not answer just now."**, every time he tries.

**Tests: test accounts only — never Josh's account, mailbox, number or storage; made for the run and removed after; dry run only.**

## What the code says

- `frontend/utils/api.ts` gives every request 30 seconds (`timeout: 30000`). `LucyChat.tsx` posts `/ai/chat` with that client, and a card's approve too.
- Since conversation-first a task of several changes runs inside that one request: several model calls in a row. A quote of ten lines, accepted, with two invoices, is well past 30 seconds.
- With no response there is no `detail`, so the panel shows its fallback. Every real AI failure already has its own sentence from `ai_provider._Call`.
- The turn is not stopped cleanly: it may finish, or be cut part-way when the connection closes. The user sees an error while records may exist, asks again, and may get a second set. Each try spends the allowance.

## First — measure, on a test account

The same ask on a TS_ business. Report: how long the request takes; whether the turn was still running when the panel gave up; what was created; and whether anything between the browser and the app cuts a long request — time one that takes 120 seconds through the preview's public address. Put the numbers in the report.

## The fix

1. **Time.** Lucy's two calls — `/ai/chat` and `/ai/actions/{id}/approve` — get their own limit of 180 seconds. No other request changes.
2. **The turn finishes whatever happens to the request.** Run the turn as its own task, shielded from the request being cancelled. Its reply, Open buttons and any card are saved to the conversation exactly as today.
3. **One turn at a time in a conversation.** While one is running, another message to that conversation → 409 "I'm still working on your last message." — so asking again cannot start a second set. The mark clears when the turn ends, however it ends, and can never outlive 5 minutes.
4. **The panel waits instead of giving up.** When the chat call or an approve ends with no answer from the server — a timeout, a dropped connection, a gateway's page; anything without the server's own `detail`:
   - keep the three dots, with one quiet line under them (`ai-still-working`): "Still working — this is a long one."
   - ask for the conversation every 3 seconds, for up to 4 minutes. When the reply to that message is there, show it as any reply: her words, the Open buttons, the card.
   - for a new chat the panel makes the conversation's id itself and sends it, so there is something to ask for.
   - only after 4 minutes: "That took longer than I can wait for. Look in Past chats in a minute before asking again — the work may already be done."
5. **"Lucy could not answer just now."** stays only for an error the server answered without words.

If the measurement shows a gateway cutting requests under 180 seconds, 2 to 4 are what carry the turn through; say so in the report.

## Checks

Pure / in-process: a turn whose request is cancelled still completes and saves one reply; a second message during a running turn is 409 with the sentence, and is accepted once the turn has ended; the mark clears after a failed turn; a turn for one conversation does not block another.

On screen with the testing agent, **test accounts only**, 1440 then 1024:
1. Josh's own words on a TS_ business → no error: the dots, then "Still working — this is a long one." if it runs past the limit, then her answer with its Open buttons. Exactly one quote with ten lines, accepted; its job; the invoices asked for. Nothing twice.
2. Send again while she is working → "I'm still working on your last message." and nothing is started.
3. Close her panel while she is working and open it again → the reply is in the conversation when it lands.
4. The connection cut on purpose mid-turn → the waiting line, then the reply; the work is done once.
5. A turn made to run past 4 minutes → the last sentence; Past chats shows the reply when it lands.
6. A short ask ("What's owed?") → as fast as today, no waiting line.
7. An approve that runs long → the same waiting, the card ends Done once.
8. Nothing runs off sideways in the 480 px panel.

## Rules

As the rounds before: this message only — nothing from your own suggestion list; no backfill; no notices or banners; AI is Claude only, through the app's own key; nothing under `app/employee/*`; no key, password or admin id in any reply. **Tests: test accounts only — never Josh's account.** Report to `memory/reports/lucy-long-task-report.md`. Add one line to What's new draft #47 (never publish): "Lucy now sees a long job through — ask for several things at once and she keeps working until it is done." Save to GitHub and Publish are Josh's clicks.

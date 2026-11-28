# Lucy — a long task that fails says why, and what was done — NOT SENT, waits for Josh's "send"

Josh, 28 Nov, with a screenshot — one long request (a client, an estimate with seven lines, send, wait for approval, deposit invoice, crew, finish, invoice, completion report) answered by "Lucy could not answer just now." — "same thing happened?" Then: "I clicked publish, check the code again."

No prototype: words in a bubble that already exists.

## What the code shows (app repo `14df5fb`, saved 28 Nov after the cost round)

The long-task fix is in the saved code: 180 seconds for her two calls, the turn runs to its end on the server, the panel waits up to 4 minutes, and the line beside the dots names her step.

With that fix, "Lucy could not answer just now." is still shown in two cases (`components/lucy/LucyChat.tsx`):

1. the server answered with an error that carries no words;
2. the request was cut (the gateway, at about 60 seconds), the panel waited, and the turn then **ended on the server without leaving a reply** — three checks in a row find nothing running and no answer.

Case 2 is a gap: `_chat_turn` (`backend/ai_routes.py`) saves Lucy's message only when the turn succeeds. When it fails — the AI is busy, the allowance ran out, anything unexpected — the reason goes back on a request nobody is listening to any more, and nothing is written in the conversation. The changes she had already made in that turn are not written there either. The reason is kept only in the audit log.

Also: after ten rounds of tools she is told to answer with what she has. That call is covered by an in-process check only — the cost round says no task reached it on the real API.

Whether Josh's own failure was this gap is not known: it needs the audit log row for that message (his to read: Lucy's gear › Open the audit log).

---

## The message to send

# Lucy — a long task that fails says why, and what was done

**Josh's rule, first: no test runs on his account.** Not signed in to, not read, not written — never his mailbox, text number or storage. Every database read in this round carries the TS_ business's own filter. Seed only through the dry-run server. TS_ business made for the run, removed after; sends are dry runs.

Josh asked Lucy for one long job and got "Lucy could not answer just now." — after the long-task fix. Read in the code: when a turn fails on the server after the request has been cut, nothing is left in the conversation, so the panel's wait ends with the bare line and the reason is lost.

Two parts. One commit each.

## Part 1 — a failed turn leaves a reply

In `_chat_turn`, when `_turn` raises:

1. Save Lucy's message for that turn, as a good turn does:
   - the reason in the app's own words — the `detail` the route would have returned ("AI is busy, try again in a minute", "Today's AI allowance is used up — it resets at midnight"); for anything without words of its own: "Something went wrong on my side."
   - when she had already made changes in that turn (`ctx["writes"]`), the same `did` lines and `writes` a good turn saves, so the conversation shows what was done. With changes made, the unnamed case reads: "Something went wrong on my side. What I had already done is listed here — nothing else was changed."
2. Then raise as today — what the request itself answers does not change.

The panel needs no change: its wait finds the reply and shows it. "Lucy could not answer just now." stays only for when the server has nothing to say.

## Part 2 — out of steps: what is done, what is left

1. The last-resort instruction in `chat_turn` becomes: "Answer now with what you already have — do not call any more tools. Say what is done and what is left to do, so the owner can say 'carry on'."
2. **Prove that call on the real API.** On a TS_ business, one request that needs more than ten rounds of tools in one turn (Josh's own will do: "create a client with full details, create an estimate with 5 different lines and 2 optional items, each with 2 different tasks, choose product and colours, send it"). Report: how many calls, how many seconds, her answer word for word, and whether the turn ended with a reply. If the API refuses that call, say what it said and fix it.

## Checks

Pure / in-process:
1. A turn that raises after one change → the conversation holds Lucy's message with the reason and the `did` line for that change; the request still answers with the same error as today.
2. A turn that raises with no change → the reason alone.
3. The allowance used up → its own sentence, saved once.

On screen, TS_ admin, **1440 then 1024**, with the cut simulated as in the long-task round:
4. A turn that fails after the cut → the panel's wait ends with Lucy's reason bubble and what was done; not "Lucy could not answer just now."
5. Reopen the conversation → the same message, once.
6. The Part 2 request → the step line runs, she ends with what is done and what is left; "carry on" picks up from there.

## Rules

This round only — nothing from your own suggestion list. No notices or banners. Nothing under `app/employee/*`. No key, password or admin id in any reply. Add a section to `memory/reports/lucy-long-task-report.md`. What's new **Draft** (never publish) — one line on the Lucy card of draft #47: "If Lucy cannot finish a long job, she tells you why and what she had already done." Save to GitHub and Publish are Josh's clicks.

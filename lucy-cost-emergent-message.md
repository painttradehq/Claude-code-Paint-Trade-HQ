# Lucy — what she costs: measure it, cut the waste, price the cheaper setups — SENT to Emergent 28 Nov on Josh's word ("send the cost round")

Josh, 28 Nov, after the token explanation: "This is certainly going to be a costly process… this is certainly unaffordable… we need to investigate why this is happening and find a solution here."

No prototype: nothing he looks at changes. Behaviour and a report only.

## What the code shows (app repo `a71a8f3`, read 28 Nov)

- **Model.** `AI_MODEL` defaults to `claude-opus-5` (`services/ai_provider.py` line 22) and every AI feature uses it: Lucy's chat, the Today briefing, suggested replies, job and performance summaries, price refresh.
- **Thinking.** Every call sends `thinking: adaptive` with no effort set, so each one runs at the default (high) — including one-line jobs.
- **What rides on every call.** An admin with everything on gets **96 tools** — 37,934 characters of definitions — plus about 8,000 characters of instructions. Together about **14,000 tokens** before the owner has typed a word (estimate from the code; round 1 measured about 13,000 with fewer tools).
- **Caching is set up correctly.** Instructions are frozen, tools are sorted, the date goes in the message. So the 14,000 are billed at a tenth when the last call was under 5 minutes ago — and at 1.25× when it was not. A painter who asks one thing and goes back to work pays the full 1.25× nearly every time.
- **One leak.** After 10 rounds the last-resort call is sent without the tool list, which changes the front of the prompt and re-bills all of it.

Prices read from Anthropic's price page on 27 Nov 2026, US$ per million tokens:

| Model | Input | Cache write (5 min) | Cache read | Output |
|---|---|---|---|---|
| `claude-opus-5` (today) | 5.00 | 6.25 | 0.50 | 25.00 |
| `claude-opus-5-5` | 4.00 | 5.00 | 0.20 | 20.00 |
| `claude-sonnet-5-5` | 2.00 | 2.50 | 0.10 | 10.00 |
| `claude-haiku-5-5` | 0.10 | 0.125 | 0.01 | 0.50 |

By arithmetic on those (estimates, until Part 1 measures): one simple question with one lookup costs about US$0.13 from a cold start and US$0.05 warm today; about US$0.05 / US$0.02 on Sonnet 5.5; under half a cent on Haiku 5.5.

---

## The message as sent

# Lucy — what she costs: measure it, cut the waste, price the cheaper setups

**Josh's rule, first: no test runs on his account.** Not signed in to, not read, not written — and never his mailbox, text number or storage. Make a TS_ test account for this run and remove it after. Nothing leaves: sends are dry runs, as in the earlier rounds.

Josh: "We need to investigate why this is happening and find a solution." Lucy runs on `claude-opus-5` at default effort and carries about 96 tool definitions on every call. This round finds out what that costs in dollars, removes what is plain waste, and prices the cheaper setups on the same tasks — **without switching the model**. Josh picks from the table.

Three parts, in order. One commit per part. This spends real AI money on the run: keep it to the runs listed here.

## Part 1 — Measure today (change nothing)

1. **A cost set, kept in the repo** — `backend/tools/lucy_cost_set.py`. It makes a TS_ business with a few clients, a quote, a job and two invoices, runs each task below through `POST /api/ai/chat` (and the card's approve where one appears) as its TS_ admin, checks the result, and removes everything it made. Raise that test account's own daily allowance for the run; nobody else's.
2. **The tasks**, each a new conversation, typed as an owner would:
   1. "What can you do?"
   2. "Who owes me money?"
   3. "What's on this week?"
   4. "Which quotes have gone quiet?"
   5. "Add a client — TS_ Dana Reid, 0400 000 001, ts_dana@example.com"
   6. "Log a call with TS_ Dana Reid — wants the fence done too"
   7. "Make a quote for TS_ Dana Reid: prep, two coats on walls, ceilings"
   8. "Send that quote" (same conversation as 7; approve the card)
   9. "Book the TS_ job for next Tuesday and put TS_ crew on it"
   10. "Record a $500 payment on the TS_ invoice"
   11. "Add a $120 paint expense to the TS_ job and a variation for an extra coat, $450"
   12. Josh's own: "Create a test estimate of 10 items, accept it and create two invoices"
   
   And once each: the Today briefing (Run now), a suggested reply on one conversation, a job summary, a performance summary.
3. **A check per task** — the record exists with the right fields, or the answer names the right client and amount. Pass or fail, nothing in between.
4. **Record per task**: number of AI calls; uncached input, cache write, cache read and output tokens (the `usage` the route already returns); seconds; and dollars at the prices below. Give two dollar figures — **cold** (the tools and instructions billed as a write) and **warm** (billed as a read) — worked out from the counts, not by waiting five minutes between tasks.
5. Report the size of what rides on every call: tokens for the tool list and for the instructions, counted with the API's token counter.
6. State which model the preview is really set to — the `AI_MODEL` setting, name only.

US$ per million tokens:

| Model | Input | Cache write | Cache read | Output |
|---|---|---|---|---|
| `claude-opus-5` | 5.00 | 6.25 | 0.50 | 25.00 |
| `claude-opus-5-5` | 4.00 | 5.00 | 0.20 | 20.00 |
| `claude-sonnet-5-5` | 2.00 | 2.50 | 0.10 | 10.00 |
| `claude-haiku-5-5` | 0.10 | 0.125 | 0.01 | 0.50 |

## Part 2 — Cut the waste (what Lucy can do does not change)

1. **Tools on demand.** Add Anthropic's tool search tool to Lucy's list and mark the tools `defer_loading: true`, keeping loaded only `do_steps`, `setup_is_off` and the five tools Part 1 shows she calls most. Every tool stays in the list, sorted as today, so permissions, cards and the cache are untouched; she looks up the rest when she needs them. Follow Anthropic's page for it: `platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool`.
2. **The last-resort call keeps its tools.** In `chat_turn`, the call after `max_iters` sends no `tools`, which re-bills the whole prompt. Keep the list and set `tool_choice` to none.
3. **Run the cost set again.** Keep step 1 only if all twelve tasks still pass and the set costs less; if a task fails or the cost does not fall, take step 1 back out and say so.

## Part 3 — Price the cheaper setups (switch nothing)

Run the whole cost set once under each setup, in preview, on the test account. Finish one setup before starting the next.

| Setup | Model | Effort |
|---|---|---|
| A | `claude-opus-5` | default — today, the Part 2 result |
| B | `claude-opus-5-5` | default |
| C | `claude-sonnet-5-5` | default |
| D | `claude-sonnet-5-5` | `low` |
| E | `claude-haiku-5-5` | default |

Before each, read Anthropic's migration notes for that model and check what the app sends is accepted (`thinking: adaptive` is, on all four). Effort goes in `output_config`.

When the runs are done, **put the preview back to setup A.** No model or effort change is saved in this round.

## The report

`memory/reports/lucy-cost-report.md`:

1. Part 1 table — a row per task: calls, the four token counts, cold US$, warm US$, seconds, pass/fail. Then the tokens for the tool list and the instructions, and the model the preview runs.
2. Part 2 — the same table after the change, and whether step 1 stayed.
3. Part 3 — a row per task, a column per setup, each cell pass/fail and cold US$; a bottom row with the total for the set and the number failed. One line on what went wrong for any failed cell.
4. What the whole round spent.

No recommendation needed — the table is the answer. Josh chooses.

## Rules

This round only — nothing from your own suggestion list. TS_ rows only, torn down after. No notices or banners. Nothing under `app/employee/*`. No key, password or admin id in any reply — a model name is fine, the key is not. No What's new card: nothing a customer sees changes. Save to GitHub and Publish are Josh's clicks.

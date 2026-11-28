# Lucy on Sonnet 5.5 · a failed task says why · a quote with a job says "Open live project" — one message, three parts — WAITS for the crew chat's Round C7 to finish at Emergent; goes the moment it reports done

Josh, 28 Nov: "Switch Lucy to Sonnet 5.5 and send it. And send the other ones too, all at once."

Read at Emergent when he said it: Round C7 (the crew chat's round) is mid-build and paused for its second prototype and brief. His standing rule is one round at a time across the admin chat and the crew chat, so this is held until C7 reports done, then sent as written.

**The model:** Sonnet 5.5 at low effort — setup D of the cost round, the one recommended to him and the only Sonnet 5.5 setup he was shown as the pick (all 16 tasks passed; the set US$0.80 cold against US$2.34 today; 75 seconds against 160).

Parts B and C are the two messages already written (`lucy-failed-turn-says-why-message.md`, `quote-open-live-project-message.md`), unchanged except for the shared rules at the top.

No prototype: nothing new to look at — a setting, words in a bubble that exists, words on two buttons that exist.

---

## The message to send

# Three parts: Lucy on Sonnet 5.5 · a failed task says why · a quote with a job says "Open live project"

**Josh's rules for every part, first:**
- **No test runs on his account.** Not signed in to, not read, not written — never his mailbox, text number or storage.
- **Every database read carries the TS_ business's own filter** — no read without it, not even for field names.
- **Seed only through the dry-run server.** TS_ rows only, made for the run and removed after. Nothing leaves.

From the admin chat, after Round C7. Three parts, in this order, one commit each. Josh: "Switch Lucy to Sonnet 5.5 and send it. And send the other ones too, all at once."

---

## Part A — Lucy runs on Sonnet 5.5, low effort

Setup D of the cost round, for every AI feature: Lucy's chat, the Today briefing, suggested replies, the job and performance summaries, price refresh.

1. **The model.** `AI_MODEL`'s default in `services/ai_provider.py` becomes `claude-sonnet-5-5`. The setting stays unset in the preview, so the live app follows the code when Josh publishes. Say in the report if it is set anywhere.
2. **The effort.** Every call through `_create` sends effort `low` in `output_config`. `complete_json` already sends `output_config` for its schema — one `output_config` with both. A setting `AI_EFFORT` beside `AI_MODEL`, default `low`. `thinking: adaptive` stays.
3. **The photo path — the check your cost report flagged.** A message with a photo → a card → approve → her follow-up, on Sonnet 5.5, on the real API. It must end with her reply. If the rewritten message (the photo becoming "[photo]") breaks it, fix it so the conversation up to her thinking is passed back unchanged.
4. **A card from before the switch.** A card made while the model was `claude-opus-5`, approved after: the change goes through and her follow-up arrives. Once, on the real API.
5. **Run the cost set once on the new default.** All sixteen pass, and the set costs about what setup D did. If a task fails, say which and stop — do not switch back by yourself.
6. **Her words, side by side.** In the report, word for word, for tasks 2, 7 and 12, the Today briefing and the suggested reply: what she wrote on `claude-opus-5` (the Part 1 run already on file) and what she writes now. No judgement — Josh reads them.

The daily allowance and how it is counted stay as they are. No What's new card.

Report: a new section at the end of `memory/reports/lucy-cost-report.md`.

---

## Part B — a long task that fails says why, and what was done

Read in the code: when a turn fails on the server after the request has been cut, nothing is left in the conversation, so the panel's wait ends with "Lucy could not answer just now." and the reason is lost.

### B1 — a failed turn leaves a reply

In `_chat_turn`, when `_turn` raises:

1. Save Lucy's message for that turn, as a good turn does:
   - the reason in the app's own words — the `detail` the route would have returned ("AI is busy, try again in a minute", "Today's AI allowance is used up — it resets at midnight"); for anything without words of its own: "Something went wrong on my side."
   - when she had already made changes in that turn (`ctx["writes"]`), the same `did` lines and `writes` a good turn saves, so the conversation shows what was done. With changes made, the unnamed case reads: "Something went wrong on my side. What I had already done is listed here — nothing else was changed."
2. Then raise as today — what the request itself answers does not change.

The panel needs no change: its wait finds the reply and shows it. "Lucy could not answer just now." stays only for when the server has nothing to say.

### B2 — out of steps: what is done, what is left

1. The last-resort instruction in `chat_turn` becomes: "Answer now with what you already have — do not call any more tools. Say what is done and what is left to do, so the owner can say 'carry on'."
2. **Prove that call on the real API.** On a TS_ business, one request that needs more than ten rounds of tools in one turn (Josh's own will do: "create a client with full details, create an estimate with 5 different lines and 2 optional items, each with 2 different tasks, choose product and colours, send it"). Report: how many calls, how many seconds, her answer word for word, and whether the turn ended with a reply. If the API refuses that call, say what it said and fix it.

### Checks for Part B

Pure / in-process:
1. A turn that raises after one change → the conversation holds Lucy's message with the reason and the `did` line for that change; the request still answers with the same error as today.
2. A turn that raises with no change → the reason alone.
3. The allowance used up → its own sentence, saved once.

On screen, TS_ admin, **1440 then 1024**, with the cut simulated as in the long-task round:
4. A turn that fails after the cut → the panel's wait ends with Lucy's reason bubble and what was done; not "Lucy could not answer just now."
5. Reopen the conversation → the same message, once.
6. The B2 request → the step line runs, she ends with what is done and what is left; "carry on" picks up from there.

Report: a section in `memory/reports/lucy-long-task-report.md`. What's new **Draft** (never publish) — one line on the Lucy card of draft #47: "If Lucy cannot finish a long job, she tells you why and what she had already done."

---

## Part C — a quote that has a job says "Open live project"

Josh: "In the side bar of an accepted quote it says Create live project, while the accepted quote gets a project automatically — so that should say Visit live project or Manage this project or something else."

### What the code says

- `app/admin/estimates.tsx` already has `label={est.project_id ? 'Open live project' : 'Create live project'}`, but no quote ever carries `project_id` (the job holds `estimate_id`; `GET /estimates` adds nothing), so it always reads "Create live project". The press then gets the create route's 409 with the job's id and opens it.
- `components/estimate/v2/Builder.tsx`, ⋯ › Convert to live project, posts to `/estimates/{id}/convert-to-project`. There is no such route — it always ends in "Could not convert".

### The fix

1. **The quote knows its job.** `GET /estimates` and `GET /estimates/{id}` return `project_id` for a quote that has a job — for the list, one read for all the quotes on the page (`$in` on `projects.estimate_id`), inside the list's read budget. Never stored on the quote; never accepted back on a save (add it to the keys the save drops).
2. **The Quotes list's side panel** — one rule for both places the tile shows (accepted, and every other status): the quote has a job → **Open live project**, straight to `/admin/project/{id}`, no create call. No job → **Create live project**, as today.
3. **The builder's ⋯ menu** — the same rule and the same words: has a job → **Open live project** → `/admin/project/{id}`; no job → **Create live project**, posting the route that exists (`POST /projects/from-estimate/{id}`) and opening the new job; a refusal shown in the app's own words. "Convert to live project" and the call to the missing route go.

### Checks for Part C

Pure: the list and the single read carry `project_id` only for a quote with a job; a save that sends `project_id` back changes nothing; the list's read-budget test.

On screen with the testing agent, 1440 then 1024:
1. An accepted TS_ quote (its job made by the acceptance): the side panel's tile reads **Open live project** and opens that job. No second job is made.
2. The same quote in the builder: ⋯ › **Open live project** opens that job.
3. A TS_ draft with no job: both read **Create live project**; each makes the job once and opens it; pressed again they read Open live project.
4. A quote being revised (back in Draft with its job): **Open live project** in both places.
5. Nothing runs off sideways in the side panel or the menu.

Report: `memory/reports/quote-open-live-project-report.md`. What's new **Draft** (never publish) — one line in draft #47: "A quote that already has a job now says Open live project, on the Quotes list and inside the quote."

---

## Rules for all three

These three parts only — nothing from your own suggestion list. No backfill. No notices or banners. Nothing under `app/employee/*`. No key, password or admin id in any reply — a model name is fine. Save to GitHub and Publish are Josh's clicks.

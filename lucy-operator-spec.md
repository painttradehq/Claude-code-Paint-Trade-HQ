# Lucy does the work — spec (25 November)

**Josh, 25 Nov:** "We have decided to give Lucy full access to operate instead of just reading mode — Lucy will be able to read, create, edit, delete just like Claude would have access to the app. Lucy will become fully functional to talk to the admin and take on all types of tasks. We already have some ability for Lucy; we just have to create more." Then, the same day:

- "We also need to make the chat more interactive; right now it's too small."
- "We need to remove the testing section of it, because now it's two sections: one is the Lucy chat and the other is a chat for testers. Although we need to keep the ability for testers to be able to log the error if they come across any. So make Lucy in a way that serves the testers while the testing phase is ongoing."
- "My other Claude account … also has connectors connected to my painting emails and storage, which is essential to run it effectively. We already have connectors in the app that users can connect their emails and storage; Lucy should be able to connect to these too and create, edit, delete and read what it's allowed to do."

- (26 Nov) "With Lucy's ability permissions, we need to have that in the Lucy gear: what the user wants Lucy to be able to do. For the emails and storage it has to be what the admin set it to be, and not just Google."

This promotes the parked item "Lucy does the work in the app, confirm first" (17 Nov) to a build. **Round L1 went to Emergent on 26 Nov on Josh's word** (`lucy-l1-emergent-message.md`) and is built and saved to GitHub; **L2 went the same day** (`lucy-l2-emergent-message.md`); L3–L5 follow one at a time, each on his "send". What L1 narrows from this spec is listed in §9.

**Prototype:** `lucy-operator.html` (built by `tools/make_lucy_operator.py` on top of the Round 73 box, `lucy-chat-notion.html`). **Checks:** `tools/test_lucy_operator.js` — 192 of 192 at 1440 × 900 and 1024 × 768 (26 Nov: the round 2 cards, then conversation first). The prototype opens conversation-first; `?ask=1` shows it with "Ask me before changes" on. Add `?tester=0` to see it as someone who is not in the tester program, and `?mail=microsoft&storage=onedrive` or `?mail=none&storage=builtin` to see Lucy's setup for a business on other providers.

## 1. What the prototype shows

| Piece | Decision |
|---|---|
| Size | Lucy is a **panel down the right-hand side**, full height (16 px from the edges): **560 px** wide from 1181 px up, **480 px** below. A button in her header (before ⋯) makes her **wider** (760 / 640) and narrower again. The bubble that opens her stays. |
| Greeting | "Hi Josh, what do you need?" The typing box says "Ask Lucy, or tell her what to do…". |
| Rows | The four question rows stay. Fill rows: **Start a quote for…**, **Add to a job…**, Remind me…, I've got an idea, and for testers **Report a problem**. |
| The action card | Anything that changes something arrives as a card: "LUCY IS ABOUT TO" + a title + exactly what will change. **Nothing happens before the button.** Buttons: **Approve** · **Change something** · **Cancel**. |
| A task of several steps | One card lists the steps (numbered) with a total; **one approval** ("Approve all 4 steps"). While she works the card says "Working — step 2 of 4…" and the steps tick. |
| Sending | Its own card: who it goes to, the subject, the words, the attachment. The button says **Send it**. Sending always gets its own card, even inside a longer task. |
| Deleting | A red card: what is deleted, what is linked, "This can't be undone." The Delete button stays off until the record's number is typed. One record per card. |
| Done | The card turns to "LUCY DID", says what happened, "Approved by Josh · 2:14 pm", a button to open the record, and, where there is an obvious one, a **next step** ("Send it to Leanne"). |
| Change something | Fills the box with "Change that: "; the answer replaces the card (the old one is marked "Replaced by the one below"). |
| Moving on | A new message while a card waits cancels it: "Not done — you moved on." Only one card waits at a time. |
| The app's rules | Lucy goes through the same routes as the screens, so the same refusals come back in the app's own words (the example: an accepted quote can't be changed) and she offers the right way instead (a variation). |
| Answers | An answer can carry a next step too ("What's owed?" → "Send a reminder for INV-0009"). |
| One chat | The **Help** chat for testers is gone from the menu. See §4. |
| Lucy's setup | Opens with **What Lucy can do** — the admin chooses her abilities. See §2a. When something is turned off she says so in one line with a button to open her setup; no card. |

## 2. What Lucy can do — the full list, and what I recommend stays out

Lucy uses **one set of tools, the same one the Claude connector uses** (`services/connector_tools.py`; after Round K: 21 reads and 33 writes) — no second copy. "Create more" means adding tools to that one set; each new tool then works for Lucy and, where it is safe without a person watching, for the connector.

| Area | Has today (through the connector's tools) | To add |
|---|---|---|
| Clients and leads | create, update, note, log a call, convert a lead | archive / delete a client or lead, contacts |
| Quotes | create, update (zones, lines, discount, GST, plan), status, follow-ups | **send / resend**, duplicate, archive, delete an archived draft, refresh rates |
| Jobs | create (from a quote or by hand), update, start, complete, expense, note, variation (draft, change) | **send a variation**, delete an expense / variation / hire row, equipment hire, crew on the job, delete a job |
| Invoices | raise from a quote | edit lines and details, **send**, reminder, **record a payment**, archive, credit note (see below) |
| Calendar, reminders, ideas | create and update events, reminders, ideas | delete an event or reminder |
| Crew and HR | coaching note, recognition, save a contract template | issue a contract, timesheet fixes (add / fix a session), documents |
| Library and products | read | create and change items, tasks and products |
| Suppliers | create, update | delete |
| Email (§3) | reads the Inbox, drafts | **send a new email or a reply** from the connected mailbox |
| Files (§3) | — | find, read, save, move, delete in the business's own folder |

**Recommended to stay outside Lucy — the keys to the account, not the day's work.** Josh's word decides each:

- passwords and PINs; team admins and what each may access; pay rates
- the plan, billing and the business's Stripe keys; charging a card or refunding one
- Start fresh, bulk deletes and data export; platform-owner tools; Lucy's own key and allowance
- **more than one record per delete** — "delete all my drafts" becomes a list she walks through, one card each

## 2a. Lucy's setup › What Lucy can do — the admin decides

The first section of Lucy's setup (the gear), saved with the rest of it:

| Row | Choices | Starts as |
|---|---|---|
| Quotes · Clients and leads · Jobs · Invoices · Calendar and reminders · Crew and HR · Library and products | **Read** · **Read and change** | Read and change |
| Send for me (quotes, invoices, reminders, emails) | on / off | on |
| Delete records | on / off | **off** |
| Email — names the mailbox this business connected | Off · Read · Read and send | Read and send (Off, and not selectable, when no mailbox is connected) |
| Files — names the storage this business uses | Off · Read · Read and change | Read and change |

- The setting is the business's, like the rest of Lucy's setup. An admin's Lucy can do the **lesser** of this setting and what that admin may do in the app.
- **It is enforced on the server**, not only in the panel: Lucy is given only the tools the setting allows, and a call outside it is refused.
- "Read and change" never removes the card — every change still asks.
- The starting values are a recommendation: everything on except Delete, because each action asks first. Josh's word decides.

## 3. Email and storage — Lucy uses what the business has connected

No new connector: Lucy runs inside the app, and the app already holds each business's mailbox (Settings › Communication: Gmail, Microsoft, or IMAP/SMTP), storage (built-in, Google Drive, OneDrive) and calendars. **She works with whichever the admin set — not only Google.** Her email and file actions go through the app's own mail and storage layer (`routes/comms.py`, `services/file_storage.py`), which already switches on the business's choice, so the same action works on Gmail, Outlook or a mail server, and on Drive, OneDrive or the app's own storage. The setup row names the provider ("Your connected mailbox: Outlook · …", "Your storage: OneDrive · the Paint Trade HQ folder"). Each action is behind its card.

| | What the connection allows today | What Lucy does with it | Not possible without asking the user for more permission |
|---|---|---|---|
| Gmail | read mail, send mail | read and search the synced Inbox, draft, send, reply | delete, archive or label an email (needs Google's "modify" permission, a restricted one Google must approve) |
| Microsoft | Mail.Read, Mail.Send | the same | delete or move an email (needs Mail.ReadWrite) |
| IMAP / SMTP | read, send | the same | — |
| Google Drive | only the files the app created (`drive.file`) | create, read, move, rename, delete inside the **Paint Trade HQ** folder | see or search the rest of the Drive (a restricted permission Google must approve) |
| OneDrive | Files.ReadWrite | the same, in the Paint Trade HQ folder | — (the permission is already broad; she is kept to the app's folder by rule) |
| The app's own storage | everything the app stored | the same | — |

So today's connections give Lucy **read and send** on email and **full control inside the app's own folder** on storage. Deleting emails or reaching the whole Drive, as Josh's Claude account can, means asking each user for wider permissions and, for Google, passing its review. That is a decision on its own (L5 below), not a blocker for the rest.

## 4. One chat: testers report to Lucy

- The Help tab / "Help" menu item (the second chat) is removed. Its backend stays: a report is still a feedback thread the team sees where it sees them now.
- Someone in the tester program gets a **Report a problem** row and **My reports** in the ⋯ menu. Nobody else sees either.
- "Report a problem: …" → a card with their words plus what Lucy adds herself: the page they are on, the browser and window, and a screenshot if they attached one with +. Button: **Log it** → "Logged as FB-xxxxxxxx. The team will see it."
- A bare "Report a problem" gets one question ("What went wrong?"), then the card.
- **My reports** is a list, not a chat: number, their words, page, date, status (Logged / Seen / Fixed / Parked) and the team's reply. **Add to this report** goes back to Lucy with the box filled.
- **Logging must not depend on the AI.** A report started from the row or from "Report a problem: …" is logged by the app directly, so it still works when the day's allowance is used up or the key is missing.
- When the testing phase ends, the tester flag goes and both pieces disappear with it.

## 5. Rules

1. **Confirm first.** No change, send or delete without its card and its button.
2. **Who:** admins only, and each admin's Lucy can do only what that admin may do (every tool already carries its access area). **Never crew.**
3. **One business.** Every tool is scoped to the business of the person talking to her.
4. **A record of everything:** each approved action is written to the existing activity log (what, which record, who approved, when), where "What Claude did" already lives.
5. No notices or banners; the card is the message. AI is Claude only, through the app's own key.

## 6. Engine and cost (for Emergent, when it is sent)

- The chat loop stops at the first write: the tool call is stored, the card is returned, and the loop resumes on Approve with the tool's result. A plan stores its calls in order and stops at the first one that is refused.
- Prompt caching on the system text and the tool list (not used today); a longer loop for work turns (today four steps); a higher daily allowance for work; the model stays Josh's choice. The estimate of 17 Nov still stands: about US$5–35 a month for a typical painter once caching is on, depending on the model.

## 7. Rounds — one at a time, each on Josh's "send"

| Round | What | Prototype |
|---|---|---|
| **L1** | The bigger panel; the card (approve, change, cancel, done, moved on); **Lucy's setup › What Lucy can do**; Lucy gets the tools that exist today (creates and edits); the record; caching and the longer loop; **one chat — testers report to Lucy** | this one |
| **L2** | Sending: quote, invoice, reminder, variation, an email or reply from the connected mailbox; record a payment | the send card is in this one; the email reply needs its own look |
| **L3** | Deleting and archiving; the edit tools still missing (invoice lines, timesheets, Library, products, crew documents) | the delete card is in this one |
| **L4** | Files in the business's folder: find, read, save, move, delete | to draw |
| **L5** | Only if wanted: wider email and Drive permissions (delete mail, the whole Drive), with Google's review | a decision first |

Voice ("talk to Lucy") stays the exploratory item it was.

## 8. Choices made here that Josh can change

1. Every change asks; a task of several steps asks once; sending and deleting always ask on their own.
2. Deleting needs the record's number typed, one record at a time.
3. The list in §2 of what stays outside Lucy.
4. Lucy is a right-hand panel by default (560 px), with a wider setting — the small box is gone.
5. Tester reports are a list with the team's reply, not a second chat; they are logged without the AI.
6. The order of the rounds in §7.
7. Lucy's setup starts with everything on except Delete (§2a), and the areas are the seven listed there.

## 9. What Round L1 builds, and what it leaves for later (26 Nov)

Decided while reading Lucy's code for the message, so the round does only what is real today:

1. **Her setup shows the seven area rows only.** "Send for me", "Delete records", Email and Files each arrive with the round that makes them do something (L2, L3, L2, L4). A switch that does nothing is not shown.
2. **No send card, no delete card, no next-step buttons in L1.** Every natural next step is a send ("Send it to Leanne"), so the buttons come with L2. Asked to send or delete, she says where to do it in the app.
3. **Reminders and ideas stay as they are today** — "Remind me…" and "I've got an idea" save at once with her one-line confirmation, no card. Everything else asks. They sit under "Calendar and reminders": with that row on Read she does not save them.
4. **The card is written by the app, not by the AI** — from the action and its details, with names instead of ids. What the card shows is what runs.
5. **Several steps = one plan** the app checks before showing, runs in order and stops at the first step the app refuses.
6. **Only the admin who asked can approve their card.** A team admin's Lucy is limited to that admin's own access as well as the setup.
7. **Tester statuses are the four that exist** — Logged, Replied, Fixed, Parked (the prototype's "Seen" does not exist in the app). Reports are numbered FB- plus the first eight characters, as the parking lot already does.
8. **The daily allowance stays 300,000.** Caching is switched on and a cached read counts as a tenth, so the same allowance goes much further; it can still be raised in her setup.
9. **Her "what I do" answer** keeps Josh's words plus one sentence: "I can also do the work for you — start and change quotes, add to jobs, raise invoices, book the calendar — and I always show you what I'm about to do and wait for your OK."

## 10. Round L1 — Emergent's report (checked 26 Nov on Josh's "check")

Read from Emergent's chat. **The L1 code is in the preview only — not on GitHub — so it has not been read here.** GitHub `main` is at `cb14222` (Round K, its follow-up, the client's variation page and the archived deposit row are saved).

- **Built** (its commits `3210c30`, `676862c`, `2148433`, `d3de759`, `640c20d`): the right-hand panel; one tool set limited by "What Lucy can do" and each admin's own access; the confirm-first card with approve, change, cancel and plans of several steps; testers report through Lucy with My reports; caching and pause / resume.
- **Its checks:** 8 pure and 17 in-process tests pass; 124 regression tests pass (13 skipped); the type check is clean. Its own browser run at 1440 and 1024 on TS_ data with the real model, then — on Josh's click — the independent testing agent over every L1 screen at both sizes: all passed (`test_reports/iteration_lucy_l1.json`).
- **Not as asked / open:** three commits, not one per part. What's new draft **#47** (two cards, not published) was worded by Emergent from the brief — to read before publishing. One observation from the testing agent, not fixed: Lucy's setup sometimes stayed open after Cancel → Discard (not reproduced by hand; the panel is shared by every gear). The message file was not saved in its pod, and the copy of this spec there is an **older one** (without §9).
- **Not seen in what could be read:** the cache figures of a real turn, and whether a plan card shows its total before or after approval. Both are in `memory/reports/lucy-l1-report.md`, readable once it is on GitHub.
- **Waiting on Josh:** he clicked Emergent's "Lucy L2" suggestion; Emergent stopped and asked four questions (build from the saved spec or wait for a message; what she may send; own card or last step of a plan; a "Send for me" switch). Recommended: **wait for the L2 message** — sending to clients is the riskiest round, the spec copy in the pod is old, and the message is written against the L1 code once it is saved to GitHub. Scope when it is written: quotes, invoices and payment reminders, variations, record a payment; always its own "Send it" card; the switch starts on; emails and replies from the mailbox wait for their own design.

## 11. Round L1 — the code, read after Josh saved it to GitHub (26 Nov, `640c20d`)

Read: `services/lucy_tools.py`, `services/lucy_actions.py`, the chat / approve / cancel routes in `ai_routes.py`, the loop in `services/ai_provider.py`, `components/lucy/LucyCard.tsx`, and Emergent's report. **It is built to the brief.**

- A change never runs in the chat loop; the first one becomes the waiting card and a second in the same reply is refused back to her ("put several changes in one do_steps").
- Approve moves waiting → running in one database step (a second click gets 409), checks it is the admin who asked, works out the permissions again, then runs the same handler the connector uses and writes the record (`via: "lucy"`).
- The card the panel gets carries no ids and no arguments — only the title, the rows built from the record, and the result.
- Crew get 403 on every Lucy route; a team admin's tools are cut by their own access; pay is stripped for an admin without it.
- Caching works in the preview: about 13,000 tokens read from cache against 2 uncached on a turn. A plan's total is shown on the done card, read from the saved quote.

**Three small things, written into the L2 message:** deleting a conversation leaves its cards' rows behind (with the held conversation inside); a finished card keeps that held conversation when it no longer needs it; a card whose run is interrupted would stay on "Working…" for ever. None changes what Lucy does today.

## 12. Round L2 — sent to Emergent 26 Nov on Josh's "send it"

`lucy-l2-emergent-message.md`. Lucy sends quotes, invoices, payment reminders and variations by email, and records a payment. Decisions in it, all Josh's to change:

1. **The send card is the app's Review & Send in small.** The people, the opening words, the signature and the checks come from the same code as the window — moved into one shared place, not copied — so "send it" through Lucy is the same email as Send in the app.
2. **Lucy never sends past a red check.** A quote with an unmeasured area or an unpriced line shows the red list and a button to open it; Send it is off.
3. **Who it can go to:** the client's own addresses, or an address typed in the message that asked. Nothing she read somewhere else.
4. **Email only.** Texts stay in the app's window.
5. **Send for me** is one switch in her setup, starting on; a send also needs its area on Read and change.
6. **A send is always its own card**, never a step of a plan. Recording a payment is an ordinary change.
7. **Next-step buttons** arrive with this round: "Send it to Leanne" after a quote, an invoice or a variation; "Send a reminder for INV-0009" after "What's owed?".
8. Emails and replies from the connected mailbox are **not** in this round — that screen needs its own design first.

## 13. Conversation first — Josh's change after using L1 (26 Nov)

Josh: "Why is Lucy showing like framing while creating an estimate and all? I thought it was going to be communication only, like the Claude connector would do." Offered three ways, he chose: **conversation only for creating and changing; a card only for what can't be undone** — "as close as we can get it to how we do it here." This replaces choice 1 of §8 ("every change asks").

- **As it starts:** Lucy makes the change and says what she did in a line or two, with a plain button to open the record. No card, no step list. A task of several steps is simply done, then told ("EST-0046 is ready as a draft … Nothing is sent.").
- **Still a card, always:** sending anything to a client; recording a payment (it cannot be removed in the app and goes on to the accounting sync); deleting, when that round comes.
- **One switch in her gear, "Ask me before changes"**, off as it starts. On brings back the card before every change, as L1 built it.
- **Unsure → she asks.** Something missing, or two records that match: one short question first, never a guess.
- **Testers:** "Report a problem: …" is logged straight away and she says its number; the small card stays only when Lucy herself guesses a message was a fault.
- What she may change (the seven areas, a team admin's own access) is exactly as before.

The trade, said plainly: without the card a mistake lands and is fixed afterwards, as with the Claude connector today. Until round 3 Lucy can add an expense but not change or remove one, so a wrong one is corrected on the job.

`lucy-conversation-first-message.md` was **sent to Emergent on 26 Nov** on Josh's "send it", queued behind L2.


# Lucy does the work — spec (25 November)

**Josh, 25 Nov:** "We have decided to give Lucy full access to operate instead of just reading mode — Lucy will be able to read, create, edit, delete just like Claude would have access to the app. Lucy will become fully functional to talk to the admin and take on all types of tasks. We already have some ability for Lucy; we just have to create more." Then, the same day:

- "We also need to make the chat more interactive; right now it's too small."
- "We need to remove the testing section of it, because now it's two sections: one is the Lucy chat and the other is a chat for testers. Although we need to keep the ability for testers to be able to log the error if they come across any. So make Lucy in a way that serves the testers while the testing phase is ongoing."
- "My other Claude account … also has connectors connected to my painting emails and storage, which is essential to run it effectively. We already have connectors in the app that users can connect their emails and storage; Lucy should be able to connect to these too and create, edit, delete and read what it's allowed to do."

- (26 Nov) "With Lucy's ability permissions, we need to have that in the Lucy gear: what the user wants Lucy to be able to do. For the emails and storage it has to be what the admin set it to be, and not just Google."

This promotes the parked item "Lucy does the work in the app, confirm first" (17 Nov) to a build. **Round L1 went to Emergent on 26 Nov on Josh's word** (`lucy-l1-emergent-message.md`) and is built and saved to GitHub; **L2 went the same day** (`lucy-l2-emergent-message.md`); L3–L5 follow one at a time, each on his "send". What L1 narrows from this spec is listed in §9.

**Prototype:** `lucy-operator.html` (built by `tools/make_lucy_operator.py` on top of the Round 73 box, `lucy-chat-notion.html`). **Checks:** `tools/test_lucy_operator.js` — 230 of 230 at 1440 × 900 and 1024 × 768 (26 Nov: the round 2 cards, then conversation first; 27 Nov: round 3's removing and fixing, then the plain chat). The prototype opens conversation-first; `?ask=1` shows it with "Ask me before changes" on. Add `?tester=0` to see it as someone who is not in the tester program, and `?mail=microsoft&storage=onedrive` or `?mail=none&storage=builtin` to see Lucy's setup for a business on other providers.

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

## 14. L2 and conversation first — Emergent's report (checked 26 Nov on Josh's "check")

Read from Emergent's chat only. **Neither is on GitHub yet** (`main` is still `640c20d`, round 1), so the code is unread here. Emergent's own L2 summary had scrolled out of what the chat returns; what follows is from its conversation-first report and the test counts in it.

- **Built:** L2 (sending and recording a payment) and then conversation first (its commits `b65d78d` server, `c83b16a` panel, `7828498` tests, a fix, `41538a0` report). "Ask me before changes" is the first row of her setup and off; a change is made and told with a plain Open button; the send card and the payment card stay; testers' reports log at once.
- **Its checks:** pure 11; in-process L1 17, L2 20, conversation first 16; regression 166 pass, 13 skipped; type check clean. Its own screen run passed all ten checks at 1440 and 1024 (TS_ data, sends as a dry run). The testing agent passed all ten at both sizes, two of them on a second try, and ran out of time while finishing (`test_reports/iteration_lucy_cf.json`).
- **A fix it made on the way:** with the day's allowance used up the typing box was locked, so a tester could not type a report; it now stays open for testers.
- **Open, its words:** (1) on an accepted quote Lucy changed the notes and refused only the price — the app itself allows that (Fix Round J, B-042: "the money is locked, the rest still saves"). (2) L2's check 9 (a send asked for inside a longer task, with the switch on) was not repeated by the testing agent.
- **Seen in its test output, not raised by it:** the small chips under her answer show raw names for the connector's tools ("get projects", "add job expense"); and in one run her answer added a remark about the late hour and a draft invoice after "Done" — her existing manner, not new.
- What's new draft #47 now has three cards; still a draft. Two TS_ draft quotes from 21 Oct with no owner sit in the preview database; not from this round.
- Its own suggestions (Accepted Quote Lock, Step 9 Retest, L3, Undo Last Change) wait for Josh's word like any other.

## 15. Finishing Lucy — Josh's decisions (27 Nov)

"Let's go back to Lucy to finish it off." And the principle for everything that is left: **"Lucy should be able to do what you do as a connector — except as a connector you need a browser to operate, but because Lucy is native she has more capability."** His other Claude account works through the connector plus a browser; Lucy is inside the app, so whatever an admin can do to a record on a screen she should be able to do, without one.

| Item | Decision |
|---|---|
| Round 3 — fixing and removing | Go. `lucy-l3-emergent-message.md` — **sent to Emergent 27 Nov** on Josh's word. |
| Email from his own mailbox | Next after round 3; needs its design first. |
| Round 4 — files | Yes, **kept to the app's own folder** — Josh, 27 Nov, later the same day: "maybe just restrict the storage access to its own files instead of the whole drive, seems simpler." So today's permissions are enough on every storage (Google Drive's `drive.file`, OneDrive kept to the Paint Trade HQ folder, the app's own storage): no wider permission, no reconnecting, no Google review. |
| Round 5 — wider permissions | **Dropped.** The whole drive is not wanted, and deleting emails was never asked for. |
| Plain names on the chips | Yes — in round 3. |
| Revise an accepted quote | "We have already established this one" — the rule is his description (back for correction, marked Revised, sent again, accepted again). Not parked: to design next, prototype first; it is an app-wide change that Lucy then follows. |
| Talking to Lucy by voice | No, for now. |

**Round 3 in one line:** every change a screen allows that she could not make yet (crew and hire on a job, duplicate and refresh a quote, edit and archive an invoice, archive a client, fix a timesheet, the Library and products) is done and told; every delete is a red card, one record at a time, behind a "Delete records" switch that starts off; archiving is not deleting. The keys to the account stay outside for good.

## 16. The chat's look: a plain conversation (27 Nov) — prototype only, nothing sent

Josh, with a screenshot of the empty chat: "Let's improve the look and feel of the chat. Remove the Lucy face from inside the chat, and also remove the ability titles so it's just a conversational chat. However having a short sentence in there is good — you come up with one." Then: "Hold on, Emergent is still working. For now do the prototype for the chat box and I'll get back to you."

In `lucy-operator.html` now:

- **An empty chat is one line in the middle:** "Hi Josh." and under it "Ask me anything, or tell me what needs doing." No face above it, no rows (the four questions, Start a quote, Add to a job, Remind me, I've got an idea, Report a problem are gone), no "What can Lucy do?" link.
- **No face beside her messages** and none on the three dots while she works. The face in her header and on the round button that opens her stay — they are how you find her.
- **The typing box says "Message Lucy…"** so it does not repeat the line above.
- **Nothing is lost, it moves to the ⋯ menu:** "What Lucy can do" was already there; **"Report a problem"** is added for testers (it fills the box, as the row did) beside "My reports".
- Her answers are a little wider now that no face sits beside them.

Other lines considered for the empty chat: "What do you need?" · "What are we working on?" — Josh's to pick.

Found while testing: in the prototype the ⋯ menu swallowed clicks on "My reports" (it only ever opened from a report's own button). Fixed in the prototype; **to check in the app** when this goes to Emergent.

**Later the same day:** Josh typed "hey" in the prototype and got the "On site today" answer, and asked whether the conversation is restricted. It is not — the prototype has no AI behind it, only scripted lines, and anything it did not recognise fell back to that one answer. Now a greeting gets a greeting ("Hey Josh. What do you need?") and anything it has no script for says so plainly and offers what can be tried. In the app Lucy is Claude with the business's tools and answers whatever is typed.


## 17. Round 3 — Emergent's report (checked 27 Nov on Josh's "check")

Built and tested in the preview. **Not on GitHub** — `main` is still round 1 (`640c20d`, 26 Nov), so rounds 2 and 3, conversation first and the Messages setup width are unread here.

- **Changes she can now make**, in conversation (or on the L1 card with "Ask me before changes" on): a job's crew, hire and paint; a timesheet session added or fixed, a reason required; Library items, tasks and products; duplicate, refresh or archive a quote; edit or archive an invoice; archive or restore a client. 20 new tools in the connector registry (74 tools, 53 of them changes), so the Claude connector has them too.
- **Deleting** is off until Delete records is turned on in her setup. Then one record per red card: a quote or invoice needs its number typed; a job, client, lead, supplier or Library record needs DELETE typed. The app's own refusals come back in its words.
- **Chips** read Jobs, Quotes, Clients, Invoices, Calendar, Crew, Library. What's new draft #47 has five cards and is still a draft (Lucy does the work · Report a problem to Lucy · Lucy can send for you · Messages setup is full width · Lucy can fix and tidy up).

**Tested:** the twelve on-screen checks at 1440 and 1024, in Emergent's run and the testing agent's (the longest delete card at 1024 only); 28 faked-model tests; 208 Lucy and connector regression tests.

**Not seen on screen yet:** the delete cards for an invoice, a lead, a supplier, a calendar event, a reminder, a Library record, and archiving a product.

**Beyond the message:** reading one job or one quote now returns its own lines with their ids (expenses, hire, variations, paint; follow-ups on a quote). Without it she could not name the one expense to delete. It is a read, and needed for the round to work.

**Flagged by Emergent, not from this round:** 15 backend tests fail, the same 15 on the commit before round 3; not investigated. The whole suite cannot run in one go in its pod.

Its own suggestions (mailbox round, files round, a review of the failing tests, an "Undo that" button) wait for Josh's word.

**The chat's look — where it stands (27 Nov):** Josh uploaded the latest `lucy-operator.html` to Emergent himself at 02:27 UTC with the word "here". Emergent downloaded it, listed the differences, changed nothing and asked for a written brief. The brief is `lucy-chat-look-emergent-message.md` — written, **not sent**; it goes on Josh's "send". It tells Emergent the scripted small talk is prototype only and is not to be built. Read in the saved code while writing it: the app's "My reports" menu row is an ordinary button, so the click the prototype swallowed is not a fault in the app; it stays in the checks.

## 18. The chat's look sent; rounds 2 and 3 read in the saved code (27 Nov)

**Sent.** Josh: "send the brief." `lucy-chat-look-emergent-message.md` went to Emergent as written; it was accepted and queued.

**Saved.** Josh pressed Save to GitHub: `main` is now `51354c7` — 42 commits since round 1, covering round 2, conversation first, the Messages setup width, and round 3.

**Read in that code, against what was asked:**

- **A send** is checked twice — when the card is built and again when Send it is pressed: only the client's own addresses or one the user typed. The email goes exactly as the card showed it.
- **A delete** is never in the connector's list. The typed number or DELETE is checked by the server, not only by the button (a wrong word is refused). A second press is refused. Her setup and the admin's own access are checked again at the moment of approving.
- **With "Ask me before changes" off** a change runs inside the conversation through the same path an approved card uses; sends, a recorded payment and every delete still wait on their card.
- **Delete records** is off unless it was turned on (`ai.can.delete`).
- **Messages setup width** is the one line asked for.
- **Beyond round 3's message:** `get_projects` and `get_estimates` take an `id` and then return that record's own lines. Reads only, scoped to the business.

**One small thing to tidy in a later round — not urgent:** the delete card for a timesheet session, and for a quote follow-up, looks the record up by its id alone when it builds the card, without first checking it belongs to this business. The delete itself goes through the screen's own route, which does check, so nothing of another business can be removed; and Lucy only ever receives ids from her own business's records. It is the card's read that should carry the same check as every other card.

## 19. The chat's look built; Revise an accepted quote sent (27 Nov)

**The chat's look — Emergent's report (read 27 Nov before the next round went):** built as the brief. An empty chat shows "Hi {name}." and the one line, centred; no face, rows or "What can Lucy do?" link inside the chat; no face beside her messages or the three dots; "Message Lucy…"; ⋯ › Report a problem for testers. No fixed replies were added. Its own runs passed every check at 1440 and 1024 on a TS_ admin with the real model — "hey" got "Hey — what can I do for you?" with no chips. The testing agent passed everything at 1440; at 1024 its check 5 stopped inside Emergent's test script after the report had been logged (it saw "Logged as FB-…" on screen) — Emergent's own 1024 run of that check passed and it did not find why the agent's run stopped. The two lines sit 28 px above dead centre, as in the prototype. What's new draft #47 has the line (six cards, still a draft). Preview only — not saved to GitHub yet.

**Revise an accepted quote — sent on Josh's "send the next one".** `quote-revise-emergent-message.md`; prototype `quote-revise.html`, 129 of 129 (`tools/test_quote_revise.js`). It is an app-wide change that Lucy follows:

- **The app:** ⋯ › Revise this quote on an accepted quote → a panel on the right says what happens → the quote goes back to Draft marked Revised, the acceptance is withdrawn (and kept on the record), the job stays, the unsent deposit draft is archived. Sent again, the client's page says it replaces the one they accepted and asks them to accept again; on the second acceptance the job takes the new figures and a new deposit draft is raised. Refused once an invoice has been sent or paid.
- **Lucy:** asked to fix an accepted quote she no longer just refuses — she shows a **Revise** card (always a card: a signature is being withdrawn), then makes the change in the conversation, then offers "Send it to {name}", whose send card carries the revised words and an amber "accepted the earlier quote — asked again" line. `revise_quote` is hers only, never in the connector's list, never a plan step.
- **Found on the way:** the builder's Resend on an accepted quote turns it back to Sent today (`/send` sets the status whatever it was), leaving the old signature, schedule, job and deposit draft in place. Closed in the same round.
- **Riding along:** the two delete-card lookups from §18 now check the business.

**Order from here:** email from the connected mailbox (needs its design) → files kept to the app's own folder. Read for the mailbox design already: the connected mailbox (Gmail, Microsoft or IMAP) is only **read** today — the last 30 days of the inbox, 50 newest, client emails in full and unknown senders as sender and subject only — while every email the app sends (quotes, invoices, the CRM composer) goes through the sending domain, not through the mailbox, although the Gmail and Microsoft connections already hold permission to send.

## 20. Revise built; Lucy L4 — email and files — sent (27 Nov)

**Revise an accepted quote — Emergent's report (checked 27 Nov on Josh's "check"):** complete, parts 1 to 8. The 36 revision tests pass; all 13 on-screen checks pass in its runs and the testing agent's, no issues raised — checks 1 to 11 at 1440 and 1024 with the client's page at 390, Lucy's cards (12 and 13) at 1024 only. Three older tests were changed to expect the new sentences and the accepted-resend behaviour, which this round changes on purpose. **Beyond the message:** reading one quote now returns its lines (without them Lucy asked which line instead of changing it), and she offers "Send it to …" after a change made past the Revise card. The same 15 older backend tests still fail, as before the round. It also removed 11 orphaned TS_ rows left by an interrupted test seed, under a test owner that no longer exists. What's new draft #47 has seven cards, still a draft. **Preview only** — GitHub is still at round 3 (`51354c7`).

**Lucy L4 — email and files — sent on Josh's "check and do these two too"** (he quoted Emergent's two suggestions). One round, because one round at a time is the rule and the two meet on the same card. `lucy-l4-email-files-emergent-message.md`; prototype `lucy-email-files.html`, 76 of 76 (`tools/test_lucy_email_files.js`).

- **Email:** she reads the app's Inbox (`get_inbox`, `get_conversation` — her own tools, not the connector's): client emails and texts in full, an unknown sender as sender and subject only. "Any new emails?" checks the connected mailbox first. A reply or a new email to a client is `send_email`, always a card: the email being answered, To, the subject, the whole message, the signature, the attachments, then Send it · Change something · Cancel. It goes through the CRM composer's own route.
- **Files:** she lists a job's, a quote's or a client's files by name, and a job's photos by phase; ticks a file to go with the quote email (a change — done and told); puts files and photos on an email (on the card, with sizes against the 20 MB an email can carry). Only a client's own files can go to that client.
- **Her setup:** two new switches, on — Read my inbox · Job files. Send for me now covers emails to clients.
- **Left out on purpose:** sending through the mailbox itself (threads under the client's email, shows in Sent) — needs live mailboxes to test; texts; Cc; acting on unknown senders (link, lead, ignore); opening a file or looking at a saved photo; saving a photo from the chat onto a job.

**Lucy's rounds are then done as planned.** Still open: voice (parked); the 15 older failing tests (only on Josh's word).

## 21. L4 and the new answer built; Lucy L5 sent (27 Nov)

**L4 (email and files) and the "what I can do" answer — Emergent's report (checked 27 Nov on Josh's "check"):** both complete. L4: parts 1 to 6 built; 33 new in-process checks pass; all 12 on-screen checks pass at 1440 and 1024 in its runs and the testing agent's. Differences it reports from the message: the connector now has 24 reads and 54 writes; with no mailbox the button after "Any new emails?" is Open Messages setup; **Approve sends what the server built for the card, not what the browser posts** (safer than the message asked). The answer: one copy on the server, drawn with bold and bullets in both places; at 480 px the Jobs bullet wraps to a second line (the message asked for one line at 560 only). It removed three leftover fake test mailbox rows; no real mailbox or storage was contacted. What's new draft #47 has eight cards, still a draft. The 15 older failing tests are untouched. **GitHub** is at `3a13b48` — the chat's look and Revise are saved; L4 and the answer are in the preview only.

**Josh, 27 Nov, a standing rule:** "If running tests later please don't do it on my account. If you need to run a test make another account." Recorded in `admin-chat-handover.md` §2 and carried at the top of every message from now.

**Lucy L5 — sent on Josh's "check and do these"** (three of Emergent's suggestions, one round, no prototype — nothing in it is a new layout). `lucy-l5-texts-followthrough-digest-message.md`.

- **Texts:** `send_text`, always a card — the text being answered, the mobile, the text, a character count. Through the composer's own route. Refused before any card when no number is connected, the plan has no texting, there is no mobile, or the client opted out.
- **Follow-through:** a reply that agrees to a new date for a job's start or a calendar event carries it (`then`); the finished card then shows one button, worded by the server from the record. One press says it to Lucy and her usual rules apply.
- **Today briefing:** in place of "3 unread replies in the inbox", up to three rows naming who is waiting (longest first, a day-old one in the warning colour, each with Reply), then "n more", and a separate count for mail from people who aren't clients. Second in the list, after overdue invoices.
- The answer's bullet becomes "Emails and texts — read your inbox and write the reply".

## 22. Lucy L5 — Emergent's report (checked 27 Nov on Josh's "check")

Complete: texts, the follow-through button, the inbox in the Today briefing. Every test ran on seed-made test accounts on the dry-run server and was removed after; Josh's account, mailbox, number and storage were not touched and no email or text left. **Saved to GitHub** (`a71a8f3`) — every Lucy round, Revise and the chat's look are now there.

- **Tested:** 28 new in-process checks; 209 with the earlier Lucy and connector files. The testing agent passed all eight on-screen checks at 1440, then hit its time limit before reading its 1024 result — Emergent read that log itself: all eight pass. One older Lucy check (`fix_timesheet_session`) failed once and passed on five reruns.
- **A fault fixed on the way:** when Lucy moved a calendar event by its date alone, the event did not move though she said it had (`update_event` wants `start_date`). Fixed for every event she or the connector moves.
- **The dashboard's read budget:** the briefing adds one read (client names) only when a client conversation is waiting. The budget test was already failing before the round — 17 reads against 12 — and still is. Not fixed.
- **"A day or more old"** is by calendar day in the business's time zone.
- **Correction to what Josh was told when the round was sent:** opening a conversation in the Inbox does **not** mark it read. A row leaves the briefing when the conversation is answered or Mark read is pressed.
- The 15 older failing tests are untouched. What's new draft #47 has nine cards, still a draft.

**Read in the saved code** (`services/lucy_mail.py`, `services/attachments.email_files`): the client and the conversation are looked up inside the business; a conversation with another client's message in it is refused; a text goes only to the client's own numbers or one typed; every file is checked to be that client's own, inside the business, before its bytes are read; the follow-through is kept only when the job or event is that client's, and its button's words are built by the server.

Its suggestions (dashboard speed, the older tests, read-on-open, reply drafts in the briefing) wait for Josh's word.

## 23. Inbox — read on open and reply drafts — sent (27 Nov)

Josh: "check and do these: Read On Open, Reply Drafts" (two more of Emergent's suggestions). Emergent was free — nothing new since its L5 report. One round, no prototype. `inbox-read-on-open-reply-drafts-message.md`.

**Read in the code first, and it changed the design:** the Inbox already drafts a reply. Opening a client's conversation with an unread message makes a "Suggested reply · from this thread and the client's records" with Use this reply — drafted by the AI on every open, kept nowhere, shown only while the message is unread. And the only Mark read button sits inside that box. So read-on-open by itself would have switched the suggested reply off.

- **Read on open:** opening a conversation in the Inbox marks it read (any conversation). Lucy reading one still marks nothing. The Mark read button goes.
- **The suggested reply** follows "the client spoke last" instead of "unread", is drafted once per message and kept (fewer AI calls than today), and not for a message older than 14 days.
- **Reply drafts** is that same suggested reply, not a second drafting system: Reply on a briefing row opens the conversation with the draft already in the reply box.
- **Not built, by choice:** a draft written for every waiting client each morning — it would spend AI on drafts nobody opens.

## 24. The inbox round built; the long-task fix sent (27 Nov)

**Inbox — read on open and reply drafts — Emergent's report (read 27 Nov when the next message went):** complete, all three parts; 10 new in-process checks (71 with the L4 and L5 files); all 11 on-screen checks at 1440 and 1024 in its runs and the testing agent's, no issues raised; test accounts only, nothing sent. To know: when a draft carries a gap such as `[time]` the composer's own rule keeps Send off until it is filled; Use this reply now also puts the cursor in the reply box; **one line changed outside the message** — CRM › Messages setup said "A ready draft appears on unread client threads", no longer true, now "A ready draft appears when a client is waiting on a reply". What's new draft #47 has ten cards, still a draft. Preview only until Save to GitHub. Its new suggestions (dashboard speed, the older tests, a gap helper, a waiting badge) wait for Josh's word.

**Josh's bug, 27 Nov:** "create test estimate of 10 items and accepted and create two invoices" → "Lucy could not answer just now", every try; allowance line 281,313 / 300,000. **Read in the code:** every request has 30 seconds (`frontend/utils/api.ts`); since conversation-first a task of several changes is one long request; with no response the panel falls to that line; the server is not told, so the work may be finished or cut part-way and a retry can make a second set. Not confirmed from a log — the message asks Emergent to measure first. Fix sent on Josh's "send it": `lucy-long-task-timeout-message.md` — 180 s for Lucy's two calls; the turn runs to its end whatever happens to the request; one turn at a time in a conversation; the panel waits ("Still working — this is a long one.") and shows the reply when it lands.

## 25. The long-task fix built; Josh's own Live Progress question at Emergent (checked 28 Nov on Josh's "check and tell me what's next")

**The long-task fix — Emergent's report:** built as the message, in the preview only (GitHub is still at L5, `a71a8f3`; the inbox round is not saved either). Test accounts only.

- **Measured, and it confirms the cause:** Josh's own words took 31 to 44 seconds on a test business. A client that waits 30 seconds gave up at 30.0 s; the reply was saved at 39.0 s. By the time the panel gave up the quote, its job and the invoices already existed, and asking again made a second set. A second limit was found: something in front of the app cuts any request at about 60 seconds (a 120-second request came back as a gateway error after 60).
- **Built:** 180 seconds for Lucy's two calls; the turn runs to its end and saves its reply whatever happens to the request; one turn at a time in a conversation ("I'm still working on your last message."); the panel shows "Still working — this is a long one." and brings up the reply when it lands, for up to 4 minutes by the clock.
- **To know:** asking for two invoices on an accepted quote gives three — the two asked for and the deposit draft the acceptance raises by itself. Seven new checks pass; the on-screen checks pass at 1440 and 1024 in its runs and the testing agent's. **Two Revise tests fail when run together with other files and pass alone** — Emergent says it is looking into it; not resolved in the report.

**Josh wrote to Emergent himself (27 Nov 21:22 UTC):** "Live Progress: Display Lucy's ongoing task progress instead of static dots (show me a preview on this one or explain this further before implementing it)." Emergent was running on it at the time of this check; no reply yet.

Its other suggestions (deposit clarity, dashboard speed, the older tests) wait for Josh's word.

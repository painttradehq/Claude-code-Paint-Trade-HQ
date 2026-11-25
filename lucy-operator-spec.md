# Lucy does the work — spec (25 November)

**Josh, 25 Nov:** "We have decided to give Lucy full access to operate instead of just reading mode — Lucy will be able to read, create, edit, delete just like Claude would have access to the app. Lucy will become fully functional to talk to the admin and take on all types of tasks. We already have some ability for Lucy; we just have to create more." Then, the same day:

- "We also need to make the chat more interactive; right now it's too small."
- "We need to remove the testing section of it, because now it's two sections: one is the Lucy chat and the other is a chat for testers. Although we need to keep the ability for testers to be able to log the error if they come across any. So make Lucy in a way that serves the testers while the testing phase is ongoing."
- "My other Claude account … also has connectors connected to my painting emails and storage, which is essential to run it effectively. We already have connectors in the app that users can connect their emails and storage; Lucy should be able to connect to these too and create, edit, delete and read what it's allowed to do."

This promotes the parked item "Lucy does the work in the app, confirm first" (17 Nov) to a build. **Nothing is built and nothing has gone to Emergent.** Round K is with Emergent now; this starts after it is reported, one round at a time, on Josh's "send".

**Prototype:** `lucy-operator.html` (built by `tools/make_lucy_operator.py` on top of the Round 73 box, `lucy-chat-notion.html`). **Checks:** `tools/test_lucy_operator.js` — 102 of 102 at 1440 × 900 and 1024 × 768. Add `?tester=0` to see it as someone who is not in the tester program.

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

## 3. Email and storage — Lucy uses what the business has connected

No new connector: Lucy runs inside the app, and the app already holds each business's mailbox (Settings › Communication: Gmail, Microsoft, or IMAP/SMTP), storage (built-in, Google Drive, OneDrive) and calendars. She gets **actions** on top of them, each behind its card.

| | What the connection allows today | What Lucy does with it | Not possible without asking the user for more permission |
|---|---|---|---|
| Gmail | read mail, send mail | read and search the synced Inbox, draft, send, reply | delete, archive or label an email (needs Google's "modify" permission, a restricted one Google must approve) |
| Microsoft | Mail.Read, Mail.Send | the same | delete or move an email (needs Mail.ReadWrite) |
| IMAP / SMTP | read, send | the same | — |
| Google Drive | only the files the app created (`drive.file`) | create, read, move, rename, delete inside the **Paint Trade HQ** folder | see or search the rest of the Drive (a restricted permission Google must approve) |
| OneDrive | Files.ReadWrite | the same, in the Paint Trade HQ folder | — (the permission is already broad; she is kept to the app's folder by rule) |

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
| **L1** | The bigger panel; the card (approve, change, cancel, done, moved on); Lucy gets the tools that exist today (creates and edits); the record; caching and the longer loop; **one chat — testers report to Lucy** | this one |
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

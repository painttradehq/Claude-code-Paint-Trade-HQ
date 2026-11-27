# Lucy L5 — texts, the follow-through button, and the inbox in the Today briefing — SENT to Emergent 27 Nov on Josh's word ("check and do these")

Josh, 27 Nov, quoting three of Emergent's suggestions: "Inbox Digest: add unread client emails and texts to the Today briefing so nothing waits unanswered" · "Email Follow-Through: let Lucy offer the matching job or calendar change straight after a reply agrees to a new date" · "Text Replies: let Lucy send a text back to a client from its own card, shown before it goes." And: **"If running tests later please don't do it on my account. If you need to run a test make another account."**

**No prototype** (Josh, 27 Nov: "why do you have to make a prototype, it's not a design?"): nothing here is a new layout. The briefing gets rows of the kind it already has; the text card is the email card with fewer rows; the follow-through is the button a finished card already carries.

Written against the code saved to GitHub (`3a13b48` — the chat's look and Revise are in it; round L4 is in the preview only, so its code is unread here and this leans on the L4 message and Emergent's report).

**What the code says today:**
- The Today briefing's "Needs you" already has one row for the inbox — "**3 unread replies** in the inbox" — a count, last in the list, and it counts unknown senders too.
- A text goes through the same composer route as an email (`crm.send_message`, `channel: "sms"`). With no number connected the route keeps it on the timeline as "queued" instead of refusing; a client who opted out is refused; texting is a plan feature.
- Each client has one text conversation (`sms-{client}`).

**Choices made here, for Josh to change:**
1. The briefing shows up to three conversations waiting, the longest wait first, each with a Reply button; then one "more waiting" row. They sit second, after overdue invoices.
2. "Waiting" means unread, as the Inbox counts it.
3. Mail from people who aren't clients keeps one count row at the bottom.
4. The follow-through button is for dates only: a job's start, or a calendar event. One press says it to Lucy; the change then follows her usual rules.
5. She texts only when a number is connected and the plan has texting — never "queued".
6. The "what I can do" answer's line becomes "Emails and texts — read your inbox and write the reply".

---

## The message as sent

# Lucy L5 — texts, the follow-through button, and the inbox in the Today briefing

Josh has taken three of your suggestions, as one round: **Text Replies**, **Email Follow-Through**, **Inbox Digest**.

There is no prototype for this round — nothing in it is a new layout. Save this message as `memory/specs/lucy/lucy-l5-message.md`. One commit per part.

**Read this first — Josh, today: "If running tests later please don't do it on my account. If you need to run a test make another account."** His own account is never used for a test: not signed in to, not read, not written — and never his mailbox, his text number or his storage. Every test runs on the test accounts the seed makes for the run (TS_) and removes after. Whatever a check needs that they lack — a connected mailbox, a text number, files — is made on a test account, never borrowed from his. No real email or text leaves in a test: dry run only.

## Part 1 — She texts a client back, from its own card

`send_text({client_id, message, to?})` — Lucy's own, beside `send_email` (never in `REGISTRY`); in `SENDS` and `ALWAYS_CARD`; needs Send for me on, Clients on Read and change, the admin's `clients` access; never a step of `do_steps`.

- It runs the composer's own route: `crm.send_message(client_id, MessageIn(channel="sms", to, body, reply_to_message_id))`. `reply_to_message_id` is the client's latest inbound text when there is one, so the conversation is marked read as the composer does.
- `to`: the client's mobile; one of the client's own numbers (the client's or a contact's — compared on digits, as `_match_customer` does), or one the user typed.
- **Before the card**, back to her as the tool's error (no card):
  - no number connected (`sms_settings` not enabled or incomplete) → "Texting isn't set up yet — connect a number in CRM › Messages setup." Never the route's "queued".
  - the plan has no `sms` (the test `services/plans` already gives) → "Texting isn't in this plan."
  - the route's own two: "No mobile on file" and "{name} has opted out of SMS".
- **The card** (`kind: "send"`, record type `text` in `LucySendCard.tsx`) — the email card with fewer rows:
  - "LUCY IS ABOUT TO · **Text {client}**".
  - When the client's latest text is newer than the last one sent to them (`lucy-act-inreply`): "In reply to {who}'s text, {when}" and that text.
  - To (the mobile) · the text in full — no subject, no signature, no files.
  - One line under it (`lucy-act-count`): "{n} characters · 1 text" — "2 texts" from 161, "3 texts" from 307.
  - Checks: red for the route's gap rule (`GAP_RX`); otherwise green "Going to {first name}'s own mobile" or "Going to a number you typed". Red → **Send it** is off.
  - **Send it** · Change something · Cancel.
- **Approve** sends what the server built for the card, as L4 does, the number checked again. **Done:** "LUCY DID · ✓ Texted {number}." — "The conversation is marked read." when it answered one — with **Open the conversation**.
- **Her setup:** Send for me's second line becomes "Quotes, invoices, reminders, variations, emails and texts to clients. You see each one before it goes."
- **Her words** (`ADMIN_SYSTEM_PROMPT`): in place of "You can't send texts yet…": "A text to a client is send_text: short and plain, under 300 characters, no signature. It shows as a card and goes only when they press Send it. Answer a text with a text and an email with an email unless the user says otherwise."
- **The "what I can do" answer** (the one copy): the Emails bullet becomes "- **Emails and texts** — read your inbox and write the reply". Nothing else in it changes.

## Part 2 — After a reply agrees to a new date, one button makes the change

Today she asks in words ("do you want me to move it?"). Now the finished card carries the button.

- `send_email` and `send_text` take an optional `then`, one of:
  - `{kind: "job_start", job_id, date}` — the job must be that client's;
  - `{kind: "event", event_id, date, time?}` — the event must be the business's, and linked to that client or to one of their jobs.
  Anything else, or a record that fails those checks, is dropped without a word — the send is not held up by it.
- `then` is kept on the card. When the card is done, `next_step` gives its button, **the label and the words built by the server from the record, never taken from her**:
  - "**Move the start to {Mon 14 Dec}**" → says "Move the start of the job {job name} to {14 Dec 2026}";
  - "**Move “{event title}” to {Mon 14 Dec}**" (with ", {9:00 am}" when a time came) → says "Move the calendar event {title} to {14 Dec 2026}" (and the time).
  Only when she has the tool for it (`update_job`, `update_event`), and not when the record already has that date.
- It shows under the finished card as "Send it to {name}" does (`lucy-next`). One press sends those words as the user's message; what follows is her usual road — done and told in the conversation, or its card with "Ask me before changes" on.
- **Her words**, in place of "ask afterwards whether to make that change": "When your reply agrees to a new date for a job or a calendar event you have read, pass it in `then` — the user gets one button to make that change once the message has gone. Never make the change yourself unasked. For anything else a reply agrees to, ask in words afterwards."

## Part 3 — The Today briefing names who is waiting

`services/dashboard_home.brief_v2` has one inbox row today: "**{n} unread replies** in the inbox", last, counting unknown senders too. In its place:

- **One row per conversation waiting** — a client's unread inbound email or text; several unread in one conversation make one row, its latest. The longest wait first, three rows at most:
  - "**{client}** emailed {when} — “{subject}”"
  - "**{client}** texted {when} — “{the first 60 characters}”"
  - `{when}`: "at 8:12 am" today, "yesterday", "{n} days ago". A day or more old → `overdue: true` (the row's warning colour, as a late reminder has).
  - Its button: **Reply** → `/admin/crm?view=inbox&thread={thread}`. `id: "msg-{thread}"`, `kind: "message"`, so the tick holds for the day like every other row.
  - Priority 2, ahead of the reminders: after overdue invoices, before everything else.
- More than three: one row after them — "**{n} more** waiting in the inbox" · **Inbox** (`/admin/crm?tab=inbox`, as today's row).
- Mail from people who aren't clients: one row at the old place (priority 6) — "**{n} {email | emails}** from people who aren't clients yet" · **Inbox**. None → no row.
- The panel (`MorningBrief.tsx`) needs no change: these are rows of the shape it already draws. The opener's count follows as it does today.
- Keep it inside the dashboard's read budget (`TRIP_BUDGET`, and its test): the wave-1 read that gives the count today gives the unread rows instead; client names come with one `$in`.
- `_brief_facts` keeps `unread_replies` as the number of client conversations waiting.

## Checks

Pure / in-process (model faked): `send_text` pauses in both modes and is never a plan step; with no number connected, no `sms` in the plan, no mobile, an opted-out client — each refused before any card with its sentence, and nothing is logged as "queued"; a number that is not the client's and was not typed is refused at the card and at approve; approve sends once; the count line at 160, 161 and 307 characters; `then` for another client's job is dropped and the send still goes; the done card's `next` has the server's label and words; no button when the job already starts that day or she has no `update_job`; the briefing: three clients waiting in the right order, a fourth and fifth as "2 more", two messages in one conversation as one row, an unknown sender only in the count row, a ticked row stays ticked, the trip budget test.

On screen with the testing agent, **test accounts only**, sends as a dry run, **1440 then 1024**:
1. "Text {TS_ client} back: …" → the card with the text being answered, the mobile, the text, "{n} characters · 1 text"; nothing goes before **Send it**; then "Texted …", the conversation marked read, the text on the client's timeline.
2. A TS_ business with no number connected → she says texting isn't set up, **Open Messages setup**, no card, nothing on the timeline.
3. A TS_ client who opted out → the app's sentence, no card.
4. A reply by email agreeing to a new start date → after **Send it** the finished card carries "Move the start to {date}"; one press → the job's start changes and she says so. With "Ask me before changes" on → the press brings its card.
5. The same for a calendar event, with a time.
6. The Today briefing on a TS_ business with four client conversations waiting and one unknown sender: three rows, the longest wait first, the old one in the warning colour; "1 more waiting in the inbox"; the unknown one in its own count row at the bottom. **Reply** opens that conversation. A tick holds after a reload. Read one in the Inbox → its row is gone.
7. "What can you do?" → the bullet reads "Emails and texts — read your inbox and write the reply"; the rest word for word as before.
8. Her setup: Send for me's new line. Nothing runs off sideways in the 480 px panel or on the dashboard.

## Rules

As the rounds before: this message only — nothing from the rest of your suggestion list; no backfill; no notices or banners; AI is Claude only, through the app's own key; nothing under `app/employee/*`; no key, password, admin id, mailbox token, phone number or message body of a real client in any reply. **Tests: test accounts only, made for the run and removed after — never Josh's account, mailbox, number or storage; dry run only.** Report to `memory/reports/lucy-l5-report.md`. Add one card to What's new draft #47 (never publish): "Lucy can text a client back — you see every text before it goes. After a reply that agrees to a new date she offers the change in one press. And your Today briefing now names who is waiting on an answer." Save to GitHub and Publish are Josh's clicks.

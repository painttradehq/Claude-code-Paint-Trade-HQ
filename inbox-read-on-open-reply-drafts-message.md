# Inbox — read on open, and the reply waiting when you tap Reply — SENT to Emergent 27 Nov on Josh's word ("check and do these: Read On Open, Reply Drafts")

Josh, 27 Nov, quoting two of Emergent's suggestions: "Read On Open: mark a conversation read when you open it in the Inbox, so the briefing clears itself" · "Reply Drafts: let Lucy prepare a reply for each waiting client in the briefing, ready to review in one tap."

**No prototype** — nothing new is drawn: one button leaves the Inbox, and a box that already exists shows a little longer. Written against the code saved to GitHub (`a71a8f3`).

**What the code says today (`routes/comms.inbox_thread`, `components/crm/v2/InboxView.tsx`):**
- Opening a conversation does not mark it read. The only Mark read button sits inside the suggested-reply box, so with suggestions off there is no way to mark one read except by answering it.
- The Inbox **already drafts a reply**: opening a client's conversation with an unread message in it makes a "Suggested reply · from this thread and the client's records", with **Use this reply** to put it in the reply box. It is drafted again by the AI on **every** open, kept nowhere, and shown only while the message is unread.
- So read-on-open, done alone, would switch the suggested reply off: the message would be read the moment it opened, and the box would never show.

**The design, and the choices in it for Josh to change:**
1. Opening a conversation in the Inbox marks it read — any conversation, a client's or an unknown sender's. Lucy reading one still marks nothing.
2. The suggested reply follows "the client spoke last", not "unread" — it stays until the conversation is answered.
3. It is drafted once per message and kept, instead of on every open. That is fewer AI calls than today, not more.
4. Reply Drafts uses that same suggested reply — not a second drafting system beside it. **Reply** on a briefing row opens the conversation with the draft already in the reply box: tap, read it, Send.
5. Not built: writing a draft for every waiting client each morning before anyone asks. It would spend AI on drafts nobody opens; the draft is made the first time the conversation is opened (a few seconds), then kept.
6. No draft for a message older than 14 days.
7. Once a message has been opened, its row leaves the briefing even if it has not been answered — that is what read-on-open means.

---

## The message as sent

# Inbox — read on open, and the reply waiting when you tap Reply

Josh has taken two more of your suggestions, as one round: **Read On Open** and **Reply Drafts**.

There is no prototype — nothing new is drawn. Save this message as `memory/specs/crm/inbox-read-on-open-message.md`. One commit per part.

**Tests: test accounts only — Josh, today: "If running tests later please don't do it on my account. If you need to run a test make another account."** Never his account, mailbox, text number or storage; whatever a check needs is made on a test account the seed creates and removes; dry run only.

The two belong together. Today the suggested reply is made, and shown, only while the message is unread — so read-on-open by itself would switch it off. Part 2 moves it from "unread" to "the client spoke last".

## Part 1 — Opening a conversation marks it read

- `InboxView.tsx`: when a conversation has loaded in the Inbox, post the route that is already there — `POST /inbox/threads/{key}/read` — then refresh the list and the unread count. Any conversation: a client's, or an unknown sender's.
- Nothing else reads for the user: Lucy's `get_inbox` and `get_conversation` still mark nothing, and neither does the briefing.
- The **Mark read** button (`inbox-mark-read`) goes — it has nothing left to do.
- The Today briefing needs no change: its rows are the unread ones, so an opened conversation's row is gone at the next load, and the "people who aren't clients yet" count drops the same way.

## Part 2 — The suggested reply: for whoever is waiting, drafted once

In `comms.inbox_thread`:
- **When:** the conversation has a client, its latest message is inbound (the client spoke last), that message is no more than 14 days old, and `comms.ai.suggest_replies` is on. Not "there is an unread message".
- **Once:** the draft is kept on that inbound message's row (`suggested: {subject, body, gaps, tone, at}`). A later open returns the kept one — no AI call. A new message from the client gets its own draft at its first open. Once an answer has gone, no suggestion is returned.
- `suggested` never leaves on a message in any list or read: not in `_out`, not in `inbox_threads`, not in Lucy's `get_conversation`. It is returned only as the conversation's `suggested`, as today.
- A draft that fails, or an allowance that is used up, is as today: the conversation opens without one. Nothing is kept, so the next open tries again.

In `InboxView.tsx`:
- The box (`inbox-suggested-reply`) shows whenever the conversation carries `suggested` — the "and the message is unread" test goes. Its words and **Use this reply** stay as they are.

## Part 3 — Reply on a briefing row lands on the draft

- `dashboard_home.brief_v2`: a waiting row's button stays **Reply**; its link gains `&reply=1` → `/admin/crm?view=inbox&thread={thread}&reply=1`.
- `CrmHome.tsx` / `InboxView.tsx`: opened with `reply=1`, the conversation does what **Use this reply** does as soon as its suggestion is there — the draft goes into the reply box (the subject too, for an email), with the cursor in it. Nothing is sent. With no suggestion (the switch off, no AI, a failed draft) the reply box opens empty with the cursor in it. Once only: it does not happen again when another conversation is picked from the list.
- Sending is the composer's own Send, unchanged.

## Checks

Pure / in-process: the read route is posted once per open; a kept draft is returned with no AI call (count the calls); a second inbound message gets a new draft; none after an outbound; none for a message 15 days old; none with the switch off; `suggested` is in no list row and not in `get_conversation`; Lucy's reads leave `read` as it was.

On screen with the testing agent, **test accounts only**, sends as a dry run, **1440 then 1024**:
1. The Today briefing on a TS_ business with a client email waiting → **Reply** → the Inbox opens that conversation; within a few seconds the suggested reply is in the reply box with its subject, the cursor in it; nothing has been sent.
2. Send (dry run) → it goes and shows in the conversation; the suggestion box is gone.
3. Back on the dashboard, a conversation that was only opened, not answered: its row is gone, the "Needs you" count is one lower.
4. Open that unanswered conversation again from the Inbox list → the same suggested reply, word for word, in its box; no new AI call; **Use this reply** fills the reply box; there is no Mark read button.
5. A new message arrives in it → at the next open a new draft.
6. The same with a text: one line, no subject.
7. Suggested replies off in CRM › Messages setup → no box; **Reply** from the briefing opens an empty reply box; the conversation is still marked read.
8. An unknown sender's conversation → opening it marks it read; the briefing's "people who aren't clients yet" row drops by one.
9. The Inbox list: the unread look clears on open and the CRM's unread count drops.
10. Ask Lucy "Any new emails?" before opening anything → afterwards every message is still unread.
11. Nothing runs off sideways in the Inbox or on the dashboard.

## Rules

As the rounds before: this message only — nothing from the rest of your suggestion list; no backfill (no draft is written for conversations already waiting — each gets its own at its next open); no notices or banners; AI is Claude only, through the app's own key; nothing under `app/employee/*`; no key, password, admin id, mailbox token, phone number or message body of a real client in any reply. **Tests: test accounts only, made for the run and removed after — never Josh's account, mailbox, number or storage; dry run only.** Report to `memory/reports/inbox-read-on-open-report.md`. Add one card to What's new draft #47 (never publish): "Opening a conversation in the Inbox now marks it read, so your Today briefing clears itself. Tap Reply on a briefing row and a suggested reply is waiting in the reply box — read it, change it, send it." Save to GitHub and Publish are Josh's clicks.

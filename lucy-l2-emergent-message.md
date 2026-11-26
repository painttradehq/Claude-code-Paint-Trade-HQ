# Lucy L2 — Lucy sends, and records a payment (round 2 of 5) — SENT to Emergent 26 Nov on Josh's word ("send it")

Written 26 Nov against the L1 code as saved to GitHub (`640c20d`). Josh uploads with it: the updated `lucy-operator.html` (the send card now shows the signature and the checks; a blocked send; a variation send; a payment card), this file, and the current `lucy-operator-spec.md` (the copy in Emergent's pod is an older one).

---

## The message as sent

# Lucy L2 — Lucy sends, and records a payment (round 2 of 5)

This is the L2 message you asked about. Your four questions: **(1)** build from this message, not from the saved spec; **(2)** quotes, invoices and payment reminders, variations, and recording a payment — **not** emails or replies from the mailbox; **(3)** a send is always its own "Send it" card, never a step of a plan; **(4)** a "Send for me" switch that starts on.

Josh is uploading an **updated `lucy-operator.html`** — save it over `memory/specs/lucy/lucy-operator.html` — with this message as `lucy-l2-emergent-message.md` and the current `lucy-operator-spec.md` (replace your older copy). If the prototype is not in the chat, reply "waiting for the prototype" once and wait. In it try: "Send EST-0046 to Leanne" · "Send EST-0041 to Mark" (red checks) · "Send the variation to Leanne" · "What's owed?" then its button · "Record a payment on INV-0009" · ⋯ › Lucy's setup › Send for me.

Build **only L2**. Deleting, email from the mailbox and files are L3–L5. One commit per part.

## Part 1 — Four tools (server)

Lucy-only, beside `do_steps` in `services/lucy_tools.py` — **not** in `connector_tools.REGISTRY`; the connector and `NOT_OFFERED` do not change. Each runs the route function the app's own window calls, with the caller's own user dict:

| Tool | Runs | Card |
|---|---|---|
| `send_quote({id, to?, cc?, subject?, message?})` | `estimate_send.send_estimate` (the window uses it for a first send and a resend) | send |
| `send_invoice({id, reminder?, to?, cc?, subject?, message?})` | `invoices.send_invoice_email` — `reminder: true` is a payment reminder | send |
| `send_variation({job_id, variation_id, to?, cc?, subject?, message?})` | the variation send route, `via: ["email"]` | send |
| `record_payment({invoice_id, amount, method?, date?, notes?})` | `invoices.add_invoice_payment` | change |

- **Email only.** Texts stay in the app's Review & Send.
- A send needs **Send for me** on (Part 3) **and** its area on Read and change (quotes; invoices; jobs for a variation) **and** the admin's own access — checked when the tool list is built and again on approve.
- **A send is never a step of `do_steps`.** `plan_error` answers "Sending gets its own card — I'll ask you for that separately." `record_payment` is an ordinary change under Invoices and may be a step.
- **Who it can go to:** `to` and `cc` may only hold the client's own addresses (the client and their contacts) or an address the user typed in the message that asked. Anything else is refused before a card is made: "I can only send to {client}'s own addresses, or one you type yourself."
- `record_payment` card rows, built by the server: Invoice (number · client) · Amount · Method · Date · **After this** ("Paid in full" or "$133.99 still owing", from `invoice_balance`). Done: "Payment recorded. INV-0009 is paid." / "Payment recorded on INV-0009."

## Part 2 — The send card (panel)

The send card is **the app's Review & Send in small, drawn by the panel from the record** — so its people, words and checks are the window's own, with no second copy of any of them. For kind `send`, `public()` also returns `record` ({type, id, job_id?}), `mode` (send / resend / reminder) and whatever Lucy passed (`to`, `cc`, `subject`, `message`).

- **To:** the window's ticked list — `useRecipients` with the same kind (quotes / invoices) — unless Lucy passed people.
- **Subject and message: one source.** Move each window's opening words into one helper, `utils/sendWords.ts`: the quote's two strings in `ReviewSend.tsx`; the invoice's send, resend and reminder words in `InvoiceBuilder.tsx`; the variation's in `app/admin/project/[id].tsx`; and the signature expression in `ReviewSend.tsx`. The windows call the helper — **their words must not change by one character** — and the card calls the same helper. Lucy's `message` replaces the opening message only when the user asked for particular words; the greeting follows `greetingName` as in the window.
- **Signature:** shown under the words, labelled "Signature · from Messages setup" (`lucy-act-sig`), and sent as the window sends it.
- **Attachment line:** what that window's send attaches — "Attached: Estimate-EST-0046.pdf"; a variation has none: "No attachment — the email carries the link to the approval page".
- **Checks (`lucy-act-checks`): the window's own**, from the same functions — the quote's `checklist(est)`, the invoice's `checklist(inv, quote)`, the variation's two checks (move the inline ones in `project/[id].tsx` into a function both use). Nothing red → a green "Checked" box listing what stands (ambers included; she may still send). **Any red → the box is red, "N things to fix before it can go", each one listed, a button "Open EST-0041" (`lucy-act-fix`) that opens the record, and Send it is off. Lucy never sends past a red check.**
- **Buttons:** **Send it** · Change something · Cancel. Send it posts `/api/ai/actions/{id}/approve` with `{to, cc, subject, body, attach_pdf}` exactly as shown. The server requires them for a send, re-checks the permission and the address rule, runs the route, and writes the `ai_tool_audit` row with who it went to and the subject. Done: "LUCY DID · ✓ Sent to leanne.crowe@example.com. EST-0046 is now Sent." Failed: the route's own words.
- **A card stuck on running** for more than two minutes (any kind) shows "This didn't finish — open {record} and check before trying again." and offers no retry.
- Lucy does not describe the checks or the words herself; she says one line ("This is what would go out.") and the card shows them.

## Part 3 — Send for me (her setup)

One row under the seven in "What Lucy can do": **Send for me** — "Quotes, invoices, reminders and variations. You see each one before it goes." — a switch (`lucy-perm-send`), **starts on**, stored as `ai.can.send`, saved with the rest. Off → she has no send tools; asked to send, `setup_is_off("send")` returns "Sending is turned off in my setup. I can still draft the words for you to send yourself." with the **Open Lucy's setup** button.

## Part 4 — Next-step button

One button at most (`lucy-next`), chosen by the server, never by the model, and only when she has the tool. Pressing it types and sends that sentence, so it becomes a card like any other:

| After | Button | Sends |
|---|---|---|
| a done card that started or changed a draft quote whose client has an email | Send it to {first name} | "Send {EST-…} to {client}" |
| a done card that raised an invoice | Send it to {first name} | "Send {INV-…} to {client}" |
| a done card that drafted a variation with a price | Send it to {first name} | "Send the variation "{title}" to {client}" |
| an answer that used `money_owed` and has an overdue invoice | Send a reminder for {INV-…} — the one most days late | "Send a payment reminder for {INV-…}" |

## Part 5 — Words, and three small things from L1

- `ADMIN_SYSTEM_PROMPT`: replace "You cannot send or delete anything yet…" with: she can send quotes, invoices, payment reminders and variations by email, each behind its own card; she cannot delete yet; texts are sent from the app's own window.
- The fixed "what I do" answer and `WHAT`: the added sentence becomes **"I can also do the work for you — start, change and send quotes, add to jobs, raise and send invoices, record payments, book the calendar — and I always show you what I'm about to do and wait for your OK."**
- Deleting a conversation also deletes its `lucy_actions`. A card that is finished (done, failed, cancelled, replaced, moved on) drops its `pause` field — the held conversation is only needed while it waits.
- The testing agent's note: in Lucy's setup change a row, press Cancel, then Discard — ten times at 1440 and ten at 1024. If the panel ever stays open, fix it in the shared `SetupPanel` and say what it was; if not, say so.

## Checks

**No real email leaves the pod:** every send runs with `OUTBOUND_DRY_RUN=1`, on TS_ data.

Pure / in-process (model faked): the tool list with Send for me off, with an area on Read, and for the "site" preset; a send inside `do_steps` is refused; `to` outside the client's addresses is refused, an address typed in the message is accepted; approve of a send without `to`, `subject` or `body` is 400; approve sends once and a second approve is 409; the audit row holds who and the subject; `record_payment` card rows for a full and a part payment; deleting a conversation removes its actions.

On screen with the testing agent, **1440 then 1024**:
1. In the quote's, the invoice's (send and reminder) and the variation's Review & Send, the opening subject and message are the same, character for character, as before this round.
2. "Send {a TS_ draft quote} to {client}" → the card shows To, Subject, the window's own words, the signature, the attachment and a green Checked box; nothing is sent until **Send it**; then the quote is Sent and the dry-run log has one email with that subject to that address.
3. A TS_ quote with an unmeasured area → the red box lists the same checks as its Review & Send, Send it is off, the button opens the quote.
4. "…and tell her we can start on Monday" → the message carries those words; the rest of the card is unchanged.
5. A payment reminder from "What's owed?" → its button → the reminder card → Send it → one email in the log.
6. A variation → its card (no attachment line, the approval link) → Send it → the row on the job reads "Sent · awaiting approval".
7. "Record a $100 payment on {INV}" → the card shows what is still owing → Approve → the invoice shows the payment and its balance.
8. Send for me off → asked to send she says it is turned off, no card, and the button opens her setup. Invoices on Read → no payment card.
9. A send asked for inside a longer task → the plan card has no send step; the send comes as its own card afterwards.
10. Nothing sideways-scrolls inside Lucy with the longest card open; the card fits the 480 px panel.

## Rules

As L1: TS_ rows only, torn down after; Josh's own tenant read-only; no backfill; nothing beyond this message and nothing from your own suggestion list; no notices or banners; AI is Claude only, through the app's own key; nothing under `app/employee/*`; no key, password or admin id in any reply. Report to `memory/reports/lucy-l2-report.md`. Add one card to What's new draft **#47** (never publish): "Lucy can send for you — quotes, invoices, payment reminders and variations. She shows you the email first and it goes only when you press Send it. She can also record a payment on an invoice." Save to GitHub and Publish are Josh's clicks.

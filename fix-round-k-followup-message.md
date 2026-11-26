# Fix Round K follow-up — the variation's Review & Send as the quote's; finish the screen checks — NOT SENT; waits for Josh's "send"

Josh uploads `variation-review-send.html` (the prototype) with this message. Notes: `variation-review-send-notes.md`.

---

## The message as it will be sent

# Fix Round K follow-up — two things

Josh is uploading **`variation-review-send.html`**. Save it as `memory/specs/projects/variation-review-send.html`. It is the reference for part 1.

## 1. The variation's Review & Send is the quote's Review & Send

Your window from `9942d32` is a separate look-alike. Josh asked for "the same preview and send as we have in the estimate builder". Replace it:

- **Use the one component**, `components/estimate/v2/ReviewSend.tsx`, the way the invoice already does through its `invoice` prop — a variation is a third mode of it, not a new window. Remove the separate variation window.
- Same size and layout as the quote's. Left column, in this order: the checklist box · **To** (the client and their contacts with ticks, plus cc — `useRecipients` / `ToList`) · Subject · **Message** with "Draft with AI" · the signature from Messages setup · the SMS tick with number, contact picker and text · the Send button · the total line.
- Checks: price set (said as "$320.00 + GST ($352.00 incl. GST)" from `services/variation_money.price_text`), the client has an email, the lines. No email → a red check with Fix; Send is off.
- Send button: "✈ Send variation to N person / people"; nobody ticked → off. **Resend** opens the same window titled "Resend variation".
- Right side: the client's approval page, the same component the public link uses, Approve and Decline off (as you have it).
- Sent state as the quote's: "Variation sent!", who it went to, the approval link with Copy, **Done** → back on the job; the row reads "Sent · awaiting approval" and offers Resend, no pencil.
- Total line: the price with GST · the line count · the timeframe, with "Edit the variation" beside it.
- It opens from the draft row's "Preview & send", the form's "Save & preview", and Resend. Nothing sends a variation without this window.
- **Server:** `POST /projects/{id}/variations/{vid}/send` also takes `cc`, `subject` and `body`. The client's email is the admin's message and signature, then the approval card and button as now; the SMS is the text typed in the window; the activity line names who it went to. A variation already sent keeps what it was sent with — no backfill.

Checks for the testing agent (1440 then 1024, TS_ data): the window opens from the row, the form and Resend; the left column is in the quote's order; ticking a contact changes the count; nobody ticked turns Send off; a bad cc address is refused in words; the message and subject typed are the ones in the email that arrives (dry run); the preview's price matches the left; Approve is off in the preview; × sends nothing; Send shows the sent state and the row changes; a client with no email shows the red check. **Do not click a real send outside the dry run** — one went out by accident last time.

## 2. Finish Fix Round K's screen checks

Seed the TS_ data yourself first, then run on screen at **1440 and 1024** the checks from the Round K message that were not viewed: **4** (terms format), **6** (zones and notes), **7** (un-accept), **8** (reopen), **9** (hourly item), **10** (session fix), **12** (greeting); and the parts left of **1** (the client's variation page, the invoice line at $320 + GST, the GST-inclusive quote), **2** (no pencil on a sent row; PATCH → 409), **3** (a blurb and two stats print exactly), **5** (the public invoice page), **15** (the casual fields fill "25%" and "$48.63"; Notice not required). Report each as passed or failed with what was seen.

Also, as part of B-067: the invoice builder's own Job card shows the **job type above the address**, as the PDF does.

## Rules

As Round K: TS_ rows only, torn down after; Josh's own tenant read-only; no backfill; nothing beyond this message and nothing from your own suggestion list; no notices or banners; nothing under `app/employee/*`; no secrets in any reply. One commit per part. Add to `memory/reports/fix-round-k-report.md`. What's new stays a draft. Save to GitHub and Publish are Josh's clicks.

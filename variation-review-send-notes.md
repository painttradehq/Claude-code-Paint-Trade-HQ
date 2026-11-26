# Variation · Review & Send — the estimate builder's window, for a variation (26 November)

**Josh, 26 Nov:** "I also asked Emergent to fix the variation work — I wanted to have a preview before send for the variation, but I think Emergent did it poorly. Please check, and if needed create a prototype of it. We should have the same preview and send as we have in the estimate builder."

**Prototype:** `variation-review-send.html` — open it, press **Preview & send** on the draft row. **Checks:** `tools/test_variation_review_send.js`, 72 of 72 at 1440 × 900 and 1024 × 768. Add `?noemail=1` for a client with no email, `?page=today` for the client's page as it is today (dark).

## What Emergent built (its commit `9942d32`, 25 Nov — read from its report; the code is not on GitHub yet, so it was not seen)

Its own "Review & Send" window for a variation: on the left the title, job and price, an "Edit the variation" link, **one editable email field**, a subject line, an "Also text the approval link" tick and Send; on the right the client's approval page with its buttons off. The row's button reads "Preview & send", the form's "Save & preview"; neither sends by itself. Emergent's own note: the Send button and the text option were **not tested**, and one real send went to a TS_ `.example` address by accident during its run (test data, since removed).

## Where it falls short of the estimate builder's window

| The estimate's Review & Send has | Emergent's variation window |
|---|---|
| A checklist box ("Ready to send" / "N things to check before it goes", with Fix) | none |
| A **To** list — the client and their contacts with ticks, plus cc | one email field |
| **A message** to the client, with "Draft with AI" | none (it offers it as a later idea) |
| The signature from Messages setup | none |
| SMS: number, a contact picker, the text | a tick only |
| The Send button counting who it goes to | plain Send |
| A sent state: who it went to, the link with Copy, Done | not reported |
| One component for quotes and invoices (`components/estimate/v2/ReviewSend.tsx`, the invoice passes an `invoice` prop) | a third, separate window |

So Josh's read is right: it is a look-alike, not the same preview and send.

## What it should be (the prototype)

- **The same component.** A variation opens `ReviewSend` the way an invoice does — a third mode, not a new window. Same size (1400 wide, full height), same sub-line worded for a variation, same left column in the same order: checks · To · Subject · Message (+ Draft with AI) · Signature · SMS · Send · total line.
- **Checks:** the price is set (shown as "$320.00 + GST ($352.00 incl. GST)"), the client has an email, the lines. No email → a red check with Fix, and Send is off.
- **Send button:** "✈ Send variation to 1 person" / "2 people"; nobody ticked → off. Resend opens the same window, titled "Resend variation".
- **Right side:** the client's own approval page (the same component the client's link uses), Approve and Decline off.
- **Sent state:** "Variation sent!", who it went to, the approval link with Copy, **Done** → back on the job, the row reads "Sent · awaiting approval" and offers Resend.
- **Total line:** the price with GST, the line count and the timeframe, with "Edit the variation" beside it.
- **Where it opens from:** the draft row's "Preview & send", the form's "Save & preview", and Resend. Nothing sends without this window.

## What the server needs for it

`POST /projects/{id}/variations/{vid}/send` takes a `to` list today but no cc, subject or message — the email is one fixed layout. To match the quote: accept `to`, `cc`, `subject` and `body`; the client's email is the admin's message and signature, then the approval card and button as now; the SMS text is the one typed in the window; the sent event records who it went to. No backfill; a variation already sent keeps what it was sent with.

## The client's page: light, like the quote (Josh, 26 Nov: "why is the screen of what the client sees black?")

It was black in the first prototype because that is the page the client gets today: `app/variation/[token].tsx` is a dark page (background `#0F1115`, a dark card, a bright green button) left from before the app's light look, and it was copied as it is. The quote and the invoice the same client receives are white documents, so the variation looks like it came from a different product.

The prototype now shows it **light**: white paper, the business name in the display font, the work on a soft panel, the lines ruled, the price large with the GST-inclusive figure under it, the app's green on Approve. Same content, same order, same buttons — only the colours and type. `?page=today` shows the dark page for comparison. This is a change to a page clients see, so it goes to Emergent only with Josh's word (it is item 1b of the follow-up message).

## Not in this prototype

The variation form itself (unchanged apart from its button reading "Save & preview").

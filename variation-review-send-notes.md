# Variation · Review & Send — the estimate builder's window, for a variation (26 November)

**Josh, 26 Nov:** "I also asked Emergent to fix the variation work — I wanted to have a preview before send for the variation, but I think Emergent did it poorly. Please check, and if needed create a prototype of it. We should have the same preview and send as we have in the estimate builder."

**Prototype:** `variation-review-send.html` — open it, press **Preview & send** on the draft row. **Checks:** `tools/test_variation_review_send.js`, 100 of 100 at 1440 × 900 and 1024 × 768, with the client's page also checked at phone width (390). Add `?view=client` for the client's page on its own with working buttons (`&logo=1` for a business with a logo), `?noemail=1` for a client with no email, `?page=today` for the client's page as it is today (small and dark).

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

## The client's page: a proper document, the quote's width (Josh, 26 Nov)

Two things Josh said about it the same day: "why is the screen of what the client sees black?" and then "what the client sees for the variation is a small frame and it looks cheap — make it better and wider, more professional and simple looking."

**Today** (`app/variation/[token].tsx`): a dark page with one card 460 px wide, the lines as plain text, a bright green button. It predates the app's light look, so next to the white quote and invoice the same client receives it looks like a different product. `?page=today` shows it.

**The prototype** (`?view=client`): a white document **860 px wide — the quote's width** — centred on the soft grey page, shrinking to fit a phone.

| Part | What it shows |
|---|---|
| Header | The quote's header: the logo when the business has one, the business name in the display font, ABN, address, phone · email. On the right **VARIATION** where the quote says QUOTE, then the quote number and the date. |
| Who | **Prepared for** (client and address) · **Job** (the job type, then the address — the invoice's Job box). |
| The work | The title, the description, then the lines in a ruled table: Description · Qty · Amount. |
| Totals | Extra work · GST (10%) · **Total to approve** · Estimated time. A variation with GST included or no GST shows the one total. |
| Approve | One soft panel: "Approve this extra work — it is extra to your quote EST-0019. Nothing starts until you approve it." A name box, a green **Approve this work**, and Decline as plain text. "Your typed name acts as your signature." |
| After | The panel becomes the record: "✓ Approved by Leanne Crowe · 26 November 2026 — Thank you. Sano Painting & Decorating has been notified." (or "Declined · date"). |
| Footer | "Questions? Call … or email …" and "Sent with Paint Trade HQ". |

**Unchanged:** what the client can do and when. Approve is off until a name is typed, Decline needs no name, an answered variation shows its answer — all as today, and the page keeps today's test ids (`public-variation-card`, `variation-public-lines`, `variation-price`, `variation-total`, `variation-signer-name`, `variation-approve-btn`, `variation-decline-btn`, `variation-done-box`). `variation-price` now holds the ex-GST figure alone and `variation-total` the figure to approve.

**What the server adds for it** (`GET /public/variation/{token}` returns the business name only today): the business profile the quote's client document already gets (`build_business_profile` in `routes/estimate_send.py`: logo, ABN, address, phone, email); the client's address (`client_snapshot.address`); the quote's number and the job type and address the invoice's Job box uses (Round K, B-067); the date it was sent; and `responded_by`, so the answered page can name who approved. Nothing is stored that isn't stored today.

The preview in Review & Send is this same component with the name box and buttons off (at full colour, so the admin sees what the client sees).

**Status:** the follow-up sent to Emergent on 26 Nov carries the earlier, smaller version of this as item 1b ("colours and type only"). The wider document replaces it — `variation-client-page-addendum.md` is ready and goes only on Josh's "send".

## Not in this prototype

The variation form itself (unchanged apart from its button reading "Save & preview").

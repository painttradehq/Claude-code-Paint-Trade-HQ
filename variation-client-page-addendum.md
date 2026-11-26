# Fix Round K follow-up — addendum to item 1b: the client's variation page — NOT SENT (waits for Josh's "send")

Josh, 26 Nov: "What the client sees for the variation is a small frame and it looks cheap. Make it better and wider — more professional and simple looking."

Josh uploads the **updated `variation-review-send.html`** with this message; it replaces the copy uploaded earlier. Notes: `variation-review-send-notes.md`.

---

## The message to send

# Fix Round K follow-up — item 1b is replaced

Josh is uploading an **updated `variation-review-send.html`**. Save it over `memory/specs/projects/variation-review-send.html`. Open it with **`?view=client`** to see the client's page on its own with working buttons (`&logo=1` for a business with a logo). If you have already built item 1b as first written ("colours and type only"), build this over it; parts 1 and 2 of the follow-up are unchanged.

## 1b. The client's variation page is a proper document, the quote's width

`app/variation/[token].tsx` today is one small dark card (460 px). It becomes a white document, **max-width 860 px like the quote's client document**, centred on the app's soft grey page, shrinking to fit a phone. Match the prototype:

- **Header — the quote's header.** Left: the logo when the business has one (max 160 × 56, as `ClientDoc.tsx` shows it), the business name in the display font, then ABN · address · phone and email, each on its own line, a line left out when empty. Right: **VARIATION** in the display font and accent colour where the quote says QUOTE, then `Quote # EST-0019` and `Date` (the day it was sent). A job with no quote leaves the quote line out.
- **Prepared for** (the client's name and address) and **Job** (the job type in bold, then the job's address — the same two values the invoice's Job box shows since Round K, B-067; a job with no quote shows the job's name and address).
- **The work:** the title, the description and notes, then the lines in a ruled table — Description · Qty · Amount (each amount with cents).
- **Totals**, right-aligned under the table: `Extra work $320.00` · `GST (10%) $32.00` · **`Total to approve $352.00`** · `Estimated time half a day`. GST included in the price: one row, "Total to approve (incl. GST)". No GST, or a variation stamped before Round K: one row, "Total to approve". Figures come from `services/variation_money` as now.
- **Approve panel** (one soft panel): heading "Approve this extra work", then "It is extra to your quote EST-0019. Nothing starts until you approve it." (without the quote number when the job has none). A name box ("Type your full name"), the green **Approve this work** button and **Decline** as plain underlined text, on one row; on a phone the name box is full width with the buttons under it. Under them: "Your typed name acts as your signature."
- **After an answer** the panel shows only the record: "✓ Approved by {name} · {date}" with "Thank you. {business} has been notified." — or "Declined · {date}" with "{business} has been notified." A link opened again later shows the same.
- **Footer:** "Questions? Call {phone} or email {email}." (only the parts the business has) and "Sent with Paint Trade HQ".

**Behaviour does not change:** Approve is off until a name is typed, Decline needs no name, the same two requests are made, an answered variation cannot be answered again. **Keep today's test ids:** `public-variation-card`, `variation-public-lines`, `variation-price` (now the ex-GST figure alone), `variation-total` (now the figure to approve), `variation-signer-name`, `variation-approve-btn`, `variation-decline-btn`, `variation-done-box`.

**Server — `GET /public/variation/{token}` also returns** (it returns the business name only today): `business_profile` from `build_business_profile` in `routes/estimate_send.py`, the one the quote's client document gets; `client_address` (`client_snapshot.address`); `estimate_number`; the job type and job address as the invoice's Job box gets them; `sent_at`; `responded_by`. Read-only additions; nothing new is stored and nothing is backfilled.

**The preview in Review & Send (part 1) is this same component**, with the name box and both buttons off — at full colour, not dimmed, so the admin sees what the client sees. It fills the right-hand pane.

Checks for the testing agent (TS_ data; 1440, 1024 and a phone width of 390): the page is 860 wide and centred at 1440 and 1024, and fits 390 with no sideways scroll; the header shows the TS_ business's ABN, address, phone and email, and its logo when it has one; the lines and the three totals add up; Approve is off with an empty name and on with one; approving shows "Approved by {name} · {date}" and the job's variation row turns Approved; opening the link again shows the same record; Decline works without a name; a variation with GST included shows one total; the Review & Send preview shows the same page with the buttons off. Screenshots at all three widths into the report.

Rules as the follow-up: one commit for this item; TS_ rows only, torn down; Josh's own tenant read-only; nothing beyond this message; nothing under `app/employee/*`; no secrets in any reply; add a line for the client's page to the What's new **draft** (never publish). Save to GitHub and Publish are Josh's clicks.

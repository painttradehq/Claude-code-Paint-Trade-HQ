# 03 — Client-facing terms and the acceptance flow (what a painter's client sees and signs)

Pulled from the app code on 6 October 2026. The painter can edit every piece of wording below in Settings; these are the defaults the app ships with.

## 1. Default quote terms (printed on every quote unless the painter replaces them)

1. **Quote Validity** — This quote is valid for the number of days shown above. Prices may be reviewed after that if material costs shift.
2. **Deposit & Payment** — A deposit secures your start date. Progress and final payments are due per the milestone schedule.
3. **Variations** — Any changes to scope, colour or substrate are captured as a written variation and priced before works proceed.
4. **Access & Preparation** — Client to provide clear access to work areas. Fragile items and valuables to be removed by the client prior to start.
5. **Site Conduct** — We keep the site tidy, dust-sheet all surfaces, and clean up at end of each day.
6. **Workmanship Warranty** — All labour is warranted for 2 years from practical completion against defective preparation or application.
7. **Cancellations** — Cancellations within 48 hours of the start date may forfeit the deposit to cover crew scheduling.
8. **Liability** — We carry $20M public liability insurance. Damage caused by pre-existing substrate defects is excluded.

The quote also carries: the painter's business name, ABN, address, phone, email and licence number (as entered in Settings); a validity period in days (default 30); the payment schedule (default milestones: Deposit 30% on acceptance, Progress 40%, Final 30% on completion — the painter can change the number of milestones and percentages); GST shown separately; an optional "About us" block with public-liability and warranty figures the painter types in.

**Contract terms template.** Separately from the eight clauses above, the painter can write a longer "contract terms" text (Settings › Estimates › Terms) that prints with the quote. The app ships no wording for it; it is empty until the painter writes it.

## 2. How a client accepts a quote

The client receives an email or SMS with a link to a public page (no login; the link contains a long random token). The page shows the full quote, the terms above, the payment schedule and any optional extras the client can tick on or off.

**Accept dialog** ("Accept this quote · EST-0192 · Sano Painting Co."):
- Name field.
- Signature: **draw** on a signature pad, or **type** the name (rendered as a signature image).
- Checkbox: **"I have read and agree to the terms and conditions and the payment schedule above."** — this box is **ticked by default** when the dialog opens.
- Line under it: "Your signature, name, the date and time, and the extras you chose are saved with the quote."
- Button: Accept.

**What the app records on acceptance:** signer name, the signature image, the time (UTC), the client's IP address, the accepted optional extras, and the quote content as it was at that moment (quotes are frozen once accepted). The painter is shown "Accepted by {name} on {date}" and the signature prints on the quote PDF. An "accepted" event is written to the quote's history, a project is created from the quote, and the deposit invoice is created as a draft for the painter to review and send.

**Decline:** the client can decline with an optional reason; recorded the same way without a signature.

## 3. Variations (changes to the job after acceptance)

The painter sends a variation (added or removed work with a price) to the client by email or SMS. The client opens a link and approves or declines by **typing their name** (no drawn signature); the app records the name, time and IP address. Approved variations are added to the job total.

## 4. Invoices

- Raised from the accepted quote's payment schedule (deposit / progress / final) or as stand-alone invoices.
- Sent by email (PDF attached) and/or SMS with a link to a public invoice page. The page shows the invoice, "How to pay" with the painter's bank details (account name, BSB, account number, reference = the invoice number) and the payment terms.
- **Default payment terms line:** "Payable within 14 days of the issue date." followed by the painter's own invoice terms text. The app's default for that text is: **"Overdue balances may attract interest at 1.5% per month. Title to materials passes on payment in full."**
- Default footer: "Thank you for your business."
- No online card payment. The painter records payments received (bank transfer, cash, card in person, cheque).
- Credit notes can be issued against an invoice.

## 5. Completion report and warranty

At the end of a job the painter can send a completion report (before/after photos, scope, a warranty and care-notes section). **Default warranty text:** "All workmanship is covered by our 2-year warranty. If any area of the finish lifts, peels or flakes because of how it was applied, we come back and fix it at no cost." The painter can edit it.

## 6. Public links generally

Quotes, invoices, variations and completion reports are opened through links containing a long random code; no password. The app records when a link is opened (time, IP, browser). Links do not expire. The client can download the PDF and print from the page. Every public page carries the painter's business details; the pages are branded Paint Trade HQ in the footer with links to our Terms and Privacy Policy.

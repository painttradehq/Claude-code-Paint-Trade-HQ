# Paint Trade HQ — Brief for legal review

**Prepared 6 October 2026 for the business owner (Josh Sano) to hand to the reviewing lawyer.** Everything in this pack was pulled from the app as it stands today (code at Round 64, 4 October 2026). Where the published drafts no longer match the app, section 4 says so.

## 1. What Paint Trade HQ is

Paint Trade HQ is a web app for Australian painting businesses. A painter (the "account holder") signs up, enters their clients and jobs, builds quotes, sends them to the client through a link, and the client accepts the quote on that link with an electronic signature. The app then tracks the job (crew sign-ins by phone with GPS at the moment of sign-in, daily site reports, photos, variations), raises invoices that the client pays by bank transfer, and keeps employee records (onboarding documents, timesheets, employment agreements signed electronically in a separate crew app). An AI assistant ("Lucy", on Anthropic's Claude) writes drafts and a morning brief from the business's own data.

Each painting business is a separate, isolated workspace. Paint Trade HQ never deals with the painter's clients or employees directly; it stores and processes their information on the painter's instructions.

**Where it is today:** a pre-release tester program with a small number of invited painting businesses. No fees are charged yet. Paid monthly/yearly subscriptions (through Stripe) come later. The app is built and hosted on Emergent (an AI app-building platform) and will move to its own hosting and domain before public launch.

**The operating entity** (to be filled in by Josh before the lawyer starts): legal entity name, ABN, registered address, support / legal / privacy email addresses, phone, and the state whose law should govern (the drafts say "[Victoria]"; the business is based in **[Josh to confirm state]**). These are the square-bracket placeholders in documents 01 and 02.

## 2. What is in this pack

| File | What it is |
|---|---|
| 00 (this file) | The brief: what the product does, what we are asking for, what has changed since the drafts were written |
| 01 Terms of Service — draft 1.0-draft, 18 Sept 2026 | Live on the app at /terms. Accepted at sign-up (version, time and IP recorded on the account) |
| 02 Privacy Policy — draft 1.0-draft, 18 Sept 2026 | Live on the app at /privacy |
| 03 Client-facing terms and the acceptance flow | What a painter's client sees and signs: the default quote terms, the acceptance dialog, the record kept, invoice terms, the warranty line |
| 04 Employment documents | How the crew contracts feature works and the ground rules it is built on |
| 05 Data map | Every category of personal information the app holds, where it is stored, which third parties touch it, and for how long |

## 3. What we are asking the lawyer to do

**A. Terms of Service (01).** Review and finalise for the tester program now, with a note on what changes for public launch. Please look in particular at: the liability cap (greater of fees paid and AUD 100) and the indemnity, given the Australian Consumer Law unfair contract terms rules for small-business standard-form contracts (the painters are small businesses); the right to change terms on 14 days' email notice; closing accounts unused for 12 months; the feedback licence and tester confidentiality in section 1; the governing-law clause; crew members aged 15 to 17.

**B. Privacy Policy (02).** Review against the Australian Privacy Principles. Specific questions:

1. Is Paint Trade HQ an APP entity now (turnover is under the $3 million threshold), and should we opt in regardless? The drafts assume we follow the APPs either way.
2. Is the two-role model in section 1 right: we are the responsible entity for account holders, and we process the painter's clients' and employees' information on the painter's behalf?
3. Employee location: the crew app records GPS position only at sign-in and sign-out, plus the distance from the job site, and flags sign-ins outside a per-job radius. The painter sees this. Is the wording adequate, and does the employee-records exemption cover the painter but not us?
4. Overseas disclosure: email (Resend, US), SMS (Twilio, US), AI (Anthropic, US), weather and geocoding (Open-Meteo, Germany), hosting (Emergent — region to be confirmed by Josh), Google and Microsoft (global, only when the painter connects them). Is the consent wording in section 5 enough?
5. Photos of clients' homes are shared through long random links that do not expire (section 4). Is the warning sufficient?
6. Retention: the policy promises deletion 30 days after an account closes. The automated purge is not built yet (today it only reports what would be purged). Should the promise be softened until it is built, or must it be built before launch?
7. Children: crew aged 15 to 17 added by their employer.
8. The Notifiable Data Breaches paragraph.

**C. The painter's contract with their client (03).** In the app, the accepted quote *is* the contract between the painter and the client. Questions:

1. The client accepts by typing or drawing a signature, entering their name, and ticking "I have read and agree to the terms and conditions and the payment schedule above". The app records name, signature image, time, IP address and the options chosen. Is this a valid electronic signature under the Electronic Transactions Acts? Note: **the agreement checkbox is ticked by default** when the dialog opens. Should it be unticked?
2. Residential painting is "residential building work" in several states. We understand (please confirm and correct) that NSW requires a written contract above $5,000 and a prescribed-content contract plus HBCF insurance above $20,000 with a 10% deposit cap; Queensland has similar levels at $3,300 and $20,000 under the QBCC Act; Victoria at $10,000 under the Domestic Building Contracts Act with deposit limits; WA at $7,500. The app's default quote terms (03 §1) are eight short clauses and the default payment schedule is a 30% deposit, 40% progress, 30% final. Please advise: (a) what the quote and its terms must contain for an accepted quote to be a compliant contract in each state, or whether the app should instead carry a state-specific contract-terms template that the painter attaches; (b) whether the 30% default deposit must be reduced; (c) whether a "this quote is not a compliant building contract above $X" warning is enough where the painter has not attached one. The app already lets each painter write their own "contract terms" text that prints with the quote.
3. Variations are approved on a link with a typed name only (no drawn signature). Is that enough?
4. The 2-year workmanship warranty default and the "pre-existing substrate defects excluded" liability line: any ACL consumer-guarantee problem with the wording?
5. Invoices: payment by bank transfer only, "Overdue balances may attract interest at 1.5% per month" as the default terms line. Is the interest line acceptable as a default?

**D. Employment documents (04).** The app never supplies employment contract wording. The painter writes their own templates (the app points them to the business.gov.au Employment Contract Tool and shows a "not legal advice, have it checked" notice on every template). The app fills in fields, collects the crew member's electronic signature, the business countersigns, and the signed PDF is emailed and kept for seven years. Questions: is the disclaimer sufficient to keep Paint Trade HQ out of the employment relationship; is the e-signature record (text as signed, signer, time, IP, typed or drawn, template version) adequate; the "Record the end" wording ("This only records the end in the app. Notice periods, final pay and unfair-dismissal rules apply separately under the Fair Work Act."); and **crew members never see or accept our Terms** — their onboarding sets an "agreed to terms" flag automatically. Does a crew member need to accept anything from us directly?

**E. Messaging.** Painters send SMS and email through the app, including automated follow-ups, reminders and Google-review requests. The app honours STOP replies and an opted-out flag. Please check the Spam Act position and the wording in Terms §3 "Messages you send" and Privacy §9 "Opt-out".

**F. AI.** Data from a business's workspace (today's jobs, recent quotes, a client's message history, text to polish) is sent to Anthropic's API under the business owner's own API key. Anthropic's commercial API terms say customer data is not used to train models. Lucy also stores reminders and ideas the owner dictates. Please check Terms §6 and the AI row in Privacy §5, and whether any further disclosure or consent is needed for the painter's clients' information being processed by Anthropic.

**G. Intellectual property.** Please advise on: a trade mark search and filing for the name "Paint Trade HQ" and the logo (we assumed classes 9 and 42; please confirm, and whether 35 or 37 matter); confirming the code is owned by the operating entity — it was produced on the Emergent platform and with Anthropic's Claude Code, whose terms (we understand) assign output to the customer; a written IP assignment and confidentiality clause for a contractor who is about to join (Adam) and for any future staff; the © notice and the licence clause already in Terms §11; whether anything is needed for the domain.

**H. Later: subscriptions.** When paid plans start (Terms §8): auto-renewal disclosure, price-change notice, refunds under the ACL, Stripe billing. A note now on what section 8 must say is enough; the detail can wait.

**I. Tester program.** Is Terms §1 (free trial, prototype, keep your own copies, feedback licence, confidentiality, access codes) enough, or do testers need a separate short tester agreement?

**J. Outside the documents.** Any insurance the entity should hold (professional indemnity, cyber), and whether the entity structure is right for a software business. If this is out of scope, say so.

## 4. What has changed since the drafts were written (fold these into 01 and 02)

The drafts are dated 18 September 2026. The app has moved on. The lawyer should treat these as facts to write in:

1. **No card payments on client links.** Stripe checkout, Apple Pay and Google Pay were removed on 4 October. Clients pay by bank transfer using the details printed on the invoice. Stripe will be used only for our own subscription billing later. Terms §4 "Online payments" and Privacy §2 "Payments" and the Stripe row in §5 need rewording.
2. **AI provider is Anthropic (Claude), not OpenAI.** Calls go to Anthropic's API under the business owner's own key, through our backend. Privacy §5 row "AI model provider (currently OpenAI, accessed through Emergent)" is wrong. Crew members have no AI features. The assistant ("Lucy") is live; it also keeps reminders and ideas the owner gives it.
3. **Storage options.** Photos and attachments are stored either in the built-in store (today: inside our database; a cloud bucket is planned before testers upload real photos), in the painter's Google Drive, or in the painter's Microsoft OneDrive (new). Privacy §4 mentions Drive only.
4. **Calendars.** Google Calendar, Apple iCloud calendar and now Microsoft 365 / Outlook calendar can be connected (read only). Add Microsoft to Terms §5 and Privacy §5.
5. **Website enquiry forms were removed.** Leads are typed in by the painter. Delete Privacy §2 "Website enquiry forms".
6. **Weather and geocoding provider** is Open-Meteo (Germany), used for the morning brief's weather and for turning job addresses into map positions. Fill the placeholder row in Privacy §5.
7. **Hosting** is Emergent; Josh to confirm the region for the placeholder row. The app will move to its own hosting before launch.
8. **Employee location** also includes a per-job geofence radius and an "off-site" flag with the distance when a sign-in is outside it. Privacy §2 "Timeclock location" is still accurate but could say so.
9. **Deletion after closure** (Terms §10, Privacy §8): the 30-day automated purge is not built. See question B6.
10. **Platform administrator.** The owner of Paint Trade HQ can see tester feedback, sign-up leads and tester invites across all businesses (not the businesses' client or job data). Add to Privacy §5 if the lawyer thinks it needs saying.
11. **Product updates.** The app shows a "what's new" pop-up to every signed-in user after a release and can email the same content to everyone; these are service messages, not marketing.
12. **Tester access codes** lock after five wrong attempts and the tester is emailed. Terms §1 "Access codes" could mention the lock.
13. **Exports** available today: PDFs of quotes, invoices and reports; CSV of daily reports, timesheets and sign-in sessions. Terms §10 says "client, invoice and timesheet lists as CSV" — slightly different; align.
14. **Crew app terms.** Crew never see the Terms; the onboarding wizard sets "agreed to terms" to true automatically (question D).
15. **Quote acceptance checkbox is pre-ticked** (question C1).
16. **Birthday reminders** use the employee's date of birth (Privacy §2 says so already) and the app emails the owner a daily birthday check.

## 5. Placeholders Josh fills in before the lawyer starts

In 01 and 02: [Legal entity name], [ABN], [registered address] / [address], [support email], [legal email], [privacy email], [phone], [Victoria] (governing law state), [Hosting provider, e.g. Emergent / cloud region] and [Region — confirm]. The weather/geocoding placeholder is answered above (Open-Meteo).

## 6. Facts the lawyer may ask about

- Sign-up records the Terms version, the time and the IP address on the account. When the Terms version changes, the next sign-in shows a one-time "we've updated our Terms" banner with a Dismiss that records acceptance again. No blocking modal.
- Passwords are hashed; traffic is HTTPS; each business's data is separated and that separation is tested automatically on every release; third-party tokens are encrypted at rest or held as revocable tokens.
- Nothing signed (quotes, variations, employment documents) is ever edited or hard-deleted; signed rows are append-only apart from status.
- Signature images for employment documents are private (never a public link). The client's quote signature is stored with the quote and shown on the quote PDF.
- The painter's own quote terms, contract terms, warranty text and invoice terms are editable by the painter; the app ships defaults (03) that the painter can replace.

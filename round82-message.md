Round 82 — Terms of Service 1.2 after the legal review (the Round 66 rerun). Start now: Round 80 is complete. If the crew chat's round is already running, queue this behind it — one round at a time.

The lawyer's advice (M & B Legal, 21 October) came as text, not a document. For the testing phase: the Terms of Service are the only policy; users are shown the Terms at sign-up and click "I agree"; three amendments to the Terms (the fees section removed, the warranties section replaced by an "at your own risk" text as section 1, a "we do not sell your data" section added); the app and the Terms carry "© + the legal entity". Josh has decided: the Privacy Policy comes off the agreement during testing; existing accounts get the existing one-time banner with its button renamed "I agree". No prototype: the pages exist (Round 17c, Round 66); the changes are text, one box on the sign-up page and one button label. Nothing else changes.

1. The Terms file. Replace `backend/content/legal/terms.md` with the text between the two "=====" lines below, verbatim (if Josh also uploads it as `terms-of-service.md` with "here", the two are identical — use either). Save a copy to `memory/specs/legal/terms-of-service.md`. Version and date are read from the header as today (`routes/legal.py`); nothing hard-coded. The version is 1.2 with no square brackets, so the draft pill, the yellow notice and the placeholder highlight do not appear.

=====
# Paint Trade HQ — Terms of Service

**Reviewed for the tester program · Version 1.2 · 22 October 2026**

> Brought up to date on 22 October 2026 with the legal advice of 21 October 2026 (M & B Legal).

These terms are a contract between you and **Josh Sano Painting and Decorating**, trading as Paint Trade HQ ("we", "us", "the developers", "Paint Trade HQ"), of Melbourne, Victoria, for the use of the Paint Trade HQ web app, employee app, client links and related services (the "Service" or "the app").

By creating an account and ticking the agreement box, or by using the Service, you agree to these terms. If you are creating an account for a business, you confirm you are authorised to bind that business, and "you" means that business.

## 1. Testing at your own risk — no warranty

Paint Trade HQ is currently free and is being tested by you at your own risk. Therefore, Paint Trade HQ is provided 'as is' and 'as available' without warranty of any kind, either express or implied. To the maximum extent permitted by applicable Australian law, the developer(s) disclaim all warranties, whether express, implied, statutory, or otherwise. Your use of the app is at your own sole risk. In no event shall the developers be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with the use of or inability to use the app.

## 2. The tester program (applies until we say otherwise)

The Service is currently a **pre-release product** used by a small group of invited painting businesses. While the tester program runs:

- **No fee is charged.** Your account is on a free trial. We may extend the trial or convert it to a paid plan later, but only with at least 30 days' notice and never without your consent to pay.
- **It is a prototype.** Features may change, break, or be removed between one day and the next. The app is not guaranteed to be available, accurate or complete.
- **Keep a copy of anything important.** We may reset, migrate or wipe test data as part of development. Do not treat the Service as your only record of quotes, invoices, payments, timesheets or staff documents. Export or screenshot what you need.
- **Real clients at your own risk.** You may use the Service with real clients and staff, but you carry the responsibility for anything you send them (quotes, invoices, SMS, email, completion reports). Read before you send.
- **Feedback.** Anything you tell us about the Service (bug reports, ideas, screenshots, recordings) may be used by us to improve the product without payment or credit to you. Do not include other people's personal information in feedback unless it is necessary to show the problem.
- **Confidentiality.** Unreleased features, pricing and screenshots of the tester build are confidential until we launch publicly. Please do not post them publicly.
- **Access codes.** Your tester access code is for you and your business only. Do not share it. After five wrong attempts the code is locked and you are emailed.

## 3. Your account

- **Owner account.** The person who signs up is the account owner and is responsible for everything done under the business's workspace, including by team members and crew.
- **Team members and crew.** You may add team members (office staff with admin access) and crew (employees who use the employee app). You are responsible for giving them access only to what they need, for removing access when they leave, and for their conduct in the Service.
- **Credentials.** Keep passwords, QR onboarding links and calendar feed links private. Tell us at once if you think an account has been compromised. You can sign out other devices from Settings.
- **Accuracy.** Keep your business details (legal name, ABN, address, contact details, bank details) accurate. They are printed on the quotes, invoices and reports you send.
- **Age.** You must be at least 18 to create an account. Crew members must be at least 15 and added by their employer.

## 4. Your data and your clients' data

- **You own your data.** Everything you enter or upload (clients, leads, quotes, invoices, projects, photos, timesheets, staff records, messages) stays yours. We only use it to run the Service for you, as described in section 5.
- **Each business is separate.** Your workspace is isolated from every other business on Paint Trade HQ. Nobody outside your workspace can see your data, and you cannot see theirs.
- **You are responsible for the people in your records.** You confirm that you have the right to enter your clients', leads' and staff members' details, and that you will handle their personal information lawfully, including under the *Privacy Act 1988 (Cth)* where it applies to you. You are the party they should contact about their information; we act on your instructions.
- **Messages you send.** SMS and email sent through the Service (including automated follow-ups, reminders and review requests) are sent by you, in your name. You must comply with the *Spam Act 2003 (Cth)*: only message people who have agreed to hear from you or with whom you have a business relationship, identify your business, and honour opt-outs. The Service stops automated messages to a client who replies STOP or is marked opted-out; you must not work around that.
- **Photos and documents.** You must have permission to photograph a client's property and to upload staff documents (licences, IDs, contracts).

## 5. How we treat your personal data

We do not sell, trade, or otherwise rent your personal data to third parties for commercial or marketing purposes. We may collect and retain your usage data and interaction history to maintain, protect, and improve our services, such as debugging system errors, analysing performance trends, and developing new features. Wherever feasible, data used for these internal optimization purposes is anonymized or aggregated. We reserve the right to disclose your personal information or data if we are strictly required to do so by law, court order, subpoena, or a valid legal request from law enforcement authorities. We will only disclose the specific data that is legally mandated, and we make every effort to verify the legitimacy of any such government or police request before releasing any information.

## 6. Quotes, invoices, payments and contracts

- **We are a tool, not a party.** Quotes, variations, invoices, credit notes, completion reports and contracts are your documents to your clients. You set the prices, terms, warranty and tax treatment. We do not check them.
- **Tax.** You are responsible for GST, invoice requirements under Australian tax law, and keeping records for the ATO.
- **Client acceptance.** When a client accepts a quote or approves a variation through their link, the Service records who accepted, when, and from which address. Whether that acceptance is binding between you and your client is a matter for you and them.
- **Payments.** Your clients pay you directly by bank transfer using the bank details printed on your invoices, or by any other method you record (cash, card in person, cheque). The Service does not take payments from your clients and never holds card details. Payments you record are your record only.
- **Library prices and AI price suggestions** are starting points. Check them before you rely on them.

## 7. Integrations you connect

You may connect Google Drive or Microsoft OneDrive for file storage, Google Calendar, Apple Calendar (iCloud) or Microsoft 365 (Outlook) calendar, Gmail, Microsoft 365 or IMAP email, and Twilio for SMS. Each is governed by its provider's terms. We access them only for the purpose you connected them for (for example, storing photos in your Drive, showing your calendar, sending and receiving messages) and you can disconnect them at any time in Settings. We are not responsible for changes, outages or charges from those providers.

## 8. AI features

Some features use an AI model from Anthropic (Claude): the assistant ("Lucy"), the morning brief, client summaries and drafting text for messages and quotes. AI output can be wrong, incomplete or out of date. It is a draft for you to check, not advice. Do not send AI output to a client or staff member without reading it. Do not rely on it for legal, tax, safety or employment decisions. AI features only see your own workspace's data, and the assistant keeps only the reminders and ideas you give it. Crew members have no AI features.

## 9. Acceptable use

You must not:

- use the Service for anything unlawful, or to send spam, threats or misleading messages;
- upload malware, or try to access another business's workspace, our systems or other users' accounts;
- copy, resell, reverse-engineer or build a competing product from the Service;
- remove branding, notices or watermarks;
- use automated tools to scrape or overload the Service;
- enter personal information about anyone you do not have a lawful reason to hold.

We may suspend or remove content or accounts that break these rules. We will tell you why unless the law prevents it.

## 10. Availability, backups and support

We aim to keep the Service running but do not promise any uptime during the tester program. We take regular backups for our own recovery, but those are not a substitute for your own copies (see section 2). Support is by email at software@joshsano.com.au during Australian business hours; response times are best-effort.

## 11. Ending your account and getting your data out

- **You can leave any time.** Ask us to close the account, or stop using it.
- **Export.** While your account is open you can download your quotes, invoices, credit notes, reports and signed documents as PDF, and your daily reports, timesheets and sign-in records as CSV. Ask us if you need a full export.
- **Deletion.** After an account is closed we keep its data for 30 days so you can change your mind, then delete it from our live systems. Backups are overwritten within a further 60 days. We may keep records we must keep by law.
- **We may close an account** for breach of these terms, if it is unused for 12 months, or if we shut the Service down. We will give at least 30 days' notice where we can, so you can export your data.

## 12. Intellectual property

We own the Service, its design, code, templates and the Paint Trade HQ name and logo. You get a non-exclusive, non-transferable licence to use the Service for your business while your account is open. You keep ownership of your data and of documents you create with the Service. You give us a licence to store, copy and transmit your data only as needed to run the Service for you.

## 13. Indemnity

You indemnify us against claims, losses and costs arising from your breach of these terms, your unlawful use of the Service, or documents and messages you send to clients or staff, except to the extent we caused the loss.

## 14. Changes to the Service or these terms

We may change the Service at any time. We may change these terms by posting a new version and, for changes that reduce your rights, emailing account owners at least 14 days before they take effect. You will be asked to agree to the new version the next time you sign in. The current version and its date are always shown at the top of this page.

## 15. General

These terms are governed by the laws of Victoria, Australia, and the courts of that state. If any part is unenforceable, the rest still applies. Our failure to enforce a right is not a waiver. You may not assign these terms without our consent; we may assign them to a successor of the business. Notices to you go to the account owner's email. Notices to us go to software@joshsano.com.au.

## 16. Contact

Josh Sano Painting and Decorating, trading as Paint Trade HQ · Melbourne, Victoria · software@joshsano.com.au

© 2026 Josh Sano Painting and Decorating, trading as Paint Trade HQ. All rights reserved.
=====

2. Privacy Policy off the agreement. `frontend/app/privacy.tsx` redirects to `/terms#5-how-we-treat-your-personal-data` (the heading's slug under `legalMd.slug`). `GET /api/public/legal/privacy` stays as it is. The legal page header shows the Terms link only; its footer reads "Terms · Contact". The Privacy Policy links go from the sign-up agreement sentence, the login footer and the welcome footer's Legal group. `privacy.md` stays in the repo untouched.

3. Sign-up: the Terms provided, then agreed. Above the agreement row, a quiet box in the look of the password-rules box, headed "Testing at your own risk", with section 1's paragraph verbatim (the one starting "Paint Trade HQ is currently free…"), then a link "Read the full Terms of Service" opening /terms in a new tab. The checkbox sentence becomes "I agree to the Terms of Service, and I understand this is a test program: keep a copy of anything important." Unticked by default, required, as today. The record stays as today (`terms_version` from the document, `terms_version_shown`, `terms_accepted_at`, `terms_accepted_ip`). Test ids: `signup-terms-box`, `signup-terms-link`, `signup-agree` (unchanged).

4. Existing accounts. `LegalBanner.tsx`: text "We've updated our Terms of Service. Read the changes", button "I agree" (same `legal-banner-dismiss` test id, same `POST /api/legal/accept`). The `?banner=1` copy on the legal page matches. Shown while `needs_notice` is true, i.e. until the click; no backfill of `terms_version` on existing accounts.

5. Copyright line, one constant, the same words in three places: "© 2026 Josh Sano Painting and Decorating, trading as Paint Trade HQ". Legal page footer: at the left of the version line. Login footer: "… · Built in Australia · © 2026 … · Terms of Service". Welcome footer: it replaces "© 2026 Paint Trade HQ." in "© 2026 Paint Trade HQ. Revolutionising the trade."

6. Tests. `test_r17c_legal.py` stops asserting a literal version: it reads `GET /api/public/legal/terms` and compares the sign-up and acceptance records against that. New checks: the Terms body has the sentence "Paint Trade HQ is currently free and is being tested by you at your own risk" and the sentence "We do not sell, trade, or otherwise rent your personal data", and no heading contains "Fees and plans"; `/privacy` answers with the redirect; the sign-up page shows `signup-terms-box`. `tests/seed.py` uses the document's version too.

7. Not touched: anything under `app/employee/*`; the client-contract terms and acceptance; the Privacy Policy text; the Billing page; everything else.

8. Verify at 1440, then 1024, then 390: (1) /terms: sixteen sections in the file's order, section 1 is the at-your-own-risk text, no "Fees and plans" heading, the contents list and scroll-spy work, version 1.2 with no pill and no yellow notice, the © line in the footer, print hides the header and contents. (2) /privacy lands on the Terms' section 5. (3) Sign-up: the box with section 1 verbatim and the link; the agreement sentence without "Privacy Policy"; Create account refused until ticked; a TS_ sign-up records the document's version, the time and the IP. (4) An account whose `terms_version` is 1.1-draft sees the banner once on the dashboard with "I agree"; the click records the new version, time and IP; the banner is gone on the next load; an account already on 1.2 never sees it. (5) Login and welcome footers: Terms link, © line, no Privacy link. (6) `test_r17c_legal.py` green; `test_tenant_isolation.py` green; the suite before and after. (7) Nothing else changed.

9. What's new — Draft n 23 "Our Terms, reviewed", never published: one card: "We've updated our Terms of Service after a legal review for the tester program. They are shorter and plainer: Paint Trade HQ is free while it is being tested, you use it at your own risk, and we never sell your data. You'll see a one-line note on your next sign-in — one click to agree."

Rules as always: TS_ test rows only, torn down; the owner's real tenant read-only; no publish; nothing from the suggestion list; no notices or banners beyond the one above; never print a secret. Report in `memory/reports/round82-terms-report.md`, starting "Round 82 done": the version shown on /terms, the sign-up box and record check, the banner check on an older account, the three © lines, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

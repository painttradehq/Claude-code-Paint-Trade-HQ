# Round 82 — Terms of Service 1.2 after the legal review (the Round 66 rerun) — BUILT 22 Oct (sent with the Terms text inside the message, `round82-message.md`; report `memory/reports/round82-terms-report.md`; agent iteration 164 at 1440/1024/390; suite exit 0; draft n 23; two small extras by Emergent: a compact login footer at 390 where there was none, and the legal page now scrolls to a fragment once it has rendered)

The lawyer's advice came back on 21 October 2026 in an email, not as a document (`lawyer/06-advice-2026-10-21.md`). This round puts it into the app: the amended Terms, the Terms shown and agreed at sign-up, the same click from the testers already in, and the copyright line. Nothing else changes. No prototype is needed: the pages exist (Round 17c, Round 66) and the changes are text, one box on the sign-up page and one button label.

## 1. What the lawyer said (in one breath)

For the testing phase, provide **only the Terms of Service**, amended in three places, on the premise that the app is free, data is not traded and users are clearly told they use it at their own risk — for example by showing the Terms at sign-up. Require an **"I agree" click**. The three amendments: remove the fees section; replace the warranties section with the lawyer's "at your own risk" text and make it **section 1**; add a section saying **we do not sell your data**. Mark the app and the Terms with **© + the legal entity name**. The Privacy Policy, the fees/subscription terms, the client-contract and employment questions wait for launch (paid work: $220 / $350 an hour inc GST). Outside the app: lodge the trade mark, put an IP clause in the contractor agreement, keep the evidence of authorship.

## 2. Josh decides / supplies before the send

**Josh, 22 Oct: 1 → A, 2 → A; 3 → the name is "Paint Trade HQ" (not registered yet, so no ABN), address "Melbourne, Victoria", no support email yet (so support and notices both go to software@joshsano.com.au), legal email software@joshsano.com.au, governing law Victoria; 4 → "© 2026 Paint Trade HQ".** All square brackets are filled, so the file is **version 1.2**, no draft pill, no yellow notice. The spec below is written for A/A; the "if B" lines and §4.6 no longer apply. Flagged: the lawyer asked for the *legal entity* name; "Paint Trade HQ" is the brand and has no registration. **Josh: "ok tidy up and send" → the switch applied**: the party is "Josh Sano Painting and Decorating, trading as Paint Trade HQ" (the name Josh gave the lawyer), in the intro, §16 and the © line. No ABN is printed until Josh confirms which one; adding "(ABN …)" later is a contact-detail fix that does not change the version (so no second "I agree").

| # | Question | Options | Recommended |
|---|---|---|---|
| 1 | **The Privacy Policy during testing** | **A** — follow the lawyer: the Terms are the only policy. The Privacy Policy links come off sign-up, login and the welcome page; `/privacy` sends people to the Terms' data section; the Terms no longer refer to a Privacy Policy. The 1.1-draft stays in the repo for the launch review. **B** — keep `/privacy` and its links as they are today (draft pill, unreviewed) next to the reviewed Terms. | **A** (it is what the advice says; an unreviewed policy makes promises — 30-day deletion, overseas disclosure — that are not checked yet). Note for launch: Google's consent screen needs a privacy policy link once it leaves Testing, and Stripe-paying customers need one too — both launch-phase. |
| 2 | **The testers already signed up** (they accepted 1.1-draft) | **A** — the existing one-time dashboard banner, with its text "We've updated our Terms of Service. Read the changes" and its button renamed **I agree** (the click records the acceptance, as Dismiss does today); it returns on every sign-in until clicked. **B** — a blocking "I agree" page on the next sign-in, nothing else usable until clicked. | **A** (one click, no new screen, no blocking). The lawyer's word is "requiring" — B is the strict reading; say so if you want it. |
| 3 | **The six square-bracket values** | Legal entity name (you told the lawyer "Josh Sano Painting and Decorating" — the exact registered name, as on your ABN record); ABN (the painttradehq.com.au registration was made under **54 643 772 041** — confirm it is this entity's ABN); registered address; support email; legal email; the governing-law state (the draft says Victoria). | Give the six values and the version becomes **1.2** with no "draft" pill or yellow notice. Without them the file goes in as **1.2-draft** and the pill's text must change to "Draft — details still to fill in" (today it says "not yet reviewed by a lawyer", which would be false). |
| 4 | **The copyright line** | "© 2026 [Legal entity name]. All rights reserved." in the Terms and on the legal pages, login and welcome footers. | Same entity name as #3; the year is the current year. |

## 3. The Terms 1.2 — `terms-of-service.md` (the file Josh uploads with "here")

Changes against the 1.1-draft that is in the app today (`backend/content/legal/terms.md` since Round 66):

1. Header: "Reviewed for the tester program · Version 1.2[-draft] · <date>"; the notice line names the legal advice of 21 October and keeps the square-bracket rule.
2. Intro: the definitions gain "the developers" and "the app" so the lawyer's text (which uses those words) reads as part of the same contract; "and to our Privacy Policy" removed (decision 1A).
3. **New §1 "Testing at your own risk — no warranty"** — the lawyer's text verbatim. The heading is mine (the lawyer gave text, not a heading).
4. **Old §12 "Warranties and liability" removed** (replaced by §1, as instructed — the AUD 100 cap, the ACL sentence and the third-party line go with it).
5. **Old §8 "Fees and plans (after the tester program)" removed.**
6. **New §5 "How we treat your personal data"** — the lawyer's text verbatim, placed after "Your data and your clients' data". Heading mine.
7. §4 (was §3): "as described in the Privacy Policy" → "as described in section 5"; the sentence "See the Privacy Policy for how photos are stored and shared" dropped (decision 1A).
8. §10 (was §9): "see section 1" → "see section 2" (the keep-your-own-copies bullet moved).
9. §11 (was §10): "(for example tax records of payments made to us)" dropped — nobody pays us during testing.
10. §14 (was §14): "Continuing to use the Service after that date means you accept the new terms" → "You will be asked to agree to the new version the next time you sign in" (matches the "I agree" click the lawyer asked for).
11. §16 Contact reads "Josh Sano Painting and Decorating, trading as Paint Trade HQ · Melbourne, Victoria · software@joshsano.com.au" and gains the line "© 2026 Josh Sano Painting and Decorating, trading as Paint Trade HQ. All rights reserved."; the intro names the same party, of Melbourne, Victoria (no ABN printed yet); support and notices both go to software@joshsano.com.au; governing law Victoria.
12. Everything else is the 1.1-draft text, renumbered: 1 Testing at your own risk · 2 The tester program · 3 Your account · 4 Your data and your clients' data · 5 How we treat your personal data · 6 Quotes, invoices, payments and contracts · 7 Integrations · 8 AI features · 9 Acceptable use · 10 Availability, backups and support · 11 Ending your account · 12 Intellectual property · 13 Indemnity · 14 Changes · 15 General · 16 Contact. Still sixteen sections, so the footer's Contact anchor (`#16-contact`) is unchanged.

If decision 1 is **B**, items 2 and 7 are reversed (the Privacy Policy words come back) — tell me and I re-cut the file before the send.

## 4. The app changes (Emergent)

1. **Terms file.** `backend/content/legal/terms.md` ← `terms-of-service.md` verbatim; a copy to `memory/specs/legal/`. The version and date are read from the header as today (`routes/legal.py`); nothing hard-coded.
2. **Privacy (decision 1A).** `frontend/app/privacy.tsx` redirects to `/terms#5-how-we-treat-your-personal-data` (the heading's slug under `legalMd.slug`). `GET /api/public/legal/privacy` stays as it is (unused). The legal page header shows the Terms link only; its footer reads "Terms · Contact". The Privacy Policy links go from the sign-up agreement sentence, the login footer and the welcome footer's Legal group. `privacy.md` stays in the repo untouched.
3. **Sign-up: the Terms provided, then agreed.** Above the agreement row, a quiet box (the look of the password-rules box) headed **Testing at your own risk** with §1's text verbatim, then a link "Read the full Terms of Service" opening `/terms` in a new tab. The checkbox sentence becomes "I agree to the Terms of Service, and I understand this is a test program: keep a copy of anything important." Unticked by default, required, as today. The record stays as today: `terms_version` (from the document), `terms_version_shown`, `terms_accepted_at`, `terms_accepted_ip`. Test ids: `signup-terms-box`, `signup-terms-link`, `signup-agree` (unchanged).
4. **Existing accounts (decision 2A).** `LegalBanner.tsx`: text "We've updated our Terms of Service. Read the changes", button **I agree** (same `legal-banner-dismiss` test id, same `POST /api/legal/accept`). The `?banner=1` copy on the legal page matches. Shown while `needs_notice` is true, i.e. until the click; **no backfill** of `terms_version` on existing accounts.
5. **Copyright line**, one constant, the same words in three places: "© 2026 Josh Sano Painting and Decorating, trading as Paint Trade HQ". Legal page footer: at the left of the version line. Login footer: "… · Built in Australia · © 2026 … · Terms of Service". Welcome footer: replaces "© 2026 Paint Trade HQ." in "© 2026 Paint Trade HQ. Revolutionising the trade."
6. **Draft pill:** nothing to do — the file is version 1.2 with no square brackets, so the pill, the yellow notice and the placeholder highlight do not appear.
7. **Tests.** `test_r17c_legal.py` stops asserting a literal version: it reads `GET /api/public/legal/terms` and compares sign-up and acceptance records against that. New checks: the Terms body has the §1 sentence "Paint Trade HQ is currently free and is being tested by you at your own risk" and the §5 sentence "We do not sell, trade, or otherwise rent your personal data", and no heading contains "Fees and plans"; `/privacy` answers with the redirect (1A); the sign-up page shows `signup-terms-box`. `seed.py` uses the document's version too.
8. **Not touched:** anything under `app/employee/*` (crew onboarding's `agreed_to_terms` flag and its hard-coded "Josh Sano Painting & Decorating — Employment Agreement" text are the crew chat's, and the lawyer deferred the employment questions to launch); the client-contract terms and acceptance (pack 03); the Privacy Policy text; the Billing page.

## 5. Verify (1440, then 1024, then 390)

1. `/terms`: sixteen sections in the §3.12 order; §1 is the at-your-own-risk text; no "Fees and plans" heading; the contents list and scroll-spy work; version 1.2 with no pill and no yellow notice (or 1.2-draft with the renamed pill); the © line in the footer; print hides the header and contents.
2. `/privacy` lands on the Terms' section 5 (1A).
3. Sign-up: the Testing at your own risk box with §1 verbatim and the link; the agreement sentence without "Privacy Policy"; Create account refused until ticked; a TS_ sign-up records the document's version, the time and the IP.
4. An account whose `terms_version` is 1.1-draft sees the banner once on the dashboard with **I agree**; the click records the new version, time and IP; the banner is gone on the next load; an account already on the new version never sees it.
5. Login and welcome footers: Terms link, © line, no Privacy link (1A).
6. `test_r17c_legal.py` green; `test_tenant_isolation.py` green; the suite before and after.
7. Nothing else changed: the Billing page, the crew app, the contracts feature untouched.

## 6. Not in this round, and whose

- **Launch-phase legal work** (the lawyer, $220 / $350 an hour inc GST, before the first paid subscription): the Privacy Policy (`privacy-policy.md` 1.1-draft as the starting point); the fees and subscription terms (the removed §8 text is the starting point: AUD, GST on top, monthly, Stripe, cancel any time, 30-day price-change notice, ACL refunds); the client-contract questions (pack 03); the employment-document questions (04); crew members accepting anything from us.
- **Josh, outside the code:** trade mark for "Paint Trade HQ" and the logo with IP Australia; the IP / confidentiality clause in Adam's contractor agreement; keep the authorship records (the round logs and specs already are that record).
- **Crew chat:** the hard-coded "Josh Sano Painting & Decorating" text in the crew onboarding (welcome, culture and the "Employment Agreement" heading) should read the business's own name; the `agreed_to_terms` flag set without showing anything (lawyer pack 04 §5) stays until the lawyer's launch advice.

## 7. Billing and these Terms — the sequencing to keep in view

The reviewed Terms say the app is free. The lawyer's premise, and the reason the policies could wait, is that nobody pays. Round 80 is built and the published app can take live Stripe keys, but **nobody should be charged under these Terms**. Until the launch-phase Terms and Privacy Policy are in: sign-up stays invite-only, testers stay on the tester pass-through, and no account is moved to a paid plan. A tester who opened Settings › Billing and chose a plan with live keys in would be charged under Terms that say the app is free — so either the live keys wait for the launch Terms, or the plan-choice buttons stay off for tester accounts (a small change — say which, if either). The old §8 fees text is kept in `lawyer/01-terms-of-service-draft.md` for the lawyer to finish.

## 8. What's new — Draft n 23 "Our Terms, reviewed" (never published by Emergent)

One card: "We've updated our Terms of Service after a legal review for the tester program. They are shorter and plainer: Paint Trade HQ is free while it is being tested, you use it at your own risk, and we never sell your data. You'll see a one-line note on your next sign-in — one click to agree."

## 9. Report

`memory/reports/round82-terms-report.md`, starting "Round 82 done": the version shown on `/terms`, the sign-up box and record check, the banner check on an older account, the three © lines, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

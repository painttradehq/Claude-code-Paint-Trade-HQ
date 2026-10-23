# Admin side — what is left to build (updated 21 October)

Everything the admin chat has specced so far is built, except the items below. Order is a suggestion; Josh decides. One round at a time across both chats.

## Ready now (a spec exists, waits for a word)

| Item | What it is | Needs from Josh |
|---|---|---|
| **Contracts by email only** (`contracts-email-only.md`) | The signed contract PDF is attached to both the crew's and the owner's email (today the crew email says "Attached" and attaches nothing); the PDF stops being stored as text in the record and is rendered on request. | One word: yes/no. Then "send". |
| **Fix Round G** | The fixes found by the check rounds (`admin-check-rounds.md`), plus what is already known: the help bubble covering the builder's bottom line at 1024; the four open questions (admin shell bouncing `/terms` and `/privacy`; Timesheets drawer "General" shown as "On site"; what the dashboard lost with the sign-in widget; the job drawer's crew-notes toggle). | Run Check 1–7, send the findings here. |

## Needs a prototype first

| Item | What it is | Needs from Josh |
|---|---|---|

## From the security audit (21 October, run by Josh in Emergent)

- **Verdict CONDITIONAL PASS**, no critical or high. Applied by Emergent at Josh's "what you recommend": password hashes no longer logged; `/api/docs`, `/api/redoc`, `/api/openapi.json` off unless `API_DOCS=on`; the four temporary `/api/design-*` static mounts and their paywall exemptions removed. Full suite green. Not published.
- **Left for a later round (Josh):** the SSRF guard — the AI price-refresh job fetches any URL an admin saves, including internal and cloud-metadata addresses. Fix: allow only http/https, block private, loopback and metadata addresses (re-checked on redirects), short timeout, size cap. Belongs in Fix Round G.
- Suggestions not taken (Emergent's list, parked): tenant-checked or short-lived links for private media served by id; a "Trialling · n days left" pill; splitting the big AI functions.

## Built on preview, waiting for your publish (21 October)

- **Round 78 + 78b** — contracts by email with the PDF in your storage; the signed contract listed on the Documents card.
- **Round 74** — presentation pages as a block builder with Reviews & ratings (eleven platforms), reconciled against the prototypes.
- **Round 79 (admin half)** — Settings › Crew app, the crew routes, the time-clock rule, the Timesheets gear pointing at the one distance. The crew half (§4 of the notes) is the crew chat's next round.
- **Round 80 — Billing** (the Stripe flows wait for the test key) and **Round 81 — Pay and hours**.
- Code review pass (21 Oct): a circular-import leaf, a latent `long_date` bug in the tester sign-up notice, test fixtures without literal secrets.
- What's new drafts n 18 to n 22 wait with them (`platform-steps.md` §1).

| **Round 81 — Pay and hours** (`pay-and-hours-notes.md`, prototypes `settings-pay-hours.html` + `employee-pay-rates.html`) | (1) An Overtime rate field beside Hourly rate on the employee page and the Add dialog, and one money rule everywhere (the This week card's hidden 1.5 ×, the project labour cost, the payroll CSV). (2) Settings › Business › Operating hours (7:00 am – 4:00 pm, working days) + two reminder switches on the Crew app page + a backend job that writes the sign-in / sign-out reminders (push when C7 lands). | **BUILT 21–22 Oct** (agent 156; the overtime split corrected 22 Oct: 9,9,8,9,7 → 38/4, 10×5 → 38/12, locked weeks untouched; suite green). |

## Ready to send

| Item | What it is | Waits for |
|---|---|---|
| **Round 83 — Fix Round G** (`fix-round-g-notes.md`; the items explained in `fix-round-g-open-items.md`) | Nine small fixes, no prototypes: the Terms link guard; "General" in the Timesheets drawer; the help bubble at 1024; the Billing page's "Plans open at launch" state while Stripe is unconfigured; replies to a painter's emails reaching the painter; the SSRF guard from the security audit; the two display items Emergent noticed. Items 3 and 4 need no work. | **BUILT 22 Oct** (agent 165; suite 189 s exit 0; tsc clean; draft n 24 "Little fixes, October"). Item 1 no change needed; 2, 5, 6, 7, 8, 9 done. Waits for publish. |

## Needs something to arrive first

| Item | What it is | Waits for |
|---|---|---|
| **Round 82 — Terms 1.2 after the legal review** (the Round 66 rerun; `legal-terms-notes.md`, file `terms-of-service.md`, the advice in `lawyer/06-advice-2026-10-21.md`) | The lawyer's three amendments (fees section out, "at your own risk" text as section 1, "we do not sell your data" section in); the Terms shown and agreed at sign-up; the "I agree" click from existing testers; the © + entity line. The Privacy Policy, fees and contract texts are launch-phase (paid) work. The hard-coded Sano onboarding text is the crew chat's. **BUILT 22 Oct** (agent 164 at 1440/1024/390; suite exit 0, 187 s; tsc clean; draft n 23 "Our Terms, reviewed"): /terms 1.2 with sixteen sections and no pill; /privacy → the Terms' §5; the sign-up box + shortened agree sentence; the banner's "I agree" recorded 1.2 on an older account; the © line on the legal, login and welcome footers. Party "Josh Sano Painting and Decorating, trading as Paint Trade HQ"; ABN to be added when confirmed (no version change). Waits for publish with the others. |
| **Round 80 — Billing** (`billing-page-notes.md`, prototype `settings-billing.html`; background `pricing.md`, `billing-round-explore.md`) | Your plans in the app: Settings › Billing on Stripe with Dashboard free, Starter 59, Middle 179, Pro 249, extra admin 25/25/42, extra employee 15/15/25; seat counting against the included admins and employees; the Starter-off switches (live project page, project details, Timesheets, CRM); the Pro-only pages. **Parked 21 Oct:** the Account page's Manage billing row becomes a **Manage billing page** in Settings — three plan cards explained like a pricing website, the current plan highlighted, change plan / cancel / invoices (`billing-round-explore.md` §6). The decision is recorded; nothing in the app follows it yet. | **BUILT and Stripe-tested 21–22 Oct** (agents 155, 157, 159, 160; §6 complete; the cron; every billing flow green on the sandbox; GST on top). **Round 80 complete 22 Oct**: the no-plan Account-page allowlist done (reads allowed, writes 402; owner and member tests), plus the connect-reason lines on the Drive, Calendar and Xero cards (`why=` on the bounce, `last_error` kept); suite exit 0 (169 s), tsc clean. Live needs the two live keys in the published variables (`platform-steps.md` §2) — **but read `legal-terms-notes.md` §7 first: nobody may be charged under the testing-phase Terms.** |
| **Launch pieces** (`pricing.md` §51) | Marketing pages and the deck (A15), the launch What's new, and the **launch-phase legal review** (the lawyer, $220 / $350 an hour inc GST): Privacy Policy, the fees and subscription terms, client-contract and employment questions — needed before the first paid subscription (`legal-terms-notes.md` §7). | A launch date. |
| **Parked from the old list** | A12 the 30-day purge of personal data after employment ends; A13 in-app learning (the Help hub content is Adam's). | Say if either should come back. |

## On hold by your call (specs exist)

- **Round 77 — Dashboard home diet** (`dashboard-diet-notes.md`): the dashboard from about 5 s to under 1 s on production.
- **Photo move on the live app**: Check storage → dry run → data export → Apply, from the Storage tab (built in 75b).
- **Database to the app's region** (support, Option 1) and **two workers per pod** (support).

## Yours, outside the code

Published 22 Oct (Rounds 74–82 live). Left: publish the What's new drafts 18–23 when you want users to see them (`platform-steps.md` §1); `RESEND_FROM` on the published app + the live test email (§3); the ABN for the Terms (one line, no version change); send the lawyer the drafted reply (in your Gmail drafts); the trade mark and Adam's IP clause; the launch-phase legal review before any paid subscription; Save to GitHub. Done 22 Oct: Drive connected as painting@ and proven with photos; the old Google secret deleted; the unused Resend domain removed; Stripe live keys parked until the launch Terms (your "do what you recommend"). Not now: Xero, Microsoft.

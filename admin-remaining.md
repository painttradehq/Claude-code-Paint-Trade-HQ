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

## Built on preview, waiting for your publish (21 October)

- **Round 78 + 78b** — contracts by email with the PDF in your storage; the signed contract listed on the Documents card.
- **Round 74** — presentation pages as a block builder with Reviews & ratings (eleven platforms), reconciled against the prototypes.
- **Round 79 (admin half)** — Settings › Crew app, the crew routes, the time-clock rule, the Timesheets gear pointing at the one distance. The crew half (§4 of the notes) is the crew chat's next round.
- What's new drafts n 18, n 19, n 20 wait with them (`platform-steps.md` §1).

| **Pay and hours** (`pay-and-hours-notes.md`, parked 21 Oct) | (1) An Overtime rate field beside Hourly rate on the employee page and the Add dialog, and one money rule everywhere (the This week card's hidden 1.5 ×, the project labour cost, the payroll CSV). (2) Settings › Business › Operating hours (7:00 am – 4:00 pm, working days) + two reminder switches on the Crew app page + a backend job that writes the sign-in / sign-out reminders (push when C7 lands). | Five one-line answers in the note (blank overtime rate; project cost; who gets the morning reminder; where the section sits; one round or Fix G). Then a small prototype on the Business page, the Crew app page and the employee card. |

## Needs something to arrive first

| Item | What it is | Waits for |
|---|---|---|
| **Round 66 rerun — legal pages** | The lawyer's returned Terms, Privacy and contract text into the app, plus the hard-coded Sano agreement text found earlier. | The lawyer. |
| **Round 80 — Billing** (`billing-page-notes.md`, prototype `settings-billing.html`; background `pricing.md`, `billing-round-explore.md`) | Your plans in the app: Settings › Billing on Stripe with Dashboard free, Starter 59, Middle 179, Pro 249, extra admin 25/25/42, extra employee 15/15/25; seat counting against the included admins and employees; the Starter-off switches (live project page, project details, Timesheets, CRM); the Pro-only pages. **Parked 21 Oct:** the Account page's Manage billing row becomes a **Manage billing page** in Settings — three plan cards explained like a pricing website, the current plan highlighted, change plan / cancel / invoices (`billing-round-explore.md` §6). The decision is recorded; nothing in the app follows it yet. | **SENT 21 Oct** (Josh: "send"). Emergent creates the seven Stripe prices itself only if the preview key is test-mode; otherwise the Stripe flows wait for the ids (`platform-steps.md` §6). GST still open (§8.5). The crew chat's half of Round 79 queues behind it. |
| **Launch pieces** (`pricing.md` §51) | Marketing pages and the deck (A15), the launch What's new, the Terms fee section when the lawyer's text comes back. | A launch date. |
| **Parked from the old list** | A12 the 30-day purge of personal data after employment ends; A13 in-app learning (the Help hub content is Adam's). | Say if either should come back. |

## On hold by your call (specs exist)

- **Round 77 — Dashboard home diet** (`dashboard-diet-notes.md`): the dashboard from about 5 s to under 1 s on production.
- **Photo move on the live app**: Check storage → dry run → data export → Apply, from the Storage tab (built in 75b).
- **Database to the app's region** (support, Option 1) and **two workers per pod** (support).

## Yours, outside the code

Publish (76 + 75b + 72 now); publish the six What's new drafts when you want users to see them; verify `painttradehq.com.au` in Resend; Google OAuth redirect URIs on the real domain and the client-secret reset; connect Drive on production; the Xero developer app; Save to GitHub after each publish.

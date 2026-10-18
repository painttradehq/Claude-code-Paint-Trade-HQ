# Admin side — what is left to build (17 October)

Everything the admin chat has specced so far is built, except the items below. Order is a suggestion; Josh decides. One round at a time across both chats.

## Ready now (a spec exists, waits for a word)

| Item | What it is | Needs from Josh |
|---|---|---|
| **Contracts by email only** (`contracts-email-only.md`) | The signed contract PDF is attached to both the crew's and the owner's email (today the crew email says "Attached" and attaches nothing); the PDF stops being stored as text in the record and is rendered on request. | One word: yes/no. Then "send". |
| **Fix Round G** | The fixes found by the check rounds (`admin-check-rounds.md`), plus what is already known: the help bubble covering the builder's bottom line at 1024; the four open questions (admin shell bouncing `/terms` and `/privacy`; Timesheets drawer "General" shown as "On site"; what the dashboard lost with the sign-in widget; the job drawer's crew-notes toggle). | Run Check 1–7, send the findings here. |

## Needs a prototype first

| Item | What it is | Needs from Josh |
|---|---|---|
| **Round 79 — Settings › Crew app** (`crew-app-settings-notes.md`, prototype `settings-crew-app.html`) | The admin page for the crew app: welcome video and note with a phone preview, which crew features are on, the sign-in distance (50 m, min 30, flag or refuse; moved here from the Timesheets gear), push choices; the record, routes and video stream the crew chat reads. Invites stay on the Employees page. | Answer the two questions, then "send 79" (after Round 74 is done). |
| **Round 74 — Presentation pages** | Your words: "one or two pages with large photo areas, if the user wants", instead of today's small section; presentation on by default for new quotes; the public quote page shows the presentation pages (today only the PDF does). | "prototype 74" → review → "send". |

## Needs something to arrive first

| Item | What it is | Waits for |
|---|---|---|
| **Round 66 rerun — legal pages** | The lawyer's returned Terms, Privacy and contract text into the app, plus the hard-coded Sano agreement text found earlier. | The lawyer. |
| **Billing round** (`pricing.md` §49) | Your plans in the app: Settings › Billing on Stripe with Dashboard free, Starter 59, Middle 179, Pro 249, extra admin 25/25/42, extra employee 15/15/25; seat counting against the included admins and employees; the Starter-off switches (live project page, project details, Timesheets, CRM); the Pro-only pages. The decision is recorded; nothing in the app follows it yet. | Your "spec the billing round"; Check 3 tells us what the billing page does today. |
| **Launch pieces** (`pricing.md` §51) | Marketing pages and the deck (A15), the launch What's new, the Terms fee section when the lawyer's text comes back. | A launch date. |
| **Parked from the old list** | A12 the 30-day purge of personal data after employment ends; A13 in-app learning (the Help hub content is Adam's). | Say if either should come back. |

## On hold by your call (specs exist)

- **Round 77 — Dashboard home diet** (`dashboard-diet-notes.md`): the dashboard from about 5 s to under 1 s on production.
- **Photo move on the live app**: Check storage → dry run → data export → Apply, from the Storage tab (built in 75b).
- **Database to the app's region** (support, Option 1) and **two workers per pod** (support).

## Yours, outside the code

Publish (76 + 75b + 72 now); publish the six What's new drafts when you want users to see them; verify `painttradehq.com.au` in Resend; Google OAuth redirect URIs on the real domain and the client-secret reset; connect Drive on production; the Xero developer app; Save to GitHub after each publish.

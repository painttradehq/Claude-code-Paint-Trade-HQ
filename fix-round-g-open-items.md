# Fix Round G — the open items explained (17 October)

Josh: "need to go through these to explore because I can't remember them." Each one: what it is, what I found, the options, my pick. Answer with the number and a letter. These join whatever the check rounds (`admin-check-rounds.md`) find.

## 1. The admin shell bounces links to Terms and Privacy

**What.** Inside the admin app, the links to the Terms and Privacy pages (`/terms`, `/privacy`) do not open: the admin layout's sign-in guard (`app/admin/_layout.tsx`) sends any pushed route that is not under `/admin` back to the dashboard. The crew chat hit the same wall when the admin sign-in's "Crew? Sign in here" link had to use a replace instead of a push.

**Options.** (a) The guard allows `/terms`, `/privacy` and `/crew` through. (b) Those links open in a new tab.
**My pick:** a.

## 2. Timesheets drawer shows "General" as "On site"

**What.** A time entry with no job ("General" time) is labelled "On site" in the Timesheets drawer, because the drawer's label map has no word for the general kind and falls through to the on-site label. A wrong word, not wrong hours.

**Options.** (a) Label it "General". (b) Label it "No job".
**My pick:** a. Check 4 confirms it is still there on the live app.

## 3. What the dashboard lost with the sign-in widget

**What.** Round C3 (crew time clock) deleted `components/SignInOutWidget.tsx`. It was the old clock-in box, used by the crew screens, and the owner's dashboard may have shown it too, so the owner could clock their own hours from the dashboard. I cannot see the current dashboard code, so this is a question for you: did you use a clock in / clock out box on your dashboard?

**Options.** (a) You did not use it: nothing to do. (b) You did: a small "My time" tile comes back on the dashboard, clocking the owner in and out like a crew member.
**My pick:** a unless you miss it.

## 4. Crew notes on the job drawer

**What.** On a quote, Quote details has "Crew notes" with a "Visible to the crew" tick. The job drawer (the live project) has crew notes too, with no such tick: whatever is written there is always visible to the crew on their job page.

**Options.** (a) Add the same "Visible to the crew" tick on the job drawer, so a note can be kept for admins only. (b) Leave it: notes on a job are for the crew by definition; admin-only notes go in the quote.
**My pick:** b. Simpler, and the quote already has the private place.

## 5. The help bubble covers the builder's bottom line at 1024

**What.** Found by Emergent's testing agent in Round 72: on a 1024-wide screen, with the quote scrolled to the end, Lucy's help bubble sits over the last line of the totals block.

**Options.** (a) The builder keeps a little space under the totals at widths up to 1100 px, so the bubble never covers them. (b) The bubble hides while the totals are on screen.
**My pick:** a.

## Also waiting on the checks, not on you

- The contract email that says "Attached" with nothing attached: becomes its own round (Round 78) now that you have said yes.
- Anything Checks 1–7 turn up.

## Added 22 Oct — Google Drive connect: show the reason

The Drive and Calendar callback routes bounce to Settings › Business with `?drive=connected | error | state_error | token_error` (and the Calendar equivalent) but the page ignores the flag and the route logs nothing, so a failed connect only ever reads "Not connected". Fix: the Files & storage card reads the flag once and shows one line in plain words ("Google refused the sign-in — check the consent screen's test users", "The published app's secret is wrong or old — publish again", "The address the app is published at does not match Google's — check APP_PUBLIC_URL", "Connected as …"), and the callback route logs the failure reason (never the secret). Same for the Calendar card and the Xero card.

**Done 22 Oct** inside Round 80: the three cards show one reason line (`drive-connect-reason`, `gcal-connect-reason`, `xero-connect-reason`), the bounce carries `why=`, the route keeps `last_error`, the address is cleaned; retested at 1440 (iterations 162/163). Shows on the live app after the next publish.

## Added 22 Oct — two pre-existing items Emergent saw while fixing the no-plan gate (not touched)

- A team member's **Login email** display on the Account page (Emergent's words: "member Login email display") — to be looked at in the checks; exact symptom not yet described.
- A **sidebar naming** issue under the no-plan state — same; ask for the exact words at the next stop before deciding.

## Added 22 Oct — Billing page while Stripe is not configured on the server

Decision (Josh, 22 Oct): the live Stripe keys wait until the launch-phase Terms exist, so the published app runs with no Stripe key. Today the Billing page still shows "Choose" on the plan cards; pressing one calls a checkout that cannot start. Fix: when the server reports Stripe unconfigured (the platform maintenance status), the plan cards' buttons are disabled with one line "Plans open at launch — your tester access continues", and the Billing drawer says the same. No other change; the page comes back to life by itself when the keys are set.

## Added 22 Oct — replies to a painter's emails must reach the painter

Found while checking Resend: the quote (`routes/estimate_send.py`), invoice (`routes/invoices.py`) and variation (`routes/variations.py`) emails set their reply address to the platform-wide `RESEND_REPLY_TO` (today software@joshsano.com.au), so a client who replies to a painter's quote or invoice writes to Paint Trade HQ, not to the painter. Only the photo-share email already uses the business's own address (`project_photos.py`). Fix: every email the app sends *for a business* to that business's clients or crew (quotes, invoices, variations, photo shares, review requests, follow-ups, contracts) carries `reply_to` = the business profile's email (fallback the owner's login email); the platform reply address is used only on platform emails (welcome, password reset, tester invites, the test email, Terms notices, feedback). One helper for the choice, every sender uses it; a test per sender type. No UI change.

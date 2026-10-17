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

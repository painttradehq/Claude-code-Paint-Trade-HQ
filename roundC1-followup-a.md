Round C1 follow-up A — device routing (answers to your four questions, then one request)

**The rule, exactly:** the crew app is for phones only; everything else is the web app.

- A **phone** is a browser whose user agent contains `iPhone` or `iPod`, or contains `Android` **and** `Mobile`. Nothing else is a phone: iPad (which identifies as a Mac), Android tablets (no `Mobile` token), laptops, computers. Decide once on first paint from `navigator.userAgent`; never from screen width or orientation (a phone held sideways is 800–930 px wide and must stay a phone).

Answers:
1. **b** — by device identity, with the rule above.
2. **a** — a non-phone opening any `/employee/*` route (login, onboarding, dashboard, every crew screen) is sent to `/admin/login`. No exceptions: the crew app never renders on a tablet, laptop or computer.
3. **a** — a phone opening `/admin/*` is left alone; the owner can still reach the web app on a phone.
4. **a** — a signed-in user opening `/` goes to their own dashboard (admin → `/admin/dashboard`, employee → `/employee/dashboard`). A signed-out visitor opening `/`: phone → `/employee/login`, anything else → `/admin/login`. The QR link (`/employee/onboarding?admin=…&code=…`) follows rule 2.

Build notes: one helper `isPhone()` in `frontend/utils/device.ts` (new), used by `app/index.tsx` and by the crew `(tabs)/_layout.tsx` plus `employee/login.tsx` and `employee/onboarding.tsx` (the three crew entry points outside the tabs). Nothing under `app/admin/*` changes. No backend, env or route change. The testing agent must set a phone user agent (not only a 390 px viewport) for the crew screens, and must check a 1024 px desktop UA and an iPad UA both land on `/admin/login` from `/` and from `/employee/login`. Report as "Round C1 follow-up A done", appended to the Round C1 report: agent-tested vs Unverified per item, iteration number, files changed.

Request: in the same reply, paste the full `memory/reports/roundC1-crew-shell-report.md` text — the §1 verify table with the Unverified items, the deleted / moved files, the redirects added, the `utils/api.ts` logout-loop fix, and the §8 spec silences — so the owner can read it here.

# Round C2 follow-up C done — Emergent's report (14 Oct, as pasted in the job)

Testing agent iteration **136** — desktop UA 1280×800, iPhone UA 390×844 and 360×800, iPad UA 1024×768; TS_ crew and TS_ Alpha admin in separate contexts; owner tenant untouched. Suite **762 passed, 114 skipped, 0 failed** (frontend-only round). `tsc` clean. TS_ torn down.

| # | Item | Result |
|---|---|---|
| 1 | `/` → admin sign-in on all three UAs; `/admin` → admin sign-in; `/crew` → crew sign-in on all three; `/employee/dashboard` signed out → crew sign-in (never admin); `/employee/contracts` desktop → crew sign-in signed out / contracts screen signed in as crew; `/employee/onboarding` signed out still opens | agent-tested |
| 2 | Signed-in crew: `/crew` and `/` → Today. Signed-in admin: `/` → dashboard, `/crew` → crew sign-in | agent-tested |
| 3 | Both cross-links route correctly at 390, 360 (crew page fits, no scroll) and 1280; crew link target 44 px | agent-tested |
| 4 | `utils/device.ts` deleted; the grep returns nothing | agent-tested |
| 5 | `/crew.webmanifest` scope `/employee/`, `/manifest.webmanifest` scope `/admin/`; one manifest link + apple title swap on `/employee/login`, `/admin/login`, and after the client-side cross-link | agent-tested |
| 6 | `frontend/app/admin`: only `M login.tsx` + new `index.tsx`; tsc clean; suite green; no console errors | agent-tested |
| 7 | 1280: crew sign-in, Today, Jobs, job page as a 430 px column at x=425 with 1 px edges, tab bar inside; 390/360 unchanged from C2 | agent-tested |

**Files** — changed: `app/_layout.tsx`, `app/index.tsx`, `app/+html.tsx`, `app/admin/login.tsx`, `app/employee/login.tsx`, `app/employee/onboarding.tsx`, `app/employee/(tabs)/_layout.tsx`, `components/InstallAppBanner.tsx`, `public/manifest.webmanifest`. New: `app/crew.tsx`, `app/admin/index.tsx`, `app/employee/_layout.tsx`, `public/crew.webmanifest`. Deleted: `utils/device.ts`. Backend/env/packages/tests: none.

**Two deviations, for the record** (full detail in `memory/reports/roundC2-followupC-report.md` on the job):
1. The inline `<head>` script runs before the static `apple-mobile-web-app-title` meta exists, so it creates both the manifest link and that meta itself (static meta removed; exactly one of each). The root effect updates them on route changes as specified.
2. Admin → `/crew` uses `router.replace`, not `push`: with `push` the admin screen stays mounted and `app/admin/_layout.tsx`'s existing auth guard bounced the navigation straight back to `/admin/login` (reproduced with `push('/terms')` too). That layout was not to be changed, so the link replaces. Crew → `/admin` is `router.push` as specified; the new crew guard is scoped to `/employee/*` so a pushed route doesn't bounce.

C3 spec is saved at `memory/specs/crew/c3-timeclock-notes.md`; not started.

---
Crew chat's reading (14 Oct): all seven rows agent-tested; both deviations accepted (the admin layout's own guard is admin-side and not ours to change; `replace` from the admin sign-in loses nothing, there is no history worth keeping on a sign-in page). Note for the admin chat: `app/admin/_layout.tsx`'s auth guard bounces any route pushed on top of an admin screen, which is why the crew link had to `replace`.

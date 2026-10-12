# Round C1 report (verbatim from Emergent, 12 Oct 2026) — `memory/reports/roundC1-crew-shell-report.md`

Round C1 done

# Round C1 — Crew shell: sign-in, four bottom tabs, Today, Inbox, Learn, Me

Provenance: everything below is **agent-tested** unless marked **Unverified**. Not user-confirmed yet. Spec: `memory/specs/crew/c1-crew-shell-notes.md`, prototype `memory/specs/crew/c1-crew-shell.html` (both saved from the uploads).

## 1. Verify items (§5) — testing agent iteration **132** at 390 × 844 then 360 × 800, TS_ Alpha tenant (`crew.alpha.one@ts-pthq.example`), owner tenant never signed in

| # | Item | Result |
|---|---|---|
| 1 | Sign-in: wrong password → inline 401 text; red-flagged TS_ crew → "Account access temporarily restricted. Please contact admin."; success lands on Today with four tabs (no `crew-tab-jobs`); Show / Hide toggles the field; no "Back to Home" | agent-tested (390 + 360) |
| 2 | Today signed out: "Signed out · Not on the clock · No sign-ins yet · No job yet · Sign in"; after Sign in with geolocation granted → "Signed in", "0 h 00 m on the clock", "Since h:mm am today", "Job: General", outlined Sign out; `timeclock` record with `project_name null` and a location; Sign out closes it | agent-tested (390 + 360) |
| 3 | Outside-radius badge in the card with the widget's id `widget-outside-radius-badge` ("820 m off site (limit 150 m)") | agent-tested with a TS_ timeclock record stamped `outside_radius: true` — the C1 card cannot *produce* the flag because the sign-in carries no project (as built; see §8.8) |
| 4 | Unread: three TS_ notifications (contract issued → document, equipment outcome → tool, daily-report feedback → chat) on Today under "Unread · 3", badge 3; tapping the daily-report one marks it read, badge 2, opens `/employee/daily-report`; tapping the contract one (no link) marks it read, badge 1, opens the Inbox tab; none unread → "You're up to date." and no badge | agent-tested (390 + 360) |
| 5 | Inbox: all notifications, unread first then newest; Mark all read clears the badge and hides the link; "Message your employer" opens Feedback and back returns to the tab; `/employee/notifications` → `/employee/inbox` | agent-tested (390 + 360) |
| 6 | Learn and Me rows open their screens, back returns to the tab; profile card "T · TS_ Crew Onboarded · Painter · Your details, documents and photo"; My documents count hidden at 0 (the TS_ crew has no `sent` document; the count badge itself is **Unverified** — no TS_ document was issued) | agent-tested except the count badge |
| 7 | Me › Sign out clears storage and shows the sign-in screen; expired token on a crew page lands on `/employee/login` | agent-tested — Sign out by the testing agent; the expired-token redirect failed in iteration 132 and was fixed (§8.10), then re-checked by me in the browser: `/employee/dashboard` with a dead token → `/employee/login`, `authToken` / `userRole` / `userData` all cleared |
| 8 | Landing `/`: no "Powered by OpenAI" pill | agent-tested — the text is gone from the bundle; on web `/` redirects signed-out visitors to `/admin/login` (pre-existing), so the QR / Employee Login tiles only show natively and are **Unverified** here |
| 9 | Other crew screens open as before (time-clock, contracts, training, onboarding spot-checked: dark look, own back arrow, no console errors) | agent-tested |
| 10 | No horizontal scroll at 390 or 360 (scrollWidth = viewport on login, Today, Inbox, Learn, Me); no console errors (one RN-web deprecation *warning* about `pointerEvents` from the library, not from C1 code); `tsc` clean; `app/admin/*` diff empty | agent-tested |

Backend regression (unchanged backend, run for the TS_ teardown): `backend/scripts/run_tests.sh` → **753 passed · 114 skipped · 0 failed** (`memory/tmp/full_c1_after.log`). TS_ teardown: TS_ admins 0, TS_ employees 0, TS_ notifications 0, TS_ timeclock rows 0. `crew.alpha.two`'s red flag was restored by the testing agent before teardown.

## 2. Backend changes
None. Env changes: none. New routes: none. `app.json`, `eas.json`, manifest, `mobile/`: untouched.

## 3. Files

New (`frontend/app/employee/(tabs)/`): `_layout.tsx` (Tabs + custom tab bar, Inbox badge, shared crew store and row/section/header pieces, time formatters, icon rule), `dashboard.tsx` (Today), `inbox.tsx`, `learn.tsx`, `me.tsx`.
Rewritten: `frontend/app/employee/login.tsx` (brand restyle, same ids + `emp-login-show`, same call and success route), `frontend/app/employee/notifications.tsx` (now a `<Redirect href="/employee/inbox" />`).
Deleted: `frontend/app/employee/dashboard.tsx` (moved into the `(tabs)` group; `/employee/dashboard` still resolves there, so the landing redirect and login `router.replace` are unchanged). `SignInOutWidget` is no longer rendered on the crew dashboard (component file untouched; the card does its calls).
Shared-file edits (the three named in the spec): `frontend/utils/api.ts` (401 redirect by role — reads `userRole` before logout clears it; see §8.10), `frontend/app/index.tsx` (pill block, `openaiPill*` styles, `pulseAnim` + its effect and the now-unused `useRef` / `Animated` imports removed), `frontend/app/_layout.tsx` (`employee/login` → `headerShown: false`).
Removed routes: none. Redirects added: `/employee/notifications` → `/employee/inbox`; dead crew token → `/employee/login` (admins still → `/admin/login`).
Old ids gone with the old dashboard: `employee-notifications-btn`, `employee-logout-btn`, `employee-*-card`.

## 4. What's new
Draft **`c08c966d-eb35-4eef-913d-563684149434`** — "A new home screen for your crew", audience Admins, Email as well = No, one card with the §6 body. **Draft only, not published.**

## 8. Spec silences — decided by me, for the owner to confirm

1. **Where the shared crew pieces live.** Rule 2 allows only `app/employee/*`, so the tab bar, the Inbox store, `Row` / `Sect` / `List` / `TabHeader` and the formatters are named exports of `app/employee/(tabs)/_layout.tsx` (no `components/crew/`). C2 can import from there or move them.
2. **Notification icons when there is no `link`.** Contract and equipment notifications from the backend carry no `link` (only daily-report feedback does), so the spec's link-prefix rule alone would show bells for two of the three. Added a `notification_type` fallback: `contract*` → document, `equipment*` → tool, `daily_report*` → chat, `validation` → tick, `accomplishment` → star, else bell. Tap behaviour stays literal: link → open it, else the Inbox tab.
3. **Inbox tap targets.** `validation` → My validations (as built), `coaching` / `strike` → Coaching (the old Notifications screen did this too), a `link` → that link, otherwise the row just marks itself read.
4. **Unread header at zero** reads "Inbox" (the prototype), with the empty state "You're up to date." below it.
5. **Empty-fields sign-in error** is the prototype's "Enter your email and password." (the old text was "Please fill in all fields").
6. **Section labels are uppercase** by style (prototype `.sect`), so "Messages · 2 unread" renders as MESSAGES · 2 UNREAD.
7. **Elapsed minutes are zero-padded** per "{H} h {MM} m" ("0 h 05 m"); the prototype's example "2 h 35 m" does not show the single-digit case.
8. **Geofence from the card.** As built, the widget's sign-in sends no `project_id`, and the backend only evaluates the radius when one is present — so the outside-radius badge cannot be triggered from the C1 card; it renders whenever the status session is flagged (verified with a stamped TS_ record). The real trigger arrives with the job on sign-in (C2/C3).
9. **Pre-existing backend finding, not fixed (no backend change this round):** `GET /timeclock/status` returns 500 when a timeclock `timestamp` carries a timezone offset (naive-vs-aware subtraction, `routes/timeclock.py:242`). App-written rows are naive so the app is unaffected; the testing agent hit it only with a hand-inserted tz-aware row.
10. **Pre-existing 401 loop, fixed inside the `api.ts` edit.** `logout()` posts `/admin/logout`; with a dead token that call itself 401s and re-entered the interceptor's logout path forever (iteration 132 saw 120+ logout calls and 429s, and no redirect for either role). The interceptor now ignores the logout call, so the role-based redirect actually runs.
11. **Landing page on web** redirects signed-out visitors to `/admin/login` (pre-existing), so §5.8's QR / Employee Login check is only possible natively.
12. **What's new card title** "Today, Inbox, Learn and Me" (the spec gives the entry title and body; a card needs its own title), icon sparkle.
13. **Privacy / Terms links** (sign-in footer and Me footer) open `/privacy` and `/terms` in-app.
14. **Accomplishment popup** reads the same notification list the Today screen loads (one call instead of two) and still marks the notification read on close.
15. **Greeting** uses the first word of `name`, so the TS_ crew reads "Morning, TS_".
16. **Time strings** ("Last signed out 5:12 pm yesterday", "Since 7:04 am today", row times) use the phone's local time zone.

---

Round C1 follow-up A done

# Round C1 follow-up A — device routing (phones get the crew app, everything else the web app)

Rule as given: phone = user agent containing `iPhone` or `iPod`, or `Android` **and** `Mobile`; decided once on first paint from `navigator.userAgent`, never from width or orientation. Native builds count as a phone.

| # | Item | Result |
|---|---|---|
| 1 | Signed-out `/`: iPhone 390 → `/employee/login`; Android phone 360 → `/employee/login`; iPhone landscape 844 × 390 → `/employee/login` (width ignored); desktop 1024 → `/admin/login`; iPad (Macintosh UA) 1024 → `/admin/login`; Android tablet 800 → `/admin/login` | agent-tested |
| 2 | Non-phone opening a crew entry: desktop and iPad on `/employee/login` → `/admin/login`, no crew element ever rendered; desktop on `/employee/onboarding?admin=…&code=…` → `/admin/login`; desktop on `/employee/dashboard` signed out → `/admin/login` | agent-tested |
| 3 | Phone opening `/admin/login` → left alone, admin form renders | agent-tested |
| 4 | Signed-in crew on a phone opening `/` → `/employee/dashboard`; the same crew session copied into a desktop context and opening `/employee/dashboard` → `/admin/login`, no tab bar leak | agent-tested |
| 5 | Crew Me › Sign out on the iPhone UA still lands on `/employee/login`; no console errors; no horizontal scroll at 390 / 360 | agent-tested |

Testing agent iteration **133** (17 UA/route combinations across six contexts), after my own nine-combination browser check. `tsc` clean. Backend suite re-run only for the TS_ teardown (`memory/tmp/full_c1a_after.log`): 751 passed · 116 skipped · 0 failed — two more skips than C1 because the date rolled to Monday and `test_r21_timesheets.py` skips its "past Tuesday in this pay week" and "yesterday in a locked week" cases on Mondays (calendar-dependent, not a code change). TS_ admins 0, TS_ employees 0 after teardown.

Files changed: **new** `frontend/utils/device.ts` (`isPhone()`); `frontend/app/index.tsx` (signed-out web visitor → `isPhone() ? '/employee/login' : '/admin/login'`); `frontend/app/employee/(tabs)/_layout.tsx`, `frontend/app/employee/login.tsx`, `frontend/app/employee/onboarding.tsx` (non-phone → `router.replace('/admin/login')` and render nothing). Nothing under `app/admin/*`. No backend, env or route change.

Silence: the other crew screens (time-clock, contracts, …) are not guarded themselves — a non-phone can only reach them with a crew session, and the three entry points plus the tab shell now refuse one, so they are unreachable in practice; a bookmarked deep link with an old session on a computer would still open that one screen until it navigates. Say the word and I will guard each.

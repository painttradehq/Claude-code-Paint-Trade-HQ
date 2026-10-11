# C1 — Crew shell: sign-in, bottom tabs, Today (proposal, not sent)

Prototype: **`c1-crew-shell.html`**. Open at **390 × 844** first (phone, or a narrow browser window): sign in with any email → Today → tap **Sign in** on the clock card → tap a message → the Jobs, Docs, Learn and More tabs → More › Sign out. Deep links: `?screen=app&tab=today&state=in`, `?screen=app&tab=docs`, `?screen=app&state=in&notifs=0` (nothing unread), `?error=restricted`. Then 360 × 800. Playwright: `tools/test_c1.js`, 52/52 at both sizes.

Facts come from `crew-recheck-11oct.md` (clone `dae9a2f`). Status: **proposal for Josh's review**. Becomes the round spec after his changes; nothing goes to Emergent before "send".

## 1. Decisions C1 assumes (from handover §6; Josh overrides any in one line)

| # | Assumed | Why it matters in C1 |
|---|---|---|
| 1 | Ship path (a): installable web app first | C1 is a web round; nothing native is added. The crew manifest and "Add to Home Screen" go with push in C7. |
| 2 | Restyle to the brand, screen by screen | Sign-in, Today and the four hub tabs move to `theme/tokens.ts` in C1. Every other crew screen stays as built until its round. |
| 3 | Bottom tabs: **Today · Jobs · Docs · Learn · More** | Josh picks the five names. The prototype shows this set. |
| 4 | Name on screen "Paint Trade HQ" + "Crew" | `app.json` is **not** touched in C1 (bundle id, scheme and store name are C8). |
| 6 | English only | Every string below is final English. |
| 7 | Phone only | Tested at 390 and 360; no tablet layout. |

Not assumed: §6.5 account removal (C8), §6.8 crew hours (not in C1).

## 2. What a crew member sees after C1

**Sign-in** (`/employee/login`, restyled): purple tile mark (84 px), "Paint Trade HQ" (Fraunces 28), "CREW" kicker, one line "Sign in to clock on, read your messages and send your report.", Email, Password with **Show / Hide**, inline error, **Sign in** button, footer "Joining a crew? Scan the QR code your employer gave you.", links **Privacy** (`/privacy`) and **Terms** (`/terms`). Light background, `StatusBar style="dark"`.

**Today** (`/employee/dashboard`, rewritten): date line ("Saturday 11 October"), greeting ("Morning, Mia" — Morning before 12:00, Afternoon 12:00–16:59, Evening after; first name from `userData.name`), then three blocks:
1. **Time clock** card — signed out: dot grey, "Signed out", "Not on the clock", "Last signed out {h:mm am/pm} {today | yesterday | d Month}" from `last_sign_out` (or "No sign-ins yet" when null), job line "No job yet", button **Sign in** (purple). Signed in: green dot, "Signed in", "{H} h {MM} m on the clock", "Since {h:mm am/pm} today", job line "Job: {project_name}" ("General" when null), button **Sign out** (outlined). The widget's **outside-radius badge and distance warning keep their text and test ids** inside this card.
2. **Unread · N** / **Messages** — unread notifications, newest first, up to 5, each with an icon by type, title, one sub-line, time; "See all" on the right. Nothing unread: one line "You're up to date." Tapping a row marks it read (`PUT /notifications/{id}/read`), then opens its `link` when it has one, else `/employee/notifications`. The Today tab shows the unread count as a red badge.
3. **End of day** — one row "Daily report · Send today's report and photos" → `/employee/daily-report`.

**Jobs** — rows: Daily report ("Today's report, and the ones you've sent") → `/employee/daily-report`; Time clock ("Sign in, sign out and your last 10 sessions") → `/employee/time-clock`. (C3 and C4 fill this tab; nothing is promised on the screen.)

**Docs** — Contracts ("Documents from your employer to read and sign", count badge = documents with `status: "sent"` from `GET /employee-contracts/mine`, hidden at 0) → `/employee/contracts`; Profile ("Your details, documents and photo") → `/employee/profile`; Equipment ("Your gear and your requests") → `/employee/request-equipment`.

**Learn** — Training ("Videos, required ones first, and your progress") → `/employee/training`; Coaching ("Notes from your employer and what good looks like") → `/employee/strike-system` (route name kept, the word strike never shown); How I'm going ("Performance notes your employer recorded") → `/employee/my-validations`.

**More** — me card (initial, name, role line from the employee record's `role` field, which the login payload returns and defaults to "Painter"; the crew cannot read the business name today, so it is not shown); Team events ("Upcoming events and your RSVPs") → `/employee/team-events`; Feedback ("Send a note to your employer and see replies") → `/employee/feedback`; Notifications ("Everything, read and unread") → `/employee/notifications`; **Sign out** (red) → clears the session, `/employee/login`; footer "Paint Trade HQ Crew · Privacy · Terms".

Every existing crew screen stays reachable (eleven routes checked by the test) and **unchanged**; they open as stack screens with their current back arrow and their current black-and-coral look until their own round.

## 3. Build notes (for the spec after review)

**Routing**
- New `app/employee/(tabs)/_layout.tsx` with expo-router `Tabs`; five screens: `dashboard.tsx` (Today; moved into the group so `/employee/dashboard` and the landing redirect keep working), `jobs.tsx`, `docs.tsx`, `learn.tsx`, `more.tsx`. `headerShown: false`; each tab draws its own header: Today = date line + greeting, the four hubs = the Fraunces title only (the crew has no route that returns the business name, so no business line).
- Existing crew screens stay where they are (outside the group) and keep their own headers and back arrows.
- Tab bar: 64 px + bottom safe area, surface white, 1 px top border `border`, Ionicons `sunny-outline`, `home-outline`, `document-text-outline`, `school-outline`, `ellipsis-horizontal`; active = icon `accent` on an `accentBg` pill (48 × 28, radius 14), label `accentInk` 11.5 px 600; inactive `textMuted`. Badge on Today: `danger` background, white 10.5 px bold, 2 px white ring, hidden at 0.
- Login stays a stack screen; after `POST /employees/login` succeeds → `router.replace('/employee/dashboard')` (as built).

**Today data**
- `GET /timeclock/status` on focus and every 60 s while signed in (as the clock screen does). Sign in / out: the exact calls `SignInOutWidget` makes today (browser geolocation on web, `{location, notes: null}`, no project). The widget is **no longer rendered on the crew dashboard**; the component file stays (the admin dashboard renders it).
- `GET /notifications/{me}?recipient_type=employee`; unread = `read === false`; icons by `type`: `accomplishment` → star, anything whose `link` starts with `/employee/contracts` → document, `/employee/request-equipment` → tool, `/employee/daily-report` → chat, else bell. The accomplishment popup keeps working as built (it opens on Today).
- Elapsed time from `session.sign_in_time`, re-rendered each minute.

**Restyle**
- Sign-in, Today, Jobs, Docs, Learn, More use `theme/tokens.ts` only (no `utils/colors.ts`): background `#FAF9F6`, surface `#FFFFFF`, border `#E7E3DA`, text `#1E1C1A` / `#6B675F` / `#9B968A`, accent `#4B3E86`, accent tint `#F1EEFA`, accent ink `#34295E`, success `#1C8A4B` / `#E7F6ED`, danger `#C6382E` / `#FBEAEA`; Fraunces 600 for the big titles (28–34 px), body Inter 15 px. Cards radius 18, rows min 64 px, inputs 52 px, buttons 54 px, every tap target ≥ 44 px.
- The login's `Input` / `Button` components import `Colors`; the new login uses plain `TextInput` / `Pressable` styled from tokens so the shared components stay untouched.

**Plumbing (same round, exact changes)**
- `utils/api.ts` 401 redirect: read `userRole` from AsyncStorage before clearing it; `employee` → `/employee/login`, else `/admin/login`. Not on either login page already (as built).
- `app/index.tsx`: remove the pill block at lines 105–109 and the `openaiPill`, `openaiPillDotWrap`, `openaiPillDot`, `openaiPillText` styles (271–299) and the `pulseAnim` animation if nothing else uses it. Shared file; Josh sends it with this round.
- `app/_layout.tsx`: the `employee/login` Stack.Screen gets `headerShown: false` (the new screen has no navigation header).

**Not in C1**: `app.json`, `eas.json`, manifest, push, expo-location, job picker, any backend route, any other crew screen, `mobile/`, the Sano agreement text in onboarding (C5 + lawyer).

**Backend changes: none. Env changes: none. Tenant isolation: no new route; existing tests unchanged.**

**Test ids**: login keeps `emp-login-username`, `emp-login-password`, `emp-login-error`, `emp-login-submit` and adds `emp-login-show`; new shell ids as in the prototype (`crew-tabbar`, `crew-tab-{today|jobs|docs|learn|more}`, `crew-tab-today-badge`, `crew-pane-*`, `crew-today-clock`, `crew-today-clock-btn`, `crew-today-job`, `crew-today-notifs`, `crew-notif-row`, `crew-today-notifs-all`, `crew-today-notifs-empty`, `crew-today-report`, `crew-jobs-*`, `crew-docs-*`, `crew-learn-*`, `crew-more-*`, `crew-more-signout`). The widget's `widget-outside-radius-badge` and `widget-outside-warning-banner` keep their ids inside the clock card. `employee-notifications-btn`, `employee-logout-btn` and the `employee-*-card` ids of the old dashboard go.

## 4. Verify (testing agent, 390 × 844 then 360 × 800, TS_ tenant)

1. Sign-in: wrong password shows the 401 text inline; a red-flagged TS_ employee shows "Account access temporarily restricted. Please contact admin."; success lands on Today with the tab bar; Show / Hide toggles the field.
2. Today signed out: card text, "No job yet", Sign in button; after Sign in (location granted) → "Signed in", elapsed, "Since …", "Job: General", Sign out button; the timeclock record exists with `project_name` null and a location; Sign out closes it.
3. Admin sets a job-site location and radius, crew signs in from a far point → the outside-radius badge shows inside the card (same ids as the widget had).
4. Unread: three TS_ notifications (contract issued, equipment outcome, daily-report feedback) show with the right icons and sub-lines; tapping one marks it read, the badge drops, the linked screen opens; with none unread the line "You're up to date." shows and no badge.
5. Each hub row opens its existing screen; the back arrow returns to the tab; Contracts shows the count of `sent` documents and hides it at 0.
6. More › Sign out clears AsyncStorage and shows the sign-in screen; a deliberately expired token on a crew page lands on `/employee/login`, not `/admin/login`.
7. Landing page `/`: no "Powered by OpenAI" pill; QR and Employee Login unchanged.
8. Every other crew screen opens and looks exactly as before (spot-check time-clock, contracts, training, onboarding).
9. No horizontal scroll at 390 or 360; no console errors; `tsc` clean; the admin app untouched (`app/admin/*` diff empty).

## 5. What's new draft (owner-facing, Draft only)

**Title:** A new home screen for your crew
**Body:** Your crew now opens on a Today screen: their time clock, their unread messages from you and a one-tap daily report. Five tabs along the bottom — Today, Jobs, Docs, Learn and More — replace the old tile grid, and the sign-in screen carries the Paint Trade HQ look. Everything they could do before is still there, one tap away. Nothing changes on your side.

## 6. Open questions for Josh (answer in one line each)

1. Tab names as shown, or different five?
2. "Back to Home" on the sign-in screen: the prototype drops it (the landing page is one URL away on web and will not exist in a native build). Keep or drop?
3. Today greeting uses the first name. OK, or the full name?
4. Should the Today card sign in in place (as the widget does today, no job) — the proposal — or only open the full clock screen until C2 brings the job picker?

# C1 — Crew shell: sign-in, bottom tabs, Today, Inbox, Learn, Me (proposal v2, not sent)

Prototype: **`c1-crew-shell.html`** (one prototype for C1 and C2; this file covers the C1 part, `c2-jobs-notes.md` the Jobs part). Open at **390 × 844** first: sign in with any email → Today → tap **Sign in** on the clock card → tap a message → **Jobs** → a job → back → **Inbox** › Mark all read → **Learn** → **Me** › Sign out. Deep links: `?screen=app&tab=inbox`, `?screen=app&state=in&notifs=0&jobs=0` (nothing unread, no jobs), `?screen=job&id=j2`, `?error=restricted`. Then 360 × 800. Playwright `tools/test_c1.js`: **82/82** at both sizes.

Facts: `crew-recheck-11oct.md` (clone `dae9a2f`). Status: **proposal for Josh's review** after his C1 feedback ("Profile under Docs; jobs are missing"). Nothing goes to Emergent before "send".

## 1. What changed from v1 (Josh's review, 11 Oct)

- **Tabs are now Today · Jobs · Inbox · Learn · Me.** Each tab has one job: clock on and see the day (Today), the jobs I'm on (Jobs), everything the boss sent me (Inbox), get better (Learn), my own stuff (Me). The v1 "Docs" and "More" hub lists are gone; Profile sits at the top of Me as the person's card.
- **Jobs is the centre of the app** (§6.9): the list of my jobs and a job page with the "Show" list. That is round **C2** (`c2-jobs-notes.md`); C1 builds the shell it slots into.
- **Inbox** replaces the old Notifications screen as a tab: unread first, "Mark all read", and a top row "Message your employer" that opens the existing Feedback thread. Today shows the top three unread as a preview; the badge sits on the Inbox tab.
- **Me**: profile card → Profile; **My documents** (contracts, count of documents waiting for my signature), **My equipment**, **My hours** (the existing time-clock screen with its last 10 sign-ins); **Team events**; Sign out; Privacy · Terms.
- **Learn** unchanged: Training, Coaching, How I'm going.

## 2. Decisions C1 assumes (handover §6; Josh overrides any in one line)

| # | Assumed | Effect on C1 |
|---|---|---|
| 1 | Ship path (a): installable web app first | Web round; nothing native added. Crew manifest and "Add to Home Screen" come with push (C7). |
| 2 | Restyle to the brand, screen by screen | Sign-in, Today, Inbox, Learn, Me move to `theme/tokens.ts`. Every other crew screen stays as built until its round. |
| 3 | Tabs as above | C1 ships **four** tabs (Today · Inbox · Learn · Me); C2 inserts **Jobs** second, with the Today's-job card. Alternative: build C1 and C2 as one round (bigger, one testing pass). |
| 4 | On screen: "Paint Trade HQ" + "Crew" | `app.json` untouched (C8). |
| 6 | English only | All strings below are final. |
| 7 | Phone only | 390 and 360 tested; no tablet layout. |

## 3. What a crew member sees after C1

**Sign-in** (`/employee/login`, restyled): purple tile mark (84 px), "Paint Trade HQ" (Fraunces 28), "CREW" kicker, "Sign in to clock on, see your jobs and send your report.", Email, Password with **Show / Hide**, inline error, **Sign in**, footer "Joining a crew? Scan the QR code your employer gave you.", links **Privacy** (`/privacy`) and **Terms** (`/terms`). Light background, `StatusBar style="dark"`. No "Back to Home" button (the landing page is one URL away on web and does not exist in a native build).

**Today** (`/employee/dashboard`, rewritten): date line ("Saturday 11 October"), greeting ("Morning, Mia": Morning before 12:00, Afternoon 12:00–16:59, Evening after; first name = first word of `userData.name`).
1. **Time clock** card. Signed out: grey dot, "Signed out", "Not on the clock", "Last signed out {h:mm am/pm} {today | yesterday | d Month}" from `last_sign_out` ("No sign-ins yet" when null), job line "No job yet", button **Sign in**. Signed in: green dot, "Signed in", "{H} h {MM} m on the clock", "Since {h:mm am/pm} today", job line "Job: {project_name}" ("General" when null; the prototype shows the C3 end state with the job name and street), button **Sign out** (outlined). The widget's outside-radius badge and distance warning keep their text and test ids inside this card. Sign in / out does exactly what `SignInOutWidget` does today (browser geolocation on web, `{location, notes: null}`, no project); the widget is no longer rendered on the crew dashboard.
2. **Today's job** card — arrives in **C2** (needs the jobs route). In C1 this section is absent.
3. **Unread · N** — the top three unread notifications (icon by type, title, sub-line, time); "Inbox" link on the right opens the Inbox tab. Nothing unread: "You're up to date." Tap → mark read (`PUT /notifications/{id}/read`) → open its `link` if it has one, else the Inbox tab.
4. **End of day** — "Daily report · Send today's report and photos" → `/employee/daily-report`.

**Inbox** (new tab; takes over `/employee/notifications`): title "Inbox", link **Mark all read** (`PUT /notifications/{me}/read-all?recipient_type=employee`, hidden at 0 unread); row **Message your employer** ("Send a note to your employer and read the replies") → `/employee/feedback`; section "Messages · N unread" / "Messages"; every notification, unread first then newest first, with the unread dot; empty: "Nothing here yet. Messages from your employer land here." Type `validation` opens My validations (as built). The accomplishment popup keeps working as built (opens on Today).

**Learn** — Training ("Videos, required ones first, and your progress") → `/employee/training`; Coaching ("Notes from your employer and what good looks like") → `/employee/strike-system` (route name kept; the word strike never shown); How I'm going ("Performance notes your employer recorded") → `/employee/my-validations`.

**Me** — profile card (initial, `name`, "{role} · Your details, documents and photo"; `role` from the employee record, default "Painter") → `/employee/profile`; **Mine**: My documents ("Contracts and policies to read and sign", count = documents with `status: "sent"` from `GET /employee-contracts/mine`, hidden at 0) → `/employee/contracts`; My equipment ("Your gear, and requests for more") → `/employee/request-equipment`; My hours ("Your last 10 sign-ins") → `/employee/time-clock`; **Team**: Team events ("Upcoming events and your RSVPs") → `/employee/team-events`; **Account**: Sign out (red) → clears the session, `/employee/login`; footer "Paint Trade HQ Crew · Privacy · Terms".

Every existing crew screen stays reachable (eleven routes, checked by the test) and **unchanged**; they open as stack screens with their current back arrow and their current black-and-coral look until their own round.

## 4. Build notes (for the spec after review)

**Routing**
- New `app/employee/(tabs)/_layout.tsx` with expo-router `Tabs`: `dashboard.tsx` (Today; moved into the group so `/employee/dashboard` and the landing redirect keep working), `inbox.tsx`, `learn.tsx`, `me.tsx`; C2 adds `jobs.tsx` second. `headerShown: false`; each tab draws its own header (Today: date + greeting; the others: the Fraunces title, Inbox with the Mark all read link).
- `notifications.tsx` becomes a redirect to the Inbox tab (its route is linked from notifications' `link` fields and from older What's new cards).
- Existing crew screens stay outside the group with their own headers and back arrows.
- Tab bar: 64 px + bottom safe area, white, 1 px top border; Ionicons `sunny-outline`, `home-outline`, `mail-outline`, `school-outline`, `person-outline`; active = icon `accent` on an `accentBg` pill (48 × 28, radius 14), label `accentInk` 11.5 px 600; inactive `textMuted`. Badge on Inbox: `danger`, white 10.5 px bold, 2 px white ring, hidden at 0.
- Login stays a stack screen; success → `router.replace('/employee/dashboard')` (as built).

**Today data**
- `GET /timeclock/status` on focus and every 60 s while signed in; sign in / out = the widget's calls. `GET /notifications/{me}?recipient_type=employee` on focus; unread = `read === false`; icons by type: `accomplishment` → star; `link` starting `/employee/contracts` → document, `/employee/request-equipment` → tool, `/employee/daily-report` → chat, `/employee/my-validations` → tick, else bell. Elapsed from `session.sign_in_time`, re-rendered each minute.

**Restyle**
- The C1 screens use `theme/tokens.ts` only: background `#FAF9F6`, surface `#FFFFFF`, border `#E7E3DA`, text `#1E1C1A` / `#6B675F` / `#9B968A`, accent `#4B3E86`, tint `#F1EEFA`, ink `#34295E`, success `#1C8A4B` / `#E7F6ED`, danger `#C6382E` / `#FBEAEA`; Fraunces 600 titles 28–34 px; Inter 15 px body. Cards radius 18, rows min 64 px, inputs 52 px, buttons 54 px, every tap target ≥ 44 px.
- The new login uses plain `TextInput` / `Pressable` styled from tokens; the shared `Input` / `Button` components (which import `Colors`) stay untouched.

**Plumbing (same round, exact changes)**
- `utils/api.ts` 401 redirect: read `userRole` before clearing storage; `employee` → `/employee/login`, else `/admin/login`.
- `app/index.tsx`: remove the pill block at lines 105–109 and the `openaiPill*` styles (271–299) and the `pulseAnim` animation if nothing else uses it. Shared file; Josh sends it with this round.
- `app/_layout.tsx`: `employee/login` gets `headerShown: false`.

**Not in C1**: Jobs tab, Today's job card, any backend route, `app.json`, `eas.json`, manifest, push, expo-location, job picker, any other crew screen, `mobile/`, the Sano agreement text in onboarding (C5 + lawyer).

**Backend changes: none. Env changes: none. Tenant isolation: no new route.**

**Test ids**: login keeps `emp-login-username`, `emp-login-password`, `emp-login-error`, `emp-login-submit` and adds `emp-login-show`; shell ids as in the prototype (`crew-tabbar`, `crew-tab-{today|jobs|inbox|learn|me}`, `crew-tab-inbox-badge`, `crew-pane-*`, `crew-today-clock`, `crew-today-clock-btn`, `crew-today-job`, `crew-today-notifs`, `crew-notif-row`, `crew-today-notifs-all`, `crew-today-notifs-empty`, `crew-today-report`, `crew-inbox-message`, `crew-inbox-readall`, `crew-inbox-list`, `crew-inbox-empty`, `crew-learn-*`, `crew-me-profile`, `crew-me-contracts`, `crew-me-equipment`, `crew-me-hours`, `crew-me-events`, `crew-me-signout`). The widget's `widget-outside-radius-badge` and `widget-outside-warning-banner` keep their ids inside the clock card. The old dashboard's `employee-notifications-btn`, `employee-logout-btn` and `employee-*-card` ids go.

## 5. Verify (testing agent, 390 × 844 then 360 × 800, TS_ tenant)

1. Sign-in: wrong password shows the 401 text inline; a red-flagged TS_ employee shows "Account access temporarily restricted. Please contact admin."; success lands on Today with four tabs; Show / Hide toggles the field; no "Back to Home".
2. Today signed out: card text, "No job yet", Sign in; after Sign in (location granted) → "Signed in", elapsed, "Since …", "Job: General", Sign out; the timeclock record exists with `project_name` null and a location; Sign out closes it.
3. Admin sets a job-site location and radius, crew signs in from a far point → the outside-radius badge shows in the card (same ids as the widget had).
4. Unread: three TS_ notifications (contract issued, equipment outcome, daily-report feedback) show on Today with the right icons; tapping one marks it read, the badge drops, the linked screen opens; none unread → "You're up to date." and no badge.
5. Inbox: all notifications, unread first; Mark all read clears the badge and hides the link; "Message your employer" opens Feedback; `/employee/notifications` redirects to the Inbox tab.
6. Learn and Me rows open their screens; the back arrow returns to the tab; My documents shows the count of `sent` documents and hides it at 0.
7. Me › Sign out clears AsyncStorage and shows the sign-in screen; an expired token on a crew page lands on `/employee/login`, not `/admin/login`.
8. Landing page `/`: no "Powered by OpenAI" pill; QR and Employee Login unchanged.
9. Every other crew screen opens and looks exactly as before (spot-check time-clock, contracts, training, onboarding).
10. No horizontal scroll at 390 or 360; no console errors; `tsc` clean; `app/admin/*` diff empty.

## 6. What's new draft (owner-facing, Draft only)

**Title:** A new home screen for your crew
**Body:** Your crew now opens on a Today screen with their time clock, your latest messages and a one-tap daily report. Tabs along the bottom — Today, Inbox, Learn and Me — replace the old tile grid, and the sign-in screen carries the Paint Trade HQ look. Everything they could do before is still there, one tap away. Their jobs are next. Nothing changes on your side.

## 7. Open questions for Josh (one line each)

1. Tabs **Today · Jobs · Inbox · Learn · Me** — keep, or rename any?
2. C1 as four tabs then C2 adds Jobs (recommended), or C1 + C2 as one round?
3. Greeting by first name — OK?
4. "My hours" under Me opens the existing time-clock screen until C3 — OK, or leave it out until C3?

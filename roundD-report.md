# Round D report (pasted by the agent 25 Oct 2026, with the seven answers to ask-d-report.md)

# Round D done — the distance question (rule Ask), the weather on Today and in the report; follow-up F (password reset by emailed code); three C5 leftovers

Built from `memory/specs/crew/d-round-message.md` (its rules, the F verify list, the leftovers) and the two specs it carries, saved as
`memory/specs/crew/c3-followup-d-notes.md` and `memory/specs/crew/c5-followup-f-notes.md`; prototype the revision-9 `c1-crew-shell.html` already held.
Files only as rule 1 names them (two deviations, flagged below); `app/admin/*` diff empty; `app.json` untouched; no env change; no new package.
TS_ Alpha only, every row made by the tests deleted or restored; `crew_a`'s password restored (login with the original password → 200); the owner's
real tenant read only. What's new: **Draft n 27 "Sign in and out, checked against the job"** (D §9, names Ask them first / Refuse it) and
**Draft n 28 "Forgot your password? Get a code by email."** (F §6) — both `status: draft`, `published_at: null`, not published.

## Verify — testing agent `iteration_d.json`, one iteration, 390 × 844 first then 360 × 800, iPhone Safari UA, TS_ Alpha

D §8:
1. Rule Ask, 1 km from the pinned TS_ job: Sign in → the job → the sheet "You're 1.0 km from the job" / "Your employer sees the distance if you sign in from here." / Sign in anyway / Cancel; Cancel → nothing recorded (`signed_in false`); again → Sign in anyway → the amber block "1.0 km off site / Further than 50 m from the job…"; Live shows the session with `distance_from_site_m 1000.8`, `outside_radius true` — **agent-tested, both sizes.**
2. Signed in, 1 km away: Sign out → "Sign out anyway" with the sign-out line; Cancel → still on the clock; Sign out anyway → "Last signed out … · 0 h 00 m · TS_ Client Two — interior"; the record `sign_out_outside_radius true`, `sign_out_distance_from_site_m 1000.8`, `sign_out_confirmed true`, `confirmed true` — **agent-tested.**
3. Rule Ask, geolocation denied: "We can't find your location" / "Check that location is on for this app. Your employer sees this sign-in without a position if you go on." → Sign in anyway → the grey line; the same sheet with "sign-out" wording at sign-out — **agent-tested, both sizes.** (The Person drawer's "No GPS" is the admin screen, out of scope: the record's `location.address` is "No GPS", as C3.)
4. Rule Flag: the far sign-in records and flags with no sheet; the sign-out stores `sign_out_distance_from_site_m 1000.8`, `confirmed false` — **agent-tested.**
5. Rule Block: the far accurate sign-in refused with the sheet "Your employer only allows sign-ins within 50 m of the job. Get closer and try again." and OK only, nothing recorded; at the pin the sign-in works (distance 0); the far sign-out goes through with no question and is flagged (`sign_out_outside_radius true`) — **agent-tested, both sizes.**
6. General with no position: asked under Ask (then the grey line); recorded with the grey line under Block, no sheet — **agent-tested.**
7. Per-job radius "none": no question at 1 km under Ask at sign-in or sign-out, `distance_from_site_m` and `sign_out_distance_from_site_m` null; the key restored (absent, as before) and the 409 back afterwards — **agent-tested.**
8. Today's job card: "🌧️ 11° · Moderate rain showers · 100% rain" at both sizes = the route's `temp_c 11.3 / Moderate rain showers / rain_pct 100`; the job without an address → `{"weather": null}` (API; the card hides the line when null — the card shows one job, so the no-line state was not seen on screen); the owner's `GET /dashboard/home` `weather_areas` Melbourne row carries the same reading — **agent-tested** (the no-address card: API-verified only).
9. A new report for the job (`?project=` and with no project → the first in-progress job): only **Rainy** pre-ticked (wind 21.5, max 17.7 add nothing — the rule's output for that reading); chips toggle; General → none. **Edit of an older report keeping its stored chips — Unverified** (no stored TS_ report in the run; the prefill effect returns before the fetch when `?edit=` is set). The weather-null case was not reproducible live (Open-Meteo answered) — **Unverified**.
10. `test_d_crew_distance.py` **10 cases green**; the full suite: see below; TS_ torn down; the project's location and radius and the tenant's setting restored (the TS_ Alpha `crew_app_settings` document, which did not exist before the round, deleted); the owner's real tenant read only; `app/admin/*` diff empty — **agent-tested / done.**
No horizontal scroll on Today with the sheet open and on the report form at both sizes; the only console errors the expected 409s.

F:
- F1. "Forgot password?" under the password field, 127 × 44 px; with an email typed → the reset screen with it filled, back "Sign in" — **agent-tested, both sizes.**
- F2. Empty Send → "Enter your email address."; `crew_a`'s email → "Check your email" with the address and the 15-minute line; Set new password with nothing → the two lines; `000000` → "That code isn't right or has expired."; the swapped hash + `482915` + `painter2026` → "Password changed" / "Sign in with … and your new password." → Sign in → the sign-in with the email filled; the new password signs in, the old one → the inline "Invalid credentials" — **agent-tested**; then re-run by me at 360 after the `dismissTo` fix (one login screen mounted, the email carried, the new password signing in). `crew_a`'s password restored through the routes (`{ok: true}`, original password → 200).
- F3. Profile › Change password › "Send me a code" → straight to the code step (no email field, no "Wrong email?", Send another code present, back "Profile") → "Your new password works from now on." → Back to Profile → `/employee/profile`, still signed in, the same bearer still 200 — **agent-tested, both sizes.**
- F4. Unknown email → the same code step — **agent-tested.**
- F5. No horizontal scroll on the three steps at either size — **agent-tested.** `test_f_crew_password_reset.py` **11 cases green**, case 11's two limiter checks against the product backend (6th forgot → 429, 11th reset → 429, `detail: rate_limited`).

Leftovers:
- L1. `features.learn/inbox/documents` false → Learn and Inbox tabs gone, Me's My documents row gone, in-app navigation to `/employee/training` → Today — **agent-tested**. The **cold deep link** to `/employee/training` stayed on the screen in the agent's run: the layout read the settings from the store but nothing on that path fetched them. Fixed (one `useCrewSettings()` call in `app/employee/_layout.tsx`, deviation 1 below) and **re-tested by me at 390**: a fresh load of `/employee/training` with `learn` off lands on `/employee/dashboard`. Settings restored, then the document deleted.
- L2. A 2-second TS_ mp4 uploaded through `POST /admin/crew-app-settings/video` → the invite page's card "Welcome from TS_" at 390 and 360 → tap → a `<video>` in place; `DELETE` → 200, the endpoint 404, no card — **agent-tested**. **Playback Unverified**: the testing Chromium build has no H.264/AAC decoder (`MEDIA_ERR_SRC_NOT_SUPPORTED`); the endpoint serves `video/mp4` with Range 206.
- L3. Draft n 26: card title now "Crew onboarding and documents, rebuilt" (was "Quicker, everywhere"), body `{business_name}` → "your business"; `status: draft`, `published_at: null` — **done, agent-verified in Mongo.** The card as stored:
  > **Crew onboarding and documents, rebuilt** — New starters now scan your invite, see your welcome note and video from Settings › Crew app, and join in four short steps: their details, a photo, their licences with expiry dates, and the Terms and Privacy Policy, which they agree to in the app (we record the version and time, the way we do for you). Crew you add yourself finish the same steps at their first sign-in and set their own password, and anyone can change their password from their Profile. Their Profile shows their documents with expiry status, and they can replace one without losing the rest. Documents you send them to sign have the new crew look, and on the phone they can save their signed copy to Files or share it. Their sign-in no longer carries your private notes or pay rates to their phone. And the switches on Settings › Crew app now do what they say: a feature you turn off disappears from their app. Before you join now also says how your business will contact you and what is kept on record, with a short crew notice you can read any time from Me.

Testing-agent findings fixed after the run (all in named files): the cold-deep-link redirect (above); `fail()` in `dashboard.tsx` prints `detail.message` when a detail is an object (never a React-child crash); the reset screen's Done → Sign in uses `router.dismissTo` (one login screen, the email carried — `login.tsx` re-reads `?email=`). **Not fixed, by rule 1** (see silences 1): the stale-position finding in `utils/crewLocation.ts` (the spec lists it as unchanged).

## Backend changes

- `models/timeclock.py`: `TimeClockSignIn.confirmed`, `TimeClockSignOut.confirmed` (default false).
- `routes/timeclock.py`: `_refusal()` builds Round 79's 409 body plus `rule` and `action`; sign-in: outside + `ask` + not confirmed → 409, nothing written; `block` as built; `confirmed` stored on every record; sign-out: outside + `ask` + not confirmed → 409 `{action: "sign_out"}`, session open; `sign_out_confirmed` stored. Order of checks unchanged.
- `services/crew_app_settings.py`: `RULES` gains `"ask"` (the one accepted value; the 400 text now "Rule is flag, block or ask").
- `services/timesheets.py`: each session row gains `confirmed`, `sign_out_confirmed`, `sign_out_outside_radius`, `sign_out_distance_from_site_m`.
- `services/dashboard_home.py`: `_weather_at_fill` adds `wind_kmh`, `temp_max_c` to the cached dict (the owner's strip ignores them).
- `routes/projects.py`: new `GET /projects/mine/{project_id}/weather` (C2 filter → 404; admin 403; `{weather: null}` without suburb/pin or on any Open-Meteo failure). Round 85 made `_weather_at` answer `None` on a cold cache and fill in the background; the crew route fills the cache **inline** first when cold (`_weather_at_fill`), then reads through `_weather_at` — the phone is waiting for the line, and the second call equals the first (case 9).
- New `routes/employee_password_reset.py`: `POST /employees/forgot-password` (case-insensitive lookup, not deleted; one live code per crew member; sha256 only; 15 min; the email through `send_email` when configured, `ref=` hash prefix logged, never the code; the same 200 either way), `POST /employees/reset-password` (one 400 text for missing / expired / 5 attempts / mismatch, `attempts` incremented on a mismatch; "New password must be at least 8 characters." leaves the code live; sets `password_hash` + `password_changed_at`, marks the code used, `revoke_all_other_sessions` keeping the bearer's jti only when it verifies and its `sub` is the crew member — crew logins are not recorded in `admin_sessions`, so no crew device is signed out, as the spec predicted). `server.py`: the import and `include_router` beside `password_reset_routes`. `rate_limiter.py`: `^/api/employees/forgot-password/?$` 5 / 5 min, `^/api/employees/reset-password/?$` 10 / 5 min per IP.
- Tests: `tests/test_d_crew_distance.py` (10), `tests/test_f_crew_password_reset.py` (11). Case 9 assigns `crew_a` to the seed's project for the call and removes the assignment after (the seed's project has no crew assigned; the crew route reads the assignment).
- Env changes: none. Deleted files: none. Removed routes: none.

## Frontend changes

`app/employee/(tabs)/dashboard.tsx` (`accuracy_m` in both bodies; `refused()` → the sheet from the 409 `detail` — OK-only under block, the question under ask; `anyway()` re-posts the same body with `confirmed: true`, no second `getPosition()`; `askNoGps()` under Ask before the post; the weather line `crew-today-weather`; the sign-out `warning` ignored); new `components/crew/AskSheet.tsx`; new `utils/crewWeather.ts` (`chipsFor`, `fmtDist`); `components/crew/ReportForm.tsx` (the one-shot prefill when the form opens with its job; never on `?edit=`, never on a later job change — it reads `?edit=` itself through `useLocalSearchParams`, so `daily-report/new.tsx` stays untouched); `app/employee/login.tsx` (`employee-login-forgot`; re-reads `?email=`); new `app/employee/reset-password.tsx`; `components/crew/PasswordSheet.tsx` (the line and `crew-pw-forgot`); `app/employee/_layout.tsx` (`reset-password` in the open list; the `useCrewSettings()` call). `useCrewSettings` already exposed `signin` — unchanged. `utils/crewLocation.ts`, `JobPicker.tsx`, `app.json` unchanged.

Two deviations from rule 1's file list, both flagged: (1) `_layout.tsx` gained the one `useCrewSettings()` call — rule 1 allowed only the guard change, but L1's own verify line ("the deep link `/employee/training` lands on Today") fails without it; (2) `login.tsx` gained a two-line effect re-reading `?email=` so Done → Sign in carries the email onto the already-mounted login screen (rule 1 names the file for "the link").

Environment note from the agent: the preview's Metro runs with `CI=true` (no file watching); the frontend was restarted to pick up this round's edits — nothing in the repo changed for it.

## Suite

Before: Round C5 close, 911 passed / 113 skipped in four chunks, the two known order-dependent daily-report tests failing. After:

    chunk 1 · 39 files · 233 passed · 20 skipped · 0 failed
    chunk 2 · 39 files · 202 passed · 67 skipped · 0 failed
    chunk 3 · 39 files · 236 passed · 4 skipped · 1 failed — test_r19_daily_reports::test_42_filters_and_paging (the known order-dependent one, Rounds 84–C5)
    chunk 4 · 39 files · 258 passed · 22 skipped · 8 failed — test_tenant_isolation::test_r19_daily_reports_isolation (the second known one) and 7 `Errno 99`
                                                           connection errors at the tail of the chunk (35 occurrences; the pod's ephemeral-port ceiling)
    re-run of the affected files (test_tenant_isolation, test_timeclock_status_regression, test_xero, test_d_crew_distance, test_f_crew_password_reset):
    62 passed, 1 failed — test_r19_daily_reports_isolation only.

Totals: 936 passed / 113 skipped counting the re-run (911 before + 10 D + 11 F + 4 previously connection-starved), the same two known failures, nothing new.
Isolation run: `test_tenant_isolation.py` green bar the known `test_r19_daily_reports_isolation` (needs a daily report seeded by another file).

## Spec silences (for the owner)

1. **Stale position on the web** (the agent's HIGH finding): expo-location's web `getCurrentPositionAsync` defaults to `maximumAge: Infinity`, and `utils/crewLocation.ts` passes only `accuracy`, so a second tap on the same page can reuse the earlier fix — under Refuse it a crew member who walks to the site can be refused again with the old distance until the page reloads. The spec lists `crewLocation.ts` as unchanged, so nothing was done; the fix is one option (`maximumAge: 0`) in that file — one line for the next crew round. Native (the app build) is not affected the same way.
2. The crew weather route fills a cold cache inline rather than answering `None` and filling in the background (Round 85's owner-strip behaviour) — otherwise the first open of Today after 30 minutes would show no line. Silence in the spec; reversible to the background pattern.
3. `GET /dashboard/home`'s top-level `weather` is `null` while `weather_areas` carries the Melbourne row (the agent's minor note) — pre-existing, not this round's; mentioned for the record.
4. The weather line's emoji is the backend's (the Round 35 `_emoji` table); the prototype's glyphs are the same set.
5. Under Ask, "Sign in anyway" after the no-position sheet records `{address: "No GPS"}` with `confirmed: true`; the owner's drawer has no string for a confirmed no-position sign-in yet (§7's two drawer strings cover the distance only).
6. The report chips prefill only when the form opens with a job; a crew member who opens the form as General and then picks a job gets no chips (§10.6 as decided).
7. The reset code email carries no business name and no link (§3); `send_email`'s safety scan has nothing to check. On the preview no provider is configured, so the code is created and nothing is sent (the warning line in the log, as the admin route does).
8. The sign-in's "Forgot password?" passes the typed email even when it is not a valid address; the reset screen's own check refuses it on Send.
9. Rate-limit arithmetic: five forgot-password calls per IP per five minutes includes "Send another code" taps — a crew member on a shared office network could hit the limit; the limiter's text is the generic `rate_limited`, which the reset screen shows as "No connection. Try again." (the spec gives no string for a 429 here).

---

## Answers

**1. The two deviations from rule 1.**

`app/employee/_layout.tsx` — the whole diff against the "Round C5 done" commit (the `OPEN` line is the change rule 1 allowed; the deviation is the `useCrewSettings()` line and its import):
```diff
 import { useAuthStore } from '../../store/authStore';
+import { useCrewSettings } from '../../hooks/useCrewSettings';
 …
-const OPEN = ['/employee/login', '/employee/onboarding'];
+const OPEN = ['/employee/login', '/employee/onboarding', '/employee/reset-password']; // Round D follow-up F — the reset screen is reachable signed out
 …
-  const crew = useAuthStore((s) => s.crewSettings);
+  const crew = useCrewSettings(); // Round D (L1) — fetched here too, so a cold deep link to a switched-off screen redirects
```
What it fixes: the C5 layout redirected a switched-off screen to Today only when `crewSettings` was already in the store — and only the tabs and Me screens fetched it. A **cold deep link** (`/employee/training` opened as a fresh page load, learn off) mounted the Learn screen with an empty store, so no redirect. `useCrewSettings()` is the C5 hook (one `GET /employee/app-settings` per app open, cached in the store); called from the layout it runs on every crew path, so the redirect fires on a cold load too. Re-tested: fresh load of `/employee/training` with `learn: false` → `/employee/dashboard`.

`app/employee/login.tsx` — the diff (the "Forgot password?" link is the allowed change; the deviation is the `emailParam` effect):
```diff
-  const [email, setEmail] = useState(String(useLocalSearchParams<{ email?: string }>().email || '')); // Round C5 — the wizard's Done / "already on the team" pass it
+  const emailParam = useLocalSearchParams<{ email?: string }>().email;
+  const [email, setEmail] = useState(String(emailParam || '')); // Round C5 — the wizard's Done / "already on the team" pass it
+  useEffect(() => { if (emailParam) setEmail(String(emailParam)); }, [emailParam]); // Round D follow-up F — the reset screen's Done lands back here with the email
 …
+            <Pressable onPress={() => router.push({ pathname: '/employee/reset-password', params: { email: email.trim() } } as any)} style={{ alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' }} testID="employee-login-forgot" accessibilityRole="link">
+              <Text style={{ fontFamily: t.fonts.bodySemi, fontSize: 14, color: t.colors.accent }}>Forgot password?</Text>
+            </Pressable>
```
What it fixes: the reset screen is pushed on top of the sign-in, so when Done → Sign in returns with `router.dismissTo(…/login?email=…)` the **existing** login screen is shown again (one screen, not a second copy). That screen's `useState` initialiser already ran, so without the effect the typed email would not appear; the effect re-reads `?email=` when it changes. Re-tested at 360: one `emp-login-submit` in the DOM, the email filled, the new password signing in.

**2. The three testing-agent findings fixed.**
- *Cold deep link not redirected* (L1, MEDIUM) — symptom: `/employee/training` loaded fresh with `learn` off stayed on Learn. File `app/employee/_layout.tsx`; diff in answer 1 (the `useCrewSettings()` line).
- *Two login screens after Done → Sign in* (F2, LOW) — symptom: `emp-login-*` test ids matched twice; the agent had to use `.first`. Files `app/employee/reset-password.tsx` (the `leave()` line, originally `router.replace`) and `app/employee/login.tsx` (the effect, answer 1):
  ```diff
  -  const leave = () => { if (fromProfile) router.replace('/employee/profile' as any); else router.replace({ pathname: '/employee/login', params: { email } } as any); };
  +  const leave = () => { if (fromProfile) router.replace('/employee/profile' as any); else router.dismissTo({ pathname: '/employee/login', params: { email } } as any); };
  ```
- *An object `detail` rendered as text* (D, LOW, by code review) — symptom: if any non-409 error ever carried a dict `detail`, `fail()` would pass an object to `<Text>` (a React-child crash). File `app/employee/(tabs)/dashboard.tsx`:
  ```diff
     const fail = async (e: any, fallback: string) => {
  -    setErr(e?.response ? (e.response.data?.detail || fallback) : 'No connection. Try again.');
  +    const d = e?.response?.data?.detail;
  +    setErr(e?.response ? ((typeof d === 'string' ? d : d?.message) || fallback) : 'No connection. Try again.');
       await loadStatus();
     };
  ```

**3. The finding not fixed — `utils/crewLocation.ts`.** The lines as they are:
```ts
export async function getPosition(): Promise<Coords | null> {
  const read = async (): Promise<Coords | null> => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return null;
    } catch {
      // no Permissions API in this browser — still try the position call
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude, accuracy } = pos.coords;
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || (latitude === 0 && longitude === 0)) return null;
    return { latitude, longitude, accuracy: typeof accuracy === 'number' ? accuracy : null };
  };
```
On the web, expo-location maps `getCurrentPositionAsync` to `navigator.geolocation.getCurrentPosition` with `{ enableHighAccuracy, timeout, maximumAge }`; with no `maximumAge` given, the web module passes `Infinity`, so the browser may answer from its position cache rather than take a new fix. The sequence that reuses a stale fix: (1) rule Refuse it; the crew member in the ute 300 m from the job taps Sign in → `getPosition()` → the browser takes a fix (300 m) → 409 → the OK sheet; (2) they walk to the door and tap Sign in again **without reloading the page** → `getPosition()` runs again, but the browser hands back the cached 300 m fix (any age is acceptable) → 409 again with the old distance; (3) only a page reload, or the cache expiring on the browser's own terms, gives a fresh fix. Under Ask the same reuse makes the question repeat the earlier distance. The native build is not affected the same way (expo-location native takes a fresh fix unless `maximumAge` is set). Smallest change for the next round, one line in that file: `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, maximumAge: 0 })` — forces a new fix every tap (a few seconds longer on web; the 10-second race already covers it). Nothing changed now.

**4. TS_ Alpha's `crew_app_settings`.** It did **not** exist before the round. The fixture print at setup, before any PUT, was `"crew_app_settings_doc_before": null` (the tenant's settings are the service's defaults until the owner saves once; `GET /admin/crew-app-settings` answers from defaults). The testing agent's PUTs created the document; my teardown deleted it ("deleted: 1") to put the tenant back to no document, which is the state it started in. Nothing to restore; the seed tenant itself has since been torn down (0 TS_ admins).

**5. The two Unverified items, now run at 390 × 844 on TS_ Alpha** (iPhone Safari UA; TS_ Alpha re-seeded; a second TS_ job "TS_ No address job" `in_progress`, no address; both assigned to `crew_a`):
- **Weather-null on Today's job card**: with the no-address job first on the card (earlier `start_date`) — `crew-today-jobcard-name` "TS_ No address job", `crew-today-weather` count **0** (no line). With the pinned job back on the card — "TS_ Client Two — interior", the line "🌧️ 11° · Moderate rain showers · 100% rain". **Verified.**
- **Edit keeps stored chips**: new report `?project=<pinned job>` → prefilled **Rainy** only; unticked, ticked **Sunny + Hot**, one "What was done" line, Send → the report list, the report stored (`9304f720…`). Then the forecast changed: the job moved to Darwin (a new report for it now prefills **Rainy + Hot** — a different reading). Open the stored report → Edit → `/employee/daily-report/new?edit=9304f720…` → chips **Sunny + Hot**, still Sunny + Hot 2.5 s later (no prefill fetch on edit); scrollWidth 390/390. **Verified.**
- Deleted: the TS_ report (1), the no-address job (1); then `seed.py teardown` → 0 TS_ admins; `daily_reports` 1 → 1 and `projects` back to the pre-seed count. The weather cache entry for `<TS_ admin>:Melbourne` / `:Darwin` is process memory and expires in 30 minutes (keyed by a now-deleted admin id; nothing reads it).

**6. Drafts as stored** (collection `updates`, `owner: platform`, `audience: admins`, `email: false`, one card each, `icon: sparkle`; the card title equals the draft title):
- **n 27** — `status: 'draft'`, `published_at: null`. Title: **Sign in and out, checked against the job**. Body:
  > Your crew app now follows your Crew app settings when someone signs in or out. With the rule set to Ask them first, a crew member further than your distance from the job is asked "Sign in anyway?" before anything is recorded — and the same when they sign out — and what they confirm shows in Timesheets with the distance. With Refuse it, a sign-in from too far away is refused; a sign-out is always allowed, so nobody is left stuck on the clock. Today's job card on their phone also shows the weather for the job's suburb, and their daily report starts with the weather already ticked.
- **n 28** — `status: 'draft'`, `published_at: null`. Title: **Forgot your password? Get a code by email.** Body:
  > Crew can now reset a forgotten password themselves: tap "Forgot password?" on the sign-in, get a 6-digit code by email, set a new password. The same link sits in Profile › Change password for anyone who can't remember their current one. Codes last 15 minutes and work once.
- **n 26** — `status: 'draft'`, `published_at: null`; card title **Crew onboarding and documents, rebuilt** (corrected from "Quicker, everywhere"); card text as corrected:
  > New starters now scan your invite, see your welcome note and video from Settings › Crew app, and join in four short steps: their details, a photo, their licences with expiry dates, and the Terms and Privacy Policy, which they agree to in the app (we record the version and time, the way we do for you). Crew you add yourself finish the same steps at their first sign-in and set their own password, and anyone can change their password from their Profile. Their Profile shows their documents with expiry status, and they can replace one without losing the rest. Documents you send them to sign have the new crew look, and on the phone they can save their signed copy to Files or share it. Their sign-in no longer carries your private notes or pay rates to their phone. And the switches on Settings › Crew app now do what they say: a feature you turn off disappears from their app. Before you join now also says how your business will contact you and what is kept on record, with a short crew notice you can read any time from Me.

**7. Git.** `git diff --name-status <Round C5 done> HEAD` (the platform checkpoints the tree after each turn; I committed nothing; `memory/tmp` and the platform's own `memory/PARKING_LOT.md` entry excluded; working tree clean now):
```
M  backend/models/timeclock.py
M  backend/rate_limiter.py
A  backend/routes/employee_password_reset.py
M  backend/routes/projects.py
M  backend/routes/timeclock.py
M  backend/server.py
M  backend/services/crew_app_settings.py
M  backend/services/dashboard_home.py
M  backend/services/timesheets.py
A  backend/tests/test_d_crew_distance.py
A  backend/tests/test_f_crew_password_reset.py
M  frontend/app/employee/(tabs)/dashboard.tsx
M  frontend/app/employee/_layout.tsx
M  frontend/app/employee/login.tsx
A  frontend/app/employee/reset-password.tsx
A  frontend/components/crew/AskSheet.tsx
M  frontend/components/crew/PasswordSheet.tsx
M  frontend/components/crew/ReportForm.tsx
A  frontend/utils/crewWeather.ts
M  memory/PRD.md
A  memory/reports/round-d-distance-weather-reset-report.md
A  memory/specs/crew/c3-followup-d-notes.md
A  memory/specs/crew/c5-followup-f-notes.md
A  memory/specs/crew/d-round-message.md
```
Nothing under `frontend/app/admin/*`; `app.json`, `.env` files, `package.json`, `requirements.txt` unchanged.

Report pasted.

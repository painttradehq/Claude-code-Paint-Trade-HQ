# Crew app — re-check of handover §2–§4 against the current code (11 October 2026)

Clone: `painttradehq/the-newest-update-of-pthq` at **`dae9a2f`** (11 Oct 2026, "Round 73 §8 answers"), 44 commits after the `7139b03` (Round 64) state the handover was written from. Where this file and `crew-app-handover.md` disagree, this file wins.

## 1. Headline

- **Nothing under `frontend/app/employee/` changed** since `7139b03`: same 15 files, same 6,594 lines, byte for byte. The only crew-visible change is the shared `components/BrandLogo.tsx` (Round 71), so the crew login and dashboard already show the purple tile mark.
- The handover table (§2.2) **missed one component and one folder**, and one of its §3 items is already done. Details below.
- Everything else in §2–§4 (routes, auth, geofence, app.json, missing modules, PWA manifest, black-and-coral styling, parked work) is confirmed.

## 2. Corrections to the handover

| § | Handover said | Current code |
|---|---|---|
| 2.2 dashboard | Tile grid, accomplishment popup, Sign out | Also renders **`components/SignInOutWidget.tsx`** (468 lines) at `dashboard.tsx:210`: a slide-in clock with an edge tab (`signinout-edge-tab`). Reads `GET /timeclock/status`, signs in / out with the **browser** geolocation and **no project** (`POST /timeclock/sign-in {location, notes:null}`), shows an `outside_radius` badge (`widget-outside-radius-badge`) and a distance warning (`widget-outside-warning-banner`, "⚠️ You're {n} m from …"), links to the full clock (`widget-open-full-timeclock`). The same component is rendered on the admin dashboard (the status route returns a benign payload for admins). **C1's Today card takes over this widget's calls.** |
| 2.2 login | — | Test ids are **`emp-login-username`, `emp-login-password`, `emp-login-error`, `emp-login-submit`** (not `employee-*`). Title "Employee Login", sub "Access your employee portal", button "Login", second button "Back to Home" (`router.back()`), empty-fields error "Please fill in all fields", `BrandLogo size={120}`, `StatusBar style="light"`. |
| 2.2 onboarding | Sets `agreed_to_terms` silently; Terms/Privacy never shown | Still true for the app's Terms and Privacy. But step 5 ("Terms & Conditions") shows a **hard-coded "Josh Sano Painting & Decorating - Employment Agreement"** (Punctuality, Safe Work Practices, Professional Conduct, Quality Standards) with a typed-name signature that is required (`onboarding.tsx:330, 741–790`). The text is Sano's, in a multi-tenant app. Backend `routes/employees.py:58` stores `agreed_to_terms` as True whatever is sent. → C5 and the lawyer (the real employment agreement is the Round 22 contract flow). |
| 2.1 / 2.4 | "The crew app is not a separate app" | Still true for the crew code, but the repo also holds **`mobile/`**: an Emergent scaffold from 17 Sept (`memory/MOBILE_BRIEF.md`, "DO NOT START YET"), 107 lines, a static image on black, bundle id `com.emergent.painttradeweb.z2vdfu`, its own `yarn.lock` (expo 54.0.36, react-native-webview, expo-secure-store). Nothing imports it; it was already there at `7139b03`. **Not the crew app; never build in it.** Delete or ignore in C8. |
| 3 training row | `react-native-webview` (**add**) | **Already installed** in `frontend/package.json`: `react-native-webview 13.15.0`. No add needed. |
| 3 colors.ts row | `localStorage` read at module load needs a guard | **Already guarded**: `utils/colors.ts:141` and `:176` check `typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'`. Nothing to do in C1. |
| 3 session row | "check the crew path" for 401 | **Confirmed bug**: `utils/api.ts` ~line 105 redirects every web 401 to **`/admin/login`**, crew included. C1 fixes it by `userRole`. |
| 2.3 / 4.4 | Fixing the geofence needs a job picker; no crew job data | Jobs already carry **`assigned_employee_ids`** (Round 40: `PUT/GET /projects/{id}/crew`, admin-only). There is **no crew-side read** of projects (`routes/projects.py` never uses `get_current_employee`). C4's `GET /projects/mine` (employee JWT, `owner_admin_id` = mine, `assigned_employee_ids` contains me) is the missing piece; C2's picker can use it if C4 moves ahead of C2. |
| 2.2 daily-report | push comment at `daily_reports.py:502` | Line **505** now; same text. The notification it inserts has `link: /employee/daily-report?report={id}`. |
| 2.1 | "Powered by OpenAI" pill: check | **Still there**: `app/index.tsx:105–109`, `testID="openai-pill"`, styles `openaiPill*` at 271–299. → C1. |

## 3. Confirmed as written

- Expo 54.0.35 / RN 0.81.5 / expo-router 6.0.24; **no `eas.json`**; `app.json` unchanged (name "For Painters", slug `for-painters`, scheme `jscrew`, `com.sanopaint.crew`, portrait, `supportsTablet true`, only `NSPhotoLibraryUsageDescription` and `READ_MEDIA_IMAGES`, plugins router/splash/web-browser/font). Splash and adaptive-icon backgrounds are still **`#000`** under the new mark.
- Installed: expo-location 19.0.8, image-picker 17.0.11, document-picker 14.0.7, file-system 19.0.23, sharing 14.0.7, linking 8.0.12, async-storage 2.2.0. **Not installed:** expo-notifications, expo-camera, expo-device.
- Icons: `assets/images/icon|adaptive-icon|splash-icon|favicon|logo.png` and `public/icons/*` regenerated 9 Oct (Round 71) from the extended-P masters now in `assets/brand/pthq-mark.svg` and `pthq-tile.svg`; four React leftovers deleted. `public/sw.js` cache **`pthq-shell-v2`**. `public/manifest.webmanifest` still admin-only (`start_url /admin/dashboard`).
- 14 of 14 crew screens import `utils/colors.ts`; none import `theme/tokens.ts`. `components/Button.tsx` and `Input.tsx` (used by login and onboarding) also import `Colors`. `theme/tokens.ts` exports `tokens`, `t`, `PAGE_TITLE`, `PAGE_HEADER_ROW`, `PAGE_CONTENT`.
- Routing: `app/_layout.tsx` is one Stack; it names only `employee/login` (title "Employee Login") and `employee/onboarding`; there is **no `app/employee/_layout.tsx`**. `app/index.tsx:26` redirects a signed-in employee to `/employee/dashboard`.
- Backend: `get_current_employee` used in contracts (6), equipment (5), timeclock (4), daily_reports (4), performance (2); geofence `routes/timeclock.py:85–144` runs only with `project_id` (business check at :92–94). `GET /timeclock/status` returns `{signed_in:true, session:{id, project_name, sign_in_time, location, …}}` or `{signed_in:false, last_sign_out, last_project}`. `GET /timeclock/my-records` rows carry `project_name`, `sign_in_time`. No push-token code anywhere. Employee contracts: `status` is `sent` (awaiting the crew signature) → `signed` → `countersigned_at`; `GET /employee-contracts/mine` excludes `superseded` and withdrawn.
- Auth store keys `authToken`, `userRole`, `userId`, `userData` (plus `subscription_cache_v1` cleared on logout). `utils/api.ts`: web = page origin, native = `EXPO_PUBLIC_BACKEND_URL`, 30 s timeout.
- Time clock web-only lines: `navigator.geolocation` at `time-clock.tsx:66–67`, nominatim at `:75`, `project_name || 'General'` at `:143`, 60 s poll at `:56–58`. Contracts blob download `contracts.tsx:154`; onboarding `URL.createObjectURL` `:64`; training iframe + message listener `training.tsx:55, 176–177`, native `Linking.openURL` `:82`.
- §4 parked items confirmed in `memory/specs/daily-reports/daily-reports-notes.md` (line 3, 54) and `memory/specs/equipment/equipment-notes.md` (§6, line 70).

## 4. What this changes for the plan

1. **C1 is frontend-only.** No new route, no backend change, no isolation test to extend. The Today card reuses the widget's three calls; the hubs only link to existing screens.
2. Drop the `localStorage` guard from C1 (already there). Add the **401 → role-aware redirect** instead.
3. Record the `mobile/` folder and the hard-coded Sano agreement as findings for Josh; neither is C1 work.
4. The handover's `employee-*` test-id note stands for new ids; the login keeps its existing `emp-login-*` ids so the testing agent's selectors keep working.

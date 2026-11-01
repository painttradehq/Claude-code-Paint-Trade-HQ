# Follow-up G — "We've updated our Terms": a one-time gate for crew when the Terms version moves (v1, 1 Nov 2026 — PARKED by Josh: no live users yet; build before launch or at the first Terms change after crew exist)

Prototype: `#s-terms` in `c1-crew-shell.html` (`crew-terms`), deep link `?screen=terms-update`; checks in `tools/test_c1.js` (section "Follow-up G"; 476 total, 390 × 844 and 360 × 800; `shots-f/g-terms-*.png`). Prompted by Josh, 1 Nov: "I have updated the terms of use for the app, you probably want to update that too." Parked 1 Nov (Josh: "there is no live users yet so it's not necessary"). Prototype and spec kept; goes into the pre-launch round.

## 1. Why

Admins already have this: `GET /api/legal/status` compares the live Terms version (`routes/legal.py::current_version()`, read from the Terms header) with the version on the admin's record and the admin app shows a notice until `POST /api/legal/accept` stamps the new version (Round 17c §3). Crew have nothing: C5 records `terms_version` at register/finish only, so a crew member who joined under 1.1 keeps working under 1.2, 1.3 … with no record of having seen them. The admin routes read `db.admins`, so a crew token would always get `needs_notice: true` — they cannot be reused as they are.

## 2. What the crew member sees

At app open, after sign-in and after the C5 finish path (which wins when both apply), when the backend says the Terms moved: one screen, no tab bar, no back — title **"We've updated our Terms"**, the line **"Paint Trade HQ's Terms of Service changed on {updated}. Have a read, then tick to keep using the app."** (`updated` = the Terms header's date, e.g. "1 November 2026"), the agreement row exactly as onboarding step 4 (**"I've read and agree to the Terms of Service and the Privacy Policy."**, the two links open `/terms` and `/privacy` without ticking), the button **Continue**, and under it a small **Sign out** link. Continue without the tick → the row outlined red and **"Tick the agreement to continue."**; with the tick → `POST /employee/legal/accept` → Today (or the screen the deep link asked for). Sign out → the sign-in screen. No banner, no "what changed" summary (the Terms have no changelog; the lawyer's wording is the source), nothing else on the gate. Once accepted it never shows again for that version.

## 3. Backend (`routes/legal.py`, two crew routes beside the admin pair; nothing else)

- **`GET /employee/legal/status`** (`get_current_employee`) → `{current_version, accepted_version, accepted_at, needs_notice, updated}`: `current_version = current_version()`; `accepted_version` = the employee's `terms_version` (null for pre-C5 crew); `needs_notice = accepted_version != current_version`; `updated` = the date part of the Terms header (`load_doc("terms")["updated"]`, already parsed for the public page). A pre-C5 crew member with no `terms_version` gets `needs_notice: true` once, which is right: they never accepted in the app.
- **`POST /employee/legal/accept`** (employee; body `{}`) → `$set {terms_version: current, terms_version_shown: current, terms_accepted_at: now, terms_accepted_ip: client_ip(request)}` on the employee (the C5 field names); response `{terms_version, terms_accepted_at}`. Idempotent.
- No admin route, no admin screen, no notification; the owner's Team page already shows `terms_version` per crew member if the admin chat wants it (admin item).

## 4. Frontend

- `app/employee/_layout.tsx`: after the C5 finish-path rule, one more: when signed in and `legal/status` says `needs_notice`, every crew path except `/employee/terms-updated`, `/employee/login`, `/employee/onboarding` and the public pages redirects to `/employee/terms-updated` (the status is read once per app open with `useCrewSettings`'s pattern; cached in the store as `termsNotice`). After accept the store flag clears and the layout lets the original path through.
- New `app/employee/terms-updated.tsx`: the screen of §2; the agreement row is C5's component or markup; `router.replace` to the intended path (or Today) after accept; Sign out = the Me tab's sign-out action.
- `store/authStore.ts`: `termsNotice: {needs_notice, updated} | null` and its setter. No new package.

## 5. Tests — `backend/tests/test_g_crew_terms_gate.py` (Round 43 fixtures)

1. `crew_a.get("/employee/legal/status")` → 200 with keys exactly `current_version, accepted_version, accepted_at, needs_notice, updated`; `current_version` equals `GET /api/public/legal/terms`'s `version`.
2. `$set` crew_a's `terms_version` to `"0.1"` → `needs_notice True`; `crew_a.post("/employee/legal/accept", json={})` → `{terms_version: current, terms_accepted_at}`; status → `needs_notice False`, `accepted_version == current`; the record has `terms_version_shown == current` and a non-empty `terms_accepted_ip`.
3. `$unset terms_version` (a pre-C5 crew member) → `needs_notice True`; accept → False.
4. `admin_a.get("/employee/legal/status")` → 403; `admin_a.post(".../accept")` → 403.
5. Teardown: crew_a's `terms_version`, `terms_version_shown`, `terms_accepted_at`, `terms_accepted_ip` restored to their values before the test.

## 6. What's new (Draft)

**Title:** Crew see updated Terms before they carry on
**Body:** When the Terms of Service change, each crew member is asked to read and agree to the new version the next time they open the app, the same way you are. We record the version and time against their record.

## 7. Open points

1. **The new Terms text** (Josh updated it, 1 Nov): I could not read the live `/api/public/legal/terms` from this session (the preview host is blocked here). Needed to check the crew-facing clauses (age, crew accounts, location, documents) against the "Before you join" facts and the crew notice, and to date the gate's line. Josh uploads the new `terms.md` here, or the next job ask pastes it.
2. Should the gate also re-show the **crew notice** when its version moves? Not now: the notice is informational, not an agreement.
3. Pre-C5 crew with no recorded acceptance see the gate once at their next open. Alternative: skip them until the next Terms change.

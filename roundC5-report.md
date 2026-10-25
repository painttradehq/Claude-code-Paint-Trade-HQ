# Round C5 report (pasted by the agent 25 Oct 2026, with the six answers to ask-c5-report.md)

# Round C5 done — Documents: onboarding rebuilt, Profile with documents and a password change, My documents restyled, the crew notice

Built from `memory/specs/crew/c5-round-message.md` (the brief, its rules and the 25 Oct amendment) and the v3 spec it carries (identical to
`c5-documents-notes.md`), against the revision-9 prototype saved over `memory/specs/crew/c1-crew-shell.html`. Crew app and crew routes only;
`app/admin/*` diff empty; `app.json` untouched; no env change; no new package. TS_ Alpha rows only, torn down by the suite harness; `crew_a`'s
record restored by the test module; the owner's real tenant read only. What's new **Draft n 26 "Crew onboarding and documents, rebuilt"**
(§9 body plus the amendment's sentence) — not published.

## Verify (§8 + the amendment's two) — testing agent `iteration_c5.json`, 390 × 844 first, then 360 × 800, iPhone Safari UA, TS_ Alpha

1. Invalid link → the one screen, no form, "Already on the team? Sign in" → sign-in; the real code → "Join TS_ Alpha Painting", "TS_ Alpha Owner has invited you." — **agent-tested, both sizes.**
2. Step 1: every error inline on an empty Continue (the six texts exact), stays on step 1; a 14-year-old refused ("You need to be 15 or older…"); 16-year-old shows the guardian note and continues; a 7-character password refused; Back keeps the values — **agent-tested, both sizes.**
3. Step 2: the photo sheet offers camera and library; Skip for now; (a library photo making the button "Continue" — Unverified: headless Chromium has no library; the code path is the C4 one.) — **agent-tested bar the library pick.**
4. Step 3: Continue with nothing → the two required rows "Add this one to continue."; a PNG to Driving licence with its expiry; a PDF to White card; a .txt refused with "Choose a photo or a PDF."; Continue — **agent-tested, both sizes.**
5. Step 4: the facts name the business; Join without the tick → "Tick the agreement to continue."; the Terms link opens `/terms` without ticking; tick → Join → Done → Sign in with the email filled → sign-in works — **agent-tested, both sizes** (web `router.push`; the native `WebBrowser` branch Unverified — no build). The Mongo record: `terms_version` = the live Terms version (`1.2`), `terms_version_shown`, `terms_accepted_at`, `terms_accepted_ip`, `notice_version`, `agreed_to_terms`, both documents and expiries, `owner_admin_id` — **pytest case 2 and 12.** The owner's Employee page showing the starter as onboarded with both documents — Unverified in the browser (admin screens were out of scope for the agent; the record carries `onboarding_complete: true` and the two documents).
6. Profile: the card with role and business ("Painter · TS_ Alpha Painting"); email read-only with its hint; the eight rows with the seeded statuses (Expires in 12 days amber · Expired red · Required · not uploaded red · On file · expires 1 Jan 2028); add White card → saves at once and the other three rows keep their files (API check); set its expiry → the row updates; change the name → Save → "Saved"; Back → Me — **agent-tested, both sizes.** View opening the file, the yellow-flag 403 line, and the owner's page showing the new expiry — Unverified (not exercised by the agent; the 403 is the backend's existing rule surfaced as `crew-profile-err`).
7. My documents: the list and its meta line — **agent-tested**; the open-document / question / sign / countersign / download / ended flows — **Unverified in the browser**: TS_ Alpha had no contract for `crew_a` (the agent could not issue one without the owner's screens). The routes and rules are unchanged from Round 22 and `test_r22_contracts.py` is green; the restyled screen's empty-question line, the sign-sheet empty line and cancel were coded per §4.
8. `test_c5_crew_documents.py` — **12 cases green**; `test_r22_contracts.py`, `test_r44_hygiene.py`, `test_employees_round5.py` green; `test_tenant_isolation.py` green bar the known order-dependent `test_r19_daily_reports_isolation` (needs a daily report seeded by another file; the same at the Round 85/86 commits). Full suite: see below.
9. `POST /employees/login` for a TS_ crew member returns none of `notes, hourly_rate, daily_rate, strikes, leave, documents, document_expiry_dates, profile_photo, flagged_by, password_hash`; `GET /employees/{me}` as crew has no unshared coaching note, no `contracts`, and `business_name` — **pytest cases 2 and 7.** The crew Coaching screen still showing the shared ones — Unverified in the browser (it reads the same filtered `strikes`).
10. The owner's switches: the hook, the hidden tabs (Learn, Inbox), Today's End of day row, Me rows (My documents, My equipment, Team events), the job page's photos and Daily report button, and the layout's hidden-screen redirect to Today are coded — **Unverified end to end**: flipping TS_ Alpha's switches needs the owner's Settings › Crew app screen, out of the agent's scope this round. `test_10` confirms `features.jobs` is always true.
11. The welcome video: the card, the in-place player (web `<video>`, native expo-av) and the query credential — the credential **pytest case 10** (401 without, same status by token and by invite, 404 for another business and a wrong code); the card itself Unverified (no TS_ video upload; the owner's upload screen is out of scope).
12. `DocumentUploader.tsx` deleted (no other importer); `app/admin/*` diff empty; `app.json` untouched; `tsc --noEmit` exit 0; no console errors beyond the expected 400/404 API rejections; **390 and 360 with no horizontal scroll** (scrollWidth = viewport on the welcome, step 1, photo, documents, agree, crew notice, profile, documents list and Today) — **agent-tested.** The 430 px column at 1280 wide — Unverified this round (unchanged layout from follow-up C).
13. *(amendment)* Step 4 shows four facts and "Read the full crew notice"; the link opens `/crew-notice` with "TS_ Alpha Painting" filled in and the version line "Version 1.0-draft · 25 October 2026" — **agent-tested, both sizes.**
14. *(amendment)* Me › footer "Privacy · Terms · Crew notice" opens the same page with the business name — **agent-tested, both sizes.**

Testing-agent run: one iteration, `/app/test_reports/iteration_c5.json`, 73 of 74 checks per size (item 7's sign flow untestable without a contract).
Two findings from it, both fixed after the run: the finish path now prefills the wizard's document rows from what the owner already uploaded
(a licence on file is not asked for again; only new `data:` files are sent); the document sheet's Done uses the date check's result directly.
The agent also noted that `crew_a` in the suite seed had `onboarding_complete: false` (the admin create route stores it so) and was therefore sent
to the finish path — the seed now states the flag explicitly (`tests/seed.py`, one line); real crew the owner added before C5 who never finished
anything get the finish path at their next open, as §7 says.

## Backend changes

- `routes/employees.py`: new public `GET /employees/invite` (business, owner, Round 79's `onboarding {headline, note, video}`; 404 for a dead link; declared above `GET /employees/{employee_id}`); new `PUT /employees/password` (current + new ≥ 8; "That isn't your current password."; the yellow-flag 403); new `POST /employees/onboarding/finish` (temporary password verified, the register rules, documents merged per key, the terms record, `onboarding_complete`, 400 "Already finished"); `POST /employees/register` in the spec's order — invite before email, then agreement / age ≥ 15 / password ≥ 8 / file type and 5 MB / expiry format — storing `terms_version` (from `routes.legal.current_version()`), `terms_version_shown`, `notice_version`, `terms_accepted_at`, `terms_accepted_ip`, `welcome_seen_at`, and answering `{id, name, email}`; `PUT /employees/{id}` for crew callers validates as register and merges `documents` / `document_expiry_dates` per key (`null` unsets; unknown key 400); `GET /employees/{id}` for crew callers drops `contracts`, unshared `strikes`, `flagged_by`, `deleted_by` (plus the three pay/notes fields as before) and adds `business_name`; `POST /employees/login` drops the eleven private/bulky keys.
- `routes/contracts.py`: `_crew_name()` — the crew member's name in the `/viewed`, `/sign` and `/question` audit lines (three lines).
- `models/employee.py`: `EmployeeCreate.terms_version`, `EmployeeCreate.notice_version`.
- **`routes/crew_app_settings.py`** declares `GET /employee/onboarding/video` (found with `grep -rn 'onboarding/video' backend/routes`): the bearer dependency is now optional — `?token=` (verified exactly as the header) or `?admin_id=&code=` (a valid, active invite → that business; otherwise 404 "no longer valid"); none → 401. Streaming unchanged.
- `rate_limiter.py`: `^/api/employees/invite/?$` 10 / 5 min, `^/api/employees/register/?$` 30 / 5 min per IP (the 11th invite probe → 429, pytest case 5 against the product backend).
- Amendment: `content/legal/crew-notice.md` (header `Version 1.0-draft · 25 October 2026`, the eight parts word for word from the prototype's `renderNotice`, `{business_name}` literal, the last part's link to `/privacy`); `routes/legal.py` gains the `crew-notice` key (nothing else); `/api/public/legal/anything-else` still 404.
- `tests/test_c5_crew_documents.py` (12 cases); `tests/test_employees_round5.py` — one register body gained `dob` and `agreed_to_terms` (the route now requires them; the test's intent, a rotated-code check, is unchanged); `tests/seed.py` — the explicit `onboarding_complete` flag (written to the record); `tests/test_r35_part_b_dashboard.py` — `onboarding_completed` in the allowed kinds (see Suite).
- Env changes: none. Removed routes: none. Deleted files: `frontend/components/DocumentUploader.tsx`.

## Frontend changes

`app/employee/onboarding.tsx` (rewritten: invite check, welcome with headline/note/video, four steps, Done, the finish path, the dup card);
`app/employee/profile.tsx` (rewritten); `app/employee/contracts.tsx` (restyled in place; same calls); `app/employee/_layout.tsx` (the finish-path
rule and the hidden-screen redirect); `app/employee/login.tsx` (one line: `?email=`); `(tabs)/_layout.tsx`, `(tabs)/dashboard.tsx`, `(tabs)/me.tsx`
(switches; the Crew notice footer link), `project/[id].tsx` (switches); new `components/crew/WelcomeVideo.tsx`, `DocSheet.tsx`, `PhotoSheet.tsx`
(also exports the shared `Sheet` base), `PasswordSheet.tsx`; new `utils/crewFiles.ts`, `hooks/useCrewSettings.ts`; `store/authStore.ts`
(`User.onboarding_complete`, `crewSettings` + its setter — the second addition is the store slot the hook needs); new `app/crew-notice.tsx`.
One file outside the list, by necessity of the amendment's own wording ("read by the same `LegalPage`"): `components/legal/LegalPage.tsx` accepts the
third key, fills `{business_name}` from `?bn=` (else "your employer") and carries the prototype's test ids on that page only; `/terms` and `/privacy`
render as before.

## Suite

Before (Round 86 close): 894 passed / 113 skipped in four chunks, the two known order-dependent daily-report tests failing. After: see the
last section (same four chunks, this pod's 1,024 ephemeral ports).

    chunk 1 · 39 files · 214 passed · 20 skipped · 0 failed
    chunk 2 · 39 files · 212 passed · 67 skipped · 0 failed
    chunk 3 · 39 files · 229 passed · 4 skipped · 2 failed — test_r19_daily_reports::test_42_filters_and_paging (the known order-dependent one, as in Rounds 84–86)
                                                           and test_r35_part_b_dashboard::test_activity_kinds_subset (new, see below)
    chunk 4 · 38 files · 256 passed · 22 skipped · 5 failed — test_tenant_isolation::test_r19_daily_reports_isolation (the second known one),
                                                           and 4 `Errno 99` connection errors at the tail of the chunk (the pod's ephemeral-port ceiling)
    re-run of the affected files (test_r35_part_b_dashboard, test_tenant_isolation, test_timeclock_status_regression, test_r19_daily_reports,
    test_c5_crew_documents, test_r22_contracts): all green bar the two known order-dependent daily-report tests.

Totals: 911 passed / 113 skipped (894 before; +12 C5 cases, +5 from previously connection-starved files now green), the same two known failures.

The one new failure: `test_activity_kinds_subset` lists the kinds the Dashboard's Recent activity may emit and never had `onboarding_completed` — a
kind `services/dashboard_home.py` has emitted since Round 42 for any onboarded crew member. The seed never produced one (the admin create route ignores
the flag), so the gap never showed; with `crew_a` now marked onboarded it did. The kind was added to the test's allowed set (one line; Round 35's
forbidden set untouched). The seed sets the flag straight on the record so the seed itself adds no "finished onboarding" activity row.

## Spec silences (for the owner)

1. A crew member who opens the invite link while **signed in** as someone else: the wizard runs as the public path (the invite check needs no token); the spec does not say whether to sign them out first — nothing is done.
2. The finish path when the owner already uploaded documents: the rows now show them as "Added" and are not asked for again (the agent's finding); the spec only describes the register path's empty rows.
3. The welcome video's **poster**: the prototype shows a play circle on a plain tile; no frame of the video is fetched (nothing is downloaded until the tap), so the card is the accent tile with the circle.
4. `GET /employees/{me}` for the crew now also returns `business_name`; the Me card still reads "{role} · Your details, documents and photo" (C1's line) — the spec puts the business name on Profile only.
5. The "Already on the team" card's **Sign in** passes the typed email; the spec is silent on what happens to the rest of the draft (it is lost, as a closed page is).
6. Pre-C5 crew with `onboarding_complete: false` and no temporary password they remember have no way through the finish path (the owner cannot reset a crew password; §7 notes the missing crew "Forgot password?"). Nothing is done here — the one-time sign-in link round is the remedy the spec names.
7. The crew notice on **native** opens in the system browser with `?bn=`; the in-app `LegalPage` still renders raw markdown on native (§7, unchanged).
8. `document_expiry_dates` set through the sheet while the file pick is still uploading: Profile saves each at once in sequence; a failed save shows the line above the bar and the row keeps the server's value.
9. The Me row counts and the hidden-screen redirect rely on `GET /employee/app-settings` once per app open; a switch flipped by the owner reaches the phone at its next open (the spec: "read once per app open").

---

## Answers

**1. The two files outside rule 1's list.**

`backend/tests/seed.py` (diff against the Round 86 commit `cab3e38`):
```diff
@@ -91,8 +91,8 @@ def _employee(tok: str, acct: C.Account, name: str, onboarded: bool) -> str:
         body["onboarding_complete"] = True
     r = _req("POST", "/employees", tok, json=body).json()
     eid = r.get("id") or r.get("_id")
-    if not onboarded:
-        _req("PUT", f"/employees/{eid}", tok, json={"onboarding_complete": False})
+    # the admin create route always stores onboarding_complete=False (Round C5: the finish path reads it) — the seed states it explicitly either way
+    _db().employees.update_one({"_id": eid}, {"$set": {"onboarding_complete": bool(onboarded)}})  # straight to the record: no "finished onboarding" activity row from the seed
     return eid
```
`backend/tests/test_r35_part_b_dashboard.py`:
```diff
 VALID_ACTIVITY_KINDS = {"quote_signed", "quote_declined", "invoice_paid", "equipment_requested", "products_refreshed",  # Round 63
-                        "contract_signed", "project_created", "project_finished"}
+                        "contract_signed", "project_created", "project_finished",
+                        "onboarding_completed"}  # Round C5: the seed now marks crew_a onboarded
```
Does anything depend on `crew_a` being un-onboarded? No. A grep of `backend/tests/` for `onboarding_complete` finds: `test_desktop_employees_r5.py:98` asserts `False` on an employee *it creates itself* through `POST /employees` (the create route's behaviour, unchanged); `test_r21_timesheets.py:37` creates its own third crew member; `test_r81_pay_hours.py` sets and restores the flag on its own records; `test_c5_crew_documents.py` creates its own un-onboarded crew for the finish path and restores `crew_a` afterwards. Nothing reads `crew_a`'s flag expecting `false`; the full-suite run above (chunks 1–4 plus the re-run) is the evidence — the only test that moved was `test_activity_kinds_subset`, for the reason in the Suite section.

**2. The one-document sign flow, now run in the browser.** TS_ Alpha re-seeded (`tests/seed.py ensure`); as `admin_a`, `PUT /contract-templates/confidentiality` then `POST /employee-contracts/issue` for `crew_a` (the Round 22 route; `admin_a` passes the Pro gate as a trialing signup). As `crew_a`, iPhone Safari UA:
- **390 × 844** — My documents: "1 to sign", one row "Confidentiality · Sent 25 Oct 2026 · Awaiting signature". Open: title, pill + "Sent 25 Oct 2026", the serif text with the unfilled `[BUSINESS]`/`[EMPLOYEE NAME]` tokens highlighted (`crew-contract-unfilled` × 4 — my test template used tokens the Round 22 fill does not know, so the highlight is the C5 behaviour showing, not a bug), the question box. Send with nothing → "Write your question first."; a real question → "Your question went to your employer. You can sign later." Sign this document → the sheet ("Sign Confidentiality", the consent line, the name field, the preview); Confirm with nothing → "Type your full name to sign."; Cancel closes it; reopen, type the name → preview shows it → Confirm & sign → pill "Signed · Signed 25 Oct 2026", the bar gone, Your copy: "Your signed copy is available once TS_ Alpha Painting has countersigned." scrollWidth = 390 on the list, the document, the signed state. The audit on the record: Sent · notification/email · "Opened in the crew app" · "Question asked: … · owner notified" · "Signed by TS_ Crew Onboarded (typed) · IP …" (the C5 `_crew_name()` line).
- Countersigned as `admin_a` (`POST …/countersign {name}` → 200; audit grew to 7 rows ending "Signed copy emailed · crew copy emailed …"). A second contract (Code of conduct) issued for the 360 sign flow.
- **360 × 800** — list "1 to sign" with both rows (Code of conduct · Awaiting signature; Confidentiality · Signed). Code of conduct: the same empty-question error, question sent, sign sheet (empty → "Type your full name to sign."; Cancel; sign) → Signed, the not-ready line. Back → list reads "Nothing waiting for your signature". Open Confidentiality → "Download my signed copy" visible → tap → the browser receives `Confidentiality.pdf`, 14,940 bytes, starts `%PDF-`; no download error line. scrollWidth = 360 on list, document, sheet, signed and countersigned states. No console errors in either run (only Expo's "Development-level warnings: ON").
- Cleanup: both contracts deleted (their audit rows are embedded in the contract document, so they went with it), the two templates and their two version rows, the one `employee_documents` `contract_pdf` row; then `tests/seed.py teardown` — 0 TS_ admins / 0 TS_ employees, `employee_contracts` 0, `contract_templates` 3, `contract_template_versions` 8, `employee_documents` 0, `private_files` 101: all equal to the counts before the run. (For the record: `private_files` holds 101 rows whose `owner_admin_id` is no longer an admin — `estimate_media` / `update_picture` dated 14–25 Oct, from earlier rounds' tester runs, not this one; left as found.)

So item 7 is now **agent-tested at both sizes** bar the *ended* state (not exercised; `POST …/end` unchanged from Round 22).

**3. The crew notice.** `backend/content/legal/crew-notice.md` as saved:
```markdown
# Paint Trade HQ — Crew notice

**For crew members · Version 1.0-draft · 25 October 2026**

> What {business_name} and Paint Trade HQ collect about you when you use the crew app, why, and who sees it.

**Who holds your details**

{business_name} is your employer and decides what is collected and why. Paint Trade HQ is the app {business_name} uses. It stores your details for {business_name} and follows its own Privacy Policy.

**What is collected**

Your name, date of birth, phone, email and emergency contact. The licences, checks and documents you upload. When you sign in and out of a job, and where you are at those moments. Your daily reports and photos. Training you complete. Messages you send in the app.

**Why**

To roster you, pay you, keep the records an employer must keep by law, keep the site safe, and check you are on site when you sign in.

**Location**

Recorded only at the moment you sign in or out of a job, with the distance from the site, from your first sign-in for as long as you work for {business_name}. Never in between and never off shift. If your phone's location is off, the sign-in is recorded without it.

**Emails and texts**

{business_name} and Paint Trade HQ may email or text you about work: sign-in details, documents to sign, password codes, job and shift messages. No marketing.

**Who sees it**

{business_name}'s admin users and you. Your licences and signed documents are never shared by link. Paint Trade HQ staff only when fixing a problem {business_name} asks about.

**How long**

For as long as you work for {business_name}, then for as long as the law requires employers to keep records.

**Your rights**

Ask {business_name} for a copy of your details or to correct them. Questions about the app: [Paint Trade HQ's Privacy Policy](/privacy).
```
`routes/legal.py` diff (the whole of it):
```diff
-DOCS = {"terms": ("terms.md", "Terms of Service"), "privacy": ("privacy.md", "Privacy Policy")}
+DOCS = {"terms": ("terms.md", "Terms of Service"), "privacy": ("privacy.md", "Privacy Policy"), "crew-notice": ("crew-notice.md", "Crew notice")}  # Round C5 amendment — the third key
```

**4. PRD date.** Corrected; the line now reads `## Round C5 — Documents (crew app) · October 2026` (`memory/PRD.md:1468`).

**5. Draft n 26** — collection `updates`, `owner: platform`, `audience: admins`, `email: false`, `status: 'draft'`, `published_at: null`, `seen_count: 0`, created `2026-10-25T07:38:42Z`.
Title: **Crew onboarding and documents, rebuilt**. One card (icon `sparkle`, title "Quicker, everywhere", no link/image/clip), body:
> New starters now scan your invite, see your welcome note and video from Settings › Crew app, and join in four short steps: their details, a photo, their licences with expiry dates, and the Terms and Privacy Policy, which they agree to in the app (we record the version and time, the way we do for you). Crew you add yourself finish the same steps at their first sign-in and set their own password, and anyone can change their password from their Profile. Their Profile shows their documents with expiry status, and they can replace one without losing the rest. Documents you send them to sign have the new crew look, and on the phone they can save their signed copy to Files or share it. Their sign-in no longer carries your private notes or pay rates to their phone. And the switches on Settings › Crew app now do what they say: a feature you turn off disappears from their app. Before you join now also says how {business_name} will contact you and what is kept on record, with a short crew notice you can read any time from Me.

**6. Git.** The platform checkpoints the working tree after each turn, so `git status --short` shows only this turn's one edit (`M memory/PRD.md`, the date). Files changed in the round, from `git diff --name-status cab3e38 HEAD` (Round 86 close → now), 35 files:
```
A  backend/content/legal/crew-notice.md
M  backend/models/employee.py
M  backend/rate_limiter.py
M  backend/routes/contracts.py
M  backend/routes/crew_app_settings.py
M  backend/routes/employees.py
M  backend/routes/legal.py
M  backend/tests/seed.py
A  backend/tests/test_c5_crew_documents.py
M  backend/tests/test_employees_round5.py
M  backend/tests/test_r35_part_b_dashboard.py
A  frontend/app/crew-notice.tsx
M  frontend/app/employee/(tabs)/_layout.tsx
M  frontend/app/employee/(tabs)/dashboard.tsx
M  frontend/app/employee/(tabs)/me.tsx
M  frontend/app/employee/_layout.tsx
M  frontend/app/employee/contracts.tsx
M  frontend/app/employee/login.tsx
M  frontend/app/employee/onboarding.tsx
M  frontend/app/employee/profile.tsx
M  frontend/app/employee/project/[id].tsx
D  frontend/components/DocumentUploader.tsx
A  frontend/components/crew/DocSheet.tsx
A  frontend/components/crew/PasswordSheet.tsx
A  frontend/components/crew/PhotoSheet.tsx
A  frontend/components/crew/WelcomeVideo.tsx
M  frontend/components/legal/LegalPage.tsx
A  frontend/hooks/useCrewSettings.ts
M  frontend/store/authStore.ts
A  frontend/utils/crewFiles.ts
M  memory/PARKING_LOT.md          (platform's parked-feedback entry, not mine)
M  memory/PRD.md
A  memory/reports/round-c5-documents-report.md
M  memory/specs/crew/c1-crew-shell.html
A  memory/specs/crew/c5-round-message.md
```
One line in `routes/employees.py` also changed at the very end of the round (`"id": str(emp["_id"])` in the finish route's response — a lint requirement; the id is already a string UUID, so no behaviour change).

Report pasted.

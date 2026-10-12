# Crew app chat — running log

Rules: `crew-app-handover.md` §1. Rounds are C1, C2, …; one round at a time across both chats; nothing goes to Emergent without Josh's "send". This chat never touches `app/admin/*`; the admin chat never touches `app/employee/*`. Branch for this chat's files: `claude/zealous-gauss-wx3xn1`.

## 11 Oct — start, re-check, C1 proposal

- Josh pressed Save to GitHub. Cloned `painttradehq/the-newest-update-of-pthq` at `dae9a2f` (11 Oct, Round 73 §8 answers). The repo is public at the time of the clone; Josh makes it private afterwards — a later session needs GitHub access connected to read it again. Nothing is pushed to it from here.
- Re-check of handover §2–§4 → **`crew-recheck-11oct.md`**. Short version: no crew file changed since Round 64 (only the shared `BrandLogo.tsx`, so the crew login and dashboard already show the purple tile). Corrections: the dashboard also renders a 468-line `SignInOutWidget` (clock slide-in, browser GPS, no project) the pack missed; `react-native-webview` is already installed; the `localStorage` guard in `utils/colors.ts` already exists; the web 401 redirect sends crew to `/admin/login` (confirmed bug); onboarding step 5 shows a hard-coded Sano employment agreement with a typed signature; a stray `mobile/` Emergent scaffold (17 Sept, not the crew app) sits in the repo; jobs already have `assigned_employee_ids` but no crew-side read; the "Powered by OpenAI" pill is still on the landing page; login test ids are `emp-login-*`.
- **C1 prototype** `c1-crew-shell.html` (new phone-frame base, no admin page patched), Playwright `tools/test_c1.js` **52/52** at 390 × 844 and 360 × 800: sign-in (brand restyle, Show/Hide, inline errors incl. the 403 text), Today (clock card signed out / in, unread messages with badge, daily-report row), hub tabs Jobs / Docs / Learn / More linking every existing crew screen, Sign out. Proposal and build notes in **`c1-crew-shell-notes.md`** (frontend-only round: no backend change, no new route; plus the 401 fix and the pill removal in shared files). Four questions for Josh at the end of the notes.
- Nothing sent to Emergent. No app code touched.

## 11 Oct — Josh's review of C1 v1 · prototype v2 · §6.9

- Josh: "this design and layout isn't well thought through — a Profile section under Docs? … the crew should also see the project details and the project estimates if the admin allowed." Right. Went back to the code: no crew-side read of jobs exists; the admin side already flags crew notes (estimate "Visible to the crew"), files ("Crew can see"), colours and photos for the crew; two shapes of `crew_notes` (builder string vs drawer list that can never be crew-visible); the crew photo screen 403s on the estimate. All in `crew-recheck-11oct.md` §5.
- Handover updated on the admin branch (`dd70451`): new **§6.9** (Show / Decide / Never lists, Portfolio question, crew-only read route + isolation test) and the new order **C2 = Jobs, C3 = time clock, C4 = daily report**. Copied into this branch. Josh's answers to the Decide items were announced but did not arrive in this chat; the proposal uses the prototype defaults and asks again.
- **Prototype v2** `c1-crew-shell.html`: tabs **Today · Jobs · Inbox · Learn · Me**; Today = clock card + Today's job card + top three unread + daily report; Jobs = Now / Coming up / Done + a job screen (dates & crew, access note, the work per area incl. "Added work", paints & colours, files, photos, my reports, Directions + Daily report); Inbox = Message your employer + all notifications + Mark all read; Me = profile card, My documents, My equipment, My hours, Team events, Sign out. `tools/test_c1.js` **82/82** at 390 × 844 and 360 × 800.
- Notes split: **`c1-crew-shell-notes.md`** (v2: the shell, four tabs in C1, Jobs tab inserted by C2; frontend-only) and **`c2-jobs-notes.md`** (Show/Decide/Never → data, the two crew routes with an allow-list payload, isolation tests, the optional per-job scope switch, verify list, What's new, four questions).
- Nothing sent to Emergent. No app code touched.

## 11 Oct — Josh's answers on the v2 proposal

- Josh: "1. ok. 2. not sure. 3. name yes, phone (only site manager, if any). no crm notes. no paper. 4. correct. 5. always show to the assigned crew." → tabs stay; C1/C2 split: recommended two rounds back to back; Decide items settled (client name as the job title; a phone only for a site manager when the job has one; CRM notes and the quote's paper wording never); Portfolio = Jobs › Done per person; the quoted work always shows to assigned crew (no per-job switch).
- Prototype: the job page gains a **Site manager** row (name, number, tel: link) when the job has one (Harrow); Nguyen has none. `tools/test_c1.js` extended.
- Ran a read-only workflow over the clone (five lenses: client contacts and any "site manager" role, the estimate scope shape and every money field, isolation-test conventions, reports/photos/files/crew-name fields, an audit of every code claim in `c2-jobs-notes.md`). The readers returned 47 corrections; the refuters died on Josh's usage limit, so a second workflow re-ran two refuters on the twelve material ones. What changed: a job's `name` is never the client's name (job tag → street → "Estimate n"), so the title is the job name with a client · address line; the CRM already has a **Site contact** role (`contacts[].role == "site"`) → that contact's mobile is the only phone shown; crew routes follow `/projects/mine` and `/projects/mine/{id}`, declared above `/projects/{id}`; the scope is `areas[]` + `lines[]` with `prep · primer · N coats` (no "finish" field); v2 jobs start with no `project_materials` rows, so colours are also derived from the quote's lines; crew-filed daily reports carry `project_id: null` today (the crew picker calls an admin route); `crew_visible` is missing from the estimate PATCH allow-list (the builder's switch survives via the PUT autosave); a job's address is the client's address, not the quote's job address. `c2-jobs-notes.md` rewritten (v2); `crew-recheck-11oct.md` §5 corrected; prototype titles, client lines, line labels and the Site contact row updated (`tools/test_c1.js` 86/86).
- Nothing sent to Emergent. No app code touched.

## 11 Oct — C2 answers closed

- Josh: Site contact = site manager **yes**; unaccepted optional lines hidden **yes**; Done includes invoiced **no**. `c2-jobs-notes.md`: Done = `done` only, the list and detail routes exclude `invoiced` (404 on the detail), verify item 1 and test case 9 cover it; §9 closed — nothing open on C2.
- Nothing sent to Emergent. No app code touched.

## 11 Oct — refuters done

- Second workflow: 24 refuter verdicts on the 12 material corrections, 23 uphold. Refinements folded in: a third job-creation path (admin marks a quote accepted) can title a job with the client's full name and writes no `client_name`; the admin job page reads `client_snapshot.address` and only the pin moves after "Edit location"; the proposed nested areas payload is replaced by grouping the existing `flatten_estimate_lines()` rows (name, qty, unit, `sub`, product with colour; money keys dropped; optional-not-chosen rows dropped) — the one refuted item. `c2-jobs-notes.md` and `crew-recheck-11oct.md` updated; prototype unchanged (86/86).
- Nothing sent to Emergent. No app code touched.

## 11 Oct — correction: Done includes invoiced

- Josh: "invoiced jobs leave the crew's lists — this should change to include invoiced ones." `c2-jobs-notes.md`: Done = `done` or `invoiced` again (pill "Done {date}", no mention of invoicing on the crew side), the routes no longer filter `invoiced`, verify item 1 and test case 9 updated. Nothing open on C2.
- Nothing sent to Emergent. No app code touched.

## 11 Oct — Round C1 SENT

- Josh: "ok send to build." Checked the Emergent job first: paused / awaiting input, last message the Round 66 report — no admin round building. Sent **Round C1** (`roundC1-message.md`: seven round rules, then `c1-crew-shell-notes.md` §2–§6 verbatim) to job `b55b8df9-f0c5-41c7-80d1-f174b2874432`; queued (`db5mrkg714nc73fi2lpg`). Emergent is told to wait for Josh's uploads of `c1-crew-shell.html` + `c1-crew-shell-notes.md` ("here") and to build the four-tab shell only — the Jobs tab and job page in the prototype are C2.
- The two open C1 defaults (greeting by first name; My hours → the existing time-clock screen until C3) went as written.
- Next: Josh uploads the two files; Emergent builds and reports "Round C1 done"; then **C2** (`c2-jobs-notes.md`) goes, nothing between. The admin chat sends nothing while C1 builds (§1 rule 2).

## 12 Oct — Round C1 done · follow-up A drafted (device routing)

- Emergent reported **"Round C1 done"** (`memory/reports/roundC1-crew-shell-report.md`): testing agent iteration 132 at 390 × 844 then 360 × 800 on TS_ Alpha; suite 753/114/0 before and after; tsc clean; `app/admin/*` diff 0; TS_ torn down; What's new draft `c08c966d` "A new home screen for your crew" (draft, audience admins). Unverified: the My documents count badge and some rows (no TS_ data). Beyond the spec: a logout loop on a dead token fixed in `utils/api.ts` (the logout call itself 401s and re-entered logout) — shared file, admin chat told. Full report text not yet pasted into the chat (requested in follow-up A).
- Josh, directly to Emergent on 12 Oct: tablets, laptops and computers get the web app; only phones get the crew link; then to this chat: the crew section must open on phones only, "not even iPad or tablet". Emergent paused on four routing questions. Drafted **`roundC1-followup-a.md`**: phone = user agent `iPhone`/`iPod` or `Android`+`Mobile` (never screen width); `/employee/*` on a non-phone → `/admin/login`; `/admin/*` on a phone left alone; signed-in users keep their dashboard; `/` signed out → crew sign-in on a phone, admin sign-in otherwise; one `isPhone()` helper; testing agent must use a phone user agent. Waiting for Josh's "send".

## 12 Oct — Round C1 follow-up A SENT

- Josh: "send". `roundC1-followup-a.md` sent verbatim to the Emergent job (queued `db6a7700v9hs739jtav0`): device rule by user agent, crew routes phones-only, admin reachable on a phone, signed-in users keep their dashboard; testing agent to use a phone UA; full C1 report to be pasted in the reply. Josh's wording "admin section … mobile only" read as "crew section"; he can reverse it in one line.
- Next: Emergent reports "Round C1 follow-up A done" with the pasted C1 report; then C2 (`c2-jobs-notes.md`) goes.

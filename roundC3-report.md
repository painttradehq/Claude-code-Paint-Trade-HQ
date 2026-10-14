# Round C3 done — Emergent's report (14 Oct, as pasted in the job)

Testing agent iteration **137** — iPhone UA, 390 × 844 then 360 × 800, TS_ Alpha only, owner tenant untouched. Isolation run `test_c3_crew_timeclock.py` → **12 passed**. Full suite before 762 / 114 / 0 → after **774 / 114 / 0**. `tsc` clean. TS_ torn down, `project_a` restored. Full report on the job: `memory/reports/roundC3-timeclock-report.md`.

| § 8 | Result |
|---|---|
| 1 Signed-out card (last sign-out line with time · day · hours · job, legal line, no job row, Sign in) | agent-tested |
| 2 "Which job?" sheet: job with pill + "{client} · {address}", General, Cancel; Cancel and scrim close without a sign-in; rows ≥ 44 px | agent-tested |
| 3 Pick a job → signed-in card, "Job: {name}" with chevron to the job page; Mongo record has `project_id`, `project_name`, job address, real lat/lng (never 0,0) | agent-tested |
| 4 Off-site (100 m, 1 km away): amber "1.0 km off site / Further than 100 m from the job…"; owner's Timesheets chip, banner and drawer "Off-site sign-in · 1.0 km from the job"; gone after sign-out | agent-tested |
| 5 No position: sign-in succeeds, grey "No location from this phone…", record `latitude: null`, drawer "No GPS" | agent-tested |
| 6 General: no chevron, not navigable; drawer "General" | agent-tested |
| 7 Sign out; owner's Fix flipped the crew card within the 60 s poll (35 s) | agent-tested |
| 8 My hours: week nav, total = owner's Timesheets row (15-min rounding), day headers, "– now" + "On the clock", off-site pill, "Edited by … · reason", foot line, ‹ past week empty "No hours this week.", › disabled on this week | agent-tested |
| 8b "Closed automatically at …" sub-line, Locked/Approved pills in the browser, `crew_a_new` empty state | **Unverified** in browser (lock/approve backend-tested in case 12; `crew_a_new` can't sign in — not onboarded) |
| 9 No openstreetmap request; expo-location only; plugin in `app.json`; `SignInOutWidget.tsx` deleted | agent-tested |
| 10 Backend test green; suite green before/after; TS_ torn down; owner read-only | agent-tested |
| 11 390/360: no horizontal scroll, card above tab bar, no console errors, `app/admin/*` diff empty | agent-tested |

**Backend changes:** `models/timeclock.py` (lat/lng optional); `routes/timeclock.py` (three `parse_utc` lines, `session.project_id` + `last_total_hours`, new `GET /timeclock/my-hours`); `server.py` (two reminder strings → "Open Today and tap Sign in/out."); `tests/test_c3_crew_timeclock.py`. **Env changes:** none. **Deleted:** `components/SignInOutWidget.tsx`. **Removed routes:** none. What's new **draft** `c160453e-…` "Crew sign in to the job" — not published.

**Spec silences (for you):**
1. Day word on the card uses the C1 formatter: "today" / "yesterday" / "4 October" (the spec's example wrote "Sat 4 Oct").
2. "Getting your location…" only shows while the phone is still answering (full 10 s when permission is denied; instant in a mocked browser).
3. `useCrewJobs` has no failed-flag (file not in rule 1), so an empty list is fetched once more on the Sign in tap — the "failed → fetch once more" rule applied to the empty case too.
4. The signed-out card after Sign out uses the phone's clock as `last_sign_out` until the next status load.
5. General shows "On site" in your drawer (§7 first bullet, confirmed) — one-line admin change if you want it.
6. An off-site record stores the job's address (your §10.3 decision); the drawer shows it beside the distance line.

---
Crew chat's reading (14 Oct): all eleven verify items agent-tested except three parts of item 8 without browser data (the auto-closed sub-line, the Locked / Approved pills — both covered by the backend test — and the empty state for a crew member who cannot sign in). The six silences are all reasonable; **keep as built** on the next message. One thing to ask Emergent in the C3 §8 answers: the trajectory's `git status` showed `backend/.env.example` and `frontend/yarn.lock` modified in the working tree — were those C3's (the round allowed no env change and no new package) or left by earlier work? For the admin chat: silence 5 (General → "On site" in the Person drawer) is the admin-side one-liner from `c3-timeclock-notes.md` §7.

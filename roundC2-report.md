# Round C2 report (as pasted by Emergent in the job chat, 12 Oct 2026) — full file on the job: `memory/reports/roundC2-jobs-report.md`

**Round C2 done** — report at `memory/reports/roundC2-jobs-report.md`; spec saved as `memory/specs/crew/c2-jobs-notes.md`. (Follow-up B was reported above and finished first.)

**Verify (§7)** — testing agent iteration **135**, iPhone UA, 390 × 844 then 360 × 800, TS_ Alpha tenant:
1. Jobs segments — agent-tested (four assigned jobs placed right, invoiced one under Done as "Done Mon 7 Sep", no "invoiced", unassigned job nowhere).
2. Job page — agent-tested, except: the builder-drawer flip of "Visible to the crew" (checked by Mongo flip + backend test, drawer itself **Unverified**), the Paints & colours merge with real colour rows (**route-level only**; the TS_ quote has no products), and adding a photo (**Unverified**; Round 14 component unchanged).
3. Added work — agent-tested (approved shows, draft doesn't; declined **Unverified** in browser, covered by the `status == "approved"` rule).
4. Today's job card — agent-tested (In progress, On hold, "and 1 more on the go", Coming-up fallback, "No jobs assigned to you yet.").
5. `test_c2_crew_jobs.py` **9 passed**; suite 751 · 116 · 0 → **760 · 116 · 0**; TS_ torn down; `project_a` crew restored; owner read-only — agent-tested.
6. No horizontal scroll, no console errors, `tsc` clean, `app/admin/*` diff empty — agent-tested.

**Isolation run:** 9/9 — list/detail key sets, other-business `[]`/404, same-business unassigned 404, admins 403, JSON walk (no money/private key, `phone` only at `site_contact.phone`, no `$`), site contact by `site` role, `access_notes` follow `crew_visible`, approved variation in / draft out, invoiced job still readable with no money key. One test fix after the first full-suite run (case 8 now picks the created variation by id, not title).

**Backend changes:** the two routes + helpers in `routes/projects.py` (`get_current_employee` import), `tests/test_c2_crew_jobs.py`. **Env:** none. **Deleted files:** none. **Removed routes:** none. **Redirects added:** none.
**What's new:** Draft `cb156cb6-32de-43e1-9f23-9ce379067f3d` "Your crew can see their jobs" — never published.

**§8 spec silences** (full list in the report): (1) `ProjectPhotos` draws its own "Photos · N" header, admin-flavoured sub-copy and `photo-add` control, so the section label repeats and there is no `crew-job-photo-add` id — shared component untouched; (2) Done job with no start date shows just the completed date; (3) added-work body joins area · description · timeframe; (4) qty formatting "12 m2", "3.5 L"; (5) empty lines for Paints and The work invented; (6) back "Jobs" returns to Today when opened from Today; (7) the Today card fetches the detail once for crew names and the note; (8) site contact without a phone has no Call pill; (9) file rows show "PDF · 1 KB"; (10) crew reports still carry `project_id: null` until C4; (11) dates normalised to `YYYY-MM-DD`; (12) test 8 approves via the public respond route.

## Follow-up B (from the job's PRD note, 12 Oct)
- `app/_layout.tsx` — on web any `/employee/*` path on a non-phone renders nothing and `window.location.replace('/admin/login')` (router.replace has no mounted Stack at that point). Testing agent iteration 134. Appended to the Round C1 report.
